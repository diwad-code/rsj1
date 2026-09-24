import { describe, expect, it } from 'vitest'
import { JumpSimulation, SIM_DT } from '../src/simulation/jump'
import { DEFAULT_JUMP_PARAMS } from '../src/simulation/params'
import {
  GUST_OFFSET_DEG,
  backgroundAmplitudeMps,
  createTestWindField,
  createWindField,
  gustAmplitudeForPrevailing,
  gustEnvelope,
  gustProbabilityForPrevailing,
  type WindField,
} from '../src/simulation/wind'
import { EMPTY_INPUT, makeInput, runJump } from './support/jumpHarness'

/**
 * PKG-008/P42 — model wiatru z podmuchami (`pkg008-wind-4`, `pkg008-tune-9`).
 * Deterministyczny, czysta funkcja seeda i czasu symulacji; podmuch działa
 * wyłącznie przez windVelocity i łagodny offset celu sylwetki (max ±5,2°).
 */

function gridSamples(field: WindField, fromTime = 0, toTime = 8, step = 0.02): number[] {
  const samples: number[] = []
  for (const distance of [0, 60, 130]) {
    for (let t = fromTime; t <= toTime; t += step) samples.push(field.sampleUserMetersPerSecond(t, distance))
  }
  return samples
}

function activeAtPeak(field: WindField, slotIndex: number): boolean {
  return Math.abs(field.sampleGustOffsetDeg?.(slotIndex * 2 + 0.45, 90) ?? 0) > 0
}

describe('P42 podmuchy — determinizm i niezależność odczytów', () => {
  it('ten sam seed daje identyczny wynik niezależnie od kolejności i metrażu odczytów', () => {
    const first = createWindField(4242)
    const second = createWindField(4242)
    const orderA: number[] = []
    for (let t = 0; t <= 6; t += 0.1) for (const d of [10, 90, 130]) orderA.push(first.sampleUserMetersPerSecond(t, d))
    const orderB: number[] = []
    for (const d of [130, 90, 10]) for (let t = 0; t <= 6; t += 0.1) orderB.push(second.sampleUserMetersPerSecond(t, d))
    // Ten sam (t, d) w obu kolejnościach — sortujemy do wspólnego klucza.
    const keyed = (field: WindField): number[] => {
      const out: number[] = []
      for (let t = 0; t <= 6; t += 0.1) for (const d of [10, 90, 130]) out.push(field.sampleUserMetersPerSecond(t, d))
      return out
    }
    expect(keyed(first)).toEqual(keyed(second))
    expect(orderA.length).toBe(orderB.length)
    // Offset tak samo niezależny od kolejności.
    const offsetsA: number[] = []
    for (let t = 0; t <= 6; t += 0.25) offsetsA.push(first.sampleGustOffsetDeg?.(t, 40) ?? NaN)
    const offsetsB: number[] = []
    for (let t = 6; t >= 0; t -= 0.25) offsetsB.unshift(second.sampleGustOffsetDeg?.(t, 120) ?? NaN)
    expect(offsetsA).toEqual(offsetsB)
  })

  it('identyczny seed i input dają identyczny skok (żadnej kości lądowania)', () => {
    const first = runJump({ gate: 8, pilot: 'ideal', style: 'telemark', windField: createWindField(4242) })
    const second = runJump({ gate: 8, pilot: 'ideal', style: 'telemark', windField: createWindField(4242) })
    expect(second.measuredDistanceMeters).toBe(first.measuredDistanceMeters)
    expect(second.outcome).toEqual(first.outcome)
    expect(second.windMeasurement).toEqual(first.windMeasurement)
  })

  it('obie fabryki dzielą wersję i profil podmuchu', () => {
    expect(createWindField(7).version).toBe('pkg008-wind-4')
    expect(
      createTestWindField(7, 1).version,
    ).toBe('pkg008-wind-4')
    expect(DEFAULT_JUMP_PARAMS.physicsVersion).toBe('pkg008-tune-9')
  })
})

describe('P42 podmuchy — granice tła i stabilność kierunku', () => {
  it('tło max ±0,20 m/s, wygaszone liniowo do 0 przy 1,5 m/s', () => {
    expect(backgroundAmplitudeMps(0)).toBeCloseTo(0.2, 12)
    expect(backgroundAmplitudeMps(0.75)).toBeCloseTo(0.1, 12)
    const justBelow = backgroundAmplitudeMps(1.49)
    expect(justBelow).toBeGreaterThan(0)
    expect(justBelow).toBeLessThan(0.01)
    expect(backgroundAmplitudeMps(1.5)).toBe(0)
    expect(backgroundAmplitudeMps(1.51)).toBe(0)
    expect(backgroundAmplitudeMps(-2.4)).toBe(0)
  })

  it('cisza wiruje przez zero; od 1,5 m/s brak odwrócenia, limit ±3,2', () => {
    const calm = gridSamples(createTestWindField(555, 0))
    expect(Math.min(...calm)).toBeLessThan(0)
    expect(Math.max(...calm)).toBeGreaterThan(0)
    for (const prevailing of [1.5, 1.51, 2.0, -1.5, -1.51, -2.2]) {
      for (const seed of [7, 77, 555, 1234]) {
        const samples = gridSamples(createTestWindField(seed, prevailing))
        expect(Math.min(...samples)).toBeGreaterThanOrEqual(-3.2)
        expect(Math.max(...samples)).toBeLessThanOrEqual(3.2)
        if (prevailing > 0) expect(Math.min(...samples)).toBeGreaterThan(0)
        else expect(Math.max(...samples)).toBeLessThan(0)
      }
    }
  })
})

describe('P42 podmuchy — siła daje nadzbiór slotów i większą amplitudę', () => {
  it('p(s) i amplituda rosną z siłą według kontraktu', () => {
    expect(gustProbabilityForPrevailing(0)).toBeCloseTo(0.04, 12)
    expect(gustProbabilityForPrevailing(3.2)).toBeCloseTo(0.6, 12)
    expect(gustAmplitudeForPrevailing(0)).toBeCloseTo(0.15, 12)
    expect(gustAmplitudeForPrevailing(3.2)).toBeCloseTo(0.7, 12)
    const levels = [0, 0.5, 1.0, 1.5, 2.0, 3.2]
    for (let i = 1; i < levels.length; i += 1) {
      expect(gustProbabilityForPrevailing(levels[i] ?? 0)).toBeGreaterThan(
        gustProbabilityForPrevailing(levels[i - 1] ?? 0),
      )
      expect(gustAmplitudeForPrevailing(levels[i] ?? 0)).toBeGreaterThan(
        gustAmplitudeForPrevailing(levels[i - 1] ?? 0),
      )
    }
  })

  it('ten sam hash przy większej sile daje nadzbiór aktywnych slotów', () => {
    const pairs: Array<[number, number]> = [[0, 1.0], [1.0, 2.5], [0.5, 3.2], [0, 3.2]]
    for (const [weaker, stronger] of pairs) {
      for (let seed = 0; seed < 100; seed += 1) {
        const weakField = createTestWindField(seed, weaker)
        const strongField = createTestWindField(seed, stronger)
        for (let slot = 0; slot < 20; slot += 1) {
          if (activeAtPeak(weakField, slot)) expect(activeAtPeak(strongField, slot)).toBe(true)
        }
      }
    }
  })
})

describe('P42 podmuchy — profil ciągły i offset właściwego znaku', () => {
  it('obwiednia: 0,30 s góra, 0,30 s trzymanie, 0,40 s dół, potem cisza', () => {
    expect(gustEnvelope(-0.1)).toBe(0)
    expect(gustEnvelope(0)).toBe(0)
    expect(gustEnvelope(0.15)).toBeCloseTo(0.5, 12)
    expect(gustEnvelope(0.3)).toBeCloseTo(1, 12)
    expect(gustEnvelope(0.45)).toBe(1)
    expect(gustEnvelope(0.6)).toBeCloseTo(1, 12)
    expect(gustEnvelope(0.8)).toBeCloseTo(0.5, 12)
    expect(gustEnvelope(1.0)).toBeCloseTo(0, 12)
    expect(gustEnvelope(1.5)).toBe(0)
    expect(gustEnvelope(2.0)).toBe(0)
    let maxStep = 0
    let previous = gustEnvelope(0)
    for (let t = 0.005; t < 2; t += 0.005) {
      const current = gustEnvelope(t)
      maxStep = Math.max(maxStep, Math.abs(current - previous))
      previous = current
    }
    expect(maxStep).toBeLessThan(0.05)
  })

  it('offset ma znak podmuchu i max 5,2°; poza oknem podmuchu zero', () => {
    for (const seed of [3, 77, 555]) {
      for (const prevailing of [2.0, -2.0]) {
        const field = createTestWindField(seed, prevailing)
        for (let t = 0; t <= 8; t += 0.02) {
          const offset = field.sampleGustOffsetDeg?.(t, 90) ?? NaN
          expect(Math.abs(offset)).toBeLessThanOrEqual(GUST_OFFSET_DEG + 1e-12)
          if (Math.abs(offset) > 0) {
            expect(Math.sign(offset)).toBe(Math.sign(prevailing))
          }
        }
        // Po wygaszeniu (1,0–2,0 s slotu) zawsze zero.
        for (let slot = 0; slot < 4; slot += 1) {
          expect(field.sampleGustOffsetDeg?.(slot * 2 + 1.5, 90)).toBe(0)
        }
      }
      // Przy ciszy znak deterministyczny (ten sam slot, ten sam znak).
      const calm = createTestWindField(seed, 0)
      for (let slot = 0; slot < 8; slot += 1) {
        const a = calm.sampleGustOffsetDeg?.(slot * 2 + 0.45, 90) ?? NaN
        const b = calm.sampleGustOffsetDeg?.(slot * 2 + 0.45, 10) ?? NaN
        expect(a).toBe(b)
        expect(Math.abs(a)).toBeLessThanOrEqual(GUST_OFFSET_DEG + 1e-12)
      }
    }
  })
})

describe('P42 podmuchy w symulacji — efektywny cel, limit 20°/s, kontrowanie', () => {
  const stubGustField = (offsetDeg: number, windMps: number): WindField => ({
    seed: 1,
    version: 'gust-stub',
    prevailingMps: windMps,
    sampleUserMetersPerSecond: () => windMps,
    sampleGustOffsetDeg: () => offsetDeg,
  })

  function reachFlight(field: WindField): JumpSimulation {
    const sim = new JumpSimulation({ gateNumber: 8, autoStart: true, windField: field })
    for (let guard = 0; guard < 10_000 && sim.phase !== 'Flight'; guard += 1) sim.step(EMPTY_INPUT)
    expect(sim.phase).toBe('Flight')
    return sim
  }

  it('offset nie teleportuje pitch: ciało dochodzi limitem 20°/s do efektywnego celu', () => {
    const sim = reachFlight(stubGustField(5.2, 1.0))
    const before = sim.pitchRad
    const baseDeg = (sim.targetPitchRad * 180) / Math.PI
    sim.step(EMPTY_INPUT)
    const maxStep = (DEFAULT_JUMP_PARAMS.flight.pitchRateDegPerSecond * Math.PI) / 180 * SIM_DT
    expect(Math.abs(sim.pitchRad - before)).toBeLessThanOrEqual(maxStep + 1e-12)
    // Przy 5,2° do nadrobienia jeden tick to za mało — brak teleportu.
    const effectiveDeg = Math.min(baseDeg + 5.2, DEFAULT_JUMP_PARAMS.flight.maxPitchDeg)
    expect(Math.abs((sim.pitchRad * 180) / Math.PI - effectiveDeg)).toBeGreaterThan(1)
    expect(sim.currentGustOffsetDeg).toBeCloseTo(5.2, 12)
  })

  it('offset nie akumuluje się w bazowym targecie; gracz kontruje bazą', () => {
    const gusty = reachFlight(stubGustField(5.2, 1.0))
    const calm = reachFlight({ ...stubGustField(5.2, 1.0), sampleGustOffsetDeg: () => 0 })
    const startBase = gusty.targetPitchRad
    const maxStep = (DEFAULT_JUMP_PARAMS.flight.pitchRateDegPerSecond * Math.PI) / 180 * SIM_DT
    for (let i = 0; i < 40; i += 1) {
      gusty.step(makeInput([], ['right']))
      calm.step(makeInput([], ['right']))
      expect(gusty.phase).toBe('Flight')
      expect(calm.phase).toBe('Flight')
      // Ta sama baza z podmuchem i bez — offset nie wycieka do targetu.
      expect(gusty.targetPitchRad).toBe(calm.targetPitchRad)
      expect(Math.abs(gusty.pitchRad - calm.pitchRad)).toBeLessThanOrEqual(6 * (Math.PI / 180) + 1e-9)
      void maxStep
    }
    // Kontrowanie: prawa strzałka zbija bazę w dół mimo dodatniego offsetu.
    expect(gusty.targetPitchRad).toBeLessThan(startBase)
  })

  it('w locie efektywny cel jest clampowany do min/max', () => {
    const { minPitchDeg, maxPitchDeg } = DEFAULT_JUMP_PARAMS.flight
    const head = reachFlight(stubGustField(5.2, 1.0))
    let maxBase = -Infinity
    let maxPitch = -Infinity
    for (let i = 0; i < 600 && head.phase === 'Flight'; i += 1) {
      head.step(makeInput([], ['left']))
      maxBase = Math.max(maxBase, (head.targetPitchRad * 180) / Math.PI)
      maxPitch = Math.max(maxPitch, (head.pitchRad * 180) / Math.PI)
    }
    // Strefa clampa osiągnięta (baza + 5,2° ponad max), a ciało jej nie przebiło.
    expect(maxBase).toBeGreaterThan(maxPitchDeg - 5.2)
    expect(maxBase).toBeLessThanOrEqual(maxPitchDeg + 1e-9)
    expect(maxPitch).toBeLessThanOrEqual(maxPitchDeg + 1e-9)
    // Podmuch w plecy przy statycznej bazie: ciało schodzi do bazy − 5,2°.
    const tail = reachFlight(stubGustField(-5.2, -1.0))
    const tailCalm = reachFlight({ ...stubGustField(-5.2, -1.0), sampleGustOffsetDeg: () => 0 })
    const tailBase = tail.targetPitchRad
    let minPitch = Infinity
    for (let i = 0; i < 40; i += 1) {
      tail.step(EMPTY_INPUT)
      tailCalm.step(EMPTY_INPUT)
      expect(tail.phase).toBe('Flight')
      expect(tailCalm.phase).toBe('Flight')
      expect(tail.targetPitchRad).toBe(tailBase)
      minPitch = Math.min(minPitch, (tail.pitchRad * 180) / Math.PI)
    }
    // Baza w dozwolonym zakresie, podłoga trzyma, a offset ciągnie w dół.
    expect((tailBase * 180) / Math.PI).toBeGreaterThanOrEqual(minPitchDeg - 1e-9)
    expect(minPitch).toBeGreaterThanOrEqual(minPitchDeg - 1e-9)
    expect(tail.pitchRad).toBeLessThan(tailCalm.pitchRad - (3 * Math.PI) / 180)
  })

  it('LandingPrep zachowuje target względem stoku; offset obserwowalny, progi bez zmian', () => {
    // Prowadzony lot (ideal pilot) do późnego przygotowania — offset mały lub
    // zerowy, liczy się zasada: baza to czysty stok, offset tylko w efekcie.
    const field = createWindField(42)
    const observed: Array<{ tick: number; targetRad: number; slopeRad: number; offset: number; prepSeconds: number }> = []
    const sim = runJump({
      gate: 8,
      pilot: 'ideal',
      style: 'telemark',
      prepFlightSeconds: 3.0,
      windField: field,
      onStep: (after) => {
        if (after.phase !== 'LandingPrep') return
        const projected = after.hill.surfaceDistanceAtPoint(after.position)
        observed.push({
          tick: after.tick,
          targetRad: after.targetPitchRad,
          slopeRad: after.hill.surfaceSlopeRadAt(projected),
          offset: after.currentGustOffsetDeg,
          prepSeconds: after.landingPrepSeconds,
        })
      },
    })
    expect(sim.landingStyle).toBe('telemark')
    expect(observed.length).toBeGreaterThan(10)
    for (const row of observed) {
      // Baza to czysty stok — offset jej nie modyfikuje (tolerancja na ruch
      // między tickami: baza liczona z pozycji sprzed kroku).
      expect(row.targetRad).toBeCloseTo(-row.slopeRad, 2)
      // Obserwowalny offset zgadza się z polem w czasie symulacji.
      expect(row.offset).toBe(field.sampleGustOffsetDeg?.((row.tick - 1) * SIM_DT, 90) ?? NaN)
    }
    // Przygotowanie tyka normalnie mimo offsetu.
    for (let i = 1; i < observed.length; i += 1) {
      expect((observed[i]?.prepSeconds ?? 0)).toBeGreaterThan(observed[i - 1]?.prepSeconds ?? 0)
    }
    expect(sim.contact?.readiness).toBe(1)
  })

  it('offset nie przejmuje klasyfikacji: styl i gotowość jak bez offsetu', () => {
    const wind = createWindField(2024)
    const withGust = runJump({ gate: 8, pilot: 'ideal', style: 'telemark', prepFlightSeconds: 3.0, windField: wind })
    const suppressed: WindField = { ...wind, sampleGustOffsetDeg: () => 0 }
    const withoutGust = runJump({ gate: 8, pilot: 'ideal', style: 'telemark', prepFlightSeconds: 3.0, windField: suppressed })
    expect(withGust.finished && withoutGust.finished).toBe(true)
    expect(withGust.landingStyle).toBe(withoutGust.landingStyle)
    expect(withGust.contact?.readiness).toBe(withoutGust.contact?.readiness)
  })
})
