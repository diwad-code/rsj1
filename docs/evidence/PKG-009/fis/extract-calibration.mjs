/**
 * PKG-009 / H01 — ekstrakcja odległości, belek, wiatru i upadków z czterech
 * oficjalnych PDF FIS dla Lysgårdsbakken K90/HS98.
 *
 * Uruchomienie: node docs/evidence/PKG-009/fis/extract-calibration.mjs
 */
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFParse } from 'pdf-parse'

const ROOT = dirname(fileURLToPath(import.meta.url))
const EVENTS = [
  {
    id: '2022-women-wc',
    date: '2022-12-03',
    label: 'Women WC 2022',
    file: 'lillehammer-2022-12-03-women-wc.pdf',
    expectedRows: 40,
    expectedFalls: 0,
  },
  {
    id: '2023-women-wc',
    date: '2023-12-02',
    label: 'Women WC 2023',
    file: 'lillehammer-2023-12-02-women-wc.pdf',
    expectedRows: 69,
    expectedFalls: 0,
  },
  {
    id: '2023-men-wc',
    date: '2023-12-02',
    label: 'Men WC 2023',
    file: 'lillehammer-2023-12-02-men-wc.pdf',
    expectedRows: 80,
    expectedFalls: 0,
  },
  {
    id: '2026-women-jwc',
    date: '2026-03-04',
    label: 'Women JWC 2026',
    file: 'lillehammer-2026-03-04-women-jwc.pdf',
    expectedRows: 80,
    expectedFalls: 1,
  },
]

function numberToken(token) {
  const cleaned = token.replace(/^[=*]/, '').replace(/\.$/, '')
  return /^-?\d+(?:\.\d+)?$/.test(cleaned) ? Number(cleaned) : null
}

function gateToken(token) {
  const matches = token.match(/\d{1,2}/g)
  if (!matches?.length) return null
  return Number(matches.at(-1))
}

function parseNumericRow(line) {
  const tokens = line.trim().split(/\s+/)
  for (let speedIndex = 0; speedIndex + 9 < tokens.length; speedIndex += 1) {
    const speed = numberToken(tokens[speedIndex])
    const distanceToken = tokens[speedIndex + 1] ?? ''
    const distance = numberToken(distanceToken)
    const distancePoints = numberToken(tokens[speedIndex + 2] ?? '')
    if (speed === null || speed < 75 || speed > 100 || distance === null || distance < 20 || distance > 120) continue
    if (distancePoints === null || distancePoints < -80 || distancePoints > 120) continue

    const marks = tokens.slice(speedIndex + 3, speedIndex + 8).map(numberToken)
    const stylePoints = numberToken(tokens[speedIndex + 8] ?? '')
    if (marks.some((mark) => mark === null || mark < 0 || mark > 20)) continue
    if (stylePoints === null || stylePoints < 0 || stylePoints > 60) continue

    const tail = tokens.slice(speedIndex + 9)
    let gate = null
    let wind = null
    let roundTotal = null
    let rank = null

    const first = numberToken(tail[0] ?? '')
    if (first !== null && first > 60) {
      // PDF 2023 WC: round total, rank, gate, [gate points], wind, wind points.
      roundTotal = first
      rank = numberToken(tail[1] ?? '')
      gate = gateToken(tail[2] ?? '')
      const remaining = tail.slice(3).map(numberToken).filter((value) => value !== null)
      if (remaining.length >= 3) wind = remaining.at(-2)
      else if (remaining.length === 2) wind = remaining[0]
    } else {
      // PDF 2022/2026: gate, [gate points], wind, wind points, round total, rank.
      gate = gateToken(tail[0] ?? '')
      const remaining = tail.slice(1).map(numberToken).filter((value) => value !== null)
      if (remaining.length >= 4) {
        wind = remaining.at(-4)
        roundTotal = remaining.at(-2)
        rank = remaining.at(-1)
      } else if (remaining.length >= 3) {
        wind = remaining.at(-3)
        roundTotal = remaining.at(-1)
      } else if (remaining.length === 2) {
        // Jednoseryjny PDF 2022 umieszcza sumę rundy przed prędkością.
        wind = remaining[0]
      }
    }

    if (gate === null || gate < 1 || gate > 30 || wind === null || wind < -5 || wind > 5) continue
    return {
      speed,
      distance,
      distancePoints,
      marks,
      stylePoints,
      gate,
      wind,
      roundTotal,
      rank,
      fall: distanceToken.includes('*'),
    }
  }
  return null
}

function quantile(sorted, fraction) {
  const position = (sorted.length - 1) * fraction
  const low = Math.floor(position)
  const high = Math.ceil(position)
  return sorted[low] + (sorted[high] - sorted[low]) * (position - low)
}

function summary(rows) {
  const values = rows.map((row) => row.distance).sort((a, b) => a - b)
  const winds = rows.map((row) => row.wind)
  return {
    n: values.length,
    min: values[0],
    median: quantile(values, 0.5),
    q75: quantile(values, 0.75),
    q90: quantile(values, 0.9),
    q95: quantile(values, 0.95),
    max: values.at(-1),
    mean: values.reduce((sum, value) => sum + value, 0) / values.length,
    falls: rows.filter((row) => row.fall).length,
    windMin: Math.min(...winds),
    windMax: Math.max(...winds),
    windMean: winds.reduce((sum, value) => sum + value, 0) / winds.length,
    gates: [...new Set(rows.map((row) => row.gate))].sort((a, b) => a - b),
  }
}

function distanceBand(distance) {
  if (distance < 80) return '<80.0'
  if (distance < 90) return '80.0-89.5'
  if (distance < 98) return '90.0-97.5'
  if (distance <= 103) return '98.0-103.0'
  return '>103.0'
}

const rows = []
for (const event of EVENTS) {
  const parser = new PDFParse({ data: await readFile(join(ROOT, event.file)) })
  const document = await parser.getText()
  const eventRows = []
  for (const page of document.pages) {
    for (const line of page.text.split('\n')) {
      const parsed = parseNumericRow(line)
      if (parsed) eventRows.push(parsed)
    }
  }
  await parser.destroy()

  if (eventRows.length !== event.expectedRows) {
    throw new Error(`${event.file}: wydobyto ${eventRows.length}, oczekiwano ${event.expectedRows} wierszy`)
  }
  const pairedRows = eventRows.length > 40 ? 60 : 0
  eventRows.forEach((row, index) => rows.push({
    ...row,
    eventId: event.id,
    eventDate: event.date,
    eventLabel: event.label,
    round: pairedRows > 0 && index < pairedRows ? (index % 2 === 0 ? 'first' : 'final') : 'first',
  }))
  const falls = eventRows.filter((row) => row.fall).length
  if (falls !== event.expectedFalls) {
    throw new Error(`${event.file}: wydobyto ${falls} upadków, oczekiwano ${event.expectedFalls}`)
  }
}

const byEvent = Object.fromEntries(EVENTS.map((event) => {
  const selected = rows.filter((row) => row.eventId === event.id)
  return [event.id, {
    ...summary(selected),
    rounds: {
      first: summary(selected.filter((row) => row.round === 'first')),
      ...(selected.some((row) => row.round === 'final') ? { final: summary(selected.filter((row) => row.round === 'final')) } : {}),
    },
  }]
}))

const bands = Object.fromEntries(['<80.0', '80.0-89.5', '90.0-97.5', '98.0-103.0', '>103.0'].map((band) => {
  const selected = rows.filter((row) => distanceBand(row.distance) === band)
  return [band, { n: selected.length, falls: selected.filter((row) => row.fall).length }]
}))

const result = {
  generatedAt: new Date().toISOString(),
  object: 'Lysgårdsbakken normal hill K90/HS98',
  events: EVENTS,
  overall: summary(rows),
  byEvent,
  distanceBands: bands,
  landingStyle: 'UNRESOLVED — dokumenty FIS podają noty sędziów i gwiazdkę upadku, ale nie typ telemark/parallel.',
}

await writeFile(join(ROOT, '..', 'calibration.json'), JSON.stringify(result, null, 2) + '\n')
const header = ['eventId', 'eventDate', 'round', 'distance', 'fall', 'gate', 'wind', 'speed', 'stylePoints']
const csv = [header.join(','), ...rows.map((row) => [
  row.eventId,
  row.eventDate,
  row.round,
  row.distance.toFixed(1),
  row.fall ? '1' : '0',
  row.gate,
  row.wind.toFixed(2),
  row.speed.toFixed(1),
  row.stylePoints.toFixed(1),
].join(','))].join('\n') + '\n'
await writeFile(join(ROOT, '..', 'calibration.csv'), csv)
console.log(JSON.stringify(result, null, 2))
