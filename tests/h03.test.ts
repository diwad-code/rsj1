/** P21-H03: funkcjonalna kalibracja inspirowanego Oberstdorfu, bez oceny artu. */
import { IDBFactory } from 'fake-indexeddb'
import { describe, expect, it } from 'vitest'
import { buildHill, TECHNICAL_K120, validateHill } from '../src/simulation/technicalHill'
import { OBERSTDORF_LARGE } from '../src/simulation/hills/oberstdorfLarge'
import { LILLEHAMMER_NORMAL } from '../src/simulation/hills/lillehammerNormal'
import { ZAKOPANE_LARGE } from '../src/simulation/hills/zakopaneLarge'
import { JumpSimulation, SIM_DT } from '../src/simulation/jump'
import { DEFAULT_JUMP_PARAMS } from '../src/simulation/params'
import type { WindField } from '../src/simulation/wind'
import { createWindField } from '../src/simulation/wind'
import { estimateSkilledDistanceMeters, forecastWindMean, hsStabilityMultiplier, selectSafeJuryGate } from '../src/sport/safety'
import { createCompetitionJumpResult, createTrainingJumpResult } from '../src/sport/jumpResult'
import { aiSeedForJump, createAiPlan, simulateAiJump } from '../src/sport/ai'
import { H03_COMPETITION_SESSION_ID, h03CompetitionAiPlan, CompetitionSession } from '../src/app/competitionSession'
import { assertReplayMatchesHill, assertSessionMatchesHill, buildHillById, hillCompetitionSessionId, PLAYABLE_HILL_SPECS } from '../src/app/hills'
import { JumpRecorder } from '../src/replay/recorder'
import { ReplayPlayer, replayVisualsCompatible } from '../src/replay/player'
import { commitAttempt, countStore, loadLatestReplay, loadOfficialRecord, loadSession, openGameDatabase } from '../src/storage/db'
import { recordKey, STORE, validateStoredReplay, validateStoredSession } from '../src/storage/schema'
import { EMPTY_INPUT, makeInput } from './support/jumpHarness'

const hill = buildHill(OBERSTDORF_LARGE)
const edges = new Map<number, number>()
function edgeTick(gate: number): number {
  const cached = edges.get(gate)
  if (cached !== undefined) return cached
  const sim = new JumpSimulation({ hill, gateNumber: gate, autoStart: true })
  while (sim.phase === 'Inrun' || sim.phase === 'Takeoff') sim.step(EMPTY_INPUT)
  edges.set(gate, sim.tick)
  return sim.tick
}

type Trial = { gate: number; wind: number; offset?: number; prep?: number; style?: 'parallel' | 'telemark' | null }
function run(trial: Trial, onStep?: (sim: JumpSimulation, input: ReturnType<typeof makeInput>) => void): JumpSimulation {
  const windField = { seed: 42, version: 'h03-probe', sampleUserMetersPerSecond: () => trial.wind } as WindField
  const sim = new JumpSimulation({ hill, gateNumber: trial.gate, windField, autoStart: true })
  const takeoffTick = edgeTick(trial.gate) - Math.round(DEFAULT_JUMP_PARAMS.takeoff.idealLeadSeconds / SIM_DT) + (trial.offset ?? 0)
  let prepped = false
  for (let guard = 0; guard < 20_000 && !sim.finished; guard += 1) {
    const pressed: ('takeoff' | 'telemark' | 'parallel')[] = []
    const held: ('left' | 'right')[] = []
    if (sim.tick === takeoffTick) pressed.push('takeoff')
    if (sim.phase === 'Flight') {
      const desired = Math.atan2(sim.velocity.y, sim.velocity.x) * 180 / Math.PI + 32
      const current = sim.targetPitchRad * 180 / Math.PI
      if (current > desired + 0.5) held.push('right')
      else if (current < desired - 0.5) held.push('left')
      if (!prepped && trial.style !== null && sim.flightSeconds >= (trial.prep ?? 3.4)) {
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

describe('H03 — profil, źródła i sport', () => {
  it('K120/HS137; niezależne krzywe gry i wspólny pomiar odległości', () => {
    expect(validateHill(hill)).toEqual([])
    expect(OBERSTDORF_LARGE).toMatchObject({ id: 'h03-oberstdorf-large', hillVersion: 'h03-inspired-1', classification: 'large', kPointMeters: 120, hillSizeMeters: 137 })
    expect(OBERSTDORF_LARGE.name).toContain('INSPIROWANA')
    expect(OBERSTDORF_LARGE.inrun.keyframes).not.toEqual(ZAKOPANE_LARGE.inrun.keyframes)
    expect(OBERSTDORF_LARGE.landingKeyframes).not.toEqual(ZAKOPANE_LARGE.landingKeyframes)
    for (const [marker, meters] of [['pPoint', 104], ['kPoint', 120], ['hillSize', 137], ['uPoint', 182], ['fallLine', 218]] as const) {
      expect(hill.markers[marker]).toEqual(hill.surfacePositionAt(meters))
    }
    for (const meters of [0, 5, 42, 104, 120, 137, 145.5, 182, 218, 270]) {
      expect(hill.surfaceDistanceAtPoint(hill.surfacePositionAt(meters))).toBeCloseTo(meters, 1)
    }
    expect(hill.inrunCurve.lastPoint.x).toBeCloseTo(0, 8)
    expect(hill.inrunCurve.lastPoint.y).toBeCloseTo(0, 8)
    expect(hill.landingCurve.lastPoint).toEqual(hill.outrunCurve.firstPoint)
  })

  it('osobne belki i sensory; FIS F11 10,80/16,20 i ADAPT 7,56→7,6; coach 130 m', () => {
    expect(hill.gates).toHaveLength(29)
    expect(hill.gate(1).inrunLengthMeters).toBe(74)
    expect(hill.gate(29).inrunLengthMeters).toBeCloseTo(94.16)
    expect(() => hill.gate(30)).toThrow()
    expect(hill.spec.windMeasurement.sensors).toEqual([{ distanceMeters: 42, weight: 0.3 }, { distanceMeters: 91, weight: 0.4 }, { distanceMeters: 132, weight: 0.3 }])
    expect(hill.spec.compensation).toMatchObject({ provenance: 'simulation-calibrated', headWindFactorTenthsPerMps: 108, tailWindFactorTenthsPerMps: 162, gateFactorTenthsPerInrunMeter: 76, coachThresholdHalfMeters: 260 })
    expect(hill.spec.compensation.sourceRefs.some(ref => ref.includes('2026JP3103RLQ.pdf'))).toBe(true)
    expect(estimateSkilledDistanceMeters(hill, 1, 0)).toBe(hill.spec.safety.referenceDistanceMeters)
    expect(hsStabilityMultiplier(hill, 'parallel', hill.spec.safety.parallelImpossibleMeters)).toBe(0)
    expect(hsStabilityMultiplier(hill, 'telemark', 145.5)).toBeLessThan(hsStabilityMultiplier(hill, 'parallel', 145.5))
  })
})

describe('H03 — pilot i lądowanie deterministyczne', () => {
  it('AUTO dla −2..+2 dobiera belkę pod HS w obu kierunkach wiatru', () => {
    expect(run({ gate: 1, wind: 0 }).measuredDistanceMeters).toBeCloseTo(94.53929356403995, 6)
    const probes = [-2, -1, 0, 1, 2].map(wind => {
      const selected = selectSafeJuryGate(hill, wind)
      const sim = run({ gate: selected.gateNumber, wind })
      expect(sim.finished).toBe(true)
      expect(sim.outcome?.status).toBe('landed')
      expect(sim.measuredDistanceMeters ?? 0).toBeGreaterThan(125)
      expect(sim.measuredDistanceMeters ?? 999).toBeLessThan(137)
      return selected.gateNumber
    })
    for (let i = 1; i < probes.length; i += 1) expect(probes[i]).toBeLessThanOrEqual(probes[i - 1]!)
    expect(probes).toEqual([22, 19, 16, 15, 14])
  })

  it('timing, oba style, przedwczesne lądowanie i twardy limit >HS', () => {
    const early = run({ gate: 15, wind: 0, offset: -6 })
    const good = run({ gate: 15, wind: 0 })
    const late = run({ gate: 15, wind: 0, offset: 6 })
    expect(early.takeoffTimingOffsetSeconds).toBeGreaterThan(0)
    expect(good.perfectTakeoff).toBe(true)
    expect(late.takeoffTimingOffsetSeconds).toBeLessThan(0)
    expect(good.takeoffNormalSpeed).toBeGreaterThan(early.takeoffNormalSpeed)
    expect(good.takeoffNormalSpeed).toBeGreaterThan(late.takeoffNormalSpeed)
    for (const style of ['parallel', 'telemark'] as const) {
      const sim = run({ gate: 15, wind: 0, style })
      expect(sim.landingStyle).toBe(style)
      expect(sim.outcome?.status).toBe('landed')
    }
    const premature = run({ gate: 15, wind: 0, prep: 0, style: 'telemark' })
    expect(premature.landingApproachEarly).toBe(true)
    expect(premature.earlyTelemarkFallback).toBe(true)
    expect(premature.landingStyle).toBe('parallel')
    expect((good.measuredDistanceMeters ?? 0) - (premature.measuredDistanceMeters ?? 0)).toBeGreaterThan(5)
    const extreme = run({ gate: 29, wind: 2, style: 'telemark' })
    expect(extreme.measuredDistanceMeters ?? 0).toBeGreaterThan(150)
    expect(extreme.outcome?.status).toBe('fall')
  })

  it('rekord JP 143,5 + 2 m: czysto na dwie nogi, po zapisie do 0,5 m, powtarzalnie', async () => {
    const trial = { gate: 25, wind: 0.5, offset: 0, prep: 3.9, style: 'parallel' as const }
    const first = run(trial)
    const result = createTrainingJumpResult(first, 1)
    expect(first.outcome?.status).toBe('landed')
    expect(first.landingStyle).toBe('parallel')
    expect(first.contact?.supportHands).toBe(0)
    expect(result.distanceHalfMeters).toBeGreaterThanOrEqual(291)
    const again = run(trial)
    expect(again.contact).toEqual(first.contact)
    expect(again.events).toEqual(first.events)
    expect(createTrainingJumpResult(again, 1)).toEqual(result)
    const session = new CompetitionSession(hill, 1, 'normal')
    const competitionResult = createCompetitionJumpResult(first, {
      competitionId: session.state.id, roundId: 'qualification', participantId: 'local-01', juryGateNumber: trial.gate,
      coachRequested: false, coachDecisionPhase: 'red', sessionRevision: 1,
    })
    expect(competitionResult.status).toBe('landed')
    expect(competitionResult.distanceHalfMeters).toBeGreaterThanOrEqual(291)
    const db = await openGameDatabase(new IDBFactory())
    expect(await commitAttempt(db, {
      session: { ...session.toStoredSession(1000), revision: 1 }, result: competitionResult, replay: null,
      recordCandidate: { context: 'competition', status: competitionResult.status, distanceHalfMeters: competitionResult.distanceHalfMeters, versions: competitionResult.versions },
      ownerId: 'h03-record-test', nowMs: 1000,
    })).toMatchObject({ ok: true, recordUpdated: true })
    expect((await loadOfficialRecord(db, recordKey(competitionResult.versions)))?.distanceHalfMeters).toBeGreaterThanOrEqual(291)
    db.close()
  })

  it('sąsiednie długie mniej precyzyjne próby częściej wymagają podpórki niż są czyste', () => {
    let clean = 0
    let supported = 0
    for (const gate of [23, 25, 27, 29]) for (const wind of [-1, 0, 0.5, 1]) for (const offset of [-6, -4, -2, 0, 2, 4, 6]) for (const prep of [2.5, 2.9, 3.2, 3.6, 3.9]) {
      const sim = run({ gate, wind, offset, prep })
      const meters = sim.measuredDistanceMeters ?? 0
      if (meters < 145.5 || meters > 151 || sim.outcome?.status !== 'landed' || (offset === 0 && prep >= 3.6)) continue
      if (sim.contact?.supportHands === 0) clean += 1
      else supported += 1
    }
    expect({ clean, supported }).toEqual({ clean: 39, supported: 43 })
  })
})

describe('H03 — katalog, AI, zapis, replay', () => {
  it('seed, różne trudności i watched==fast z własnym edge H03', () => {
    const medians: number[] = []
    for (const difficulty of ['easy', 'normal', 'hard'] as const) {
      const distances: number[] = []
      let falls = 0
      for (let i = 0; i < 20; i += 1) {
        const windField = createWindField(0x45ab_3003 + i)
        const gate = selectSafeJuryGate(hill, forecastWindMean(windField, hill)).gateNumber
        const original = createAiPlan(aiSeedForJump(0xa11ce + i, `bot-${i}`, 'qualification'), difficulty, hill.spec.id)
        const plan = h03CompetitionAiPlan(original)
        expect(plan.seed).toBe(original.seed)
        const config = { plan, gateNumber: gate, jumpConfig: { hill }, windField }
        const fast = simulateAiJump(config, 'fast')
        expect(fast.finished).toBe(true)
        distances.push(fast.measuredDistanceMeters ?? 0)
        if (fast.outcome?.status === 'fall') falls += 1
        if (i === 0) {
          const watched = simulateAiJump({ ...config, windField: createWindField(0x45ab_3003 + i) }, 'watched')
          expect(watched.events).toEqual(fast.events)
          expect(watched.outcome).toEqual(fast.outcome)
          expect(watched.measuredDistanceMeters).toBe(fast.measuredDistanceMeters)
        }
      }
      distances.sort((a, b) => a - b)
      medians.push(distances[9] ?? 0)
      expect(falls).toBeLessThanOrEqual(4)
    }
    expect(medians[0]).toBeGreaterThan(120)
    expect(medians[1]).toBeGreaterThan(125)
    expect(medians[2]).toBeGreaterThan(130)
    expect(medians[1]! - medians[0]!).toBeGreaterThan(3)
    expect(medians[2]! - medians[1]!).toBeGreaterThan(3)
  })

  it('czwarta po H02; wersjonowane sesje izolowane od pozostałych', () => {
    expect(PLAYABLE_HILL_SPECS).toEqual([TECHNICAL_K120, LILLEHAMMER_NORMAL, ZAKOPANE_LARGE, OBERSTDORF_LARGE, buildHillById('h04-planica-flying').spec])
    expect(buildHillById(hill.spec.id).spec).toBe(OBERSTDORF_LARGE)
    expect(hillCompetitionSessionId(hill.spec.id)).toBe(H03_COMPETITION_SESSION_ID)
    const session = new CompetitionSession(hill, 1, 'normal')
    expect(session.state.id).toBe(H03_COMPETITION_SESSION_ID)
    expect(session.snapshot().juryGateNumber).toBeGreaterThan(1)
    const stored = session.toStoredSession(1000)
    expect(validateStoredSession(stored).ok).toBe(true)
    expect(() => assertSessionMatchesHill(stored, hill.spec.id)).not.toThrow()
    expect(() => new CompetitionSession(hill, 1, 'normal', false, stored)).not.toThrow()
    for (const other of PLAYABLE_HILL_SPECS.filter(s => s.id !== hill.spec.id)) {
      expect(() => assertSessionMatchesHill(stored, other.id)).toThrow()
      expect(() => new CompetitionSession(buildHill(other), 1, 'normal', false, stored)).toThrow()
    }
    const old = { ...stored, versions: { ...stored.versions, hill: 'h03-inspired-0' } }
    expect(() => assertSessionMatchesHill(old, hill.spec.id)).toThrow()
    expect(() => new CompetitionSession(hill, 1, 'normal', false, old)).toThrow()
    const oldNested = { ...stored, competition: { ...stored.competition, versions: { ...stored.competition.versions, hill: 'h03-inspired-0' } } }
    expect(() => assertSessionMatchesHill(oldNested, hill.spec.id)).toThrow()
    expect(() => new CompetitionSession(hill, 1, 'normal', false, oldNested)).toThrow()
  })

  it('atomowy commit, izolacja rekordu i odtwarzanie oryginalnych próbek bez ponownej symulacji', async () => {
    const session = new CompetitionSession(hill, 1, 'normal')
    const windField = createWindField(0x5a17c0de)
    const gate = selectSafeJuryGate(hill, forecastWindMean(windField, hill)).gateNumber
    const sim = new JumpSimulation({ hill, gateNumber: gate, windField, autoStart: true })
    const recorder = new JumpRecorder(sim, {
      sessionId: session.state.id, competitionId: session.state.id,
      roundId: 'qualification', participantId: 'local-01', participantName: 'Test', juryGateNumber: gate, coachRequested: false,
    })
    const takeoffTick = edgeTick(gate) - Math.round(DEFAULT_JUMP_PARAMS.takeoff.idealLeadSeconds / SIM_DT)
    let prepped = false
    for (let guard = 0; guard < 20_000 && !sim.finished; guard += 1) {
      const pressed: ('takeoff' | 'parallel')[] = []
      const held: ('left' | 'right')[] = []
      if (sim.tick === takeoffTick) pressed.push('takeoff')
      if (sim.phase === 'Flight') {
        const desired = Math.atan2(sim.velocity.y, sim.velocity.x) * 180 / Math.PI + 32
        const current = sim.targetPitchRad * 180 / Math.PI
        if (current > desired + 0.5) held.push('right')
        else if (current < desired - 0.5) held.push('left')
        if (!prepped && sim.flightSeconds >= 3.4) { pressed.push('parallel'); prepped = true }
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
    expect(validateStoredReplay(replay).ok).toBe(true)
    expect(() => assertReplayMatchesHill(replay, hill.spec.id)).not.toThrow()
    expect(() => assertReplayMatchesHill(replay, ZAKOPANE_LARGE.id)).toThrow()
    expect(replayVisualsCompatible(replay, hill.spec.hillVersion, hill.spec.id)).toBe(true)
    const player = new ReplayPlayer(replay)
    player.scrub(player.lastTick - player.firstTick)
    expect(player.frame().phase).toBe(sim.phase)
    expect(player.replay.recordedResult.distanceHalfMeters).toBe(result.distanceHalfMeters)
    const old = { ...replay, versions: { ...replay.versions, hill: 'h03-inspired-0' } }
    expect(validateStoredReplay(old).ok).toBe(true)
    expect(() => assertReplayMatchesHill(old, hill.spec.id)).toThrow()
    expect(replayVisualsCompatible(old, hill.spec.hillVersion, hill.spec.id)).toBe(false)
    expect(new ReplayPlayer(old).frame().tick).toBe(0)
    const db = await openGameDatabase(new IDBFactory())
    const saved = await commitAttempt(db, {
      session: { ...session.toStoredSession(1000), revision: 1 }, result, replay,
      recordCandidate: { context: 'competition', status: result.status, distanceHalfMeters: result.distanceHalfMeters, versions: result.versions },
      ownerId: 'h03-test', nowMs: 1000,
    })
    expect(saved).toMatchObject({ ok: true, applied: true, recordUpdated: true })
    expect(await countStore(db, STORE.results)).toBe(1)
    expect(await loadSession(db, H03_COMPETITION_SESSION_ID)).toMatchObject({ kind: 'ok', session: { hillId: hill.spec.id } })
    expect((await loadLatestReplay(db)).kind).toBe('ok')
    expect((await loadOfficialRecord(db, recordKey(result.versions)))?.distanceHalfMeters).toBe(result.distanceHalfMeters)
    expect(await loadOfficialRecord(db, recordKey({ ...result.versions, hill: ZAKOPANE_LARGE.hillVersion }))).toBeUndefined()
    db.close()
  })
})
