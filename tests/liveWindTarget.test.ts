import { describe, expect, it } from 'vitest'
import { CompetitionSession } from '../src/app/competitionSession'
import { JumpSimulation } from '../src/simulation/jump'
import { createWindField } from '../src/simulation/wind'
import { buildHill } from '../src/simulation/technicalHill'
import { gateCompensationTenths, windCompensationTenths } from '../src/sport/compensation'
import { leaderTotalTenths, previousCompetitionTenths } from '../src/sport/competition'
import { solveLeadingTarget } from '../src/sport/leadingTarget'
import { EMPTY_INPUT } from './support/jumpHarness'

function stepUntilFlight(sim: JumpSimulation, guard = 10_000): void {
  for (let i = 0; i < guard && sim.phase !== 'Flight'; i += 1) sim.step(EMPTY_INPUT)
  if (sim.phase !== 'Flight') throw new Error('nie osiągnięto fazy Flight')
}

describe('PRE-PKG-008-FIXES zadanie 1 — żywa średnia wiatru w locie', () => {
  it('akumulator ujawnia bieżącą średnią przed kontaktem, niezależną od chwilowego podmuchu', () => {
    const sim = new JumpSimulation({ autoStart: true, windField: createWindField(101) })
    stepUntilFlight(sim)
    for (let i = 0; i < 60; i += 1) sim.step(EMPTY_INPUT)
    expect(sim.phase).toBe('Flight')
    // Przed kontaktem zamrożony pomiar jeszcze nie istnieje.
    expect(sim.windMeasurement).toBeNull()
    const live = sim.liveWindMeasurement
    expect(live).not.toBeNull()
    expect(live?.sampleCount ?? 0).toBeGreaterThan(10)

    const liveMean = live?.meanUserMetersPerSecond ?? NaN
    expect(Number.isFinite(liveMean)).toBe(true)
    // Sztuczny podmuch chwilowy różni się od średniej pomiarowej.
    const gust = liveMean + 2.5
    sim.currentWindUserMetersPerSecond = gust
    expect(gust).not.toBeCloseTo(liveMean, 6)
    // Akumulator nie śledzi chwilowego podmuchu HUD.
    expect(sim.liveWindMeasurement?.meanUserMetersPerSecond ?? NaN).toBeCloseTo(liveMean, 12)
    expect(sim.windMeasurement).toBeNull()
  })

  it('cel prowadzenia w locie liczy z żywej średniej, nie z chwilowego podmuchu', () => {
    const hill = buildHill()
    const session = new CompetitionSession(hill, 1, 'easy')
    expect(session.acceptHandover(false)).toBe(true)
    session.advanceStart()
    session.advanceStart()
    expect(session.startHumanJump()).toBe(true)
    const jump = session.jump
    if (!jump) throw new Error('brak skoku do celu prowadzenia')
    // Doprowadzamy do lotu, aby akumulator zebrał próbki.
    for (let i = 0; i < 10_000 && jump.phase !== 'Flight'; i += 1) {
      session.stepHumanJump({ pressed: [], released: [], held: new Set(), events: [], horizontal: 0 })
    }
    if (jump.phase !== 'Flight') throw new Error('nie osiągnięto fazy Flight w sesji')
    for (let i = 0; i < 60; i += 1) {
      if (session.view !== 'jump') break
      session.stepHumanJump({ pressed: [], released: [], held: new Set(), events: [], horizontal: 0 })
    }
    expect(session.view).toBe('jump')
    expect(jump.windMeasurement).toBeNull()
    const liveMean = jump.liveWindMeasurement?.meanUserMetersPerSecond
    if (liveMean === undefined || !Number.isFinite(liveMean)) throw new Error('brak żywej średniej w locie')
    // Wstrzykujemy podmuch chwilowy wyraźnie różny od średniej.
    const gust = liveMean + 2.5
    jump.currentWindUserMetersPerSecond = gust
    expect(gust).not.toBeCloseTo(liveMean, 6)

    const target = session.leadingTargetHalfMeters()
    const rule = hill.spec.compensation
    const meanWindTenths = windCompensationTenths(liveMean, rule.headWindFactorTenthsPerMps, rule.tailWindFactorTenthsPerMps)
    const gustWindTenths = windCompensationTenths(gust, rule.headWindFactorTenthsPerMps, rule.tailWindFactorTenthsPerMps)
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
    // Bez zmian formuły: cel sesji używa żywej średniej, nie podmuchu.
    expect(target).toBe(fromMean)
    if (fromGust !== fromMean) expect(target).not.toBe(fromGust)
  })

  it('po kontakcie cel wraca do zamrożonego pomiaru końcowego', () => {
    const hill = buildHill()
    const session = new CompetitionSession(hill, 1, 'easy')
    expect(session.acceptHandover(false)).toBe(true)
    session.advanceStart()
    session.advanceStart()
    expect(session.startHumanJump()).toBe(true)
    const jump = session.jump
    if (!jump) throw new Error('brak skoku')
    for (let i = 0; i < 20_000 && session.view === 'jump'; i += 1) {
      session.stepHumanJump({ pressed: [], released: [], held: new Set(), events: [], horizontal: 0 })
    }
    expect(session.view).toBe('result')
    // Po rozliczeniu skoku widok nie jest już 'jump', więc cel jest nullem;
    // sam skok końcowy musi mieć zamrożony pomiar zgodny z akumulatorem.
    expect(jump.windMeasurement).not.toBeNull()
    expect(jump.liveWindMeasurement).not.toBeNull()
    expect(jump.windMeasurement?.meanUserMetersPerSecond ?? NaN).toBeCloseTo(
      jump.liveWindMeasurement?.meanUserMetersPerSecond ?? NaN,
      12,
    )
  })
})
