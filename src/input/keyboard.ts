import { FIXED_STEP_MS } from '../core/fixedClock'

export const ACTION_BY_CODE = {
  ArrowUp: 'takeoff',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  KeyT: 'telemark',
  KeyR: 'parallel',
} as const

export type Action = (typeof ACTION_BY_CODE)[keyof typeof ACTION_BY_CODE]
export type Edge = 'pressed' | 'released'

export type TimedAction = {
  action: Action
  edge: Edge
  tick: number
  sequence: number
  delayed: boolean
}

export type TickInput = {
  pressed: Action[]
  released: Action[]
  held: ReadonlySet<Action>
  events: TimedAction[]
  horizontal: -1 | 0 | 1
}

export class ActiveSessionClock {
  private activeBeforeSegmentMs = 0
  private segmentStartedAtMs: number | null = null

  start(nowMs: number): void {
    this.activeBeforeSegmentMs = 0
    this.segmentStartedAtMs = nowMs
  }

  pause(nowMs: number): void {
    if (this.segmentStartedAtMs === null) return
    this.activeBeforeSegmentMs += Math.max(0, nowMs - this.segmentStartedAtMs)
    this.segmentStartedAtMs = null
  }

  resume(nowMs: number): void {
    if (this.segmentStartedAtMs !== null) return
    this.segmentStartedAtMs = nowMs
  }

  reanchor(nowMs: number): void {
    if (this.segmentStartedAtMs === null) return
    this.segmentStartedAtMs = nowMs
  }

  pauseAtTick(firstUnexecutedTick: number): void {
    this.activeBeforeSegmentMs = firstUnexecutedTick * FIXED_STEP_MS
    this.segmentStartedAtMs = null
  }

  tickFor(timestampMs: number, firstUnexecutedTick: number): { tick: number; delayed: boolean } {
    const segmentElapsed = this.segmentStartedAtMs === null
      ? 0
      : Math.max(0, timestampMs - this.segmentStartedAtMs)
    const requestedTick = Math.floor((this.activeBeforeSegmentMs + segmentElapsed) / FIXED_STEP_MS)

    return {
      tick: Math.max(requestedTick, firstUnexecutedTick),
      delayed: requestedTick < firstUnexecutedTick,
    }
  }
}

export function normalizeEventTimestamp(timestampMs: number, nowMs: number, timeOriginMs: number): number {
  if (Math.abs(timestampMs - nowMs) < 60_000) return timestampMs
  const relative = timestampMs - timeOriginMs
  return Math.abs(relative - nowMs) < 60_000 ? relative : nowMs
}

export class InputBuffer {
  private readonly queued: TimedAction[] = []
  private readonly held = new Set<Action>()
  private readonly physicallyDown = new Set<Action>()
  private sequence = 0

  constructor(private readonly sessionClock: ActiveSessionClock) {}

  enqueue(
    action: Action,
    edge: Edge,
    timestampMs: number,
    firstUnexecutedTick: number,
    repeat = false,
  ): TimedAction | null {
    if (edge === 'pressed') {
      if (repeat || this.physicallyDown.has(action)) return null
      this.physicallyDown.add(action)
    } else {
      if (!this.physicallyDown.has(action)) return null
      this.physicallyDown.delete(action)
    }

    const mapped = this.sessionClock.tickFor(timestampMs, firstUnexecutedTick)
    const event: TimedAction = {
      action,
      edge,
      tick: mapped.tick,
      sequence: this.sequence,
      delayed: mapped.delayed,
    }
    this.sequence += 1
    this.queued.push(event)
    this.queued.sort((left, right) => left.tick - right.tick || left.sequence - right.sequence)
    return event
  }

  consume(tick: number): TickInput {
    const events: TimedAction[] = []
    // Spóźnione wejścia (tick <= bieżący) są konsumowane; przyszłe zostają w kolejce.
    while (this.queued[0] !== undefined && (this.queued[0]?.tick ?? 0) <= tick) {
      const event = this.queued.shift()
      if (event) events.push(event)
    }

    const pressed: Action[] = []
    const released: Action[] = []
    for (const event of events) {
      if (event.edge === 'pressed') {
        this.held.add(event.action)
        pressed.push(event.action)
      } else {
        this.held.delete(event.action)
        released.push(event.action)
      }
    }

    const left = this.held.has('left')
    const right = this.held.has('right')
    const horizontal = left === right ? 0 : left ? -1 : 1

    return {
      pressed,
      released,
      held: new Set(this.held),
      events,
      horizontal,
    }
  }

  reset(): void {
    this.queued.length = 0
    this.held.clear()
    this.physicallyDown.clear()
  }
}
