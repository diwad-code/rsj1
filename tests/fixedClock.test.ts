import { describe, expect, it } from 'vitest'
import { FixedStepClock } from '../src/core/fixedClock'

function ticksAfterOneSecond(renderHz: number): number {
  const clock = new FixedStepClock()
  let ticks = 0
  clock.frame(0, () => { ticks += 1 })
  for (let frame = 1; frame <= renderHz; frame += 1) {
    const result = clock.frame((frame * 1000) / renderHz, () => { ticks += 1 })
    expect(result.overloaded).toBe(false)
  }
  return ticks
}

describe('FixedStepClock', () => {
  it.each([30, 60, 120, 144])('wykonuje 120 ticków przy prezentacji %d Hz', (renderHz) => {
    expect(ticksAfterOneSecond(renderHz)).toBe(120)
  })

  it('nie zwraca martwego pola alpha (render bez interpolacji)', () => {
    const clock = new FixedStepClock()
    clock.frame(0, () => {})
    const result = clock.frame(1000 / 60, () => {})
    expect(result).toMatchObject({ steps: 2, overloaded: false })
    expect('alpha' in result).toBe(false)
  })

  it('zamiast nadrabiać długą przerwę zgłasza przeciążenie', () => {
    const clock = new FixedStepClock()
    let ticks = 0
    clock.frame(0, () => { ticks += 1 })
    const result = clock.frame(250, () => { ticks += 1 })

    expect(result).toMatchObject({ steps: 0, overloaded: true })
    expect(ticks).toBe(0)
  })

  it('po resecie starsza klatka jest ignorowana bez fałszywego przeciążenia', () => {
    const clock = new FixedStepClock()
    let ticks = 0
    const step = (): void => { ticks += 1 }

    clock.reset(1000)
    const stale = clock.frame(990, step)

    expect(stale).toMatchObject({ steps: 0, overloaded: false })
    expect(ticks).toBe(0)

    const next = clock.frame(1000 + 1000 / 120, step)

    expect(next).toMatchObject({ steps: 1, overloaded: false })
    expect(ticks).toBe(1)
  })
})
