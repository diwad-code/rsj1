/**
 * PKG-008 — automatyczna bezpieczna belka jury.
 *
 * Prognoza tego samego pola wiatru próby w reprezentatywnym oknie lotu
 * (ważone czujniki skoczni, czas symulacji 0–5 s co 0,5 s, 11 próbek) oraz
 * estymata UMIEJĘTNEJ odległości z czynników kompensacyjnych (efekty metrowe
 * = dziesiąte punktu / wartość metra). Baza to umiejętny lot z belki
 * odniesienia (138,1 m: idealny pilot, telemark, późne przygotowanie 3,2 s;
 * runda 12: poprzednie 125,0 m mierzyło domyślne przygotowanie i zaniżało
 * umiejętny zasięg o ~13 m, wysyłając AUTO na 139,3 m > HS). Runda 16
 * koryguje zawyżony wpływ dodatniego wiatru na estymatę AUTO współczynnikiem
 * 0,5: jury nie zrzuca już 1–3 belek za nisko, a cel treningowy 75% HS
 * pozostaje osiągalny. Wybór zachowawczy: najwyższa belka, której estymata
 * nie przekracza sufitu;
 * w przeciwnym razie najniższa. Deterministycznie, bez pełnych symulacji
 * na starcie. Cel domyślny 127,0 m (q50–q75 Wisły K120/HS134, N=232).
 */

import { WeightedWindMeasurement, type WindField } from '../simulation/wind'
import { hsStabilityMultiplier as hillMultiplier } from '../simulation/technicalHill'
import { meterValueTenthsForK } from './scoring'
import type { Hill } from '../simulation/technicalHill'

/** Deterministyczna prognoza wielopunktowa: średnia z okna lotu 0–5 s (11 próbek). */
export function forecastWindMean(field: WindField, hill: Hill): number {
  const accumulator = new WeightedWindMeasurement(hill.spec.windMeasurement.sensors)
  for (let timeSeconds = 0; timeSeconds <= 5.0001; timeSeconds += 0.5) {
    accumulator.observe(field, timeSeconds)
  }
  return accumulator.result()?.meanUserMetersPerSecond ?? 0
}

function distanceEffectMeters(hill: Hill, windMeanUserMetersPerSecond: number): number {
  const rule = hill.spec.compensation
  const meterValueTenths = meterValueTenthsForK(hill.spec.kPointMeters)
  const factorTenths = windMeanUserMetersPerSecond >= 0
    ? rule.headWindFactorTenthsPerMps
    : rule.tailWindFactorTenthsPerMps
  const scale = windMeanUserMetersPerSecond >= 0 ? hill.spec.safety.autoHeadwindEffectScale : 1
  return (factorTenths / meterValueTenths) * windMeanUserMetersPerSecond * scale
}

function gateEffectMeters(hill: Hill, gateNumber: number): number {
  const rule = hill.spec.compensation
  const meterValueTenths = meterValueTenthsForK(hill.spec.kPointMeters)
  const reference = hill.gate(rule.referenceGateNumber)
  const gate = hill.gate(gateNumber)
  return ((gate.inrunLengthMeters - reference.inrunLengthMeters) * rule.gateFactorTenthsPerInrunMeter) / meterValueTenths
}

/** Estymata umiejętnej odległości z belki przy danej średniej wiatru. */
export function estimateSkilledDistanceMeters(hill: Hill, gateNumber: number, windMeanUserMetersPerSecond: number): number {
  const safety = hill.spec.safety
  return safety.referenceDistanceMeters
    + gateEffectMeters(hill, gateNumber)
    + distanceEffectMeters(hill, windMeanUserMetersPerSecond)
}

/**
 * H04 AUTO: [belka, maksymalny wiatr użytkownika m/s], od najwyższej belki.
 * Progi z kalibracji sufitów przesunięte o 2 belki w dół (decyzja użytkownika
 * 24.09.2026: „belka nadal trochę za wysoko, obniż ją o 2 pozycje”).
 */
const H04_AUTO_TAILWIND_LIMITS: readonly (readonly [number, number])[] = [
  [18, -3.12], [17, -2.97], [16, -2.83], [15, -2.67], [14, -2.52], [13, -2.36], [12, -2.2],
  [11, -2.04], [10, -1.88], [9, -1.72], [8, -1.34], [7, -0.96], [6, -0.57], [5, -0.21], [4, 0],
]
const H04_AUTO_HEADWIND_LIMITS: readonly (readonly [number, number])[] = [
  [8, 0.12], [7, 0.45], [6, 0.78], [5, 1.11], [4, 1.45], [3, 1.81], [2, 2.31],
]

export type SafeGateSelection = {
  readonly gateNumber: number
  readonly windMeanUserMetersPerSecond: number
  readonly estimatedDistanceMeters: number
}

/**
 * Najwyższa belka z estymatą <= sufit; gdy żadna się nie mieści — najniższa.
 * H01: przy wietrze w plecy gracz zamówił jeszcze dwa stopnie wyżej.
 * Sortujemy po numerze belki (wyższy numer = dłuższy rozbieg).
 */
export function selectSafeJuryGate(hill: Hill, windMeanUserMetersPerSecond: number): SafeGateSelection {
  const safety = hill.spec.safety
  // H04 ADAPT: kompensacja punktowa nie przewiduje surowego kontaktu.
  // Najwyższa belka, której skończony sweep surowego kontaktu (AoA 24–36°,
  // wybicie -4/0/4/8 ticków, R po 7/9 s lub brak) mieści się w pułapie:
  // 240 m przy wietrze w plecy, 260 m od zera wzwyż. Progi z bisekcji dla
  // h04-polar-1 (margines 0,25 m, zaokrąglone zachowawczo), potem −2 belki
  // na życzenie użytkownika (celowy skok 4→8 na zerze). Pole lądowania
  // i progi stylów pozostają niezależne.
  if (hill.spec.id === 'h04-planica-flying') {
    const wind = windMeanUserMetersPerSecond
    const limits = wind < 0 ? H04_AUTO_TAILWIND_LIMITS : H04_AUTO_HEADWIND_LIMITS
    const gateNumber = limits.find(([, maxWind]) => wind <= maxWind)?.[0] ?? 1
    return { gateNumber, windMeanUserMetersPerSecond,
      estimatedDistanceMeters: estimateSkilledDistanceMeters(hill, gateNumber, windMeanUserMetersPerSecond) }
  }
  const ordered = [...hill.gates].sort((a, b) => b.number - a.number)
  const base = ordered.find((gate) =>
    estimateSkilledDistanceMeters(hill, gate.number, windMeanUserMetersPerSecond) <= safety.safeTargetMeters,
  ) ?? ordered.at(-1)
  const highest = ordered[0]
  if (!base || !highest) throw new Error('Skocznia nie ma belek.')
  const gate = hill.spec.id === 'h01-lillehammer-normal' && windMeanUserMetersPerSecond < 0
    ? hill.gate(Math.min(highest.number, base.number + 2))
    : base
  return {
    gateNumber: gate.number,
    windMeanUserMetersPerSecond,
    estimatedDistanceMeters: estimateSkilledDistanceMeters(hill, gate.number, windMeanUserMetersPerSecond),
  }
}

export type LandingStyleForSafety = 'telemark' | 'parallel' | 'none'

/**
 * Progresywny mnożnik stabilności za HS (szczegóły w `technicalHill`):
 * 1 na/przed HS, pierwiastkowo do 0 na empirycznie wersjonowanym progu stylu. Ciągły w HS,
 * zero na/powyżej progu — bez twardego cięcia odległości.
 */
export function hsStabilityMultiplier(
  hill: Hill,
  style: LandingStyleForSafety,
  distanceMeters: number,
): number {
  return hillMultiplier(hill.spec.hillSizeMeters, hill.spec.safety, style, distanceMeters)
}
