import { describe, expect, it } from 'vitest'
import { DEFAULT_PLAYER_BINDINGS } from '../src/player/profiles'
import {
  DEFAULT_SETTINGS,
  normalizeSettings,
  rebindSettings,
  resolveBoundAction,
  type BindingTarget,
  type GameSettings,
} from '../src/settings/settings'

describe('P22 — model ustawień', () => {
  it('korzysta z pięciu istniejących akcji i niezależnych kodów menu', () => {
    expect(DEFAULT_SETTINGS.bindings).toEqual(DEFAULT_PLAYER_BINDINGS)
    expect(DEFAULT_SETTINGS.menuConfirm).toBe('Enter')
    expect(DEFAULT_SETTINGS.menuBack).toBe('Backspace')
    for (const [action, code] of Object.entries(DEFAULT_SETTINGS.bindings)) {
      expect(resolveBoundAction(DEFAULT_SETTINGS.bindings, code)).toBe(action)
    }
    expect(resolveBoundAction(DEFAULT_SETTINGS.bindings, 'KeyW')).toBeUndefined()
  })

  it('zwraca bezpieczny nowy domyślny obiekt dla nieznanej wersji, złego kształtu, liczb i kolizji', () => {
    const bad: unknown[] = [
      null,
      { ...DEFAULT_SETTINGS, version: 2 },
      { ...DEFAULT_SETTINGS, bindings: { ...DEFAULT_SETTINGS.bindings, extra: 'KeyW' } },
      { ...DEFAULT_SETTINGS, bindings: { ...DEFAULT_SETTINGS.bindings, right: 'ArrowLeft' } },
      { ...DEFAULT_SETTINGS, bindings: { ...DEFAULT_SETTINGS.bindings, left: 'Enter' } },
      { ...DEFAULT_SETTINGS, bindings: { ...DEFAULT_SETTINGS.bindings, telemark: 'KeyF' } },
      { ...DEFAULT_SETTINGS, menuBack: 'ArrowDown' },
      { ...DEFAULT_SETTINGS, menuConfirm: 'KeyT' },
      { ...DEFAULT_SETTINGS, menuConfirm: 'BadKey' },
      { ...DEFAULT_SETTINGS, volume: Number.NaN },
      { ...DEFAULT_SETTINGS, volume: 100.1 },
      { ...DEFAULT_SETTINGS, volume: -1 },
      { ...DEFAULT_SETTINGS, volume: 101 },
      { ...DEFAULT_SETTINGS, scaleMode: 'stretch' },
      { ...DEFAULT_SETTINGS, largeText: 'yes' },
      { ...DEFAULT_SETTINGS, extra: 'unexpected' },
    ]
    for (const value of bad) {
      const normalized = normalizeSettings(value)
      expect(normalized).toEqual(DEFAULT_SETTINGS)
      expect(normalized).not.toBe(DEFAULT_SETTINGS)
      expect(normalized.bindings).not.toBe(DEFAULT_PLAYER_BINDINGS)
    }
  })

  it('zachowuje poprawne opcje i nie oddaje obiektu źródłowego', () => {
    const custom: GameSettings = {
      ...DEFAULT_SETTINGS,
      bindings: { ...DEFAULT_SETTINGS.bindings, takeoff: 'KeyW' },
      menuBack: 'Digit1',
      volume: 0,
      scaleMode: 'integer',
      largeText: true,
      reducedMotion: true,
    }
    const copy = normalizeSettings(custom)
    expect(copy).toEqual(custom)
    expect(copy).not.toBe(custom)
    expect(copy.bindings).not.toBe(custom.bindings)
    expect(normalizeSettings({ ...custom, volume: 100 }).volume).toBe(100)
  })

  it('wykrywa konflikty między pięcioma akcjami a klawiszami menu bez nadpisywania', () => {
    expect(rebindSettings(DEFAULT_SETTINGS, 'left', 'ArrowUp')).toEqual({
      ok: false, reason: 'conflict', conflictingWith: 'takeoff',
    })
    expect(rebindSettings(DEFAULT_SETTINGS, 'menuConfirm', 'KeyT')).toEqual({
      ok: false, reason: 'conflict', conflictingWith: 'telemark',
    })
    expect(rebindSettings(DEFAULT_SETTINGS, 'menuBack', 'Enter')).toEqual({
      ok: false, reason: 'conflict', conflictingWith: 'menuConfirm',
    })
    expect(DEFAULT_SETTINGS.bindings).toEqual(DEFAULT_PLAYER_BINDINGS)
  })

  it('chroni skróty globalne i awaryjne, pozwalając na domyślne strzałki', () => {
    for (const code of ['Enter', 'Backspace', 'KeyF', 'KeyP', 'KeyS', 'KeyD', 'KeyZ', 'KeyL', 'KeyQ']) {
      expect(rebindSettings(DEFAULT_SETTINGS, 'takeoff', code)).toMatchObject({ ok: false, reason: 'reserved-key' })
    }
    expect(rebindSettings(DEFAULT_SETTINGS, 'menuConfirm', 'ArrowRight')).toMatchObject({ ok: false, reason: 'reserved-key' })
    expect(rebindSettings(DEFAULT_SETTINGS, 'telemark', 'Space')).toMatchObject({ ok: false, reason: 'invalid-code' })
    expect(rebindSettings(DEFAULT_SETTINGS, 'takeoff', 'ArrowUp')).toMatchObject({ ok: true })
  })

  it('remapuje każdy cel i rozwiązuje akcje semantyczne niezależnie od klawisza', () => {
    let current = DEFAULT_SETTINGS
    for (const [target, code] of [
      ['takeoff', 'KeyW'], ['left', 'KeyA'], ['right', 'KeyE'],
      ['telemark', 'KeyH'], ['parallel', 'KeyB'],
      ['menuConfirm', 'Digit1'], ['menuBack', 'Digit2'],
    ] as const satisfies readonly (readonly [BindingTarget, string])[]) {
      const outcome = rebindSettings(current, target, code)
      expect(outcome.ok).toBe(true)
      if (!outcome.ok) throw new Error(outcome.reason)
      current = outcome.settings
    }
    expect(normalizeSettings(current)).toEqual(current)
    expect(resolveBoundAction(current.bindings, 'KeyW')).toBe('takeoff')
    expect(resolveBoundAction(current.bindings, 'ArrowUp')).toBeUndefined()
    expect(new Set([...Object.values(current.bindings), current.menuConfirm, current.menuBack]).size).toBe(7)
    expect(DEFAULT_SETTINGS.bindings.takeoff).toBe('ArrowUp')
  })
})
