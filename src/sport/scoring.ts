/**
 * P09 — punktacja długości i stylu w profilu Modern.
 *
 * Rdzeń używa wyłącznie liczb całkowitych: odległość w połówkach metra,
 * punkty i noty w dziesiątych. Formatowanie tekstu należy do widoku.
 */

export type MeterBand = {
  readonly minK: number
  readonly maxK: number | null
  readonly meterValueTenths: number
}

export const MODERN_RULES = {
  id: 'modern-2026.1',
  version: 'pkg008-rules-6',
  meterBands: [
    { minK: 20, maxK: 24, meterValueTenths: 48 },
    { minK: 25, maxK: 29, meterValueTenths: 44 },
    { minK: 30, maxK: 34, meterValueTenths: 40 },
    { minK: 35, maxK: 39, meterValueTenths: 36 },
    { minK: 40, maxK: 49, meterValueTenths: 32 },
    { minK: 50, maxK: 59, meterValueTenths: 28 },
    { minK: 60, maxK: 69, meterValueTenths: 24 },
    { minK: 70, maxK: 79, meterValueTenths: 22 },
    { minK: 80, maxK: 99, meterValueTenths: 20 },
    { minK: 100, maxK: 134, meterValueTenths: 18 },
    { minK: 135, maxK: 164, meterValueTenths: 16 },
    { minK: 180, maxK: null, meterValueTenths: 12 },
  ] satisfies readonly MeterBand[],
} as const

export function meterValueTenthsForK(kPointMeters: number): number {
  if (!Number.isInteger(kPointMeters)) {
    throw new Error(`Punkt K musi być całkowitą liczbą metrów: ${kPointMeters}.`)
  }
  const band = MODERN_RULES.meterBands.find(({ minK, maxK }) =>
    kPointMeters >= minK && (maxK === null || kPointMeters <= maxK),
  )
  if (!band) throw new Error(`Brak współczynnika pkt/m dla K${kPointMeters}.`)
  return band.meterValueTenths
}

export function supportsModernKPoint(kPointMeters: number): boolean {
  try {
    meterValueTenthsForK(kPointMeters)
    return true
  } catch {
    return false
  }
}

/** FIS VDM: wynik obcinamy w dół do pełnego lub połówkowego metra. */
export function truncateDistanceToHalfMeters(distanceMeters: number): number {
  if (!Number.isFinite(distanceMeters) || distanceMeters < 0) {
    throw new Error(`Nieprawidłowa odległość: ${distanceMeters}.`)
  }
  // Mały margines chroni dokładne połówki powstałe z obliczeń binarnych.
  return Math.floor(distanceMeters * 2 + 1e-9)
}

export function distancePointsTenths(kPointMeters: number, distanceHalfMeters: number): number {
  if (!Number.isInteger(distanceHalfMeters) || distanceHalfMeters < 0) {
    throw new Error(`Odległość musi być zapisana w połówkach metra: ${distanceHalfMeters}.`)
  }
  const meterValueTenths = meterValueTenthsForK(kPointMeters)
  const baseTenths = kPointMeters >= 180 ? 1200 : 600
  const differenceHalfMeters = distanceHalfMeters - kPointMeters * 2
  // Wszystkie współczynniki tabeli są parzyste w dziesiątych pkt/m.
  return baseTenths + differenceHalfMeters * (meterValueTenths / 2)
}

export type StyleCategory = 'flight' | 'landing' | 'outrun'

export type StyleFaultCode =
  | 'takeoff-too-early'
  | 'takeoff-too-late'
  | 'excessive-pitch'
  | 'late-landing-prep'
  | 'no-telemark'
  | 'one-hand-support'
  | 'two-hand-support'
  | 'fall-before-fall-line'
  | 'unstable-outrun'

export type StyleFault = {
  readonly category: StyleCategory
  readonly code: StyleFaultCode
  readonly deductionTenths: number
  /** Kary literalne FIS (brak telemarku, upadek) nie podlegają profilowi. */
  readonly profileSensitive: boolean
}

export type StyleAssessmentInput = {
  readonly takeoffTimingOffsetSeconds: number | null
  readonly meanFlightPostureErrorDeg: number
  readonly landingStyle: 'telemark' | 'parallel' | 'none'
  readonly landingReadiness: number
  readonly landingSupportHands: 0 | 1 | 2
  readonly status: 'landed' | 'fall'
  readonly contactDistanceMeters: number
  readonly fallLineMeters: number
  readonly reachedFallLine: boolean
}

/**
 * P42 runda 11: bazowa surowość sędziów jest kalibracją ADAPT, nie losowaniem.
 * Oficjalne noty z Wisły K120/HS134 (trzy datowane konkursy FIS, 232 skoki,
 * 1160 not; `docs/evidence/PKG-008/hill-geometry-fis.md` §8–§9) mają medianę
 * 17,5, kwartyle 17,0–18,0, 0,3% not ≥19,5 i 0,0% not 20,0. Na punkcie K
 * skok bez błędów dostaje 16,5–18,5 (mediana 17,5); runda 15 dodaje opisaną
 * niżej, ograniczoną dodatnią jakość za dalszy dystans.
 */
export const JUDGE_PROFILES = [
  { id: 'flight-strict', cleanJumpDeductionTenths: 35, adjustment: { flight: 5, landing: 0, outrun: 0 } },
  { id: 'landing-strict', cleanJumpDeductionTenths: 30, adjustment: { flight: 0, landing: 5, outrun: 0 } },
  { id: 'neutral', cleanJumpDeductionTenths: 25, adjustment: { flight: 0, landing: 0, outrun: 0 } },
  { id: 'flight-lenient', cleanJumpDeductionTenths: 20, adjustment: { flight: -5, landing: 0, outrun: 0 } },
  { id: 'landing-lenient', cleanJumpDeductionTenths: 15, adjustment: { flight: 0, landing: -5, outrun: 0 } },
] as const

export type JudgeMarksContext = {
  readonly distanceHalfMeters: number
  readonly kPointMeters: number
  readonly hillSizeMeters: number
  readonly landingStyle: 'telemark' | 'parallel' | 'none'
  readonly landingSupportHands: 0 | 1 | 2
  readonly status: 'landed' | 'fall'
}

function halfPointTenths(valueTenths: number): number {
  return Math.max(0, Math.round(valueTenths / 5) * 5)
}

function timingFault(offsetSeconds: number | null): StyleFault | null {
  if (offsetSeconds === null) {
    return { category: 'flight', code: 'takeoff-too-late', deductionTenths: 20, profileSensitive: true }
  }
  const magnitude = Math.abs(offsetSeconds)
  if (magnitude < 0.035) return null
  const deductionTenths = Math.min(25, 5 + Math.floor((magnitude - 0.035) / 0.04) * 5)
  return {
    category: 'flight',
    code: offsetSeconds > 0 ? 'takeoff-too-early' : 'takeoff-too-late',
    deductionTenths,
    profileSensitive: true,
  }
}

/**
 * Tworzy wspólny, uporządkowany dziennik błędów. W każdej kategorii pozostaje
 * najwyżej jedna kara — ten sam kontakt nie może być policzony dwa razy.
 */
export function buildStyleJournal(input: StyleAssessmentInput): StyleFault[] {
  const candidates: StyleFault[] = []
  const timing = timingFault(input.takeoffTimingOffsetSeconds)
  if (timing) candidates.push(timing)

  if (input.meanFlightPostureErrorDeg >= 8) {
    candidates.push({
      category: 'flight',
      code: 'excessive-pitch',
      deductionTenths: Math.min(30, halfPointTenths(5 + (input.meanFlightPostureErrorDeg - 8) * 0.8)),
      profileSensitive: true,
    })
  }

  if (input.landingStyle !== 'telemark') {
    candidates.push({ category: 'landing', code: 'no-telemark', deductionTenths: 30, profileSensitive: false })
  } else if (input.landingReadiness < 0.9) {
    candidates.push({
      category: 'landing',
      code: 'late-landing-prep',
      deductionTenths: input.landingReadiness < 0.5 ? 20 : 10,
      profileSensitive: true,
    })
  }

  if (input.status === 'fall' && input.contactDistanceMeters < input.fallLineMeters) {
    candidates.push({
      category: 'outrun',
      code: 'fall-before-fall-line',
      deductionTenths: 70,
      profileSensitive: false,
    })
  } else if (input.landingSupportHands === 2) {
    // FIS Style Judging Guidelines (15.06.2024), Outrun: obie dłonie =
    // utrata kontroli, 4,0–5,0 pkt. Deterministyczny środek zakresu: 4,5.
    candidates.push({ category: 'outrun', code: 'two-hand-support', deductionTenths: 45, profileSensitive: false })
  } else if (input.landingSupportHands === 1) {
    // Ten sam dokument: dotknięcie powierzchni jedną dłonią = dokładnie 3,0 pkt.
    candidates.push({ category: 'outrun', code: 'one-hand-support', deductionTenths: 30, profileSensitive: false })
  } else if (!input.reachedFallLine) {
    candidates.push({ category: 'outrun', code: 'unstable-outrun', deductionTenths: 10, profileSensitive: true })
  }

  const byCategory = new Map<StyleCategory, StyleFault>()
  for (const fault of candidates) {
    const current = byCategory.get(fault.category)
    if (!current || fault.deductionTenths > current.deductionTenths) byCategory.set(fault.category, fault)
  }
  return (['flight', 'landing', 'outrun'] as const)
    .map((category) => byCategory.get(category))
    .filter((fault): fault is StyleFault => fault !== undefined)
}

/**
 * Runda 15: dodatnia jakość odległości jest jawna i deterministyczna.
 * Do HS bonus rośnie o 0,5 co 5 m ponad K (maks. 1,0). Za HS dochodzi
 * kolejne 0,5 co 2,5 m, do 2,0 przy HS+5. Nota 20,0 jest odblokowana dopiero
 * dalej niż HS+5 i tylko dla telemarku. Oficjalne PDF FIS potwierdzają dodatnią
 * korelację dystans↔nota, ale nie rozpoznają stylu; zakresy stylów są DESIGN.
 */
function distanceQualityBonusTenths(
  distanceHalfMeters: number,
  kPointMeters: number,
  hillSizeMeters: number,
  landed: boolean,
): number {
  if (!landed) return 0
  const kHalfMeters = kPointMeters * 2
  const hsHalfMeters = hillSizeMeters * 2
  if (distanceHalfMeters <= kHalfMeters) return 0
  if (distanceHalfMeters <= hsHalfMeters) {
    return Math.min(10, Math.floor((distanceHalfMeters - kHalfMeters) / 10) * 5)
  }
  return 10 + Math.min(10, Math.floor((distanceHalfMeters - hsHalfMeters) / 5) * 5)
}

export function judgeMarksTenths(
  journal: readonly StyleFault[],
  context: JudgeMarksContext,
): [number, number, number, number, number] {
  if (!Number.isInteger(context.distanceHalfMeters) || context.distanceHalfMeters < 0) {
    throw new Error(`Odległość not sędziowskich musi być zapisana w połówkach metra: ${context.distanceHalfMeters}.`)
  }
  const distanceBonus = distanceQualityBonusTenths(
    context.distanceHalfMeters,
    context.kPointMeters,
    context.hillSizeMeters,
    context.status === 'landed',
  )
  const marks = JUDGE_PROFILES.map((profile, profileIndex) => {
    let deductions = profile.cleanJumpDeductionTenths - distanceBonus
    for (const fault of journal) {
      const adjusted = fault.profileSensitive
        ? fault.deductionTenths + profile.adjustment[fault.category]
        : fault.deductionTenths
      deductions += halfPointTenths(adjusted)
    }
    const raw = Math.max(0, 200 - deductions)
    if (context.status === 'landed' && context.landingSupportHands > 0) {
      // Polecenie użytkownika ma pierwszeństwo nad bonusem i innymi korektami.
      // Dwie dłonie zachowują zaakceptowany profil; jedna dłoń trafia w ten sam
      // docelowy zakres 12,0–14,0 zamiast wcześniejszego 13,5–15,5.
      return 120 + profileIndex * 5
    }
    if (context.status === 'landed' && context.distanceHalfMeters > context.hillSizeMeters * 2) {
      if (context.landingStyle === 'parallel') return Math.max(150, Math.min(175, raw))
      if (context.landingStyle === 'telemark') {
        const exceptional = context.distanceHalfMeters > (context.hillSizeMeters + 5) * 2
        return Math.max(170, Math.min(exceptional ? 200 : 195, raw))
      }
    }
    // Przed/na HS typowy skok nie dostaje 20,0 samą odległością.
    return Math.min(context.status === 'landed' ? 195 : 200, raw)
  })
  return marks as [number, number, number, number, number]
}

/** Prognoza czystego stylu używana przez linię celu prowadzenia. */
function predictedMarkTenths(
  base: number,
  bonus: number,
  beyondHs: boolean,
  exceptional: boolean,
  landingStyle: 'telemark' | 'parallel',
): number {
  const raw = base + bonus
  if (beyondHs && landingStyle === 'parallel') return Math.max(150, Math.min(175, raw))
  if (beyondHs) return Math.max(170, Math.min(exceptional ? 200 : 195, raw))
  return Math.min(195, raw)
}

export function predictedStylePointsTenths(
  distanceHalfMeters: number,
  kPointMeters: number,
  hillSizeMeters: number,
  landingStyle: 'telemark' | 'parallel' = 'telemark',
): number {
  if (!Number.isInteger(distanceHalfMeters) || distanceHalfMeters < 0) {
    throw new Error(`Odległość prognozy stylu musi być zapisana w połówkach metra: ${distanceHalfMeters}.`)
  }
  const bonus = distanceQualityBonusTenths(distanceHalfMeters, kPointMeters, hillSizeMeters, true)
  // Profile są uporządkowane rosnąco, więc po odrzuceniu skrajnych zawsze
  // pozostają indeksy 1–3. Liczymy je bez tablic/map/sortowania, ponieważ
  // solver celu wywołuje tę funkcję dla każdej połówki metra w każdej klatce.
  const beyondHs = distanceHalfMeters > hillSizeMeters * 2
  const exceptional = distanceHalfMeters > (hillSizeMeters + 5) * 2
  if (landingStyle === 'telemark') {
    return predictedMarkTenths(170, bonus, beyondHs, exceptional, landingStyle)
      + predictedMarkTenths(175, bonus, beyondHs, exceptional, landingStyle)
      + predictedMarkTenths(180, bonus, beyondHs, exceptional, landingStyle)
  }
  return predictedMarkTenths(140, bonus, beyondHs, exceptional, landingStyle)
    + predictedMarkTenths(145, bonus, beyondHs, exceptional, landingStyle)
    + predictedMarkTenths(150, bonus, beyondHs, exceptional, landingStyle)
}

export type StylePoints = {
  readonly pointsTenths: number
  readonly droppedJudgeIndexes: readonly [number, number]
  readonly retainedJudgeIndexes: readonly [number, number, number]
}

/** Odrzuca dokładnie jedną najniższą i jedną najwyższą notę. */
export function stylePointsTenths(marksTenths: readonly number[]): StylePoints {
  if (marksTenths.length !== 5) throw new Error(`Wymagane jest dokładnie pięć not, otrzymano ${marksTenths.length}.`)
  for (const mark of marksTenths) {
    if (!Number.isInteger(mark) || mark < 0 || mark > 200 || mark % 5 !== 0) {
      throw new Error(`Nota musi należeć do zakresu 0–20 co 0,5: ${mark}.`)
    }
  }

  const ordered = marksTenths
    .map((value, index) => ({ value, index }))
    .sort((left, right) => left.value - right.value || left.index - right.index)
  const low = ordered[0]
  const high = ordered[ordered.length - 1]
  if (!low || !high || low.index === high.index) throw new Error('Nie można wybrać dwóch skrajnych not.')

  const retained = marksTenths
    .map((_, index) => index)
    .filter((index) => index !== low.index && index !== high.index)
  if (retained.length !== 3) throw new Error('Po odrzuceniu skrajnych muszą pozostać trzy noty.')

  return {
    pointsTenths: retained.reduce((sum, index) => sum + (marksTenths[index] ?? 0), 0),
    droppedJudgeIndexes: [low.index, high.index],
    retainedJudgeIndexes: retained as [number, number, number],
  }
}

export function totalBeforeCompensationTenths(distanceTenths: number, styleTenths: number): number {
  if (!Number.isInteger(distanceTenths) || !Number.isInteger(styleTenths)) {
    throw new Error('Składowe wyniku muszą być liczbami całkowitymi w dziesiątych punktu.')
  }
  return Math.max(0, distanceTenths + styleTenths)
}
