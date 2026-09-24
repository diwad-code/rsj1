/**
 * PKG-006 / P19 — mały moduł IndexedDB z jedną jawną transakcją wyniku.
 *
 * Nie jest ogólnym repozytorium ani ORM: zna dokładnie magazyny potrzebne
 * obecnemu produktowi i wykonuje jedną operację zatwierdzenia skoku.
 * Każda obietnica rozwiązuje się w mikrozadaniu zdarzenia `success`, więc
 * transakcja pozostaje aktywna przez cały ciąg zapisów.
 */

import {
  ALL_STORES,
  DB_NAME,
  DB_VERSION,
  REPLAY_LIMITS,
  STORE,
  improvesRecord,
  isOfficialRecordCandidate,
  recordKey,
  validateStoredReplay,
  validateStoredSession,
  type RecordCandidate,
  type SessionLeaseRecord,
  type StoredRecord,
  type StoredReplay,
  type StoredResult,
  type StoredSession,
} from './schema'
import type { CompetitionJumpResult } from '../sport/jumpResult'
import { normalizeSettings, type GameSettings } from '../settings/settings'

export const LEASE_TTL_MS = 20_000

function request<T>(source: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    source.onsuccess = () => resolve(source.result)
    source.onerror = () => reject(source.error ?? new Error('Nieznany błąd IndexedDB.'))
  })
}

export function openGameDatabase(factory: IDBFactory = indexedDB): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const open = factory.open(DB_NAME, DB_VERSION)
    open.onupgradeneeded = () => {
      const db = open.result
      // v1 stores remain untouched on upgrade; v2 adds only global settings.
      if (!db.objectStoreNames.contains(STORE.sessions)) db.createObjectStore(STORE.sessions, { keyPath: 'id' })
      if (!db.objectStoreNames.contains(STORE.results)) db.createObjectStore(STORE.results, { keyPath: 'resultId' })
      if (!db.objectStoreNames.contains(STORE.records)) db.createObjectStore(STORE.records, { keyPath: 'key' })
      if (!db.objectStoreNames.contains(STORE.replays)) db.createObjectStore(STORE.replays, { keyPath: 'id' })
      if (!db.objectStoreNames.contains(STORE.leases)) db.createObjectStore(STORE.leases, { keyPath: 'sessionId' })
      if (!db.objectStoreNames.contains(STORE.settings)) db.createObjectStore(STORE.settings, { keyPath: 'key' })
    }
    open.onsuccess = () => resolve(open.result)
    open.onerror = () => reject(open.error ?? new Error('Nie udało się otworzyć bazy.'))
    open.onblocked = () => reject(new Error('Baza jest zablokowana przez inną kartę.'))
  })
}

/** Missing or corrupt settings do not modify the database or any other store. */
export async function loadGameSettings(db: IDBDatabase): Promise<GameSettings> {
  const transaction = db.transaction([STORE.settings], 'readonly')
  const row = (await request(transaction.objectStore(STORE.settings).get('global'))) as unknown
  if (typeof row !== 'object' || row === null || !('value' in row)) return normalizeSettings(undefined)
  return normalizeSettings(row.value)
}

/** Resolve only after commit, so the UI can surface a failed settings write. */
export function saveGameSettings(db: IDBDatabase, settings: GameSettings): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([STORE.settings], 'readwrite')
    transaction.oncomplete = () => resolve()
    transaction.onabort = () => reject(transaction.error ?? new Error('Nie zapisano ustawień.'))
    transaction.onerror = () => reject(transaction.error ?? new Error('Nie zapisano ustawień.'))
    transaction.objectStore(STORE.settings).put({ key: 'global', value: normalizeSettings(settings) })
  })
}

export type CommitInput = {
  readonly session: StoredSession
  readonly result: CompetitionJumpResult | null
  readonly recordCandidate: RecordCandidate | null
  readonly replay: StoredReplay | null
  readonly ownerId: string
  readonly nowMs: number
  readonly leaseTtlMs?: number
}

/** Punkt wstrzyknięcia awarii; produkcja go nie używa, testy sprawdzają atomowość. */
export type CommitHooks = {
  readonly afterResultWrite?: () => void
}

export type CommitOutcome =
  | {
      readonly ok: true
      /** `false` oznacza idempotentne powtórzenie tego samego `resultId`. */
      readonly applied: boolean
      readonly revision: number
      readonly recordUpdated: boolean
    }
  | {
      readonly ok: false
      readonly error: 'lease-denied' | 'write-failed'
      readonly reason: string
    }

/**
 * Jedna transakcja: lease, wynik, sesja, statystyki, ewentualny rekord i replay.
 * Wszystko albo nic — przerwanie w środku nie zostawia połowy zapisu.
 */
export async function commitAttempt(
  db: IDBDatabase,
  input: CommitInput,
  hooks: CommitHooks = {},
): Promise<CommitOutcome> {
  const ttlMs = input.leaseTtlMs ?? LEASE_TTL_MS
  let applied = false
  let recordUpdated = false
  let leaseDeniedBy: string | null = null
  let failure: unknown = null

  try {
    const transaction = db.transaction(ALL_STORES as string[], 'readwrite')
    const settled = new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onabort = () => reject(transaction.error ?? new Error('Transakcja przerwana.'))
      transaction.onerror = () => reject(transaction.error ?? new Error('Błąd transakcji.'))
    })

    const work = (async () => {
      const leases = transaction.objectStore(STORE.leases)
      const existingLease = (await request(leases.get(input.session.id))) as SessionLeaseRecord | undefined
      if (existingLease && existingLease.ownerId !== input.ownerId && existingLease.expiresAtMs > input.nowMs) {
        leaseDeniedBy = existingLease.ownerId
        transaction.abort()
        return
      }
      leases.put({
        sessionId: input.session.id,
        ownerId: input.ownerId,
        acquiredAtMs: existingLease?.ownerId === input.ownerId ? existingLease.acquiredAtMs : input.nowMs,
        expiresAtMs: input.nowMs + ttlMs,
      } satisfies SessionLeaseRecord)

      const sessions = transaction.objectStore(STORE.sessions)
      const results = transaction.objectStore(STORE.results)
      const stored = (await request(sessions.get(input.session.id))) as StoredSession | undefined
      // Ponowienie starszej transakcji uzupełnia brakujący wynik, ale nigdy
      // nie cofa postępu sesji zapisanego przez nowszą rewizję.
      const sessionIsCurrent = !stored || stored.revision <= input.session.revision

      if (input.result) {
        const duplicate = (await request(results.get(input.result.resultId))) as StoredResult | undefined
        if (duplicate) {
          // Powtórzenie tej samej operacji: wynik, rekord i statystyka pozostają jedne.
          if (sessionIsCurrent) sessions.put(input.session)
          return
        }
        results.put({
          resultId: input.result.resultId,
          sessionId: input.session.id,
          savedAtMs: input.nowMs,
          result: input.result,
        } satisfies StoredResult)
        hooks.afterResultWrite?.()

        if (input.recordCandidate && isOfficialRecordCandidate(input.recordCandidate)) {
          const records = transaction.objectStore(STORE.records)
          const key = recordKey(input.recordCandidate.versions)
          const previous = (await request(records.get(key))) as StoredRecord | undefined
          if (improvesRecord(previous, input.recordCandidate.distanceHalfMeters)) {
            records.put({
              key,
              distanceHalfMeters: input.recordCandidate.distanceHalfMeters,
              totalTenths: input.result.totalTenths,
              participantId: input.result.participantId,
              resultId: input.result.resultId,
              establishedAtMs: input.nowMs,
              versions: input.recordCandidate.versions,
            } satisfies StoredRecord)
            recordUpdated = true
          }
        }

        const replay = input.replay
        if (replay) {
          const replays = transaction.objectStore(STORE.replays)
          replays.put(replay)
          const all = (await request(replays.getAll())) as StoredReplay[]
          const automatic = all
            .filter((entry) => entry.kind === 'auto' && entry.id !== replay.id)
            .sort((left, right) => right.createdAtMs - left.createdAtMs)
          for (const stale of automatic.slice(REPLAY_LIMITS.automaticKeep - 1)) replays.delete(stale.id)
        }
        applied = true
      }

      if (sessionIsCurrent) sessions.put(input.session)
    })().catch((cause: unknown) => {
      // Każda awaria w środku przerywa całość; połowa transakcji nigdy nie trafia na dysk.
      failure = cause
      try {
        transaction.abort()
      } catch {
        /* transakcja już zamknięta */
      }
    })

    await work
    await settled.catch((cause: unknown) => {
      failure ??= cause
    })
    if (leaseDeniedBy) {
      return { ok: false, error: 'lease-denied', reason: `sesję zapisuje karta ${leaseDeniedBy}` }
    }
    if (failure) return { ok: false, error: 'write-failed', reason: describe(failure) }
    return { ok: true, applied, revision: input.session.revision, recordUpdated }
  } catch (cause) {
    if (leaseDeniedBy) {
      return { ok: false, error: 'lease-denied', reason: `sesję zapisuje karta ${leaseDeniedBy}` }
    }
    return { ok: false, error: 'write-failed', reason: describe(cause) }
  }
}

function describe(cause: unknown): string {
  if (cause instanceof DOMException) return `${cause.name}: ${cause.message}`
  if (cause instanceof Error) return cause.message
  return String(cause)
}

export type LoadedSession =
  | { readonly kind: 'none' }
  | { readonly kind: 'ok'; readonly session: StoredSession }
  | { readonly kind: 'rejected'; readonly reason: string }

/** Uszkodzony lub nieznany format jest odrzucony; poprawne dane pozostają na dysku. */
export async function loadSession(db: IDBDatabase, sessionId: string): Promise<LoadedSession> {
  const transaction = db.transaction([STORE.sessions], 'readonly')
  const raw = await request(transaction.objectStore(STORE.sessions).get(sessionId))
  if (raw === undefined) return { kind: 'none' }
  const validated = validateStoredSession(raw)
  return validated.ok ? { kind: 'ok', session: validated.value } : { kind: 'rejected', reason: validated.reason }
}

export async function loadLatestReplay(db: IDBDatabase): Promise<
  { readonly kind: 'none' } | { readonly kind: 'ok'; readonly replay: StoredReplay } | { readonly kind: 'rejected'; readonly reason: string }
> {
  const transaction = db.transaction([STORE.replays], 'readonly')
  const all = (await request(transaction.objectStore(STORE.replays).getAll())) as unknown[]
  if (all.length === 0) return { kind: 'none' }
  const ordered = [...all].sort(
    (left, right) => Number((right as StoredReplay).createdAtMs ?? 0) - Number((left as StoredReplay).createdAtMs ?? 0),
  )
  let lastReason = 'brak poprawnego replaya'
  for (const candidate of ordered) {
    const validated = validateStoredReplay(candidate)
    if (validated.ok) return { kind: 'ok', replay: validated.value }
    lastReason = validated.reason
  }
  return { kind: 'rejected', reason: lastReason }
}

export async function loadOfficialRecord(db: IDBDatabase, key: string): Promise<StoredRecord | undefined> {
  const transaction = db.transaction([STORE.records], 'readonly')
  return (await request(transaction.objectStore(STORE.records).get(key))) as StoredRecord | undefined
}

export async function countStore(db: IDBDatabase, store: string): Promise<number> {
  const transaction = db.transaction([store], 'readonly')
  return request(transaction.objectStore(store).count())
}
