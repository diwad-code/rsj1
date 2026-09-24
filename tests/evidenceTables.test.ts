import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { JumpSimulation, SIM_DT } from '../src/simulation/jump'
import { DEFAULT_JUMP_PARAMS } from '../src/simulation/params'
import { buildHill } from '../src/simulation/technicalHill'
import { EMPTY_INPUT, makeInput, runJump } from './support/jumpHarness'

/**
 * Historyczny test zachowania PKG-002. Wektory są nadal odtwarzane w pamięci,
 * ale zamknięty artefakt pakietu jest tylko odczytywany i nie może być nadpisany.
 */

const OUTPUT = resolve(process.cwd(), 'docs/evidence/PKG-002/simulation-tables.md')
const hill = buildHill()

function row(cells: Array<string | number>): string {
  return `| ${cells.join(' | ')} |`
}

function fixed(value: number | null | undefined, digits = 1): string {
  return value === null || value === undefined ? '—' : value.toFixed(digits)
}

describe('PKG-002 — tabele dowodowe symulacji', () => {
  it('zapisuje serie timingu, belek, śladów lotu i lądowań', () => {
    const lines: string[] = []
    lines.push('# PKG-002 — tabele symulacji')
    lines.push('')
    lines.push('Plik generowany przez `tests/evidenceTables.test.ts` podczas `npm test`.')
    lines.push('Wszystkie wartości pochodzą z tego samego przebiegu, który sprawdzają asercje testu.')
    lines.push('')
    lines.push(
      `Skocznia: **${hill.spec.name}** \`${hill.spec.id}\` v${hill.spec.hillVersion} — ` +
        `K${hill.spec.kPointMeters} / HS${hill.spec.hillSizeMeters}, P${hill.spec.pPointMeters}, ` +
        `U${hill.spec.uPointMeters}, fall line ${hill.spec.fallLineMeters} m. ADAPT, obiekt fikcyjny.`,
    )
    lines.push('')
    lines.push(`Fizyka: \`${DEFAULT_JUMP_PARAMS.physicsVersion}\`, dt = 1/120 s, semi-implicit Euler. Wszystkie parametry TUNE.`)
    lines.push('')

    // --- Geometria i mapa metrażu -------------------------------------------
    lines.push('## 1. Profil i mapa metrażu')
    lines.push('')
    lines.push(row(['Punkt', 'metry', 'x [m]', 'y [m]', 'nachylenie [°]', 'odczyt zwrotny z mapy [m]']))
    lines.push(row(['---', '---:', '---:', '---:', '---:', '---:']))
    for (const [name, meters] of [
      ['T', 0],
      ['P', hill.spec.pPointMeters],
      ['K', hill.spec.kPointMeters],
      ['HS', hill.spec.hillSizeMeters],
      ['U', hill.spec.uPointMeters],
      ['fall line', hill.spec.fallLineMeters],
    ] as const) {
      const point = hill.surfacePositionAt(meters)
      const back = hill.surfaceDistanceAtPoint(point)
      expect(back).toBeCloseTo(meters, 2)
      lines.push(row([
        name,
        meters,
        fixed(point.x, 2),
        fixed(point.y, 2),
        fixed((hill.surfaceSlopeRadAt(meters) * 180) / Math.PI, 2),
        fixed(back, 3),
      ]))
    }
    lines.push('')

    // --- Belki ---------------------------------------------------------------
    lines.push('## 2. Wpływ belki na rozpędzanie')
    lines.push('')
    lines.push(row(['Belka', 'rozbieg [m]', 'v na progu [m/s]', 'v [km/h]', 'długość przy idealnym skoku [m]']))
    lines.push(row(['---:', '---:', '---:', '---:', '---:']))
    const gateSeries = [1, 4, 8, 12].map((gate) => {
      const probe = new JumpSimulation({ gateNumber: gate, autoStart: true })
      while (probe.phase === 'Inrun' || probe.phase === 'Takeoff') probe.step(EMPTY_INPUT)
      const full = runJump({ gate, pilot: 'ideal', style: 'telemark' })
      return {
        gate,
        inrun: probe.gateInrunLengthMeters,
        speed: probe.inrunSpeed,
        distance: full.measuredDistanceMeters ?? 0,
      }
    })
    for (const entry of gateSeries) {
      lines.push(row([
        entry.gate,
        fixed(entry.inrun, 2),
        fixed(entry.speed, 2),
        fixed(entry.speed * 3.6, 1),
        fixed(entry.distance, 1),
      ]))
    }
    const lowest = gateSeries[0]
    const highest = gateSeries[gateSeries.length - 1]
    expect(lowest && highest).toBeTruthy()
    if (lowest && highest) {
      expect(highest.speed).toBeGreaterThan(lowest.speed)
      expect(highest.distance).toBeGreaterThan(lowest.distance + 5)
    }
    lines.push('')

    // --- Timing wybicia ------------------------------------------------------
    lines.push('## 3. Długość względem przesunięcia timingu wybicia (belka 8, idealna korekta)')
    lines.push('')
    lines.push(row(['Przesunięcie [s]', 'popęd [%]', 'v wyprostu [m/s]', 'pitch na progu [°]', 'długość [m]', 'wynik']))
    lines.push(row(['---:', '---:', '---:', '---:', '---:', '---']))
    const timingSeries = [-28, -24, -20, -16, -12, -8, -4, 0, 4, 8, 12, 16, 20, 24, 28].map((offsetTicks) => {
      const sim = runJump({ gate: 8, offsetTicks, pilot: 'ideal', style: 'telemark' })
      return {
        offsetSeconds: offsetTicks * SIM_DT,
        deliveredPercent: (sim.deliveredImpulseNewtonSeconds / DEFAULT_JUMP_PARAMS.takeoff.impulseNewtonSeconds) * 100,
        extension: sim.takeoffNormalSpeed,
        pitchDeg: ((sim.takeoffPitchRad ?? 0) * 180) / Math.PI,
        distance: sim.measuredDistanceMeters ?? 0,
        status: sim.outcome?.status ?? 'brak',
      }
    })
    const passive = runJump({ gate: 8, noTakeoff: true, pilot: 'ideal', style: 'telemark' })
    for (const entry of timingSeries) {
      lines.push(row([
        `${entry.offsetSeconds >= 0 ? '+' : ''}${entry.offsetSeconds.toFixed(3)}`,
        fixed(entry.deliveredPercent, 0),
        fixed(entry.extension, 2),
        fixed(entry.pitchDeg, 1),
        fixed(entry.distance, 1),
        entry.status,
      ]))
    }
    lines.push(row([
      'brak ↑ (lot pasywny)',
      '0',
      fixed(passive.takeoffNormalSpeed, 2),
      fixed(((passive.takeoffPitchRad ?? 0) * 180) / Math.PI, 1),
      fixed(passive.measuredDistanceMeters, 1),
      passive.outcome?.status ?? 'brak',
    ]))
    const best = timingSeries.reduce((left, right) => (right.distance > left.distance ? right : left))
    expect(Math.abs(best.offsetSeconds)).toBeLessThanOrEqual(4 * SIM_DT)
    lines.push('')

    // --- Ślady lotu ----------------------------------------------------------
    lines.push('## 4. Ślady lotu (belka 8, idealny timing)')
    lines.push('')
    lines.push(row(['Korekta', 'długość [m]', 'czas lotu [s]', 'v kontaktu [km/h]', 'v⊥ kontaktu [m/s]', 'błąd kąta [°]', 'stabilność', 'wynik']))
    lines.push(row(['---', '---:', '---:', '---:', '---:', '---:', '---:', '---']))
    const traces = [
      ['idealna', runJump({ gate: 8, pilot: 'ideal', style: 'telemark' })],
      ['brak korekty', runJump({ gate: 8, pilot: 'none', style: 'telemark' })],
      ['nadmierna (→ trzymane)', runJump({ gate: 8, pilot: 'over', style: 'telemark' })],
      ['cofanie (← trzymane)', runJump({ gate: 8, pilot: 'back', style: 'telemark' })],
    ] as const
    for (const [label, sim] of traces) {
      lines.push(row([
        label,
        fixed(sim.measuredDistanceMeters, 1),
        fixed(sim.flightSeconds, 2),
        fixed((sim.contact?.speed ?? 0) * 3.6, 0),
        fixed(sim.contact?.normalSpeed, 2),
        fixed(sim.contact?.angleErrorDeg, 1),
        fixed(sim.contact?.stability, 2),
        `${sim.outcome?.status} / ${sim.outcome?.terminalPhase}`,
      ]))
    }
    const idealTrace = traces[0][1]
    for (const [, sim] of traces.slice(1)) {
      expect(idealTrace.measuredDistanceMeters ?? 0).toBeGreaterThan((sim.measuredDistanceMeters ?? 0) + 5)
    }
    lines.push('')

    // --- Lądowania -----------------------------------------------------------
    lines.push('## 5. Lądowania i stany terminalne')
    lines.push('')
    lines.push(row(['Próba', 'przygotowanie', 'długość [m]', 'v⊥ [m/s]', 'gotowość', 'stabilność', 'stan terminalny']))
    lines.push(row(['---', '---', '---:', '---:', '---:', '---:', '---']))
    const landings = [
      ['długa, belka 12', runJump({ gate: 12, pilot: 'ideal', style: 'telemark' })],
      ['długa, belka 12', runJump({ gate: 12, pilot: 'ideal', style: 'parallel' })],
      ['krótka, belka 1, późne ↑', runJump({ gate: 1, offsetTicks: 20, pilot: 'ideal', style: 'telemark' })],
      ['krótka, belka 1, późne ↑', runJump({ gate: 1, offsetTicks: 20, pilot: 'ideal', style: 'parallel' })],
      ['bez przygotowania', runJump({ gate: 8, pilot: 'ideal', style: null })],
      ['spóźnione przygotowanie', runJump({ gate: 8, pilot: 'ideal', style: 'telemark', prepHeightMeters: 1.2 })],
      ['krótka próba bez przygotowania', runJump({ gate: 1, offsetTicks: 26, pilot: 'none', style: null })],
    ] as const
    for (const [label, sim] of landings) {
      lines.push(row([
        label,
        sim.landingStyle === 'none' ? 'brak' : sim.landingStyle === 'telemark' ? 'telemark' : 'dwie nogi',
        fixed(sim.measuredDistanceMeters, 1),
        fixed(sim.contact?.normalSpeed, 2),
        fixed(sim.contact?.readiness, 2),
        fixed(sim.contact?.stability, 2),
        `${sim.outcome?.terminalPhase} (${sim.outcome?.reachedFallLine ? 'fall line' : `stop ${fixed(sim.outcome?.settledDistanceMeters, 1)} m`})`,
      ]))
      expect(sim.finished).toBe(true)
    }
    lines.push('')

    // --- Pełny skok krok po kroku -------------------------------------------
    lines.push('## 6. Dziennik jednego pełnego skoku (belka 8, idealny timing, telemark)')
    lines.push('')
    lines.push(row(['Tick', 'czas [s]', 'zdarzenie', 'szczegóły']))
    lines.push(row(['---:', '---:', '---', '---']))
    const showcase = runJump({ gate: 8, pilot: 'ideal', style: 'telemark' })
    for (const event of showcase.events) {
      lines.push(row([event.tick, (event.tick * SIM_DT).toFixed(3), event.type, event.detail]))
    }
    expect(showcase.outcome?.status).toBe('landed')
    expect(showcase.events.filter((event) => event.type === 'measured')).toHaveLength(1)
    lines.push('')

    expect(lines.length).toBeGreaterThan(20)
    const historical = readFileSync(OUTPUT, 'utf8')
    expect(historical).toContain('# PKG-002 — tabele symulacji')
    expect(historical).toContain('`pkg002-tune-1`')
  })

  it('potwierdza neutralność lewo+prawo w zapisanej konfiguracji', () => {
    const neutral = new JumpSimulation({ gateNumber: 8, autoStart: true })
    const idle = new JumpSimulation({ gateNumber: 8, autoStart: true })
    while (!neutral.finished) {
      neutral.step(makeInput([], neutral.phase === 'Flight' ? ['left', 'right'] : []))
      idle.step(EMPTY_INPUT)
    }
    expect(neutral.measuredDistanceMeters).toBe(idle.measuredDistanceMeters)
  })
})
