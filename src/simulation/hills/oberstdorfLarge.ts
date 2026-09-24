/** H03: autorski profil gry inspirowany Schattenbergschanze K120/HS137.
 * K/HS i wybrane współczynniki: FIS 2025; profil/belki/AUTO: ADAPT/TUNE.
 * Źródła i granice danych: docs/hills/H03.md.
 */
import type { HillSpec } from '../technicalHill'

export const OBERSTDORF_LARGE: HillSpec = {
  id: 'h03-oberstdorf-large',
  name: 'OBERSTDORF — INSPIROWANA',
  hillVersion: 'h03-inspired-1',
  classification: 'large',
  kPointMeters: 120,
  hillSizeMeters: 137,
  pPointMeters: 104,
  uPointMeters: 182,
  fallLineMeters: 218,
  outrunEndMeters: 275,
  tableClearanceMeters: 3.05,
  inrun: {
    lengthMeters: 100,
    keyframes: [
      { distanceMeters: 0, slopeDeg: 35 },
      { distanceMeters: 47, slopeDeg: 35 },
      { distanceMeters: 93, slopeDeg: 10.5 },
      { distanceMeters: 100, slopeDeg: 10.5 },
    ],
    gates: Array.from({ length: 29 }, (_, index) => ({ number: index + 1, inrunLengthMeters: 74 + index * 0.72 })),
  },
  landingKeyframes: [
    { distanceMeters: 0, slopeDeg: 6 },
    { distanceMeters: 8, slopeDeg: 7.2 },
    { distanceMeters: 17, slopeDeg: 10.3 },
    { distanceMeters: 26, slopeDeg: 16 },
    { distanceMeters: 35, slopeDeg: 23.5 },
    { distanceMeters: 44, slopeDeg: 31 },
    { distanceMeters: 52, slopeDeg: 37.2 },
    { distanceMeters: 104, slopeDeg: 37.2 },
    { distanceMeters: 120, slopeDeg: 34.7 },
    { distanceMeters: 137, slopeDeg: 31.2 },
    { distanceMeters: 146, slopeDeg: 28.8 },
    { distanceMeters: 157, slopeDeg: 22.8 },
    { distanceMeters: 169, slopeDeg: 12.8 },
    { distanceMeters: 182, slopeDeg: 0 },
  ],
  outrunKeyframes: [
    { distanceMeters: 182, slopeDeg: 0 },
    { distanceMeters: 211, slopeDeg: -0.8 },
    { distanceMeters: 245, slopeDeg: -1.4 },
    { distanceMeters: 275, slopeDeg: -1.6 },
  ],
  windMeasurement: {
    version: 'weighted-flight-span-v1',
    sensors: [
      { distanceMeters: 42, weight: 0.3 },
      { distanceMeters: 91, weight: 0.4 },
      { distanceMeters: 132, weight: 0.3 },
    ],
  },
  compensation: {
    id: 'h03-compensation-1',
    provenance: 'simulation-calibrated',
    headWindFactorTenthsPerMps: 108,
    tailWindFactorTenthsPerMps: 162,
    // FIS 7,56 → 7,6 pkt/m: typ punktacji przechowuje całe dziesiąte.
    gateFactorTenthsPerInrunMeter: 76,
    referenceGateNumber: 1,
    coachThresholdHalfMeters: 260,
    sourceRefs: [
      'docs/hills/H03.md',
      'https://medias1.fis-ski.com/pdf/2026/JP/3103/2026JP3103RLQ.pdf',
      'https://www.fis-ski.com/DB/v2/download/competition-attachment/c350d159-64da-11f1-b635-1866da7ef77e.pdf',
    ],
  },
  safety: {
    referenceGateNumber: 1,
    referenceDistanceMeters: 94.5,
    safeTargetMeters: 141,
    autoHeadwindEffectScale: 0.5,
    telemarkImpossibleMeters: 152,
    parallelImpossibleMeters: 157,
  },
}
