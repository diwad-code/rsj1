/**
 * P42 runda 6 — sonda strojenia po zmianie geometrii skoczni na profil FIS.
 * Nie jest plikiem testowym (vitest zbiera tylko `*.test.ts`); uruchamiana
 * przez `npx vitest run tests/tuneProbe.test.ts` albo importowana z testu
 * kalibracyjnego. Raportuje prędkość na progu, długości i współczynniki
 * kompensacji liczone dokładnie tak, jak definiuje je norma FIS §5.
 */

import { JumpSimulation } from '../../src/simulation/jump'
import { DEFAULT_JUMP_PARAMS, type JumpParams } from '../../src/simulation/params'
import { buildHill } from '../../src/simulation/technicalHill'
import type { WindField } from '../../src/simulation/wind'
import { EMPTY_INPUT, runJump } from './jumpHarness'

/** Stały wiatr do kalibracji — norma liczy współczynniki dla ±3 m/s bez podmuchów. */
function steadyWind(userMetersPerSecond: number): WindField {
  return {
    seed: 0,
    version: 'tune-steady-1',
    sampleUserMetersPerSecond: () => userMetersPerSecond,
  }
}

export type ProbeRow = {
  readonly gate: number
  readonly tableSpeedKmh: number
  readonly distanceMeters: number | null
  readonly status: string | null
  readonly maxHeightMeters: number
}

/** Prędkość na krawędzi progu przy danej belce, bez wybicia (czysty najazd). */
export function tableSpeedKmh(gate: number, params: JumpParams = DEFAULT_JUMP_PARAMS): number {
  const run = new JumpSimulation({ gateNumber: gate, autoStart: true, params })
  let last = 0
  for (let guard = 0; guard < 20000; guard += 1) {
    const phase: string = run.phase
    if (phase !== 'GateGreen' && phase !== 'Inrun' && phase !== 'Takeoff') break
    if (phase === 'Inrun' || phase === 'Takeoff') last = run.inrunSpeed
    run.step(EMPTY_INPUT)
  }
  return last * 3.6
}

/** Historyczna baza kalibracyjna bez premii perfect (impuls 0) — TYLKO do jawnie oznaczonych testów historycznych. */
export const BASELINE_PARAMS: JumpParams = {
  ...DEFAULT_JUMP_PARAMS,
  takeoff: {
    ...DEFAULT_JUMP_PARAMS.takeoff,
    perfectImpulseNewtonSeconds: 0,
  },
}

export function probe(gate: number, params: JumpParams = DEFAULT_JUMP_PARAMS, windMps = 0): ProbeRow {
  const hill = buildHill()
  let maxHeight = 0
  const sim = runJump({
    gate,
    params,
    pilot: 'ideal',
    style: 'telemark',
    windField: windMps === 0 ? undefined : steadyWind(windMps),
    onStep: (current) => {
      if (current.phase === 'Flight' || current.phase === 'LandingPrep') {
        const ground = hill.surfaceYAtX(current.position.x)
        maxHeight = Math.max(maxHeight, current.position.y - ground)
      }
    },
  })
  return {
    gate,
    tableSpeedKmh: tableSpeedKmh(gate, params),
    distanceMeters: sim.measuredDistanceMeters,
    status: sim.outcome?.status ?? null,
    maxHeightMeters: maxHeight,
  }
}

/**
 * Współczynniki kompensacji wg normy FIS §5: liczone dla „odległości
 * zwycięzcy” ws = (w + HS)/2, jako jedna trzecia różnicy długości po skróceniu
 * rozbiegu o 3 m albo po dodaniu ±3 m/s wiatru.
 */
export function compensationFactors(params: JumpParams = DEFAULT_JUMP_PARAMS): {
  referenceGate: number
  winnerDistance: number
  baseDistance: number
  gateFactorMetersPerInrunMeter: number
  headWindFactorMetersPerMps: number
  tailWindFactorMetersPerMps: number
} {
  const hill = buildHill()
  const winner = (hill.spec.kPointMeters + hill.spec.hillSizeMeters) / 2

  let referenceGate = hill.spec.inrun.gates[0]?.number ?? 1
  let best = Number.POSITIVE_INFINITY
  for (const gate of hill.spec.inrun.gates) {
    const distance = probe(gate.number, params).distanceMeters ?? 0
    const error = Math.abs(distance - winner)
    if (error < best) {
      best = error
      referenceGate = gate.number
    }
  }

  const baseDistance = probe(referenceGate, params).distanceMeters ?? 0
  const spacing = hill.spec.inrun.gates[1] !== undefined && hill.spec.inrun.gates[0] !== undefined
    ? hill.spec.inrun.gates[1].inrunLengthMeters - hill.spec.inrun.gates[0].inrunLengthMeters
    : 0.65
  const gatesFor3m = 3 / spacing
  const lowerGate = Math.max(1, Math.round(referenceGate - gatesFor3m))
  const lowerDistance = probe(lowerGate, params).distanceMeters ?? 0
  const actualInrunDrop = (referenceGate - lowerGate) * spacing

  const head = probe(referenceGate, params, 3).distanceMeters ?? 0
  const tail = probe(referenceGate, params, -3).distanceMeters ?? 0

  return {
    referenceGate,
    winnerDistance: winner,
    baseDistance,
    gateFactorMetersPerInrunMeter: (baseDistance - lowerDistance) / actualInrunDrop,
    // Dodatnie = o tyle metrów wiatr pod narty wydłuża, a wiatr w plecy skraca.
    headWindFactorMetersPerMps: (head - baseDistance) / 3,
    tailWindFactorMetersPerMps: (baseDistance - tail) / 3,
  }
}
