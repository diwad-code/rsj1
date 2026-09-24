/**
 * PKG-006 / P20 — odtwarzacz podstawowy czytający wyłącznie zapisane próbki.
 *
 * Moduł celowo nie importuje `JumpSimulation` ani parametrów fizyki: stary
 * replay działa po zmianie bieżącego solvera. Odtwarzanie nie emituje zdarzeń
 * punktacji i nie zmienia postępu konkursu.
 */

import { FIXED_HZ } from '../core/fixedClock'
import type { ReplayDiscreteEvent, ReplaySample, StoredReplay } from '../storage/schema'

export const REPLAY_RATES = [0.25, 0.5, 1, 2] as const
export type ReplayRate = (typeof REPLAY_RATES)[number]

export type ReplayFrame = {
  readonly tick: number
  readonly x: number
  readonly y: number
  readonly pitchRad: number
  /** Faza pochodzi z próbki „nie później niż tick”; interpolacja jej nie opóźnia. */
  readonly phase: string
  readonly speedKmh: number
  readonly windUserMetersPerSecond: number
  readonly heightAboveSurface: number
  readonly events: readonly ReplayDiscreteEvent[]
}

function lerp(from: number, to: number, ratio: number): number {
  return from + (to - from) * ratio
}

export class ReplayPlayer {
  playing = true
  private rateIndex = REPLAY_RATES.indexOf(1)
  private position: number

  constructor(readonly replay: StoredReplay) {
    if (replay.samples.length === 0) throw new Error('Replay bez próbek nie może zostać odtworzony.')
    this.position = this.firstTick
  }

  get firstTick(): number {
    return this.replay.samples[0]?.tick ?? 0
  }

  get lastTick(): number {
    return this.replay.samples[this.replay.samples.length - 1]?.tick ?? 0
  }

  get tick(): number {
    return this.position
  }

  get rate(): ReplayRate {
    return REPLAY_RATES[this.rateIndex] ?? 1
  }

  get durationSeconds(): number {
    return (this.lastTick - this.firstTick) / FIXED_HZ
  }

  get elapsedSeconds(): number {
    return (this.position - this.firstTick) / FIXED_HZ
  }

  get progress(): number {
    const span = this.lastTick - this.firstTick
    return span <= 0 ? 1 : (this.position - this.firstTick) / span
  }

  get finished(): boolean {
    return this.position >= this.lastTick
  }

  togglePlay(): void {
    if (this.finished && !this.playing) this.position = this.firstTick
    this.playing = !this.playing
  }

  changeRate(delta: number): void {
    this.rateIndex = Math.max(0, Math.min(REPLAY_RATES.length - 1, this.rateIndex + delta))
  }

  /** Przewijanie w obie strony; nigdy nie nalicza wyniku ani nie zapisuje danych. */
  scrub(deltaTicks: number): void {
    this.playing = false
    this.position = Math.max(this.firstTick, Math.min(this.lastTick, this.position + deltaTicks))
  }

  restart(): void {
    this.position = this.firstTick
    this.playing = true
  }

  advance(deltaSeconds: number): void {
    if (!this.playing || deltaSeconds <= 0) return
    this.position += deltaSeconds * FIXED_HZ * this.rate
    if (this.position >= this.lastTick) {
      this.position = this.lastTick
      this.playing = false
    }
  }

  private sampleIndexAt(tick: number): number {
    const samples = this.replay.samples
    let low = 0
    let high = samples.length - 1
    while (low < high) {
      const middle = Math.ceil((low + high) / 2)
      if ((samples[middle]?.tick ?? 0) <= tick) low = middle
      else high = middle - 1
    }
    return low
  }

  /** Próbka obowiązująca dokładnie w podanym ticku, bez interpolacji. */
  sampleAt(tick: number): ReplaySample {
    const samples = this.replay.samples
    return samples[this.sampleIndexAt(tick)] ?? (samples[0] as ReplaySample)
  }

  eventsUpTo(tick: number): readonly ReplayDiscreteEvent[] {
    return this.replay.discreteEvents.filter((event) => event.tick <= tick)
  }

  frame(): ReplayFrame {
    const tick = this.position
    const index = this.sampleIndexAt(tick)
    const current = this.replay.samples[index] as ReplaySample
    const next = this.replay.samples[index + 1]
    const span = next ? next.tick - current.tick : 0
    const ratio = next && span > 0 ? Math.max(0, Math.min(1, (tick - current.tick) / span)) : 0

    return {
      tick,
      x: next ? lerp(current.x, next.x, ratio) : current.x,
      y: next ? lerp(current.y, next.y, ratio) : current.y,
      pitchRad: next ? lerp(current.pitchRad, next.pitchRad, ratio) : current.pitchRad,
      phase: current.phase,
      speedKmh: next ? lerp(current.speedKmh, next.speedKmh, ratio) : current.speedKmh,
      windUserMetersPerSecond: current.windUserMetersPerSecond,
      heightAboveSurface: next ? lerp(current.heightAboveSurface, next.heightAboveSurface, ratio) : current.heightAboveSurface,
      events: this.eventsUpTo(Math.floor(tick)),
    }
  }
}

/**
 * Widok wizualny wymaga tej samej wersji skoczni. Przy niezgodności pokazujemy
 * widok techniczny z komunikatem, zamiast po cichu przeliczać replay nową fizyką.
 */
export function replayVisualsCompatible(replay: StoredReplay, currentHillVersion: string, currentHillId: string): boolean {
  return replay.versions.hill === currentHillVersion && replay.initialState.hillId === currentHillId
}
