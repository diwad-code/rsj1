import type { Action } from '../input/keyboard'
import { DEFAULT_PLAYER_BINDINGS, type PlayerBindings } from '../player/profiles'

export type GameSettings = {
  readonly version: 1
  readonly bindings: PlayerBindings
  readonly menuConfirm: string
  readonly menuBack: string
  readonly volume: number
  readonly scaleMode: 'fit' | 'integer'
  readonly largeText: boolean
  readonly reducedMotion: boolean
}

export type BindingTarget = Action | 'menuConfirm' | 'menuBack'

export const DEFAULT_SETTINGS: GameSettings = {
  version: 1,
  bindings: DEFAULT_PLAYER_BINDINGS,
  menuConfirm: 'Enter',
  menuBack: 'Backspace',
  volume: 100,
  scaleMode: 'fit',
  largeText: false,
  reducedMotion: false,
}

const ACTIONS: readonly Action[] = ['takeoff', 'left', 'right', 'telemark', 'parallel']
const SETTING_KEYS = ['version', 'bindings', 'menuConfirm', 'menuBack', 'volume', 'scaleMode', 'largeText', 'reducedMotion'] as const
// These keys have priority in the current shell (pause, fullscreen, snow, debug,
// save/lease, start procedure, etc.). Never offer a bind that the shell swallows.
const RESERVED = new Set(['KeyF', 'KeyP', 'KeyS', 'KeyD', 'KeyZ', 'KeyL', 'KeyQ', 'KeyX', 'KeyJ', 'KeyY', 'KeyC', 'KeyG', 'KeyN', 'KeyV'])

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasExactly(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key))
}

function codeProblem(target: BindingTarget, code: string): 'invalid-code' | 'reserved-key' | null {
  const keyboardCode = /^Key[A-Z]$/.test(code) || /^Digit[0-9]$/.test(code)
    || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code)
  if (target === 'menuConfirm' || target === 'menuBack') {
    if (code === 'Enter' || code === 'Backspace') return null
    // Arrow keys always navigate in menus, even after rebinding.
    if (code.startsWith('Arrow')) return 'reserved-key'
  } else if (code === 'Enter' || code === 'Backspace') {
    return 'reserved-key' // Emergency menu controls and pause/resume cannot be reassigned to a jump.
  }
  if (!keyboardCode) return 'invalid-code'
  return RESERVED.has(code) ? 'reserved-key' : null
}

function codeFor(settings: GameSettings, target: BindingTarget): string {
  return target === 'menuConfirm' || target === 'menuBack' ? settings[target] : settings.bindings[target]
}

function allTargets(): readonly BindingTarget[] {
  return [...ACTIONS, 'menuConfirm', 'menuBack']
}

function valid(value: unknown): value is GameSettings {
  if (!record(value) || !hasExactly(value, SETTING_KEYS) || value.version !== 1) return false
  if (!record(value.bindings) || !hasExactly(value.bindings, ACTIONS)) return false
  if (!Number.isInteger(value.volume) || (value.volume as number) < 0 || (value.volume as number) > 100) return false
  if (value.scaleMode !== 'fit' && value.scaleMode !== 'integer') return false
  if (typeof value.largeText !== 'boolean' || typeof value.reducedMotion !== 'boolean') return false
  const codes = new Set<string>()
  for (const target of allTargets()) {
    const code = target === 'menuConfirm' || target === 'menuBack' ? value[target] : value.bindings[target]
    if (typeof code !== 'string' || codeProblem(target, code) || codes.has(code)) return false
    codes.add(code)
  }
  return true
}

/** Unknown versions, corrupt shapes and collisions fall back as a whole, never partially. */
export function normalizeSettings(value: unknown): GameSettings {
  const source = valid(value) ? value : DEFAULT_SETTINGS
  return { ...source, bindings: { ...source.bindings } }
}

export type RebindResult =
  | { readonly ok: true; readonly settings: GameSettings }
  | { readonly ok: false; readonly reason: 'invalid-code' | 'reserved-key' | 'conflict'; readonly conflictingWith?: BindingTarget }

/** A collision is reported, not swapped or silently overwritten. */
export function rebindSettings(settings: GameSettings, target: BindingTarget, code: string): RebindResult {
  const problem = codeProblem(target, code)
  if (problem) return { ok: false, reason: problem }
  const conflict = allTargets().find((other) => other !== target && codeFor(settings, other) === code)
  if (conflict) return { ok: false, reason: 'conflict', conflictingWith: conflict }
  if (target === 'menuConfirm' || target === 'menuBack') {
    return { ok: true, settings: { ...settings, [target]: code } }
  }
  return { ok: true, settings: { ...settings, bindings: { ...settings.bindings, [target]: code } } }
}

export function resolveBoundAction(bindings: PlayerBindings, code: string): Action | undefined {
  return ACTIONS.find((action) => bindings[action] === code)
}
