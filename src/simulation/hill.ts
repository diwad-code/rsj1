/**
 * P05 — geometria skoczni i mapa metrażu.
 *
 * Układ świata: x w prawo (kierunek lotu), y do góry, jednostki SI (metry).
 * Krzywe opisują dane: zestaw punktów kątowych, czyli nachylenie w funkcji
 * długości łuku. Sampler całkuje je stałym krokiem po długości łuku, więc
 * odległość mierzona wzdłuż powierzchni jest wprost parametrem krzywej.
 * Mapa metrażu jest dzięki temu monotoniczna z konstrukcji, a K i HS są
 * odczytywane dokładnie z tej samej mapy, której używa pomiar kontaktu.
 */

export type Vec2 = { readonly x: number; readonly y: number }

/** Nachylenie w stopniach; dodatnie = w dół w kierunku rosnącego x. */
export type SlopeKeyframe = { readonly distanceMeters: number; readonly slopeDeg: number }

export const SURFACE_STEP_METERS = 0.05

export function slopeDegAt(keyframes: readonly SlopeKeyframe[], distanceMeters: number): number {
  const first = keyframes[0]
  const last = keyframes[keyframes.length - 1]
  if (!first || !last) throw new Error('Krzywa wymaga co najmniej jednego punktu kątowego.')
  if (distanceMeters <= first.distanceMeters) return first.slopeDeg
  if (distanceMeters >= last.distanceMeters) return last.slopeDeg

  for (let index = 1; index < keyframes.length; index += 1) {
    const before = keyframes[index - 1]
    const after = keyframes[index]
    if (!before || !after) break
    if (distanceMeters <= after.distanceMeters) {
      const span = after.distanceMeters - before.distanceMeters
      if (span <= 0) return after.slopeDeg
      const t = (distanceMeters - before.distanceMeters) / span
      return before.slopeDeg + (after.slopeDeg - before.slopeDeg) * t
    }
  }
  return last.slopeDeg
}

export type CurveSegment = {
  readonly from: Vec2
  readonly to: Vec2
  /** Odległość wzdłuż mapy metrażu w punkcie `from`. */
  readonly distanceAtFrom: number
  readonly slopeRad: number
  readonly step: number
}

/**
 * Polilinia próbkowana stałym krokiem długości łuku. Punkt o indeksie i leży
 * dokładnie na `startDistanceMeters + i × step`, więc odczyt metrażu jest
 * odwrotnością indeksu — bez osobnej tabeli, która mogłaby się rozjechać
 * z geometrią.
 */
export class ProfileCurve {
  readonly points: readonly Vec2[]
  readonly segmentSlopeRad: readonly number[]
  readonly step: number
  readonly startDistanceMeters: number
  readonly endDistanceMeters: number

  constructor(
    start: Vec2,
    keyframes: readonly SlopeKeyframe[],
    startDistanceMeters: number,
    endDistanceMeters: number,
    step: number = SURFACE_STEP_METERS,
  ) {
    if (!(endDistanceMeters > startDistanceMeters)) {
      throw new Error('Krzywa wymaga dodatniej długości.')
    }
    const segments = Math.max(1, Math.round((endDistanceMeters - startDistanceMeters) / step))
    const actualStep = (endDistanceMeters - startDistanceMeters) / segments
    const points: Vec2[] = [start]
    const slopes: number[] = []

    let current = start
    for (let index = 0; index < segments; index += 1) {
      const midDistance = startDistanceMeters + (index + 0.5) * actualStep
      const slopeRad = (slopeDegAt(keyframes, midDistance) * Math.PI) / 180
      slopes.push(slopeRad)
      current = {
        x: current.x + Math.cos(slopeRad) * actualStep,
        y: current.y - Math.sin(slopeRad) * actualStep,
      }
      points.push(current)
    }

    this.points = points
    this.segmentSlopeRad = slopes
    this.step = actualStep
    this.startDistanceMeters = startDistanceMeters
    this.endDistanceMeters = endDistanceMeters
  }

  get lengthMeters(): number {
    return this.endDistanceMeters - this.startDistanceMeters
  }

  get segmentCount(): number {
    return this.segmentSlopeRad.length
  }

  contains(distanceMeters: number): boolean {
    return distanceMeters >= this.startDistanceMeters && distanceMeters <= this.endDistanceMeters
  }

  clampDistance(distanceMeters: number): number {
    if (Number.isNaN(distanceMeters)) return this.startDistanceMeters
    return Math.min(this.endDistanceMeters, Math.max(this.startDistanceMeters, distanceMeters))
  }

  positionAt(distanceMeters: number): Vec2 {
    const clamped = this.clampDistance(distanceMeters)
    const raw = (clamped - this.startDistanceMeters) / this.step
    const index = Math.min(this.segmentCount - 1, Math.max(0, Math.floor(raw)))
    const from = this.points[index]
    const to = this.points[index + 1]
    if (!from || !to) throw new Error('Niekompletna polilinia profilu.')
    const t = Math.min(1, Math.max(0, raw - index))
    return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t }
  }

  slopeRadAt(distanceMeters: number): number {
    const clamped = this.clampDistance(distanceMeters)
    const raw = (clamped - this.startDistanceMeters) / this.step
    const index = Math.min(this.segmentCount - 1, Math.max(0, Math.floor(raw)))
    return this.segmentSlopeRad[index] ?? 0
  }

  /** Jednostkowa styczna skierowana w stronę rosnącego metrażu. */
  tangentAt(distanceMeters: number): Vec2 {
    const slope = this.slopeRadAt(distanceMeters)
    return { x: Math.cos(slope), y: -Math.sin(slope) }
  }

  /** Jednostkowa normalna skierowana od powierzchni w górę. */
  normalAt(distanceMeters: number): Vec2 {
    const slope = this.slopeRadAt(distanceMeters)
    return { x: Math.sin(slope), y: Math.cos(slope) }
  }

  get firstPoint(): Vec2 {
    const point = this.points[0]
    if (!point) throw new Error('Pusta polilinia profilu.')
    return point
  }

  get lastPoint(): Vec2 {
    const point = this.points[this.points.length - 1]
    if (!point) throw new Error('Pusta polilinia profilu.')
    return point
  }

  /** Indeks odcinka, którego zakres x zawiera podane x (z przycięciem do krzywej). */
  segmentIndexForX(x: number): number {
    let low = 0
    let high = this.segmentCount - 1
    while (low < high) {
      const mid = (low + high) >> 1
      const end = this.points[mid + 1]
      if (end && end.x < x) low = mid + 1
      else high = mid
    }
    return low
  }

  segment(index: number): CurveSegment | null {
    const from = this.points[index]
    const to = this.points[index + 1]
    const slopeRad = this.segmentSlopeRad[index]
    if (!from || !to || slopeRad === undefined) return null
    return {
      from,
      to,
      distanceAtFrom: this.startDistanceMeters + index * this.step,
      slopeRad,
      step: this.step,
    }
  }

  /** Odcinki pokrywające zadany przedział x, z jednym odcinkiem zapasu z przodu. */
  segmentsOverlappingX(minX: number, maxX: number): CurveSegment[] {
    const result: CurveSegment[] = []
    const first = Math.max(0, this.segmentIndexForX(minX) - 1)
    for (let index = first; index < this.segmentCount; index += 1) {
      const segment = this.segment(index)
      if (!segment) break
      if (segment.from.x > maxX) break
      result.push(segment)
    }
    return result
  }

  /** Wysokość powierzchni nad zadanym x; poza zakresem ekstrapoluje skrajnym odcinkiem. */
  surfaceYAtX(x: number): number {
    const segment = this.segment(this.segmentIndexForX(x))
    if (!segment) return this.lastPoint.y
    const span = segment.to.x - segment.from.x
    if (Math.abs(span) < 1e-9) return segment.from.y
    const t = (x - segment.from.x) / span
    return segment.from.y + (segment.to.y - segment.from.y) * t
  }

  /** Mapa metrażu: rzut punktu na krzywą i odczyt odległości w metrach. */
  distanceAtPoint(point: Vec2): number {
    const segment = this.segment(this.segmentIndexForX(point.x))
    if (!segment) return this.endDistanceMeters
    const dx = segment.to.x - segment.from.x
    const dy = segment.to.y - segment.from.y
    const lengthSquared = dx * dx + dy * dy
    if (lengthSquared < 1e-12) return segment.distanceAtFrom
    const projected = ((point.x - segment.from.x) * dx + (point.y - segment.from.y) * dy) / lengthSquared
    const t = Math.min(1, Math.max(0, projected))
    return segment.distanceAtFrom + t * segment.step
  }
}

export type SweptContact = {
  /** Ułamek ticka, w którym nastąpiło pierwsze przecięcie: 0 = początek, 1 = koniec. */
  readonly timeFraction: number
  readonly point: Vec2
  readonly distanceMeters: number
  readonly slopeRad: number
  readonly normal: Vec2
}

/**
 * P08 — swept contact. Szuka pierwszego przecięcia odcinka ruchu z polilinią
 * powierzchni w obrębie ticka, a nie tylko testuje pozycję końcową.
 */
export function sweepContact(curves: readonly ProfileCurve[], from: Vec2, to: Vec2): SweptContact | null {
  const minX = Math.min(from.x, to.x)
  const maxX = Math.max(from.x, to.x)
  const motionX = to.x - from.x
  const motionY = to.y - from.y

  let best: SweptContact | null = null

  for (const curve of curves) {
    for (const segment of curve.segmentsOverlappingX(minX, maxX)) {
      const segmentX = segment.to.x - segment.from.x
      const segmentY = segment.to.y - segment.from.y
      const denominator = motionX * segmentY - motionY * segmentX
      if (Math.abs(denominator) < 1e-12) continue

      const deltaX = segment.from.x - from.x
      const deltaY = segment.from.y - from.y
      const motionT = (deltaX * segmentY - deltaY * segmentX) / denominator
      const segmentT = (deltaX * motionY - deltaY * motionX) / denominator
      if (motionT < 0 || motionT > 1 || segmentT < 0 || segmentT > 1) continue
      if (best && motionT >= best.timeFraction) continue

      best = {
        timeFraction: motionT,
        point: { x: from.x + motionX * motionT, y: from.y + motionY * motionT },
        distanceMeters: segment.distanceAtFrom + segmentT * segment.step,
        slopeRad: segment.slopeRad,
        normal: { x: Math.sin(segment.slopeRad), y: Math.cos(segment.slopeRad) },
      }
    }
  }

  return best
}
