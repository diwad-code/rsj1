import { describe, expect, it } from 'vitest'
import { JumpSimulation } from '../src/simulation/jump'
import { DEFAULT_JUMP_PARAMS } from '../src/simulation/params'
import { createTrainingJumpResult, createCompetitionJumpResult } from '../src/sport/jumpResult'
import { isOfficialRecordCandidate } from '../src/storage/schema'
import { EMPTY_INPUT } from './support/jumpHarness'

describe('PRE-PKG-008-FIXES zadanie 2 — flightTimeout jako kontrolowany upadek', () => {
  it('timeout bez kontaktu daje fall, 0 odległości i minimalne noty, bez rekordu', () => {
    const params = {
      ...DEFAULT_JUMP_PARAMS,
      flight: { ...DEFAULT_JUMP_PARAMS.flight, maxDurationSeconds: 0.5 },
    }
    const sim = new JumpSimulation({ autoStart: true, params })
    for (let guard = 0; guard < 20_000 && !sim.finished; guard += 1) {
      sim.step(EMPTY_INPUT)
    }
    expect(sim.finished).toBe(true)
    expect(sim.events.some((event) => event.type === 'flightTimeout')).toBe(true)
    expect(sim.outcome?.status).toBe('fall')
    expect(sim.contact).toBeNull()
    expect(sim.measuredDistanceMeters).toBeNull()

    const result = createTrainingJumpResult(sim, 1)
    expect(result.status).toBe('fall')
    expect(result.distanceHalfMeters).toBe(0)
    expect(result.marksTenths).toEqual([0, 0, 0, 0, 0])
    expect(result.totalTenths).toBeGreaterThanOrEqual(0)
    expect(
      isOfficialRecordCandidate({
        context: 'competition',
        status: result.status,
        administrativeStatus: null,
        distanceHalfMeters: result.distanceHalfMeters,
        versions: result.versions,
      }),
    ).toBe(false)

    const competition = createCompetitionJumpResult(sim, {
      competitionId: 'cup',
      roundId: 'first',
      participantId: 'p1',
      juryGateNumber: 8,
      coachRequested: false,
      coachDecisionPhase: 'red',
      sessionRevision: 7,
    })
    expect(competition.status).toBe('fall')
    expect(competition.distanceHalfMeters).toBe(0)
    expect(competition.resultId).toContain('-r7-')
  })

  it('brak kontaktu bez flightTimeout nadal rzuca', () => {
    const sim = new JumpSimulation({ autoStart: true })
    // Symulacja w locie, bez zakończenia i bez kontaktu.
    while (sim.phase !== 'Flight') sim.step(EMPTY_INPUT)
    expect(() => createTrainingJumpResult(sim, 1)).toThrow()
  })
})
