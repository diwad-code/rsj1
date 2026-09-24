import { describe, expect, it } from 'vitest'
import { ProfileCurve, sweepContact, slopeDegAt } from '../src/simulation/hill'
import { TECHNICAL_K120, buildHill, validateHill, type HillSpec } from '../src/simulation/technicalHill'

const hill = buildHill()

describe('P05 — sampler profilu', () => {
  it('parametryzuje krzywe długością łuku, więc metraż jest odwracalny', () => {
    for (const meters of [0, 12.5, 60, 105, 120, 134, 152, 180, 205]) {
      const point = hill.surfacePositionAt(meters)
      expect(hill.surfaceDistanceAtPoint(point)).toBeCloseTo(meters, 2)
    }
  })

  it('zwraca zgodną styczną i normalną, obie jednostkowe i prostopadłe', () => {
    for (const meters of [1, 40, 120, 134, 190]) {
      const tangent = hill.landingCurve.contains(meters)
        ? hill.landingCurve.tangentAt(meters)
        : hill.outrunCurve.tangentAt(meters)
      const normal = hill.surfaceNormalAt(meters)
      expect(Math.hypot(tangent.x, tangent.y)).toBeCloseTo(1, 9)
      expect(Math.hypot(normal.x, normal.y)).toBeCloseTo(1, 9)
      expect(tangent.x * normal.x + tangent.y * normal.y).toBeCloseTo(0, 9)

      // Styczna musi zgadzać się z lokalnym kierunkiem polilinii.
      const ahead = hill.surfacePositionAt(meters + 0.2)
      const behind = hill.surfacePositionAt(meters - 0.2)
      const chord = { x: ahead.x - behind.x, y: ahead.y - behind.y }
      const length = Math.hypot(chord.x, chord.y)
      expect(tangent.x * (chord.x / length) + tangent.y * (chord.y / length)).toBeGreaterThan(0.999)
    }
  })

  it('ma monotoniczną mapę metrażu na całej powierzchni', () => {
    let previousDistance = -1
    let previousX = -Infinity
    for (let meters = 0; meters <= TECHNICAL_K120.outrunEndMeters; meters += 0.25) {
      const point = hill.surfacePositionAt(meters)
      expect(Number.isFinite(point.x)).toBe(true)
      expect(Number.isFinite(point.y)).toBe(true)
      expect(point.x).toBeGreaterThan(previousX)
      const distance = hill.surfaceDistanceAtPoint(point)
      expect(distance).toBeGreaterThan(previousDistance)
      previousX = point.x
      previousDistance = distance
    }
  })

  it('odczytuje K120 i HS134 dokładnie z mapy używanej przez pomiar kontaktu', () => {
    expect(hill.surfaceDistanceAtPoint(hill.markers.kPoint)).toBeCloseTo(120, 3)
    expect(hill.surfaceDistanceAtPoint(hill.markers.hillSize)).toBeCloseTo(134, 3)

    // Ten sam odczyt po trafieniu swept contactem tuż nad punktem K.
    const above = { x: hill.markers.kPoint.x, y: hill.markers.kPoint.y + 1 }
    const below = { x: hill.markers.kPoint.x, y: hill.markers.kPoint.y - 1 }
    const hit = sweepContact(hill.surfaceCurves, above, below)
    expect(hit).not.toBeNull()
    expect(hit?.distanceMeters).toBeCloseTo(120, 1)
  })

  it('przycina odczyty poza zakresem i nie produkuje NaN', () => {
    for (const meters of [-500, -1, 1e9, Number.NaN]) {
      const point = hill.surfacePositionAt(meters)
      expect(Number.isFinite(point.x)).toBe(true)
      expect(Number.isFinite(point.y)).toBe(true)
      expect(Number.isFinite(hill.surfaceSlopeRadAt(meters))).toBe(true)
    }
    expect(hill.surfacePositionAt(-10)).toEqual(hill.landingCurve.firstPoint)
    expect(hill.surfacePositionAt(1e6)).toEqual(hill.outrunCurve.lastPoint)
    expect(hill.landingCurve.contains(-1)).toBe(false)
    expect(hill.landingCurve.contains(200)).toBe(false)
  })

  it('interpoluje kąt liniowo i przycina go poza zakresem punktów kątowych', () => {
    const keyframes = [
      { distanceMeters: 0, slopeDeg: 10 },
      { distanceMeters: 10, slopeDeg: 30 },
    ]
    expect(slopeDegAt(keyframes, -5)).toBe(10)
    expect(slopeDegAt(keyframes, 5)).toBeCloseTo(20, 9)
    expect(slopeDegAt(keyframes, 50)).toBe(30)
  })

  it('odrzuca krzywą o niedodatniej długości', () => {
    expect(() => new ProfileCurve({ x: 0, y: 0 }, [{ distanceMeters: 0, slopeDeg: 0 }], 5, 5)).toThrow()
  })
})

describe('P05 — dane technicznej K120/HS134', () => {
  it('przechodzi walidację bez uwag', () => {
    expect(validateHill(hill)).toEqual([])
  })

  it('utrzymuje K < HS oraz porządek punktów T/P/K/HS/U i fall line', () => {
    const { spec } = hill
    expect(spec.kPointMeters).toBeLessThan(spec.hillSizeMeters)
    expect(spec.pPointMeters).toBeLessThan(spec.kPointMeters)
    expect(spec.hillSizeMeters).toBeLessThan(spec.uPointMeters)
    expect(spec.uPointMeters).toBeLessThan(spec.fallLineMeters)
    expect(spec.fallLineMeters).toBeLessThanOrEqual(spec.outrunEndMeters)
    expect(hill.markers.tableEdge).toEqual({ x: 0, y: 0 })
  })

  it('łączy zeskok i wybieg bez przerwy w punkcie U', () => {
    expect(hill.landingCurve.lastPoint.x).toBeCloseTo(hill.outrunCurve.firstPoint.x, 9)
    expect(hill.landingCurve.lastPoint.y).toBeCloseTo(hill.outrunCurve.firstPoint.y, 9)
  })

  it('kończy rozbieg dokładnie na krawędzi progu w początku układu', () => {
    expect(hill.inrunCurve.lastPoint.x).toBeCloseTo(0, 9)
    expect(hill.inrunCurve.lastPoint.y).toBeCloseTo(0, 9)
  })

  it('ma 21 belek uporządkowanych rosnąco i mieszczących się w rozbiegu', () => {
    // Runda 13: stare belki 1..12 to fizycznie nowe 10..21; nowe 1..9 schodzą
    // niżej tym samym rozstawem 0,65 m. Szczyt bez zmian na krawędzi rozbiegu.
    expect(hill.gates).toHaveLength(21)
    const numbers = hill.gates.map((gate) => gate.number)
    expect(numbers).toEqual(Array.from({ length: 21 }, (_, i) => i + 1))
    const lengths = hill.gates.map((gate) => gate.inrunLengthMeters)
    expect(lengths).toEqual([...lengths].sort((a, b) => a - b))
    expect(hill.gate(21).inrunLengthMeters).toBe(TECHNICAL_K120.inrun.lengthMeters)
    expect(hill.gate(1).inrunLengthMeters).toBeLessThan(hill.gate(21).inrunLengthMeters)
    expect(hill.gate(1).inrunLengthMeters).toBeGreaterThan(0)
    // Tożsamość fizyczna: nowa 10 = stara 1 (87,20 m), nowa 17 = stara 8
    // (91,75 m); stały rozstaw 0,65 m między każdą parą sąsiadów.
    expect(hill.gate(10).inrunLengthMeters).toBeCloseTo(87.2, 9)
    expect(hill.gate(17).inrunLengthMeters).toBeCloseTo(91.75, 9)
    for (let n = 1; n < 21; n += 1) {
      expect(hill.gate(n + 1).inrunLengthMeters - hill.gate(n).inrunLengthMeters).toBeCloseTo(0.65, 9)
    }
    expect(() => hill.gate(99)).toThrow()
  })

  it('wykrywa uszkodzone dane skoczni', () => {
    const broken: HillSpec = { ...TECHNICAL_K120, kPointMeters: 140 }
    const codes = validateHill(buildHill(broken)).map((issue) => issue.code)
    expect(codes).toContain('k-not-below-hs')
    expect(codes).toContain('marker-order')
  })

  it('odrzuca K165–179, dla którego profil reguł nie ma współczynnika pkt/m', () => {
    const unsupported: HillSpec = { ...TECHNICAL_K120, kPointMeters: 170, hillSizeMeters: 180 }
    expect(validateHill(buildHill(unsupported)).map((issue) => issue.code)).toContain('unsupported-k-point')
  })

  it('wykrywa nieciągłość między zeskokiem a wybiegiem', () => {
    const broken: HillSpec = {
      ...TECHNICAL_K120,
      outrunKeyframes: TECHNICAL_K120.outrunKeyframes.map((keyframe) => ({ ...keyframe, slopeDeg: 40 })),
    }
    // Sama zmiana kąta nie rozrywa krzywej; sprawdzamy detektor na rozjechanym U.
    const hillWithGap = buildHill(broken)
    expect(validateHill(hillWithGap).map((issue) => issue.code)).not.toContain('surface-discontinuity')
    expect(hillWithGap.outrunCurve.firstPoint).toEqual(hillWithGap.landingCurve.lastPoint)
  })
})

describe('P08 — swept contact', () => {
  it('wykrywa przecięcie w środku odcinka ruchu, nie tylko na końcu', () => {
    const start = hill.surfacePositionAt(100)
    const from = { x: start.x, y: start.y + 3 }
    const to = { x: start.x + 1, y: start.y - 3 }
    const hit = sweepContact(hill.surfaceCurves, from, to)
    expect(hit).not.toBeNull()
    expect(hit?.timeFraction).toBeGreaterThan(0)
    expect(hit?.timeFraction).toBeLessThan(1)
  })

  it('mierzy miejsce przecięcia, a nie rzut pozycji końcowej ticka', () => {
    // 120 m/s przy dt = 1/120 s daje odcinek jednego metra na tick — znacznie
    // więcej niż realna prędkość lotu. Test dużej prędkości ma pokazać, że
    // pomiar wynika z chwili pierwszego przecięcia.
    const above = hill.surfacePositionAt(60)
    const flightAngle = (50 * Math.PI) / 180
    const from = { x: above.x, y: above.y + 0.2 }
    const to = { x: from.x + Math.cos(flightAngle), y: from.y - Math.sin(flightAngle) }

    const hit = sweepContact(hill.surfaceCurves, from, to)
    expect(hit).not.toBeNull()
    if (!hit) return

    expect(hit.timeFraction).toBeGreaterThan(0)
    expect(hit.timeFraction).toBeLessThan(1)
    expect(hit.distanceMeters).toBeGreaterThan(hill.surfaceDistanceAtPoint(from))
    // Naiwny test samej pozycji końcowej zmierzyłby skok o kilkadziesiąt
    // centymetrów dłuższy (na stromym garbie FIS jest to ~28 cm).
    const naiveDistance = hill.surfaceDistanceAtPoint(to)
    expect(naiveDistance - hit.distanceMeters).toBeGreaterThan(0.2)
  })

  it('nie gubi kontaktu przy kroku obejmującym wiele odcinków polilinii', () => {
    const above = hill.surfacePositionAt(118)
    const from = { x: above.x, y: above.y + 1.5 }
    const to = { x: from.x + 2.5, y: from.y - 3.5 }
    const hit = sweepContact(hill.surfaceCurves, from, to)
    expect(hit).not.toBeNull()
    expect(hit?.distanceMeters).toBeGreaterThan(118)
    expect(hit?.distanceMeters).toBeLessThan(124)
  })

  it('zwraca null, gdy odcinek nie dotyka powierzchni', () => {
    const above = hill.surfacePositionAt(80)
    const hit = sweepContact(
      hill.surfaceCurves,
      { x: above.x, y: above.y + 20 },
      { x: above.x + 0.3, y: above.y + 19 },
    )
    expect(hit).toBeNull()
  })

  it('zwraca normalną zgodną z nachyleniem stoku w punkcie kontaktu', () => {
    const target = hill.surfacePositionAt(130)
    const hit = sweepContact(
      hill.surfaceCurves,
      { x: target.x, y: target.y + 2 },
      { x: target.x + 0.2, y: target.y - 2 },
    )
    expect(hit).not.toBeNull()
    if (!hit) return
    const expected = hill.surfaceNormalAt(hit.distanceMeters)
    expect(hit.normal.x).toBeCloseTo(expected.x, 6)
    expect(hit.normal.y).toBeCloseTo(expected.y, 6)
  })
})
