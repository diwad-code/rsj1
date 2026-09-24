/**
 * P13 — czyste reguły rekompensat i pełnej sumy skoku.
 *
 * Rdzeń zwraca integer tenths. Wartości wiatru i długości rozbiegu są wejściem
 * pomiarowym w SI; każda składowa jest jawnie zaokrąglana do 0,1 pkt metodą
 * half-away-from-zero, bez zależności od asymetrii Math.round dla liczb ujemnych.
 */

import { totalBeforeCompensationTenths } from './scoring'

export type CompensationProvenance = 'official-reference' | 'simulation-calibrated'

export type CompensationRule = {
  readonly id: string
  readonly provenance: CompensationProvenance
  readonly headWindFactorTenthsPerMps: number
  readonly tailWindFactorTenthsPerMps: number
  readonly gateFactorTenthsPerInrunMeter: number
  readonly referenceGateNumber: number
  readonly coachThresholdHalfMeters: number
  readonly sourceRefs: readonly string[]
}

export type StartPhase = 'red' | 'yellow' | 'green'

export type CoachGateDecision = {
  readonly requested: boolean
  readonly phase: StartPhase
}

export type RoundedScoreComponents = {
  readonly distance: number
  readonly style: number
  readonly wind: number
  readonly juryGate: number
  readonly coachGate: number
}

export type CompensatedScore = {
  readonly componentTenths: RoundedScoreComponents
  /** §433.3: długość + styl, ograniczone od dołu przed rekompensatami. */
  readonly collectiveTenths: number
  readonly beforeFinalClampTenths: number
  /** Wynik skoku po rekompensatach nie może spaść poniżej zera. */
  readonly totalTenths: number
  readonly coachGateAwarded: boolean
}

function requireFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) throw new Error(`${label} musi być skończoną liczbą.`)
}

function requireIntegerTenths(value: number, label: string): void {
  if (!Number.isInteger(value)) throw new Error(`${label} musi być zapisana w dziesiątych punktu.`)
}

/** Matematyczne zaokrąglenie połówek od zera: +1,5→+2; −1,5→−2. */
export function roundHalfAwayFromZero(value: number): number {
  requireFinite(value, 'Zaokrąglana wartość')
  const tolerance = Number.EPSILON * Math.max(1, Math.abs(value)) * 8
  const magnitude = Math.floor(Math.abs(value) + 0.5 + tolerance)
  return value < 0 ? -magnitude : magnitude
}

/** Oficjalne arkusze zapisują 95% HS po obcięciu w dół do 0,5 m. */
export function coachThresholdHalfMeters(hillSizeMeters: number): number {
  requireFinite(hillSizeMeters, 'HS')
  if (hillSizeMeters <= 0) throw new Error('HS musi być dodatnie.')
  return Math.floor(hillSizeMeters * 0.95 * 2 + 1e-9)
}

/** Dodatni wiatr użytkowy = pod narty = ujemne punkty. */
export function windCompensationTenths(
  windUserMetersPerSecond: number,
  headFactorTenthsPerMps: number,
  tailFactorTenthsPerMps: number,
): number {
  requireFinite(windUserMetersPerSecond, 'Wiatr')
  requireFinite(headFactorTenthsPerMps, 'Współczynnik wiatru pod narty')
  requireFinite(tailFactorTenthsPerMps, 'Współczynnik wiatru w plecy')
  if (headFactorTenthsPerMps < 0 || tailFactorTenthsPerMps < 0) {
    throw new Error('Współczynniki wiatru nie mogą być ujemne.')
  }
  const factor = windUserMetersPerSecond >= 0 ? headFactorTenthsPerMps : tailFactorTenthsPerMps
  return roundHalfAwayFromZero(-windUserMetersPerSecond * factor)
}

export function gateCompensationTenths(
  referenceInrunMeters: number,
  usedInrunMeters: number,
  gateFactorTenthsPerInrunMeter: number,
): number {
  requireFinite(referenceInrunMeters, 'Referencyjny rozbieg')
  requireFinite(usedInrunMeters, 'Użyty rozbieg')
  requireFinite(gateFactorTenthsPerInrunMeter, 'Współczynnik belki')
  if (gateFactorTenthsPerInrunMeter < 0) throw new Error('Współczynnik belki nie może być ujemny.')
  return roundHalfAwayFromZero((referenceInrunMeters - usedInrunMeters) * gateFactorTenthsPerInrunMeter)
}

export function coachDecisionAccepted(
  decision: CoachGateDecision,
  juryInrunMeters: number,
  actualInrunMeters: number,
): boolean {
  return decision.requested && decision.phase === 'red' && actualInrunMeters < juryInrunMeters
}

/**
 * Jawna kolejność Q-FIS-17:
 * 1) clamp długość+styl zgodnie z ICR §433.3,
 * 2) dodaj już zaokrąglone rekompensaty,
 * 3) clamp końcowego wyniku, żeby ujemna rekompensata nie tworzyła ujemnego skoku.
 */
export function sumCompensatedScoreTenths(
  componentTenths: RoundedScoreComponents,
  coachGateAwarded = componentTenths.coachGate !== 0,
): CompensatedScore {
  for (const [label, value] of Object.entries(componentTenths)) requireIntegerTenths(value, label)
  const collectiveTenths = totalBeforeCompensationTenths(componentTenths.distance, componentTenths.style)
  const beforeFinalClampTenths = collectiveTenths
    + componentTenths.wind
    + componentTenths.juryGate
    + componentTenths.coachGate
  return {
    componentTenths,
    collectiveTenths,
    beforeFinalClampTenths,
    totalTenths: Math.max(0, beforeFinalClampTenths),
    coachGateAwarded,
  }
}

export type CompensatedJumpInput = {
  readonly distanceTenths: number
  readonly styleTenths: number
  readonly distanceHalfMeters: number
  readonly windUserMetersPerSecond: number
  readonly referenceInrunMeters: number
  readonly juryInrunMeters: number
  readonly actualInrunMeters: number
  readonly coachDecision: CoachGateDecision
}

export function scoreCompensatedJump(rule: CompensationRule, input: CompensatedJumpInput): CompensatedScore {
  requireIntegerTenths(input.distanceTenths, 'Punkty za długość')
  requireIntegerTenths(input.styleTenths, 'Punkty za styl')
  if (!Number.isInteger(input.distanceHalfMeters) || input.distanceHalfMeters < 0) {
    throw new Error('Odległość wyniku musi być zapisana w nieujemnych połówkach metra.')
  }

  const wind = windCompensationTenths(
    input.windUserMetersPerSecond,
    rule.headWindFactorTenthsPerMps,
    rule.tailWindFactorTenthsPerMps,
  )
  const juryGate = gateCompensationTenths(
    input.referenceInrunMeters,
    input.juryInrunMeters,
    rule.gateFactorTenthsPerInrunMeter,
  )
  const accepted = coachDecisionAccepted(input.coachDecision, input.juryInrunMeters, input.actualInrunMeters)
  const coachGateAwarded = accepted && input.distanceHalfMeters >= rule.coachThresholdHalfMeters
  const coachGate = coachGateAwarded
    ? gateCompensationTenths(
        input.juryInrunMeters,
        input.actualInrunMeters,
        rule.gateFactorTenthsPerInrunMeter,
      )
    : 0

  return sumCompensatedScoreTenths({
    distance: input.distanceTenths,
    style: input.styleTenths,
    wind,
    juryGate,
    coachGate,
  }, coachGateAwarded)
}
