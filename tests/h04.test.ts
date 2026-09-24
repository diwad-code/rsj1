/** P21-H04: headless playable mammoth calibration, without visual acceptance. */
import { IDBFactory } from 'fake-indexeddb'
import { describe, expect, it } from 'vitest'
import { buildHill, TECHNICAL_K120, validateHill } from '../src/simulation/technicalHill'
import { PLANICA_FLYING } from '../src/simulation/hills/planicaFlying'
import { OBERSTDORF_LARGE } from '../src/simulation/hills/oberstdorfLarge'
import { LILLEHAMMER_NORMAL } from '../src/simulation/hills/lillehammerNormal'
import { ZAKOPANE_LARGE } from '../src/simulation/hills/zakopaneLarge'
import { JumpSimulation, SIM_DT } from '../src/simulation/jump'
import { COEFFICIENT_CURVE } from '../src/simulation/aero'
import { DEFAULT_JUMP_PARAMS } from '../src/simulation/params'
import { createWindField, windSeedForAttempt, type WindField } from '../src/simulation/wind'
import { estimateSkilledDistanceMeters, forecastWindMean, hsStabilityMultiplier, selectSafeJuryGate } from '../src/sport/safety'
import { createCompetitionJumpResult, createTrainingJumpResult } from '../src/sport/jumpResult'
import { aiSeedForJump, createAiPlan, simulateAiJump } from '../src/sport/ai'
import { CompetitionSession, H04_COMPETITION_SESSION_ID, h04CompetitionAiPlan } from '../src/app/competitionSession'
import { assertReplayMatchesHill, assertSessionMatchesHill, buildHillById, hillCompetitionSessionId, PLAYABLE_HILL_SPECS } from '../src/app/hills'
import { JumpRecorder } from '../src/replay/recorder'
import { ReplayPlayer, replayVisualsCompatible } from '../src/replay/player'
import { commitAttempt, loadLatestReplay, loadOfficialRecord, loadSession, openGameDatabase } from '../src/storage/db'
import { recordKey, STORE, validateStoredReplay, validateStoredSession } from '../src/storage/schema'
import { EMPTY_INPUT, makeInput } from './support/jumpHarness'

const hill = buildHill(PLANICA_FLYING)
const edges = new Map<number, number>()
function edgeTick(gate: number): number {
  const cached = edges.get(gate)
  if (cached !== undefined) return cached
  const sim = new JumpSimulation({ hill, gateNumber: gate, autoStart: true })
  while (sim.phase === 'Inrun' || sim.phase === 'Takeoff') sim.step(EMPTY_INPUT)
  edges.set(gate, sim.tick)
  return sim.tick
}

type Trial = { gate: number; wind: number; offset?: number; prep?: number; style?: 'parallel' | 'telemark' | null; aoa?: number; windField?: WindField }
function run(
  trial: Trial,
  onCreate?: (sim: JumpSimulation) => void,
  onStep?: (sim: JumpSimulation, input: ReturnType<typeof makeInput>) => void,
): JumpSimulation {
  // Constant seeded wind: no hidden dice in the human contact/landing result.
  const windField = { seed: 42, version: 'h04-constant-wind-v1', sampleUserMetersPerSecond: () => trial.wind } as WindField
  const sim = new JumpSimulation({ hill, gateNumber: trial.gate, windField: trial.windField ?? windField, autoStart: true })
  onCreate?.(sim)
  const takeoffTick = edgeTick(trial.gate) - Math.round(DEFAULT_JUMP_PARAMS.takeoff.idealLeadSeconds / SIM_DT) + (trial.offset ?? 0)
  let prepped = false
  for (let guard = 0; guard < 20_000 && !sim.finished; guard += 1) {
    const pressed: ('takeoff' | 'telemark' | 'parallel')[] = []
    const held: ('left' | 'right')[] = []
    if (sim.tick === takeoffTick) pressed.push('takeoff')
    if (sim.phase === 'Flight') {
      const desired = Math.atan2(sim.velocity.y, sim.velocity.x) * 180 / Math.PI + (trial.aoa ?? 32)
      const current = sim.targetPitchRad * 180 / Math.PI
      if (current > desired + 0.5) held.push('right')
      else if (current < desired - 0.5) held.push('left')
      if (!prepped && trial.style !== null && sim.flightSeconds >= (trial.prep ?? 5)) {
        pressed.push(trial.style ?? 'parallel')
        prepped = true
      }
    }
    const input = makeInput(pressed, held, sim.tick)
    sim.step(input)
    onStep?.(sim, input)
  }
  return sim
}

function longFlightTrials(gate: number, wind: number, windField?: WindField): JumpSimulation[] {
  return [24, 26, 28, 30, 32, 34, 36].flatMap(aoa => [-4, 0, 4, 8].flatMap(offset =>
    [7, 9, null].map(prep => run({ gate, wind, windField, aoa, offset,
      prep: prep ?? undefined, style: prep === null ? null : 'parallel' }))))
}


describe('H04 — geometry, sport lines and AUTO (Q-FIS-18/23)', () => {
  it('Letalnica K200/HS240, independent ADAPT curves and single distance map', () => {
    expect(validateHill(hill)).toEqual([])
    expect(PLANICA_FLYING).toMatchObject({ id: 'h04-planica-flying', hillVersion: 'h04-inspired-4', classification: 'flying', kPointMeters: 200, hillSizeMeters: 240 })
    expect(PLANICA_FLYING.name).toContain('INSPIROWANA')
    expect(PLANICA_FLYING.landingKeyframes).not.toEqual(OBERSTDORF_LARGE.landingKeyframes)
    expect(hill.gates).toHaveLength(46)
    expect(hill.gate(1).inrunLengthMeters).toBe(122.3)
    expect(hill.gate(11).inrunLengthMeters).toBe(143)
    expect(hill.gate(46).inrunLengthMeters).toBe(174.5)
    for (let gate = 1; gate <= 10; gate += 1) {
      const length = hill.gate(gate).inrunLengthMeters
      expect(length).toBeGreaterThan(0)
      expect(length).toBeLessThan(hill.gate(gate + 1).inrunLengthMeters)
      expect(185 - length).toBeLessThan(117) // wszystkie nowe belki na prostej 34°
    }
    for (let gate = 11; gate <= 46; gate += 1) {
      expect(hill.gate(gate).inrunLengthMeters).toBeCloseTo(143 + (gate - 11) * 0.9, 8)
    }
    expect(() => hill.gate(47)).toThrow()
    expect(hill.spec.windMeasurement.sensors).toEqual([
      { distanceMeters: 70, weight: 0.25 }, { distanceMeters: 155, weight: 0.4 }, { distanceMeters: 228, weight: 0.35 },
    ])
    for (const [marker, meters] of [['pPoint', 174], ['kPoint', 200], ['hillSize', 240], ['uPoint', 310], ['fallLine', 350]] as const) {
      expect(hill.markers[marker]).toEqual(hill.surfacePositionAt(meters))
    }
    for (const meters of [0, 5, 70, 174, 200, 240, 255.5, 310, 350, 405]) {
      expect(hill.surfaceDistanceAtPoint(hill.surfacePositionAt(meters))).toBeCloseTo(meters, 1)
    }
    expect(hill.inrunCurve.lastPoint.x).toBeCloseTo(0, 8)
    expect(hill.inrunCurve.lastPoint.y).toBeCloseTo(0, 8)
    expect(hill.landingCurve.lastPoint).toEqual(hill.outrunCurve.firstPoint)
    expect(hill.spec.compensation).toMatchObject({
      provenance: 'simulation-calibrated', headWindFactorTenthsPerMps: 144,
      tailWindFactorTenthsPerMps: 216, gateFactorTenthsPerInrunMeter: 86,
      coachThresholdHalfMeters: 456,
    })
    expect(hill.spec.compensation.sourceRefs.some(ref => ref.includes('2026JP3181RLT.pdf'))).toBe(true)
    expect(hill.spec.compensation.referenceGateNumber).toBe(27)
    expect(hill.spec.safety.referenceGateNumber).toBe(27)
    expect(estimateSkilledDistanceMeters(hill, 27, 0)).toBe(238.9)
    expect(hill.spec.landingKeyframes.at(-1)?.distanceMeters).toBe(310)
    expect(hill.spec.landingKeyframes.map(keyframe => keyframe.distanceMeters)).toEqual([
      0, 14, 29, 44, 60, 76, 93, 174, 200, 240, 256, 271, 286, 299, 310,
    ])
    expect(hill.spec.outrunKeyframes.map(keyframe => keyframe.distanceMeters)).toEqual([310, 340, 370, 410])
    expect(hill.spec.outrunKeyframes.at(-1)?.distanceMeters).toBe(410)
    expect(hill.spec.safety).toMatchObject({ telemarkImpossibleMeters: 265, parallelImpossibleMeters: 276 })
    // h04-polar-1: tylko H04; ≤26° i ≥40° jak wspólna krzywa, pik nośności nie wyżej.
    expect(hill.spec.aero?.version).toBe('h04-polar-1')
    const curve = hill.spec.aero?.curve ?? []
    expect(curve.filter(p => p.angleOfAttackDeg <= 26 || p.angleOfAttackDeg >= 40))
      .toEqual(COEFFICIENT_CURVE.filter(p => p.angleOfAttackDeg <= 26 || p.angleOfAttackDeg >= 40))
    expect(Math.max(...curve.map(p => p.lift))).toBeLessThanOrEqual(Math.max(...COEFFICIENT_CURVE.map(p => p.lift)))
    expect(new JumpSimulation({ hill, gateNumber: 6 }).params.physicsVersion).toBe(`${DEFAULT_JUMP_PARAMS.physicsVersion}+h04-polar-1`)
    for (const other of PLAYABLE_HILL_SPECS.filter(spec => spec.id !== hill.spec.id)) {
      expect(other.aero).toBeUndefined()
      expect(new JumpSimulation({ hill: buildHill(other) }).params).toBe(DEFAULT_JUMP_PARAMS)
    }
    expect(new CompetitionSession(hill, 1, 'normal').toStoredSession(1).versions.physics).toBe('pkg008-tune-9+h04-polar-1')
  })

  it('jury steps down with headwind and up with tailwind, without saturating on tailwind', () => {
    const probes = [-3.2, -2, -1, 0, 1, 2, 3.2].map(wind => {
      const gate = selectSafeJuryGate(hill, wind).gateNumber
      const sim = run({ gate, wind })
      expect(sim.finished).toBe(true)
      expect(sim.measuredDistanceMeters ?? 0).toBeGreaterThan(135)
      expect(sim.measuredDistanceMeters ?? 999).toBeLessThan(240)
      return [gate, sim.measuredDistanceMeters] as const
    })
    expect(probes.map(([gate]) => gate)).toEqual([18, 10, 7, 8, 5, 2, 1])
  })
})

describe('H04 — raw-contact AUTO calibration (not landing or impossible-line limits)', () => {
  it('keeps an ordinary parallel landing playable at the lowest gates under +3.2 m/s', () => {
    expect(selectSafeJuryGate(hill, 2.31).gateNumber).toBe(2)
    expect(selectSafeJuryGate(hill, 3.2).gateNumber).toBe(1)
    const readings = [1, 2].map(gate => {
      const jump = run({ gate, wind: 3.2, aoa: 28, prep: 5 })
      expect(jump.outcome?.status).toBe('landed')
      expect(jump.contact?.supportHands).toBe(0)
      expect(jump.measuredDistanceMeters ?? 999).toBeLessThanOrEqual(260)
      expect(createTrainingJumpResult(jump, 1).distanceHalfMeters).toBeGreaterThanOrEqual(360)
      return jump.measuredDistanceMeters?.toFixed(2)
    })
    expect(readings).toEqual(['198.91', '203.32'])
  })
  it('samples both raw-contact ceilings across the wind interval and immediately around AUTO switches', () => {
    // Empirical finite sweep, not a proof of the mathematical global maximum.
    const samples = [...Array.from({ length: 33 }, (_, i) => (i - 16) / 5), -0.01, 0.01, -0.0001, 0.0001]
    // Find every integer-gate transition in the domain, including the intentional sign jump.
    let previousGate = selectSafeJuryGate(hill, -3.2).gateNumber
    const switches: number[] = []
    for (let step = -3199; step <= 3200; step += 1) {
      const wind = step / 1000
      const gate = selectSafeJuryGate(hill, wind).gateNumber
      if (gate !== previousGate) {
        switches.push(wind)
        previousGate = gate
      }
    }
    for (const boundary of switches) {
      for (const delta of [-0.002, 0, 0.002]) {
        const wind = boundary + delta
        if (wind > -3.2 && wind < 3.2) samples.push(wind)
      }
    }
    const breaches: Array<{ wind: number; gate: number; raw: number }> = []
    let worstTail = 0
    let worstHead = 0
    let worstTailGate = 0
    let worstHeadGate = 0
    let worstTailWind = 0
    let worstHeadWind = 0
    // Szybka siatka między progami; pełne 84 profile sprawdzamy na
    // najbardziej ryzykownej stronie każdej zmiany belki i przy znaku 0.
    const fullWinds = new Set([0, -0.0001, 0.0001, ...switches.flatMap(wind => [wind - 0.001, wind])])
    for (const wind of [...new Set(samples), ...fullWinds]) {
      if (wind < -3.2 || wind > 3.2) continue
      const field = { seed: 42, version: 'h04-constant-wind-v1', sampleUserMetersPerSecond: () => wind } as WindField
      const gate = selectSafeJuryGate(hill, forecastWindMean(field, hill)).gateNumber
      const trials = fullWinds.has(wind) ? longFlightTrials(gate, wind, field)
        : [26, 30, 34].flatMap(aoa => [0, 4].flatMap(offset => [9, null].map(prep =>
          run({ gate, wind, windField: field, aoa, offset, prep: prep ?? undefined, style: prep === null ? null : 'parallel' }))))
      const raw = Math.max(...trials.map(sim => sim.measuredDistanceMeters ?? 0))
      if (wind < 0 && raw > worstTail) { worstTail = raw; worstTailGate = gate; worstTailWind = wind }
      if (wind >= 0 && raw > worstHead) { worstHead = raw; worstHeadGate = gate; worstHeadWind = wind }
      if (raw > (wind < 0 ? 240 : 260)) breaches.push({ wind, gate, raw })
    }
    expect(switches.length).toBeGreaterThan(10)
    expect(breaches).toEqual([])
    expect({ worstTail: worstTail.toFixed(2), worstTailGate, worstTailWind,
      worstHead: worstHead.toFixed(2), worstHeadGate, worstHeadWind, switches: switches.length })
      .toEqual({ worstTail: '234.74', worstTailGate: 18, worstTailWind: -3.12,
        worstHead: '251.35', worstHeadGate: 1, worstHeadWind: 3.2, switches: 22 })
  }, 30_000)
  it('uses the actual forecast and bounds raw long-flight contact for seven constant winds', () => {
    const readings = []
    for (const [wind, gateNumber, minimum] of [
      [-3.2, 18, 225], [-2, 10, 225], [-1, 7, 225], [0, 8, 240],
      [1, 5, 240], [2, 2, 240], [3.2, 1, 240],
    ] as const) {
      const field = { seed: 42, version: 'h04-constant-wind-v1', sampleUserMetersPerSecond: () => wind } as WindField
      expect(forecastWindMean(field, hill)).toBeCloseTo(wind, 10)
      const gate = selectSafeJuryGate(hill, forecastWindMean(field, hill)).gateNumber
      expect(gate).toBe(gateNumber)
      const nominal = run({ gate, wind, windField: field })
      expect(nominal.outcome?.status).toBe('landed')
      expect(nominal.measuredDistanceMeters ?? 0).toBeGreaterThan(wind >= 3 ? 135 : wind >= 2 ? 175 : 180)
      const trials = longFlightTrials(gate, wind, field)
      expect(trials.every(sim => sim.finished && (sim.outcome?.status === 'landed' || sim.outcome?.status === 'fall'))).toBe(true)
      for (const sim of trials) {
        const raw = sim.measuredDistanceMeters ?? 0
        expect(createTrainingJumpResult(sim, 1).distanceHalfMeters / 2).toBe(Math.floor(raw * 2) / 2)
      }
      const maximum = Math.max(...trials.map(sim => sim.measuredDistanceMeters ?? 0))
      readings.push({ wind, gate, nominal: nominal.measuredDistanceMeters?.toFixed(2), raw: maximum.toFixed(2) })
      expect(maximum, `wind ${wind}, gate ${gate}`).toBeLessThanOrEqual(wind < 0 ? 240 : 260)
      expect(maximum).toBeGreaterThan(minimum)
    }
    expect(readings).toEqual([
      { wind: -3.2, gate: 18, nominal: '205.90', raw: '233.35' },
      { wind: -2, gate: 10, nominal: '198.37', raw: '228.55' },
      { wind: -1, gate: 7, nominal: '193.01', raw: '225.44' },
      { wind: 0, gate: 8, nominal: '202.78', raw: '248.93' },
      { wind: 1, gate: 5, nominal: '190.91', raw: '248.20' },
      { wind: 2, gate: 2, nominal: '176.03', raw: '245.74' },
      { wind: 3.2, gate: 1, nominal: '156.34', raw: '251.35' },
    ])
  })
  it('uses the same forecast and raw-contact bounds for seeded strong gusts in both directions', () => {
    const readings = []
    for (const [seed, expectedGate, minimum] of [[1, 2, 230], [7, 12, 225]] as const) {
      const field = createWindField(seed)
      const forecast = forecastWindMean(field, hill)
      expect(Math.abs(forecast)).toBeGreaterThan(2.1)
      const gate = selectSafeJuryGate(hill, forecast).gateNumber
      expect(gate).toBe(expectedGate)
      const nominal = run({ gate, wind: 0, windField: field })
      expect(nominal.outcome?.status).toBe('landed')
      expect(nominal.measuredDistanceMeters ?? 0).toBeGreaterThan(forecast < 0 ? 200 : 170)
      const attempts = longFlightTrials(gate, 0, field)
      const longest = attempts.reduce((best, sim) => (sim.measuredDistanceMeters ?? 0) > (best.measuredDistanceMeters ?? 0) ? sim : best)
      readings.push({ seed, forecast: forecast.toFixed(2), gate, nominal: nominal.measuredDistanceMeters?.toFixed(2), raw: longest.measuredDistanceMeters?.toFixed(2) })
      expect(longest.measuredDistanceMeters ?? 0).toBeGreaterThan(minimum)
      expect(longest.measuredDistanceMeters ?? 0).toBeLessThanOrEqual(forecast < 0 ? 240 : 260)
      expect(createTrainingJumpResult(longest, 1).distanceHalfMeters / 2).toBe(Math.floor((longest.measuredDistanceMeters ?? 0) * 2) / 2)
      expect(run({ gate, wind: 0, windField: createWindField(seed), aoa: 30, style: null }).measuredDistanceMeters)
        .toBe(run({ gate, wind: 0, windField: field, aoa: 30, style: null }).measuredDistanceMeters)
    }
    expect(readings).toEqual([
      { seed: 1, forecast: '2.18', gate: 2, nominal: '175.12', raw: '240.39' },
      { seed: 7, forecast: '-2.35', gate: 12, nominal: '202.22', raw: '232.76' },
    ])
  })
  it('uses the same forecast/AUTO as training for seeded gusts without hiding raw fall distance', () => {
    for (const attempt of [1, 2, 3]) {
      const field = createWindField(windSeedForAttempt(0x5a17c0de, attempt))
      const forecast = forecastWindMean(field, hill)
      const gate = selectSafeJuryGate(hill, forecast).gateNumber
      const nominal = run({ gate, wind: 0, windField: field, aoa: 32, prep: 5 })
      const long = run({ gate, wind: 0, windField: field, aoa: 30, style: null })
      expect(long.finished).toBe(true)
      expect(long.outcome?.status).toBe('fall')
      const maximum = Math.max(...longFlightTrials(gate, 0, field).map(sim => sim.measuredDistanceMeters ?? 0))
      expect(maximum).toBeLessThanOrEqual(forecast < 0 ? 240 : 260)
      expect(createTrainingJumpResult(long, 1).distanceHalfMeters / 2).toBe(Math.floor((long.measuredDistanceMeters ?? 0) * 2) / 2)
      if (attempt < 3) {
        expect(nominal.outcome?.status).toBe('landed')
        expect(nominal.measuredDistanceMeters ?? 0).toBeGreaterThan(180)
      } else {
        // To konkretne pole ma podmuch, który zatrzymuje nominalny lot;
        // AUTO nie ukrywa surowego upadku ani nie podnosi belki ponad sufit.
        expect(gate).toBe(2)
        expect(nominal.outcome?.status).toBe('fall')
      }
    }
  })
})

describe('H04 — deterministic flight and beyond-HS landing (Q-FIS-19–24)', () => {
  it('early/ideal/late takeoff; both landings; premature preparation and T; hard fall boundary', () => {
    const early = run({ gate: 26, wind: 0, offset: -6 })
    const good = run({ gate: 26, wind: 0 })
    const late = run({ gate: 26, wind: 0, offset: 6 })
    expect(early.takeoffTimingOffsetSeconds).toBeGreaterThan(0)
    expect(good.perfectTakeoff).toBe(true)
    expect(late.takeoffTimingOffsetSeconds).toBeLessThan(0)
    expect(good.takeoffNormalSpeed).toBeGreaterThan(early.takeoffNormalSpeed)
    expect(good.takeoffNormalSpeed).toBeGreaterThan(late.takeoffNormalSpeed)
    for (const style of ['telemark', 'parallel'] as const) {
      const sim = run({ gate: 26, wind: 0, style })
      expect(sim.landingStyle).toBe(style)
      expect(sim.outcome?.status).toBe('landed')
    }
    const premature = run({ gate: 26, wind: 0, prep: 0, style: 'telemark' })
    expect(premature.landingApproachEarly).toBe(true)
    expect(premature.earlyTelemarkFallback).toBe(true)
    expect(premature.landingStyle).toBe('parallel')
    expect((good.measuredDistanceMeters ?? 0) - (premature.measuredDistanceMeters ?? 0)).toBeGreaterThan(10)
    expect(hsStabilityMultiplier(hill, 'parallel', 240)).toBe(1)
    expect(hsStabilityMultiplier(hill, 'parallel', 256.5)).toBeLessThan(1)
    expect(hsStabilityMultiplier(hill, 'parallel', 256.5)).toBeGreaterThan(hsStabilityMultiplier(hill, 'telemark', 256.5))
    expect(hsStabilityMultiplier(hill, 'parallel', 276)).toBe(0)
    expect(hsStabilityMultiplier(hill, 'telemark', 265)).toBe(0)
    const extreme = run({ gate: 46, wind: 0, aoa: 28, style: 'telemark' })
    expect(extreme.measuredDistanceMeters ?? 0).toBeGreaterThan(265)
    expect(extreme.outcome?.status).toBe('fall')
  })

  it('254.5 m real record + 2 m after 0.5m floor: seed 42, gate42 (old 32), 0 wind, ideal takeoff, AoA32, R at 5s', () => {
    const trial = { gate: 42, wind: 0, offset: 0, prep: 5, style: 'parallel' as const }
    const first = run(trial)
    const result = createTrainingJumpResult(first, 1)
    // h04-polar-1: zakres zamiast pinu dokładnej wartości (256,93… m).
    expect(first.measuredDistanceMeters ?? 0).toBeGreaterThanOrEqual(256.5)
    expect(first.measuredDistanceMeters ?? 999).toBeLessThan(260)
    expect(first.outcome?.status).toBe('landed')
    expect(first.landingStyle).toBe('parallel')
    expect(first.contact?.supportHands).toBe(0)
    expect(result.distanceHalfMeters).toBeGreaterThanOrEqual(513) // floor ≥ 256.5 m
    const again = run(trial)
    expect(again.contact).toEqual(first.contact)
    expect(again.events).toEqual(first.events)
    expect(createTrainingJumpResult(again, 1)).toEqual(result)
    // Less precise pitch at a similar distance: one-hand support, not automatic clean landing.
    const marginal = run({ gate: 43, wind: 0, aoa: 28, prep: 5 })
    expect(marginal.measuredDistanceMeters ?? 0).toBeGreaterThan(256.5)
    expect(marginal.outcome?.status).toBe('landed')
    expect(marginal.contact?.supportHands).toBeGreaterThan(0)
    const nearby = [28, 29, 30, 31, 32].flatMap(aoa => [41, 42, 43, 44, 45].map(gate => run({ gate, wind: 0, aoa, prep: 5 })))
      .filter(sim => (sim.measuredDistanceMeters ?? 0) >= 256.5 && (sim.measuredDistanceMeters ?? 0) < 266 && sim.outcome?.status === 'landed')
    expect(nearby.filter(sim => (sim.contact?.supportHands ?? 0) > 0).length).toBeGreaterThan(nearby.filter(sim => sim.contact?.supportHands === 0).length)
  })
})

describe('H04 — AI, competition, versioned session and replay', () => {
  it('seeded AI watched == fast; difficulty profiles; AUTO feeds flying competition', () => {
    const medians: number[] = []
    for (const difficulty of ['easy', 'normal', 'hard'] as const) {
      const distances: number[] = []
      let falls = 0
      for (let i = 0; i < 20; i += 1) {
        const windField = createWindField(0x45ab_4004 + i)
        const gate = selectSafeJuryGate(hill, forecastWindMean(windField, hill)).gateNumber
        const original = createAiPlan(aiSeedForJump(0xa11ce + i, `bot-${i}`, 'qualification'), difficulty, hill.spec.id)
        const plan = h04CompetitionAiPlan(original)
        expect(plan.seed).toBe(original.seed)
        const fast = simulateAiJump({ plan, gateNumber: gate, jumpConfig: { hill }, windField }, 'fast')
        distances.push(fast.measuredDistanceMeters ?? 0)
        if (fast.outcome?.status === 'fall') falls += 1
        if (i === 0) {
          const watched = simulateAiJump({ plan, gateNumber: gate, jumpConfig: { hill }, windField: createWindField(0x45ab_4004) }, 'watched')
          expect(watched.events).toEqual(fast.events)
          expect(watched.outcome).toEqual(fast.outcome)
          expect(watched.measuredDistanceMeters).toBe(fast.measuredDistanceMeters)
        }
      }
      distances.sort((a, b) => a - b)
      medians.push(distances[9] ?? 0)
      expect(falls).toBeLessThanOrEqual(5)
    }
    // H04 AUTO chroni pułap dalekiego lotu; łatwe boty pozostają grywalne,
    // ale niższe belki oznaczają wynik typowy poniżej K.
    expect(medians[0]).toBeGreaterThan(135)
    expect(medians[1]).toBeGreaterThan(medians[0]!)
    expect(medians[2]).toBeGreaterThan(medians[0]!)
    const session = new CompetitionSession(hill, 1, 'normal')
    expect(session.snapshot().juryGateNumber).toBeGreaterThan(1)
    expect(session.state.hillClass).toBe('flying')
  })

  it('explicit catalog; old hill versions/sessions cannot resume into H04', () => {
    expect(PLAYABLE_HILL_SPECS).toEqual([TECHNICAL_K120, LILLEHAMMER_NORMAL, ZAKOPANE_LARGE, OBERSTDORF_LARGE, PLANICA_FLYING])
    expect(buildHillById(hill.spec.id).spec).toBe(PLANICA_FLYING)
    expect(hillCompetitionSessionId(hill.spec.id)).toBe(H04_COMPETITION_SESSION_ID)
    const session = new CompetitionSession(hill, 1, 'normal')
    expect(session.state.id).toBe(H04_COMPETITION_SESSION_ID)
    const stored = session.toStoredSession(1000)
    expect(validateStoredSession(stored).ok).toBe(true)
    expect(() => assertSessionMatchesHill(stored, hill.spec.id)).not.toThrow()
    expect(() => new CompetitionSession(hill, 1, 'normal', false, stored)).not.toThrow()
    for (const other of PLAYABLE_HILL_SPECS.filter(spec => spec.id !== hill.spec.id)) {
      expect(() => assertSessionMatchesHill(stored, other.id)).toThrow()
      expect(() => new CompetitionSession(buildHill(other), 1, 'normal', false, stored)).toThrow()
      const otherStored = new CompetitionSession(buildHill(other), 1, 'normal').toStoredSession(1000)
      expect(() => assertSessionMatchesHill(otherStored, hill.spec.id)).toThrow()
    }
    for (const [version, id] of [['h04-inspired-1', 'standard-h04-planica-flying-1'], ['h04-inspired-2', 'standard-h04-planica-flying-2'], ['h04-inspired-3', 'standard-h04-planica-flying-3']] as const) {
      const old = { ...stored, id, versions: { ...stored.versions, hill: version },
        competition: { ...stored.competition, id, versions: { ...stored.competition.versions, hill: version } } }
      expect(() => assertSessionMatchesHill(old, hill.spec.id)).toThrow()
      expect(() => new CompetitionSession(hill, 1, 'normal', false, old)).toThrow()
    }
  })

  it('record+2 competition commit and recorded replay (not re-simulation), isolated by hill/version', async () => {
    const session = new CompetitionSession(hill, 1, 'normal')
    let recorder: JumpRecorder | null = null
    const sim = run({ gate: 42, wind: 0, prep: 5 }, created => {
      recorder = new JumpRecorder(created, {
        sessionId: session.state.id, competitionId: session.state.id,
        roundId: 'qualification', participantId: 'local-01', participantName: 'Test', juryGateNumber: 42, coachRequested: false,
      })
    }, (_stepped, input) => recorder?.record(input))
    expect(sim.outcome?.status).toBe('landed')
    expect(sim.contact?.supportHands).toBe(0)
    const result = createCompetitionJumpResult(sim, {
      competitionId: session.state.id, roundId: 'qualification', participantId: 'local-01', juryGateNumber: 42,
      coachRequested: false, coachDecisionPhase: 'red', sessionRevision: 1,
    })
    expect(result.distanceHalfMeters).toBeGreaterThanOrEqual(513)
    const replay = (recorder as JumpRecorder | null)?.finish(result, 1000)
    expect(replay).toBeDefined()
    if (!replay) throw new Error('Replay must exist')
    expect(validateStoredReplay(replay).ok).toBe(true)
    expect(() => assertReplayMatchesHill(replay, hill.spec.id)).not.toThrow()
    expect(() => assertReplayMatchesHill(replay, OBERSTDORF_LARGE.id)).toThrow()
    const player = new ReplayPlayer(replay)
    player.scrub(player.lastTick - player.firstTick)
    expect(player.frame().phase).toBe(sim.phase)
    expect(player.replay.recordedResult.distanceHalfMeters).toBe(result.distanceHalfMeters)
    for (const version of ['h04-inspired-1', 'h04-inspired-2', 'h04-inspired-3']) {
      const old = { ...replay, versions: { ...replay.versions, hill: version } }
      expect(validateStoredReplay(old).ok).toBe(true)
      expect(() => assertReplayMatchesHill(old, hill.spec.id)).toThrow()
      expect(replayVisualsCompatible(old, hill.spec.hillVersion, hill.spec.id)).toBe(false)
      expect(new ReplayPlayer(old).frame().tick).toBe(0)
    }
    const db = await openGameDatabase(new IDBFactory())
    // Historical v1/v2 sessions and result records retain their separate keys.
    const legacyId = 'standard-h04-planica-flying-1'
    const legacyVersions = { ...result.versions, hill: 'h04-inspired-1' }
    const legacyResult = { ...result, competitionId: legacyId, resultId: `${result.resultId}-v1`, versions: legacyVersions }
    const legacyReplay = {
      ...replay, id: legacyResult.resultId, sessionId: legacyId, createdAtMs: 900,
      versions: legacyVersions, recordedResult: legacyResult,
      initialState: { ...replay.initialState, competitionId: legacyId },
    }
    const originalSession = session.toStoredSession(900)
    const legacySession = {
      ...originalSession, id: legacyId,
      versions: { ...originalSession.versions, hill: 'h04-inspired-1' },
      competition: { ...originalSession.competition, id: legacyId,
        versions: { ...originalSession.competition.versions, hill: 'h04-inspired-1' } },
    }
    const legacyRecord = {
      key: recordKey(legacyVersions), distanceHalfMeters: legacyResult.distanceHalfMeters,
      totalTenths: legacyResult.totalTenths, participantId: legacyResult.participantId,
      resultId: legacyResult.resultId, establishedAtMs: 900, versions: legacyVersions,
    }
    const v2Id = 'standard-h04-planica-flying-2'
    const v2Versions = { ...result.versions, hill: 'h04-inspired-2' }
    const v2Session = { ...legacySession, id: v2Id, versions: { ...legacySession.versions, hill: v2Versions.hill },
      competition: { ...legacySession.competition, id: v2Id,
        versions: { ...legacySession.competition.versions, hill: v2Versions.hill } } }
    const v2Record = { ...legacyRecord, key: recordKey(v2Versions), resultId: `${result.resultId}-v2`, versions: v2Versions }
    expect(validateStoredSession(legacySession).ok).toBe(true)
    expect(validateStoredSession(v2Session).ok).toBe(true)
    expect(validateStoredReplay(legacyReplay).ok).toBe(true)
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE.sessions, STORE.records, STORE.replays], 'readwrite')
      tx.objectStore(STORE.sessions).put(legacySession)
      tx.objectStore(STORE.sessions).put(v2Session)
      tx.objectStore(STORE.records).put(legacyRecord)
      tx.objectStore(STORE.records).put(v2Record)
      tx.objectStore(STORE.replays).put(legacyReplay)
      tx.oncomplete = () => resolve()
      tx.onabort = () => reject(tx.error)
      tx.onerror = () => reject(tx.error)
    })
    expect(await loadSession(db, legacyId)).toMatchObject({ kind: 'ok', session: { id: legacyId, versions: { hill: 'h04-inspired-1' } } })
    expect(await loadSession(db, v2Id)).toMatchObject({ kind: 'ok', session: { id: v2Id, versions: { hill: 'h04-inspired-2' } } })
    expect(await commitAttempt(db, {
      session: { ...session.toStoredSession(1000), revision: 1 }, result, replay,
      recordCandidate: { context: 'competition', status: result.status, distanceHalfMeters: result.distanceHalfMeters, versions: result.versions },
      ownerId: 'h04-test', nowMs: 1000,
    })).toMatchObject({ ok: true, applied: true, recordUpdated: true })
    expect(await loadSession(db, H04_COMPETITION_SESSION_ID)).toMatchObject({ kind: 'ok', session: { hillId: hill.spec.id } })
    expect((await loadLatestReplay(db)).kind).toBe('ok')
    expect((await loadOfficialRecord(db, recordKey(result.versions)))?.distanceHalfMeters).toBe(result.distanceHalfMeters)
    expect(await loadSession(db, legacyId)).toMatchObject({ kind: 'ok', session: { id: legacyId, versions: { hill: 'h04-inspired-1' } } })
    expect(await loadOfficialRecord(db, legacyRecord.key)).toEqual(legacyRecord)
    expect(await loadOfficialRecord(db, v2Record.key)).toEqual(v2Record)
    expect(recordKey(result.versions)).not.toBe(legacyRecord.key)
    expect(recordKey(result.versions)).not.toBe(v2Record.key)
    // Recorded v1 samples remain playable without re-simulating with v2 hill
    // geometry. IndexedDB intentionally keeps only ONE automatic replay: a
    // separate archive for old automatic replays requires storage scope.
    const legacyPlayer = new ReplayPlayer(legacyReplay)
    legacyPlayer.scrub(legacyPlayer.lastTick - legacyPlayer.firstTick)
    expect(legacyPlayer.replay.recordedResult.distanceHalfMeters).toBe(legacyResult.distanceHalfMeters)
    expect(legacyPlayer.frame().phase).toBe(sim.phase)
    expect(legacyPlayer.replay.samples).toEqual(legacyReplay.samples)
    expect(await loadOfficialRecord(db, recordKey({ ...result.versions, hill: OBERSTDORF_LARGE.hillVersion }))).toBeUndefined()
    db.close()
  })
})
