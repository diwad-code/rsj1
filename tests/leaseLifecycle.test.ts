import { IDBFactory } from 'fake-indexeddb'
import { beforeEach, describe, expect, it } from 'vitest'
import { CompetitionSession } from '../src/app/competitionSession'
import { buildHill } from '../src/simulation/technicalHill'
import { commitAttempt, loadSession, openGameDatabase, type CommitInput } from '../src/storage/db'
import { SessionLease } from '../src/storage/lease'
import type { StoredSession } from '../src/storage/schema'

const hill = buildHill()
const SESSION_ID = 'standard-tech-k120-1'

function commitInput(session: StoredSession, ownerId: string, nowMs: number): CommitInput {
  return { session, result: null, recordCandidate: null, replay: null, ownerId, nowMs }
}

let db: IDBDatabase

beforeEach(async () => {
  db = await openGameDatabase(new IDBFactory())
})

describe('PRE-PKG-008-FIXES zadanie 2 — lease po wyjściu do menu', () => {
  it('ta sama karta po Backspace odzyskuje lease i zapisuje start natychmiast, pre-TTL', async () => {
    let now = 10_000
    const clock = () => now
    // Pierwsza sesja jest właścicielem (jak po starcie konkursu z heartbeat).
    const lease = new SessionLease(db, SESSION_ID, 'tab-a', { now: clock, ttlMs: 10_000 })
    expect(await lease.acquire()).toMatchObject({ role: 'owner' })

    const first = new CompetitionSession(hill, 1, 'normal')
    const firstSnapshot = { ...first.toStoredSession(now), revision: 1 }
    expect(await commitAttempt(db, commitInput(firstSnapshot, 'tab-a', now))).toMatchObject({ ok: true })

    // returnToMenu: świadome wyjście zwalnia lease (druga karta przejmie bez TTL).
    await lease.release()
    now = 11_000 // 1 s później — na długo przed wygaśnięciem starego TTL.
    // Lokalnie po release jesteśmy readerem; rekord ma expiresAtMs=0, więc
    // przejęcie jest dostępne natychmiast, bez czekania na TTL.
    expect(lease.status).toMatchObject({ role: 'reader', takeoverAvailable: true })
    const peer = new SessionLease(db, SESSION_ID, 'tab-b', { now: clock, ttlMs: 10_000 })
    expect(await peer.refresh()).toMatchObject({ role: 'reader', takeoverAvailable: true })

    // startCompetition w tej samej karcie: reacquire przed pierwszym checkpointem.
    expect(await lease.acquire()).toMatchObject({ role: 'owner' })
    const second = new CompetitionSession(hill, 1, 'normal')
    const secondSnapshot = { ...second.toStoredSession(now), revision: 1 }
    const outcome = await commitAttempt(db, commitInput(secondSnapshot, 'tab-a', now))
    expect(outcome).toMatchObject({ ok: true })

    const stored = await loadSession(db, SESSION_ID)
    expect(stored.kind).toBe('ok')
    expect(stored.kind === 'ok' && stored.session.revision).toBe(1)
  })

  it('release za kolejką zapisów nie pozwala oczekującemu commitowi odnowić lease po wyjściu', async () => {
    let now = 50_000
    const clock = () => now
    const lease = new SessionLease(db, SESSION_ID, 'tab-a', { now: clock, ttlMs: 10_000 })
    expect(await lease.acquire()).toMatchObject({ role: 'owner' })

    // Kolejka jak w main.ts: enqueueSave łańcuch + release ustawiony ZA zapisami.
    let saveChain: Promise<void> = Promise.resolve()
    const session = new CompetitionSession(hill, 1, 'normal')
    const snapshot = { ...session.toStoredSession(now), revision: 1 }
    saveChain = saveChain
      .then(() => commitAttempt(db, commitInput(snapshot, 'tab-a', now)).then(() => undefined))
      .catch(() => undefined)
    // returnToMenu w poprawce: release dopiero po opróżnieniu kolejki.
    saveChain = saveChain.then(() => lease.release()).catch(() => undefined)
    await saveChain

    // Commit zdążył zapisać sesję, ale końcowy stan lease jest zwolniony —
    // kolejna karta przejmuje bez czekania na TTL, a stara nie jest właścicielem.
    const stored = await loadSession(db, SESSION_ID)
    expect(stored.kind).toBe('ok')
    expect(lease.status.role).toBe('reader')

    const other = new SessionLease(db, SESSION_ID, 'tab-b', { now: clock, ttlMs: 10_000 })
    expect(await other.acquire()).toMatchObject({ role: 'owner' })
    // Stara karta po wyjściu nie zapisuje już równolegle.
    now = 51_000
    const denied = await commitAttempt(db, commitInput({ ...snapshot, revision: 2 }, 'tab-a', now))
    expect(denied).toMatchObject({ ok: false, error: 'lease-denied' })
  })
})
