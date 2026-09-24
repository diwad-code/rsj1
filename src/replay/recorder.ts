/**
 * PKG-006 / P20 — rejestracja jednego skoku człowieka.
 *
 * Zapisujemy próbki prezentacyjne 30 Hz i dokładne zdarzenia dyskretne
 * symulacji. Odtwarzacz jest próbkowy, więc krawędzi wejścia nie zapisujemy.
 * Nie zapisujemy klatek Canvas ani stanu renderera.
 */

import type { TickInput } from '../input/keyboard'
import type { JumpSimulation } from '../simulation/jump'
import { FIXED_HZ } from '../core/fixedClock'
import { MODERN_RULES } from '../sport/scoring'
import {
  REPLAY_FORMAT_VERSION,
  REPLAY_SCHEMA_VERSION,
  type ReplayDiscreteEvent,
  type ReplaySample,
  type StoredReplay,
} from '../storage/schema'
import type { CompetitionJumpResult } from '../sport/jumpResult'

export const REPLAY_SAMPLE_HZ = 30
const SAMPLE_EVERY_TICKS = Math.round(FIXED_HZ / REPLAY_SAMPLE_HZ)

export type RecorderMeta = {
  readonly sessionId: string
  readonly competitionId: string
  readonly roundId: CompetitionJumpResult['roundId']
  readonly participantId: string
  readonly participantName: string
  readonly juryGateNumber: number
  readonly coachRequested: boolean
}

function sampleOf(sim: JumpSimulation): ReplaySample {
  return {
    tick: sim.tick,
    x: sim.position.x,
    y: sim.position.y,
    pitchRad: sim.pitchRad,
    phase: sim.phase,
    speedKmh: sim.speedKmh,
    windUserMetersPerSecond: sim.currentWindUserMetersPerSecond,
    heightAboveSurface: sim.heightAboveSurface(),
  }
}

export class JumpRecorder {
  private readonly samples: ReplaySample[] = []

  constructor(
    private readonly sim: JumpSimulation,
    private readonly meta: RecorderMeta,
  ) {
    this.samples.push(sampleOf(sim))
  }

  /** Wywoływane po każdym `sim.step(input)` aktywnego skoku. */
  record(_input: TickInput): void {
    // Odtwarzacz jest próbkowy i nie używa krawędzi wejścia, więc ich nie zapisujemy.
    // Pole `inputs` pozostaje puste dla kompatybilności schematu.
    const last = this.samples[this.samples.length - 1]
    if (this.sim.tick % SAMPLE_EVERY_TICKS === 0 && (last === undefined || last.tick < this.sim.tick)) {
      this.samples.push(sampleOf(this.sim))
    }
  }

  get sampleCount(): number {
    return this.samples.length
  }

  finish(result: CompetitionJumpResult, nowMs: number): StoredReplay {
    const last = this.samples[this.samples.length - 1]
    if (last === undefined || last.tick < this.sim.tick) this.samples.push(sampleOf(this.sim))

    const discreteEvents: ReplayDiscreteEvent[] = this.sim.events.map((event) => ({
      tick: event.tick,
      type: event.type,
      detail: event.detail,
    }))

    return {
      schemaVersion: REPLAY_SCHEMA_VERSION,
      id: result.resultId,
      sessionId: this.meta.sessionId,
      kind: 'auto',
      createdAtMs: nowMs,
      formatVersion: REPLAY_FORMAT_VERSION,
      versions: {
        rules: MODERN_RULES.version,
        physics: this.sim.params.physicsVersion,
        hill: this.sim.hill.spec.hillVersion,
      },
      sampleHz: REPLAY_SAMPLE_HZ,
      initialState: {
        competitionId: this.meta.competitionId,
        roundId: this.meta.roundId,
        participantId: this.meta.participantId,
        participantName: this.meta.participantName,
        gateNumber: this.sim.gateNumber,
        juryGateNumber: this.meta.juryGateNumber,
        coachRequested: this.meta.coachRequested,
        windSeed: this.sim.windField?.seed ?? null,
        windVersion: this.sim.windField?.version ?? null,
        hillId: this.sim.hill.spec.id,
      },
      inputs: [],
      samples: this.samples,
      discreteEvents,
      recordedResult: result,
    }
  }
}
