import { CompetitionSession } from '../../src/app/competitionSession'
import { drawCompetitionProgress } from '../../src/render/competitionView'
import { buildView, drawJumpScreen, type TrainingSceneState } from '../../src/render/hillView'
import { createTrainingJumpResult, type TrainingJumpResult } from '../../src/sport/jumpResult'
import {
  buildStyleJournal,
  distancePointsTenths,
  judgeMarksTenths,
  stylePointsTenths,
  type StyleAssessmentInput,
} from '../../src/sport/scoring'
import { runJump } from '../support/jumpHarness'

const sim = runJump({ gate: 8, pilot: 'ideal', style: 'telemark' })
const base = createTrainingJumpResult(sim, 1)

const SCENARIOS = {
  'k-telemark': { distanceMeters: 120, landingStyle: 'telemark', hands: 0 },
  'hs-plus-parallel': { distanceMeters: 135, landingStyle: 'parallel', hands: 0 },
  'hs-plus-telemark': { distanceMeters: 139.5, landingStyle: 'telemark', hands: 0 },
  'one-hand': { distanceMeters: 136, landingStyle: 'telemark', hands: 1 },
  'two-hands': { distanceMeters: 139, landingStyle: 'telemark', hands: 2 },
} as const

export type ScenarioName = keyof typeof SCENARIOS

function resultFor(name: ScenarioName): TrainingJumpResult {
  const scenario = SCENARIOS[name]
  const input: StyleAssessmentInput = {
    takeoffTimingOffsetSeconds: 0,
    meanFlightPostureErrorDeg: 0,
    landingStyle: scenario.landingStyle,
    landingReadiness: 1,
    landingSupportHands: scenario.hands,
    status: 'landed',
    contactDistanceMeters: scenario.distanceMeters,
    fallLineMeters: sim.hill.spec.fallLineMeters,
    reachedFallLine: true,
  }
  const distanceHalfMeters = scenario.distanceMeters * 2
  const faults = buildStyleJournal(input)
  const marksTenths = judgeMarksTenths(faults, {
    distanceHalfMeters,
    kPointMeters: sim.hill.spec.kPointMeters,
    hillSizeMeters: sim.hill.spec.hillSizeMeters,
    landingStyle: scenario.landingStyle,
    landingSupportHands: scenario.hands,
    status: 'landed',
  })
  const style = stylePointsTenths(marksTenths)
  const distance = distancePointsTenths(sim.hill.spec.kPointMeters, distanceHalfMeters)
  const collectiveTenths = Math.max(0, distance + style.pointsTenths)
  return {
    ...base,
    resultId: `pkg008-r15-${name}`,
    distanceHalfMeters,
    marksTenths,
    droppedJudgeIndexes: style.droppedJudgeIndexes,
    componentTenths: { distance, style: style.pointsTenths, wind: 0, juryGate: 0, coachGate: 0 },
    collectiveTenths,
    totalTenths: collectiveTenths,
    landingSupportHands: scenario.hands,
    faults,
    feedbackCode: faults[0]?.code ?? 'clean',
    reason: faults[0]?.code ?? 'clean',
  }
}

export function render(name: ScenarioName, view: 'training' | 'competition', scale: number) {
  const canvas = document.createElement('canvas')
  canvas.width = 480
  canvas.height = 270
  canvas.style.cssText = `width:${480 * scale}px;height:${270 * scale}px;image-rendering:pixelated;display:block`
  document.body.style.cssText = 'margin:0;background:#07111f'
  document.body.replaceChildren(canvas)
  const context = canvas.getContext('2d')!
  context.imageSmoothingEnabled = false
  const result = resultFor(name)
  if (view === 'training') {
    const state: TrainingSceneState = {
      attemptNumber: 1,
      completedAttempts: 1,
      bestDistanceHalfMeters: result.distanceHalfMeters,
      bestTotalTenths: result.totalTenths,
      result,
      technicalView: false,
      snowEnabled: false,
      reducedMotion: true,
      debugEnabled: false,
      leadingTargetHalfMeters: null,
      leaderFixtureTenths: 1400,
      recordHalfMeters: 289,
      trainingGateMode: 'auto',
      trainingGateForecastMean: 0,
    }
    drawJumpScreen(context, sim, buildView(sim.hill), state)
  } else {
    const snapshot = new CompetitionSession(sim.hill, 1, 'normal').snapshot()
    const entry = {
      participantId: 'local-player', name: 'ŁUCJA WICHER', rank: 1,
      totalTenths: result.totalTenths, status: 'landed' as const,
    }
    drawCompetitionProgress(context, {
      ...snapshot,
      view: 'result',
      nextStartIndex: 1,
      lastResult: { ...result, context: 'competition', contextId: 'pkg008-r15', roundId: 'qualification' },
      standings: [entry],
      humanStandings: [entry],
    })
  }
  return {
    distanceHalfMeters: result.distanceHalfMeters,
    marksTenths: result.marksTenths,
    droppedJudgeIndexes: result.droppedJudgeIndexes,
    totalTenths: result.totalTenths,
  }
}
