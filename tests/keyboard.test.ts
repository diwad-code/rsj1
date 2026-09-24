import { describe, expect, it } from 'vitest'
import { FIXED_STEP_MS } from '../src/core/fixedClock'
import { ActiveSessionClock, InputBuffer, normalizeEventTimestamp } from '../src/input/keyboard'

function setup() {
  const clock = new ActiveSessionClock()
  clock.start(100)
  return { clock, input: new InputBuffer(clock) }
}

describe('InputBuffer', () => {
  it('zachowuje szybkie pressed i released w jednym ticku oraz ich kolejność', () => {
    const { input } = setup()
    input.enqueue('takeoff', 'pressed', 105, 0)
    input.enqueue('takeoff', 'released', 106, 0)

    const state = input.consume(0)
    expect(state.pressed).toEqual(['takeoff'])
    expect(state.released).toEqual(['takeoff'])
    expect([...state.held]).toEqual([])
    expect(state.events.map((event) => event.sequence)).toEqual([0, 1])
  })

  it('filtruje autorepeat i ponowne keydown bez keyup', () => {
    const { input } = setup()
    expect(input.enqueue('takeoff', 'pressed', 100, 0)).not.toBeNull()
    expect(input.enqueue('takeoff', 'pressed', 101, 0, true)).toBeNull()
    expect(input.enqueue('takeoff', 'pressed', 102, 0)).toBeNull()
    expect(input.consume(0).pressed).toEqual(['takeoff'])
  })

  it('neutralizuje jednoczesne lewo i prawo', () => {
    const { input } = setup()
    input.enqueue('left', 'pressed', 100, 0)
    input.enqueue('right', 'pressed', 101, 0)
    expect(input.consume(0).horizontal).toBe(0)
  })

  it('wyznacza tick z czasu zdarzenia i oznacza spóźnioną dostawę', () => {
    const { input } = setup()
    const onTime = input.enqueue('telemark', 'pressed', 100 + FIXED_STEP_MS * 4.5, 0)
    const late = input.enqueue('parallel', 'pressed', 100 + FIXED_STEP_MS, 8)

    expect(onTime).toMatchObject({ tick: 4, delayed: false })
    expect(late).toMatchObject({ tick: 8, delayed: true })
  })

  it('reset usuwa kolejkę i held po pauzie lub blur', () => {
    const { input } = setup()
    input.enqueue('left', 'pressed', 100, 0)
    input.consume(0)
    input.enqueue('left', 'released', 110, 1)
    input.reset()

    expect(input.consume(1)).toMatchObject({ pressed: [], released: [], horizontal: 0 })
    expect(input.enqueue('left', 'released', 120, 1)).toBeNull()
  })

  it('pauza nie zwiększa aktywnego czasu sesji', () => {
    const { clock } = setup()
    clock.pause(600)
    clock.resume(5600)

    expect(clock.tickFor(5700, 0).tick).toBe(72)
  })

  it('zmiana trybu fullscreen może przestawić kotwicę bez nadrabiania przejścia', () => {
    const { clock } = setup()
    clock.reanchor(600)

    expect(clock.tickFor(700, 0).tick).toBe(12)
  })

  it('pauza przeciążeniowa wyrównuje czas wejścia do pierwszego niewykonanego ticka', () => {
    const { clock } = setup()
    clock.pauseAtTick(15)
    clock.resume(10_000)

    expect(clock.tickFor(10_001, 15)).toEqual({ tick: 15, delayed: false })
  })

  it('konsumuje spóźnione wejście (tick <= bieżący), przyszłe zostaje w kolejce', () => {
    const { input } = setup()
    input.enqueue('takeoff', 'pressed', 100, 0)
    // Spóźnione: event z tick 0 konsumowany dopiero przy tick 5.
    const stale = input.consume(5)
    expect(stale.pressed).toEqual(['takeoff'])
    expect(stale.events[0]).toMatchObject({ tick: 0 })

    input.enqueue('left', 'pressed', 100, 5)
    input.enqueue('right', 'pressed', 100 + FIXED_STEP_MS * 10, 5)
    const mid = input.consume(5)
    expect(mid.pressed).toEqual(['left'])
    // Przyszły event z tick 10 zostaje w kolejce.
    expect(input.consume(9).pressed).toEqual([])
    expect(input.consume(10).pressed).toEqual(['right'])
  })

  it('normalizuje znaczniki epoch i zachowuje monotoniczny DOMHighRes timestamp', () => {
    expect(normalizeEventTimestamp(412, 415, 1_000_000)).toBe(412)
    expect(normalizeEventTimestamp(1_000_412, 415, 1_000_000)).toBe(412)
  })
})
