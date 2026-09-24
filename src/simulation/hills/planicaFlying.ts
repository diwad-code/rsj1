/** H04: grywalna adaptacja inspirowana Letalnicą K200/HS240, nie profil FIS.
 * Wariant K/HS i współczynniki konkursowe: F12; krzywe, belki, AUTO i progi: ADAPT/TUNE.
 * Źródła i rozdział danych: docs/hills/H04.md.
 */
import type { HillSpec } from '../technicalHill'
import { COEFFICIENT_CURVE } from '../aero'

export const PLANICA_FLYING: HillSpec = {
  id: 'h04-planica-flying',
  name: 'PLANICA — INSPIROWANA',
  hillVersion: 'h04-inspired-4',
  classification: 'flying',
  kPointMeters: 200,
  hillSizeMeters: 240,
  pPointMeters: 174,
  uPointMeters: 310,
  fallLineMeters: 350,
  outrunEndMeters: 410,
  tableClearanceMeters: 4,
  inrun: {
    lengthMeters: 185,
    keyframes: [
      { distanceMeters: 0, slopeDeg: 34 },
      { distanceMeters: 117, slopeDeg: 34 },
      { distanceMeters: 175, slopeDeg: 11 },
      { distanceMeters: 185, slopeDeg: 11 },
    ],
    // Niższe belki 1..10 na prostej 34° (rozstaw 2,07 m, najniższa 122,3 m);
    // stare 1..36 zachowują fizyczne pozycje 11..46 i rozstaw 0,9 m.
    gates: Array.from({ length: 46 }, (_, index) => ({
      number: index + 1,
      inrunLengthMeters: index < 10 ? 122.3 + index * 2.07 : 143 + (index - 10) * 0.9,
    })),
  },
  landingKeyframes: [
    { distanceMeters: 0, slopeDeg: 6 },
    { distanceMeters: 14, slopeDeg: 7 },
    { distanceMeters: 29, slopeDeg: 10 },
    { distanceMeters: 44, slopeDeg: 16 },
    { distanceMeters: 60, slopeDeg: 24 },
    { distanceMeters: 76, slopeDeg: 32 },
    { distanceMeters: 93, slopeDeg: 37 },
    { distanceMeters: 174, slopeDeg: 37 },
    { distanceMeters: 200, slopeDeg: 35 },
    { distanceMeters: 240, slopeDeg: 32 },
    { distanceMeters: 256, slopeDeg: 29 },
    { distanceMeters: 271, slopeDeg: 23 },
    { distanceMeters: 286, slopeDeg: 15 },
    { distanceMeters: 299, slopeDeg: 7 },
    { distanceMeters: 310, slopeDeg: 0 },
  ],
  outrunKeyframes: [
    { distanceMeters: 310, slopeDeg: 0 },
    { distanceMeters: 340, slopeDeg: -0.7 },
    { distanceMeters: 370, slopeDeg: -1.2 },
    { distanceMeters: 410, slopeDeg: -1.5 },
  ],
  windMeasurement: {
    version: 'weighted-flight-span-v1',
    sensors: [
      { distanceMeters: 70, weight: 0.25 },
      { distanceMeters: 155, weight: 0.4 },
      { distanceMeters: 228, weight: 0.35 },
    ],
  },
  compensation: {
    id: 'h04-compensation-1',
    provenance: 'simulation-calibrated',
    headWindFactorTenthsPerMps: 144,
    tailWindFactorTenthsPerMps: 216,
    // F12: 8,64 pkt/m rozbiegu; 8,6 w grze to ADAPT (zaokrąglenie do 0,1 pkt/m), nie dokładny współczynnik FIS.
    gateFactorTenthsPerInrunMeter: 86,
    referenceGateNumber: 27,
    // F12 podaje 228 m przy 95% HS; reguła coacha w grze oblicza próg z HS
    // (floor(0,95 * HS * 2) / 2), a nie odtwarza decyzji jury z dokumentu.
    coachThresholdHalfMeters: 456,
    sourceRefs: [
      'docs/hills/H04.md',
      'https://www.fis-ski.com/DB/v2/download/competition-attachment/c36aafb5-64da-11f1-b635-1866da7ef77e.pdf',
      'FIS F12: 2026JP3181RLT.pdf (nazwa dokumentu; działający odsyłacz DB powyżej)',
    ],
  },
  safety: {
    referenceGateNumber: 27,
    referenceDistanceMeters: 238.9,
    // TUNE v3: estymata kompensacyjna to punkty, nie fizyczny zasięg;
    // AUTO H04 korzysta z osobnej kalibracji surowego kontaktu w safety.ts.
    // Pole lądowania oraz progi obu stylów pozostają niezależne od AUTO.
    safeTargetMeters: 163,
    autoHeadwindEffectScale: 1,
    telemarkImpossibleMeters: 265,
    parallelImpossibleMeters: 276,
  },
  // TUNE h04-polar-1: wygładzona półka tylko H04 — ten sam sufit nośności
  // (30°: 1,12 ≤ wspólne 1,14), szerszy płaskowyż 28–34° i łagodne
  // przeciągnięcie 36° zamiast klifu 0,75/1,40. ≤26° i ≥40° bez zmian.
  aero: {
    version: 'h04-polar-1',
    curve: [
      ...COEFFICIENT_CURVE.filter(point => point.angleOfAttackDeg <= 26),
      { angleOfAttackDeg: 28, lift: 1.08, drag: 0.75 },
      { angleOfAttackDeg: 30, lift: 1.12, drag: 0.78 },
      { angleOfAttackDeg: 32, lift: 1.09, drag: 0.77 },
      { angleOfAttackDeg: 34, lift: 1.06, drag: 0.82 },
      { angleOfAttackDeg: 35, lift: 1.02, drag: 0.9 },
      { angleOfAttackDeg: 36, lift: 0.95, drag: 1.05 },
      ...COEFFICIENT_CURVE.filter(point => point.angleOfAttackDeg >= 40),
    ],
  },
}
