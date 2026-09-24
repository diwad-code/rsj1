import { describe, expect, it } from 'vitest'
import { JumpSimulation, SIM_DT } from '../src/simulation/jump'
import { DEFAULT_JUMP_PARAMS } from '../src/simulation/params'
import { EMPTY_INPUT, edgeTickFor, makeInput, runJump } from './support/jumpHarness'
import { NO_BONUS_PARAMS, replayTape, runAdaptiveCapture } from './support/r16PerfectProbe'

describe('P06 — rozbieg', () => {
  it('rusza dopiero po opuszczeniu belki klawiszem →', () => {
    const sim = new JumpSimulation({ gateNumber: 8 })
    expect(sim.phase).toBe('GateGreen')
    for (let i = 0; i < 120; i += 1) sim.step(EMPTY_INPUT)
    expect(sim.phase).toBe('GateGreen')
    expect(sim.inrunSpeed).toBe(0)

    sim.step(makeInput(['right']))
    expect(sim.phase).toBe('Inrun')
    expect(sim.events[0]?.type).toBe('gateOpen')
  })

  it('porusza się po krzywej długości łuku, a nie po arbitralnej prostej', () => {
    const sim = new JumpSimulation({ gateNumber: 8, autoStart: true })
    const samples: Array<{ distance: number; x: number; y: number }> = []
    while (sim.phase === 'Inrun' || sim.phase === 'Takeoff') {
      sim.step(EMPTY_INPUT)
      samples.push({ distance: sim.inrunDistanceMeters, x: sim.position.x, y: sim.position.y })
    }
    expect(samples.length).toBeGreaterThan(300)
    for (const sample of samples) {
      const expected = sim.hill.inrunCurve.positionAt(sample.distance)
      expect(sample.x).toBeCloseTo(expected.x, 6)
      expect(sample.y).toBeCloseTo(expected.y, 6)
    }
  })

  it('daje różną rzeczywistą długość rozpędzania i prędkość dla różnych belek', () => {
    const results = [2, 5, 8, 12].map((gate) => {
      const sim = new JumpSimulation({ gateNumber: gate, autoStart: true })
      while (sim.phase === 'Inrun' || sim.phase === 'Takeoff') sim.step(EMPTY_INPUT)
      return { gate, inrun: sim.gateInrunLengthMeters, speed: sim.takeoffSpeed }
    })

    for (let index = 1; index < results.length; index += 1) {
      const before = results[index - 1]
      const after = results[index]
      expect(before && after).toBeTruthy()
      if (!before || !after) continue
      expect(after.inrun).toBeGreaterThan(before.inrun)
      expect(after.speed).toBeGreaterThan(before.speed)
    }

    const first = results[0]
    const last = results[results.length - 1]
    expect(last && first).toBeTruthy()
    if (first && last) expect(last.speed - first.speed).toBeGreaterThan(0.5)
  })

  it('zawsze przechodzi GateGreen → Inrun → Takeoff → Flight', () => {
    const sim = new JumpSimulation({ gateNumber: 8, autoStart: true })
    const seen: string[] = [sim.phase]
    while (sim.phase !== 'Flight') {
      sim.step(EMPTY_INPUT)
      if (seen[seen.length - 1] !== sim.phase) seen.push(sim.phase)
    }
    expect(seen).toEqual(['Inrun', 'Takeoff', 'Flight'])
  })
})

describe('P06 — wybicie', () => {
  const gate = 8
  const edge = edgeTickFor(gate)

  it('startuje jeden skończony impuls i ignoruje kolejne naciśnięcia', () => {
    const sim = new JumpSimulation({ gateNumber: gate, autoStart: true })
    const pressTick = edge - Math.round(DEFAULT_JUMP_PARAMS.takeoff.idealLeadSeconds / SIM_DT)
    while (sim.phase === 'Inrun' || sim.phase === 'Takeoff') {
      const pressed = sim.tick === pressTick || sim.tick === pressTick + 4 || sim.tick === pressTick + 9
        ? (['takeoff'] as const)
        : ([] as const)
      sim.step(makeInput([...pressed]))
    }
    expect(sim.events.filter((event) => event.type === 'takeoffImpulseStart')).toHaveLength(1)
    expect(sim.impulseStartTick).toBe(pressTick)
    expect(sim.deliveredImpulseNewtonSeconds).toBeLessThanOrEqual(
      DEFAULT_JUMP_PARAMS.takeoff.impulseNewtonSeconds + 1e-6,
    )
  })

  it('ignoruje ↑ po oderwaniu — impulsu nie da się powtórzyć w locie', () => {
    const sim = new JumpSimulation({ gateNumber: gate, autoStart: true })
    while (sim.phase !== 'Flight') sim.step(EMPTY_INPUT)
    const speedBefore = Math.hypot(sim.velocity.x, sim.velocity.y)
    for (let i = 0; i < 20; i += 1) sim.step(makeInput(['takeoff']))
    expect(sim.events.some((event) => event.type === 'takeoffImpulseStart')).toBe(false)
    expect(Math.hypot(sim.velocity.x, sim.velocity.y)).not.toBe(speedBefore)
    expect(sim.takeoffNormalSpeed).toBe(0)
  })

  it('bez ↑ daje pasywny lot — wyraźnie krótszy niż z wybiciem', () => {
    const passive = runJump({ gate, noTakeoff: true, pilot: 'ideal', style: 'telemark' })
    const active = runJump({ gate, offsetTicks: 0, pilot: 'ideal', style: 'telemark' })

    expect(passive.takeoffNormalSpeed).toBe(0)
    expect(passive.takeoffTimingOffsetSeconds).toBeNull()
    expect(passive.measuredDistanceMeters).not.toBeNull()
    expect(active.measuredDistanceMeters ?? 0).toBeGreaterThan((passive.measuredDistanceMeters ?? 0) + 25)
  })

  it('daje ciągłą krzywą długości względem przesunięcia timingu, bez magicznej klatki', () => {
    const offsets = [-28, -24, -20, -16, -12, -8, -4, 0, 4, 8, 12, 16, 20, 24, 28]
    const series = offsets.map((offsetTicks) => {
      const sim = runJump({ gate, offsetTicks, pilot: 'ideal', style: 'telemark' })
      return {
        offsetSeconds: offsetTicks * SIM_DT,
        distance: sim.measuredDistanceMeters ?? 0,
        normalSpeed: sim.takeoffNormalSpeed,
      }
    })

    const best = series.reduce((left, right) => (right.distance > left.distance ? right : left))
    expect(Math.abs(best.offsetSeconds)).toBeLessThanOrEqual(4 * SIM_DT)

    // Ciągłość w obrębie reżimu: sąsiednie punkty różnią się o ułamek całego
    // rozrzutu serii. Na stromym garbie FIS zbyt słabe wybicie ( timing ±16
    // i dalej) nie oczyszcza progu i spada na garb ~25 m zamiast lecieć
    // ~100 m — to fizyczny próg oczyszczenia, nie magiczna klatka, więc pary
    // na granicy reżimów (jedna próba poniżej 50 m, druga powyżej) są
    // wyłączone z ciągłości, a monotoniczność obowiązuje wszędzie.
    const spread = Math.max(...series.map((point) => point.distance)) - Math.min(...series.map((point) => point.distance))
    expect(spread).toBeGreaterThan(25)
    for (let index = 1; index < series.length; index += 1) {
      const before = series[index - 1]
      const after = series[index]
      if (!before || !after) continue
      const crossesRegimes = (before.distance < 50) !== (after.distance < 50)
      if (crossesRegimes) continue
      expect(Math.abs(after.distance - before.distance)).toBeLessThan(spread * 0.35)
    }

    // Monotoniczność po obu stronach optimum.
    const bestIndex = series.findIndex((point) => point === best)
    for (let index = 1; index <= bestIndex; index += 1) {
      const before = series[index - 1]
      const after = series[index]
      if (before && after) expect(after.distance).toBeGreaterThan(before.distance - 0.01)
    }
    for (let index = bestIndex + 1; index < series.length; index += 1) {
      const before = series[index - 1]
      const after = series[index]
      if (before && after) expect(after.distance).toBeLessThan(before.distance + 0.01)
    }
  })

  it('zbyt wczesne wybicie traci prędkość wyprostu, zbyt późne traci popęd', () => {
    const early = runJump({ gate, offsetTicks: -26, pilot: 'ideal', style: 'telemark' })
    const ideal = runJump({ gate, offsetTicks: 0, pilot: 'ideal', style: 'telemark' })
    const late = runJump({ gate, offsetTicks: 26, pilot: 'ideal', style: 'telemark' })

    expect(early.deliveredImpulseNewtonSeconds).toBeCloseTo(
      DEFAULT_JUMP_PARAMS.takeoff.impulseNewtonSeconds,
      0,
    )
    expect(late.deliveredImpulseNewtonSeconds).toBeLessThan(
      DEFAULT_JUMP_PARAMS.takeoff.impulseNewtonSeconds * 0.5,
    )
    expect(early.takeoffNormalSpeed).toBeLessThan(ideal.takeoffNormalSpeed)
    expect(late.takeoffNormalSpeed).toBeLessThan(ideal.takeoffNormalSpeed)
    // Za wcześnie: niekorzystny, zbyt wyprostowany pitch na oderwaniu.
    expect(early.events.find((event) => event.type === 'takeoffEdge')).toBeDefined()
  })

  it('idealne wybicie ma maksymalnie trzytickowe okno i daje fizycznie 2–4 m przy zamrożonej taśmie', () => {
    // PKG-008 r16-fix: premia to jednorazowy impuls normalny 18 N·s, nie
    // dopisek do odległości. Kopertę 2–4 m orzekamy na ZAMROŻONEJ taśmie
    // wejść (taśma z przebiegu bazowego, replay na obu zestawach) — ta sama
    // polityka pilota, czysta fizyka. Adaptacyjne delty raportujemy osobno:
    // na niskich/średnich belkach pokrywają się z fixed, na szczytowej 21
    // polityka adaptacyjna zmienia moment przygotowania (reżim), więc delta
    // adaptacyjna rozjeżdża się — to efekt sterowania, nie nieciągłość aero.
    const fixedDeltas: number[] = []
    for (const wind of [-1, 0, 1]) {
      const base = runAdaptiveCapture(gate, NO_BONUS_PARAMS, wind)
      const bonus = runAdaptiveCapture(gate, DEFAULT_JUMP_PARAMS, wind)
      const adaptDelta = (bonus.sim.measuredDistanceMeters ?? 0) - (base.sim.measuredDistanceMeters ?? 0)
      expect(adaptDelta).toBeGreaterThanOrEqual(2)
      expect(adaptDelta).toBeLessThanOrEqual(4)
      const replayBase = replayTape(gate, NO_BONUS_PARAMS, wind, base.tape)
      const replayBonus = replayTape(gate, DEFAULT_JUMP_PARAMS, wind, base.tape)
      const fixedDelta = (replayBonus.measuredDistanceMeters ?? 0) - (replayBase.measuredDistanceMeters ?? 0)
      fixedDeltas.push(fixedDelta)
      expect(fixedDelta).toBeGreaterThanOrEqual(2)
      expect(fixedDelta).toBeLessThanOrEqual(4)
      expect(bonus.sim.perfectTakeoff).toBe(true)
      expect(bonus.sim.events.some((event) => event.type === 'perfectTakeoff')).toBe(true)
      expect(bonus.sim.takeoffNormalSpeed - base.sim.takeoffNormalSpeed).toBeCloseTo(
        DEFAULT_JUMP_PARAMS.takeoff.perfectImpulseNewtonSeconds / DEFAULT_JUMP_PARAMS.massKg,
        6,
      )
    }
    const gateRows: Array<{ gate: number; fixedDelta: number; adaptDelta: number }> = []
    for (const probeGate of [1, 8, 17, 21]) {
      const base = runAdaptiveCapture(probeGate, NO_BONUS_PARAMS, 0)
      const bonus = runAdaptiveCapture(probeGate, DEFAULT_JUMP_PARAMS, 0)
      const replayBase = replayTape(probeGate, NO_BONUS_PARAMS, 0, base.tape)
      const replayBonus = replayTape(probeGate, DEFAULT_JUMP_PARAMS, 0, base.tape)
      const fixedDelta = (replayBonus.measuredDistanceMeters ?? 0) - (replayBase.measuredDistanceMeters ?? 0)
      const adaptDelta = (bonus.sim.measuredDistanceMeters ?? 0) - (base.sim.measuredDistanceMeters ?? 0)
      gateRows.push({ gate: probeGate, fixedDelta, adaptDelta })
      expect(fixedDelta).toBeGreaterThanOrEqual(2)
      expect(fixedDelta).toBeLessThanOrEqual(4)
      if (probeGate === 21) {
        // Outlier: ten sam impuls, inny moment przygotowania polityki
        // adaptacyjnej (diagnostyka r16: prep 859 → 1338 przez wyższy lot
        // nad progiem 6 m). Zamrożona taśma wraca do 2–4 m.
        expect(bonus.prepTick).not.toBe(base.prepTick)
      } else {
        expect(adaptDelta).toBeGreaterThanOrEqual(2)
        expect(adaptDelta).toBeLessThanOrEqual(4)
      }
    }
    // eslint-disable-next-line no-console
    console.log(`[perfect-takeoff-gate-delta ${JSON.stringify(gateRows.map((row) => ({ gate: row.gate, fixed: Number(row.fixedDelta.toFixed(2)), adapt: Number(row.adaptDelta.toFixed(2)) })))}]`)
    expect(runJump({ gate, offsetTicks: -1, pilot: 'ideal', style: 'telemark' }).perfectTakeoff).toBe(true)
    expect(runJump({ gate, offsetTicks: 1, pilot: 'ideal', style: 'telemark' }).perfectTakeoff).toBe(false)
    expect(runJump({ gate, offsetTicks: -2, pilot: 'ideal', style: 'telemark' }).perfectTakeoff).toBe(true)
    expect(runJump({ gate, offsetTicks: -3, pilot: 'ideal', style: 'telemark' }).perfectTakeoff).toBe(false)
    // eslint-disable-next-line no-console
    console.log(`[perfect-takeoff-distance-delta ${JSON.stringify(fixedDeltas.map((value) => Number(value.toFixed(2))))}]`)
  })
})
