import { JumpSimulation, SIM_DT } from '../../src/simulation/jump'
import { buildView, drawJumpScreen, jumperVisualFrame, type TrainingSceneState } from '../../src/render/hillView'
import { projectedCompetitionTenthsAt, trainingTargetHalfMeters } from '../../src/sport/leadingTarget'
import { EMPTY_INPUT, edgeTickFor, makeInput } from '../support/jumpHarness'

// Zatrzymane, rzeczywiste kroki symulacji. Żadnych podmienionych zdarzeń ani pozycji.
export function render(kind: 'gate' | 'perfect' | 'ordinary', age: number, scale: number) {
  const sim = new JumpSimulation({ gateNumber: 8, autoStart: kind !== 'gate' || age > 0 })
  const takeoffTick = edgeTickFor(8) - Math.round(sim.params.takeoff.idealLeadSeconds / SIM_DT)
    + (kind === 'ordinary' ? -8 : 0)
  for (let guard = 0; guard < 3000; guard++) {
    if (kind === 'gate' && sim.tick >= age) break
    const edge = sim.events.find(event => event.type === 'takeoffEdge')
    if (kind !== 'gate' && edge && sim.tick - edge.tick >= age) break
    sim.step(kind !== 'gate' && sim.tick === takeoffTick ? makeInput(['takeoff']) : EMPTY_INPUT)
  }
  const canvas = document.createElement('canvas')
  canvas.width = 480
  canvas.height = 270
  canvas.style.cssText = `width:${480 * scale}px;height:${270 * scale}px;image-rendering:pixelated;display:block`
  document.body.style.cssText = 'margin:0;background:#07111f'
  document.body.replaceChildren(canvas)
  // Spójny cel treningowy z aplikacją (połowa K–HS, lider z poprzedniej połówki),
  // nie historyczne twarde 201/740. Zapisanych PNG rundy 16 nie regenerujemy.
  const leadingTargetHalfMeters = trainingTargetHalfMeters(120, 134)
  const leaderFixtureTenths = projectedCompetitionTenthsAt({
    kPointMeters: 120,
    maximumDistanceHalfMeters: 470,
    leaderTotalTenths: 0,
    playerPreviousTenths: 0,
    predictedStyleTenths: 525,
    predictedStyleRule: { hillSizeMeters: 134, landingStyle: 'telemark' },
    windTenths: 0,
    juryGateTenths: 0,
    coachGateTenths: 0,
    coachDecisionAccepted: false,
    coachThresholdHalfMeters: 254,
  }, leadingTargetHalfMeters - 1)
  const state: TrainingSceneState = {
    mode: 'training', attemptNumber: 1, completedAttempts: 0,
    bestDistanceHalfMeters: 0, bestTotalTenths: 0, result: null,
    technicalView: false, snowEnabled: false, reducedMotion: false, debugEnabled: false,
    leadingTargetHalfMeters, leaderFixtureTenths, recordHalfMeters: null,
    trainingGateMode: 'auto',
  }
  drawJumpScreen(canvas.getContext('2d')!, sim, buildView(sim.hill), state)
  return {
    kind, requestedAge: age, tick: sim.tick, phase: sim.phase,
    visual: jumperVisualFrame(sim), position: sim.position,
    events: sim.events, perfect: sim.perfectTakeoff,
    evidence: 'Deterministyczna scena z rzeczywistych kroków symulacji; nie nagranie wejścia gracza.',
  }
}
