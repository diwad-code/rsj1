import { describe, expect, it } from 'vitest'
import { JumpSimulation, SIM_DT } from '../src/simulation/jump'
import { DEFAULT_JUMP_PARAMS } from '../src/simulation/params'
import { sweepContact } from '../src/simulation/hill'
import { EMPTY_INPUT, edgeTickFor, makeInput, runJump } from './support/jumpHarness'
import { NO_BONUS_PARAMS, replayTape, runAdaptiveCapture } from './support/r16PerfectProbe'

const GATE = 8
const EXPECTED_NORMAL_GAIN = DEFAULT_JUMP_PARAMS.takeoff.perfectImpulseNewtonSeconds / DEFAULT_JUMP_PARAMS.massKg

describe('PKG-008 r16-fix — premia perfect to fizyczny impuls, nie teleport', () => {
  it('daje wyższy fizyczny tor przed jakimkolwiek wejściem lądowania i większe v⊥ oderwania', () => {
    const pressFor = (params: typeof DEFAULT_JUMP_PARAMS): number =>
      edgeTickFor(GATE, params) - Math.round(params.takeoff.idealLeadSeconds / SIM_DT)
    const basePress = pressFor(NO_BONUS_PARAMS)
    const bonusPress = pressFor(DEFAULT_JUMP_PARAMS)
    expect(bonusPress).toBe(basePress)

    const fly = (params: typeof DEFAULT_JUMP_PARAMS, pressTick: number): JumpSimulation => {
      const sim = new JumpSimulation({ gateNumber: GATE, autoStart: true, params })
      for (let guard = 0; guard < 20_000; guard += 1) {
        if (sim.tick === pressTick) sim.step(makeInput(['takeoff']))
        else sim.step(EMPTY_INPUT)
        if (sim.phase === 'Flight' && sim.flightSeconds >= 0.5) break
      }
      return sim
    }
    const base = fly(NO_BONUS_PARAMS, basePress)
    const bonus = fly(DEFAULT_JUMP_PARAMS, bonusPress)

    expect(base.phase).toBe('Flight')
    expect(bonus.phase).toBe('Flight')
    // Te same ticki, te same (puste) wejścia po wybiciu — różnica to czysta fizyka.
    expect(bonus.tick).toBe(base.tick)
    expect(bonus.takeoffNormalSpeed - base.takeoffNormalSpeed).toBeCloseTo(EXPECTED_NORMAL_GAIN, 9)
    expect(EXPECTED_NORMAL_GAIN).toBeCloseTo(18 / 65, 9)
    expect(bonus.position.y).toBeGreaterThan(base.position.y)
    expect(bonus.velocity.y).toBeGreaterThan(base.velocity.y)
    expect(bonus.perfectTakeoff).toBe(true)
    expect(base.perfectTakeoff).toBe(true)
  })

  it('punkt kontaktu to rzeczywisty wynik sweepu na odcinku ruchu, bez przesunięcia', () => {
    const posByTick = new Map<number, { x: number; y: number }>()
    const velByTick = new Map<number, { x: number; y: number }>()
    const sim = runJump({
      gate: GATE,
      offsetTicks: 0,
      pilot: 'ideal',
      style: 'telemark',
      onStep: (current) => {
        posByTick.set(current.tick, { ...current.position })
        velByTick.set(current.tick, { ...current.velocity })
      },
    })
    expect(sim.perfectTakeoff).toBe(true)
    const contactEvent = sim.events.find((event) => event.type === 'contact')
    expect(contactEvent).toBeDefined()
    if (!contactEvent) return
    const measured = sim.measuredDistanceMeters ?? NaN
    const prev = posByTick.get(contactEvent.tick)
    const vel = velByTick.get(contactEvent.tick + 1)
    expect(prev).toBeDefined()
    expect(vel).toBeDefined()
    if (!prev || !vel) return
    const rawNext = { x: prev.x + vel.x * SIM_DT, y: prev.y + vel.y * SIM_DT }
    const hit = sweepContact(sim.hill.surfaceCurves, prev, rawNext)
    expect(hit).not.toBeNull()
    // Bez dopisku do odległości: pomiar to dokładnie dystans sweepu.
    expect(hit?.distanceMeters ?? NaN).toBe(measured)
    // Punkt kontaktu leży przy odcinku ruchu (snap do powierzchni w kroku
    // siatki 0,05 m), a nie metry dalej na stoku.
    const point = sim.contact?.point
    expect(point).toBeDefined()
    if (!point || !hit) return
    const segX = rawNext.x - prev.x
    const segY = rawNext.y - prev.y
    const len2 = segX * segX + segY * segY
    const t = Math.min(1, Math.max(0, ((point.x - prev.x) * segX + (point.y - prev.y) * segY) / len2))
    const closest = { x: prev.x + segX * t, y: prev.y + segY * t }
    expect(Math.hypot(point.x - closest.x, point.y - closest.y)).toBeLessThan(0.1)
    // Usunięte pole oszustwa nie wraca pod inną nazwą.
    expect(sim).not.toHaveProperty('perfectTakeoffBonusMeters')
  })

  it('ta sama taśma i seed dają ten sam stan i wynik', () => {
    const base = runAdaptiveCapture(GATE, NO_BONUS_PARAMS, 0)
    const first = replayTape(GATE, DEFAULT_JUMP_PARAMS, 0, base.tape)
    const second = replayTape(GATE, DEFAULT_JUMP_PARAMS, 0, base.tape)
    expect(second.measuredDistanceMeters).toBe(first.measuredDistanceMeters)
    expect(second.outcome).toEqual(first.outcome)
    expect(second.events.map((e) => `${e.tick} ${e.type}`)).toEqual(first.events.map((e) => `${e.tick} ${e.type}`))
    expect(second.position).toEqual(first.position)

    const directA = runJump({ gate: GATE, offsetTicks: 0, pilot: 'ideal', style: 'telemark' })
    const directB = runJump({ gate: GATE, offsetTicks: 0, pilot: 'ideal', style: 'telemark' })
    expect(directB.measuredDistanceMeters).toBe(directA.measuredDistanceMeters)
    expect(directB.outcome).toEqual(directA.outcome)
  })

  it('przytrzymanie i spam ↑ nie mnożą premii, zdarzenie jest dokładnie raz', () => {
    const pressTick = edgeTickFor(GATE, DEFAULT_JUMP_PARAMS)
      - Math.round(DEFAULT_JUMP_PARAMS.takeoff.idealLeadSeconds / SIM_DT)
    const single = new JumpSimulation({ gateNumber: GATE, autoStart: true })
    while (single.phase === 'Inrun' || single.phase === 'Takeoff') {
      single.step(makeInput(single.tick === pressTick ? ['takeoff'] : []))
    }
    const spammed = new JumpSimulation({ gateNumber: GATE, autoStart: true })
    while (spammed.phase === 'Inrun' || spammed.phase === 'Takeoff') {
      const tick = spammed.tick
      const pressed = tick === pressTick || tick === pressTick + 4 || tick === pressTick + 9 ? ['takeoff' as const] : []
      spammed.step(makeInput([...pressed]))
    }
    for (const sim of [single, spammed]) {
      expect(sim.events.filter((e) => e.type === 'takeoffImpulseStart')).toHaveLength(1)
      expect(sim.events.filter((e) => e.type === 'perfectTakeoff')).toHaveLength(1)
      expect(sim.perfectTakeoff).toBe(true)
    }
    expect(spammed.takeoffNormalSpeed).toBe(single.takeoffNormalSpeed)
    expect(spammed.deliveredImpulseNewtonSeconds).toBe(single.deliveredImpulseNewtonSeconds)

    // Spam po oderwaniu nie dokłada impulsu ani zdarzeń.
    const flightSpam = new JumpSimulation({ gateNumber: GATE, autoStart: true })
    while (flightSpam.phase !== 'Flight') {
      flightSpam.step(makeInput(flightSpam.tick === pressTick ? ['takeoff'] : []))
    }
    for (let i = 0; i < 20; i += 1) flightSpam.step(makeInput(['takeoff']))
    expect(flightSpam.events.filter((e) => e.type === 'takeoffImpulseStart')).toHaveLength(1)
    expect(flightSpam.events.filter((e) => e.type === 'perfectTakeoff')).toHaveLength(1)
    const detail = flightSpam.events.find((e) => e.type === 'perfectTakeoff')?.detail ?? ''
    expect(detail).toContain('N·s')
    expect(detail).not.toContain('bonus')
  })
})
