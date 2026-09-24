import { IDBFactory } from 'fake-indexeddb'
import { beforeEach, describe, expect, it } from 'vitest'
import { CompetitionSession } from '../src/app/competitionSession'
import { buildHill } from '../src/simulation/technicalHill'
import { createCompetitionJumpResult, type CompetitionJumpResult } from '../src/sport/jumpResult'
import {
  commitAttempt,
  countStore,
  loadOfficialRecord,
  loadGameSettings,
  loadSession,
  openGameDatabase,
  saveGameSettings,
  type CommitInput,
} from '../src/storage/db'
import { SessionLease } from '../src/storage/lease'
import {
  isOfficialRecordCandidate,
  DB_NAME,
  DB_VERSION,
  recordKey,
  STORE,
  validateStoredSession,
  type RecordCandidate,
  type StoredSession,
} from '../src/storage/schema'
import { DEFAULT_SETTINGS } from '../src/settings/settings'
import { runJump } from './support/jumpHarness'

const hill = buildHill()

function newSession(): CompetitionSession {
  return new CompetitionSession(hill, 1, 'normal')
}

function jumpResult(participantId: string, tag: string, sessionRevision = 1): CompetitionJumpResult {
  const sim = runJump({ pilot: 'ideal', style: 'telemark' })
  const result = createCompetitionJumpResult(sim, {
    competitionId: 'standard-tech-k120-1',
    roundId: 'qualification',
    participantId,
    juryGateNumber: 8,
    coachRequested: false,
    coachDecisionPhase: 'red',
    sessionRevision,
  })
  return { ...result, resultId: `${result.resultId}-${tag}` }
}

function commitInput(
  session: StoredSession,
  result: CompetitionJumpResult | null,
  overrides: Partial<CommitInput> = {},
): CommitInput {
  const recordCandidate: RecordCandidate | null = result
    ? {
        context: 'competition',
        status: result.status,
        administrativeStatus: null,
        distanceHalfMeters: result.distanceHalfMeters,
        versions: result.versions,
      }
    : null
  return {
    session,
    result,
    recordCandidate,
    replay: null,
    ownerId: 'tab-a',
    nowMs: 1_000,
    ...overrides,
  }
}

function putRaw(db: IDBDatabase, store: string, value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([store], 'readwrite')
    transaction.objectStore(store).put(value)
    transaction.oncomplete = () => resolve()
    transaction.onabort = () => reject(transaction.error ?? new Error('abort'))
  })
}

let db: IDBDatabase

beforeEach(async () => {
  db = await openGameDatabase(new IDBFactory())
})

describe('P22 — settings i migracja IndexedDB v1→v2', () => {
  it('dodaje tylko settings, zachowując wszystkie magazyny i dane starej bazy', async () => {
    const factory = new IDBFactory()
    const legacy = await new Promise<IDBDatabase>((resolve, reject) => {
      const open = factory.open(DB_NAME, 1)
      open.onupgradeneeded = () => {
        const old = open.result
        old.createObjectStore(STORE.sessions, { keyPath: 'id' })
        old.createObjectStore(STORE.results, { keyPath: 'resultId' })
        old.createObjectStore(STORE.records, { keyPath: 'key' })
        old.createObjectStore(STORE.replays, { keyPath: 'id' })
        old.createObjectStore(STORE.leases, { keyPath: 'sessionId' })
      }
      open.onsuccess = () => resolve(open.result)
      open.onerror = () => reject(open.error)
    })
    await putRaw(legacy, STORE.sessions, { id: 'old-session', marker: 'preserved' })
    await putRaw(legacy, STORE.replays, { id: 'old-replay', marker: 'preserved' })
    await putRaw(legacy, STORE.results, { resultId: 'old-result', marker: 'preserved' })
    await putRaw(legacy, STORE.records, { key: 'old-record', marker: 'preserved' })
    await putRaw(legacy, STORE.leases, { sessionId: 'old-lease', marker: 'preserved' })
    legacy.close()

    const upgraded = await openGameDatabase(factory)
    expect(DB_VERSION).toBe(2)
    expect(upgraded.version).toBe(2)
    expect([...upgraded.objectStoreNames]).toEqual([
      STORE.leases, STORE.records, STORE.replays, STORE.results, STORE.sessions, STORE.settings,
    ])
    for (const [store, key] of [
      [STORE.sessions, 'old-session'], [STORE.replays, 'old-replay'],
      [STORE.results, 'old-result'], [STORE.records, 'old-record'], [STORE.leases, 'old-lease'],
    ] as const) {
      const entry = await new Promise<unknown>((resolve, reject) => {
        const get = upgraded.transaction(store, 'readonly').objectStore(store).get(key)
        get.onsuccess = () => resolve(get.result)
        get.onerror = () => reject(get.error)
      })
      expect(entry).toMatchObject({ marker: 'preserved' })
    }
    expect(await loadGameSettings(upgraded)).toEqual(DEFAULT_SETTINGS)
    upgraded.close()
  })

  it('zapisuje globalne ustawienia po commicie i odczytuje je po ponownym otwarciu', async () => {
    const factory = new IDBFactory()
    const first = await openGameDatabase(factory)
    const custom = { ...DEFAULT_SETTINGS, bindings: { ...DEFAULT_SETTINGS.bindings, takeoff: 'KeyW' }, volume: 47 }
    await saveGameSettings(first, custom)
    first.close()
    const reopened = await openGameDatabase(factory)
    expect(await countStore(reopened, STORE.settings)).toBe(1)
    expect(await loadGameSettings(reopened)).toEqual(custom)
    reopened.close()
  })

  it('uszkodzony lub nieznany format w magazynie ma bezpieczne domyślne wartości', async () => {
    for (const raw of [
      { key: 'global', value: { ...DEFAULT_SETTINGS, version: 9 } },
      { key: 'global', value: { ...DEFAULT_SETTINGS, bindings: { ...DEFAULT_SETTINGS.bindings, right: 'ArrowUp' } } },
      { key: 'global', value: null },
    ]) {
      await putRaw(db, STORE.settings, raw)
      expect(await loadGameSettings(db)).toEqual(DEFAULT_SETTINGS)
    }
    expect(await countStore(db, STORE.settings)).toBe(1)
  })
})

describe('P19 — transakcja zatwierdzenia skoku', () => {
  it('ten sam resultId zapisany dwa razy daje jeden wynik, jeden rekord i jedną statystykę', async () => {
    const session = newSession()
    const result = jumpResult(session.state.entrants[0]?.id ?? 'x', 'dup')
    const snapshot: StoredSession = { ...session.toStoredSession(1_000), revision: 1 }

    const first = await commitAttempt(db, commitInput(snapshot, result))
    const second = await commitAttempt(db, commitInput(snapshot, result))

    expect(first).toMatchObject({ ok: true, applied: true, recordUpdated: true })
    expect(second).toMatchObject({ ok: true, applied: false, recordUpdated: false })
    expect(await countStore(db, STORE.results)).toBe(1)
    expect(await countStore(db, STORE.records)).toBe(1)
    expect(await countStore(db, STORE.sessions)).toBe(1)

    const record = await loadOfficialRecord(db, recordKey(result.versions))
    expect(record?.resultId).toBe(result.resultId)
    expect(record?.distanceHalfMeters).toBe(result.distanceHalfMeters)
  })

  it('awaria pomiędzy zapisem wyniku i sesji nie pozostawia połowy transakcji', async () => {
    const session = newSession()
    const good = jumpResult(session.state.entrants[0]?.id ?? 'x', 'ok')
    await commitAttempt(db, commitInput({ ...session.toStoredSession(1_000), revision: 1 }, good))

    const broken = jumpResult(session.state.entrants[1]?.id ?? 'y', 'broken')
    const outcome = await commitAttempt(
      db,
      commitInput({ ...session.toStoredSession(2_000), revision: 2 }, broken),
      {
        afterResultWrite: () => {
          throw new Error('symulowana awaria po zapisie wyniku')
        },
      },
    )

    expect(outcome).toMatchObject({ ok: false, error: 'write-failed' })
    expect(await countStore(db, STORE.results)).toBe(1)
    const stored = await loadSession(db, session.state.id)
    expect(stored.kind).toBe('ok')
    expect(stored.kind === 'ok' && stored.session.revision).toBe(1)
  })

  it('odmowa zapisu zachowuje poprzednią bazę i działający stan RAM', async () => {
    const session = newSession()
    const good = jumpResult(session.state.entrants[0]?.id ?? 'x', 'ok')
    await commitAttempt(db, commitInput({ ...session.toStoredSession(1_000), revision: 1 }, good))

    // Wartość niemożliwa do sklonowania odwzorowuje odmowę zapisu (Quota/DataClone).
    const poisoned = {
      ...session.toStoredSession(2_000),
      revision: 2,
      stats: { ...session.stats, reject: () => undefined },
    } as unknown as StoredSession
    const outcome = await commitAttempt(db, commitInput(poisoned, jumpResult(session.state.entrants[1]?.id ?? 'y', 'q')))

    expect(outcome.ok).toBe(false)
    expect(await countStore(db, STORE.results)).toBe(1)
    const stored = await loadSession(db, session.state.id)
    expect(stored.kind === 'ok' && stored.session.revision).toBe(1)
    // Stan RAM pozostaje sprawny mimo odmowy zapisu.
    expect(session.state.status).toBe('active')
    expect(session.toStoredSession(3_000).competition.entrants).toHaveLength(75)
  })

  it('uszkodzony i nieznany format jest odrzucony bez wyczyszczenia poprawnych danych', async () => {
    const session = newSession()
    await commitAttempt(db, commitInput({ ...session.toStoredSession(1_000), revision: 1 }, null))
    expect((await loadSession(db, session.state.id)).kind).toBe('ok')

    await putRaw(db, STORE.sessions, { id: session.state.id, schemaVersion: 99, revision: 1 })
    const unknownVersion = await loadSession(db, session.state.id)
    expect(unknownVersion).toMatchObject({ kind: 'rejected' })
    expect(unknownVersion.kind === 'rejected' && unknownVersion.reason).toContain('nieznana wersja formatu')
    expect(await countStore(db, STORE.sessions)).toBe(1)

    await putRaw(db, STORE.sessions, { ...session.toStoredSession(1_000), id: session.state.id, profiles: [] })
    expect(await loadSession(db, session.state.id)).toMatchObject({ kind: 'rejected' })
    expect(await countStore(db, STORE.sessions)).toBe(1)
  })

  it('walidacja odrzuca duplikat resultId, nieznanego uczestnika i NaN', () => {
    const base = newSession().toStoredSession(1_000)
    const roundId = base.competition.rounds[0]?.id ?? 'qualification'
    const [first, second] = base.competition.entrants
    if (!first || !second) throw new Error('fixture wymaga dwóch uczestników')

    const withDuplicate = structuredClone(base) as StoredSession & {
      competition: { rounds: Array<{ attempts: Record<string, unknown> }> }
    }
    const attempt = (participantId: string) => ({
      kind: 'administrative' as const,
      resultId: `${roundId}-shared`,
      participantId,
      status: 'dns' as const,
      reason: 'test',
    })
    withDuplicate.competition.rounds[0]!.attempts[first.id] = attempt(first.id)
    withDuplicate.competition.rounds[0]!.attempts[second.id] = attempt(second.id)
    const duplicateOutcome = validateStoredSession(withDuplicate)
    expect(duplicateOutcome.ok).toBe(false)
    expect(duplicateOutcome.ok === false ? duplicateOutcome.reason : '').toContain('duplikat resultId')

    const unknownEntrant = structuredClone(base) as StoredSession & {
      competition: { rounds: Array<{ startOrder: string[] }> }
    }
    unknownEntrant.competition.rounds[0]!.startOrder[0] = 'nie-ma-takiego'
    expect(validateStoredSession(unknownEntrant)).toMatchObject({ ok: false })

    const withNaN = structuredClone(base) as StoredSession & { competition: { seed: number } }
    withNaN.competition.seed = Number.NaN
    expect(validateStoredSession(withNaN)).toMatchObject({ ok: false })
  })
})

describe('P19 — wznowienie po reloadzie', () => {
  it('reload po wyniku wraca przed następnego właściwego zawodnika, bez podwójnych punktów', async () => {
    const session = newSession()
    const commits: StoredSession[] = []
    session.onCommit = (request) => void commits.push(request.session)
    session.requestCheckpoint(1_000)

    session.acceptHandover(false)
    session.advanceStart()
    session.advanceStart()
    session.startHumanJump()
    for (let guard = 0; guard < 20_000 && session.view === 'jump'; guard += 1) {
      session.stepHumanJump({ pressed: [], released: [], held: new Set(), events: [], horizontal: 0 })
    }

    const afterResult = commits[commits.length - 1]
    if (!afterResult) throw new Error('brak checkpointu po wyniku')
    expect(session.view).toBe('result')
    expect(afterResult.competition.nextStartIndex).toBe(1)

    await commitAttempt(db, commitInput(afterResult, session.lastResult))
    const loaded = await loadSession(db, session.state.id)
    expect(loaded.kind).toBe('ok')
    if (loaded.kind !== 'ok') throw new Error('zapis odrzucony')

    const resumed = new CompetitionSession(hill, 1, 'normal', false, loaded.session)
    expect(resumed.state.nextStartIndex).toBe(1)
    expect(resumed.activeEntrant?.id).toBe(session.state.entrants[1]?.id)
    const before = session.ranking().filter((entry) => entry.totalTenths !== null)
    const after = resumed.ranking().filter((entry) => entry.totalTenths !== null)
    expect(after).toEqual(before)
    expect(after).toHaveLength(1)
  })

  it('reload podczas niezatwierdzonego skoku wraca do checkpointu przed próbą', async () => {
    const session = newSession()
    session.onCommit = (request) => void enqueue(request.session)
    const saved: StoredSession[] = []
    function enqueue(snapshot: StoredSession): void {
      saved.push(snapshot)
    }
    session.requestCheckpoint(1_000)
    const checkpoint = saved[0]
    if (!checkpoint) throw new Error('brak checkpointu startowego')
    await commitAttempt(db, commitInput(checkpoint, null))

    session.acceptHandover(false)
    session.advanceStart()
    session.advanceStart()
    session.startHumanJump()
    for (let guard = 0; guard < 300; guard += 1) {
      session.stepHumanJump({ pressed: [], released: [], held: new Set(), events: [], horizontal: 0 })
    }
    expect(session.view).toBe('jump')

    const loaded = await loadSession(db, session.state.id)
    if (loaded.kind !== 'ok') throw new Error('zapis odrzucony')
    const resumed = new CompetitionSession(hill, 1, 'normal', false, loaded.session)
    expect(resumed.state.nextStartIndex).toBe(0)
    expect(resumed.view).toBe('handover')
    expect(resumed.ranking().every((entry) => entry.totalTenths === null)).toBe(true)
  })
})

describe('P19 — rekord konkursowy według GAMEPLAY_SPEC §9', () => {
  const versions = { rules: 'r', physics: 'p', hill: 'h' }

  it('trening, DSQ i upadek nie ustanawiają oficjalnego rekordu', () => {
    expect(isOfficialRecordCandidate({ context: 'training', status: 'landed', distanceHalfMeters: 280, versions })).toBe(false)
    expect(isOfficialRecordCandidate({ context: 'competition', status: 'fall', distanceHalfMeters: 300, versions })).toBe(false)
    expect(
      isOfficialRecordCandidate({
        context: 'competition',
        status: 'landed',
        administrativeStatus: 'dsq',
        distanceHalfMeters: 300,
        versions,
      }),
    ).toBe(false)
    expect(isOfficialRecordCandidate({ context: 'competition', status: 'landed', distanceHalfMeters: 240, versions })).toBe(true)
  })

  it('klucz rekordu obejmuje wersje fizyki, skoczni i zasad', () => {
    expect(recordKey(versions)).toBe('r|p|h')
    expect(recordKey({ ...versions, physics: 'p2' })).not.toBe(recordKey(versions))
  })

  it('upadek nie aktualizuje rekordu zapisanego w bazie', async () => {
    const session = newSession()
    const landed = jumpResult(session.state.entrants[0]?.id ?? 'x', 'landed')
    await commitAttempt(db, commitInput({ ...session.toStoredSession(1_000), revision: 1 }, landed))
    const before = await loadOfficialRecord(db, recordKey(landed.versions))

    const fall = { ...jumpResult(session.state.entrants[1]?.id ?? 'y', 'fall'), status: 'fall' as const }
    const outcome = await commitAttempt(db, {
      ...commitInput({ ...session.toStoredSession(2_000), revision: 2 }, fall),
      recordCandidate: {
        context: 'competition',
        status: 'fall',
        administrativeStatus: null,
        distanceHalfMeters: fall.distanceHalfMeters + 100,
        versions: fall.versions,
      },
    })

    expect(outcome).toMatchObject({ ok: true, applied: true, recordUpdated: false })
    const after = await loadOfficialRecord(db, recordKey(landed.versions))
    expect(after).toEqual(before)
  })
})

describe('P19 — lease jednej aktywnej karty', () => {
  it('druga karta nie zapisuje równocześnie tej samej sesji', async () => {
    const session = newSession()
    const snapshot = { ...session.toStoredSession(1_000), revision: 1 }
    const owned = await commitAttempt(db, commitInput(snapshot, null, { ownerId: 'tab-a', nowMs: 1_000 }))
    expect(owned.ok).toBe(true)

    const other = await commitAttempt(
      db,
      commitInput({ ...snapshot, revision: 2 }, null, { ownerId: 'tab-b', nowMs: 2_000 }),
    )
    expect(other).toMatchObject({ ok: false, error: 'lease-denied' })
    const stored = await loadSession(db, session.state.id)
    expect(stored.kind === 'ok' && stored.session.revision).toBe(1)
  })

  it('wygaśnięcie lease pozwala na jawne przejęcie, aktywny lease nie', async () => {
    let now = 10_000
    const clock = () => now
    const first = new SessionLease(db, 'standard-tech-k120-1', 'tab-a', { now: clock, ttlMs: 10_000 })
    const second = new SessionLease(db, 'standard-tech-k120-1', 'tab-b', { now: clock, ttlMs: 10_000 })

    expect(await first.acquire()).toMatchObject({ role: 'owner' })
    expect(await second.acquire()).toMatchObject({ role: 'reader', takeoverAvailable: false })

    now = 30_000
    const expired = await second.refresh()
    expect(expired).toMatchObject({ role: 'reader', takeoverAvailable: true })
    expect(await second.acquire()).toMatchObject({ role: 'owner' })
    expect(await first.refresh()).toMatchObject({ role: 'reader', ownerId: 'tab-b' })

    // Po przejęciu to karta B zapisuje sesję.
    const session = newSession()
    const denied = await commitAttempt(
      db,
      commitInput({ ...session.toStoredSession(now), revision: 1 }, null, { ownerId: 'tab-a', nowMs: now }),
    )
    expect(denied).toMatchObject({ ok: false, error: 'lease-denied' })
  })

  it('zwolniony lease pozwala przejąć zapis bez czekania na wygaśnięcie', async () => {
    let now = 10_000
    const clock = () => now
    const first = new SessionLease(db, 'standard-tech-k120-1', 'tab-a', { now: clock, ttlMs: 10_000 })
    const second = new SessionLease(db, 'standard-tech-k120-1', 'tab-b', { now: clock, ttlMs: 10_000 })
    await first.acquire()
    expect(await second.acquire()).toMatchObject({ role: 'reader' })

    await first.release()
    now = 11_000
    expect(await second.acquire()).toMatchObject({ role: 'owner' })
  })
})

describe('P19 — polskie znaki w zapisie', () => {
  it('nazwy profili zapisujemy jako tekst i odczytujemy bez zmian', async () => {
    const session = new CompetitionSession(hill, 3, 'normal')
    await commitAttempt(db, commitInput({ ...session.toStoredSession(1_000), revision: 1 }, null))
    const loaded = await loadSession(db, session.state.id)
    if (loaded.kind !== 'ok') throw new Error('zapis odrzucony')
    expect(loaded.session.profiles.map((profile) => profile.name)).toEqual([
      'Łucja Wicher',
      'Mikołaj Szron',
      'Żaneta Iskra',
    ])
    expect(loaded.session.profiles.every((profile) => typeof profile.name === 'string')).toBe(true)
  })
})

describe('PRE-PKG-008-FIXES zadanie 1 — unikalne wyniki kolejnych konkursów', () => {
  it('ten sam tick przy rosnącej rewizji daje osobne wyniki, retry jest idempotentny', async () => {
    const session = newSession()
    const participantId = session.state.entrants[0]?.id ?? 'x'
    const sim = runJump({ pilot: 'ideal', style: 'telemark' })
    const first = createCompetitionJumpResult(sim, {
      competitionId: 'standard-tech-k120-1',
      roundId: 'qualification',
      participantId,
      juryGateNumber: 8,
      coachRequested: false,
      coachDecisionPhase: 'red',
      sessionRevision: 1,
    })
    const second = createCompetitionJumpResult(sim, {
      competitionId: 'standard-tech-k120-1',
      roundId: 'qualification',
      participantId,
      juryGateNumber: 8,
      coachRequested: false,
      coachDecisionPhase: 'red',
      sessionRevision: 2,
    })
    expect(first.resultId).toContain('-r1-')
    expect(second.resultId).toContain('-r2-')
    expect(first.resultId).not.toBe(second.resultId)

    const firstOutcome = await commitAttempt(
      db,
      commitInput({ ...session.toStoredSession(1_000), revision: 1 }, first),
    )
    const secondOutcome = await commitAttempt(
      db,
      commitInput({ ...session.toStoredSession(2_000), revision: 2 }, second),
    )
    expect(firstOutcome).toMatchObject({ ok: true, applied: true })
    expect(secondOutcome).toMatchObject({ ok: true, applied: true })
    expect(await countStore(db, STORE.results)).toBe(2)

    const retry = await commitAttempt(
      db,
      commitInput({ ...session.toStoredSession(2_000), revision: 2 }, second),
    )
    expect(retry).toMatchObject({ ok: true, applied: false })
    expect(await countStore(db, STORE.results)).toBe(2)
  })
})
