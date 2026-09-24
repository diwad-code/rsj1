/**
 * P21-H01 — Lysgårdsbakken normalna K90/HS98 (Lillehammer).
 *
 * Grywalna skocznia INSPIROWANA Lillehammer. K90/HS98, podstawowe kąty,
 * wysokość progu i punktacja pochodzą z dokumentów FIS, lecz zeskok,
 * położenia belek, U, fall line, wybieg i bezpieczeństwo są jawnym ADAPT.
 * Nie jest cyfrową rekonstrukcją certyfikatu 304/NOR 44. Zobacz H01.md.
 */

import type { HillSpec } from '../technicalHill'

const GATE_COUNT = 25
const GATE_SPACING_METERS = 0.79
const LOWEST_GATE_INRUN_METERS = 66

function buildGates() {
  const gates: { number: number; inrunLengthMeters: number }[] = []
  for (let number = 1; number <= GATE_COUNT; number += 1) {
    gates.push({
      number,
      inrunLengthMeters: LOWEST_GATE_INRUN_METERS + (number - 1) * GATE_SPACING_METERS,
    })
  }
  return gates
}

export const LILLEHAMMER_NORMAL: HillSpec = {
  id: 'h01-lillehammer-normal',
  name: 'LILLEHAMMER — INSPIROWANA',
  hillVersion: 'h01-inspired-4',
  classification: 'normal',
  kPointMeters: 90,
  hillSizeMeters: 98,
  pPointMeters: 82.67,
  uPointMeters: 168,
  fallLineMeters: 193,
  outrunEndMeters: 268,
  tableClearanceMeters: 2.76,
  inrun: {
    lengthMeters: 87.98,
    // e1 obejmuje próg: prosta 44,49 m + przejście 37,39 m + t 6,10 m.
    // Belki 1–25 to TUNE pod bezpieczną AUTO; nie odtwarzają tabeli FIS.
    keyframes: [
      { distanceMeters: 0, slopeDeg: 35 },
      { distanceMeters: 44.49, slopeDeg: 35 },
      { distanceMeters: 81.88, slopeDeg: 11.2 },
      { distanceMeters: 87.98, slopeDeg: 11.2 },
    ],
    gates: buildGates(),
  },
  // ZESKOK ADAPT: K/HS na wspólnej mapie metrażu, kąty P/K/L inspirowane
  // certyfikatem; przejście L→U rozłożone na 70 m. U ma głębokość ~66,58 m,
  // bliską źródłowemu zU 66,60 m, ale krzywa nie jest geodezyjnym profilem.
  landingKeyframes: [
    { distanceMeters: 0, slopeDeg: 6.08 },
    { distanceMeters: 5.6, slopeDeg: 6.95 },
    { distanceMeters: 11.25, slopeDeg: 8.9 },
    { distanceMeters: 16.9, slopeDeg: 11.7 },
    { distanceMeters: 22.5, slopeDeg: 15.3 },
    { distanceMeters: 28.1, slopeDeg: 19.6 },
    { distanceMeters: 33.75, slopeDeg: 24.6 },
    { distanceMeters: 39.4, slopeDeg: 30.2 },
    { distanceMeters: 45, slopeDeg: 36.5 },
    { distanceMeters: 82.67, slopeDeg: 36.5 },
    { distanceMeters: 90, slopeDeg: 34.7 },
    { distanceMeters: 98, slopeDeg: 32.8 },
    { distanceMeters: 168, slopeDeg: 0 },
  ],
  outrunKeyframes: [
    { distanceMeters: 168, slopeDeg: 0 },
    { distanceMeters: 180, slopeDeg: -0.3 },
    { distanceMeters: 215, slopeDeg: -1 },
    { distanceMeters: 268, slopeDeg: -1.5 },
  ],
  windMeasurement: {
    version: 'weighted-flight-span-v1',
    sensors: [
      { distanceMeters: 35, weight: 0.3 },
      { distanceMeters: 70, weight: 0.4 },
      { distanceMeters: 95, weight: 0.3 },
    ],
  },
  compensation: {
    id: 'h01-compensation-1',
    provenance: 'official-reference',
    // FACT z PDF FIS: wiatr pod narty 8.00, w plecy 12.00, belka 7.00 pkt/m
    // rozbiegu. Zapis w dziesiątych bez kopiowania z technicznej K120.
    headWindFactorTenthsPerMps: 80,
    tailWindFactorTenthsPerMps: 120,
    gateFactorTenthsPerInrunMeter: 70,
    // Referencja punktacji na najniższej fizycznej belce gry; liczby
    // kompensacji są oficjalnym odniesieniem, nie walidacją profilu ADAPT.
    referenceGateNumber: 1,
    // HS98 × 95% = 93.1 m; konwencja obcina do 93.0 m = 186 połówek.
    coachThresholdHalfMeters: 186,
    sourceRefs: [
      'docs/hills/H01.md',
      'docs/evidence/PKG-009/fis/lillehammer-hs98-certificate-2022.pdf',
      'docs/evidence/PKG-009/fis/lillehammer-2022-12-03-women-wc.pdf',
      'docs/evidence/PKG-009/fis/lillehammer-2023-12-02-women-wc.pdf',
      'docs/evidence/PKG-009/fis/lillehammer-2023-12-02-men-wc.pdf',
      'docs/evidence/PKG-009/fis/lillehammer-2026-03-04-women-jwc.pdf',
    ],
  },
  safety: {
    // TUNE gry: idealny neutralny pilot z belki 1 ~84 m. Cel 97,5 m
    // podniosło AUTO o 2 belki względem prototypu; H01 dostaje ponadto
    // +2 belki wyłącznie przy wietrze w plecy w selectSafeJuryGate.
    // To żądany bardziej śmiały balans, nie twierdzenie FIS.
    referenceGateNumber: 1,
    referenceDistanceMeters: 84,
    safeTargetMeters: 97.5,
    autoHeadwindEffectScale: 0.5,
    // TUNE gry, nie próg FIS: rekord 107,5 m można pobić czystym
    // lądowaniem równoległym >=109,5 m, choć podpórka jest tam częstsza.
    // Telemark ma ostrzejszą granicę; oba wyniki są deterministyczne.
    telemarkImpossibleMeters: 112,
    parallelImpossibleMeters: 120,
  },
}
