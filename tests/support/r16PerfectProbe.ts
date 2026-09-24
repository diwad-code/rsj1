/**
 * PKG-008 r16-fix — mała sonda diagnostyczna premii perfect (bounded probe).
 * Nie jest plikiem testowym; używana przez test diagnostyczny i ręczne
 * sondy. Zero frameworka: jawne pętle, jawne taśmy wejść.
 *
 * Konwencja taśmy: indeks = tick PRZED krokiem (sim.tick przed step).
 * runJump wywołuje onStep PO kroku, więc tick taśmy = sim.tick - 1.
 * Wejścia klonujemy (pressed kopia, held kopia), żeby cross-replay był wierny.
 */

import { JumpSimulation, SIM_DT } from '../../src/simulation/jump'
import { DEFAULT_JUMP_PARAMS, type JumpParams } from '../../src/simulation/params'
import type { Action, TickInput } from '../../src/input/keyboard'
import { edgeTickFor, makeInput } from './jumpHarness'
import type { WindField } from '../../src/simulation/wind'

export const NO_BONUS_PARAMS: JumpParams = {
  ...DEFAULT_JUMP_PARAMS,
  takeoff: { ...DEFAULT_JUMP_PARAMS.takeoff, perfectImpulseNewtonSeconds: 0 },
}

export function steadyWind(userMetersPerSecond: number): WindField {
  return {
    seed: 0,
    version: 'r16-perfect-probe',
    sampleUserMetersPerSecond: () => userMetersPerSecond,
  }
}

export type TapeEntry = { readonly pressed: Action[]; readonly held: Action[] }

export type TraceSample = {
  readonly tick: number
  readonly flightSeconds: number
  readonly phase: string
  readonly x: number
  readonly y: number
  readonly height: number
  readonly vx: number
  readonly vy: number
  readonly aoa: number
}

export type ProbeRun = {
  readonly sim: JumpSimulation
  readonly tape: TapeEntry[]
  readonly trace: TraceSample[]
  readonly maxHeight: number
  readonly prepTick: number | null
  readonly prepHeight: number | null
  readonly contactTick: number | null
}

/** Adaptacyjny przebieg jak runJump (ideal pilot + próg 6 m), z pełnym zapisem taśmy i śladu. */
export function runAdaptiveCapture(
  gate: number,
  params: JumpParams,
  windMps: number,
  style: 'telemark' | 'parallel' | null = 'telemark',
): ProbeRun {
  const windField = steadyWind(windMps)
  const takeoffTick = edgeTickFor(gate, params) - Math.round(params.takeoff.idealLeadSeconds / SIM_DT)
  const sim = new JumpSimulation({ gateNumber: gate, autoStart: true, params, windField })
  const tape: TapeEntry[] = []
  const trace: TraceSample[] = []
  let prepArmedAt: number | null = null
  let prepped = false
  let previousHeight: number | null = null
  let maxHeight = 0

  for (let guard = 0; guard < 20_000 && !sim.finished; guard += 1) {
    const pressed: Action[] = []
    const held: Action[] = []
    if (sim.tick === takeoffTick) pressed.push('takeoff')
    if (sim.phase === 'Flight') {
      const flowDeg = (Math.atan2(sim.velocity.y, sim.velocity.x) * 180) / Math.PI
      const desiredPitchDeg = flowDeg + 32
      const currentTargetDeg = (sim.targetPitchRad * 180) / Math.PI
      if (currentTargetDeg > desiredPitchDeg + 0.5) held.push('right')
      else if (currentTargetDeg < desiredPitchDeg - 0.5) held.push('left')

      if (!prepped && style && sim.flightSeconds > 1) {
        const height = sim.heightAboveSurface()
        const descending = previousHeight !== null && height < previousHeight
        previousHeight = height
        if (prepArmedAt === null && descending && height <= 6) prepArmedAt = sim.tick
        if (prepArmedAt !== null && sim.tick >= prepArmedAt) {
          pressed.push(style === 'parallel' ? 'parallel' : 'telemark')
          prepped = true
        }
      }
    }
    const tickBefore = sim.tick
    tape[tickBefore] = { pressed: [...pressed], held: [...held] }
    const input: TickInput = makeInput(pressed, held, tickBefore)
    sim.step(input)
    if (sim.phase === 'Flight' || sim.phase === 'LandingPrep') {
      const h = sim.heightAboveSurface()
      maxHeight = Math.max(maxHeight, h)
      trace.push({
        tick: sim.tick,
        flightSeconds: sim.flightSeconds,
        phase: sim.phase,
        x: sim.position.x,
        y: sim.position.y,
        height: h,
        vx: sim.velocity.x,
        vy: sim.velocity.y,
        aoa: sim.angleOfAttackDeg,
      })
    }
  }
  const prepEvent = sim.events.find((e) => e.type === 'landingPrep')
  const contactEvent = sim.events.find((e) => e.type === 'contact')
  // Zdarzenie ma tick kroku (przed inkrementacją); ślad próbkujemy po kroku.
  const prepSample = prepEvent ? trace.find((s) => s.tick === prepEvent.tick + 1) ?? null : null
  return {
    sim,
    tape,
    trace,
    maxHeight,
    prepTick: prepEvent?.tick ?? null,
    prepHeight: prepSample?.height ?? null,
    contactTick: contactEvent?.tick ?? null,
  }
}

/** Wierny replay taśmy (te same ticki, te same wejścia) na zadanych params. */
export function replayTape(
  gate: number,
  params: JumpParams,
  windMps: number,
  tape: TapeEntry[],
): JumpSimulation {
  const sim = new JumpSimulation({ gateNumber: gate, autoStart: true, params, windField: steadyWind(windMps) })
  for (let guard = 0; guard < 20_000 && !sim.finished; guard += 1) {
    const entry = tape[sim.tick]
    const pressed = entry ? [...entry.pressed] : []
    const held = entry ? [...entry.held] : []
    sim.step(makeInput(pressed, held, sim.tick))
    // Taśma dłuższa niż lot nie szkodzi; brak wpisu = puste wejście.
    if (sim.tick >= tape.length && sim.phase !== 'Flight' && sim.phase !== 'LandingPrep') {
      // Kontynuuj pustymi wejściami aż do terminalnego stanu.
      continue
    }
  }
  return sim
}

/** Wymuszony tick przygotowania: taśma bazowa z podmienionym momentem T. */
export function tapeWithForcedPrep(
  baseTape: TapeEntry[],
  takeoffStyle: 'telemark' | 'parallel',
  fromTick: number | null,
  toTick: number | null,
): TapeEntry[] {
  const out = baseTape.map((e) => ({ pressed: [...e.pressed], held: [...e.held] }))
  if (fromTick !== null && out[fromTick]) {
    out[fromTick] = {
      pressed: out[fromTick].pressed.filter((a) => a !== 'telemark' && a !== 'parallel'),
      held: [...out[fromTick].held],
    }
  }
  if (toTick !== null) {
    while (out.length <= toTick) out.push({ pressed: [], held: [] })
    const target = out[toTick]
    if (target && !target.pressed.includes('telemark') && !target.pressed.includes('parallel')) {
      out[toTick] = {
        pressed: [...target.pressed, takeoffStyle === 'parallel' ? 'parallel' : 'telemark'],
        held: [...target.held],
      }
    }
  }
  return out
}

/** Lokalizuje tick naciśnięcia przygotowania w taśmie (pierwsze T/R). */
export function findPrepTapeTick(tape: TapeEntry[]): number | null {
  for (let i = 0; i < tape.length; i += 1) {
    const p = tape[i]?.pressed ?? []
    if (p.includes('telemark') || p.includes('parallel')) {
      // Pomijamy takeoff (inny action) — tu liczy się tylko T/R.
      return i
    }
  }
  return null
}
