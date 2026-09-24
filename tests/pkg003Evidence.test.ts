import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createTrainingJumpResult } from '../src/sport/jumpResult'
import {
  MODERN_RULES,
  distancePointsTenths,
  meterValueTenthsForK,
  stylePointsTenths,
  truncateDistanceToHalfMeters,
} from '../src/sport/scoring'
import { DEFAULT_JUMP_PARAMS } from '../src/simulation/params'
import { createWindField } from '../src/simulation/wind'
import { SIM_DT } from '../src/simulation/jump'
import { runJump } from './support/jumpHarness'

const OUTPUT = resolve(process.cwd(), 'docs/evidence/PKG-003/simulation-tables.md')

function row(cells: Array<string | number>): string {
  return `| ${cells.join(' | ')} |`
}

function points(tenths: number): string {
  return (tenths / 10).toFixed(1)
}

describe('PKG-003 — liczbowe dowody punktacji i wiatru', () => {
  it('odtwarza wektory w pamięci bez nadpisywania historycznego dowodu', () => {
    const lines: string[] = [
      '# PKG-003 — tabele punktacji i wiatru',
      '',
      'Plik generowany przez `tests/pkg003Evidence.test.ts` podczas `npm test`.',
      `Reguły: \`${MODERN_RULES.version}\`; fizyka bazowa: \`${DEFAULT_JUMP_PARAMS.physicsVersion}\`.`,
      '',
      '## 1. Q-FIS-01 — wszystkie granice tabeli pkt/m',
      '',
      row(['Zakres K', 'pkt/m']),
      row(['---', '---:']),
    ]

    for (const band of MODERN_RULES.meterBands) {
      const label = band.maxK === null ? `K≥${band.minK}` : `K${band.minK}–${band.maxK}`
      expect(meterValueTenthsForK(band.minK)).toBe(band.meterValueTenths)
      if (band.maxK !== null) expect(meterValueTenthsForK(band.maxK)).toBe(band.meterValueTenths)
      lines.push(row([label, points(band.meterValueTenths)]))
    }
    for (const unsupported of [165, 170, 179]) expect(() => meterValueTenthsForK(unsupported)).toThrow()
    lines.push(row(['K165–179', 'ODRZUCONE']))

    lines.push('', '## 2. Q-FIS-02/03/07 — wektory kontrolne', '')
    lines.push(row(['Przypadek', 'Wynik']))
    lines.push(row(['---', '---:']))
    const vectors = [
      ['K120 / 130,0 m', `${points(distancePointsTenths(120, 260))} pkt`],
      ['K90 / 95,0 m', `${points(distancePointsTenths(90, 190))} pkt`],
      ['K200 / 210,0 m', `${points(distancePointsTenths(200, 420))} pkt`],
      ['noty 18,0;18,5;19,0;18,5;18,0', `${points(stylePointsTenths([180, 185, 190, 185, 180]).pointsTenths)} pkt`],
      ['kontakt 132,49 m', `${(truncateDistanceToHalfMeters(132.49) / 2).toFixed(1)} m`],
      ['kontakt 132,50 m', `${(truncateDistanceToHalfMeters(132.5) / 2).toFixed(1)} m`],
    ] as const
    expect(vectors[0]?.[1]).toBe('78.0 pkt')
    expect(vectors[2]?.[1]).toBe('132.0 pkt')
    for (const vector of vectors) lines.push(row([...vector]))

    lines.push('', '## 3. Q-SIM-03 — timing wybicia i wpływ na noty', '')
    lines.push(row(['Przesunięcie wejścia [s]', 'długość [m]', 'noty', 'styl [pkt]', 'suma [pkt]', 'komentarz']))
    lines.push(row(['---:', '---:', '---', '---:', '---:', '---']))
    for (let offsetTicks = -28; offsetTicks <= 28; offsetTicks += 4) {
      const sim = runJump({ gate: 8, offsetTicks, pilot: 'ideal', style: 'telemark' })
      const result = createTrainingJumpResult(sim, 1)
      lines.push(row([
        `${offsetTicks >= 0 ? '+' : ''}${(offsetTicks * SIM_DT).toFixed(3)}`,
        (result.distanceHalfMeters / 2).toFixed(1),
        result.marksTenths.map((mark) => points(mark)).join(';'),
        points(result.componentTenths.style),
        points(result.totalTenths),
        result.feedbackCode,
      ]))
    }

    lines.push('', '## 4. P10 — próbki pola wiatru', '')
    lines.push('Znak użytkowy: dodatni = pod narty; adapter fizyki zapisuje wtedy ujemne `windVelocityX`.')
    lines.push('')
    lines.push(row(['Seed', 'czas [s]', 'metraż [m]', 'wiatr użytkowy [m/s]']))
    lines.push(row(['---:', '---:', '---:', '---:']))
    for (const seed of [42, 2026]) {
      const field = createWindField(seed)
      for (const [time, meters] of [[0, 45], [2, 95], [4, 130]] as const) {
        lines.push(row([seed, time.toFixed(1), meters, field.sampleUserMetersPerSecond(time, meters).toFixed(3)]))
      }
    }

    const windy = runJump({ gate: 8, pilot: 'ideal', style: 'telemark', windField: createWindField(42) })
    expect(windy.windMeasurement?.sampleCount ?? 0).toBeGreaterThan(100)
    lines.push(
      '',
      `Pełna próba seed 42: średnia ważona ${windy.windMeasurement?.meanUserMetersPerSecond.toFixed(3)} m/s ` +
        `z ${windy.windMeasurement?.sampleCount} próbek; HUD końcowy ${windy.currentWindUserMetersPerSecond.toFixed(3)} m/s.`,
      '',
      'Składniki wiatru i belki nie są dodawane do wyniku PKG-003.',
    )

    expect(lines.join('\n')).toContain(`Reguły: \`${MODERN_RULES.version}\``)
    const historical = readFileSync(OUTPUT, 'utf8')
    expect(historical).toContain('Reguły: `pkg003-rules-1`')
    expect(historical).not.toContain('pkg004-rules-1')
  })
})
