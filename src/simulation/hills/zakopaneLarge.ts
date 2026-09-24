/**
 * P21-H02 — grywalna adaptacja inspirowana Wielką Krokwią, nie profil FIS.
 * K125/HS140 i współczynniki wiatru pochodzą z dokumentów PZN/FIS;
 * liczby w siatce belek, geometrii i bezpieczeństwa są ADAPT/TUNE.
 * Źródła i rozdzielenie faktów od decyzji gry: docs/hills/H02.md.
 */

import type { HillSpec } from '../technicalHill'

const GATE_COUNT = 31
const GATE_SPACING_METERS = 0.7
const LOWEST_GATE_INRUN_METERS = 77

export const ZAKOPANE_LARGE: HillSpec = {
  id: 'h02-zakopane-large',
  name: 'ZAKOPANE — INSPIROWANA',
  hillVersion: 'h02-inspired-1',
  classification: 'large',
  kPointMeters: 125,
  hillSizeMeters: 140,
  pPointMeters: 111,
  uPointMeters: 190,
  fallLineMeters: 223,
  outrunEndMeters: 285,
  tableClearanceMeters: 3.1,
  inrun: {
    lengthMeters: 102,
    keyframes: [
      { distanceMeters: 0, slopeDeg: 34 },
      { distanceMeters: 53, slopeDeg: 34 },
      { distanceMeters: 95.5, slopeDeg: 10.8 },
      { distanceMeters: 102, slopeDeg: 10.8 },
    ],
    gates: Array.from({ length: GATE_COUNT }, (_, index) => ({
      number: index + 1,
      inrunLengthMeters: LOWEST_GATE_INRUN_METERS + index * GATE_SPACING_METERS,
    })),
  },
  landingKeyframes: [
    { distanceMeters: 0, slopeDeg: 5.8 },
    { distanceMeters: 9, slopeDeg: 7.1 },
    { distanceMeters: 18, slopeDeg: 10.8 },
    { distanceMeters: 27, slopeDeg: 16.2 },
    { distanceMeters: 36, slopeDeg: 22.6 },
    { distanceMeters: 45, slopeDeg: 29.5 },
    { distanceMeters: 54, slopeDeg: 36.8 },
    { distanceMeters: 111, slopeDeg: 36.8 },
    { distanceMeters: 125, slopeDeg: 34.6 },
    { distanceMeters: 140, slopeDeg: 31.4 },
    { distanceMeters: 151, slopeDeg: 27.5 },
    { distanceMeters: 164, slopeDeg: 20.4 },
    { distanceMeters: 177, slopeDeg: 10.6 },
    { distanceMeters: 190, slopeDeg: 0 },
  ],
  outrunKeyframes: [
    { distanceMeters: 190, slopeDeg: 0 },
    { distanceMeters: 215, slopeDeg: -0.7 },
    { distanceMeters: 250, slopeDeg: -1.3 },
    { distanceMeters: 285, slopeDeg: -1.5 },
  ],
  windMeasurement: {
    version: 'weighted-flight-span-v1',
    sensors: [
      { distanceMeters: 48, weight: 0.25 },
      { distanceMeters: 99, weight: 0.45 },
      { distanceMeters: 137, weight: 0.3 },
    ],
  },
  compensation: {
    id: 'h02-compensation-1',
    // F10: 10,80/16,20 pkt/(m/s) bez zmiany; 7,56 pkt/m bramki
    // zaokrąglone do 7,6 w istniejącym formacie całych 0,1 pkt/m.
    // Zestaw ma przez to proweniencję kalibrowanej ADAPT, nie dokładnej FIS.
    provenance: 'simulation-calibrated',
    headWindFactorTenthsPerMps: 108,
    tailWindFactorTenthsPerMps: 162,
    gateFactorTenthsPerInrunMeter: 76,
    referenceGateNumber: 1,
    coachThresholdHalfMeters: 266,
    sourceRefs: [
      'docs/hills/H02.md',
      'https://medias3.fis-ski.com/pdf/2026/JP/3112/2026JP3112RLQ.pdf',
    ],
  },
  safety: {
    referenceGateNumber: 1,
    referenceDistanceMeters: 97.7,
    safeTargetMeters: 144,
    autoHeadwindEffectScale: 0.5,
    telemarkImpossibleMeters: 154,
    parallelImpossibleMeters: 160,
  },
}
