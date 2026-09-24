import { describe, expect, it } from 'vitest'
import { coefficientsAt, aerodynamicForce, COEFFICIENT_CURVE } from '../src/simulation/aero'
import { JumpSimulation, SIM_DT } from '../src/simulation/jump'
import { DEFAULT_JUMP_PARAMS } from '../src/simulation/params'
import { EMPTY_INPUT, makeInput, runJump } from './support/jumpHarness'

describe('P07 — krzywe CL/CD', () => {
  it('są ograniczone poza zakresem tabeli', () => {
    const first = COEFFICIENT_CURVE[0]
    const last = COEFFICIENT_CURVE[COEFFICIENT_CURVE.length - 1]
    expect(first && last).toBeTruthy()
    if (!first || !last) return
    expect(coefficientsAt(-400)).toEqual({ lift: first.lift, drag: first.drag })
    expect(coefficientsAt(400)).toEqual({ lift: last.lift, drag: last.drag })
  })

  it('interpoluje liniowo i nigdy nie przekracza maksimum tabeli', () => {
    const maxLift = Math.max(...COEFFICIENT_CURVE.map((point) => point.lift))
    for (let angle = -120; angle <= 180; angle += 0.5) {
      const { lift, drag } = coefficientsAt(angle)
      expect(Number.isFinite(lift)).toBe(true)
      expect(Number.isFinite(drag)).toBe(true)
      expect(lift).toBeLessThanOrEqual(maxLift + 1e-9)
      expect(drag).toBeGreaterThan(0)
    }
    expect(coefficientsAt(5).lift).toBeCloseTo((0.25 + 0.78) / 2, 9)
  })

  it('używa prędkości względem powietrza vAir = vJumper − vWind', () => {
    const still = aerodynamicForce({
      velocity: { x: 25, y: -5 },
      windVelocity: { x: 0, y: 0 },
      pitchRad: 0.3,
      airDensity: 1.2,
      referenceAreaSquareMeters: 0.5,
    })
    const withWind = aerodynamicForce({
      velocity: { x: 20, y: -5 },
      windVelocity: { x: -5, y: 0 },
      pitchRad: 0.3,
      airDensity: 1.2,
      referenceAreaSquareMeters: 0.5,
    })
    expect(withWind.airSpeed).toBeCloseTo(still.airSpeed, 9)
    expect(withWind.force.x).toBeCloseTo(still.force.x, 9)
    expect(withWind.force.y).toBeCloseTo(still.force.y, 9)
  })

  it('zwraca siłę zerową przy zerowej prędkości względem powietrza', () => {
    const result = aerodynamicForce({
      velocity: { x: 3, y: 4 },
      windVelocity: { x: 3, y: 4 },
      pitchRad: 0.2,
      airDensity: 1.2,
      referenceAreaSquareMeters: 0.5,
    })
    expect(result.force).toEqual({ x: 0, y: 0 })
  })
})

describe('P07 — korekta pozycji', () => {
  const gate = 8

  it('daje trzy różne ślady: idealny / brak korekty / nadmierna korekta', () => {
    const ideal = runJump({ gate, pilot: 'ideal', style: 'telemark' })
    const none = runJump({ gate, pilot: 'none', style: 'telemark' })
    const over = runJump({ gate, pilot: 'over', style: 'telemark' })

    const distances = {
      ideal: ideal.measuredDistanceMeters ?? 0,
      none: none.measuredDistanceMeters ?? 0,
      over: over.measuredDistanceMeters ?? 0,
    }

    expect(distances.ideal).toBeGreaterThan(distances.none + 10)
    expect(distances.ideal).toBeGreaterThan(distances.over + 10)
    expect(distances.none).not.toBeCloseTo(distances.over, 1)

    // Każdy ślad kończy się terminalnym stanem, także ten nieudany.
    for (const sim of [ideal, none, over]) {
      expect(sim.finished).toBe(true)
      expect(sim.outcome).not.toBeNull()
    }
    expect(ideal.outcome?.status).toBe('landed')
  })

  it('traktuje równoczesne ← i → jako brak korekty', () => {
    const neutralSim = new JumpSimulation({ gateNumber: gate, autoStart: true })
    const idleSim = new JumpSimulation({ gateNumber: gate, autoStart: true })

    for (let i = 0; i < 4000 && !neutralSim.finished; i += 1) {
      neutralSim.step(makeInput([], neutralSim.phase === 'Flight' ? ['left', 'right'] : []))
      idleSim.step(EMPTY_INPUT)
    }
    expect(neutralSim.position.x).toBeCloseTo(idleSim.position.x, 9)
    expect(neutralSim.position.y).toBeCloseTo(idleSim.position.y, 9)
  })

  it('ogranicza tempo dojścia do docelowego pitch', () => {
    const sim = new JumpSimulation({ gateNumber: gate, autoStart: true })
    while (sim.phase !== 'Flight') sim.step(EMPTY_INPUT)

    const maxStepRad = (DEFAULT_JUMP_PARAMS.flight.pitchRateDegPerSecond * Math.PI) / 180 * SIM_DT
    let previous = sim.pitchRad
    for (let i = 0; i < 200 && sim.phase === 'Flight'; i += 1) {
      sim.step(makeInput([], ['right']))
      expect(Math.abs(sim.pitchRad - previous)).toBeLessThanOrEqual(maxStepRad + 1e-12)
      previous = sim.pitchRad
    }
  })

  it('utrzymuje docelowy pitch w zadeklarowanym zakresie sterowania', () => {
    const { minPitchDeg, maxPitchDeg } = DEFAULT_JUMP_PARAMS.flight
    for (const pilot of ['over', 'back'] as const) {
      const sim = new JumpSimulation({ gateNumber: gate, autoStart: true })
      for (let i = 0; i < 4000 && !sim.finished; i += 1) {
        const held = sim.phase === 'Flight' ? [pilot === 'over' ? 'right' as const : 'left' as const] : []
        sim.step(makeInput([], held))
        if (sim.phase === 'Flight') {
          const targetDeg = (sim.targetPitchRad * 180) / Math.PI
          expect(targetDeg).toBeGreaterThanOrEqual(minPitchDeg - 1e-9)
          expect(targetDeg).toBeLessThanOrEqual(maxPitchDeg + 1e-9)
        }
      }
      expect(sim.finished).toBe(true)
    }
  })

  it('nie pozwala na nieskończone unoszenie ani niestabilność numeryczną', () => {
    for (const pilot of ['none', 'ideal', 'over', 'back'] as const) {
      const sim = new JumpSimulation({ gateNumber: 12, autoStart: true })
      let maxHeightAboveTable = -Infinity
      let flightTicks = 0

      for (let i = 0; i < 20_000 && !sim.finished; i += 1) {
        const held = sim.phase === 'Flight' ? [pilot === 'back' ? 'left' as const : 'right' as const] : []
        sim.step(makeInput([], pilot === 'none' ? [] : held))
        if (sim.phase === 'Flight' || sim.phase === 'LandingPrep') {
          flightTicks += 1
          maxHeightAboveTable = Math.max(maxHeightAboveTable, sim.position.y)
        }
        expect(Number.isFinite(sim.position.x)).toBe(true)
        expect(Number.isFinite(sim.position.y)).toBe(true)
        expect(Number.isFinite(sim.velocity.x)).toBe(true)
        expect(Number.isFinite(sim.velocity.y)).toBe(true)
        expect(Number.isFinite(sim.pitchRad)).toBe(true)
      }

      expect(sim.finished).toBe(true)
      // Krawędź progu leży w y = 0; zawodnik nie może unosić się nad nią.
      expect(maxHeightAboveTable).toBeLessThan(2)
      expect(flightTicks * SIM_DT).toBeLessThan(DEFAULT_JUMP_PARAMS.flight.maxDurationSeconds)
      expect(sim.events.some((event) => event.type === 'flightTimeout')).toBe(false)
    }
  })
})
