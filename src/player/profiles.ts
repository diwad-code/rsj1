/** PKG-005 / P18 — profile RAM, obsada hotseat i bramka świeżego Enter. */

import type { Action } from '../input/keyboard'
import type { CompetitionEntrant } from '../sport/competition'

export type PlayerBindings = Readonly<Record<Action, string>>

export type PlayerProfile = {
  readonly id: string
  readonly name: string
  readonly suitColor: string
  readonly skiColor: string
  readonly bindings: PlayerBindings
}

export const DEFAULT_PLAYER_BINDINGS: PlayerBindings = {
  takeoff: 'ArrowUp',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  telemark: 'KeyT',
  parallel: 'KeyR',
}

export const LOCAL_PROFILES: readonly PlayerProfile[] = [
  { id: 'local-01', name: 'Łucja Wicher', suitColor: '#d64d53', skiColor: '#f1bd79', bindings: DEFAULT_PLAYER_BINDINGS },
  { id: 'local-02', name: 'Mikołaj Szron', suitColor: '#286bc6', skiColor: '#f3ead1', bindings: DEFAULT_PLAYER_BINDINGS },
  { id: 'local-03', name: 'Żaneta Iskra', suitColor: '#b85bd7', skiColor: '#77d6c3', bindings: DEFAULT_PLAYER_BINDINGS },
  { id: 'local-04', name: 'Błażej Puch', suitColor: '#e57731', skiColor: '#f3ead1', bindings: DEFAULT_PLAYER_BINDINGS },
  { id: 'local-05', name: 'Maja Zawieja', suitColor: '#3fa865', skiColor: '#f1bd79', bindings: DEFAULT_PLAYER_BINDINGS },
  { id: 'local-06', name: 'Olgierd Mróz', suitColor: '#536c7a', skiColor: '#d64d53', bindings: DEFAULT_PLAYER_BINDINGS },
  { id: 'local-07', name: 'Róża Świst', suitColor: '#cc4f91', skiColor: '#91b4cb', bindings: DEFAULT_PLAYER_BINDINGS },
  { id: 'local-08', name: 'Cezary Płatek', suitColor: '#f1bd79', skiColor: '#286bc6', bindings: DEFAULT_PLAYER_BINDINGS },
  { id: 'local-09', name: 'Iga Chmura', suitColor: '#77d6c3', skiColor: '#e57731', bindings: DEFAULT_PLAYER_BINDINGS },
  { id: 'local-10', name: 'Tymon Zimoród', suitColor: '#91b4cb', skiColor: '#b85bd7', bindings: DEFAULT_PLAYER_BINDINGS },
] as const

export function validateProfiles(profiles: readonly PlayerProfile[]): void {
  if (profiles.length < 1 || profiles.length > 10) {
    throw new Error(`Hotseat wymaga od 1 do 10 profili, otrzymano ${profiles.length}.`)
  }
  const ids = new Set<string>()
  for (const profile of profiles) {
    if (!profile.id.trim()) throw new Error('Profil wymaga stabilnego ID.')
    if (ids.has(profile.id)) throw new Error(`Duplikat ID profilu: ${profile.id}.`)
    if (!profile.name.trim()) throw new Error(`Profil ${profile.id} wymaga nazwy.`)
    ids.add(profile.id)
    const boundCodes = Object.values(profile.bindings)
    if (boundCodes.some((code) => !code)) throw new Error(`Profil ${profile.id} ma pusty bind.`)
    const seenCodes = new Set<string>()
    for (const code of boundCodes) {
      if (seenCodes.has(code)) throw new Error(`Profil ${profile.id} ma duplikat kodu ${code}.`)
      seenCodes.add(code)
    }
  }
}

export function resolveProfileAction(profile: PlayerProfile, keyboardCode: string): Action | undefined {
  return (Object.entries(profile.bindings) as Array<[Action, string]>)
    .find(([, code]) => code === keyboardCode)?.[0]
}

/** Rozkłada ludzi po całej liście, zachowując pierwszy slot dla szybkiego wejścia w hotseat. */
export function hotseatSlotIndexes(profileCount: number, entrantCount = 75): readonly number[] {
  if (!Number.isInteger(profileCount) || profileCount < 1 || profileCount > 10) {
    throw new Error('Liczba profili hotseat musi należeć do zakresu 1–10.')
  }
  if (!Number.isInteger(entrantCount) || entrantCount < profileCount) {
    throw new Error('Pula musi mieścić wszystkie profile.')
  }
  if (profileCount === 1) return [0]
  const indexes: number[] = []
  for (let index = 0; index < profileCount; index += 1) {
    indexes.push(Math.round(index * (entrantCount - 1) / (profileCount - 1)))
  }
  return indexes
}

export function replaceEntrantsWithProfiles(
  entrants: readonly CompetitionEntrant[],
  profiles: readonly PlayerProfile[],
): readonly CompetitionEntrant[] {
  validateProfiles(profiles)
  if (entrants.length !== 75) throw new Error('Obsada standardowego konkursu musi mieć 75 miejsc.')
  const slots = hotseatSlotIndexes(profiles.length, entrants.length)
  const replacementBySlot = new Map(slots.map((slot, index) => [slot, profiles[index]]))
  return entrants.map((entrant, index) => {
    const profile = replacementBySlot.get(index)
    if (!profile) return entrant
    return {
      id: profile.id,
      name: profile.name,
      startNumber: entrant.startNumber,
      controller: { kind: 'human', profileId: profile.id },
    }
  })
}

export function profileForEntrant(
  entrant: CompetitionEntrant,
  profiles: readonly PlayerProfile[],
): PlayerProfile | null {
  const controller = entrant.controller
  if (controller.kind !== 'human') return null
  return profiles.find((profile) => profile.id === controller.profileId) ?? null
}

/**
 * Przejście ekranu może nastąpić na keydown Enter. Wtedy bramka pozostaje
 * zamknięta do odpowiadającego keyup i dopiero kolejny keydown jest przyjęty.
 */
export class FreshEnterGate {
  private armed = false

  begin(enterCurrentlyDown: boolean): void {
    this.armed = !enterCurrentlyDown
  }

  release(): void {
    this.armed = true
  }

  press(repeat = false): boolean {
    if (repeat || !this.armed) return false
    this.armed = false
    return true
  }

  get ready(): boolean {
    return this.armed
  }
}
