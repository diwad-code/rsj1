/**
 * PKG-008 rundy 11 i 15 — ekstrakcja not sędziowskich z oficjalnych PDF FIS
 * (Wisła K120/HS134, trzy konkursy indywidualne). Skrypt jednorazowy
 * kalibracyjny; nie jest częścią gry ani testów.
 *
 * Wiersz danych (2 na zawodnika, po jednym na serię):
 *   SPEED DISTANCE DIST_POINTS A B C D E STYLE_POINTS ROUND_TOTAL RANK. GATE WIND WIND_POINTS
 * np. "89.9 132.0 81.6 18.5 18.5 18.5 18.5 18.5 55.5 138.2 1. 15 -0.07 1.1"
 */
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { PDFParse } from 'pdf-parse'

const FILES = [
  { file: 'wisla-2024-01-14-codex3108.pdf', label: '14.01.2024 CODEX3108' },
  { file: 'wisla-2024-12-07-codex3077.pdf', label: '07.12.2024 CODEX3077' },
  { file: 'wisla-2024-12-08-codex3079.pdf', label: '08.12.2024 CODEX3079' },
]

// Część wspólna: SPEED DISTANCE DIST_POINTS A B C D E STYLE_POINTS ROUND_TOTAL RANK.
// Ogon różni się między konkursami: „GATE WIND WINDPTS” albo „GATE GATEPTS WIND WINDPTS”.
const ROW = /^(\d{2}\.\d)\s+(\d{2,3}\.\d)\s+(\d{2,3}\.\d)\s+((?:\d{1,2}\.\d\s){5})(\d{2}\.\d)\s+(\d{2,3}\.\d)\s+(\d{1,2}\.)\s+([^\n]+)$/

function parseTail(tail) {
  const parts = tail.trim().split(/\s+/)
  if (parts.length === 3) return { gate: Number(parts[0]), gatePoints: null, wind: Number(parts[1]), windPoints: Number(parts[2]) }
  if (parts.length === 4) return { gate: Number(parts[0]), gatePoints: Number(parts[1]), wind: Number(parts[2]), windPoints: Number(parts[3]) }
  return null
}

const rows = []
const unmatchedSample = []

for (const entry of FILES) {
  const buffer = await readFile(resolve('docs/evidence/PKG-008/fis', entry.file))
  const pdf = new PDFParse({ data: buffer })
  const result = await pdf.getText()
  for (const page of result.pages) {
    for (const line of page.text.split('\n')) {
      const match = ROW.exec(line.trim())
      if (!match) {
        if (/\d\d\.\d\s+\d{2,3}\.\d\s/.test(line) && unmatchedSample.length < 12) {
          unmatchedSample.push(`${entry.label}: ${line.trim()}`)
        }
        continue
      }
      const marks = match[4].trim().split(/\s+/).map(Number)
      const tail = parseTail(match[8])
      if (!tail) {
        if (unmatchedSample.length < 12) unmatchedSample.push(`${entry.label}: ${line.trim()}`)
        continue
      }
      const style = marks.slice().sort((a, b) => a - b)
      const middle = style[1] + style[2] + style[3]
      const fallLike = Math.abs(middle - Number(match[5])) > 0.01
      rows.push({
        file: entry.label,
        speed: Number(match[1]),
        distance: Number(match[2]),
        marks,
        styleReported: Number(match[5]),
        roundTotal: Number(match[6]),
        gate: tail.gate,
        gatePoints: tail.gatePoints,
        wind: tail.wind,
        windPoints: tail.windPoints,
        fallLike,
      })
    }
  }
  await pdf.destroy()
}

const landed = rows.filter((row) => !row.fallLike)
const allMarks = rows.flatMap((row) => row.marks)
const landedMarks = landed.flatMap((row) => row.marks)

function quantile(sorted, q) {
  const position = (sorted.length - 1) * q
  const low = Math.floor(position)
  const high = Math.ceil(position)
  return sorted[low] + (sorted[high] - sorted[low]) * (position - low)
}

function stats(marks, label) {
  const sorted = [...marks].sort((a, b) => a - b)
  const count = (predicate) => marks.filter(predicate).length
  console.log(`\n[${label}] N not = ${marks.length}`)
  console.log(`  min ${sorted[0]}  q25 ${quantile(sorted, 0.25).toFixed(2)}  mediana ${quantile(sorted, 0.5).toFixed(2)}  q75 ${quantile(sorted, 0.75).toFixed(2)}  q90 ${quantile(sorted, 0.9).toFixed(2)}  q95 ${quantile(sorted, 0.95).toFixed(2)}  max ${sorted[sorted.length - 1]}`)
  console.log(`  >=19,5: ${count((v) => v >= 19.5)} (${((count((v) => v >= 19.5) / marks.length) * 100).toFixed(1)}%)   =20,0: ${count((v) => v === 20)} (${((count((v) => v === 20) / marks.length) * 100).toFixed(1)}%)   <=15,0: ${count((v) => v <= 15)} (${((count((v) => v <= 15) / marks.length) * 100).toFixed(1)}%)`)
  const histogram = new Map()
  for (const mark of marks) histogram.set(mark, (histogram.get(mark) ?? 0) + 1)
  const shown = [...histogram.entries()].filter((entry) => entry[0] >= 14).sort((a, b) => b[0] - a[0])
  console.log(`  histogram >=14,0: ${shown.map((entry) => `${entry[0].toFixed(1)}:${entry[1]}`).join('  ')}`)
}

function summary(values) {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  return {
    n: values.length,
    min: sorted[0],
    median: quantile(sorted, 0.5),
    q75: quantile(sorted, 0.75),
    q90: quantile(sorted, 0.9),
    max: sorted[sorted.length - 1],
  }
}

function formatSummary(result) {
  if (!result) return 'BRAK DANYCH'
  return `N=${result.n} min=${result.min.toFixed(1)} med=${result.median.toFixed(2)} q75=${result.q75.toFixed(2)} q90=${result.q90.toFixed(2)} max=${result.max.toFixed(1)}`
}

function pearson(pairs) {
  if (pairs.length < 2) return null
  const meanX = pairs.reduce((sum, pair) => sum + pair[0], 0) / pairs.length
  const meanY = pairs.reduce((sum, pair) => sum + pair[1], 0) / pairs.length
  let covariance = 0
  let varianceX = 0
  let varianceY = 0
  for (const [x, y] of pairs) {
    const dx = x - meanX
    const dy = y - meanY
    covariance += dx * dy
    varianceX += dx * dx
    varianceY += dy * dy
  }
  const denominator = Math.sqrt(varianceX * varianceY)
  return denominator === 0 ? null : covariance / denominator
}

console.log(`Wiersze z kompletem not: ${rows.length}; w tym "upadkowe" (suma stylu niezgodna z middle-3): ${rows.length - landed.length}`)
if (unmatchedSample.length > 0) {
  console.log('\nPrzykładowe NIEDOPASOWANE wiersze (do weryfikacji ręcznej):')
  for (const line of unmatchedSample) console.log('  ' + line)
}
stats(allMarks, 'WSZYSTKIE noty (z upadkami)')
stats(landedMarks, 'NOTY ze skoków lądowanych')

const perJumpMedian = landed.map((row) => {
  const sorted = [...row.marks].sort((a, b) => a - b)
  return sorted[2]
})
stats(perJumpMedian, 'MEDIANA 5 not per lądowany skok')

const styleSums = landed.map((row) => {
  const sorted = [...row.marks].sort((a, b) => a - b)
  return sorted[1] + sorted[2] + sorted[3]
})
stats(styleSums.map((value) => value / 3), 'ŚREDNIA retained-3 per lądowany skok (style/3)')

console.log(`\nOdległości lądowane: N=${landed.length}, min ${Math.min(...landed.map((r) => r.distance))}, max ${Math.max(...landed.map((r) => r.distance))}`)
console.log(`Belki widoczne w wierszach: ${[...new Set(rows.map((r) => r.gate))].sort((a, b) => a - b).join(', ')}`)
console.log(`Wiatr wierszy: min ${Math.min(...rows.map((r) => r.wind))} max ${Math.max(...rows.map((r) => r.wind))}`)

// Noty z upadkami — próbka do wglądu (jak sędziowie oceniają upadki):
const falls = rows.filter((row) => row.fallLike)
console.log(`\nUpadkowe wiersze: ${falls.length}; próbka not:`)
for (const row of falls.slice(0, 10)) console.log(`  ${row.file}: ${row.distance} m  noty ${row.marks.join('/')}  styl ${row.styleReported}`)

// Runda 15: rozkład not względem odległości. Pasma są rozłączne; dokładne
// HS+5 (139,0 m) należy jeszcze do pasma HS–HS+5, a dopiero >139,0 m do
// ostatniego pasma. PDF nie podaje stylu lądowania ani liczby podpórek.
const K = 120
const HS = 134
const bands = [
  { label: '<K (<120,0)', includes: (distance) => distance < K },
  { label: 'K–K+5 (120,0–124,5)', includes: (distance) => distance >= K && distance < K + 5 },
  { label: 'K+5–K+10 (125,0–129,5)', includes: (distance) => distance >= K + 5 && distance < K + 10 },
  { label: 'K+10–HS (130,0–133,5)', includes: (distance) => distance >= K + 10 && distance < HS },
  { label: 'HS–HS+5 (134,0–139,0)', includes: (distance) => distance >= HS && distance <= HS + 5 },
  { label: '>HS+5 (>139,0)', includes: (distance) => distance > HS + 5 },
]

console.log('\n[R15: NOTY W PASMACH ODLEGŁOŚCI — 232 skoki]')
for (const band of bands) {
  const selected = landed.filter((row) => band.includes(row.distance))
  const individual = selected.flatMap((row) => row.marks)
  const retainedSums = selected.map((row) => {
    const ordered = [...row.marks].sort((a, b) => a - b)
    return ordered[1] + ordered[2] + ordered[3]
  })
  const retainedAverages = retainedSums.map((value) => value / 3)
  console.log(`\n${band.label}: N skoków=${selected.length}`)
  console.log(`  pojedyncze: ${formatSummary(summary(individual))}`)
  console.log(`  retained-3 suma: ${formatSummary(summary(retainedSums))}`)
  console.log(`  retained-3 średnia: ${formatSummary(summary(retainedAverages))}`)
}

const individualPairs = landed.flatMap((row) => row.marks.map((mark) => [row.distance, mark]))
const retainedPairs = landed.map((row) => [row.distance, row.styleReported / 3])
console.log('\n[R15: KORELACJA PEARSONA — opisowa, nie przyczynowa]')
console.log(`  dystans ↔ pojedyncza nota: r=${pearson(individualPairs)?.toFixed(4) ?? 'BRAK'}`)
console.log(`  dystans ↔ średnia retained-3: r=${pearson(retainedPairs)?.toFixed(4) ?? 'BRAK'}`)
console.log('  Ograniczenie: PDF nie zawiera jawnej etykiety telemark/parallel ani podpórek.')
