/** P14 — jeden generator oznaczeń z tej samej mapy metrażu co pomiar. */

import type { Vec2 } from '../simulation/hill'
import type { Hill } from '../simulation/technicalHill'

export type PositionedMarker = {
  readonly meters: number
  readonly point: Vec2
}

export type SideBand = {
  readonly kind: 'blue' | 'red' | 'green'
  readonly fromMeters: number
  readonly toMeters: number
  readonly from: Vec2
  readonly to: Vec2
}

export type SportMarkerSet = {
  readonly meterLines: readonly PositionedMarker[]
  readonly sidePaddles: readonly PositionedMarker[]
  readonly sideBands: readonly SideBand[]
  readonly kPoint: PositionedMarker
  readonly hillSize: PositionedMarker
  readonly fallLine: PositionedMarker
  readonly leadingTarget: PositionedMarker | null
  readonly record: PositionedMarker | null
}

export type DynamicMarkerInput = {
  readonly leadingTargetHalfMeters?: number | null
  readonly recordHalfMeters?: number | null
}

function positioned(hill: Hill, meters: number): PositionedMarker {
  return { meters, point: hill.surfacePositionAt(meters) }
}

function optionalHalfMeterMarker(hill: Hill, halfMeters: number | null | undefined): PositionedMarker | null {
  if (halfMeters === null || halfMeters === undefined) return null
  if (!Number.isInteger(halfMeters)) throw new Error('Dynamiczny marker musi być zapisany w połówkach metra.')
  const meters = halfMeters / 2
  if (meters < 0 || meters > hill.spec.outrunEndMeters) return null
  return positioned(hill, meters)
}

export function buildSportMarkers(hill: Hill, dynamic: DynamicMarkerInput = {}): SportMarkerSet {
  const { spec } = hill
  const span = spec.hillSizeMeters - spec.kPointMeters
  const firstFiveMeterLine = Math.ceil((spec.pPointMeters - 10) / 5) * 5
  const meterLines: PositionedMarker[] = []
  for (let meters = firstFiveMeterLine; meters <= spec.hillSizeMeters; meters += 5) {
    meterLines.push(positioned(hill, meters))
  }

  const sidePaddles: PositionedMarker[] = []
  for (let meters = Math.ceil(spec.kPointMeters / 2); meters <= Math.floor(spec.hillSizeMeters + 5); meters += 1) {
    sidePaddles.push(positioned(hill, meters))
  }

  const bands = [
    { kind: 'blue', fromMeters: spec.kPointMeters - span, toMeters: spec.kPointMeters },
    { kind: 'red', fromMeters: spec.kPointMeters, toMeters: spec.hillSizeMeters },
    { kind: 'green', fromMeters: spec.fallLineMeters - span, toMeters: spec.fallLineMeters },
  ] as const

  return {
    meterLines,
    sidePaddles,
    sideBands: bands.map((band) => ({
      ...band,
      from: hill.surfacePositionAt(band.fromMeters),
      to: hill.surfacePositionAt(band.toMeters),
    })),
    kPoint: positioned(hill, spec.kPointMeters),
    hillSize: positioned(hill, spec.hillSizeMeters),
    fallLine: positioned(hill, spec.fallLineMeters),
    leadingTarget: optionalHalfMeterMarker(hill, dynamic.leadingTargetHalfMeters),
    record: optionalHalfMeterMarker(hill, dynamic.recordHalfMeters),
  }
}
