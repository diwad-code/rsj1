import { buildProductionCamera, buildView, drawJumpScreen, drawProductionScene, jumperVisualFrame, createDebugJumperPoseSheet, type SceneActor, type TrainingSceneState } from '../../src/render/hillView'
import { drawCompetitionProgress } from '../../src/render/competitionView'
import { CompetitionSession } from '../../src/app/competitionSession'
import { createTrainingJumpResult } from '../../src/sport/jumpResult'
import { runJump } from '../support/jumpHarness'

// Deterministic renderer fixtures, not a replacement for the keyboard integration suite.
const sim = runJump({ pilot: 'ideal', style: 'parallel', prepHeightMeters: 4 })
const result = createTrainingJumpResult(sim, 1)
const state: TrainingSceneState = {
  attemptNumber: 1, completedAttempts: 1, bestDistanceHalfMeters: result.distanceHalfMeters,
  bestTotalTenths: result.totalTenths, result: null, technicalView: false,
  snowEnabled: false, reducedMotion: true, debugEnabled: false,
  leadingTargetHalfMeters: null, leaderFixtureTenths: 1400, recordHalfMeters: null,
  trainingGateMode: 'auto', trainingGateForecastMean: -0.3,
}

export function render(name: string, scale: number) {
  const canvas = document.createElement('canvas')
  canvas.width = 480
  canvas.height = 270
  canvas.style.cssText = `width:${480 * scale}px;height:${270 * scale}px;image-rendering:pixelated;display:block`
  document.body.replaceChildren(canvas)
  document.body.style.cssText = 'margin:0;background:#07111f'
  const context = canvas.getContext('2d')!
  if (name === 'training') {
    drawJumpScreen(context, sim, buildView(sim.hill), { ...state, result })
    return null
  }
  if (name === 'competition') {
    const snapshot = new CompetitionSession(sim.hill, 1, 'normal').snapshot()
    const entry = { participantId: 'local-player', name: 'ŁUCJA WICHER', rank: 12, totalTenths: result.totalTenths, status: 'landed' as const }
    drawCompetitionProgress(context, { ...snapshot, view: 'result', nextStartIndex: 12,
      lastResult: { ...result, context: 'competition', contextId: 'fixture', roundId: 'qualification' },
      standings: [entry], humanStandings: [entry] })
    return null
  }
  if (name === 'strip') {
    const sheet = createDebugJumperPoseSheet({ poses: ['landingParallel', 'landingDeep', 'supportOne', 'supportTwo'], columns: 7 })
    canvas.width = sheet.canvas.width
    canvas.height = sheet.canvas.height
    canvas.style.width = `${canvas.width * scale}px`
    canvas.style.height = `${canvas.height * scale}px`
    context.drawImage(sheet.canvas, 0, 0)
    return null
  }
  const meters = name === 'deep-hs' ? 136 : 122
  const actor: SceneActor = {
    hill: sim.hill, position: sim.hill.surfacePositionAt(meters),
    pitchRad: -sim.hill.surfaceSlopeRadAt(meters), phase: 'Outrun', tick: 224,
    landingStyle: 'parallel', events: [
      { tick: 140, type: 'landingPrep', detail: `parallel, wysokość ${name === 'deep-high' ? '9.0' : '4.0'} m` },
      { tick: 200, type: 'contact', detail: `${meters}.0 m, styl parallel` },
      ...(name.startsWith('support') ? [{ tick: 200, type: 'handSupport', detail: name === 'support-two' ? 'obie dłonie' : 'jedna dłoń' }] : []),
    ],
  }
  // Normal contact is shown in its original 18-tick window.
  const shown = name === 'normal' ? { ...actor, tick: 212 } : actor
  drawProductionScene(context, shown, buildProductionCamera(shown), state, 0)
  return jumperVisualFrame(shown, true)
}
