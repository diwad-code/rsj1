import { describe, expect, it } from 'vitest'
import { CompetitionSession } from '../src/app/competitionSession'
import { buildHill } from '../src/simulation/technicalHill'
import { gateCompensationTenths, windCompensationTenths } from '../src/sport/compensation'
import { leaderTotalTenths, previousCompetitionTenths } from '../src/sport/competition'
import { solveLeadingTarget } from '../src/sport/leadingTarget'

describe('PKG-005 — właściciel przejść konkursu', () => {
  it('zmiana belki jury resetuje decyzję coacha (sufit 10, zapas w dół po rundzie 13)', () => {
    // Runda 13 korekta #1: 21 belek (stare 1..12 → nowe 10..21); dla tej
    // próby sufit 10 — jury nie utyka na podłodze, a coach ma dokąd schodzić
    // (poniżej fizycznej starej belki 1 = nowej 10). Coach schodzi do 9
    // (akceptacja), a zmiana jury czyści procedurę.
    const session = new CompetitionSession(buildHill(), 1, 'normal')
    expect(session.acceptHandover(false)).toBe(true)
    expect(session.state.juryGateNumber).toBe(10)
    expect(session.safeGateCeiling).toBe(10)
    session.coachAction()
    session.coachAction()
    expect(session.startProcedure?.acceptedCoachGateNumber).toBe(9)
    expect(session.startProcedure?.lastCoachDecision).toBe('accepted')

    session.changeJuryGate(-1)
    expect(session.state.juryGateNumber).toBe(9)
    expect(session.startProcedure?.phase).toBe('red')
    expect(session.startProcedure?.lastCoachDecision).toBe('none')
    expect(session.startProcedure?.coachPanelOpen).toBe(false)
  })

  it('zaakceptowany coach czyści się przy obniżeniu jury (sufit 10)', () => {
    // Pięciu ludzi rozkłada sloty na #1/#20/#38/#57/#75; drugi (#20) korzysta
    // ze wspólnej bazy serii i sufitu 10 (runda 13: zapas w dół poniżej
    // fizycznej starej belki 1). Wycofanie pierwszego i symulacja botów
    // prowadzi do jego przekazania — deterministycznie, bez grywalnych
    // skoków człowieka.
    const session = new CompetitionSession(buildHill(), 5, 'normal')
    expect(session.acceptHandover(false)).toBe(true)
    session.requestHumanWithdrawal()
    session.confirmHumanWithdrawal()
    session.continueAfterResult(false)
    for (let guard = 0; guard < 500 && session.view !== 'handover'; guard += 1) {
      if (session.view === 'bots') session.advanceBotChunk()
      else break
    }
    expect(session.view).toBe('handover')
    expect(session.activeEntrant?.startNumber).toBe(20)
    expect(session.safeGateCeiling).toBe(10)
    expect(session.acceptHandover(false)).toBe(true)
    const jury = session.state.juryGateNumber
    expect(jury).toBe(10)
    session.coachAction()
    session.coachAction()
    expect(session.startProcedure?.acceptedCoachGateNumber).toBe(9)

    session.changeJuryGate(-1)
    expect(session.state.juryGateNumber).toBe(9)
    expect(session.startProcedure?.phase).toBe('red')
    expect(session.startProcedure?.acceptedCoachGateNumber).toBeNull()
    // Powrót w górę zatrzymuje sufit, nie koniec skoczni.
    session.changeJuryGate(5)
    expect(session.state.juryGateNumber).toBe(10)
  })

  it('ręczne jury nie podnosi belki powyżej sufitu bezpieczeństwa próby', () => {
    const session = new CompetitionSession(buildHill(), 1, 'normal')
    expect(session.acceptHandover(false)).toBe(true)
    const ceiling = session.safeGateCeiling
    expect(session.state.juryGateNumber).toBe(ceiling)
    // Podnoszenie blokuje sufit; obniżanie przechodzi.
    session.changeJuryGate(1)
    expect(session.state.juryGateNumber).toBe(ceiling)
    session.changeJuryGate(-1)
    expect(session.state.juryGateNumber).toBe(Math.max(1, ceiling - 1))
  })

  it('snapshot pokazuje oczekiwaną belkę trenera przed zatwierdzeniem', () => {
    // Runda 13: sufit tej próby to 10 (zapas w dół) — coach schodzi do 9,
    // po zmianie jury do 8 i skok idzie z belki coacha.
    const session = new CompetitionSession(buildHill(), 1, 'normal')
    expect(session.acceptHandover(false)).toBe(true)
    session.coachAction()
    const jury = session.state.juryGateNumber
    expect(jury).toBe(10)
    expect(session.snapshot().coachPendingGateNumber).toBe(jury - 1)
    session.changeJuryGate(-1)
    expect(session.snapshot().coachPendingGateNumber).toBe(jury - 2)
    session.coachAction()
    expect(session.snapshot().coachDecision).toBe('accepted')
    expect(session.snapshot().actualGateNumber).toBe(jury - 2)
  })

  it('plansza kwalifikacji pokazuje ukończoną serię i wraca po reloadzie', () => {
    const hill = buildHill()
    const session = new CompetitionSession(hill, 1, 'easy')
    expect(session.acceptHandover(false)).toBe(true)
    session.requestHumanWithdrawal()
    session.confirmHumanWithdrawal()
    expect(session.view).toBe('result')
    session.continueAfterResult(false)
    for (let guard = 0; guard < 1000 && session.view !== 'round-summary'; guard += 1) {
      if (session.view === 'bots') session.advanceBotChunk()
      else break
    }
    expect(session.view).toBe('round-summary')
    expect(session.lastCompletedRound).toBe('qualification')
    expect(session.state.pendingRoundSummary).toBe('qualification')
    expect(session.ranking()).toHaveLength(75)
    expect(session.ranking().filter((entry) => entry.totalTenths !== null)).toHaveLength(74)
    const human = session.snapshot().humanStandings.find((entry) => entry.participantId === 'local-01')
    expect(human).toMatchObject({ participantId: 'local-01', totalTenths: null, rank: null })

    const resumed = new CompetitionSession(hill, 1, 'easy', false, session.toStoredSession(1))
    expect(resumed.view).toBe('round-summary')
    expect(resumed.lastCompletedRound).toBe('qualification')
    expect(resumed.ranking().filter((entry) => entry.totalTenths !== null)).toHaveLength(74)

    session.continueAfterResult(true)
    expect(session.state.pendingRoundSummary).toBeNull()
  })

  it('timeout aktywnego zielonego zapisuje NPS jako status, nie zero punktów', () => {
    const session = new CompetitionSession(buildHill(), 1, 'easy')
    session.acceptHandover(false)
    session.advanceStart()
    session.advanceStart()
    for (let tick = 0; tick < 1200; tick += 1) session.tickStart()

    expect(session.view).toBe('result')
    expect(session.lastAdministrative).toMatchObject({ status: 'nps' })
    const entry = session.ranking().find((candidate) => candidate.participantId === 'local-01')
    expect(entry).toMatchObject({ status: 'nps', totalTenths: null, rank: null })
  })

  it('wynik człowieka niesie rewizję sesji w resultId (r{rev})', () => {
    const session = new CompetitionSession(buildHill(), 1, 'easy')
    session.acceptHandover(false)
    session.advanceStart()
    session.advanceStart()
    expect(session.startHumanJump()).toBe(true)
    const revisionBefore = session.revision
    for (let guard = 0; guard < 20_000 && session.view === 'jump'; guard += 1) {
      session.stepHumanJump({ pressed: [], released: [], held: new Set(), events: [], horizontal: 0 })
    }
    expect(session.view).toBe('result')
    expect(session.lastResult?.resultId).toContain(`-r${revisionBefore + 1}-`)
  })

  it('cel prowadzenia liczy z tej samej średniej wiatru co punktacja', () => {
    const hill = buildHill()
    const session = new CompetitionSession(hill, 1, 'easy')
    session.acceptHandover(false)
    session.advanceStart()
    session.advanceStart()
    expect(session.startHumanJump()).toBe(true)
    const jump = session.jump
    if (!jump) throw new Error('brak skoku do celu prowadzenia')
    // Sztuczny podmuch chwilowy vs średnia pomiarowa.
    jump.currentWindUserMetersPerSecond = 3.0
    jump.windMeasurement = { meanUserMetersPerSecond: -1.25, sampleCount: 200 }
    const target = session.leadingTargetHalfMeters()
    const rule = hill.spec.compensation
    const meanWindTenths = windCompensationTenths(-1.25, rule.headWindFactorTenthsPerMps, rule.tailWindFactorTenthsPerMps)
    const gustWindTenths = windCompensationTenths(3.0, rule.headWindFactorTenthsPerMps, rule.tailWindFactorTenthsPerMps)
    expect(meanWindTenths).not.toBe(gustWindTenths)
    const referenceGate = hill.gate(rule.referenceGateNumber)
    const juryGate = hill.gate(session.state.juryGateNumber)
    const juryGateTenths = gateCompensationTenths(
      referenceGate.inrunLengthMeters,
      juryGate.inrunLengthMeters,
      rule.gateFactorTenthsPerInrunMeter,
    )
    const entrantId = session.activeEntrant?.id ?? ''
    const base = {
      kPointMeters: hill.spec.kPointMeters,
      maximumDistanceHalfMeters: hill.spec.outrunEndMeters * 2,
      leaderTotalTenths: leaderTotalTenths(session.state),
      playerPreviousTenths: previousCompetitionTenths(session.state, entrantId),
      predictedStyleTenths: 525,
      predictedStyleRule: { hillSizeMeters: hill.spec.hillSizeMeters, landingStyle: 'telemark' as const },
      juryGateTenths,
      coachGateTenths: 0,
      coachDecisionAccepted: false,
      coachThresholdHalfMeters: rule.coachThresholdHalfMeters,
    }
    const fromMean = solveLeadingTarget({ ...base, windTenths: meanWindTenths })?.distanceHalfMeters ?? null
    const fromGust = solveLeadingTarget({ ...base, windTenths: gustWindTenths })?.distanceHalfMeters ?? null
    expect(fromMean).not.toBeNull()
    // Cel sesji używa średniej, nie chwilowego podmuchu.
    expect(target).toBe(fromMean)
    if (fromGust !== fromMean) expect(target).not.toBe(fromGust)
  })
})
