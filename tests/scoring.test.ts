import { describe, expect, it } from 'vitest'
import {
  MODERN_RULES,
  buildStyleJournal,
  distancePointsTenths,
  judgeMarksTenths,
  meterValueTenthsForK,
  predictedStylePointsTenths,
  stylePointsTenths,
  totalBeforeCompensationTenths,
  truncateDistanceToHalfMeters,
  type StyleAssessmentInput,
  type JudgeMarksContext,
} from '../src/sport/scoring'
import { createTrainingJumpResult } from '../src/sport/jumpResult'
import { runJump } from './support/jumpHarness'

const CLEAN: StyleAssessmentInput = {
  takeoffTimingOffsetSeconds: 0,
  meanFlightPostureErrorDeg: 0,
  landingStyle: 'telemark',
  landingReadiness: 1,
  landingSupportHands: 0,
  status: 'landed',
  contactDistanceMeters: 130,
  fallLineMeters: 205,
  reachedFallLine: true,
}

function judgeContext(
  distanceMeters: number,
  landingStyle: JudgeMarksContext['landingStyle'] = 'telemark',
  landingSupportHands: JudgeMarksContext['landingSupportHands'] = 0,
  status: JudgeMarksContext['status'] = 'landed',
): JudgeMarksContext {
  return {
    distanceHalfMeters: distanceMeters * 2,
    kPointMeters: 120,
    hillSizeMeters: 134,
    landingStyle,
    landingSupportHands,
    status,
  }
}

function marksAt(
  distanceMeters: number,
  landingStyle: 'telemark' | 'parallel',
  supportHands: 0 | 1 | 2 = 0,
): [number, number, number, number, number] {
  const input = { ...CLEAN, contactDistanceMeters: distanceMeters, landingStyle, landingSupportHands: supportHands }
  return judgeMarksTenths(buildStyleJournal(input), judgeContext(distanceMeters, landingStyle, supportHands))
}

describe('P09 / Q-FIS-01–02 — długość', () => {
  it('stosuje tabelę pkt/m na obu końcach każdego zdefiniowanego zakresu', () => {
    const expected = [
      [20, 24, 48], [25, 29, 44], [30, 34, 40], [35, 39, 36],
      [40, 49, 32], [50, 59, 28], [60, 69, 24], [70, 79, 22],
      [80, 99, 20], [100, 134, 18], [135, 164, 16],
    ] as const
    for (const [min, max, value] of expected) {
      expect(meterValueTenthsForK(min)).toBe(value)
      expect(meterValueTenthsForK(max)).toBe(value)
    }
    expect(meterValueTenthsForK(180)).toBe(12)
    expect(meterValueTenthsForK(240)).toBe(12)
    for (const unsupported of [19, 165, 170, 179]) {
      expect(() => meterValueTenthsForK(unsupported)).toThrow(/Brak współczynnika/)
    }
  })

  it('odtwarza wektory K120/130 m i K200/210 m', () => {
    expect(distancePointsTenths(120, 260)).toBe(780)
    expect(distancePointsTenths(200, 420)).toBe(1320)
    expect(distancePointsTenths(90, 190)).toBe(700)
  })

  it('obcina kontakt do niższej połówki metra', () => {
    expect(truncateDistanceToHalfMeters(132.49)).toBe(264)
    expect(truncateDistanceToHalfMeters(132.5)).toBe(265)
  })
})

describe('P09 / Q-FIS-03–04 — noty i rozłączne kategorie', () => {
  it('usuwa dokładnie jedną najwyższą i jedną najniższą notę także przy duplikatach', () => {
    const result = stylePointsTenths([180, 185, 190, 185, 180])
    expect(result.pointsTenths).toBe(550)
    expect(result.droppedJudgeIndexes).toHaveLength(2)
    expect(new Set(result.droppedJudgeIndexes).size).toBe(2)

    const allEqual = stylePointsTenths([180, 180, 180, 180, 180])
    expect(allEqual.pointsTenths).toBe(540)
    expect(new Set(allEqual.droppedJudgeIndexes).size).toBe(2)
  })

  it('czysty skok trafia w medianę skalibrowanych not FIS', () => {
    // Wisła K120/HS134: mediana 1160 oficjalnych not = 17,5; profile dają
    // [16,5; 17,0; 17,5; 18,0; 18,5], więc 19,5+ nie wynika z samego braku błędów.
    expect(judgeMarksTenths(buildStyleJournal(CLEAN), judgeContext(120))).toEqual([165, 170, 175, 180, 185])
    expect(stylePointsTenths([165, 170, 175, 180, 185]).pointsTenths).toBe(525)
  })

  it('brak telemarku odejmuje dokładnie 3,0 u każdego sędziego', () => {
    const telemark = judgeMarksTenths(buildStyleJournal(CLEAN), judgeContext(120))
    const parallel = judgeMarksTenths(
      buildStyleJournal({ ...CLEAN, landingStyle: 'parallel' }),
      judgeContext(120, 'parallel'),
    )
    expect(parallel.map((mark, index) => (telemark[index] ?? 0) - mark)).toEqual([30, 30, 30, 30, 30])
  })

  it('telemark, dwie nogi i upadek trafiają do odrębnych kategorii bez duplikacji', () => {
    expect(buildStyleJournal(CLEAN)).toEqual([])

    const parallel = buildStyleJournal({ ...CLEAN, landingStyle: 'parallel' })
    expect(parallel).toMatchObject([{ category: 'landing', code: 'no-telemark', deductionTenths: 30 }])

    const fall = buildStyleJournal({
      ...CLEAN,
      landingStyle: 'none',
      status: 'fall',
      contactDistanceMeters: 130,
      reachedFallLine: false,
    })
    expect(fall.filter((fault) => fault.category === 'landing')).toHaveLength(1)
    expect(fall.filter((fault) => fault.category === 'outrun')).toHaveLength(1)
    expect(fall.find((fault) => fault.code === 'fall-before-fall-line')?.deductionTenths).toBe(70)
  })

  it('ocenia podpórkę zgodnie z tabelą FIS: jedna dłoń 3,0, obie 4,5 pkt', () => {
    const oneHand = buildStyleJournal({ ...CLEAN, landingSupportHands: 1 })
    const twoHands = buildStyleJournal({ ...CLEAN, landingSupportHands: 2 })

    expect(oneHand).toContainEqual({
      category: 'outrun', code: 'one-hand-support', deductionTenths: 30, profileSensitive: false,
    })
    expect(twoHands).toContainEqual({
      category: 'outrun', code: 'two-hand-support', deductionTenths: 45, profileSensitive: false,
    })
    expect(judgeMarksTenths(oneHand, judgeContext(130, 'telemark', 1))).toEqual([120, 125, 130, 135, 140])
    expect(judgeMarksTenths(twoHands, judgeContext(130, 'telemark', 2))).toEqual([120, 125, 130, 135, 140])
  })

  it.each([
    [120, 'telemark', [165, 170, 175, 180, 185]],
    [125, 'telemark', [170, 175, 180, 185, 190]],
    [134, 'telemark', [175, 180, 185, 190, 195]],
    [135, 'telemark', [175, 180, 185, 190, 195]],
    [139, 'telemark', [185, 190, 195, 195, 195]],
    [120, 'parallel', [135, 140, 145, 150, 155]],
    [125, 'parallel', [140, 145, 150, 155, 160]],
    [134, 'parallel', [145, 150, 155, 160, 165]],
    [135, 'parallel', [150, 150, 155, 160, 165]],
    [139, 'parallel', [155, 160, 165, 170, 175]],
  ] as const)('dystans %s m, %s: daje jawny profil %j', (distance, style, expected) => {
    expect(marksAt(distance, style)).toEqual(expected)
  })

  it('poza HS utrzymuje zakresy stylów i nadrzędny zakres podpórek', () => {
    for (const distance of [135, 139]) {
      const telemark = marksAt(distance, 'telemark')
      const parallel = marksAt(distance, 'parallel')
      expect(Math.min(...telemark)).toBeGreaterThanOrEqual(170)
      expect(Math.max(...telemark)).toBeLessThanOrEqual(195)
      expect(Math.min(...parallel)).toBeGreaterThanOrEqual(150)
      expect(Math.max(...parallel)).toBeLessThanOrEqual(175)
      expect(marksAt(distance, 'telemark', 1)).toEqual([120, 125, 130, 135, 140])
      expect(marksAt(distance, 'telemark', 2)).toEqual([120, 125, 130, 135, 140])
      expect(marksAt(distance, 'parallel', 1)).toEqual([120, 125, 130, 135, 140])
      expect(marksAt(distance, 'parallel', 2)).toEqual([120, 125, 130, 135, 140])
    }
    expect(marksAt(139, 'telemark')).not.toContain(200)
    expect(marksAt(139.5, 'telemark')).toContain(200)
    expect(marksAt(139.5, 'parallel')).not.toContain(200)
  })

  it('jest niemalejąca co pół metra i deterministyczna dla tych samych błędów', () => {
    for (const style of ['telemark', 'parallel'] as const) {
      let previous = marksAt(120, style)
      for (let halfMeters = 241; halfMeters <= 290; halfMeters += 1) {
        const distance = halfMeters / 2
        const current = marksAt(distance, style)
        expect(current).toEqual(marksAt(distance, style))
        current.forEach((mark, index) => expect(mark).toBeGreaterThanOrEqual(previous[index] ?? 0))
        previous = current
      }
    }
    expect(predictedStylePointsTenths(270, 120, 134, 'telemark')).toBe(
      stylePointsTenths(marksAt(135, 'telemark')).pointsTenths,
    )
  })

  it('upadek zachowuje surowe reguły niezależnie od dystansu', () => {
    const fallInput = { ...CLEAN, landingStyle: 'none' as const, status: 'fall' as const, reachedFallLine: false }
    const journal = buildStyleJournal(fallInput)
    expect(judgeMarksTenths(journal, judgeContext(130, 'none', 0, 'fall'))).toEqual(
      judgeMarksTenths(journal, judgeContext(150, 'none', 0, 'fall')),
    )
  })

  it('ogranicza wyłącznie sumę długość+styl do zera', () => {
    expect(totalBeforeCompensationTenths(-900, 300)).toBe(0)
    expect(totalBeforeCompensationTenths(780, 550)).toBe(1330)
  })
})

describe('P09/P12/P13 — wynik zakończonej próby', () => {
  it('redukuje symulację do pełnych liczbowych składowych wyniku', () => {
    const sim = runJump({ gate: 8, pilot: 'ideal', style: 'telemark' })
    const result = createTrainingJumpResult(sim, 1)
    expect(result.context).toBe('training')
    expect(result.distanceHalfMeters).toBe(Math.floor((sim.measuredDistanceMeters ?? 0) * 2 + 1e-9))
    expect(result.marksTenths).toHaveLength(5)
    expect(Object.keys(result.componentTenths)).toEqual(['distance', 'style', 'wind', 'juryGate', 'coachGate'])
    expect(result.collectiveTenths).toBe(Math.max(0, result.componentTenths.distance + result.componentTenths.style))
    expect(result.totalTenths).toBe(Math.max(
      0,
      result.collectiveTenths
        + result.componentTenths.wind
        + result.componentTenths.juryGate
        + result.componentTenths.coachGate,
    ))
    expect(result.gate.provenance).toBe('simulation-calibrated')
    expect(result.componentTenths.coachGate).toBe(0)
    expect(result.versions.rules).toBe(MODERN_RULES.version)
  })

  it('przenosi podpórkę z symulacji do wyniku i not sędziów', () => {
    const sim = runJump({ gate: 8, pilot: 'ideal', style: 'telemark', prepFlightSeconds: 0.5 })
    const result = createTrainingJumpResult(sim, 1)

    expect(result.status).toBe('landed')
    expect(result.landingSupportHands).toBe(1)
    expect(result.faults.some((fault) => fault.code === 'one-hand-support' && fault.deductionTenths === 30)).toBe(true)
    // Zakres jednej dłoni 12,0–14,0 ma pierwszeństwo nad bonusem i pozostałymi
    // korektami; dwie dłonie zachowują ten sam zaakceptowany profil.
    expect(result.marksTenths).toEqual([120, 125, 130, 135, 140])
  })
})
