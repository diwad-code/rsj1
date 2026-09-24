/**
 * PKG-006 / P19 — prosta blokada jednego aktywnego autora sesji.
 *
 * Źródłem prawdy jest rekord lease w bazie; BroadcastChannel tylko przyspiesza
 * reakcję drugiej karty. To nie jest algorytm rozproszony ani zabezpieczenie
 * anty-cheat — chroni lokalną sesję przed zwykłym konfliktem dwóch kart.
 */

import { STORE, type SessionLeaseRecord } from './schema'
import { LEASE_TTL_MS } from './db'

export const LEASE_CHANNEL_NAME = 'retro-ski-jumping-session'
export const LEASE_HEARTBEAT_MS = 7_000

export type LeaseRole = 'owner' | 'reader'

export type LeaseStatus = {
  readonly role: LeaseRole
  readonly ownerId: string | null
  readonly expiresAtMs: number
  /** Jawne przejęcie jest możliwe dopiero po wygaśnięciu lub zwolnieniu lease. */
  readonly takeoverAvailable: boolean
}

type LeaseMessage = {
  readonly sessionId: string
  readonly ownerId: string
  readonly type: 'claimed' | 'released'
}

export function createOwnerId(): string {
  const cryptoApi = globalThis.crypto
  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') return cryptoApi.randomUUID().slice(0, 8)
  return Math.random().toString(36).slice(2, 10)
}

function put(db: IDBDatabase, record: SessionLeaseRecord): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE.leases], 'readwrite')
    transaction.objectStore(STORE.leases).put(record)
    transaction.oncomplete = () => resolve()
    transaction.onabort = () => reject(transaction.error ?? new Error('Nie udało się zapisać lease.'))
  })
}

function read(db: IDBDatabase, sessionId: string): Promise<SessionLeaseRecord | undefined> {
  return new Promise((resolve, reject) => {
    const source = db.transaction([STORE.leases], 'readonly').objectStore(STORE.leases).get(sessionId)
    source.onsuccess = () => resolve(source.result as SessionLeaseRecord | undefined)
    source.onerror = () => reject(source.error ?? new Error('Nie udało się odczytać lease.'))
  })
}

export class SessionLease {
  private current: LeaseStatus
  private readonly channel: BroadcastChannel | null
  private heartbeat: ReturnType<typeof setInterval> | null = null

  constructor(
    private readonly db: IDBDatabase,
    readonly sessionId: string,
    readonly ownerId: string,
    private readonly options: {
      readonly ttlMs?: number
      readonly now?: () => number
      readonly channel?: BroadcastChannel | null
    } = {},
  ) {
    this.current = { role: 'reader', ownerId: null, expiresAtMs: 0, takeoverAvailable: true }
    this.channel = options.channel ?? null
    if (this.channel) {
      this.channel.onmessage = (event: MessageEvent) => this.onMessage(event.data as LeaseMessage)
    }
  }

  get status(): LeaseStatus {
    return this.current
  }

  private get ttlMs(): number {
    return this.options.ttlMs ?? LEASE_TTL_MS
  }

  private now(): number {
    return this.options.now?.() ?? Date.now()
  }

  private onMessage(message: LeaseMessage): void {
    if (!message || message.sessionId !== this.sessionId || message.ownerId === this.ownerId) return
    if (message.type === 'claimed') {
      this.current = { role: 'reader', ownerId: message.ownerId, expiresAtMs: this.now() + this.ttlMs, takeoverAvailable: false }
      this.stopHeartbeat()
    } else {
      this.current = { ...this.current, takeoverAvailable: true, expiresAtMs: 0 }
    }
  }

  /** Odczytuje aktualny stan bez zmiany właściciela. */
  async refresh(): Promise<LeaseStatus> {
    const record = await read(this.db, this.sessionId)
    const now = this.now()
    if (!record) {
      this.current = { role: this.current.role === 'owner' ? 'owner' : 'reader', ownerId: null, expiresAtMs: 0, takeoverAvailable: true }
      return this.current
    }
    if (record.ownerId === this.ownerId) {
      this.current = { role: 'owner', ownerId: this.ownerId, expiresAtMs: record.expiresAtMs, takeoverAvailable: false }
      return this.current
    }
    const expired = record.expiresAtMs <= now
    this.current = { role: 'reader', ownerId: record.ownerId, expiresAtMs: record.expiresAtMs, takeoverAvailable: expired }
    return this.current
  }

  /**
   * Przejmuje prawo zapisu, gdy lease jest wolny, wygasł albo należy do nas.
   * `force` nie omija ważnego lease innej karty — przejęcie jest jawne, ale
   * dopiero po wygaśnięciu.
   */
  async acquire(): Promise<LeaseStatus> {
    const status = await this.refresh()
    if (status.role !== 'owner' && !status.takeoverAvailable) return status
    const now = this.now()
    await put(this.db, {
      sessionId: this.sessionId,
      ownerId: this.ownerId,
      acquiredAtMs: now,
      expiresAtMs: now + this.ttlMs,
    })
    this.current = { role: 'owner', ownerId: this.ownerId, expiresAtMs: now + this.ttlMs, takeoverAvailable: false }
    this.channel?.postMessage({ sessionId: this.sessionId, ownerId: this.ownerId, type: 'claimed' } satisfies LeaseMessage)
    return this.current
  }

  async release(): Promise<void> {
    this.stopHeartbeat()
    if (this.current.role !== 'owner') return
    await put(this.db, {
      sessionId: this.sessionId,
      ownerId: this.ownerId,
      acquiredAtMs: this.now(),
      expiresAtMs: 0,
    })
    this.current = { role: 'reader', ownerId: null, expiresAtMs: 0, takeoverAvailable: true }
    this.channel?.postMessage({ sessionId: this.sessionId, ownerId: this.ownerId, type: 'released' } satisfies LeaseMessage)
  }

  startHeartbeat(intervalMs = LEASE_HEARTBEAT_MS): void {
    this.stopHeartbeat()
    this.heartbeat = setInterval(() => {
      if (this.current.role !== 'owner') return
      void this.acquire().catch(() => {
        /* utrata bazy zostanie zgłoszona przy najbliższym zapisie */
      })
    }, intervalMs)
  }

  stopHeartbeat(): void {
    if (this.heartbeat === null) return
    clearInterval(this.heartbeat)
    this.heartbeat = null
  }
}
