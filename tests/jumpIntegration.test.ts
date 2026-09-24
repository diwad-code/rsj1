import { describe, expect, it } from 'vitest'
import { FixedStepClock } from '../src/core/fixedClock'
import { ActiveSessionClock, InputBuffer } from '../src/input/keyboard'
import { JumpSimulation, SIM_DT } from '../src/simulation/jump'
import { DEFAULT_JUMP_PARAMS } from '../src/simulation/params'
import { EMPTY_INPUT, edgeTickFor, makeInput, runScriptAtRenderHz, terminalSummary, type ScriptedKey } from './support/jumpHarness'

const GATE = 8
const EDGE_TICK = edgeTickFor(GATE)
const IDEAL_PRESS_TICK = EDGE_TICK - Math.round(DEFAULT_JUMP_PARAMS.takeoff.idealLeadSeconds / SIM_DT)

/**
 * Jeden ślad wejścia w milisekundach aktywnej sesji: otwarcie belki, wybicie
 * w dobrym momencie, korekta pozycji i przygotowanie telemarku.
 */
const INPUT_TRACE: readonly ScriptedKey[] = [
  { atMs: 5, action: 'right', edge: 'pressed' },
  { atMs: 25, action: 'right', edge: 'released' },
  { atMs: IDEAL_PRESS_TICK * SIM_DT * 1000, action: 'takeoff', edge: 'pressed' },
  { atMs: IDEAL_PRESS_TICK * SIM_DT * 1000 + 60, action: 'takeoff', edge: 'released' },
  { atMs: (EDGE_TICK + 12) * SIM_DT * 1000, action: 'right', edge: 'pressed' },
  { atMs: (EDGE_TICK + 152) * SIM_DT * 1000, action: 'right', edge: 'released' },
  { atMs: (EDGE_TICK + 430) * SIM_DT * 1000, action: 'telemark', edge: 'pressed' },
  { atMs: (EDGE_TICK + 470) * SIM_DT * 1000, action: 'telemark', edge: 'released' },
]

describe('Q-SIM-01 — wynik nie zależy od częstości renderowania', () => {
  const runs = [30, 60, 120, 144].map((hz) => ({
    hz,
    result: runScriptAtRenderHz(hz, INPUT_TRACE, { gateNumber: GATE }),
  }))

  it('daje te same zdarzenia terminalne przy 30/60/120/144 Hz', () => {
    const reference = runs[0]
    expect(reference).toBeDefined()
    if (!reference) return

    expect(reference.result.sim.finished).toBe(true)
    for (const run of runs) {
      expect(run.result.sim.finished).toBe(true)
      expect(terminalSummary(run.result.sim)).toBe(terminalSummary(reference.result.sim))
      expect(run.result.sim.outcome).toEqual(reference.result.sim.outcome)
      expect(run.result.sim.measuredDistanceMeters).toBe(reference.result.sim.measuredDistanceMeters)
      // Tick zakończenia symulacji; licznik klatek drivera może wykonać jeszcze
      // jedno wywołanie po terminalnym stanie, które symulacja ignoruje.
      expect(run.result.sim.tick).toBe(reference.result.sim.tick)
    }
  })

  it('wykonuje pełny skok zakończony ustaniem', () => {
    const reference = runs[0]?.result.sim
    expect(reference?.outcome?.status).toBe('landed')
    expect(reference?.outcome?.terminalPhase).toBe('FinishLine')
    expect(reference?.measuredDistanceMeters ?? 0).toBeGreaterThan(100)
    expect(reference?.events.map((event) => event.type)).toEqual([
      'gateOpen',
      'takeoffImpulseStart',
      'perfectTakeoff',
      'takeoffEdge',
      'landingPrep',
      'measured',
      'contact',
      'finishLine',
    ])
  })

  it('nie dokłada dodatkowego impulsu przy wolnej prezentacji', () => {
    for (const run of runs) {
      expect(run.result.sim.events.filter((event) => event.type === 'takeoffImpulseStart')).toHaveLength(1)
    }
  })
})

describe('Q-SIM-04 — autorepeat i klawisze równoczesne w skoku', () => {
  it('autorepeat ↑ nie daje drugiego wybicia', () => {
    const sessionClock = new ActiveSessionClock()
    const buffer = new InputBuffer(sessionClock)
    const sim = new JumpSimulation({ gateNumber: GATE, autoStart: true })
    sessionClock.start(0)

    let tick = 0
    while (!sim.finished && tick < 20_000) {
      if (tick === IDEAL_PRESS_TICK) {
        buffer.enqueue('takeoff', 'pressed', tick * SIM_DT * 1000, tick)
        // Kolejne zdarzenia auto-repeat systemu.
        buffer.enqueue('takeoff', 'pressed', tick * SIM_DT * 1000 + 1, tick, true)
        buffer.enqueue('takeoff', 'pressed', tick * SIM_DT * 1000 + 2, tick, true)
      }
      sim.step(buffer.consume(tick))
      tick += 1
    }
    expect(sim.events.filter((event) => event.type === 'takeoffImpulseStart')).toHaveLength(1)
  })
})

describe('Q-SIM-05 — pauza, blur i ukrycie karty', () => {
  it('nie nadrabia czasu i nie zostawia trzymanego klawisza po wznowieniu', () => {
    const sessionClock = new ActiveSessionClock()
    const buffer = new InputBuffer(sessionClock)
    const clock = new FixedStepClock()
    const sim = new JumpSimulation({ gateNumber: GATE, autoStart: true })

    let tick = 0
    const stepOnce = (): void => {
      sim.step(buffer.consume(tick))
      tick += 1
    }

    sessionClock.start(0)
    clock.frame(0, () => {})

    // Kilka klatek 60 Hz, z trzymanym → w locie.
    let nowMs = 0
    for (let frame = 0; frame < 60; frame += 1) {
      nowMs += 1000 / 60
      clock.frame(nowMs, stepOnce)
    }
    buffer.enqueue('right', 'pressed', nowMs, tick)
    for (let frame = 0; frame < 10; frame += 1) {
      nowMs += 1000 / 60
      clock.frame(nowMs, stepOnce)
    }
    const tickAtPause = tick
    expect(sim.tick).toBe(tickAtPause)

    // Pauza jak przy blur / hidden: reset bufora i zatrzymanie czasu sesji.
    sessionClock.pause(nowMs)
    clock.reset()
    buffer.reset()
    const heldAfterReset = buffer.consume(tick)
    expect(heldAfterReset.held.size).toBe(0)
    expect(heldAfterReset.horizontal).toBe(0)

    // Długa nieobecność: 4 sekundy realnego czasu.
    nowMs += 4000
    sessionClock.resume(nowMs)
    clock.reset(nowMs)

    nowMs += 1000 / 60
    clock.frame(nowMs, stepOnce)
    expect(sim.tick - tickAtPause).toBeLessThanOrEqual(2)

    // Fizyczny keyup po wznowieniu nie tworzy samotnego released ani osi.
    buffer.enqueue('right', 'released', nowMs, tick)
    const afterResume = buffer.consume(tick)
    expect(afterResume.events).toHaveLength(0)
    expect(afterResume.horizontal).toBe(0)
  })

  it('przerwa dłuższa niż limit nadrabiania zgłasza przeciążenie zamiast skoku fizyki', () => {
    const clock = new FixedStepClock()
    const sim = new JumpSimulation({ gateNumber: GATE, autoStart: true })
    let tick = 0
    clock.frame(0, () => {})
    for (let frame = 1; frame <= 60; frame += 1) {
      clock.frame(frame * (1000 / 60), () => {
        sim.step(EMPTY_INPUT)
        tick += 1
      })
    }
    const before = tick
    const overloaded = clock.frame(60 * (1000 / 60) + 900, () => {
      sim.step(EMPTY_INPUT)
      tick += 1
    })
    expect(overloaded.overloaded).toBe(true)
    expect(tick).toBe(before)
  })
})

describe('Q-SIM-09 — mapowanie czasowanych zdarzeń na ticki skoku', () => {
  it('to samo zdarzenie trafia w ten sam tick niezależnie od klatki, w której zostało dostarczone', () => {
    const pressMs = IDEAL_PRESS_TICK * SIM_DT * 1000 + 3
    const trace: ScriptedKey[] = [
      { atMs: 5, action: 'right', edge: 'pressed' },
      { atMs: 25, action: 'right', edge: 'released' },
      { atMs: pressMs, action: 'takeoff', edge: 'pressed' },
      { atMs: pressMs + 40, action: 'takeoff', edge: 'released' },
    ]

    const results = [30, 144].map((hz) => runScriptAtRenderHz(hz, trace, { gateNumber: GATE }))
    const first = results[0]
    const second = results[1]
    expect(first && second).toBeTruthy()
    if (!first || !second) return

    const impulseTick = (sim: JumpSimulation): number | undefined =>
      sim.events.find((event) => event.type === 'takeoffImpulseStart')?.tick
    expect(impulseTick(first.sim)).toBe(IDEAL_PRESS_TICK)
    expect(impulseTick(second.sim)).toBe(IDEAL_PRESS_TICK)
    expect(first.sim.measuredDistanceMeters).toBe(second.sim.measuredDistanceMeters)
  })

  it('zachowuje obie krawędzie bardzo krótkiego naciśnięcia pomiędzy klatkami', () => {
    const sessionClock = new ActiveSessionClock()
    const buffer = new InputBuffer(sessionClock)
    sessionClock.start(0)

    buffer.enqueue('telemark', 'pressed', 10.0, 0)
    buffer.enqueue('telemark', 'released', 10.4, 0)
    const consumed = buffer.consume(1)
    expect(consumed.events.map((event) => event.edge)).toEqual(['pressed', 'released'])
    expect(consumed.pressed).toEqual(['telemark'])
    expect(consumed.released).toEqual(['telemark'])
    expect(consumed.held.size).toBe(0)

    // Symulacja i tak przyjmuje wybór lądowania z krawędzi pressed.
    // PKG-008: okno wczesne <1,0 s, więc lecimy z idealnym wybiciem i czekamy
    // 1,25 s, żeby późne T nie wpadało w awaryjne dwie nogi.
    const sim = new JumpSimulation({ gateNumber: GATE, autoStart: true })
    while (sim.phase !== 'Flight') {
      if (sim.tick === IDEAL_PRESS_TICK) sim.step(makeInput(['takeoff']))
      else sim.step(EMPTY_INPUT)
    }
    for (let i = 0; i < 150; i += 1) sim.step(EMPTY_INPUT)
    sim.step(makeInput(['telemark']))
    expect(sim.landingStyle).toBe('telemark')
    expect(sim.phase).toBe('LandingPrep')
  })
})
