/**
 * Wspólne narzędzia testów symulacji skoku. Nie jest plikiem testowym —
 * `vitest.config.ts` zbiera wyłącznie pliki o nazwie kończącej się na
 * `.test.ts`, więc ten moduł jest tylko importowany.
 */

import { FixedStepClock } from '../../src/core/fixedClock'
import { ActiveSessionClock, InputBuffer, type Action, type Edge, type TickInput } from '../../src/input/keyboard'
import { JumpSimulation, SIM_DT, type JumpConfig } from '../../src/simulation/jump'
import { DEFAULT_JUMP_PARAMS, type JumpParams } from '../../src/simulation/params'
import type { Hill } from '../../src/simulation/technicalHill'
import type { WindField } from '../../src/simulation/wind'

export function makeInput(pressed: Action[] = [], held: Action[] = [], tick = 0): TickInput {
  const left = held.includes('left')
  const right = held.includes('right')
  return {
    pressed,
    released: [],
    held: new Set(held),
    // Krawędzie z tickiem i kolejnością odpowiadają temu, co wydaje `InputBuffer`.
    events: pressed.map((action, index) => ({
      action,
      edge: 'pressed' as Edge,
      tick,
      sequence: index,
      delayed: false,
    })),
    horizontal: left === right ? 0 : left ? -1 : 1,
  }
}

export const EMPTY_INPUT = makeInput()

export type Pilot = 'none' | 'ideal' | 'over' | 'back'

export type JumpPlan = {
  gate?: number
  params?: JumpParams
  /** Przesunięcie naciśnięcia ↑ w tickach względem idealnego timingu. */
  offsetTicks?: number
  /** Całkowity brak ↑ — lot pasywny. */
  noTakeoff?: boolean
  pilot?: Pilot
  style?: 'telemark' | 'parallel' | null
  /** Wysokość nad powierzchnią, na której zaczyna się przygotowanie [m]. */
  prepHeightMeters?: number
  /** Opóźnienie przygotowania względem progu wysokości [ticki]. */
  prepDelayTicks?: number
  /**
   * Jawny wiek lotu [s], w którym wciskamy przygotowanie (niezależnie od
   * wysokości i opadania). Ustaw 0 dla natychmiastowego T/R po wybiciu.
   * Gdy ustawione, zastępuje logikę progu wysokości.
   */
  prepFlightSeconds?: number
  /** Wciśnięcie T i R w tym samym ticku. */
  pressBothLandingKeys?: boolean
  targetAngleOfAttackDeg?: number
  windField?: WindField
  /** Obserwator wywoływany po każdym kroku; używa go rejestrator replaya. */
  onStep?: (sim: JumpSimulation, input: TickInput) => void
}

/** Tick, w którym zawodnik opuszcza próg przy danej belce (bez wybicia). */
export function edgeTickFor(gate: number, params: JumpParams = DEFAULT_JUMP_PARAMS, hill?: Hill): number {
  const probe = new JumpSimulation({ gateNumber: gate, autoStart: true, params, hill })
  while (probe.phase === 'Inrun' || probe.phase === 'Takeoff') probe.step(EMPTY_INPUT)
  return probe.tick
}

export function runJump(plan: JumpPlan = {}): JumpSimulation {
  const gate = plan.gate ?? 8
  const params = plan.params ?? DEFAULT_JUMP_PARAMS
  const takeoffTick = plan.noTakeoff
    ? null
    : edgeTickFor(gate, params) - Math.round(params.takeoff.idealLeadSeconds / SIM_DT) + (plan.offsetTicks ?? 0)

  const sim = new JumpSimulation({ gateNumber: gate, autoStart: true, params, windField: plan.windField })
  const targetAoa = plan.targetAngleOfAttackDeg ?? 32
  let prepArmedAt: number | null = null
  let prepped = false
  let previousHeight: number | null = null

  for (let guard = 0; guard < 20_000 && !sim.finished; guard += 1) {
    const pressed: Action[] = []
    const held: Action[] = []

    if (takeoffTick !== null && sim.tick === takeoffTick) pressed.push('takeoff')

    if (sim.phase === 'Flight') {
      if (plan.pilot === 'over') held.push('right')
      else if (plan.pilot === 'back') held.push('left')
      else if (plan.pilot === 'ideal') {
        const flowDeg = (Math.atan2(sim.velocity.y, sim.velocity.x) * 180) / Math.PI
        const desiredPitchDeg = flowDeg + targetAoa
        const currentTargetDeg = (sim.targetPitchRad * 180) / Math.PI
        if (currentTargetDeg > desiredPitchDeg + 0.5) held.push('right')
        else if (currentTargetDeg < desiredPitchDeg - 0.5) held.push('left')
      }

      if (!prepped && plan.style && plan.prepFlightSeconds === undefined && sim.flightSeconds > 1) {
        // Na profilu zgodnym z normą FIS prześwit nad garbem najpierw ROŚNIE
        // (garb ucieka spod toru lotu pod kątem 37°), więc sam próg wysokości
        // odpalał przygotowanie już w pierwszej sekundzie lotu. Uzbrajamy je
        // dopiero, gdy zawodnik faktycznie zbliża się do zeskoku.
        const height = sim.heightAboveSurface()
        const descending = previousHeight !== null && height < previousHeight
        previousHeight = height
        if (prepArmedAt === null && descending && height <= (plan.prepHeightMeters ?? 6)) {
          prepArmedAt = sim.tick
        }
        if (prepArmedAt !== null && sim.tick >= prepArmedAt + (plan.prepDelayTicks ?? 0)) {
          if (plan.pressBothLandingKeys) pressed.push('telemark', 'parallel')
          else pressed.push(plan.style === 'parallel' ? 'parallel' : 'telemark')
          prepped = true
        }
      }
      // Jawny timing przygotowania: omija bramkę `flightSeconds > 1` i próg
      // wysokości, żeby testy wczesnego lądowania mogły wcisnąć T/R od razu.
      if (!prepped && plan.style && plan.prepFlightSeconds !== undefined && sim.flightSeconds >= plan.prepFlightSeconds) {
        if (plan.pressBothLandingKeys) pressed.push('telemark', 'parallel')
        else pressed.push(plan.style === 'parallel' ? 'parallel' : 'telemark')
        prepped = true
      }
    }

    const input = makeInput(pressed, held, sim.tick)
    sim.step(input)
    plan.onStep?.(sim, input)
  }

  return sim
}

export type ScriptedKey = { atMs: number; action: Action; edge: Edge }

export type RenderRunResult = {
  readonly sim: JumpSimulation
  readonly ticks: number
}

/**
 * Pełna ścieżka: czasowane zdarzenia klawiatury → `InputBuffer` → `FixedStepClock`
 * → symulacja. Pozwala sprawdzić niezależność wyniku od częstości renderowania.
 */
export function runScriptAtRenderHz(
  renderHz: number,
  script: readonly ScriptedKey[],
  config: JumpConfig = {},
  maxSeconds = 20,
): RenderRunResult {
  const sessionClock = new ActiveSessionClock()
  const buffer = new InputBuffer(sessionClock)
  const clock = new FixedStepClock()
  const sim = new JumpSimulation(config)

  let tick = 0
  const frameMs = 1000 / renderHz
  sessionClock.start(0)
  clock.frame(0, () => {})

  let cursor = 0
  const frames = Math.ceil(renderHz * maxSeconds)
  for (let frame = 1; frame <= frames && !sim.finished; frame += 1) {
    const now = frame * frameMs
    while (cursor < script.length) {
      const next = script[cursor]
      if (!next || next.atMs > now) break
      buffer.enqueue(next.action, next.edge, next.atMs, tick)
      cursor += 1
    }
    clock.frame(now, () => {
      sim.step(buffer.consume(tick))
      tick += 1
    })
  }

  return { sim, ticks: tick }
}

export function terminalSummary(sim: JumpSimulation): string {
  return sim.events
    .map((event) => `${event.tick} ${event.type}`)
    .join(' | ')
}
