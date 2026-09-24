/**
 * P21-H01 — playable Lillehammer-inspired K90/HS98 + tech K120 regression.
 *
 * Deterministic, no E2E. Probes use shared DEFAULT physics untouched;
 * H01 geometry and safety are explicit game ADAPT, not FIS homologation.
 */
import { describe, expect, it } from 'vitest'
import { buildHill, TECHNICAL_K120, validateHill } from '../src/simulation/technicalHill'
import { LILLEHAMMER_NORMAL } from '../src/simulation/hills/lillehammerNormal'
import { JumpSimulation, SIM_DT } from '../src/simulation/jump'
import { DEFAULT_JUMP_PARAMS } from '../src/simulation/params'
import { hsStabilityMultiplier, selectSafeJuryGate, estimateSkilledDistanceMeters, forecastWindMean } from '../src/sport/safety'
import { makeInput, EMPTY_INPUT } from './support/jumpHarness'
import { replayVisualsCompatible } from '../src/replay/player'
import { createCompetitionJumpResult, createTrainingJumpResult } from '../src/sport/jumpResult'
import { CompetitionSession, COMPETITION_SESSION_ID } from '../src/app/competitionSession'
import { validateStoredSession } from '../src/storage/schema'
import { aiSeedForJump, createAiPlan, simulateAiJump } from '../src/sport/ai'
import { createWindField } from '../src/simulation/wind'
import {
  HILL_SPECS,
  PLAYABLE_HILL_SPECS,
  PROVISIONAL_HILL_SPECS,
  H01_COMPETITION_SESSION_ID,
  assertReplayMatchesHill,
  assertSessionMatchesHill,
  buildHillById,
  hillCompetitionSessionId,
  hillSpecById,
  isPlayableHillId,
} from '../src/app/hills'

const h01Hill = buildHill(LILLEHAMMER_NORMAL)
const techHill = buildHill()

function edgeTick(hill: typeof h01Hill, gate: number): number {
  const probe = new JumpSimulation({ hill, gateNumber: gate, autoStart: true })
  while (probe.phase === 'Inrun' || probe.phase === 'Takeoff') probe.step(EMPTY_INPUT)
  return probe.tick
}

function steadyWind(userMps: number) {
  return {
    seed: 7,
    version: 'h01-probe',
    sampleUserMetersPerSecond: () => userMps,
  } as unknown as ReturnType<typeof import('../src/simulation/wind').createWindField>
}

function runH01(options: {
  hill?: typeof h01Hill
  gate?: number
  offsetTicks?: number
  style?: 'telemark' | 'parallel' | null
  prepFlightSeconds?: number
  windMps?: number
  windField?: ReturnType<typeof createWindField>
  pilot?: 'ideal' | 'none'
}): JumpSimulation {
  const hill = options.hill ?? h01Hill
  const gate = options.gate ?? 1
  const params = DEFAULT_JUMP_PARAMS
  const edge = edgeTick(hill, gate)
  const takeoffTick = edge - Math.round(params.takeoff.idealLeadSeconds / SIM_DT) + (options.offsetTicks ?? 0)
  const windField = options.windField ?? (options.windMps === undefined ? undefined : steadyWind(options.windMps))
  const sim = new JumpSimulation({ hill, gateNumber: gate, autoStart: true, params, windField })
  const style = options.style ?? 'telemark'
  const prepAt = options.prepFlightSeconds ?? 3.2
  let prepped = false
  for (let guard = 0; guard < 20000 && !sim.finished; guard += 1) {
    const pressed: ('takeoff' | 'telemark' | 'parallel')[] = []
    const held: ('left' | 'right')[] = []
    if (sim.tick === takeoffTick) pressed.push('takeoff')
    if (sim.phase === 'Flight') {
      if (options.pilot !== 'none') {
        const flowDeg = (Math.atan2(sim.velocity.y, sim.velocity.x) * 180) / Math.PI
        const desired = flowDeg + 32
        const cur = (sim.targetPitchRad * 180) / Math.PI
        if (cur > desired + 0.5) held.push('right')
        else if (cur < desired - 0.5) held.push('left')
      }
      if (!prepped && style && sim.flightSeconds >= prepAt) {
        pressed.push(style)
        prepped = true
      }
    }
    sim.step(makeInput(pressed as never[], held as never[], sim.tick))
  }
  return sim
}

describe('P21-H01 — kalibracja gry', () => {
  it('rekord 107,5 m można pobić na dwóch nogach bez podpórki, ale podpórka przeważa w paśmie', () => {
    const cleanInput = { gate: 12, windMps: 1, offsetTicks: 0, style: 'parallel' as const, prepFlightSeconds: 3.2 }
    const clean = runH01(cleanInput)
    expect(clean.outcome?.status).toBe('landed')
    expect(clean.landingStyle).toBe('parallel')
    expect(clean.contact?.supportHands).toBe(0)
    expect(createTrainingJumpResult(clean, 1).distanceHalfMeters).toBeGreaterThanOrEqual(219)
    expect(runH01(cleanInput).measuredDistanceMeters).toBe(clean.measuredDistanceMeters)

    let cleanCount = 0
    let supportCount = 0
    for (const gate of [10, 12, 14, 16, 18, 20]) for (const windMps of [-1, 0, 1, 2]) for (const offsetTicks of [-2, 0, 2]) for (const prepFlightSeconds of [2.4, 2.8, 3.2, 3.5]) {
      const sim = runH01({ gate, windMps, offsetTicks, style: 'parallel', prepFlightSeconds })
      const distance = sim.measuredDistanceMeters ?? 0
      if (distance < 109.5 || distance > 113 || sim.outcome?.status !== 'landed') continue
      if (sim.contact?.supportHands === 0) cleanCount += 1
      else supportCount += 1
    }
    expect(cleanCount).toBeGreaterThan(0)
    expect(supportCount).toBeGreaterThan(cleanCount)
    expect(hsStabilityMultiplier(h01Hill, 'telemark', 109.5)).toBeLessThan(hsStabilityMultiplier(h01Hill, 'parallel', 109.5))
  })

  it('AUTO H01 dodaje dwie belki przy wietrze w plecy', () => {
    const probes = [-2, -1, 0, 1, 2].map((windMps) => {
      const choice = selectSafeJuryGate(h01Hill, windMps)
      const sim = runH01({ gate: choice.gateNumber, windMps })
      expect(sim.outcome?.status).toBe('landed')
      expect(sim.measuredDistanceMeters ?? 0).toBeGreaterThan(85)
      expect(sim.measuredDistanceMeters ?? 999).toBeLessThan(105)
      return choice.gateNumber
    })
    expect(probes).toEqual([12, 10, 5, 5, 4])
    const slightTailwind = selectSafeJuryGate(h01Hill, -0.01)
    expect(slightTailwind.gateNumber).toBe(selectSafeJuryGate(h01Hill, 0).gateNumber + 2)
    expect(slightTailwind.estimatedDistanceMeters).toBeCloseTo(
      estimateSkilledDistanceMeters(h01Hill, slightTailwind.gateNumber, -0.01),
    )
  })

  it('AI zachowuje różnice trudności i nie zamienia konkursu w serię upadków', () => {
    const medians: number[] = []
    for (const difficulty of ['easy', 'normal', 'hard'] as const) {
      const samples = Array.from({ length: 30 }, (_, index) => {
        const field = createWindField(0x45ab_2002 + index)
        const gate = selectSafeJuryGate(h01Hill, forecastWindMean(field, h01Hill)).gateNumber
        const plan = createAiPlan(aiSeedForJump(0xa11ce + index, `bot-${index}`, 'qualification'), difficulty, h01Hill.spec.id)
        const sim = simulateAiJump({ plan, gateNumber: gate, windField: field, jumpConfig: { hill: h01Hill } }, 'fast')
        expect(sim.finished).toBe(true)
        return { distance: sim.measuredDistanceMeters ?? 0, status: sim.outcome?.status, gate }
      })
      const distances = samples.map((sample) => sample.distance).sort((a, b) => a - b)
      medians.push(distances[14] ?? 0)
      expect(samples.filter((sample) => sample.status === 'fall').length).toBeLessThanOrEqual(difficulty === 'easy' ? 8 : 2)
    }
    expect(medians[0] ?? 0).toBeGreaterThan(70)
    expect(medians[1] ?? 0).toBeGreaterThan(medians[0] ?? 0)
    expect(medians[2] ?? 0).toBeGreaterThan(medians[1] ?? 0)
  })
})

describe('P21-H01 — dane Lillehammer inspirowana', () => {
  it('trzyma jawny profil gry z K90/HS98', () => {
    expect(validateHill(h01Hill)).toEqual([])
    expect(LILLEHAMMER_NORMAL.id).toBe('h01-lillehammer-normal')
    expect(LILLEHAMMER_NORMAL.hillVersion).toBe('h01-inspired-4')
    expect(LILLEHAMMER_NORMAL.name).toContain('INSPIROWANA')
    expect(LILLEHAMMER_NORMAL.classification).toBe('normal')
    expect(LILLEHAMMER_NORMAL.kPointMeters).toBe(90)
    expect(LILLEHAMMER_NORMAL.hillSizeMeters).toBe(98)
    expect(LILLEHAMMER_NORMAL.pPointMeters).toBeCloseTo(82.67, 9)
    expect(LILLEHAMMER_NORMAL.tableClearanceMeters).toBeCloseTo(2.76, 9)
    expect(LILLEHAMMER_NORMAL.inrun.lengthMeters).toBeCloseTo(87.98, 9)
    expect(LILLEHAMMER_NORMAL.uPointMeters).toBe(168)
    expect(LILLEHAMMER_NORMAL.fallLineMeters).toBe(193)
    expect(LILLEHAMMER_NORMAL.outrunEndMeters).toBe(268)
    expect(-h01Hill.markers.uPoint.y).toBeCloseTo(66.6, 0)
  })

  it('trzyma porządek T/P/K/HS/U/fall-line i monotoniczną mapę', () => {
    const s = LILLEHAMMER_NORMAL
    expect(s.pPointMeters).toBeLessThan(s.kPointMeters)
    expect(s.kPointMeters).toBeLessThan(s.hillSizeMeters)
    expect(s.hillSizeMeters).toBeLessThan(s.uPointMeters)
    expect(s.uPointMeters).toBeLessThan(s.fallLineMeters)
    expect(s.fallLineMeters).toBeLessThanOrEqual(s.outrunEndMeters)
    expect(h01Hill.markers.tableEdge).toEqual({ x: 0, y: 0 })
    expect(h01Hill.inrunCurve.lastPoint.x).toBeCloseTo(0, 9)
    expect(h01Hill.inrunCurve.lastPoint.y).toBeCloseTo(0, 9)
    expect(h01Hill.landingCurve.lastPoint.x).toBeCloseTo(h01Hill.outrunCurve.firstPoint.x, 9)
    expect(h01Hill.landingCurve.lastPoint.y).toBeCloseTo(h01Hill.outrunCurve.firstPoint.y, 9)
    for (const m of [0, 20, 82.67, 90, 98, 120, 168, 193, 260]) {
      const p = h01Hill.surfacePositionAt(m)
      expect(h01Hill.surfaceDistanceAtPoint(p)).toBeCloseTo(m, 1)
    }
  })

  it('ma 25 uporządkowanych belek TUNE co 0,79 m', () => {
    expect(h01Hill.gates).toHaveLength(25)
    expect(h01Hill.gates.map((g) => g.number)).toEqual(Array.from({ length: 25 }, (_, i) => i + 1))
    expect(h01Hill.gate(10).inrunLengthMeters).toBeCloseTo(73.11, 9)
    expect(h01Hill.gate(25).inrunLengthMeters).toBeCloseTo(84.96, 9)
    expect(h01Hill.gate(1).inrunLengthMeters).toBe(66)
    for (let n = 1; n < 25; n += 1) {
      expect(h01Hill.gate(n + 1).inrunLengthMeters - h01Hill.gate(n).inrunLengthMeters).toBeCloseTo(0.79, 9)
    }
    expect(h01Hill.gate(1).inrunLengthMeters).toBeGreaterThan(0)
    expect(h01Hill.gate(25).inrunLengthMeters).toBeLessThan(LILLEHAMMER_NORMAL.inrun.lengthMeters)
    expect(() => h01Hill.gate(26)).toThrow()
  })

  it('trzyma kąty certyfikatu w P/K/L i stół 6.1 m', () => {
    const slope = (m: number) => (h01Hill.surfaceSlopeRadAt(m) * 180) / Math.PI
    expect(slope(82.67)).toBeCloseTo(36.5, 0)
    expect(slope(90)).toBeCloseTo(34.7, 0)
    expect(slope(98)).toBeCloseTo(32.8, 0)
    expect(slope(168)).toBeCloseTo(0, 0)
    const kf = LILLEHAMMER_NORMAL.inrun.keyframes
    expect(kf[0]?.slopeDeg).toBe(35)
    expect(kf[kf.length - 1]?.slopeDeg).toBe(11.2)
    expect(LILLEHAMMER_NORMAL.inrun.lengthMeters - (kf[kf.length - 2]?.distanceMeters ?? 0)).toBeCloseTo(6.1, 1)
  })

  it('ma sensory 35/70/95 z wagami .3/.4/.3', () => {
    expect(LILLEHAMMER_NORMAL.windMeasurement.sensors).toEqual([
      { distanceMeters: 35, weight: 0.3 },
      { distanceMeters: 70, weight: 0.4 },
      { distanceMeters: 95, weight: 0.3 },
    ])
  })

  it('ma oficjalne kompensaty i proweniencję ze źródłami', () => {
    const c = LILLEHAMMER_NORMAL.compensation
    expect(c.provenance).toBe('official-reference')
    expect(c.headWindFactorTenthsPerMps).toBe(80)
    expect(c.tailWindFactorTenthsPerMps).toBe(120)
    expect(c.gateFactorTenthsPerInrunMeter).toBe(70)
    expect(c.referenceGateNumber).toBe(1)
    expect(c.coachThresholdHalfMeters).toBe(186)
    expect(c.coachThresholdHalfMeters).toBe(Math.floor(98 * 0.95 * 2 + 1e-9))
    expect(c.sourceRefs).toContain('docs/hills/H01.md')
    expect(c.sourceRefs.some((s) => s.includes('lillehammer-hs98-certificate-2022.pdf'))).toBe(true)
    expect(c.sourceRefs.some((s) => s.includes('lillehammer-2022-12-03-women-wc.pdf'))).toBe(true)
  })

  it('ma deterministyczne granice lądowania TUNE dla gry', () => {
    const s = LILLEHAMMER_NORMAL.safety
    expect(s.referenceGateNumber).toBe(1)
    expect(s.referenceDistanceMeters).toBe(84)
    expect(s.safeTargetMeters).toBe(97.5)
    expect(s.autoHeadwindEffectScale).toBe(0.5)
    expect(s.telemarkImpossibleMeters).toBe(112)
    expect(s.parallelImpossibleMeters).toBe(120)
    expect(s.telemarkImpossibleMeters).toBeGreaterThan(98)
    expect(s.parallelImpossibleMeters).toBeGreaterThan(s.telemarkImpossibleMeters)
    // Rekord zimowy 107.5 m ma dodatni margines dla obu stylów.
    expect(hsStabilityMultiplier(h01Hill, 'telemark', 107.5)).toBeGreaterThan(0)
    expect(hsStabilityMultiplier(h01Hill, 'parallel', 107.5)).toBeGreaterThan(0)
    expect(hsStabilityMultiplier(h01Hill, 'telemark', 98)).toBe(1)
    expect(hsStabilityMultiplier(h01Hill, 'telemark', 112)).toBe(0)
    expect(hsStabilityMultiplier(h01Hill, 'parallel', 120)).toBe(0)
  })
})

describe('P21-H01 — deterministyczne skoki kontrolne', () => {
  it('umiejętny neutralny z belki 1 ląduje blisko 84 m i jest deterministyczny', () => {
    const sim = runH01({ gate: 1 })
    expect(sim.measuredDistanceMeters ?? 0).toBeGreaterThan(82)
    expect(sim.measuredDistanceMeters ?? 0).toBeLessThan(86)
    expect(sim.finished).toBe(true)
    expect(sim.phase).toBe('FinishLine')
    expect(sim.outcome?.status).toBe('landed')
    expect(sim.outcome?.terminalPhase).toBe('FinishLine')
    expect(sim.contact?.readiness).toBe(1)
    expect(sim.events.map((event) => event.type)).toContain('contact')
    expect(sim.events.some((event) => event.type === 'outrunStopped' || event.type === 'finishLine')).toBe(true)
    const repeat = runH01({ gate: 1 })
    expect(repeat.measuredDistanceMeters).toBe(sim.measuredDistanceMeters)
    expect(repeat.outcome?.status).toBe('landed')
  })

  it('wybicie zbyt wczesne, punktualne i spóźnione jest mierzalne i deterministyczne', () => {
    const early = runH01({ gate: 1, offsetTicks: -6 })
    const onTime = runH01({ gate: 1, offsetTicks: 0 })
    const late = runH01({ gate: 1, offsetTicks: 6 })

    expect(early.takeoffTimingOffsetSeconds).toBeGreaterThan(0)
    expect(Math.abs(onTime.takeoffTimingOffsetSeconds ?? Number.POSITIVE_INFINITY)).toBeLessThanOrEqual(SIM_DT + 1e-9)
    expect(late.takeoffTimingOffsetSeconds).toBeLessThan(0)
    expect(early.perfectTakeoff).toBe(false)
    expect(onTime.perfectTakeoff).toBe(true)
    expect(late.perfectTakeoff).toBe(false)
    expect(onTime.takeoffNormalSpeed).toBeGreaterThan(early.takeoffNormalSpeed)
    expect(onTime.takeoffNormalSpeed).toBeGreaterThan(late.takeoffNormalSpeed)

    const earlyRepeat = runH01({ gate: 1, offsetTicks: -6 })
    const onTimeRepeat = runH01({ gate: 1, offsetTicks: 0 })
    const lateRepeat = runH01({ gate: 1, offsetTicks: 6 })
    expect(earlyRepeat.takeoffTimingOffsetSeconds).toBe(early.takeoffTimingOffsetSeconds)
    expect(onTimeRepeat.takeoffTimingOffsetSeconds).toBe(onTime.takeoffTimingOffsetSeconds)
    expect(lateRepeat.takeoffTimingOffsetSeconds).toBe(late.takeoffTimingOffsetSeconds)
    expect(earlyRepeat.takeoffNormalSpeed).toBe(early.takeoffNormalSpeed)
    expect(onTimeRepeat.takeoffNormalSpeed).toBe(onTime.takeoffNormalSpeed)
    expect(lateRepeat.takeoffNormalSpeed).toBe(late.takeoffNormalSpeed)
  })

  it('wczesne przygotowanie skraca lot vs późne (kara podejścia)', () => {
    const late = runH01({ gate: 1, prepFlightSeconds: 3.2 })
    const early = runH01({ gate: 1, prepFlightSeconds: 0 })
    expect((late.measuredDistanceMeters ?? 0) - (early.measuredDistanceMeters ?? 0)).toBeGreaterThan(5)
    expect(early.landingApproachEarly).toBe(true)
    const repeat = runH01({ gate: 1, prepFlightSeconds: 0 })
    expect(repeat.measuredDistanceMeters).toBe(early.measuredDistanceMeters)
  })

  it('oba style lądowania lądują z belki 1 deterministycznie', () => {
    const tele = runH01({ gate: 1, style: 'telemark' })
    const para = runH01({ gate: 1, style: 'parallel' })
    expect(tele.outcome?.status).toBe('landed')
    expect(para.outcome?.status).toBe('landed')
    expect(tele.landingStyle).toBe('telemark')
    expect(para.landingStyle).toBe('parallel')
    expect(runH01({ gate: 1, style: 'parallel' }).measuredDistanceMeters).toBe(para.measuredDistanceMeters)
  })

  it('wiatr pod narty wydłuża vs w plecy (ten sam gate, deterministycznie)', () => {
    const head = runH01({ gate: 1, windMps: 1 })
    const tail = runH01({ gate: 1, windMps: -1 })
    expect(head.measuredDistanceMeters ?? 0).toBeGreaterThan(tail.measuredDistanceMeters ?? 0)
    expect(runH01({ gate: 1, windMps: 1 }).measuredDistanceMeters).toBe(head.measuredDistanceMeters)
    expect(runH01({ gate: 1, windMps: -1 }).measuredDistanceMeters).toBe(tail.measuredDistanceMeters)
  })

  it('skrajne belki: 1 ląduje, 25 pada za progami deterministycznie', () => {
    const low = runH01({ gate: 1 })
    const high = runH01({ gate: 25 })
    expect(low.outcome?.status).toBe('landed')
    expect(high.measuredDistanceMeters ?? 0).toBeGreaterThan(112)
    expect(high.contact?.hsStabilityMultiplier).toBe(0)
    expect(high.outcome?.status).toBe('fall')
    expect(runH01({ gate: 25 }).measuredDistanceMeters).toBe(high.measuredDistanceMeters)
  })

  it('AUTO gry jest monotoniczne i deterministyczne', () => {
    const gates = [-2, -1, 0, 1, 2].map((w) => selectSafeJuryGate(h01Hill, w).gateNumber)
    for (let i = 1; i < gates.length; i += 1) {
      expect(gates[i] ?? 99).toBeLessThanOrEqual(gates[i - 1] ?? 0)
    }
    expect(selectSafeJuryGate(h01Hill, 0)).toEqual(selectSafeJuryGate(h01Hill, 0))
    // Estymata na belce odniesienia wraca do odległości odniesienia.
    expect(estimateSkilledDistanceMeters(h01Hill, 1, 0)).toBe(84)
  })
})

describe('P21-H01 — grywalny katalog i tożsamość', () => {
  it('udostępnia techniczną K120 oraz inspirowaną H01', () => {
    expect(HILL_SPECS).toHaveLength(5)
    expect(HILL_SPECS.map((s) => s.id)).toEqual(['tech-k120-hs134', 'h01-lillehammer-normal', 'h02-zakopane-large', 'h03-oberstdorf-large', 'h04-planica-flying'])
    expect(HILL_SPECS.map((s) => s.hillVersion)).toEqual(['3.5.0', 'h01-inspired-4', 'h02-inspired-1', 'h03-inspired-1', 'h04-inspired-4'])
    expect(PLAYABLE_HILL_SPECS).toEqual([TECHNICAL_K120, LILLEHAMMER_NORMAL, expect.objectContaining({ id: 'h02-zakopane-large' }), expect.objectContaining({ id: 'h03-oberstdorf-large' }), expect.objectContaining({ id: 'h04-planica-flying', hillVersion: 'h04-inspired-4' })])
    expect(PROVISIONAL_HILL_SPECS).toEqual([])
    expect(isPlayableHillId('tech-k120-hs134')).toBe(true)
    expect(isPlayableHillId('h01-lillehammer-normal')).toBe(true)
    expect(isPlayableHillId('nie-ma')).toBe(false)
    expect(hillSpecById('tech-k120-hs134')).toBe(TECHNICAL_K120)
    expect(hillSpecById('h01-lillehammer-normal')).toBe(LILLEHAMMER_NORMAL)
    expect(() => hillSpecById('nie-ma')).toThrow()
    expect(buildHillById('h01-lillehammer-normal').spec.id).toBe('h01-lillehammer-normal')
  })

  it('identyfikatory sesji są hill-specific i rozłączne', () => {
    expect(COMPETITION_SESSION_ID).toBe('standard-tech-k120-1')
    expect(H01_COMPETITION_SESSION_ID).toBe('standard-h01-lillehammer-normal-5')
    expect(hillCompetitionSessionId('tech-k120-hs134')).toBe(COMPETITION_SESSION_ID)
    expect(hillCompetitionSessionId('h01-lillehammer-normal')).toBe(H01_COMPETITION_SESSION_ID)
    expect(hillCompetitionSessionId('tech-k120-hs134')).not.toBe(hillCompetitionSessionId('h01-lillehammer-normal'))
    expect(() => hillCompetitionSessionId('nie-ma')).toThrow()
  })

  it('mismatch sesji odrzuca bezpiecznie (obie strony)', () => {
    const techSession = new CompetitionSession(techHill, 1, 'normal')
    const techStored = techSession.toStoredSession(1000)
    expect(techStored.hillId).toBe('tech-k120-hs134')
    expect(techStored.id).toBe(COMPETITION_SESSION_ID)
    expect(techStored.competition.id).toBe(COMPETITION_SESSION_ID)
    expect(() => assertSessionMatchesHill(techStored, 'tech-k120-hs134')).not.toThrow()
    expect(() => assertSessionMatchesHill(techStored, 'h01-lillehammer-normal')).toThrow()
    // Prawdziwa sesja H01 z hill-specific id (bez patchowania).
    const h01Session = new CompetitionSession(h01Hill, 1, 'normal', false, null, H01_COMPETITION_SESSION_ID)
    const h01Stored = h01Session.toStoredSession(1000)
    expect(h01Stored.hillId).toBe('h01-lillehammer-normal')
    expect(h01Stored.id).toBe(H01_COMPETITION_SESSION_ID)
    expect(h01Stored.competition.id).toBe(H01_COMPETITION_SESSION_ID)
    expect(h01Stored.versions.hill).toBe('h01-inspired-4')
    expect(h01Stored.competition.versions.hill).toBe('h01-inspired-4')
    expect(() => assertSessionMatchesHill(h01Stored, 'h01-lillehammer-normal')).not.toThrow()
    expect(() => assertSessionMatchesHill(h01Stored, 'tech-k120-hs134')).toThrow()
    // Podmieniona wersja też odrzuca.
    const tampered = { ...techStored, versions: { ...techStored.versions, hill: 'h01-inspired-4' } }
    expect(() => assertSessionMatchesHill(tampered, 'tech-k120-hs134')).toThrow()
    const oldH01 = { ...h01Stored, versions: { ...h01Stored.versions, hill: 'h01-2022-cert-v1' } }
    expect(() => assertSessionMatchesHill(oldH01, 'h01-lillehammer-normal')).toThrow()
    // Konstruktor odrzuca restore z innej skoczni zanim użyje stanu.
    expect(() => new CompetitionSession(h01Hill, 1, 'normal', false, techStored)).toThrow()
    expect(() => new CompetitionSession(techHill, 1, 'normal', false, h01Stored)).toThrow()
    expect(() => new CompetitionSession(h01Hill, 1, 'normal', false, h01Stored)).not.toThrow()
    // Stary schema v1 bez hillId jest odrzucany ścieżką nieznanej wersji (bez migracji).
    const v1 = { ...techStored, schemaVersion: 1 }
    const v1Result = validateStoredSession(v1)
    expect(v1Result.ok).toBe(false)
    if (v1Result.ok === false) expect(v1Result.reason).toContain('nieznana wersja')
  })

  it('replay niesie hillId+hillVersion i mismatch jest wykrywany', () => {
    expect(isPlayableHillId(LILLEHAMMER_NORMAL.id)).toBe(true)
    const sim = runH01({ gate: 1 })
    const h01Result = createCompetitionJumpResult(sim, {
      competitionId: H01_COMPETITION_SESSION_ID,
      roundId: 'qualification',
      participantId: 'local-01',
      juryGateNumber: 1,
      coachRequested: false,
      coachDecisionPhase: 'red',
      sessionRevision: 1,
    })
    expect(h01Result.versions.hill).toBe('h01-inspired-4')
    // Minimalny replay H01 (próbki z symulacji) — tożsamość hill.
    const h01Replay = {
      schemaVersion: 1,
      id: h01Result.resultId,
      sessionId: H01_COMPETITION_SESSION_ID,
      kind: 'auto' as const,
      createdAtMs: 5000,
      formatVersion: 'pkg006-replay-1',
      versions: { rules: h01Result.versions.rules, physics: h01Result.versions.physics, hill: 'h01-inspired-4' },
      sampleHz: 30,
      initialState: {
        competitionId: H01_COMPETITION_SESSION_ID,
        roundId: 'qualification' as const,
        participantId: 'local-01',
        participantName: 'Test',
        gateNumber: 1,
        juryGateNumber: 1,
        coachRequested: false,
        windSeed: null,
        windVersion: null,
        hillId: 'h01-lillehammer-normal',
      },
      inputs: [],
      samples: [
        { tick: 0, x: 0, y: 0, pitchRad: 0, phase: 'Flight', speedKmh: 0, windUserMetersPerSecond: 0, heightAboveSurface: 0 },
        { tick: 4, x: 1, y: -1, pitchRad: 0, phase: 'Flight', speedKmh: 80, windUserMetersPerSecond: 0, heightAboveSurface: 5 },
      ],
      discreteEvents: [],
      recordedResult: h01Result,
    }
    expect(() => assertReplayMatchesHill(h01Replay, 'h01-lillehammer-normal')).not.toThrow()
    expect(() => assertReplayMatchesHill(h01Replay, 'tech-k120-hs134')).toThrow()
    expect(h01Replay.recordedResult).toEqual(h01Result)
    expect(replayVisualsCompatible(h01Replay, 'h01-inspired-4', 'h01-lillehammer-normal')).toBe(true)
    expect(replayVisualsCompatible(h01Replay, TECHNICAL_K120.hillVersion, TECHNICAL_K120.id)).toBe(false)
    expect(replayVisualsCompatible(h01Replay, 'h01-inspired-4', 'tech-k120-hs134')).toBe(false)
    expect(replayVisualsCompatible({ ...h01Replay, versions: { ...h01Replay.versions, hill: 'h01-2022-cert-v1' } }, 'h01-inspired-4', 'h01-lillehammer-normal')).toBe(false)
  })

})

describe('P21-H01 — regresja technicznej K120 (nienaruszona)', () => {
  it('wersje i kluczowe stałe bez zmian', () => {
    expect(TECHNICAL_K120.id).toBe('tech-k120-hs134')
    expect(TECHNICAL_K120.hillVersion).toBe('3.5.0')
    expect(TECHNICAL_K120.classification).toBe('large')
    expect(TECHNICAL_K120.kPointMeters).toBe(120)
    expect(TECHNICAL_K120.hillSizeMeters).toBe(134)
    expect(TECHNICAL_K120.inrun.gates).toHaveLength(21)
    expect(TECHNICAL_K120.compensation.headWindFactorTenthsPerMps).toBe(129)
    expect(TECHNICAL_K120.compensation.tailWindFactorTenthsPerMps).toBe(89)
    expect(TECHNICAL_K120.compensation.gateFactorTenthsPerInrunMeter).toBe(35)
    expect(TECHNICAL_K120.compensation.referenceGateNumber).toBe(17)
    expect(TECHNICAL_K120.safety.referenceGateNumber).toBe(17)
    expect(TECHNICAL_K120.safety.referenceDistanceMeters).toBe(138.1)
    expect(TECHNICAL_K120.safety.safeTargetMeters).toBe(127.0)
    expect(TECHNICAL_K120.safety.telemarkImpossibleMeters).toBe(147)
    expect(TECHNICAL_K120.safety.parallelImpossibleMeters).toBe(150)
    expect(validateHill(techHill)).toEqual([])
  })
})

describe('P21-H01 — AI używa edge właściwej skoczni (cache per hill)', () => {
  it('watched i fast na H01 identyczne; H01 nie bierze technicznego edge', () => {
    // Ten sam numer belki ma inny czas dojazdu na innej skoczni, więc klucz
    // wyłącznie po gate jest błędny. Najpierw grzejemy cache techniczny.
    const techEdge = edgeTick(techHill, 8)
    const h01Edge = edgeTick(h01Hill, 8)
    expect(techEdge).not.toBe(h01Edge)

    const techSeed = aiSeedForJump(0xa11ce, 'bot-017', 'qualification')
    const techWarm = simulateAiJump(
      { plan: createAiPlan(techSeed, 'normal'), gateNumber: 8, windField: createWindField(0x45ab_1001) },
      'fast',
    )
    expect(techWarm.events.some((event) => event.type === 'takeoffImpulseStart')).toBe(true)

    const seed = aiSeedForJump(0xa11ce, 'bot-017', 'qualification')
    const plan = createAiPlan(seed, 'normal')
    const windField = createWindField(0x45ab_2002)
    const base = { plan, gateNumber: 8, windField, jumpConfig: { hill: h01Hill } } as const
    const watched = simulateAiJump({ ...base, windField: createWindField(0x45ab_2002) }, 'watched')
    const fast = simulateAiJump({ ...base, windField: createWindField(0x45ab_2002) }, 'fast')

    expect(fast.events).toEqual(watched.events)
    expect(fast.outcome).toEqual(watched.outcome)
    expect(fast.measuredDistanceMeters).toBe(watched.measuredDistanceMeters)
    expect(fast.windMeasurement).toEqual(watched.windMeasurement)

    // Przy technicznym edge H01 (krótszy rozbieg) dostałaby spóźnione lub
    // zgubione wybicie i pasywny krótki upadek. Poprawny edge daje impuls,
    // timing zgodny z planem i dystans w kopercie H01.
    expect(watched.events.some((event) => event.type === 'takeoffImpulseStart')).toBe(true)
    const expectedOffsetSeconds = -plan.takeoffOffsetTicks * SIM_DT
    expect(Math.abs((watched.takeoffTimingOffsetSeconds ?? 999) - expectedOffsetSeconds)).toBeLessThan(2 * SIM_DT)
    expect(watched.measuredDistanceMeters ?? 0).toBeGreaterThan(60)
    expect(watched.measuredDistanceMeters ?? 0).toBeLessThan(120)

    const repeat = simulateAiJump({ ...base, windField: createWindField(0x45ab_2002) }, 'fast')
    expect(repeat.measuredDistanceMeters).toBe(watched.measuredDistanceMeters)
    expect(repeat.outcome).toEqual(watched.outcome)
  })
})
