import { buildHillById, hillCompetitionSessionId } from '../../src/app/hills'
import { JumpSimulation, SIM_DT } from '../../src/simulation/jump'
import { JumpRecorder } from '../../src/replay/recorder'
import { createCompetitionJumpResult, createTrainingJumpResult } from '../../src/sport/jumpResult'
import { buildView, drawJumpScreen } from '../../src/render/hillView'
import { EMPTY_INPUT, makeInput } from '../support/jumpHarness'
import { DB_NAME, DB_VERSION } from '../../src/storage/schema'

/** Real deterministic simulation/recorder, not a human playtest. */
export async function install(legacy = false) {
  const hill = buildHillById('h01-lillehammer-normal')
  const gateNumber = hill.spec.safety.referenceGateNumber
  const probe = new JumpSimulation({ hill, gateNumber, autoStart: true })
  while (!probe.events.some(e => e.type === 'takeoffEdge') && probe.tick < 2000) probe.step(EMPTY_INPUT)
  const edge = probe.events.find(e => e.type === 'takeoffEdge')!.tick
  const sim = new JumpSimulation({ hill, gateNumber, autoStart: true })
  const sessionId = hillCompetitionSessionId(hill.spec.id)
  const meta = { sessionId, competitionId: sessionId, participantId: 'local-01', participantName: 'Łucja Wicher', roundId: 'qualification' as const, juryGateNumber: gateNumber, coachRequested: false }
  const recorder = new JumpRecorder(sim, meta)
  let landingPrepared = false
  for (let i = 0; i < 5000 && !sim.outcome; i++) {
    const pressed: ('takeoff' | 'telemark')[] = []
    const held: ('left' | 'right')[] = []
    if (sim.tick === edge - Math.round(sim.params.takeoff.idealLeadSeconds / SIM_DT)) pressed.push('takeoff')
    if (sim.phase === 'Flight') {
      const flowDeg = (Math.atan2(sim.velocity.y, sim.velocity.x) * 180) / Math.PI
      const desired = flowDeg + 32
      const current = (sim.targetPitchRad * 180) / Math.PI
      if (current > desired + 0.5) held.push('right')
      else if (current < desired - 0.5) held.push('left')
      if (!landingPrepared && sim.flightSeconds >= 3.2) {
        pressed.push('telemark')
        landingPrepared = true
      }
    }
    const input = pressed.length || held.length ? makeInput(pressed, held) : EMPTY_INPUT
    sim.step(input)
    recorder.record(input)
  }
  const result = createCompetitionJumpResult(sim, { ...meta, coachDecisionPhase: 'green', sessionRevision: 1 })
  const currentReplay = recorder.finish(result, Date.now())
  const replay = legacy
    ? {
        ...currentReplay,
        versions: { ...currentReplay.versions, hill: 'h01-2022-cert-v1' },
        recordedResult: {
          ...currentReplay.recordedResult,
          versions: { ...currentReplay.recordedResult.versions, hill: 'h01-2022-cert-v1' },
        },
      }
    : currentReplay
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const r = indexedDB.open(DB_NAME, DB_VERSION)
    r.onsuccess = () => resolve(r.result)
    r.onerror = () => reject(r.error)
  })
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('replays', 'readwrite')
    tx.objectStore('replays').put(replay)
    tx.oncomplete = () => resolve()
    tx.onabort = () => reject(tx.error)
  })
  db.close()
  const canvas = document.querySelector('canvas')!
  drawJumpScreen(canvas.getContext('2d')!, sim, buildView(hill), {
    attemptNumber: 1, completedAttempts: 1, bestDistanceHalfMeters: result.distanceHalfMeters,
    bestTotalTenths: result.totalTenths, result: createTrainingJumpResult(sim, 1),
    technicalView: false, snowEnabled: false, reducedMotion: false, debugEnabled: false,
    leadingTargetHalfMeters: 188, leaderFixtureTenths: 0, recordHalfMeters: 215,
  })
  return { distance: result.distanceHalfMeters, total: result.totalTenths, png: canvas.toDataURL() }
}
