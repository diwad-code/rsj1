import { describe, expect, it } from 'vitest'
import { distancePointsTenths } from '../src/sport/scoring'
import { projectedCompetitionTenthsAt, solveLeadingTarget, trainingTargetHalfMeters, type LeadingTargetInput } from '../src/sport/leadingTarget'
import { sumCompensatedScoreTenths } from '../src/sport/compensation'

const BASE: LeadingTargetInput = {
  kPointMeters: 120,
  maximumDistanceHalfMeters: 470,
  leaderTotalTenths: 1400,
  playerPreviousTenths: 0,
  predictedStyleTenths: 555,
  windTenths: 0,
  juryGateTenths: 0,
  coachGateTenths: 0,
  coachDecisionAccepted: false,
  coachThresholdHalfMeters: 254,
}

function projectedAt(input: LeadingTargetInput, distanceHalfMeters: number): number {
  const coachGate = input.coachDecisionAccepted && distanceHalfMeters >= input.coachThresholdHalfMeters
    ? input.coachGateTenths
    : 0
  return input.playerPreviousTenths + sumCompensatedScoreTenths({
    distance: distancePointsTenths(input.kPointMeters, distanceHalfMeters),
    style: input.predictedStyleTenths,
    wind: input.windTenths,
    juryGate: input.juryGateTenths,
    coachGate,
  }).totalTenths
}

describe('P14 — solver linii do prowadzenia', () => {
  it('kotwiczy treningowy cel na połowie dystansu między K a HS', () => {
    // Poprawka użytkownika (runda 17): K120+HS132 → 126 m; K120+HS134 → 127 m.
    expect(trainingTargetHalfMeters(120, 132)).toBe(252)
    expect(trainingTargetHalfMeters(120, 134)).toBe(254)
    expect(trainingTargetHalfMeters(120, 134) / 2).toBe(127)
    // Połówka nieparzysta, np. K120+HS135 → 127,5 m.
    expect(trainingTargetHalfMeters(120, 135)).toBe(255)
    // Normalna i mamucia: ten sam wzór punktu środkowego.
    expect(trainingTargetHalfMeters(95, 106) / 2).toBeCloseTo(100.5, 9)
    expect(trainingTargetHalfMeters(200, 235) / 2).toBeCloseTo(217.5, 9)
    expect(() => trainingTargetHalfMeters(0, 134)).toThrow()
    expect(() => trainingTargetHalfMeters(120, -5)).toThrow()
    const targetHalfMeters = trainingTargetHalfMeters(120, 134)
    const input = { ...BASE, leaderTotalTenths: 0 }
    const fixture = projectedCompetitionTenthsAt(input, targetHalfMeters - 1)
    expect(solveLeadingTarget({ ...input, leaderTotalTenths: fixture })?.distanceHalfMeters).toBe(targetHalfMeters)
    // Cel treningowy trzyma połówkę także przy wietrze i rekompensacie belki.
    const windy = { ...input, windTenths: 37, juryGateTenths: -42 }
    const windyFixture = projectedCompetitionTenthsAt(windy, targetHalfMeters - 1)
    expect(solveLeadingTarget({ ...windy, leaderTotalTenths: windyFixture })?.distanceHalfMeters).toBe(targetHalfMeters)
  })
  it('zwraca najmniejszą połówkę metra dającą wynik większy, nie równy', () => {
    const target = solveLeadingTarget(BASE)
    expect(target).not.toBeNull()
    if (!target) return
    expect(target.projectedCompetitionTenths).toBeGreaterThan(BASE.leaderTotalTenths)
    expect(projectedAt(BASE, target.distanceHalfMeters - 1)).toBeLessThanOrEqual(BASE.leaderTotalTenths)

    const tiedLeader = { ...BASE, leaderTotalTenths: target.projectedCompetitionTenths }
    expect(solveLeadingTarget(tiedLeader)?.distanceHalfMeters).toBe(target.distanceHalfMeters + 1)
  })

  it('sprawdza obie strony progu coach i przyznaje bonus dopiero na progu', () => {
    const withCoach: LeadingTargetInput = {
      ...BASE,
      leaderTotalTenths: 1375,
      maximumDistanceHalfMeters: 300,
      coachGateTenths: 100,
      coachDecisionAccepted: true,
    }
    const target = solveLeadingTarget(withCoach)
    expect(target?.distanceHalfMeters).toBe(254)
    expect(target?.coachGateAwarded).toBe(true)
    expect(projectedAt(withCoach, 253)).toBeLessThanOrEqual(withCoach.leaderTotalTenths)
  })

  it('zwraca null, gdy prowadzenia nie da się osiągnąć na profilu', () => {
    expect(solveLeadingTarget({ ...BASE, leaderTotalTenths: 99_999 })).toBeNull()
  })
})
