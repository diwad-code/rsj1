/** P21-H02: deterministyczny profil Zakopanego inspirowany, nie certyfikat FIS. */
import { IDBFactory } from 'fake-indexeddb'
import { describe, expect, it } from 'vitest'
import { buildHill, TECHNICAL_K120, validateHill } from '../src/simulation/technicalHill'
import { LILLEHAMMER_NORMAL } from '../src/simulation/hills/lillehammerNormal'
import { ZAKOPANE_LARGE } from '../src/simulation/hills/zakopaneLarge'
import { JumpSimulation, SIM_DT } from '../src/simulation/jump'
import { DEFAULT_JUMP_PARAMS } from '../src/simulation/params'
import { estimateSkilledDistanceMeters, forecastWindMean, hsStabilityMultiplier, selectSafeJuryGate } from '../src/sport/safety'
import { EMPTY_INPUT, makeInput } from './support/jumpHarness'
import type { WindField } from '../src/simulation/wind'
import { createCompetitionJumpResult, createTrainingJumpResult } from '../src/sport/jumpResult'
import { aiSeedForJump, createAiPlan, simulateAiJump } from '../src/sport/ai'
import { createWindField } from '../src/simulation/wind'
import { CompetitionSession, H02_COMPETITION_SESSION_ID, h02CompetitionAiPlan } from '../src/app/competitionSession'
import { assertReplayMatchesHill, assertSessionMatchesHill, buildHillById, hillCompetitionSessionId, HILL_SPECS, PLAYABLE_HILL_SPECS } from '../src/app/hills'
import { JumpRecorder } from '../src/replay/recorder'
import { ReplayPlayer, replayVisualsCompatible } from '../src/replay/player'
import { commitAttempt, countStore, loadLatestReplay, loadOfficialRecord, loadSession, openGameDatabase } from '../src/storage/db'
import { recordKey, STORE, validateStoredReplay, validateStoredSession } from '../src/storage/schema'

const hill = buildHill(ZAKOPANE_LARGE)

function edgeTick(gate: number): number {
  const probe = new JumpSimulation({ hill, gateNumber: gate, autoStart: true })
  while (probe.phase === 'Inrun' || probe.phase === 'Takeoff') probe.step(EMPTY_INPUT)
  return probe.tick
}

function run(options: { gate: number; wind: number; offset?: number; prep?: number; style?: 'parallel' | 'telemark' | null; pilot?: 'none' | 'ideal' }): JumpSimulation {
  const edge = edgeTick(options.gate)
  const takeoffTick = edge - Math.round(DEFAULT_JUMP_PARAMS.takeoff.idealLeadSeconds / SIM_DT) + (options.offset ?? 0)
  const windField = { seed: 42, version: 'h02-probe', sampleUserMetersPerSecond: () => options.wind } as WindField
  const sim = new JumpSimulation({ hill, gateNumber: options.gate, windField, autoStart: true })
  let prepped = false
  for (let guard = 0; guard < 20000 && !sim.finished; guard += 1) {
    const pressed: ('takeoff' | 'parallel' | 'telemark')[] = []
    const held: ('left' | 'right')[] = []
    if (sim.tick === takeoffTick) pressed.push('takeoff')
    if (sim.phase === 'Flight') {
      if (options.pilot !== 'none') {
        const flowDeg = Math.atan2(sim.velocity.y, sim.velocity.x) * 180 / Math.PI
        const desired = flowDeg + 32
        const current = sim.targetPitchRad * 180 / Math.PI
        if (current > desired + 0.5) held.push('right')
        else if (current < desired - 0.5) held.push('left')
      }
      if (!prepped && options.style !== null && sim.flightSeconds >= (options.prep ?? 3.2)) {
        pressed.push(options.style ?? 'parallel')
        prepped = true
      }
    }
    const input = makeInput(pressed, held, sim.tick)
    sim.step(input)
  }
  return sim
}

describe('P21-H02 — źródło, geometria, pomiar', () => {
  it('K125/HS140, odrębny profil, odrębna wersja i jeden fizyczny metraż dla znaczników', () => {
    expect(validateHill(hill)).toEqual([])
    expect(ZAKOPANE_LARGE).toMatchObject({ id: 'h02-zakopane-large', hillVersion: 'h02-inspired-1', classification: 'large', kPointMeters: 125, hillSizeMeters: 140 })
    expect(ZAKOPANE_LARGE.name).toContain('INSPIROWANA')
    expect([ZAKOPANE_LARGE.pPointMeters, 125, 140, ZAKOPANE_LARGE.uPointMeters, ZAKOPANE_LARGE.fallLineMeters, ZAKOPANE_LARGE.outrunEndMeters]).toEqual([111, 125, 140, 190, 223, 285])
    expect(hill.markers.tableEdge).toEqual({ x: 0, y: 0 })
    for (const [marker, meters] of [['pPoint', 111], ['kPoint', 125], ['hillSize', 140], ['uPoint', 190], ['fallLine', 223]] as const) {
      expect(hill.markers[marker]).toEqual(hill.surfacePositionAt(meters))
    }
    for (const meters of [0, 5, 48, 111, 125, 140, 145, 149.5, 190, 223, 280]) {
      expect(hill.surfaceDistanceAtPoint(hill.surfacePositionAt(meters))).toBeCloseTo(meters, 1)
    }
    expect(hill.inrunCurve.lastPoint.x).toBeCloseTo(0, 8)
    expect(hill.inrunCurve.lastPoint.y).toBeCloseTo(0, 8)
    expect(hill.landingCurve.lastPoint).toEqual(hill.outrunCurve.firstPoint)
    expect(hill.markers.kPoint).not.toEqual(buildHill(LILLEHAMMER_NORMAL).markers.kPoint)
    expect(hill.markers.kPoint).not.toEqual(buildHill(TECHNICAL_K120).markers.kPoint)
  })

  it('31 belek ADAPT, pomiar wiatru ADAPT, współczynniki wiatru F10 i jawne przybliżenie 7,56→7,6', () => {
    expect(hill.gates).toHaveLength(31)
    expect(hill.gate(1).inrunLengthMeters).toBe(77)
    expect(hill.gate(31).inrunLengthMeters).toBe(98)
    for (let n = 1; n < 31; n += 1) expect(hill.gate(n + 1).inrunLengthMeters - hill.gate(n).inrunLengthMeters).toBeCloseTo(0.7)
    expect(hill.gate(31).inrunLengthMeters).toBeLessThan(hill.spec.inrun.lengthMeters)
    expect(() => hill.gate(32)).toThrow()
    expect(hill.spec.windMeasurement.sensors).toEqual([{ distanceMeters: 48, weight: 0.25 }, { distanceMeters: 99, weight: 0.45 }, { distanceMeters: 137, weight: 0.3 }])
    expect(hill.spec.compensation).toMatchObject({ provenance: 'simulation-calibrated', headWindFactorTenthsPerMps: 108, tailWindFactorTenthsPerMps: 162, gateFactorTenthsPerInrunMeter: 76, coachThresholdHalfMeters: 266, referenceGateNumber: 1 })
    expect(hill.spec.compensation.sourceRefs.some(ref => ref.includes('2026JP3112RLQ.pdf'))).toBe(true)
    expect(hill.spec.compensation.coachThresholdHalfMeters).toBe(Math.floor(140 * 0.95 * 2))
    expect(hill.spec.safety).toMatchObject({ referenceGateNumber: 1, referenceDistanceMeters: 97.7, safeTargetMeters: 144, autoHeadwindEffectScale: 0.5, telemarkImpossibleMeters: 154, parallelImpossibleMeters: 160 })
  })
})

describe('P21-H02 — skoki i trudność', () => {
  it('AUTO reaguje na obydwa znaki, a prowadzone loty mieszczą się pod HS', () => {
    const actual = [-2, -1, 0, 1, 2].map(wind => {
      const gate = selectSafeJuryGate(hill, wind).gateNumber
      const sim = run({ gate, wind })
      expect(sim.finished).toBe(true)
      expect(sim.outcome?.status).toBe('landed')
      expect(sim.measuredDistanceMeters).toBeGreaterThan(125)
      expect(sim.measuredDistanceMeters).toBeLessThan(140)
      return gate
    })
    expect(actual).toEqual([22, 19, 16, 15, 14])
    expect(estimateSkilledDistanceMeters(hill, 1, 0)).toBe(97.7)
    expect(run({ gate: 16, wind: 1 }).measuredDistanceMeters).toBeGreaterThan(run({ gate: 16, wind: -1 }).measuredDistanceMeters ?? 0)
    expect(selectSafeJuryGate(hill, 0)).toEqual(selectSafeJuryGate(hill, 0))
  })

  it('wczesne/lokalne/późne wybicie, oba style oraz bardzo wczesne T i podejście', () => {
    const early = run({ gate: 16, wind: 0, offset: -6 })
    const timely = run({ gate: 16, wind: 0 })
    const late = run({ gate: 16, wind: 0, offset: 6 })
    expect(early.takeoffTimingOffsetSeconds).toBeGreaterThan(0)
    expect(timely.perfectTakeoff).toBe(true)
    expect(late.takeoffTimingOffsetSeconds).toBeLessThan(0)
    expect(timely.takeoffNormalSpeed).toBeGreaterThan(early.takeoffNormalSpeed)
    expect(timely.takeoffNormalSpeed).toBeGreaterThan(late.takeoffNormalSpeed)
    for (const style of ['telemark', 'parallel'] as const) {
      const sim = run({ gate: 16, wind: 0, style })
      expect(sim.outcome?.status).toBe('landed')
      expect(sim.landingStyle).toBe(style)
    }
    const premature = run({ gate: 16, wind: 0, prep: 0 })
    expect(premature.landingApproachEarly).toBe(true)
    expect((timely.measuredDistanceMeters ?? 0) - (premature.measuredDistanceMeters ?? 0)).toBeGreaterThan(5)
    const prematureT = run({ gate: 16, wind: 0, prep: 0, style: 'telemark' })
    expect(prematureT.earlyTelemarkFallback).toBe(true)
    expect(prematureT.landingStyle).toBe('parallel')
  })

  it('progresja za HS: telemark trudniejszy; na i poza limitami niemożliwe ustanie', () => {
    expect(hsStabilityMultiplier(hill, 'parallel', 140)).toBe(1)
    expect(hsStabilityMultiplier(hill, 'parallel', 149.5)).toBeGreaterThan(0)
    expect(hsStabilityMultiplier(hill, 'telemark', 149.5)).toBeLessThan(hsStabilityMultiplier(hill, 'parallel', 149.5))
    expect(hsStabilityMultiplier(hill, 'telemark', 154)).toBe(0)
    expect(hsStabilityMultiplier(hill, 'parallel', 160)).toBe(0)
    expect(run({ gate: 1, wind: 0 }).outcome?.status).toBe('landed')
    const overLimit = run({ gate: 31, wind: 2, style: 'telemark', prep: 3.2 })
    expect(overLimit.measuredDistanceMeters).toBeGreaterThanOrEqual(154)
    expect(overLimit.outcome?.status).toBe('fall')
  })

  it('rekord 147,0 + 2: zapis 149,5 m bez podpórki na dwóch nogach, powtarzalnie', () => {
    const input = { gate: 26, wind: 0.5, offset: 0, prep: 3.8, style: 'parallel' as const }
    const jump = run(input)
    const result = createTrainingJumpResult(jump, 1)
    expect(jump.outcome?.status).toBe('landed')
    expect(jump.landingStyle).toBe('parallel')
    expect(jump.contact?.supportHands).toBe(0)
    expect(jump.measuredDistanceMeters).toBeCloseTo(149.82158951976325, 6)
    expect(result.distanceHalfMeters).toBe(299)
    expect(result.distanceHalfMeters / 2).toBeGreaterThanOrEqual(149)
    const repeat = run(input)
    expect(repeat.outcome).toEqual(jump.outcome)
    expect(repeat.contact).toEqual(jump.contact)
    expect(repeat.events).toEqual(jump.events)
    expect(createTrainingJumpResult(repeat, 1)).toEqual(result)
  })

  it('w podobnym paśmie 149–154 m mniej precyzyjny kontakt częściej podpiera się niż stoi czysto', () => {
    let clean = 0
    let support = 0
    for (const gate of [26, 28, 29, 30, 31]) for (const wind of [-2, -1.5, -1, -0.5, 0, 0.5, 1, 2]) for (const offset of [-4, -2, 0, 2, 4]) for (const prep of [2.4, 2.8, 3.2, 3.5, 3.8]) {
      const sim = run({ gate, wind, offset, prep })
      const distance = sim.measuredDistanceMeters ?? 0
      if (distance < 149 || distance > 154 || sim.outcome?.status !== 'landed') continue
      if (sim.contact?.supportHands === 0) clean += 1
      else support += 1
    }
    expect({ clean, support }).toEqual({ clean: 62, support: 152 })
  })
})

describe('P21-H02 — AI, katalog, zapis i replay', () => {
  it('H02 AI: seed i trudność zachowane; watched==fast, bez zmiany planu K120/H01', () => {
    const medians: number[] = []
    for (const difficulty of ['easy', 'normal', 'hard'] as const) {
      const distances: number[] = []
      let falls = 0
      for (let index = 0; index < 30; index += 1) {
        const windField = createWindField(0x45ab_2002 + index)
        const gate = selectSafeJuryGate(hill, forecastWindMean(windField, hill)).gateNumber
        const original = createAiPlan(aiSeedForJump(0xa11ce + index, `bot-${index}`, 'qualification'), difficulty, hill.spec.id)
        const plan = h02CompetitionAiPlan(original)
        expect(plan.seed).toBe(original.seed)
        const setup = { plan, gateNumber: gate, jumpConfig: { hill } }
        const fast = simulateAiJump({ ...setup, windField }, 'fast')
        expect(fast.finished).toBe(true)
        distances.push(fast.measuredDistanceMeters ?? 0)
        if (fast.outcome?.status === 'fall') falls += 1
        if (index === 0) {
          // Najpierw rozgrzewamy cache innej skoczni dla tej samej belki.
          simulateAiJump({ plan: createAiPlan(original.seed, difficulty), gateNumber: gate, windField: createWindField(0x45ab_2002) }, 'fast')
          const watched = simulateAiJump({ ...setup, windField: createWindField(0x45ab_2002 + index) }, 'watched')
          expect(watched.events).toEqual(fast.events)
          expect(watched.measuredDistanceMeters).toBe(fast.measuredDistanceMeters)
          expect(watched.outcome).toEqual(fast.outcome)
          expect(watched.windMeasurement).toEqual(fast.windMeasurement)
        }
      }
      distances.sort((a, b) => a - b)
      medians.push(distances[14] ?? 0)
      expect(falls).toBeLessThanOrEqual(2)
    }
    expect(medians[0]).toBeGreaterThan(130)
    expect(medians[1]).toBeGreaterThan(medians[0] ?? 0)
    expect(medians[2]).toBeGreaterThan(medians[1] ?? 0)
    expect(TECHNICAL_K120.hillVersion).toBe('3.5.0')
    expect(LILLEHAMMER_NORMAL.hillVersion).toBe('h01-inspired-4')
  })

  it('katalog w kolejności klawiatury, osobne sesje i blokada cross-restore / starej wersji', () => {
    expect(HILL_SPECS).toEqual(PLAYABLE_HILL_SPECS)
    expect(PLAYABLE_HILL_SPECS.map(s => s.id)).toEqual(['tech-k120-hs134', 'h01-lillehammer-normal', 'h02-zakopane-large', 'h03-oberstdorf-large', 'h04-planica-flying'])
    expect(PLAYABLE_HILL_SPECS.map(s => s.hillVersion)).toEqual(['3.5.0', 'h01-inspired-4', 'h02-inspired-1', 'h03-inspired-1', 'h04-inspired-4'])
    expect(buildHillById('h02-zakopane-large').spec).toBe(ZAKOPANE_LARGE)
    const session = new CompetitionSession(hill, 1, 'normal')
    expect(session.state.id).toBe(H02_COMPETITION_SESSION_ID)
    expect(session.snapshot().juryGateNumber).toBeGreaterThan(1)
    expect(hillCompetitionSessionId(hill.spec.id)).toBe(H02_COMPETITION_SESSION_ID)
    const stored = session.toStoredSession(1000)
    expect(stored.hillId).toBe(hill.spec.id)
    expect(stored.competition.versions.hill).toBe(hill.spec.hillVersion)
    expect(validateStoredSession(stored).ok).toBe(true)
    expect(() => assertSessionMatchesHill(stored, hill.spec.id)).not.toThrow()
    expect(() => new CompetitionSession(hill, 1, 'normal', false, stored)).not.toThrow()
    for (const otherId of ['tech-k120-hs134', 'h01-lillehammer-normal']) {
      expect(hillCompetitionSessionId(otherId)).not.toBe(H02_COMPETITION_SESSION_ID)
      expect(() => assertSessionMatchesHill(stored, otherId)).toThrow()
      expect(() => new CompetitionSession(buildHillById(otherId), 1, 'normal', false, stored)).toThrow()
    }
    const old = { ...stored, versions: { ...stored.versions, hill: 'h02-inspired-0' } }
    expect(() => assertSessionMatchesHill(old, hill.spec.id)).toThrow()
    expect(() => new CompetitionSession(hill, 1, 'normal', false, old)).toThrow()
    expect(recordKey(stored.versions)).not.toBe(recordKey({ ...stored.versions, hill: LILLEHAMMER_NORMAL.hillVersion }))
  })

  it('atomowy commit H02 zapisuje sesję, rekord i odtwarzalne próbki; stary replay nie udaje nowej fizyki', async () => {
    const session = new CompetitionSession(hill, 1, 'normal')
    const windField = createWindField(0x5a17c0de)
    const gate = selectSafeJuryGate(hill, forecastWindMean(windField, hill)).gateNumber
    const sim = new JumpSimulation({ hill, gateNumber: gate, windField, autoStart: true })
    const recorder = new JumpRecorder(sim, {
      sessionId: session.state.id, competitionId: session.state.id,
      roundId: 'qualification', participantId: 'local-01', participantName: 'Test', juryGateNumber: gate, coachRequested: false,
    })
    // Replay w tym teście wykorzystuje realną próbę z zapisanymi wejściami.
    const takeoffTick = edgeTick(gate) - Math.round(DEFAULT_JUMP_PARAMS.takeoff.idealLeadSeconds / SIM_DT)
    let prepped = false
    for (let guard = 0; guard < 20000 && !sim.finished; guard += 1) {
      const pressed: ('takeoff' | 'parallel')[] = []
      const held: ('left' | 'right')[] = []
      if (sim.tick === takeoffTick) pressed.push('takeoff')
      if (sim.phase === 'Flight') {
        const desired = Math.atan2(sim.velocity.y, sim.velocity.x) * 180 / Math.PI + 32
        const current = sim.targetPitchRad * 180 / Math.PI
        if (current > desired + 0.5) held.push('right')
        else if (current < desired - 0.5) held.push('left')
        if (!prepped && sim.flightSeconds >= 3.2) { pressed.push('parallel'); prepped = true }
      }
      const input = makeInput(pressed, held, sim.tick)
      sim.step(input)
      recorder.record(input)
    }
    expect(sim.finished).toBe(true)
    const result = createCompetitionJumpResult(sim, {
      competitionId: session.state.id, roundId: 'qualification', participantId: 'local-01', juryGateNumber: gate,
      coachRequested: false, coachDecisionPhase: 'red', sessionRevision: 1,
    })
    const replay = recorder.finish(result, 1000)
    expect(replay.versions.hill).toBe('h02-inspired-1')
    expect(validateStoredReplay(replay).ok).toBe(true)
    expect(() => assertReplayMatchesHill(replay, hill.spec.id)).not.toThrow()
    expect(() => assertReplayMatchesHill(replay, TECHNICAL_K120.id)).toThrow()
    expect(replayVisualsCompatible(replay, hill.spec.hillVersion, hill.spec.id)).toBe(true)
    const player = new ReplayPlayer(replay)
    player.scrub(player.lastTick - player.firstTick)
    expect(player.frame().phase).toBe(sim.phase)
    expect(player.replay.recordedResult.distanceHalfMeters).toBe(result.distanceHalfMeters)
    const oldReplay = { ...replay, versions: { ...replay.versions, hill: 'h02-inspired-0' } }
    expect(validateStoredReplay(oldReplay).ok).toBe(true)
    expect(() => assertReplayMatchesHill(oldReplay, hill.spec.id)).toThrow()
    expect(replayVisualsCompatible(oldReplay, hill.spec.hillVersion, hill.spec.id)).toBe(false)
    expect(new ReplayPlayer(oldReplay).frame().tick).toBe(0)

    const db = await openGameDatabase(new IDBFactory())
    const snapshot = { ...session.toStoredSession(1000), revision: 1 }
    const saved = await commitAttempt(db, {
      session: snapshot, result, replay,
      recordCandidate: { context: 'competition', status: result.status, distanceHalfMeters: result.distanceHalfMeters, versions: result.versions },
      ownerId: 'h02-test', nowMs: 1000,
    })
    expect(saved).toMatchObject({ ok: true, applied: true, recordUpdated: true })
    expect(await countStore(db, STORE.results)).toBe(1)
    expect(await loadSession(db, H02_COMPETITION_SESSION_ID)).toMatchObject({ kind: 'ok', session: { hillId: hill.spec.id } })
    expect((await loadLatestReplay(db)).kind).toBe('ok')
    expect((await loadOfficialRecord(db, recordKey(result.versions)))?.distanceHalfMeters).toBe(result.distanceHalfMeters)
    expect(await loadOfficialRecord(db, recordKey({ ...result.versions, hill: 'h02-inspired-0' }))).toBeUndefined()
    db.close()
  })
})
