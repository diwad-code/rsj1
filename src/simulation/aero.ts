/**
 * P07 — ograniczone krzywe CL/CD i siły aerodynamiczne.
 *
 * ADAPT/TUNE: krzywe są jawną tabelą modelu gry. Nie deklarujemy zgodności z
 * pomiarami tunelowymi rzeczywistego zawodnika. Tabela jest ograniczona na obu
 * końcach, więc żadna pozycja nie daje nieograniczonej nośności.
 */

import type { Vec2 } from './hill'

export type CoefficientPoint = {
  readonly angleOfAttackDeg: number
  readonly lift: number
  readonly drag: number
}

/** Kąt natarcia = kąt sylwetki minus kąt toru lotu względem strumienia. */
export const COEFFICIENT_CURVE: readonly CoefficientPoint[] = [
  { angleOfAttackDeg: -15, lift: -0.3, drag: 0.46 },
  { angleOfAttackDeg: 0, lift: 0.25, drag: 0.37 },
  { angleOfAttackDeg: 10, lift: 0.78, drag: 0.42 },
  { angleOfAttackDeg: 20, lift: 0.88, drag: 0.58 },
  { angleOfAttackDeg: 26, lift: 0.88, drag: 0.68 },
  { angleOfAttackDeg: 30, lift: 1.14, drag: 0.78 },
  { angleOfAttackDeg: 32, lift: 1.09, drag: 0.77 },
  { angleOfAttackDeg: 34, lift: 1.06, drag: 0.82 },
  { angleOfAttackDeg: 35, lift: 1.02, drag: 0.9 },
  { angleOfAttackDeg: 36, lift: 0.75, drag: 1.4 },
  { angleOfAttackDeg: 40, lift: 0.78, drag: 1.38 },
  { angleOfAttackDeg: 50, lift: 0.58, drag: 1.62 },
  { angleOfAttackDeg: 65, lift: 0.44, drag: 1.8 },
  { angleOfAttackDeg: 90, lift: 0.28, drag: 1.9 },
]

export function coefficientsAt(
  angleOfAttackDeg: number,
  curve: readonly CoefficientPoint[] = COEFFICIENT_CURVE,
): { lift: number; drag: number } {
  const first = curve[0]
  const last = curve[curve.length - 1]
  if (!first || !last) throw new Error('Pusta krzywa współczynników.')
  if (angleOfAttackDeg <= first.angleOfAttackDeg) return { lift: first.lift, drag: first.drag }
  if (angleOfAttackDeg >= last.angleOfAttackDeg) return { lift: last.lift, drag: last.drag }

  for (let index = 1; index < curve.length; index += 1) {
    const before = curve[index - 1]
    const after = curve[index]
    if (!before || !after) break
    if (angleOfAttackDeg <= after.angleOfAttackDeg) {
      const t = (angleOfAttackDeg - before.angleOfAttackDeg) / (after.angleOfAttackDeg - before.angleOfAttackDeg)
      return {
        lift: before.lift + (after.lift - before.lift) * t,
        drag: before.drag + (after.drag - before.drag) * t,
      }
    }
  }
  return { lift: last.lift, drag: last.drag }
}

export type AeroInput = {
  readonly velocity: Vec2
  readonly windVelocity: Vec2
  readonly pitchRad: number
  readonly airDensity: number
  readonly referenceAreaSquareMeters: number
  readonly dragScale?: number
  /** Wariant krzywej CL/CD skoczni (H04); domyślnie wspólna `COEFFICIENT_CURVE`. */
  readonly coefficientCurve?: readonly CoefficientPoint[]
  /**
   * PRE-PKG-008-FIXES: kara za skrajnie opuszczony dziób w fazie lotu.
   * Ustawiana przez symulację tylko w `Flight`; w `LandingPrep` postura
   * schodzi wzdłuż stoku do lądowania i nie jest karana. Domyślnie brak kary,
   * żeby testy jednostkowe samej krzywej CL/CD pozostały czyste.
   */
  readonly applyNoseDownPenalty?: boolean
  /**
   * PRE-PKG-008-FIXES runda 2: kara wczesnego podejścia do lądowania.
   * Ustawiana tylko w `LandingPrep` wejściowo przed progiem wieku lotu;
   * późne normalne przygotowanie nie jest karane. Rozłączna z karą dziobu
   * (osobna faza).
   */
  readonly applyLandingApproachPenalty?: boolean
}

/**
 * PRE-PKG-008-FIXES: jawna nieefektywność skrajnego opuszczenia dziobu.
 *
 * Względny AoA potrafi zostać w wydajnym zakresie także przy locie „na dziób"
 * sunącym wzdłuż stoku (pitch i tor schodzą razem w dół), więc sama krzywa
 * CL/CD nie karze takiego ślizgu. Powyżej progu postura jest wolna; poniżej
 * progu nośność spada liniowo, a opór rośnie — lokalna reguła, bez twardego
 * limitu metrów i bez zmian w punktacji. Próg −10° trzyma normalny lot `Flight`
 * (idealny ~18–23°, także przedłużony wiatrem pod narty do ~−9°) poza istotną
 * karą; exploit schodzi do −26° i dostaje ~0,68× lift, ~1,56× drag.
 */
export const NOSE_DOWN_PITCH_THRESHOLD_DEG = -10

export function noseDownEfficiency(pitchDeg: number): { liftScale: number; dragScale: number } {
  if (!Number.isFinite(pitchDeg)) throw new Error('Pitch musi być skończony.')
  const depth = NOSE_DOWN_PITCH_THRESHOLD_DEG - pitchDeg
  if (depth <= 0) return { liftScale: 1, dragScale: 1 }
  return {
    liftScale: Math.max(0.4, 1 - 0.02 * depth),
    dragScale: 1 + 0.035 * depth,
  }
}

/**
 * PKG-008: kara wczesnego podejścia do lądowania.
 * Wybór lądowania w oknie wczesnym (lot < 1,0 s) psuje szybowanie:
 * 0,60× nośności i 1,60× oporu przez cały `LandingPrep`, więc natychmiastowe
 * T/R z belki 8 kończy ≥15 m krócej od prawidłowego i nie dalej niż K−10 m.
 * Późne normalne przygotowanie nie dotyka tej kary (flaga symulacji).
 */
export const LANDING_APPROACH_LIFT_SCALE = 0.6
export const LANDING_APPROACH_DRAG_SCALE = 1.6

export type AeroResult = {
  /** Siła wypadkowa aerodynamiczna [N]. */
  readonly force: Vec2
  readonly angleOfAttackDeg: number
  readonly airSpeed: number
  readonly lift: number
  readonly drag: number
}

/**
 * `vAir = vJumper − vWind`. Opór jest przeciwny do `vAir`, nośność prostopadła
 * do niego. Wiatr w PKG-002 jest zerowy; pole wektorowe wchodzi z P10, ale wzór
 * już go używa, żeby konwencja znaku nie zmieniła się później.
 */
export function aerodynamicForce(input: AeroInput): AeroResult {
  const airX = input.velocity.x - input.windVelocity.x
  const airY = input.velocity.y - input.windVelocity.y
  const airSpeed = Math.hypot(airX, airY)

  if (airSpeed < 1e-6) {
    return { force: { x: 0, y: 0 }, angleOfAttackDeg: 0, airSpeed: 0, lift: 0, drag: 0 }
  }

  const flowAngleRad = Math.atan2(airY, airX)
  const angleOfAttackDeg = ((input.pitchRad - flowAngleRad) * 180) / Math.PI
  const base = coefficientsAt(angleOfAttackDeg, input.coefficientCurve)
  // Krzywa AoA zostaje bez zmian; kary dotyczą wyłącznie reżimu lotu.
  let lift = base.lift
  let drag = base.drag
  if (input.applyNoseDownPenalty) {
    const pitchDeg = (input.pitchRad * 180) / Math.PI
    const efficiency = noseDownEfficiency(pitchDeg)
    lift *= efficiency.liftScale
    drag *= efficiency.dragScale
  }
  if (input.applyLandingApproachPenalty) {
    lift *= LANDING_APPROACH_LIFT_SCALE
    drag *= LANDING_APPROACH_DRAG_SCALE
  }

  const dynamicPressure = 0.5 * input.airDensity * airSpeed * airSpeed * input.referenceAreaSquareMeters
  const dragMagnitude = dynamicPressure * drag * (input.dragScale ?? 1)
  const liftMagnitude = dynamicPressure * lift

  const unitX = airX / airSpeed
  const unitY = airY / airSpeed
  // Nośność prostopadle do strumienia, w stronę „do góry” względem toru.
  const liftX = -unitY
  const liftY = unitX

  return {
    force: {
      x: -unitX * dragMagnitude + liftX * liftMagnitude,
      y: -unitY * dragMagnitude + liftY * liftMagnitude,
    },
    angleOfAttackDeg,
    airSpeed,
    lift,
    drag,
  }
}
