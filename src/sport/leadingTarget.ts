/** P14 — najmniejsza połówka metra dająca prowadzenie dla jawnej prognozy. */

import { distancePointsTenths, predictedStylePointsTenths } from './scoring'
import { sumCompensatedScoreTenths } from './compensation'

export type LeadingTargetInput = {
  readonly kPointMeters: number
  readonly maximumDistanceHalfMeters: number
  readonly leaderTotalTenths: number
  readonly playerPreviousTenths: number
  readonly predictedStyleTenths: number
  readonly predictedStyleRule?: {
    readonly hillSizeMeters: number
    readonly landingStyle: 'telemark' | 'parallel'
  }
  readonly windTenths: number
  readonly juryGateTenths: number
  readonly coachGateTenths: number
  readonly coachDecisionAccepted: boolean
  readonly coachThresholdHalfMeters: number
}

export type LeadingTarget = {
  readonly distanceHalfMeters: number
  readonly projectedJumpTenths: number
  readonly projectedCompetitionTenths: number
  readonly coachGateAwarded: boolean
}

/** Treningowy punkt odniesienia: połowa dystansu między K a HS, w połówkach metra. */
export function trainingTargetHalfMeters(kPointMeters: number, hillSizeMeters: number): number {
  if (!Number.isFinite(kPointMeters) || kPointMeters <= 0) throw new Error('K musi być dodatnie.')
  if (!Number.isFinite(hillSizeMeters) || hillSizeMeters <= 0) throw new Error('HS musi być dodatnie.')
  return Math.round(kPointMeters + hillSizeMeters)
}

/** Projekcja dokładnie na wskazanej połówce metra; wspólna dla solvera i treningowego fixture. */
export function projectedCompetitionTenthsAt(input: LeadingTargetInput, distanceHalfMeters: number): number {
  if (!Number.isInteger(distanceHalfMeters) || distanceHalfMeters < 0) {
    throw new Error('Projekcja celu wymaga nieujemnej odległości w połówkach metra.')
  }
  const coachGateAwarded = input.coachDecisionAccepted
    && distanceHalfMeters >= input.coachThresholdHalfMeters
  const predictedStyleTenths = input.predictedStyleRule
    ? predictedStylePointsTenths(
      distanceHalfMeters,
      input.kPointMeters,
      input.predictedStyleRule.hillSizeMeters,
      input.predictedStyleRule.landingStyle,
    )
    : input.predictedStyleTenths
  if (!Number.isInteger(predictedStyleTenths)) {
    throw new Error('Prognoza stylu celu musi być całkowitą liczbą dziesiątych punktu.')
  }
  const score = sumCompensatedScoreTenths({
    distance: distancePointsTenths(input.kPointMeters, distanceHalfMeters),
    style: predictedStyleTenths,
    wind: input.windTenths,
    juryGate: input.juryGateTenths,
    coachGate: coachGateAwarded ? input.coachGateTenths : 0,
  }, coachGateAwarded)
  return input.playerPreviousTenths + score.totalTenths
}

export function solveLeadingTarget(input: LeadingTargetInput): LeadingTarget | null {
  const integerFields = [
    input.maximumDistanceHalfMeters,
    input.leaderTotalTenths,
    input.playerPreviousTenths,
    input.predictedStyleTenths,
    input.windTenths,
    input.juryGateTenths,
    input.coachGateTenths,
    input.coachThresholdHalfMeters,
  ]
  if (integerFields.some((value) => !Number.isInteger(value))) {
    throw new Error('Solver celu wymaga wartości całkowitych w połówkach metra i dziesiątych punktu.')
  }
  if (input.maximumDistanceHalfMeters < 0) throw new Error('Maksymalna odległość celu nie może być ujemna.')

  for (let distanceHalfMeters = 0; distanceHalfMeters <= input.maximumDistanceHalfMeters; distanceHalfMeters += 1) {
    const coachGateAwarded = input.coachDecisionAccepted
      && distanceHalfMeters >= input.coachThresholdHalfMeters
    const projectedCompetitionTenths = projectedCompetitionTenthsAt(input, distanceHalfMeters)
    if (projectedCompetitionTenths > input.leaderTotalTenths) {
      const projectedJumpTenths = projectedCompetitionTenths - input.playerPreviousTenths
      return {
        distanceHalfMeters,
        projectedJumpTenths,
        projectedCompetitionTenths,
        coachGateAwarded,
      }
    }
  }
  return null
}
