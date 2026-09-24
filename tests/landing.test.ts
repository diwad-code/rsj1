import { describe, expect, it } from 'vitest'
import { JumpSimulation, SIM_DT } from '../src/simulation/jump'
import { DEFAULT_JUMP_PARAMS } from '../src/simulation/params'
import { buildHill } from '../src/simulation/technicalHill'
import { EMPTY_INPUT, edgeTickFor, makeInput, runJump } from './support/jumpHarness'

const hill = buildHill()

describe('P08 — przygotowanie lądowania', () => {
  it('T i R rozpoczynają różne przygotowania na krótkiej i długiej próbie', () => {
    const attempts = [
      { label: 'długa', gate: 12, offsetTicks: 0 },
      // +8 ticków (spóźnione wybicie) daje na stromym garbie FIS krótki,
      // ale lotny skok ~102 m; dawne +20 nie odrywa się od garbu (23 m).
      { label: 'krótka', gate: 1, offsetTicks: 8 },
    ]

    for (const attempt of attempts) {
      const telemark = runJump({ ...attempt, pilot: 'ideal', style: 'telemark' })
      const parallel = runJump({ ...attempt, pilot: 'ideal', style: 'parallel' })

      expect(telemark.landingStyle).toBe('telemark')
      expect(parallel.landingStyle).toBe('parallel')
      expect(telemark.outcome?.status).toBe('landed')
      expect(parallel.outcome?.status).toBe('landed')
      // Sterowanie po kontakcie nie zmienia zmierzonej odległości.
      expect(telemark.measuredDistanceMeters).toBeCloseTo(parallel.measuredDistanceMeters ?? 0, 6)
      // Dwie nogi łatwiej amortyzują ten sam kontakt niż telemark.
      expect(parallel.contact?.stability ?? 0).toBeGreaterThan(telemark.contact?.stability ?? 0)
    }
  })

  it('przy T i R w tym samym ticku wygrywa R', () => {
    const sim = runJump({ gate: 8, pilot: 'ideal', style: 'telemark', pressBothLandingKeys: true })
    expect(sim.landingStyle).toBe('parallel')
    expect(sim.outcome?.style).toBe('parallel')
  })

  it('zmiana wariantu nie resetuje czasu przygotowania', () => {
    const sim = new JumpSimulation({ gateNumber: 8, autoStart: true })
    // PKG-008: okno wczesne to <1,0 s lotu, więc lecimy z idealnym wybiciem
    // (długi lot ~4,7 s) i czekamy 1,25 s (150 ticków), żeby późne T nie
    // wpadało w awaryjne dwie nogi. Pasywny lot bez wybicia trwa <0,9 s
    // i nie nadaje się do testu późnego przygotowania.
    const takeoffTick = edgeTickFor(8, DEFAULT_JUMP_PARAMS)
      - Math.round(DEFAULT_JUMP_PARAMS.takeoff.idealLeadSeconds / SIM_DT)
    while (sim.phase !== 'Flight') {
      if (sim.tick === takeoffTick) sim.step(makeInput(['takeoff']))
      else sim.step(EMPTY_INPUT)
    }
    for (let i = 0; i < 150; i += 1) sim.step(EMPTY_INPUT)

    sim.step(makeInput(['telemark']))
    for (let i = 0; i < 24; i += 1) sim.step(EMPTY_INPUT)
    const elapsedBefore = sim.landingPrepSeconds
    expect(elapsedBefore).toBeGreaterThan(0.15)

    sim.step(makeInput(['parallel']))
    expect(sim.landingStyle).toBe('parallel')
    expect(sim.landingPrepSeconds).toBeGreaterThanOrEqual(elapsedBefore)

    // Powrót do telemarku zachowuje czas, ale wymaga go więcej — nie odtwarza
    // natychmiast pełnego telemarku.
    sim.step(makeInput(['telemark']))
    expect(sim.landingStyle).toBe('telemark')
    expect(DEFAULT_JUMP_PARAMS.landing.telemarkPrepSeconds).toBeGreaterThan(
      DEFAULT_JUMP_PARAMS.landing.parallelPrepSeconds,
    )
  })

  it('brak przygotowania prowadzi do deterministycznego upadku', () => {
    const first = runJump({ gate: 8, pilot: 'ideal', style: null })
    const second = runJump({ gate: 8, pilot: 'ideal', style: null })

    expect(first.contact?.style).toBe('none')
    expect(first.contact?.readiness).toBe(0)
    expect(first.outcome?.status).toBe('fall')
    expect(first.outcome?.terminalPhase).toBe('FallSettled')
    // Ten sam stan wejściowy daje ten sam wynik — bez losowego upadku.
    expect(second.measuredDistanceMeters).toBe(first.measuredDistanceMeters)
    expect(second.outcome).toEqual(first.outcome)
  })

  it('spóźnione przygotowanie zostawia zbyt duży kąt nart do stoku', () => {
    const onTime = runJump({ gate: 8, pilot: 'ideal', style: 'telemark', prepHeightMeters: 12 })
    const late = runJump({ gate: 8, pilot: 'ideal', style: 'telemark', prepHeightMeters: 1.2 })

    expect(onTime.outcome?.status).toBe('landed')
    expect(late.contact?.angleErrorDeg ?? 0).toBeGreaterThan(onTime.contact?.angleErrorDeg ?? 0)
    expect(late.contact?.stability ?? 1).toBeLessThan(onTime.contact?.stability ?? 0)
  })

  it('zbyt wczesne podejście kończy się deterministyczną podpórką', () => {
    const veryEarly = runJump({ gate: 8, pilot: 'ideal', style: 'telemark', prepFlightSeconds: 0 })
    const early = runJump({ gate: 8, pilot: 'ideal', style: 'telemark', prepFlightSeconds: 0.5 })

    expect(veryEarly.outcome?.status).toBe('landed')
    expect(veryEarly.outcome?.supportHands).toBe(2)
    expect(early.outcome?.status).toBe('landed')
    expect(early.outcome?.supportHands).toBe(1)
    expect(veryEarly.events.some((event) => event.type === 'handSupport' && event.detail.includes('obie'))).toBe(true)
    expect(early.events.some((event) => event.type === 'handSupport' && event.detail.includes('jedna'))).toBe(true)
  })

  it('spóźnione przygotowanie przechodzi przez jedną i obie dłonie przed upadkiem', () => {
    // Fizyczna belka kalibracji (nowa 10 = stara 1), produkcyjna fizyka
    // z premią perfect: dłuższy lot spóźnia względny moment progu, więc próg
    // jednej dłoni leży przy 1,7 m (zmierzone: gotowość 0,89, stabilność
    // 0,35), a nie przy 1,5 m jak w kalibracji bez premii. Progi mechaniki
    // bez zmian — dobrano wejścia ćwiczące to samo pasmo.
    const oneHand = runJump({ gate: 10, pilot: 'ideal', style: 'telemark', prepHeightMeters: 1.7 })
    const twoHands = runJump({ gate: 10, pilot: 'ideal', style: 'telemark', prepHeightMeters: 1.2 })
    const repeated = runJump({ gate: 10, pilot: 'ideal', style: 'telemark', prepHeightMeters: 1.2 })

    expect(oneHand.contact?.readiness ?? 1).toBeLessThan(0.9)
    expect(oneHand.outcome?.supportHands).toBe(1)
    expect(twoHands.contact?.stability ?? 1).toBeLessThan(oneHand.contact?.stability ?? 0)
    expect(twoHands.outcome?.supportHands).toBe(2)
    expect(repeated.outcome).toEqual(twoHands.outcome)
  })
})

describe('P08 — kontakt i pomiar', () => {
  it('mierzy odległość dokładnie raz', () => {
    for (const plan of [
      { gate: 8, pilot: 'ideal' as const, style: 'telemark' as const },
      { gate: 8, pilot: 'none' as const, style: null },
      { gate: 1, pilot: 'over' as const, style: 'parallel' as const },
    ]) {
      const sim = runJump(plan)
      expect(sim.events.filter((event) => event.type === 'measured')).toHaveLength(1)
      expect(sim.events.filter((event) => event.type === 'contact')).toHaveLength(1)
      expect(sim.measuredDistanceMeters).not.toBeNull()
    }
  })

  it('odczytuje odległość z tej samej mapy, co punkty K i HS', () => {
    const sim = runJump({ gate: 8, pilot: 'ideal', style: 'telemark' })
    const measured = sim.measuredDistanceMeters ?? 0
    const contactPoint = sim.contact?.point
    expect(contactPoint).toBeDefined()
    if (!contactPoint) return
    expect(hill.surfaceDistanceAtPoint(contactPoint)).toBeCloseTo(measured, 2)
    expect(measured).toBeGreaterThan(hill.spec.pPointMeters)
  })

  it('wykrywa kontakt przy dużej prędkości bez przenikania stoku', () => {
    const sim = new JumpSimulation({ gateNumber: 12, autoStart: true })
    let deepestPenetration = 0
    while (!sim.finished) {
      sim.step(EMPTY_INPUT)
      if (sim.phase === 'Flight' || sim.phase === 'LandingPrep') {
        deepestPenetration = Math.min(deepestPenetration, sim.heightAboveSurface())
      }
    }
    expect(deepestPenetration).toBeGreaterThan(-0.01)
    expect(sim.contact?.normalSpeed ?? 0).toBeGreaterThan(0)
  })
})

describe('P08 — odjazd, upadek i stan terminalny', () => {
  it('ustany odjazd trwa do fall line', () => {
    const sim = runJump({ gate: 8, pilot: 'ideal', style: 'parallel' })
    expect(sim.outcome?.status).toBe('landed')
    expect(sim.outcome?.terminalPhase).toBe('FinishLine')
    expect(sim.outcome?.reachedFallLine).toBe(true)
    expect(sim.surfaceDistanceMeters).toBeGreaterThanOrEqual(hill.spec.fallLineMeters)
    expect(sim.events.some((event) => event.type === 'finishLine')).toBe(true)
  })

  it('upadek kończy się FallSettled wysoko przed fall line', () => {
    const sim = runJump({ gate: 8, pilot: 'ideal', style: null })
    expect(sim.outcome?.terminalPhase).toBe('FallSettled')
    expect(sim.outcome?.reachedFallLine).toBe(false)
    expect(sim.surfaceDistanceMeters).toBeLessThan(hill.spec.fallLineMeters)
    const settled = sim.events.find((event) => event.type === 'fallSettled')
    expect(settled?.detail).toContain('przed fall line')
  })

  it('rozlicza upadek najpóźniej po kontrolowanym limicie czasu', () => {
    const sim = runJump({ gate: 8, pilot: 'ideal', style: null })
    const fall = sim.events.find((event) => event.type === 'fall')
    const settled = sim.events.find((event) => event.type === 'fallSettled')
    expect(fall && settled).toBeTruthy()
    if (!fall || !settled) return
    const seconds = (settled.tick - fall.tick) / 120
    expect(seconds).toBeLessThanOrEqual(DEFAULT_JUMP_PARAMS.fall.maxDurationSeconds + 1e-6)
  })

  it('każda ścieżka osiąga stan terminalny i przestaje reagować na wejście', () => {
    const plans = [
      { gate: 12, pilot: 'ideal' as const, style: 'telemark' as const },
      { gate: 12, pilot: 'over' as const, style: 'parallel' as const },
      { gate: 1, pilot: 'none' as const, style: 'telemark' as const },
      { gate: 1, noTakeoff: true, pilot: 'ideal' as const, style: 'parallel' as const },
      { gate: 8, pilot: 'back' as const, style: null },
    ]

    for (const plan of plans) {
      const sim = runJump(plan)
      expect(sim.finished).toBe(true)
      expect(['FinishLine', 'FallSettled']).toContain(sim.phase)
      expect(sim.outcome).not.toBeNull()

      const snapshot = { tick: sim.tick, distance: sim.measuredDistanceMeters, outcome: sim.outcome }
      sim.step(makeInput(['takeoff', 'telemark', 'parallel'], ['left']))
      expect(sim.tick).toBe(snapshot.tick)
      expect(sim.measuredDistanceMeters).toBe(snapshot.distance)
      expect(sim.outcome).toEqual(snapshot.outcome)
    }
  })

  it('maksymalna belka na najkrótszej dostępnej próbie nie generuje NaN ani wyjścia poza zakres', () => {
    const sim = runJump({ gate: 12, pilot: 'over', style: 'parallel' })
    expect(sim.finished).toBe(true)
    expect(Number.isFinite(sim.surfaceDistanceMeters)).toBe(true)
    expect(sim.surfaceDistanceMeters).toBeLessThanOrEqual(hill.spec.outrunEndMeters)
    expect(sim.measuredDistanceMeters ?? 0).toBeGreaterThan(0)
    expect(sim.measuredDistanceMeters ?? 0).toBeLessThan(hill.spec.outrunEndMeters)
  })
})

describe('P08 — twardy kontakt i różnica obu lądowań', () => {
  it('ekstremalnie daleki lot za progami pada w obu stylach (telemark pada wcześniej)', () => {
    // Alternatywny zestaw TUNE o większej nośności: skok przekracza punkt U i
    // ląduje na wypłaszczeniu (~173 m), gdzie prędkość normalna gwałtownie rośnie.
    // Przygotowanie jest pełne, a narty ustawione zgodnie ze stokiem.
    // (Po przebudowie krzywej CL/CD na garb FIS zestaw wymaga większej
    // powierzchni i mniejszego oporu, żeby dolecieć za U.)
    // PKG-008 runda 15: 173 m leży za progiem telemarku (147 m)
    // i dwóch nóg (150 m), więc progresywny mnożnik za HS kładzie oba style —
    // samą prędkością normalną pada telemark (0,18), dwie nogi trzymały się
    // na 0,345. Różnicę telemark/dwie nogi w oknie za HS pokrywa test
    // bezpieczeństwa (140 m: telemark ×~0,50, dwie nogi ×~0,67).
    const params = {
      ...DEFAULT_JUMP_PARAMS,
      physicsVersion: 'pkg008-tune-3/high-lift-probe',
      flight: { ...DEFAULT_JUMP_PARAMS.flight, referenceAreaSquareMeters: 1.08, dragScale: 0.85 },
    }

    // Szczyt rozbiegu (nowa 21 = stara 12).
    const telemark = runJump({ gate: 21, params, pilot: 'ideal', style: 'telemark' })
    const parallel = runJump({ gate: 21, params, pilot: 'ideal', style: 'parallel' })

    for (const sim of [telemark, parallel]) {
      expect(sim.contact?.readiness).toBe(1)
      // Nowa tabela CL/CD ustawia narty minimalnie inaczej na wypłaszczeniu
      // (2,2° zamiast <2°); rozstrzyga i tak prędkość normalna, nie kąt.
      expect(sim.contact?.angleErrorDeg ?? 99).toBeLessThan(2.5)
      expect(sim.measuredDistanceMeters ?? 0).toBeGreaterThan(hill.spec.uPointMeters)
      expect(sim.contact?.normalSpeed ?? 0).toBeGreaterThan(params.landing.telemarkMaxNormalSpeed)
    }

    expect(telemark.contact?.hsStabilityMultiplier).toBe(0)
    expect(parallel.contact?.hsStabilityMultiplier).toBe(0)
    expect(telemark.outcome?.status).toBe('fall')
    expect(telemark.outcome?.terminalPhase).toBe('FallSettled')
    expect(parallel.outcome?.status).toBe('fall')
  })
})
