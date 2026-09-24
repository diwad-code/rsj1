/**
 * PKG-006 / P19–P20 — jeden wersjonowany format zapisu obecnego produktu.
 *
 * Moduł jest czysty: nie zna IndexedDB, DOM ani renderera. Zawiera kształt
 * danych, walidację przyjmowanego zapisu i jedną politykę rekordu z
 * GAMEPLAY_SPEC §9. Nie tworzymy magazynów dla trybów, których jeszcze nie ma.
 */

import type { PlayerProfile } from '../player/profiles'
import type {
  AdministrativeStatus,
  AiDifficulty,
  CompetitionAttempt,
  CompetitionState,
} from '../sport/competition'
import type { CompetitionJumpResult } from '../sport/jumpResult'

export const DB_NAME = 'retro-ski-jumping'
export const DB_VERSION = 2
export const SESSION_SCHEMA_VERSION = 2
export const REPLAY_SCHEMA_VERSION = 1
export const REPLAY_FORMAT_VERSION = 'pkg006-replay-1'

export const STORE = {
  sessions: 'sessions',
  results: 'results',
  records: 'records',
  replays: 'replays',
  leases: 'leases',
  settings: 'settings',
} as const

export type StoreName = (typeof STORE)[keyof typeof STORE]
export const ALL_STORES: readonly StoreName[] = Object.values(STORE)

/**
 * Budżet startowy z TECHNICAL_DESIGN §7 (TUNE). Automatycznie trzymamy wyłącznie
 * ostatni skok; biblioteka ręcznych zapisów należy do późniejszych zadań.
 */
export const REPLAY_LIMITS = {
  automaticKeep: 1,
  manualKeep: 100,
} as const

export type ContentVersions = {
  readonly rules: string
  readonly physics: string
  readonly hill: string
}

export type SessionStats = {
  readonly committedAttempts: number
  readonly humanAttempts: number
  readonly bestHumanDistanceHalfMeters: number
  readonly bestHumanTotalTenths: number
}

export const EMPTY_SESSION_STATS: SessionStats = {
  committedAttempts: 0,
  humanAttempts: 0,
  bestHumanDistanceHalfMeters: 0,
  bestHumanTotalTenths: 0,
}

export type StoredSession = {
  readonly schemaVersion: number
  readonly id: string
  /** Jawny identyfikator skoczni (P21-H01); wersja skoczni jest w `versions.hill`. */
  readonly hillId: string
  readonly revision: number
  readonly savedAtMs: number
  readonly competition: CompetitionState
  readonly profiles: readonly PlayerProfile[]
  readonly setup: {
    readonly profileCount: number
    readonly difficulty: AiDifficulty
  }
  readonly seeds: {
    readonly ai: number
    readonly wind: number
  }
  readonly versions: ContentVersions
  readonly stats: SessionStats
}

export type StoredResult = {
  readonly resultId: string
  readonly sessionId: string
  readonly savedAtMs: number
  readonly result: CompetitionJumpResult
}

export type StoredRecord = {
  readonly key: string
  readonly distanceHalfMeters: number
  readonly totalTenths: number
  readonly participantId: string
  readonly resultId: string
  readonly establishedAtMs: number
  readonly versions: ContentVersions
}

export type ReplaySample = {
  readonly tick: number
  readonly x: number
  readonly y: number
  readonly pitchRad: number
  readonly phase: string
  readonly speedKmh: number
  readonly windUserMetersPerSecond: number
  readonly heightAboveSurface: number
}

export type ReplayInput = {
  readonly tick: number
  readonly sequence: number
  readonly action: string
  readonly edge: 'pressed' | 'released'
}

export type ReplayDiscreteEvent = {
  readonly tick: number
  readonly type: string
  readonly detail: string
}

export type StoredReplay = {
  readonly schemaVersion: number
  readonly id: string
  readonly sessionId: string
  readonly kind: 'auto'
  readonly createdAtMs: number
  readonly formatVersion: string
  readonly versions: ContentVersions
  readonly sampleHz: number
  readonly initialState: {
    readonly competitionId: string
    readonly roundId: CompetitionJumpResult['roundId']
    readonly participantId: string
    readonly participantName: string
    readonly gateNumber: number
    readonly juryGateNumber: number
    readonly coachRequested: boolean
    readonly windSeed: number | null
    readonly windVersion: string | null
    readonly hillId: string
  }
  readonly inputs: readonly ReplayInput[]
  readonly samples: readonly ReplaySample[]
  readonly discreteEvents: readonly ReplayDiscreteEvent[]
  readonly recordedResult: CompetitionJumpResult
}

export type SessionLeaseRecord = {
  readonly sessionId: string
  readonly ownerId: string
  readonly acquiredAtMs: number
  readonly expiresAtMs: number
}

// --- Polityka rekordu konkursowego (GAMEPLAY_SPEC §9) ------------------------

export type RecordCandidate = {
  readonly context: 'training' | 'competition'
  readonly status: 'landed' | 'fall'
  readonly administrativeStatus?: AdministrativeStatus | null
  readonly distanceHalfMeters: number
  readonly versions: ContentVersions
}

/** Klucz porównywalności: inna wersja zasad/fizyki/skoczni to inna kategoria. */
export function recordKey(versions: ContentVersions): string {
  return `${versions.rules}|${versions.physics}|${versions.hill}`
}

/**
 * Oficjalny rekord ustanawia wyłącznie ukończony, ustany skok konkursowy.
 * Trening, upadek i każdy status administracyjny (w tym DSQ) są odrzucane.
 */
export function isOfficialRecordCandidate(candidate: RecordCandidate): boolean {
  if (candidate.context !== 'competition') return false
  if (candidate.status !== 'landed') return false
  if (candidate.administrativeStatus) return false
  return Number.isInteger(candidate.distanceHalfMeters) && candidate.distanceHalfMeters > 0
}

/** Przy identycznej długości rekord nie nadpisuje wcześniejszej daty. */
export function improvesRecord(previous: StoredRecord | undefined, distanceHalfMeters: number): boolean {
  return previous === undefined || distanceHalfMeters > previous.distanceHalfMeters
}

// --- Walidacja przyjmowanego zapisu -----------------------------------------

export type ValidationResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly reason: string }

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

function versionsOf(value: unknown): ContentVersions | null {
  if (!isPlainObject(value)) return null
  if (!isNonEmptyString(value.rules) || !isNonEmptyString(value.physics) || !isNonEmptyString(value.hill)) return null
  return { rules: value.rules, physics: value.physics, hill: value.hill }
}

function validateAttempt(raw: unknown, participantId: string): string | null {
  if (!isPlainObject(raw)) return `próba ${participantId} nie jest obiektem`
  if (raw.participantId !== participantId) return `próba ${participantId} wskazuje inny slot`
  if (!isNonEmptyString(raw.resultId)) return `próba ${participantId} bez resultId`
  if (raw.kind === 'administrative') {
    return isNonEmptyString(raw.status) && isNonEmptyString(raw.reason)
      ? null
      : `status administracyjny ${participantId} jest niepełny`
  }
  if (raw.kind !== 'score') return `nieznany rodzaj próby ${participantId}`
  if (raw.status !== 'landed' && raw.status !== 'fall') return `nieznany status skoku ${participantId}`
  for (const field of ['distanceHalfMeters', 'totalTenths', 'meterValueTenths'] as const) {
    if (!Number.isInteger(raw[field])) return `pole ${field} próby ${participantId} nie jest liczbą całkowitą`
  }
  if (!isPlainObject(raw.componentTenths)) return `brak składowych punktowych ${participantId}`
  for (const value of Object.values(raw.componentTenths)) {
    if (!Number.isInteger(value)) return `składowa punktowa ${participantId} nie jest liczbą całkowitą`
  }
  return null
}

function validateCompetition(raw: unknown): string | null {
  if (!isPlainObject(raw)) return 'stan konkursu nie jest obiektem'
  if (!isNonEmptyString(raw.id)) return 'konkurs bez identyfikatora'
  if (raw.status !== 'active' && raw.status !== 'complete' && raw.status !== 'cancelled') {
    return 'nieznany status konkursu'
  }
  if (!Array.isArray(raw.entrants) || raw.entrants.length === 0) return 'brak listy uczestników'
  if (!Array.isArray(raw.rounds) || raw.rounds.length === 0) return 'brak serii konkursu'
  if (!Number.isInteger(raw.currentRoundIndex) || !Number.isInteger(raw.nextStartIndex)) {
    return 'indeksy postępu nie są liczbami całkowitymi'
  }
  if (!Number.isInteger(raw.juryGateNumber) || (raw.juryGateNumber as number) < 1) return 'nieprawidłowa belka jury'
  if (!isFiniteNumber(raw.seed)) return 'seed konkursu nie jest liczbą'
  if (!isPlainObject(raw.versions) || !isNonEmptyString(raw.versions.rules) || !isNonEmptyString(raw.versions.hill)) {
    return 'brak wersji konkursu'
  }

  const entrantIds = new Set<string>()
  for (const entrant of raw.entrants) {
    if (!isPlainObject(entrant) || !isNonEmptyString(entrant.id) || !isNonEmptyString(entrant.name)) {
      return 'uczestnik bez identyfikatora lub nazwy'
    }
    if (entrantIds.has(entrant.id)) return `duplikat uczestnika ${entrant.id}`
    if (!Number.isInteger(entrant.startNumber)) return `numer startowy ${entrant.id} nie jest liczbą całkowitą`
    entrantIds.add(entrant.id)
  }

  const resultIds = new Set<string>()
  for (const round of raw.rounds) {
    if (!isPlainObject(round)) return 'seria nie jest obiektem'
    if (!Array.isArray(round.startOrder)) return 'seria bez listy startowej'
    if (!isPlainObject(round.attempts)) return 'seria bez tabeli prób'
    const slots = new Set<string>()
    for (const participantId of round.startOrder) {
      if (typeof participantId !== 'string' || !entrantIds.has(participantId)) {
        return `lista startowa wskazuje nieznanego uczestnika ${String(participantId)}`
      }
      if (slots.has(participantId)) return `duplikat slotu ${participantId}`
      slots.add(participantId)
    }
    for (const [participantId, attempt] of Object.entries(round.attempts)) {
      if (!entrantIds.has(participantId)) return `próba wskazuje nieznanego uczestnika ${participantId}`
      const problem = validateAttempt(attempt, participantId)
      if (problem) return problem
      const resultId = (attempt as CompetitionAttempt).resultId
      if (resultIds.has(resultId)) return `duplikat resultId ${resultId}`
      resultIds.add(resultId)
    }
  }

  const currentRound = (raw.rounds as unknown[])[raw.currentRoundIndex as number]
  if (!isPlainObject(currentRound)) return 'aktywna seria nie istnieje'
  const order = currentRound.startOrder as unknown[]
  if ((raw.nextStartIndex as number) < 0 || (raw.nextStartIndex as number) > order.length) {
    return 'indeks startowy poza listą'
  }
  return null
}

function validateProfiles(raw: unknown): string | null {
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > 10) return 'lista profili poza zakresem 1–10'
  const ids = new Set<string>()
  for (const profile of raw) {
    if (!isPlainObject(profile) || !isNonEmptyString(profile.id) || !isNonEmptyString(profile.name)) {
      return 'profil bez identyfikatora lub nazwy'
    }
    if (ids.has(profile.id)) return `duplikat profilu ${profile.id}`
    ids.add(profile.id)
    if (!isPlainObject(profile.bindings)) return `profil ${profile.id} bez bindów`
  }
  return null
}

/** Odrzucamy uszkodzony lub nieznany format; nie kasujemy przy tym danych. */
export function validateStoredSession(raw: unknown): ValidationResult<StoredSession> {
  if (!isPlainObject(raw)) return { ok: false, reason: 'zapis sesji nie jest obiektem' }
  if (raw.schemaVersion !== SESSION_SCHEMA_VERSION) {
    return { ok: false, reason: `nieznana wersja formatu: ${String(raw.schemaVersion)}` }
  }
  if (!isNonEmptyString(raw.id)) return { ok: false, reason: 'zapis bez identyfikatora sesji' }
  if (!isNonEmptyString(raw.hillId)) return { ok: false, reason: 'zapis bez identyfikatora skoczni' }
  if (!Number.isInteger(raw.revision) || (raw.revision as number) < 0) {
    return { ok: false, reason: 'numer rewizji nie jest liczbą całkowitą' }
  }
  if (!isFiniteNumber(raw.savedAtMs)) return { ok: false, reason: 'znacznik czasu zapisu nie jest liczbą' }

  const versions = versionsOf(raw.versions)
  if (!versions) return { ok: false, reason: 'zapis bez kompletu wersji' }

  const competitionProblem = validateCompetition(raw.competition)
  if (competitionProblem) return { ok: false, reason: competitionProblem }

  const profileProblem = validateProfiles(raw.profiles)
  if (profileProblem) return { ok: false, reason: profileProblem }

  if (!isPlainObject(raw.setup) || !Number.isInteger(raw.setup.profileCount)) {
    return { ok: false, reason: 'zapis bez konfiguracji konkursu' }
  }
  if (!['easy', 'normal', 'hard'].includes(String(raw.setup.difficulty))) {
    return { ok: false, reason: 'nieznana trudność AI' }
  }
  if (!isPlainObject(raw.seeds) || !isFiniteNumber(raw.seeds.ai) || !isFiniteNumber(raw.seeds.wind)) {
    return { ok: false, reason: 'zapis bez seedów' }
  }
  if (!isPlainObject(raw.stats)) return { ok: false, reason: 'zapis bez statystyk' }
  for (const field of ['committedAttempts', 'humanAttempts', 'bestHumanDistanceHalfMeters', 'bestHumanTotalTenths'] as const) {
    if (!Number.isInteger(raw.stats[field])) return { ok: false, reason: `statystyka ${field} nie jest liczbą całkowitą` }
  }

  return { ok: true, value: raw as unknown as StoredSession }
}

export function validateStoredReplay(raw: unknown): ValidationResult<StoredReplay> {
  if (!isPlainObject(raw)) return { ok: false, reason: 'replay nie jest obiektem' }
  if (raw.schemaVersion !== REPLAY_SCHEMA_VERSION) {
    return { ok: false, reason: `nieznana wersja replaya: ${String(raw.schemaVersion)}` }
  }
  if (!isNonEmptyString(raw.id)) return { ok: false, reason: 'replay bez identyfikatora' }
  if (!versionsOf(raw.versions)) return { ok: false, reason: 'replay bez kompletu wersji' }
  if (!Array.isArray(raw.samples) || raw.samples.length === 0) return { ok: false, reason: 'replay bez próbek' }
  if (!Array.isArray(raw.inputs) || !Array.isArray(raw.discreteEvents)) {
    return { ok: false, reason: 'replay bez akcji lub zdarzeń' }
  }
  let previousTick = -1
  for (const sample of raw.samples) {
    if (!isPlainObject(sample)) return { ok: false, reason: 'próbka replaya nie jest obiektem' }
    if (!Number.isInteger(sample.tick) || (sample.tick as number) <= previousTick) {
      return { ok: false, reason: 'próbki replaya nie są rosnące' }
    }
    previousTick = sample.tick as number
    for (const field of ['x', 'y', 'pitchRad', 'speedKmh', 'windUserMetersPerSecond', 'heightAboveSurface'] as const) {
      if (!isFiniteNumber(sample[field])) return { ok: false, reason: `pole ${field} próbki nie jest liczbą` }
    }
    if (!isNonEmptyString(sample.phase)) return { ok: false, reason: 'próbka bez fazy' }
  }
  if (!isPlainObject(raw.recordedResult) || !isNonEmptyString(raw.recordedResult.resultId)) {
    return { ok: false, reason: 'replay bez zapisanego wyniku' }
  }
  return { ok: true, value: raw as unknown as StoredReplay }
}

/** Przybliżony rozmiar zapisu; służy wyłącznie informacji o użyciu budżetu. */
export function approximateBytes(value: unknown): number {
  try {
    return JSON.stringify(value)?.length ?? 0
  } catch {
    return 0
  }
}
