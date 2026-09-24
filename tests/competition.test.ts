import { describe, expect, it } from 'vitest'
import {
  advancersFromRound,
  cancelCurrentRound,
  cancelWithdrawal,
  competitionStandings,
  compensatedDistanceNumerator,
  confirmWithdrawal,
  createStandardCompetition,
  currentParticipantId,
  currentRound,
  qualifiesByLongFall,
  recordAttempt,
  requestWithdrawal,
  reverseResultStartOrder,
  roundRanking,
  type CompetitionAttempt,
  type CompetitionEntrant,
  type CompetitionRound,
  type CompetitionState,
  type ScoredAttempt,
} from '../src/sport/competition'

function entrants(): CompetitionEntrant[] {
  return Array.from({ length: 75 }, (_, index) => ({
    id: `p-${index + 1}`,
    name: `Zawodnik ${index + 1}`,
    startNumber: index + 1,
    controller: { kind: 'ai' as const, difficulty: 'normal' as const },
  }))
}

function competition(hillClass: CompetitionState['hillClass'] = 'large'): CompetitionState {
  return createStandardCompetition({
    id: 'test-cup',
    entrants: entrants(),
    hillClass,
    juryGateNumber: 8,
    seed: 123,
    rulesVersion: 'rules-test',
    hillVersion: 'hill-test',
  })
}

function score(
  participantId: string,
  totalTenths: number,
  overrides: Partial<ScoredAttempt> = {},
): ScoredAttempt {
  return {
    kind: 'score',
    resultId: `result-${participantId}-${totalTenths}`,
    participantId,
    status: 'landed',
    distanceHalfMeters: 240,
    totalTenths,
    componentTenths: { distance: 600, style: 540, wind: 0, juryGate: 0, coachGate: 0 },
    meterValueTenths: 18,
    ...overrides,
  }
}

function fillCurrentRound(
  initial: CompetitionState,
  points: (index: number, participantId: string) => number,
): CompetitionState {
  let state = initial
  const count = currentRound(state).startOrder.length
  for (let index = 0; index < count; index += 1) {
    const participantId = currentParticipantId(state)
    if (!participantId) throw new Error('Brak oczekiwanego uczestnika.')
    state = recordAttempt(state, score(participantId, points(index, participantId), {
      resultId: `${currentRound(state).id}-${participantId}`,
    })).state
  }
  return state
}

describe('Q-FIS-09 — 95% skompensowanej długości po upadku', () => {
  const longest = score('leader', 1000, {
    distanceHalfMeters: 200,
    meterValueTenths: 20,
  })
  const candidate = (id: string, distanceHalfMeters: number): ScoredAttempt => score(id, 700, {
    status: 'fall',
    distanceHalfMeters,
    meterValueTenths: 20,
  })

  it('porównuje dokładnie tuż pod, równo i nad 95% bez zaokrąglenia HUD', () => {
    const group = new Set(['leader', 'under', 'equal', 'above'])
    const attempts = [longest, candidate('under', 189), candidate('equal', 190), candidate('above', 191)]
    expect(compensatedDistanceNumerator(longest)).toBe(4000)
    expect(qualifiesByLongFall(attempts[1]!, attempts, group)).toBe(false)
    expect(qualifiesByLongFall(attempts[2]!, attempts, group)).toBe(true)
    expect(qualifiesByLongFall(attempts[3]!, attempts, group)).toBe(true)
  })

  it('uwzględnia wiatr i belkę, ale tylko właściwą grupę awansującą', () => {
    const compensated = candidate('fall', 188)
    const boosted: ScoredAttempt = {
      ...compensated,
      componentTenths: { ...compensated.componentTenths, wind: 20, juryGate: 10 },
    }
    const outsider = score('prequalified-outsider', 1200, { distanceHalfMeters: 260, meterValueTenths: 20 })
    const attempts = [longest, boosted, outsider]
    const group = new Set(['leader', 'fall'])
    expect(compensatedDistanceNumerator(boosted)).toBe(3820)
    expect(qualifiesByLongFall(boosted, attempts, group)).toBe(true)
    expect(qualifiesByLongFall(boosted, attempts, new Set(attempts.map((item) => item.participantId)))).toBe(false)
  })

  it('awans liczy 95% wobec całej bieżącej serii (whole-current-series)', () => {
    const round: CompetitionRound = {
      id: 'qualification',
      status: 'complete',
      startOrder: ['leader', 'fall95', 'short'],
      attempts: {
        leader: score('leader', 1000, { distanceHalfMeters: 200, meterValueTenths: 20 }),
        fall95: score('fall95', 700, { status: 'fall', distanceHalfMeters: 190, meterValueTenths: 20 }),
        short: score('short', 600, { distanceHalfMeters: 150, meterValueTenths: 20 }),
      },
      discardedAttemptCount: 0,
    }
    // 190/200 = 95% dokładnie → awans mimo niższego wyniku; cała seria to grupa.
    expect(advancersFromRound(round, 1)).toEqual(expect.arrayContaining(['leader', 'fall95']))
    expect(advancersFromRound(round, 1)).not.toContain('short')
  })
})

describe('Q-FIS-10 — awans, remisy i kolejność', () => {
  it('przechodzi 75→51 przy remisie na granicy 50, a potem 51→31 przy granicy 30', () => {
    let state = fillCurrentRound(competition(), (index) => index === 50 ? 952 : 1001 - index)
    expect(currentRound(state).id).toBe('first')
    expect(currentRound(state).startOrder).toHaveLength(51)

    state = fillCurrentRound(state, (index) => index === 30 ? 972 : 1001 - index)
    expect(currentRound(state).id).toBe('final')
    expect(currentRound(state).startOrder).toHaveLength(31)
  })

  it('kwalifikacje mamuta redukują 75 do 40', () => {
    const state = fillCurrentRound(competition('flying'), (index) => 1000 - index)
    expect(currentRound(state).id).toBe('first')
    expect(currentRound(state).startOrder).toHaveLength(40)
  })

  it('odwraca rzeczywisty wynik, nie początkową listę', () => {
    const round: CompetitionRound = {
      id: 'first',
      status: 'complete',
      startOrder: ['a', 'b', 'c', 'd'],
      attempts: {
        a: score('a', 900),
        b: score('b', 1200),
        c: score('c', 1000),
        d: score('d', 1000),
      },
      discardedAttemptCount: 0,
    }
    expect(advancersFromRound(round, 3)).toEqual(['b', 'c', 'd'])
    expect(reverseResultStartOrder(round, ['b', 'c', 'd'])).toEqual(['d', 'c', 'b'])
  })
})

describe("statusy i atomowość reducera", () => {
  it('DNS pozostaje statusem bez fikcyjnego wyniku 0', () => {
    let state = competition()
    const participantId = currentParticipantId(state)!
    const dns: CompetitionAttempt = {
      kind: 'administrative',
      resultId: 'dns-1',
      participantId,
      status: 'dns',
      reason: 'nieobecny na starcie',
    }
    state = recordAttempt(state, dns).state
    expect(roundRanking(state).find((entry) => entry.participantId === participantId)).toMatchObject({
      totalTenths: null,
      status: 'dns',
      rank: null,
    })
    expect(() => recordAttempt(state, dns)).toThrow()
  })

  it.each(['dns', 'nps', 'dsq'] as const)('%s pozostaje statusem bez fikcyjnego wyniku', (status) => {
    let state = competition()
    const participantId = currentParticipantId(state)!
    state = recordAttempt(state, {
      kind: 'administrative',
      resultId: `${status}-probe`,
      participantId,
      status,
      reason: `kontrolowany status ${status}`,
    }).state
    expect(roundRanking(state).find((entry) => entry.participantId === participantId)).toMatchObject({
      totalTenths: null,
      status,
      rank: null,
    })
  })

  it('rezygnacja wymaga potwierdzenia i anulowanie potwierdzenia nie zmienia slotu', () => {
    let state = competition()
    const participantId = currentParticipantId(state)!
    const requested = requestWithdrawal(state, participantId)
    expect(currentParticipantId(requested)).toBe(participantId)
    expect(cancelWithdrawal(requested).withdrawalRequestParticipantId).toBeNull()

    state = confirmWithdrawal(requested).state
    expect(currentRound(state).attempts[participantId]).toMatchObject({ status: 'withdrawn' })
    expect(currentParticipantId(state)).not.toBe(participantId)
  })
})

describe('Q-FIS-14 — anulowanie serii', () => {
  it('odrzuca rozpoczęty finał i zachowuje ukończoną pierwszą serię jako wynik', () => {
    let state = fillCurrentRound(competition(), (index) => 2000 - index)
    state = fillCurrentRound(state, (index) => 1500 - index)
    expect(currentRound(state).id).toBe('final')
    const firstLeader = competitionStandings(state)[0]
    expect(firstLeader?.totalTenths).not.toBeNull()

    for (let index = 0; index < 5; index += 1) {
      const participantId = currentParticipantId(state)!
      state = recordAttempt(state, score(participantId, 5000 + index, {
        resultId: `final-${participantId}`,
      })).state
    }
    state = cancelCurrentRound(state, 'zbyt silny wiatr')

    expect(state.status).toBe('complete')
    expect(currentRound(state)).toMatchObject({ status: 'cancelled', discardedAttemptCount: 5 })
    expect(competitionStandings(state)[0]).toEqual(firstLeader)
  })

  it('same statusy administracyjne kończą event terminalnie bez pustej aktywnej serii', () => {
    let state = competition()
    const count = currentRound(state).startOrder.length
    for (let index = 0; index < count; index += 1) {
      const participantId = currentParticipantId(state)
      if (!participantId) throw new Error('Brak oczekiwanego uczestnika.')
      state = recordAttempt(state, {
        kind: 'administrative',
        resultId: `dns-${participantId}`,
        participantId,
        status: 'dns',
        reason: 'test: cała seria administracyjna',
      }).state
    }
    expect(state.status).toBe('complete')
    expect(currentRound(state).status).toBe('complete')
    expect(currentRound(state).startOrder.length).toBeGreaterThan(0)
    // Nie powstała nowa pusta aktywna seria.
    expect(state.rounds).toHaveLength(1)
    expect(state.status).not.toBe('active')
  })

  it('cancelCurrentRound zamyka semantykę: aktywna seria znika, ukończone zostają', () => {
    let state = competition()
    const participantId = currentParticipantId(state)!
    state = recordAttempt(state, score(participantId, 900, { resultId: `q-${participantId}` })).state
    const cancelled = cancelCurrentRound(state, 'decyzja jury — test')
    expect(cancelled.status).toBe('cancelled')
    expect(currentRound(cancelled)).toMatchObject({ status: 'cancelled' })
    expect(() => recordAttempt(cancelled, score('x', 100, { resultId: 'x' }))).toThrow()
  })
})
