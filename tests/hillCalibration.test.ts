/**
 * P42 runda 6 — kalibracja skoczni i lotu wobec danych rzeczywistych.
 *
 * Test pilnuje WIELKOŚCI OBSERWOWALNYCH, nie stałych modelu: prędkości na
 * progu, rozrzutu długości między belkami, czasu lotu i gradientu umiejętności.
 * Dzięki temu wolno zmieniać `referenceAreaSquareMeters`, `dragScale` czy
 * krzywą współczynników, dopóki gra zachowuje się jak prawdziwa skocznia
 * K120/HS134. Odniesienia liczbowe: FIS Jumping Hills Construction Norm 2018
 * oraz certyfikat skoczni Wisła Malinka HS134 (przebudowa 2023).
 */

import { describe, expect, it } from 'vitest'
import { buildHill } from '../src/simulation/technicalHill'
import { runJump } from './support/jumpHarness'
import { BASELINE_PARAMS, compensationFactors, probe } from './support/tuneProbe'

const hill = buildHill()

describe('P42 — geometria rozbiegu wobec normy FIS', () => {
  it('trzyma kąty, długości i wysokość progu w granicach normy', () => {
    const spec = hill.spec
    const keyframes = spec.inrun.keyframes
    const first = keyframes[0]
    const last = keyframes[keyframes.length - 1]
    expect(first?.slopeDeg).toBe(35)
    // Norma §6.4: najazd nie powyżej 37°, zalecane nie powyżej 35°, a dla
    // skoczni o w ≥ 90 nie mniej niż 30°.
    expect(first?.slopeDeg ?? 0).toBeLessThanOrEqual(35)
    expect(first?.slopeDeg ?? 0).toBeGreaterThanOrEqual(30)

    // Norma §4.1: α = w/30 + 7,4 z zakresu w/30 + 6,9 … w/30 + 7,9.
    const w = spec.kPointMeters
    expect(last?.slopeDeg ?? 0).toBeGreaterThanOrEqual(w / 30 + 6.9)
    expect(last?.slopeDeg ?? 0).toBeLessThanOrEqual(w / 30 + 7.9)

    // Certyfikat Wisła Malinka HS134: e 94,35 m, t 6,71 m, s 3,03 m.
    expect(spec.inrun.lengthMeters).toBeCloseTo(94.35, 2)
    expect(spec.inrun.lengthMeters - (keyframes[keyframes.length - 2]?.distanceMeters ?? 0)).toBeCloseTo(6.71, 2)
    expect(spec.tableClearanceMeters).toBeCloseTo(3.03, 2)
  })

  it('rozstawia 21 belek poniżej normowego limitu 0,40 m różnicy wysokości', () => {
    // Runda 13: 20 przerw między 21 belkami, wszystkie na prostej 35°.
    const gates = hill.spec.inrun.gates
    expect(gates).toHaveLength(21)
    for (let i = 1; i < gates.length; i += 1) {
      const spacing = (gates[i]?.inrunLengthMeters ?? 0) - (gates[i - 1]?.inrunLengthMeters ?? 0)
      const dropMeters = spacing * Math.sin((35 * Math.PI) / 180)
      expect(spacing).toBeGreaterThan(0)
      expect(spacing).toBeCloseTo(0.65, 9)
      expect(dropMeters).toBeLessThanOrEqual(0.4)
    }
  })

  it('daje prędkość na progu z zakresu dużej skoczni', () => {
    // Certyfikat Wisły podaje 92,5 km/h; dopuszczamy realny rozrzut belek.
    // Fizyczne belki odniesienia (runda 13: nowe 10/17/21 = stare 1/8/12).
    for (const gate of [10, 17, 21]) {
      const speed = probe(gate).tableSpeedKmh
      expect(speed).toBeGreaterThan(87)
      expect(speed).toBeLessThan(96)
    }
    expect(probe(21).tableSpeedKmh).toBeGreaterThan(probe(10).tableSpeedKmh)
  })

  it('trzyma zeskok FIS: h/n 0,550–0,600 i kotwice nachylenia', () => {
    // Norma FIS 2018 §4 i certyfikat Wisły Malinki HS134 (h/n 0,566):
    // garb 6,17° → prosta 37° do P105 → łuk rL do K120 (33,5°) i L134 (30,2°)
    // → wyjście do 0° w U170,5. n i h liczone z markerów mapy pomiaru.
    const kPoint = hill.markers.kPoint
    const horizontal = kPoint.x
    const vertical = -kPoint.y
    const ratio = vertical / horizontal
    expect(ratio).toBeGreaterThan(0.55)
    expect(ratio).toBeLessThan(0.6)

    const slopeDegAt = (meters: number): number => (hill.surfaceSlopeRadAt(meters) * 180) / Math.PI
    expect(slopeDegAt(0)).toBeCloseTo(6.17, 1)
    expect(slopeDegAt(54)).toBeCloseTo(37, 0)
    expect(slopeDegAt(105)).toBeCloseTo(37, 0)
    expect(slopeDegAt(120)).toBeCloseTo(33.5, 0)
    expect(slopeDegAt(134.15)).toBeCloseTo(30.2, 0)
    expect(slopeDegAt(170.5)).toBeCloseTo(0, 0)
  })
})

describe('P42 — lot wobec skoczni K120/HS134', () => {
  // Historyczna kalibracja koperty odległości i czynników (runda 12/13, baza
  // bez premii perfect): wektory kotwiczą przechowywane stałe kompensacji.
  // Kopertę produkcyjną z premią raportują testy perfect/safety (fixed 2–4 m,
  // outlier gate21) — bez ruszania czynników ani progów.
  it('układa długości wokół punktu K i rośnie monotonicznie z belką', () => {
    const distances = hill.spec.inrun.gates.map((gate) => probe(gate.number, BASELINE_PARAMS).distanceMeters ?? 0)
    for (let index = 1; index < distances.length; index += 1) {
      expect(distances[index] ?? 0).toBeGreaterThan(distances[index - 1] ?? 0)
    }
    const shortest = distances[0] ?? 0
    const longest = distances[distances.length - 1] ?? 0
    // Runda 13: nowe najniższe belki 1..9 schodzą fizycznie poniżej starej
    // podłogi (skarga: stara belka 1 za długa) — pełny zakres jest dłuższy,
    // a koperta K/HS trzyma się na fizycznych belkach odniesienia: nowa 10
    // (= stara 1) ląduje za K−5, szczytowa 21 nie przekracza HS przy
    // bezwietrznej pogodzie — rekord skoczni zostaje do zdobycia na wietrze.
    expect(probe(10, BASELINE_PARAMS).distanceMeters ?? 0).toBeGreaterThan(hill.spec.kPointMeters - 5)
    expect(longest).toBeLessThan(hill.spec.hillSizeMeters)
    expect(longest - shortest).toBeGreaterThan(8)
  })

  it('trafia belką odniesienia w odległość zwycięzcy z normy', () => {
    const factors = compensationFactors(BASELINE_PARAMS)
    expect(factors.winnerDistance).toBe((hill.spec.kPointMeters + hill.spec.hillSizeMeters) / 2)
    expect(Math.abs(factors.baseDistance - factors.winnerDistance)).toBeLessThan(2)
  })

  it('utrzymuje czas lotu w zakresie dużej skoczni', () => {
    const sim = runJump({ gate: 8, pilot: 'ideal', style: 'telemark' })
    expect(sim.flightSeconds).toBeGreaterThan(3.5)
    expect(sim.flightSeconds).toBeLessThan(6.5)
  })

  it('nagradza prowadzenie sylwetki: poprawne > przesterowane > bierne > odchylone', () => {
    const distance = (pilot: 'ideal' | 'over' | 'none' | 'back'): number =>
      runJump({ gate: 8, pilot, style: 'telemark' }).measuredDistanceMeters ?? 0
    expect(distance('ideal')).toBeGreaterThan(distance('over'))
    expect(distance('over')).toBeGreaterThan(distance('none'))
    expect(distance('none')).toBeGreaterThan(distance('back'))
  })

  it('wiatr pod narty wydłuża, wiatr w plecy skraca — oba w tym samym rzędzie', () => {
    const factors = compensationFactors(BASELINE_PARAMS)
    expect(factors.headWindFactorMetersPerMps).toBeGreaterThan(1)
    expect(factors.tailWindFactorMetersPerMps).toBeGreaterThan(1)
    const ratio = factors.headWindFactorMetersPerMps / factors.tailWindFactorMetersPerMps
    expect(ratio).toBeGreaterThan(0.6)
    expect(ratio).toBeLessThan(1.6)
  })

  it('zapisane współczynniki kompensacji odpowiadają zmierzonym', () => {
    const factors = compensationFactors(BASELINE_PARAMS)
    const compensation = hill.spec.compensation
    const pointsPerMeter = 1.8
    const expectedHead = Math.round(factors.headWindFactorMetersPerMps * pointsPerMeter * 10)
    const expectedTail = Math.round(factors.tailWindFactorMetersPerMps * pointsPerMeter * 10)
    const expectedGate = Math.round(factors.gateFactorMetersPerInrunMeter * pointsPerMeter * 10)
    expect(Math.abs(compensation.headWindFactorTenthsPerMps - expectedHead)).toBeLessThanOrEqual(2)
    expect(Math.abs(compensation.tailWindFactorTenthsPerMps - expectedTail)).toBeLessThanOrEqual(2)
    expect(Math.abs(compensation.gateFactorTenthsPerInrunMeter - expectedGate)).toBeLessThanOrEqual(2)
  })
})
