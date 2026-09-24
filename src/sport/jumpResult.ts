/** P09/P12/P13 — redukcja zakończonej symulacji do pełnego wyniku treningowego. */

import type { JumpSimulation } from '../simulation/jump'
import { scoreCompensatedJump, type StartPhase } from './compensation'
import {
  MODERN_RULES,
  buildStyleJournal,
  distancePointsTenths,
  judgeMarksTenths,
  stylePointsTenths,
  truncateDistanceToHalfMeters,
  type StyleFault,
  type StyleFaultCode,
} from './scoring'

export type FeedbackCode = StyleFaultCode | 'clean'

export type TrainingJumpResult = {
  readonly resultId: string
  readonly participantId: 'local-player'
  readonly contextId: 'technical-training'
  readonly context: 'training'
  readonly attemptNumber: number
  readonly distanceHalfMeters: number
  readonly marksTenths: readonly [number, number, number, number, number]
  readonly droppedJudgeIndexes: readonly [number, number]
  readonly componentTenths: {
    readonly distance: number
    readonly style: number
    readonly wind: number
    readonly juryGate: number
    readonly coachGate: number
  }
  readonly collectiveTenths: number
  /** P13: pełna suma po rekompensatach i końcowym ograniczeniu do zera. */
  readonly totalTenths: number
  readonly status: 'landed' | 'fall'
  readonly landingSupportHands: 0 | 1 | 2
  readonly faults: readonly StyleFault[]
  readonly feedbackCode: FeedbackCode
  readonly reason: FeedbackCode
  readonly wind: {
    readonly seed: number | null
    readonly version: string | null
    readonly currentUserMetersPerSecond: number
    readonly measuredMeanUserMetersPerSecond: number
    readonly sampleCount: number
    readonly factorTenthsPerMps: number
  }
  readonly gate: {
    readonly referenceGateNumber: number
    readonly juryGateNumber: number
    readonly actualGateNumber: number
    readonly coachRequested: boolean
    readonly coachGateAwarded: boolean
    readonly thresholdHalfMeters: number
    readonly factorTenthsPerInrunMeter: number
    readonly provenance: 'official-reference' | 'simulation-calibrated'
  }
  readonly versions: {
    readonly rules: string
    readonly physics: string
    readonly hill: string
  }
}

export type CompetitionJumpResult = Omit<
  TrainingJumpResult,
  'participantId' | 'contextId' | 'context' | 'attemptNumber'
> & {
  readonly participantId: string
  readonly contextId: string
  readonly context: 'competition'
  readonly roundId: 'qualification' | 'first' | 'final'
}

function chooseFeedback(faults: readonly StyleFault[]): FeedbackCode {
  if (faults.length === 0) return 'clean'
  return [...faults].sort((left, right) => right.deductionTenths - left.deductionTenths)[0]?.code ?? 'clean'
}

/**
 * Kontrolowany upadek po `flightTimeout`: brak kontaktu, więc brak pomiaru.
 * Zwraca upadek z zerową odległością/gotowością i minimalnymi notami.
 * Status `fall` blokuje oficjalny rekord przez `isOfficialRecordCandidate`.
 */
function scoreFlightTimeout(
  sim: JumpSimulation,
  options: {
    readonly juryGateNumber: number
    readonly coachRequested: boolean
    readonly coachDecisionPhase: StartPhase
  },
) {
  const distanceHalfMeters = 0
  const marksTenths = [0, 0, 0, 0, 0] as const
  const style = stylePointsTenths([...marksTenths])
  const faults: StyleFault[] = [
    { category: 'landing', code: 'no-telemark', deductionTenths: 30, profileSensitive: false },
    { category: 'outrun', code: 'fall-before-fall-line', deductionTenths: 70, profileSensitive: false },
  ]
  const feedbackCode = chooseFeedback(faults)
  const compensation = sim.hill.spec.compensation
  const referenceGate = sim.hill.gate(compensation.referenceGateNumber)
  const juryGate = sim.hill.gate(options.juryGateNumber)
  const actualGate = sim.hill.gate(sim.gateNumber)
  const distance = distancePointsTenths(sim.hill.spec.kPointMeters, distanceHalfMeters)
  const windMean = sim.windMeasurement?.meanUserMetersPerSecond ?? sim.currentWindUserMetersPerSecond
  const compensated = scoreCompensatedJump(compensation, {
    distanceTenths: distance,
    styleTenths: style.pointsTenths,
    distanceHalfMeters,
    windUserMetersPerSecond: windMean,
    referenceInrunMeters: referenceGate.inrunLengthMeters,
    juryInrunMeters: juryGate.inrunLengthMeters,
    actualInrunMeters: actualGate.inrunLengthMeters,
    coachDecision: { requested: options.coachRequested, phase: options.coachDecisionPhase },
  })

  return {
    distanceHalfMeters,
    marksTenths: [...marksTenths] as unknown as readonly [number, number, number, number, number],
    droppedJudgeIndexes: style.droppedJudgeIndexes,
    componentTenths: compensated.componentTenths,
    collectiveTenths: compensated.collectiveTenths,
    totalTenths: compensated.totalTenths,
    status: 'fall' as const,
    landingSupportHands: 0 as const,
    faults,
    feedbackCode,
    reason: feedbackCode,
    wind: {
      seed: sim.windField?.seed ?? null,
      version: sim.windField?.version ?? null,
      currentUserMetersPerSecond: sim.currentWindUserMetersPerSecond,
      measuredMeanUserMetersPerSecond: windMean,
      sampleCount: sim.windMeasurement?.sampleCount ?? 0,
      factorTenthsPerMps:
        windMean >= 0
          ? compensation.headWindFactorTenthsPerMps
          : compensation.tailWindFactorTenthsPerMps,
    },
    gate: {
      referenceGateNumber: compensation.referenceGateNumber,
      juryGateNumber: options.juryGateNumber,
      actualGateNumber: sim.gateNumber,
      coachRequested: options.coachRequested,
      coachGateAwarded: compensated.coachGateAwarded,
      thresholdHalfMeters: compensation.coachThresholdHalfMeters,
      factorTenthsPerInrunMeter: compensation.gateFactorTenthsPerInrunMeter,
      provenance: compensation.provenance,
    },
    versions: {
      rules: MODERN_RULES.version,
      physics: sim.params.physicsVersion,
      hill: sim.hill.spec.hillVersion,
    },
  }
}

function scoreFinishedJump(
  sim: JumpSimulation,
  options: {
    readonly juryGateNumber: number
    readonly coachRequested: boolean
    readonly coachDecisionPhase: StartPhase
  },
) {
  if (!sim.outcome) {
    throw new Error('Wynik można utworzyć dopiero po zakończeniu i pomiarze skoku.')
  }
  const contact = sim.contact
  const measured = sim.measuredDistanceMeters
  if (!contact || measured === null) {
    const isTimeoutFall = sim.outcome.status === 'fall'
      && sim.outcome.terminalPhase === 'FallSettled'
      && sim.events.some((event) => event.type === 'flightTimeout')
    if (!isTimeoutFall) {
      throw new Error('Wynik można utworzyć dopiero po zakończeniu i pomiarze skoku.')
    }
    return scoreFlightTimeout(sim, options)
  }

  const distanceHalfMeters = truncateDistanceToHalfMeters(measured)
  const faults = buildStyleJournal({
    takeoffTimingOffsetSeconds: sim.takeoffTimingOffsetSeconds,
    meanFlightPostureErrorDeg: sim.meanFlightPostureErrorDeg,
    landingStyle: sim.outcome.style,
    landingReadiness: contact.readiness,
    landingSupportHands: sim.outcome.supportHands,
    status: sim.outcome.status,
    contactDistanceMeters: contact.distanceMeters,
    fallLineMeters: sim.hill.spec.fallLineMeters,
    reachedFallLine: sim.outcome.reachedFallLine,
  })
  const marksTenths = judgeMarksTenths(faults, {
    distanceHalfMeters,
    kPointMeters: sim.hill.spec.kPointMeters,
    hillSizeMeters: sim.hill.spec.hillSizeMeters,
    landingStyle: sim.outcome.style,
    landingSupportHands: sim.outcome.supportHands,
    status: sim.outcome.status,
  })
  const style = stylePointsTenths(marksTenths)
  const distance = distancePointsTenths(sim.hill.spec.kPointMeters, distanceHalfMeters)
  const feedbackCode = chooseFeedback(faults)
  const compensation = sim.hill.spec.compensation
  const referenceGate = sim.hill.gate(compensation.referenceGateNumber)
  const juryGate = sim.hill.gate(options.juryGateNumber)
  const actualGate = sim.hill.gate(sim.gateNumber)
  const compensated = scoreCompensatedJump(compensation, {
    distanceTenths: distance,
    styleTenths: style.pointsTenths,
    distanceHalfMeters,
    windUserMetersPerSecond:
      sim.windMeasurement?.meanUserMetersPerSecond ?? sim.currentWindUserMetersPerSecond,
    referenceInrunMeters: referenceGate.inrunLengthMeters,
    juryInrunMeters: juryGate.inrunLengthMeters,
    actualInrunMeters: actualGate.inrunLengthMeters,
    coachDecision: { requested: options.coachRequested, phase: options.coachDecisionPhase },
  })

  return {
    distanceHalfMeters,
    marksTenths,
    droppedJudgeIndexes: style.droppedJudgeIndexes,
    componentTenths: compensated.componentTenths,
    collectiveTenths: compensated.collectiveTenths,
    totalTenths: compensated.totalTenths,
    status: sim.outcome.status,
    landingSupportHands: sim.outcome.supportHands,
    faults,
    feedbackCode,
    reason: feedbackCode,
    wind: {
      seed: sim.windField?.seed ?? null,
      version: sim.windField?.version ?? null,
      currentUserMetersPerSecond: sim.currentWindUserMetersPerSecond,
      measuredMeanUserMetersPerSecond:
        sim.windMeasurement?.meanUserMetersPerSecond ?? sim.currentWindUserMetersPerSecond,
      sampleCount: sim.windMeasurement?.sampleCount ?? 0,
      factorTenthsPerMps:
        (sim.windMeasurement?.meanUserMetersPerSecond ?? sim.currentWindUserMetersPerSecond) >= 0
          ? compensation.headWindFactorTenthsPerMps
          : compensation.tailWindFactorTenthsPerMps,
    },
    gate: {
      referenceGateNumber: compensation.referenceGateNumber,
      juryGateNumber: options.juryGateNumber,
      actualGateNumber: sim.gateNumber,
      coachRequested: options.coachRequested,
      coachGateAwarded: compensated.coachGateAwarded,
      thresholdHalfMeters: compensation.coachThresholdHalfMeters,
      factorTenthsPerInrunMeter: compensation.gateFactorTenthsPerInrunMeter,
      provenance: compensation.provenance,
    },
    versions: {
      rules: MODERN_RULES.version,
      physics: sim.params.physicsVersion,
      hill: sim.hill.spec.hillVersion,
    },
  }
}

export function createTrainingJumpResult(sim: JumpSimulation, attemptNumber: number): TrainingJumpResult {
  if (!Number.isInteger(attemptNumber) || attemptNumber < 1) throw new Error('Nieprawidłowy numer próby.')
  const score = scoreFinishedJump(sim, {
    juryGateNumber: sim.gateNumber,
    coachRequested: false,
    coachDecisionPhase: 'red',
  })

  return {
    resultId: `training-${attemptNumber}-${sim.tick}`,
    participantId: 'local-player',
    contextId: 'technical-training',
    context: 'training',
    attemptNumber,
    ...score,
  }
}

export function createCompetitionJumpResult(
  sim: JumpSimulation,
  input: {
    readonly competitionId: string
    readonly roundId: CompetitionJumpResult['roundId']
    readonly participantId: string
    readonly juryGateNumber: number
    readonly coachRequested: boolean
    readonly coachDecisionPhase: StartPhase
    readonly sessionRevision: number
  },
): CompetitionJumpResult {
  if (!input.competitionId || !input.participantId) throw new Error('Wynik konkursowy wymaga konkursu i uczestnika.')
  if (!Number.isInteger(input.sessionRevision) || input.sessionRevision < 0) {
    throw new Error('Wynik konkursowy wymaga rewizji sesji.')
  }
  const score = scoreFinishedJump(sim, {
    juryGateNumber: input.juryGateNumber,
    coachRequested: input.coachRequested,
    coachDecisionPhase: input.coachDecisionPhase,
  })
  return {
    resultId: `${input.competitionId}-r${input.sessionRevision}-${input.roundId}-${input.participantId}-${sim.tick}`,
    participantId: input.participantId,
    contextId: `${input.competitionId}:${input.roundId}`,
    context: 'competition',
    roundId: input.roundId,
    ...score,
  }
}
