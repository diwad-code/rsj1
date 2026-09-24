import { describe, expect, it } from 'vitest'
import { buildSportMarkers } from '../src/render/sportMarkers'
import { buildHill } from '../src/simulation/technicalHill'

const hill = buildHill()

describe('P14 — generator oznaczeń sportowych', () => {
  it('buduje linie co 5 m, boczne zakresy i osobną fall line z distanceMap', () => {
    const markers = buildSportMarkers(hill)
    expect(markers.meterLines.map((marker) => marker.meters)).toEqual([95, 100, 105, 110, 115, 120, 125, 130])
    expect(markers.sideBands.map(({ kind, fromMeters, toMeters }) => [kind, fromMeters, toMeters])).toEqual([
      ['blue', 106, 120],
      ['red', 120, 134],
      ['green', 191, 205],
    ])
    expect(markers.kPoint.meters).toBe(120)
    expect(markers.hillSize.meters).toBe(134)
    expect(markers.fallLine.meters).toBe(205)
    expect(markers.sidePaddles[0]?.meters).toBe(60)
    expect(markers.sidePaddles.at(-1)?.meters).toBe(139)
  })

  it('każdą pozycję odczytuje zwrotnie z tej samej mapy pomiarowej', () => {
    const markers = buildSportMarkers(hill, { leadingTargetHalfMeters: 265, recordHalfMeters: 274 })
    const all = [
      ...markers.meterLines,
      ...markers.sidePaddles,
      markers.kPoint,
      markers.hillSize,
      markers.fallLine,
      markers.leadingTarget,
      markers.record,
    ].filter((marker): marker is NonNullable<typeof marker> => marker !== null)
    for (const marker of all) {
      expect(hill.surfaceDistanceAtPoint(marker.point)).toBeCloseTo(marker.meters, 3)
    }
  })

  it('nie generuje celu poza profilem i rozróżnia HS, rekord oraz cel', () => {
    const visible = buildSportMarkers(hill, { leadingTargetHalfMeters: 265, recordHalfMeters: 274 })
    expect(visible.leadingTarget?.meters).toBe(132.5)
    expect(visible.record?.meters).toBe(137)
    expect(new Set([
      visible.hillSize.meters,
      visible.leadingTarget?.meters,
      visible.record?.meters,
    ]).size).toBe(3)

    const outside = buildSportMarkers(hill, { leadingTargetHalfMeters: hill.spec.outrunEndMeters * 2 + 1 })
    expect(outside.leadingTarget).toBeNull()
  })
})
