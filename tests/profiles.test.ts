import { describe, expect, it } from 'vitest'
import { createFictionalEntrants } from '../src/sport/ai'
import {
  DEFAULT_PLAYER_BINDINGS,
  FreshEnterGate,
  LOCAL_PROFILES,
  replaceEntrantsWithProfiles,
  resolveProfileAction,
  validateProfiles,
  type PlayerProfile,
} from '../src/player/profiles'

describe('P18 — profile i obsada hotseat', () => {
  it('obsługuje 1 i 10 ludzi w pełnej puli 75', () => {
    const bots = createFictionalEntrants('normal')
    for (const count of [1, 10]) {
      const roster = replaceEntrantsWithProfiles(bots, LOCAL_PROFILES.slice(0, count))
      expect(roster).toHaveLength(75)
      expect(roster.filter((entrant) => entrant.controller.kind === 'human')).toHaveLength(count)
      expect(new Set(roster.map((entrant) => entrant.id)).size).toBe(75)
    }
  })

  it('zezwala na duplikaty nazw i odrzuca duplikaty stabilnego ID', () => {
    const duplicateName: PlayerProfile[] = [
      { ...LOCAL_PROFILES[0]!, id: 'one', name: 'Łucja Żółć' },
      { ...LOCAL_PROFILES[1]!, id: 'two', name: 'Łucja Żółć' },
    ]
    expect(() => validateProfiles(duplicateName)).not.toThrow()
    expect(() => validateProfiles([duplicateName[0]!, { ...duplicateName[1]!, id: 'one' }])).toThrow(/Duplikat ID/)
    expect(replaceEntrantsWithProfiles(createFictionalEntrants('easy'), duplicateName).map((item) => item.name)).toContain('Łucja Żółć')
  })

  it('odrzuca duplikat kodu klawisza w jednym profilu', () => {
    const duplicated: PlayerProfile = {
      ...LOCAL_PROFILES[0]!,
      id: 'dup-keys',
      bindings: { ...DEFAULT_PLAYER_BINDINGS, left: 'ArrowUp' },
    }
    expect(() => validateProfiles([duplicated])).toThrow(/duplikat kodu/)
  })

  it('resolver zawsze czyta bindy aktywnego profilu', () => {
    const alternate: PlayerProfile = {
      id: 'alternate',
      name: 'Róża Gęślą',
      suitColor: '#ffffff',
      skiColor: '#000000',
      bindings: { ...DEFAULT_PLAYER_BINDINGS, takeoff: 'KeyW', left: 'KeyA', right: 'KeyD' },
    }
    expect(resolveProfileAction(LOCAL_PROFILES[0]!, 'ArrowUp')).toBe('takeoff')
    expect(resolveProfileAction(alternate, 'ArrowUp')).toBeUndefined()
    expect(resolveProfileAction(alternate, 'KeyW')).toBe('takeoff')
  })
})

describe('P18 — świeży Enter', () => {
  it('nie przyjmuje keydown zamykającego poprzedni ekran', () => {
    const gate = new FreshEnterGate()
    gate.begin(true)
    expect(gate.press()).toBe(false)
    gate.release()
    expect(gate.press()).toBe(true)
    expect(gate.press(true)).toBe(false)
  })

  it('przy automatycznym wejściu na ekran przyjmuje pierwszy nowy Enter', () => {
    const gate = new FreshEnterGate()
    gate.begin(false)
    expect(gate.ready).toBe(true)
    expect(gate.press()).toBe(true)
  })
})
