import { describe, expect, it } from 'vitest'
import { createTrainingJumpResult } from '../src/sport/jumpResult'
import { DEFAULT_JUMP_PARAMS } from '../src/simulation/params'
import { JumpSimulation, SIM_DT } from '../src/simulation/jump'
import {
  WeightedWindMeasurement,
  createSeriesWindField,
  createWindField,
  physicsVelocityToUserWind,
  seriesWindBaseMps,
  seriesWindReversed,
  userWindToPhysicsVelocity,
  windSeedForAttempt,
} from '../src/simulation/wind'
import { forecastWindMean } from '../src/sport/safety'
import { buildHill } from '../src/simulation/technicalHill'
import { EMPTY_INPUT, makeInput, runJump, runScriptAtRenderHz, type ScriptedKey } from './support/jumpHarness'

describe('P10 — deterministyczne pole i znak wiatru', () => {
  it('ten sam seed daje identyczny gładki przebieg, a próby mają osobne seedy', () => {
    const first = createWindField(0x1234)
    const second = createWindField(0x1234)
    const samples = Array.from({ length: 80 }, (_, index) => first.sampleUserMetersPerSecond(index / 10, index * 2.5))
    expect(samples).toEqual(Array.from({ length: 80 }, (_, index) => second.sampleUserMetersPerSecond(index / 10, index * 2.5)))
    for (let index = 1; index < samples.length; index += 1) {
      expect(Math.abs((samples[index] ?? 0) - (samples[index - 1] ?? 0))).toBeLessThan(0.35)
    }
    expect(windSeedForAttempt(123, 1)).not.toBe(windSeedForAttempt(123, 2))
  })

  it('mapuje wiatr pod narty na strumień wiejący w górę zeskoku', () => {
    // P42 runda 6: „pod narty" to nie wiatr poziomy, tylko strumień wzdłuż
    // zeskoku — ma składową przeciwną do lotu ORAZ składową pionową w górę.
    const head = userWindToPhysicsVelocity(1.5)
    expect(head.x).toBeLessThan(0)
    expect(head.y).toBeGreaterThan(0)
    expect(Math.hypot(head.x, head.y)).toBeCloseTo(1.5, 9)

    const tail = userWindToPhysicsVelocity(-0.8)
    expect(tail.x).toBeGreaterThan(0)
    expect(tail.y).toBeLessThan(0)
    expect(Math.hypot(tail.x, tail.y)).toBeCloseTo(0.8, 9)

    // Adapter odwrotny musi wracać do tej samej wartości użytkowej.
    expect(physicsVelocityToUserWind(head)).toBeCloseTo(1.5, 9)
    expect(physicsVelocityToUserWind(tail)).toBeCloseTo(-0.8, 9)
  })

  it('agreguje ważone czujniki w czasie zamiast kopiować ostatnią wartość HUD', () => {
    const hill = buildHill()
    const field = createWindField(42)
    const aggregate = new WeightedWindMeasurement(hill.spec.windMeasurement.sensors)
    for (const time of [1, 1.5, 2, 2.5]) aggregate.observe(field, time)
    const result = aggregate.result()
    expect(result?.sampleCount).toBe(4)
    expect(result?.meanUserMetersPerSecond).not.toBeCloseTo(field.sampleUserMetersPerSecond(2.5, 100), 6)
  })
})

describe('P10 / Q-SIM-01,05,07 — wiatr należy do czasu symulacji', () => {
  it('bez kroku symulacji pauza nie przesuwa czasu ani próbki wiatru', () => {
    const sim = new JumpSimulation({ autoStart: true, windField: createWindField(7) })
    while (sim.phase !== 'Flight') sim.step(EMPTY_INPUT)
    sim.step(EMPTY_INPUT)
    const before = { tick: sim.tick, value: sim.currentWindUserMetersPerSecond }
    // Pauza istnieje w kontrolerze sesji: brak wywołania step oznacza brak czasu symulacji.
    const after = { tick: sim.tick, value: sim.currentWindUserMetersPerSecond }
    expect(after).toEqual(before)
  })

  it('daje identyczną fizykę, wiatr i wynik niezależnie od wizualnego śniegu', () => {
    const runWithSnowPreference = (snowEnabled: boolean) => {
      const sim = runJump({ gate: 8, pilot: 'ideal', style: 'telemark', windField: createWindField(99) })
      return {
        presentationOnly: snowEnabled,
        distance: sim.measuredDistanceMeters,
        outcome: sim.outcome,
        wind: sim.windMeasurement,
        score: createTrainingJumpResult(sim, 1),
        events: sim.events,
      }
    }
    const snowOn = runWithSnowPreference(true)
    const snowOff = runWithSnowPreference(false)
    expect({ ...snowOn, presentationOnly: undefined }).toEqual({ ...snowOff, presentationOnly: undefined })
  })

  it('zachowuje ten sam wiatr i wynik przy 30/60/120/144 Hz', () => {
    const edgeTick = 756
    const idealPressTick = edgeTick - Math.round(DEFAULT_JUMP_PARAMS.takeoff.idealLeadSeconds / SIM_DT)
    const trace: readonly ScriptedKey[] = [
      { atMs: 5, action: 'right', edge: 'pressed' },
      { atMs: 25, action: 'right', edge: 'released' },
      { atMs: idealPressTick * SIM_DT * 1000, action: 'takeoff', edge: 'pressed' },
      { atMs: idealPressTick * SIM_DT * 1000 + 40, action: 'takeoff', edge: 'released' },
      { atMs: (edgeTick + 16) * SIM_DT * 1000, action: 'right', edge: 'pressed' },
      { atMs: (edgeTick + 156) * SIM_DT * 1000, action: 'right', edge: 'released' },
      { atMs: (edgeTick + 430) * SIM_DT * 1000, action: 'telemark', edge: 'pressed' },
    ]
    const runs = [30, 60, 120, 144].map((hz) => runScriptAtRenderHz(
      hz,
      trace,
      { gateNumber: 8, windField: createWindField(0xbeef) },
    ).sim)
    const reference = runs[0]
    expect(reference?.finished).toBe(true)
    for (const sim of runs) {
      expect(sim.measuredDistanceMeters).toBe(reference?.measuredDistanceMeters)
      expect(sim.windMeasurement).toEqual(reference?.windMeasurement)
      expect(sim.outcome).toEqual(reference?.outcome)
    }
  })

  it('aktualizuje dynamiczny wiatr w locie i zapisuje okno pomiarowe', () => {
    const sim = new JumpSimulation({ autoStart: true, windField: createWindField(42) })
    while (sim.phase !== 'Flight') sim.step(EMPTY_INPUT)
    const first = sim.currentWindUserMetersPerSecond
    for (let index = 0; index < 120; index += 1) sim.step(makeInput([], ['right']))
    expect(sim.currentWindUserMetersPerSecond).not.toBe(first)
    while (!sim.finished) sim.step(EMPTY_INPUT)
    expect(sim.windMeasurement?.sampleCount ?? 0).toBeGreaterThan(100)
    expect(sim.compensationWind).toBe(sim.windMeasurement?.meanUserMetersPerSecond)
  })
})

describe('P42 runda 11 — spójny wiatr serii konkursowej', () => {
  it('ten sam plan serii daje identyczne pole, a baza jest wspólna dla serii', () => {
    const input = { competitionSeed: 0x5005, roundId: 'qualification' as const, attemptIndex: 7 }
    const first = createSeriesWindField(input)
    const second = createSeriesWindField(input)
    expect(first.seed).toBe(second.seed)
    expect(first.version).toBe('pkg008-wind-4')
    expect(
      Array.from({ length: 24 }, (_, index) => first.sampleUserMetersPerSecond(index / 4, 95)),
    ).toEqual(
      Array.from({ length: 24 }, (_, index) => second.sampleUserMetersPerSecond(index / 4, 95)),
    )
    expect(seriesWindBaseMps(0x5005, 'qualification')).toBeGreaterThanOrEqual(-1.2)
    expect(seriesWindBaseMps(0x5005, 'qualification')).toBeLessThanOrEqual(1.2)
  })

  it('zmienia prognozę między sąsiednimi próbami łagodnie, bez huśtawki co skok', () => {
    const hill = buildHill()
    const means = Array.from({ length: 30 }, (_, attemptIndex) => forecastWindMean(
      createSeriesWindField({ competitionSeed: 0x5005, roundId: 'qualification', attemptIndex }),
      hill,
    ))
    let maximumAdjacentChange = 0
    for (let index = 1; index < means.length; index += 1) {
      maximumAdjacentChange = Math.max(maximumAdjacentChange, Math.abs((means[index] ?? 0) - (means[index - 1] ?? 0)))
    }
    expect(maximumAdjacentChange).toBeLessThan(0.6)
    expect(Math.max(...means) - Math.min(...means)).toBeLessThan(2.5)
  })

  it('odwraca bazę finału deterministycznie tylko dla części seedów', () => {
    const reversed = Array.from({ length: 200 }, (_, index) => index + 1).filter(seriesWindReversed)
    expect(reversed.length).toBeGreaterThan(0)
    expect(reversed.length).toBeLessThan(200)
    const reversedSeed = reversed[0] ?? 1
    expect(seriesWindBaseMps(reversedSeed, 'final')).toBe(-seriesWindBaseMps(reversedSeed, 'first'))
    const normalSeed = Array.from({ length: 200 }, (_, index) => index + 1).find((seed) => !seriesWindReversed(seed)) ?? 1
    expect(seriesWindBaseMps(normalSeed, 'final')).not.toBe(-seriesWindBaseMps(normalSeed, 'first'))
  })
})
