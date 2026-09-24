/**
 * P05 — techniczna, jawnie fikcyjna skocznia K120/HS134.
 *
 * ADAPT: to nie jest cyfrowa kopia homologowanego obiektu ani zestaw danych
 * FIS. Kąty i długości są własnym, wersjonowanym profilem technicznym dobranym
 * tak, aby geometria była wiarygodna i sprawdzalna. Prawdziwe obiekty wchodzą
 * dopiero z P21/P32.
 */

import { ProfileCurve, type SlopeKeyframe, type Vec2 } from './hill'
import type { WindSensor } from './wind'
import type { CoefficientPoint } from './aero'

export type HillGate = {
  readonly number: number
  /** Długość rozpędzania od belki do krawędzi progu, wzdłuż łuku rozbiegu. */
  readonly inrunLengthMeters: number
}

export type HillMarkers = {
  readonly tableEdge: Vec2
  readonly pPoint: Vec2
  readonly kPoint: Vec2
  readonly hillSize: Vec2
  readonly uPoint: Vec2
  readonly fallLine: Vec2
}

export type HillCompensation = {
  readonly id: string
  readonly provenance: 'official-reference' | 'simulation-calibrated'
  readonly headWindFactorTenthsPerMps: number
  readonly tailWindFactorTenthsPerMps: number
  readonly gateFactorTenthsPerInrunMeter: number
  readonly referenceGateNumber: number
  readonly coachThresholdHalfMeters: number
  readonly sourceRefs: readonly string[]
}

/**
 * PKG-008 — metadane bezpieczeństwa skoczni technicznej
 * (simulation-calibrated, NIE twierdzenie o realnym obiekcie).
 *
 * Służą dwóm mechanikom gry: automatycznej belce jury (prognoza z tego
 * samego pola wiatru próby) oraz progresywnej trudności lądowania za HS.
 * `referenceDistanceMeters` 138,1 m to zmierzony UMIEJĘTNY lot neutralny
 * z fizycznej belki odniesienia (runda 13: nowa 17 = stara 8; idealny
 * pilot, telemark, późne przygotowanie 3,2 s, gotowość 1, brak wiatru:
 * 138,05 m lądowany; nowa 18 = stara 9 tą samą techniką: 139,33 m).
 * Runda 12 ujawniła zaniżenie o ~13,1 m (stare 125,0 m mierzyło domyślne
 * przygotowanie), runda 13 dokłada fizycznie niższe belki 1..9 (stare
 * 1..12 → nowe 10..21, te same długości), więc AUTO schodzi poniżej
 * starej podłogi zamiast utykać na belce 1; umiejętne loty z belek AUTO
 * poniżej HS (szczegóły kalibracji w teście `skilled-auto-table`). Runda 16
 * skaluje dodatni wpływ wiatru w estymacie AUTO do 0,5, ponieważ przeliczenie
 * wprost z rekompensaty przeszacowywało rzeczywisty zysk na niskich belkach.
 * `safeTargetMeters` 127,0 m to cel jury w paśmie empirycznym q50–q75
 * Wisły K120/HS134 (N=232 lądowanych skoków 14.01.2024, 07–08.12.2024;
 * mediana 124,75, q75 128, mean 123,59, max 139,5, ≥HS 9/232, >136 2/232;
 * rekord hill-data 144,5; szczegóły
 * w `docs/evidence/PKG-008/hill-geometry-fis.md` §8). Runda 15 przesuwa
 * prowizoryczne progi o 5 m: telemark 147 m, dwie nogi 150 m, dzięki czemu
 * oficjalny rekord 144,5 m pozostaje możliwy do ustania. Styl lądowania
 * i prawdopodobieństwo upadku: UNRESOLVED —
 * 0 odnotowanych upadków w próbie NIE wyznacza krzywej prawdopodobieństwa,
 * tylko deterministyczne progi.
 */
export type HillSafety = {
  readonly referenceGateNumber: number
  readonly referenceDistanceMeters: number
  readonly safeTargetMeters: number
  /** Korekta estymaty wpływu wiatru pod narty przy wyborze AUTO (TUNE). */
  readonly autoHeadwindEffectScale: number
  readonly telemarkImpossibleMeters: number
  readonly parallelImpossibleMeters: number
}

/**
 * PKG-008: progresywny mnożnik stabilności za HS.
 * Czysta funkcja kontraktu bezpieczeństwa skoczni (bez importów spoza symulacji):
 * 1 na/przed HS, łagodnie (pierwiastek kwadratowy) do 0 na progu niemożliwym
 * stylu (telemark pada wcześniej niż dwie nogi; 'none' liczy ostrzejszym
 * progiem telemarku). Ciągła w HS, zero na/powyżej progu — bez twardego cięcia
 * odległości. Pierwiastek trzyma idealny kontakt przy 139,5 m powyżej progu
 * upadku (mnożnik ~0,56 telemark / ~0,71 parallel), dalej ryzyko rośnie
 * deterministycznie do zera. Zero losowości.
 */
export function hsStabilityMultiplier(
  hillSizeMeters: number,
  safety: HillSafety,
  style: 'telemark' | 'parallel' | 'none',
  distanceMeters: number,
): number {
  if (!Number.isFinite(distanceMeters) || distanceMeters <= hillSizeMeters) return 1
  const limit = style === 'parallel' ? safety.parallelImpossibleMeters : safety.telemarkImpossibleMeters
  if (distanceMeters >= limit) return 0
  const linear = (limit - distanceMeters) / (limit - hillSizeMeters)
  return Math.sqrt(linear)
}

export type HillSpec = {
  readonly id: string
  readonly name: string
  readonly hillVersion: string
  readonly classification: 'normal' | 'large' | 'flying'
  readonly kPointMeters: number
  readonly hillSizeMeters: number
  readonly pPointMeters: number
  readonly uPointMeters: number
  readonly fallLineMeters: number
  readonly outrunEndMeters: number
  /** Pionowy odstęp krawędzi progu nad początkiem zeskoku. */
  readonly tableClearanceMeters: number
  readonly inrun: {
    readonly lengthMeters: number
    readonly keyframes: readonly SlopeKeyframe[]
    readonly gates: readonly HillGate[]
  }
  /** Krzywa zeskoku: metraż 0 → uPointMeters. */
  readonly landingKeyframes: readonly SlopeKeyframe[]
  /** Krzywa wybiegu: metraż uPointMeters → outrunEndMeters. */
  readonly outrunKeyframes: readonly SlopeKeyframe[]
  readonly windMeasurement: {
    readonly version: string
    readonly sensors: readonly WindSensor[]
  }
  readonly compensation: HillCompensation
  readonly safety: HillSafety
  /**
   * Opcjonalny wariant krzywej CL/CD tylko tej skoczni (ADAPT/TUNE). Jego
   * `version` trafia jako sufiks do `physicsVersion`; brak = wspólna krzywa.
   */
  readonly aero?: {
    readonly version: string
    readonly curve: readonly CoefficientPoint[]
  }
}

const GATE_COUNT = 21
// FIS Construction Norm 2018 §4.1: różnica wysokości między dwiema belkami nie
// może przekraczać 0,40 m. Przy najeździe 35° odstęp 0,75 m dawał 0,43 m, czyli
// powyżej limitu; 0,65 m daje 0,373 m.
// Runda 13 korekta #1 (skarga: „na belce 1 zawsze skoki nadal za długie"):
// stara belka 1 zostaje fizycznie belką 10 (stare 1..12 → nowe 10..21, te same
// długości rozbiegu), a nowe belki 1..9 przedłużają ten sam rozstaw 0,65 m
// w dół. Wszystkie belki leżą na prostej 35° (belka 1 to 13,0 m od góry <
// 45,74 m prostej), więc spadek między belkami to nadal 0,373 m ≤ 0,40 m.
// Najkrótszy rozbieg (belka 1) ma 81,35 m > 0; najdłuższy bez zmian 94,35 m.
const GATE_SPACING_METERS = 0.65
const LONGEST_INRUN_METERS = 94.35

function supportsModernScoringK(kPointMeters: number): boolean {
  return Number.isInteger(kPointMeters) &&
    ((kPointMeters >= 20 && kPointMeters <= 164) || kPointMeters >= 180)
}

function buildGates(): HillGate[] {
  const gates: HillGate[] = []
  for (let number = 1; number <= GATE_COUNT; number += 1) {
    gates.push({
      number,
      inrunLengthMeters: LONGEST_INRUN_METERS - (GATE_COUNT - number) * GATE_SPACING_METERS,
    })
  }
  return gates
}

/**
 * P42 runda 6–7 — geometria wyprowadzona z „FIS Jumping Hills Construction
 * Norm 2018” (Gasser) i skalibrowana na certyfikat rzeczywistej skoczni
 * HS134/K120 (Wisła Malinka, przebudowa 2023: γ 35°, α 11°, t 6,71 m,
 * s 3,03 m, β przy K 33,5°, h/n 0,566, e 94,35 m).
 *
 * Wyprowadzenie (skrypt w `docs/evidence/PKG-008/hill-geometry-fis.md` §4):
 *   – próg: α = w/30 + 7,4 = 11,4° z zakresu 10,9–11,9; przyjęte 11,0° za Wisłą;
 *   – βP = γ + 0,5α − 2,5 = 38,0°, ograniczone normą do maksimum 37,0°;
 *   – β0 = βP/6 = 6,17°;
 *   – garb: parabola sześcienna od β0 do 37°, pozioma długość 50,89 m
 *     (aproksymowana gładkim przejściem 0–55 m łuku);
 *   – prosta 37° do punktu P (105 m), potem pole lądowania jako łuk kołowy
 *     rL = 245,6 m: 37° w P → 33,5° w K → 30,2° w L (≈134,2 m);
 *   – przejście L→U z rosnącym promieniem do 0° w U = 170,5 m;
 *     wynik: n = 103,67 m, h = 58,68 m, h/n = 0,566, Uz = −77,65 m.
 *
 * Runda 7 domyka zeskok do tego profilu razem z przestrojeniem aero
 * (pkg008-tune-3): poprzedni profil (24° od progu, h/n 0,64) był jawnie
 * niezgodny z normą i został zastąpiony atomowo z modelem lotu.
 */
export const TECHNICAL_K120: HillSpec = {
  id: 'tech-k120-hs134',
  name: 'SKOCZNIA TECHNICZNA K120',
  hillVersion: '3.5.0',
  classification: 'large',
  kPointMeters: 120,
  hillSizeMeters: 134,
  pPointMeters: 105,
  uPointMeters: 170.5,
  fallLineMeters: 205,
  outrunEndMeters: 235,
  tableClearanceMeters: 3.03,
  inrun: {
    lengthMeters: LONGEST_INRUN_METERS,
    // Prosta γ = 35° (45,74 m), łuk przejściowy o stałym promieniu r1 = 100 m
    // (41,90 m łuku obraca 35° → 11°; przy 26 m/s przeciążenie w E2 wynosi
    // 0,69 g, czyli poniżej normowego limitu 0,70 g), próg t = 6,71 m przy 11°.
    keyframes: [
      { distanceMeters: 0, slopeDeg: 35 },
      { distanceMeters: 45.74, slopeDeg: 35 },
      { distanceMeters: 87.64, slopeDeg: 11 },
      { distanceMeters: 94.35, slopeDeg: 11 },
    ],
    gates: buildGates(),
  },
  // ZESKOK FIS (§4): garb sześcienny 6,17°→37° (0–54 m łuku, poziomo
  // 50,80 m), prosta 37° do P = 105 m, łuk kołowy rL = 245,6 m
  // (37° w P → 33,5° w K → 30,2° w L = 134,15 m), przejście L→U
  // z przytrzymaniem 30,2° do 143 m i gładkim zejściem do 0° w U = 170,5 m
  // (n = 103,77 m, h = 58,53 m, h/n = 0,564, Uz ≈ −77,6 m).
  // Gęste punkty przybliżają krzywizny odcinkowo liniowo, więc nachylenie
  // jest ciągłe, a skoki krzywizny są małe dla kolizji.
  landingKeyframes: [
    { distanceMeters: 0, slopeDeg: 6.17 },
    { distanceMeters: 6.75, slopeDeg: 7.07 },
    { distanceMeters: 13.5, slopeDeg: 9.09 },
    { distanceMeters: 20.25, slopeDeg: 11.99 },
    { distanceMeters: 27, slopeDeg: 15.66 },
    { distanceMeters: 33.75, slopeDeg: 20.03 },
    { distanceMeters: 40.5, slopeDeg: 25.07 },
    { distanceMeters: 47.25, slopeDeg: 30.74 },
    { distanceMeters: 54, slopeDeg: 37 },
    { distanceMeters: 105, slopeDeg: 37 },
    { distanceMeters: 110, slopeDeg: 35.83 },
    { distanceMeters: 115, slopeDeg: 34.67 },
    { distanceMeters: 120, slopeDeg: 33.5 },
    { distanceMeters: 125, slopeDeg: 32.33 },
    { distanceMeters: 130, slopeDeg: 31.17 },
    { distanceMeters: 134.15, slopeDeg: 30.2 },
    { distanceMeters: 143, slopeDeg: 30.2 },
    { distanceMeters: 149.88, slopeDeg: 25.48 },
    { distanceMeters: 156.75, slopeDeg: 15.1 },
    { distanceMeters: 163.63, slopeDeg: 4.72 },
    { distanceMeters: 170.5, slopeDeg: 0 },
  ],
  outrunKeyframes: [
    { distanceMeters: 170.5, slopeDeg: 0 },
    { distanceMeters: 180, slopeDeg: -0.5 },
    { distanceMeters: 195, slopeDeg: -1.5 },
    { distanceMeters: 215, slopeDeg: -2.5 },
    { distanceMeters: 235, slopeDeg: -2.5 },
  ],
  windMeasurement: {
    version: 'weighted-flight-span-v1',
    sensors: [
      { distanceMeters: 45, weight: 0.25 },
      { distanceMeters: 95, weight: 0.45 },
      { distanceMeters: 130, weight: 0.30 },
    ],
  },
  compensation: {
    id: 'tech-k120-compensation-2',
    provenance: 'simulation-calibrated',
    // Kalibracja na pkg008-tune-3 metodą z normy FIS 2018 §5: wszystko liczone
    // dla „odległości zwycięzcy" ws = (w + HS)/2 = 127 m — u nas belka 19
    // (fizycznie stara belka 10), która daje 127,5 m — jako jedna trzecia
    // różnicy długości przy rozbiegu krótszym o 3 m oraz przy wietrze
    // ±3 m/s. Zmierzono 1,940 m na 1 m rozbiegu, 7,179 m na 1 m/s wiatru
    // pod narty i 4,925 m na 1 m/s wiatru w plecy; ×1,8 pkt/m daje wartości
    // poniżej. Bramka odniesienia punktacji zostaje na fizycznej belce
    // (runda 13: nowa 17 = stara 8, baza jury), a czynniki mierzone są na
    // belce zwycięzcy zgodnie z normą. Czynniki BEZ ZMIAN, tylko numer.
    headWindFactorTenthsPerMps: 129,
    tailWindFactorTenthsPerMps: 89,
    gateFactorTenthsPerInrunMeter: 35,
    referenceGateNumber: 17,
    // HS134 × 95% = 127,3 m; oficjalna konwencja obcina do 127,0 m.
    coachThresholdHalfMeters: 254,
    sourceRefs: [
      'docs/evidence/PKG-002/simulation-tables.md#2-wplyw-belki-na-rozpedzanie',
      'docs/evidence/PKG-008/hill-geometry-fis.md',
      'FIS Jumping Hills Construction Norm 2018 §5 (metoda wyznaczania)',
      'FIS ICR June 2026 art. 422.1 (threshold only)',
    ],
  },
  safety: {
    // Umiejętny lot neutralny z fizycznej belki odniesienia (runda 13:
    // nowa 17 = stara 8; idealny pilot, telemark, późne przygotowanie
    // 3,2 s, brak wiatru) mierzy 138,05 m → zapis 138,1 m BEZ ZMIAN;
    // nowa 18 (= stara 9) tą samą techniką 139,33 m (okno testu 138–140).
    // Sufit 127,0 (q50–q75 Wisły: mediana 124,75, q75 128, mean 123,59,
    // N=232, max 139,5, ≥HS 9/232, >136 2/232; dowody §8
    // hill-geometry-fis.md). Runda 13 dokłada fizycznie niższe belki 1..9
    // (stare 1..12 → nowe 10..21), więc AUTO schodzi poniżej starej
    // podłogi zamiast utykać na belce 1. Runda 15: progi PROWIZORYCZNE
    // przesunięte o maksymalne zlecone +5 m: telemark 147 m, dwie nogi
    // 150 m. Rekord 144,5 m ma dodatni margines; między HS a progiem
    // pozostaje ciągły mnożnik pierwiastkowy. Styl i p(upadku): UNRESOLVED.
    referenceGateNumber: 17,
    referenceDistanceMeters: 138.1,
    safeTargetMeters: 127.0,
    // Estymata z punktów rekompensaty zawyżała realny zysk mocnego wiatru
    // pod narty na niskich belkach (np. +1 m/s: 126,3 est. vs 120,5 m w
    // symulacji). Połowa efektu podnosi AUTO o 1–3 stopnie bez ruszania
    // empirycznego sufitu 127 m ani kierunku reakcji jury.
    autoHeadwindEffectScale: 0.5,
    telemarkImpossibleMeters: 147,
    parallelImpossibleMeters: 150,
  },
}

export type Hill = {
  readonly spec: HillSpec
  /** Rozbieg: metraż 0 = najwyższa belka, koniec = krawędź progu w (0,0). */
  readonly inrunCurve: ProfileCurve
  readonly landingCurve: ProfileCurve
  readonly outrunCurve: ProfileCurve
  /** Powierzchnia kolizji i pomiaru: zeskok + wybieg, wspólna mapa metrażu. */
  readonly surfaceCurves: readonly ProfileCurve[]
  readonly markers: HillMarkers
  readonly gates: readonly HillGate[]
  /** Pozycja na powierzchni dla odległości w metrach mapy. */
  surfacePositionAt(distanceMeters: number): Vec2
  surfaceSlopeRadAt(distanceMeters: number): number
  surfaceNormalAt(distanceMeters: number): Vec2
  surfaceDistanceAtPoint(point: Vec2): number
  surfaceYAtX(x: number): number
  gate(number: number): HillGate
}

export function buildHill(spec: HillSpec = TECHNICAL_K120): Hill {
  // Rozbieg budujemy od góry, a potem przesuwamy tak, aby jego koniec
  // (krawędź progu) leżał w początku układu świata.
  const rawInrun = new ProfileCurve({ x: 0, y: 0 }, spec.inrun.keyframes, 0, spec.inrun.lengthMeters)
  const tail = rawInrun.lastPoint
  const inrunCurve = new ProfileCurve(
    { x: -tail.x, y: -tail.y },
    spec.inrun.keyframes,
    0,
    spec.inrun.lengthMeters,
  )

  const landingStart: Vec2 = { x: 0, y: -spec.tableClearanceMeters }
  const landingCurve = new ProfileCurve(landingStart, spec.landingKeyframes, 0, spec.uPointMeters)
  const outrunCurve = new ProfileCurve(
    landingCurve.lastPoint,
    spec.outrunKeyframes,
    spec.uPointMeters,
    spec.outrunEndMeters,
  )
  const surfaceCurves = [landingCurve, outrunCurve] as const

  const curveFor = (distanceMeters: number): ProfileCurve =>
    distanceMeters <= spec.uPointMeters ? landingCurve : outrunCurve

  const surfacePositionAt = (distanceMeters: number): Vec2 => curveFor(distanceMeters).positionAt(distanceMeters)

  const hill: Hill = {
    spec,
    inrunCurve,
    landingCurve,
    outrunCurve,
    surfaceCurves,
    gates: spec.inrun.gates,
    markers: {
      tableEdge: { x: 0, y: 0 },
      pPoint: surfacePositionAt(spec.pPointMeters),
      kPoint: surfacePositionAt(spec.kPointMeters),
      hillSize: surfacePositionAt(spec.hillSizeMeters),
      uPoint: surfacePositionAt(spec.uPointMeters),
      fallLine: surfacePositionAt(spec.fallLineMeters),
    },
    surfacePositionAt,
    surfaceSlopeRadAt: (distanceMeters) => curveFor(distanceMeters).slopeRadAt(distanceMeters),
    surfaceNormalAt: (distanceMeters) => curveFor(distanceMeters).normalAt(distanceMeters),
    surfaceDistanceAtPoint: (point) =>
      point.x <= landingCurve.lastPoint.x
        ? landingCurve.distanceAtPoint(point)
        : outrunCurve.distanceAtPoint(point),
    surfaceYAtX: (x) => (x <= landingCurve.lastPoint.x ? landingCurve.surfaceYAtX(x) : outrunCurve.surfaceYAtX(x)),
    gate: (number) => {
      const gate = spec.inrun.gates.find((candidate) => candidate.number === number)
      if (!gate) throw new Error(`Skocznia ${spec.id} nie ma belki ${number}.`)
      return gate
    },
  }

  return hill
}

export type HillValidationIssue = { readonly code: string; readonly detail: string }

/** P05 — walidacja danych: brak NaN, porządek punktów, K < HS, monotoniczność. */
export function validateHill(hill: Hill): HillValidationIssue[] {
  const issues: HillValidationIssue[] = []
  const { spec } = hill

  if (!(spec.kPointMeters < spec.hillSizeMeters)) {
    issues.push({ code: 'k-not-below-hs', detail: `K=${spec.kPointMeters} HS=${spec.hillSizeMeters}` })
  }

  if (!supportsModernScoringK(spec.kPointMeters)) {
    issues.push({ code: 'unsupported-k-point', detail: `brak tabeli pkt/m dla K${spec.kPointMeters}` })
  }

  const ordered = [spec.pPointMeters, spec.kPointMeters, spec.hillSizeMeters, spec.uPointMeters, spec.fallLineMeters]
  for (let index = 1; index < ordered.length; index += 1) {
    const before = ordered[index - 1]
    const after = ordered[index]
    if (before === undefined || after === undefined || !(before < after)) {
      issues.push({ code: 'marker-order', detail: `pozycja ${index}: ${before} → ${after}` })
    }
  }

  if (spec.fallLineMeters > spec.outrunEndMeters) {
    issues.push({ code: 'fall-line-outside-outrun', detail: `${spec.fallLineMeters} > ${spec.outrunEndMeters}` })
  }

  const landingJoin = hill.landingCurve.lastPoint
  const outrunStart = hill.outrunCurve.firstPoint
  if (Math.hypot(landingJoin.x - outrunStart.x, landingJoin.y - outrunStart.y) > 1e-6) {
    issues.push({ code: 'surface-discontinuity', detail: 'zeskok i wybieg nie stykają się w punkcie U' })
  }

  for (const [name, curve] of [
    ['rozbieg', hill.inrunCurve],
    ['zeskok', hill.landingCurve],
    ['wybieg', hill.outrunCurve],
  ] as const) {
    let previous = curve.firstPoint
    for (let index = 1; index < curve.points.length; index += 1) {
      const point = curve.points[index]
      if (!point) continue
      if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
        issues.push({ code: 'nan-in-curve', detail: `${name} indeks ${index}` })
        break
      }
      if (!(point.x > previous.x)) {
        issues.push({ code: 'x-not-monotonic', detail: `${name} indeks ${index}` })
        break
      }
      previous = point
    }
  }

  // Belki są uporządkowane rosnąco po numerze; wyższy numer = wyższa belka,
  // czyli dłuższy odcinek rozpędzania.
  let previousGateLength = 0
  for (const gate of hill.gates) {
    if (!Number.isFinite(gate.inrunLengthMeters) || gate.inrunLengthMeters <= 0) {
      issues.push({ code: 'gate-length-invalid', detail: `belka ${gate.number}` })
    }
    if (gate.inrunLengthMeters > spec.inrun.lengthMeters) {
      issues.push({ code: 'gate-above-inrun', detail: `belka ${gate.number}` })
    }
    if (!(gate.inrunLengthMeters > previousGateLength)) {
      issues.push({ code: 'gate-order', detail: `belka ${gate.number} nie jest wyżej od poprzedniej` })
    }
    previousGateLength = gate.inrunLengthMeters
  }

  if (spec.windMeasurement.sensors.length === 0) {
    issues.push({ code: 'wind-sensors-empty', detail: 'brak punktów pomiaru wiatru' })
  }
  for (const sensor of spec.windMeasurement.sensors) {
    if (!Number.isFinite(sensor.distanceMeters) || sensor.distanceMeters < 0 || sensor.distanceMeters > spec.outrunEndMeters) {
      issues.push({ code: 'wind-sensor-outside-hill', detail: `${sensor.distanceMeters} m` })
    }
    if (!Number.isFinite(sensor.weight) || sensor.weight <= 0) {
      issues.push({ code: 'wind-sensor-weight', detail: `${sensor.weight}` })
    }
  }

  const compensation = spec.compensation
  if (compensation.provenance !== 'official-reference' && compensation.provenance !== 'simulation-calibrated') {
    issues.push({ code: 'compensation-provenance', detail: compensation.provenance })
  }
  if (!spec.inrun.gates.some((gate) => gate.number === compensation.referenceGateNumber)) {
    issues.push({ code: 'compensation-reference-gate', detail: `${compensation.referenceGateNumber}` })
  }
  for (const [name, factor] of [
    ['head', compensation.headWindFactorTenthsPerMps],
    ['tail', compensation.tailWindFactorTenthsPerMps],
    ['gate', compensation.gateFactorTenthsPerInrunMeter],
  ] as const) {
    if (!Number.isInteger(factor) || factor < 0) {
      issues.push({ code: 'compensation-factor', detail: `${name}=${factor}` })
    }
  }
  if (!Number.isInteger(compensation.coachThresholdHalfMeters)
    || compensation.coachThresholdHalfMeters !== Math.floor(spec.hillSizeMeters * 0.95 * 2 + 1e-9)) {
    issues.push({ code: 'coach-threshold', detail: `${compensation.coachThresholdHalfMeters} half-m` })
  }

  const safety = spec.safety
  if (!spec.inrun.gates.some((gate) => gate.number === safety.referenceGateNumber)) {
    issues.push({ code: 'safety-reference-gate', detail: `${safety.referenceGateNumber}` })
  }
  for (const [name, value] of [
    ['reference-distance', safety.referenceDistanceMeters],
    ['safe-target', safety.safeTargetMeters],
    ['telemark-impossible', safety.telemarkImpossibleMeters],
    ['parallel-impossible', safety.parallelImpossibleMeters],
  ] as const) {
    if (!Number.isFinite(value) || value <= 0) {
      issues.push({ code: 'safety-distance', detail: `${name}=${value}` })
    }
  }
  if (!Number.isFinite(safety.autoHeadwindEffectScale)
    || safety.autoHeadwindEffectScale <= 0
    || safety.autoHeadwindEffectScale > 1) {
    issues.push({ code: 'safety-auto-headwind-scale', detail: `${safety.autoHeadwindEffectScale}` })
  }
  if (!(safety.telemarkImpossibleMeters > spec.hillSizeMeters)) {
    issues.push({ code: 'safety-telemark-hs', detail: `${safety.telemarkImpossibleMeters} <= HS${spec.hillSizeMeters}` })
  }
  if (!(safety.parallelImpossibleMeters > safety.telemarkImpossibleMeters)) {
    issues.push({ code: 'safety-parallel-order', detail: `${safety.parallelImpossibleMeters} <= ${safety.telemarkImpossibleMeters}` })
  }

  return issues
}
