/** PKG-005 / P17 — deterministyczny kontroler bota używający JumpSimulation. */

import type { Action, TickInput } from '../input/keyboard'
import { JumpSimulation, SIM_DT, type JumpConfig } from '../simulation/jump'
import type { JumpParams } from '../simulation/params'
import type { Hill } from '../simulation/technicalHill'
import type { WindField } from '../simulation/wind'
import type { AiDifficulty, CompetitionEntrant, CompetitionRoundId } from './competition'

export type AiDifficultyProfile = {
  readonly timingJitterTicks: number
  readonly postureJitterDeg: number
  readonly prepHeightMinMeters: number
  readonly prepHeightMaxMeters: number
  readonly prepDelayTicks: number
  readonly telemarkChance: number
  readonly startDelayMinTicks: number
  readonly startDelayMaxTicks: number
}

export const AI_DIFFICULTY: Readonly<Record<AiDifficulty, AiDifficultyProfile>> = {
  easy: {
    timingJitterTicks: 24,
    postureJitterDeg: 5.5,
    prepHeightMinMeters: 0.4,
    prepHeightMaxMeters: 5.5,
    prepDelayTicks: 60,
    telemarkChance: 0.35,
    startDelayMinTicks: 90,
    startDelayMaxTicks: 760,
  },
  normal: {
    timingJitterTicks: 11,
    postureJitterDeg: 2.6,
    prepHeightMinMeters: 3.5,
    prepHeightMaxMeters: 9,
    prepDelayTicks: 18,
    telemarkChance: 0.62,
    startDelayMinTicks: 70,
    startDelayMaxTicks: 620,
  },
  hard: {
    timingJitterTicks: 4,
    postureJitterDeg: 1.1,
    prepHeightMinMeters: 7,
    prepHeightMaxMeters: 12,
    prepDelayTicks: 4,
    telemarkChance: 0.82,
    startDelayMinTicks: 55,
    startDelayMaxTicks: 480,
  },
} as const

export type AiPlan = {
  readonly seed: number
  readonly difficulty: AiDifficulty
  readonly startDelayTicks: number
  readonly takeoffOffsetTicks: number
  readonly targetAngleOfAttackDeg: number
  readonly landingStyle: 'telemark' | 'parallel'
  readonly prepHeightMeters: number
  readonly prepDelayTicks: number
}

const FIRST_NAMES = [
  'Arel', 'Boryn', 'Cyrian', 'Darian', 'Egon',
  'Florian', 'Gustaw', 'Hubert', 'Iwo', 'Jarema',
  'Kordian', 'Lechosław', 'Milan', 'Nikodem', 'Oskar',
] as const

const LAST_NAMES = ['Białowicher', 'Cichoskok', 'Mroźnik', 'Północny', 'Śniegor'] as const

export function createFictionalEntrants(difficulty: AiDifficulty): readonly CompetitionEntrant[] {
  const entrants: CompetitionEntrant[] = []
  for (const lastName of LAST_NAMES) {
    for (const firstName of FIRST_NAMES) {
      const startNumber = entrants.length + 1
      entrants.push({
        id: `bot-${String(startNumber).padStart(3, '0')}`,
        name: `${firstName} ${lastName}`,
        startNumber,
        controller: { kind: 'ai', difficulty },
      })
    }
  }
  return entrants
}

function mix32(value: number): number {
  let mixed = value >>> 0
  mixed ^= mixed >>> 16
  mixed = Math.imul(mixed, 0x7feb352d)
  mixed ^= mixed >>> 15
  mixed = Math.imul(mixed, 0x846ca68b)
  mixed ^= mixed >>> 16
  return mixed >>> 0
}

function hashText(text: string): number {
  let hash = 0x811c9dc5
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

export function aiSeedForJump(baseAiSeed: number, participantId: string, roundId: CompetitionRoundId): number {
  return mix32((baseAiSeed >>> 0) ^ hashText(`${participantId}:${roundId}`))
}

function randomUnits(seed: number, count: number): number[] {
  const values: number[] = []
  let state = seed >>> 0 || 0x6d2b79f5
  for (let index = 0; index < count; index += 1) {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    values.push((state >>> 0) / 0x1_0000_0000)
  }
  return values
}

function between(unit: number, min: number, max: number): number {
  return min + (max - min) * unit
}

export function createAiPlan(seed: number, difficulty: AiDifficulty, hillId?: string): AiPlan {
  const profile = AI_DIFFICULTY[difficulty]
  const values = randomUnits(seed, 7)
  const unit = (index: number): number => values[index] ?? 0.5
  // Na krótkiej H01 szeroki błąd timingu i wczesne lądowanie ucinały lot
  // nawet do 20–40 m. Mniejszy zakres zachowuje różnice trudności i seed.
  const inspiredH01 = hillId === 'h01-lillehammer-normal'
  const timingJitter = inspiredH01 ? Math.round(profile.timingJitterTicks * 0.25) : profile.timingJitterTicks
  return {
    seed: seed >>> 0,
    difficulty,
    startDelayTicks: inspiredH01
      ? Math.round(between(unit(0), 45, 90))
      : Math.round(between(unit(0), profile.startDelayMinTicks, profile.startDelayMaxTicks)),
    takeoffOffsetTicks: Math.round(between(unit(1), -timingJitter, timingJitter)),
    targetAngleOfAttackDeg: 32 + between(unit(2), -profile.postureJitterDeg, profile.postureJitterDeg),
    landingStyle: unit(3) < profile.telemarkChance ? 'telemark' : 'parallel',
    prepHeightMeters: inspiredH01
      ? Math.min(1.5, between(unit(4), profile.prepHeightMinMeters, profile.prepHeightMaxMeters))
      : between(unit(4), profile.prepHeightMinMeters, profile.prepHeightMaxMeters),
    prepDelayTicks: inspiredH01 ? 0 : Math.round(unit(5) * profile.prepDelayTicks),
  }
}

function input(pressed: Action[] = [], held: Action[] = []): TickInput {
  const left = held.includes('left')
  const right = held.includes('right')
  return {
    pressed,
    released: [],
    held: new Set(held),
    events: [],
    horizontal: left === right ? 0 : left ? -1 : 1,
  }
}

const EMPTY_INPUT = input()
const edgeTickCache = new Map<string, number>()

function edgeCacheKey(hillId: string, hillVersion: string, physicsVersion: string, gateNumber: number): string {
  return `${hillId}|${hillVersion}|${physicsVersion}|${gateNumber}`
}

function edgeTickForGate(gateNumber: number, hill: Hill, params: JumpParams): number {
  const key = edgeCacheKey(hill.spec.id, hill.spec.hillVersion, params.physicsVersion, gateNumber)
  const cached = edgeTickCache.get(key)
  if (cached !== undefined) return cached
  const probe = new JumpSimulation({ hill, params, gateNumber, autoStart: true })
  while ((probe.phase === 'Inrun' || probe.phase === 'Takeoff') && probe.tick < 5000) probe.step(EMPTY_INPUT)
  edgeTickCache.set(key, probe.tick)
  return probe.tick
}

export type AiRunnerConfig = {
  readonly plan: AiPlan
  readonly gateNumber: number
  readonly windField: WindField
  readonly jumpConfig?: Omit<JumpConfig, 'gateNumber' | 'windField' | 'autoStart'>
}

export class AiJumpRunner {
  readonly sim: JumpSimulation
  readonly plan: AiPlan
  private gateOpenedAtTick: number | null = null
  private takeoffSent = false
  private prepArmedAtTick: number | null = null
  private previousHeightMeters: number | null = null
  private landingSent = false

  constructor(config: AiRunnerConfig) {
    this.plan = config.plan
    this.sim = new JumpSimulation({
      ...config.jumpConfig,
      gateNumber: config.gateNumber,
      windField: config.windField,
      autoStart: false,
    })
  }

  step(): void {
    if (this.sim.finished) return
    const pressed: Action[] = []
    const held: Action[] = []

    if (this.sim.phase === 'GateGreen' && this.sim.tick >= this.plan.startDelayTicks) {
      pressed.push('right')
      this.gateOpenedAtTick = this.sim.tick
    }

    if ((this.sim.phase === 'Inrun' || this.sim.phase === 'Takeoff') && !this.takeoffSent) {
      const idealLeadTicks = Math.round(this.sim.params.takeoff.idealLeadSeconds / SIM_DT)
      const relativeTick = this.gateOpenedAtTick === null ? 0 : this.sim.tick - this.gateOpenedAtTick - 1
      const pressTick = edgeTickForGate(this.sim.gateNumber, this.sim.hill, this.sim.params)
        - idealLeadTicks
        + this.plan.takeoffOffsetTicks
      if (relativeTick >= pressTick) {
        pressed.push('takeoff')
        this.takeoffSent = true
      }
    }

    if (this.sim.phase === 'Flight') {
      const flowDeg = Math.atan2(this.sim.velocity.y, this.sim.velocity.x) * 180 / Math.PI
      const desiredPitchDeg = flowDeg + this.plan.targetAngleOfAttackDeg
      const targetPitchDeg = this.sim.targetPitchRad * 180 / Math.PI
      if (targetPitchDeg > desiredPitchDeg + 0.5) held.push('right')
      else if (targetPitchDeg < desiredPitchDeg - 0.5) held.push('left')

      const minimumPrepFlightSeconds = this.sim.hill.spec.id === 'h01-lillehammer-normal' ? 2 : 1
      if (!this.landingSent && this.sim.flightSeconds > minimumPrepFlightSeconds) {
        // Prześwit nad garbem najpierw rośnie (garb opada stromiej niż tor
        // lotu), więc sam próg wysokości uzbrajałby lądowanie tuż po wybiciu.
        // Bot czeka, aż zacznie zbliżać się do zeskoku.
        const currentHeight = this.sim.heightAboveSurface()
        const descending = this.previousHeightMeters !== null && currentHeight < this.previousHeightMeters
        this.previousHeightMeters = currentHeight
        if (this.prepArmedAtTick === null && descending && currentHeight <= this.plan.prepHeightMeters) {
          this.prepArmedAtTick = this.sim.tick
        }
        if (this.prepArmedAtTick !== null && this.sim.tick >= this.prepArmedAtTick + this.plan.prepDelayTicks) {
          pressed.push(this.plan.landingStyle === 'telemark' ? 'telemark' : 'parallel')
          this.landingSent = true
        }
      }
    }

    this.sim.step(input(pressed, held))
  }

  runChunk(maxTicks: number): boolean {
    if (!Number.isInteger(maxTicks) || maxTicks < 1) throw new Error('Porcja AI musi zawierać dodatnią liczbę ticków.')
    for (let index = 0; index < maxTicks && !this.sim.finished; index += 1) this.step()
    return this.sim.finished
  }
}

export type AiSimulationMode = 'watched' | 'fast'

export function simulateAiJump(config: AiRunnerConfig, mode: AiSimulationMode): JumpSimulation {
  const runner = new AiJumpRunner(config)
  const chunk = mode === 'watched' ? 1 : 4096
  let guard = 0
  while (!runner.sim.finished && guard < 25_000) {
    runner.runChunk(chunk)
    guard += chunk
  }
  if (!runner.sim.finished) throw new Error('AI nie osiągnęło stanu terminalnego.')
  return runner.sim
}

export type AiDistribution = {
  readonly count: number
  readonly meanDistanceMeters: number
  readonly minimumDistanceMeters: number
  readonly maximumDistanceMeters: number
  readonly meanAbsoluteTimingErrorTicks: number
  readonly falls: number
}

export function summarizeAiDistribution(
  samples: readonly { readonly plan: AiPlan; readonly distanceHalfMeters: number; readonly status: 'landed' | 'fall' }[],
): AiDistribution {
  if (samples.length === 0) throw new Error('Dystrybucja AI wymaga co najmniej jednej próbki.')
  const distances = samples.map((sample) => sample.distanceHalfMeters / 2)
  return {
    count: samples.length,
    meanDistanceMeters: distances.reduce((sum, value) => sum + value, 0) / samples.length,
    minimumDistanceMeters: Math.min(...distances),
    maximumDistanceMeters: Math.max(...distances),
    meanAbsoluteTimingErrorTicks:
      samples.reduce((sum, sample) => sum + Math.abs(sample.plan.takeoffOffsetTicks), 0) / samples.length,
    falls: samples.filter((sample) => sample.status === 'fall').length,
  }
}
