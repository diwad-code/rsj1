import { describe, expect, it } from 'vitest'
import { CompetitionSession } from '../src/app/competitionSession'
import { buildHill } from '../src/simulation/technicalHill'
import { createWindField, WeightedWindMeasurement } from '../src/simulation/wind'
import { DEFAULT_JUMP_PARAMS } from '../src/simulation/params'
import {
  estimateSkilledDistanceMeters,
  forecastWindMean,
  hsStabilityMultiplier,
  selectSafeJuryGate,
} from '../src/sport/safety'
import { runJump, type JumpPlan } from './support/jumpHarness'

/**
 * PKG-008: automatyczna belka jury (cel 127,0 m, prognoza wielopunktowa),
 * progresywna trudność za HS (runda 15: telemark 147 m, dwie nogi 150 m,
 * pierwiastek)
 * i wczesne lądowanie (okno <1,0 s, kara 0,60/1,60). Wszystko deterministyczne,
 * zero losowości. Dane empiryczne Wisły K120/HS134: 3 konkursy indywidualne
 * 14.01.2024, 07.12.2024, 08.12.2024; N=232 lądowane skoki, min 103, mediana
 * 124,75, q75 128, q90 131, q95 132, max 139,5; 0 odnotowanych upadków;
 * rekord hill-data 144,5. Styl lądowania i prawdopodobieństwo upadku:
 * UNRESOLVED — 0 upadków w próbie NIE wyznacza krzywej prawdopodobieństwa,
 * progi są prowizoryczne i deterministyczne.
 */

const hill = buildHill()
/**
 * Historyczna baza kalibracyjna bez premii perfect (impuls 0). TYLKO do testów
 * kotwiczących przechowywane stałe kalibracji (odległość odniesienia 138,1 m,
 * wektory rundy 12/13). Własności produkcyjne (tabela AUTO, progi, wczesne
 * lądowanie) idą na DEFAULT z premią.
 */
const HISTORICAL_NO_BONUS = {
  ...DEFAULT_JUMP_PARAMS,
  takeoff: {
    ...DEFAULT_JUMP_PARAMS.takeoff,
    perfectImpulseNewtonSeconds: 0,
  },
}

function runHistoricalBaseline(plan: JumpPlan = {}) {
  return runJump({ ...plan, params: HISTORICAL_NO_BONUS })
}

function steadyWind(userMetersPerSecond: number) {
  return {
    seed: 0,
    version: 'safety-probe',
    sampleUserMetersPerSecond: () => userMetersPerSecond,
  } as unknown as ReturnType<typeof createWindField>
}

describe('PKG-008 — automatyczna bezpieczna belka jury (cel 127,0 m)', () => {
  it('fizyczna tożsamość belek po przenumerowaniu rundy 13 (stare 1..12 → nowe 10..21)', () => {
    // Runda 13 korekta #1: stara belka 1 zostaje fizycznie belką 10 (te same
    // długości rozbiegu), nowe belki 1..9 przedłużają rozstaw 0,65 m w dół.
    // Dowód tożsamości fizycznej ze zmierzonymi długościami i lotami rundy 12:
    // stara belka 1: rozbieg 87,20 m, umiejętny neutralny 129,06 m lądowany,
    // domyślny 115,54 m; stara belka 8 (baza): rozbieg 91,75 m, umiejętny
    // 138,05 m → zapis 138,1 m; szczyt 94,35 m = długość rozbiegu.
    expect(hill.gates).toHaveLength(21)
    expect(hill.gate(10).inrunLengthMeters).toBeCloseTo(87.2, 9)
    expect(hill.gate(17).inrunLengthMeters).toBeCloseTo(91.75, 9)
    expect(hill.gate(21).inrunLengthMeters).toBe(hill.spec.inrun.lengthMeters)
    expect(hill.gate(1).inrunLengthMeters).toBeCloseTo(81.35, 9)
    expect(hill.gate(1).inrunLengthMeters).toBeGreaterThan(0)
    // Ta sama fizyka z nowej numeracji: belka 10 leci jak stara belka 1,
    // belka 17 jak stara belka 8 (deterministycznie, zero losowości).
    // Wektory historyczne bez premii (kotwica odległości odniesienia 138,1 m).
    const g10skilled = runHistoricalBaseline({ gate: 10, pilot: 'ideal', style: 'telemark', prepFlightSeconds: 3.2 })
    expect(g10skilled.measuredDistanceMeters ?? 0).toBeCloseTo(129.06, 1)
    expect(g10skilled.outcome?.status).toBe('landed')
    const g17skilled = runHistoricalBaseline({ gate: 17, pilot: 'ideal', style: 'telemark', prepFlightSeconds: 3.2 })
    expect(g17skilled.measuredDistanceMeters ?? 0).toBeCloseTo(138.05, 1)
    expect(g17skilled.outcome?.status).toBe('landed')
    const g17default = runHistoricalBaseline({ gate: 17, pilot: 'ideal', style: 'telemark' })
    expect(g17default.measuredDistanceMeters ?? 0).toBeCloseTo(125.0, 0)
    // Uzupełnienie produkcyjne (r16-fix): ta sama technika z premią perfect
    // leci ~2 m dalej i ląduje — premia nie wywraca koperty referencyjnej.
    const g17prod = runJump({ gate: 17, pilot: 'ideal', style: 'telemark', prepFlightSeconds: 3.2 })
    expect(g17prod.measuredDistanceMeters ?? 0).toBeGreaterThan(138.05)
    expect(g17prod.measuredDistanceMeters ?? 0).toBeLessThan(142)
    expect(g17prod.outcome?.status).toBe('landed')
  })

  it('tabela belki dla wiatrów: runda 13 (21 belek, neutralnie 8, w dół i w górę z zapasem)', () => {
    // Runda 13 korekta #1: baza estymaty to UMIEJĘTNY lot z fizycznej belki
    // odniesienia (nowa 17 = stara 8; 138,1 m: idealny pilot, telemark,
    // późne przygotowanie 3,2 s, brak wiatru; nowa 18 = stara 9 tą techniką
    // 139,33 m > HS134). Nowe niższe belki 1..9 dają AUTO zapas w dół:
    // neutralnie belka 8 (estymata 126,7 ≤ sufit — nie podłoga), wiatr
    // w plecy podnosi zachowawczo, wiatr pod narty obniża. Sufit 127,0
    // (q50–q75 Wisły, N=232); progi rundy 15 to 147/150.
    expect(hill.spec.safety.referenceGateNumber).toBe(17)
    expect(hill.spec.safety.referenceDistanceMeters).toBe(138.1)
    expect(hill.spec.safety.safeTargetMeters).toBe(127.0)
    expect(hill.spec.compensation.referenceGateNumber).toBe(17)
    // Dokładna tabela po przenumerowaniu: neutralnie 8 (zapas w obie strony),
    // w plecy w górę zachowawczo, pod narty w dół; tylko skrajne +2 m/s
    // spada na podłogę 1 (reguła zachowawcza).
    expect(selectSafeJuryGate(hill, -2).gateNumber).toBe(16)
    expect(selectSafeJuryGate(hill, -1).gateNumber).toBe(12)
    expect(selectSafeJuryGate(hill, -0.5).gateNumber).toBe(10)
    expect(selectSafeJuryGate(hill, 0).gateNumber).toBe(8)
    expect(selectSafeJuryGate(hill, 0.5).gateNumber).toBe(6)
    expect(selectSafeJuryGate(hill, 1).gateNumber).toBe(5)
    expect(selectSafeJuryGate(hill, 2).gateNumber).toBe(2)
    // Kierunek zachowany: wiatr w plecy (−) nie obniża poniżej neutralnej,
    // wiatr pod narty (+) nie podnosi powyżej neutralnej.
    expect(selectSafeJuryGate(hill, -1).gateNumber).toBeGreaterThanOrEqual(
      selectSafeJuryGate(hill, 0).gateNumber,
    )
    expect(selectSafeJuryGate(hill, 1).gateNumber).toBeLessThanOrEqual(
      selectSafeJuryGate(hill, 0).gateNumber,
    )
    // Monotoniczność względem wiatru: silniejszy wiatr pod narty → niższa belka.
    const gates = [-2, -1, -0.5, 0, 0.5, 1, 2].map((w) => selectSafeJuryGate(hill, w).gateNumber)
    for (let i = 1; i < gates.length; i += 1) {
      expect(gates[i] ?? 99).toBeLessThanOrEqual(gates[i - 1] ?? 0)
    }
    // eslint-disable-next-line no-console
    console.log('[safe-gate-table ' + JSON.stringify(
      [-2, -1, -0.5, 0, 0.5, 1, 2].map((w) => {
        const sel = selectSafeJuryGate(hill, w)
        return { wind: w, gate: sel.gateNumber, est: Number(sel.estimatedDistanceMeters.toFixed(1)) }
      }),
    ) + ']')
  })

  it('umiejętne loty z belek AUTO poniżej HS134 (symulacja, nie zgadywanie)', () => {
    // Dowód z symulacji: ta sama umiejętna technika co baza (idealny pilot,
    // telemark, przygotowanie 3,2 s, gotowość 1), stały wiatr o średniej
    // z prognozy. Runda 13: neutralna belka 8 daje ~126 m (zapas w obie
    // strony — jury nie utyka na podłodze); każdy wiersz ląduje poniżej
    // HS134. Deterministycznie, zero losowości (powtórka tego samego dystansu).
    const winds = [-2, -1, -0.5, 0, 0.5, 1, 2]
    const rows: Array<{ wind: number; gate: number; est: number; actual: number; status: string }> = []
    for (const wind of winds) {
      const sel = selectSafeJuryGate(hill, wind)
      const sim = runJump({
        gate: sel.gateNumber,
        pilot: 'ideal',
        style: 'telemark',
        prepFlightSeconds: 3.2,
        windField: steadyWind(wind),
      })
      const actual = sim.measuredDistanceMeters ?? 0
      expect(sim.outcome?.status).toBe('landed')
      expect(actual).toBeLessThan(hill.spec.hillSizeMeters)
      expect(sim.contact?.readiness).toBe(1)
      // Cel treningowy 75% HS = 100,5 m pozostaje osiągalny także przy
      // skrajnych warunkach tabeli, a AUTO nadal trzyma umiejętny lot pod HS.
      expect(actual).toBeGreaterThanOrEqual(hill.spec.hillSizeMeters * 0.75)
      const repeat = runJump({
        gate: sel.gateNumber,
        pilot: 'ideal',
        style: 'telemark',
        prepFlightSeconds: 3.2,
        windField: steadyWind(wind),
      })
      expect(repeat.measuredDistanceMeters).toBe(sim.measuredDistanceMeters)
      expect(repeat.outcome?.status).toBe('landed')
      rows.push({
        wind,
        gate: sel.gateNumber,
        est: Number(sel.estimatedDistanceMeters.toFixed(1)),
        actual: Number(actual.toFixed(1)),
        status: sim.outcome?.status ?? '?',
      })
    }
    // Kotwica neutralna z premią perfect (produkcja r16-fix): AUTO 8 daje
    // ~128,4 m (estymata 126,7 + ~1,7 m impulsu) — nadal poniżej HS134
    // i wyraźnie ponad osiągalnym celem 75% HS.
    const neutral = rows.find((r) => r.wind === 0)
    expect(neutral?.gate).toBe(8)
    expect(neutral?.actual ?? 0).toBeGreaterThanOrEqual(127)
    expect(neutral?.actual ?? 999).toBeLessThanOrEqual(130)
    // eslint-disable-next-line no-console
    console.log('[skilled-auto-table ' + JSON.stringify(rows) + ']')
  })

  it('deterministyczna prognoza wielopunktowa (okno 0–5 s, nie pojedyncza próbka t=0)', () => {
    const first = selectSafeJuryGate(hill, forecastWindMean(createWindField(777), hill))
    const second = selectSafeJuryGate(hill, forecastWindMean(createWindField(777), hill))
    expect(second).toEqual(first)

    // Pole liniowe w czasie: średnia przestrzenna w chwili t to t, więc prognoza
    // z okna 0–5 co 0,5 s wynosi 2,5 — a nie 0 z pojedynczej próbki t=0.
    const ramp = {
      seed: 1,
      version: 'ramp-probe',
      sampleUserMetersPerSecond: (t: number) => t,
    } as unknown as ReturnType<typeof createWindField>
    expect(forecastWindMean(ramp, hill)).toBeCloseTo(2.5, 9)
    // Ręczna średnia tego samego okna i tych samych czujników.
    const manual = new WeightedWindMeasurement(hill.spec.windMeasurement.sensors)
    for (let t = 0; t <= 5.0001; t += 0.5) manual.observe(ramp, t)
    expect(forecastWindMean(ramp, hill)).toBeCloseTo(
      manual.result()?.meanUserMetersPerSecond ?? NaN, 12,
    )
  })

  it('estymata używa czynników kompensacyjnych przez wartość metra', () => {
    // Belka 18 vs 17 (fizycznie stare 9 vs 8): +0,65 m rozbiegu
    // × 35 dziesiątych / 18 (K120) ≈ +1,26 m.
    const at17 = estimateSkilledDistanceMeters(hill, 17, 0)
    const at18 = estimateSkilledDistanceMeters(hill, 18, 0)
    expect(at17).toBeCloseTo(hill.spec.safety.referenceDistanceMeters, 9)
    expect(at18 - at17).toBeCloseTo((0.65 * 35) / 18, 6)
  })

  it('człowiek skacze z wybranej belki tym samym polem (seed/wersja/instancja)', () => {
    const session = new CompetitionSession(hill, 1, 'normal')
    expect(session.acceptHandover(false)).toBe(true)
    const ceiling = session.safeGateCeiling
    const identity = session.currentWindIdentity
    expect(identity).not.toBeNull()
    session.advanceStart()
    session.advanceStart()
    expect(session.startHumanJump()).toBe(true)
    const jump = session.jump
    if (!jump || !identity) throw new Error('brak skoku')
    expect(session.snapshot().juryGateNumber).toBe(ceiling)
    expect(jump.windField?.seed).toBe(identity.seed)
    expect(jump.windField?.version).toBe(identity.version)
    expect(jump.windField).toBe(
      (session as unknown as { currentWindField: unknown }).currentWindField,
    )
  })

  it('bot leci wybraną belką tym samym polem (seed/wersja w wyniku)', () => {
    const session = new CompetitionSession(hill, 1, 'normal')
    // Pierwszy człowiek wycofany administracyjnie → kolejny slot to bot.
    expect(session.acceptHandover(false)).toBe(true)
    session.requestHumanWithdrawal()
    session.confirmHumanWithdrawal()
    session.continueAfterResult(false)
    // Przewijamy boty, aż activeEntrant będzie botem w widoku 'bots'.
    let guard = 0
    while (session.view !== 'bots' && guard < 10) {
      session.continueAfterResult(false)
      guard += 1
    }
    expect(session.view).toBe('bots')
    const ceiling = session.safeGateCeiling
    const identity = session.currentWindIdentity
    expect(identity).not.toBeNull()
    const juryBefore = session.snapshot().juryGateNumber
    expect(juryBefore).toBe(ceiling)
    const before = session.lastResult
    for (let i = 0; i < 200 && session.lastResult === before; i += 1) {
      if (session.view !== 'bots') break
      session.advanceBotChunk()
    }
    const result = session.lastResult
    if (!result || !identity) throw new Error('brak wyniku bota')
    expect(result.gate.juryGateNumber).toBe(ceiling)
    expect(result.wind.seed).toBe(identity.seed)
    expect(result.wind.version).toBe(identity.version)
  })
})

describe('PKG-008 — trudność lądowania za HS (runda 15: progi 147/150, pierwiastek)', () => {
  it('progi przesunięte dokładnie o +5 m, telemark wcześniej niż dwie nogi, na/przed HS bez zmian', () => {
    const safety = hill.spec.safety
    expect(safety.telemarkImpossibleMeters).toBe(147)
    expect(safety.parallelImpossibleMeters).toBe(150)
    expect(safety.telemarkImpossibleMeters - 142).toBe(5)
    expect(safety.parallelImpossibleMeters - 145).toBe(5)
    expect(safety.telemarkImpossibleMeters).toBeGreaterThan(hill.spec.hillSizeMeters)
    expect(safety.parallelImpossibleMeters).toBeGreaterThan(safety.telemarkImpossibleMeters)
    expect(hsStabilityMultiplier(hill, 'telemark', 120)).toBe(1)
    expect(hsStabilityMultiplier(hill, 'telemark', hill.spec.hillSizeMeters)).toBe(1)
    expect(hsStabilityMultiplier(hill, 'parallel', hill.spec.hillSizeMeters)).toBe(1)
    // Ciągłość w HS i pierwiastek: 134,5 → sqrt(12,5/13) i sqrt(15,5/16).
    expect(hsStabilityMultiplier(hill, 'telemark', 134.5)).toBeCloseTo(Math.sqrt(12.5 / 13), 9)
    expect(hsStabilityMultiplier(hill, 'parallel', 134.5)).toBeCloseTo(Math.sqrt(15.5 / 16), 9)
    // Monotoniczność za HS i porządek stylów (telemark trudniejszy).
    let prevTele = 1
    let prevPara = 1
    for (const d of [135, 137, 139.5, 141, 142, 144.5, 147, 148, 150, 155]) {
      const tele = hsStabilityMultiplier(hill, 'telemark', d)
      const para = hsStabilityMultiplier(hill, 'parallel', d)
      expect(tele).toBeLessThanOrEqual(prevTele)
      expect(para).toBeLessThanOrEqual(prevPara)
      if (d > hill.spec.hillSizeMeters && d < safety.parallelImpossibleMeters) {
        expect(tele).toBeLessThanOrEqual(para)
      }
      prevTele = tele
      prevPara = para
    }
  })

  it('rekord 144,5 m ma dodatni margines, a nowe progi mają deterministyczne zero', () => {
    // Oficjalny rekord hill-data pozostaje możliwy dla obu stylów.
    expect(hsStabilityMultiplier(hill, 'telemark', 144.5)).toBeCloseTo(Math.sqrt(2.5 / 13), 9)
    expect(hsStabilityMultiplier(hill, 'parallel', 144.5)).toBeCloseTo(Math.sqrt(5.5 / 16), 9)
    expect(hsStabilityMultiplier(hill, 'telemark', 144.5)).toBeGreaterThan(0)
    expect(hsStabilityMultiplier(hill, 'parallel', 144.5)).toBeGreaterThan(0)
    expect(hsStabilityMultiplier(hill, 'telemark', 141)).toBeLessThan(
      hsStabilityMultiplier(hill, 'parallel', 141),
    )
    // Tuż poniżej / na / powyżej nowego progu telemarku 147 m.
    expect(hsStabilityMultiplier(hill, 'telemark', 146.9)).toBeGreaterThan(0)
    expect(hsStabilityMultiplier(hill, 'telemark', 147)).toBe(0)
    expect(hsStabilityMultiplier(hill, 'telemark', 160)).toBe(0)
    expect(hsStabilityMultiplier(hill, 'parallel', 147)).toBeCloseTo(Math.sqrt(3 / 16), 9)
    expect(hsStabilityMultiplier(hill, 'parallel', 150)).toBe(0)
  })

  it('rzeczywisty skok 140–142 przy idealnym przygotowaniu jest ustany (okolica max 139,5)', () => {
    // Czysta funkcja: progi 147/150, pierwiastek, telemark trudniejszy.
    expect(hsStabilityMultiplier(hill, 'telemark', 139.5)).toBeCloseTo(Math.sqrt(7.5 / 13), 9)
    expect(hsStabilityMultiplier(hill, 'parallel', 139.5)).toBeCloseTo(Math.sqrt(10.5 / 16), 9)
    expect(hsStabilityMultiplier(hill, 'telemark', 139.5)).toBeGreaterThan(0)
    expect(hsStabilityMultiplier(hill, 'telemark', 139.5)).toBeLessThan(
      hsStabilityMultiplier(hill, 'parallel', 139.5),
    )
    // Dowód z symulacji, nie z mnożenia bazy: stała belka 18 (= stara 9),
    // brak wiatru, pilot ideal, wybicie idealne z premią (produkcja r16-fix),
    // telemark późny (3,2 s, gotowość 1, nie-wczesny). Deterministycznie,
    // zero losowości. Premia przesuwa pomiar ~139,3 → ~141,2; mnożnik i ustanie
    // bez zmian (progi 147/150 nienaruszone).
    const sim = runJump({ gate: 18, pilot: 'ideal', style: 'telemark', prepFlightSeconds: 3.2 })
    const distance = sim.measuredDistanceMeters ?? 0
    expect(distance).toBeGreaterThanOrEqual(140)
    expect(distance).toBeLessThanOrEqual(142)
    expect(sim.contact?.readiness).toBe(1)
    expect(sim.landingStyle).toBe('telemark')
    expect(sim.outcome?.style).toBe('telemark')
    expect(sim.landingApproachEarly).toBe(false)
    expect(sim.earlyTelemarkFallback).toBe(false)
    expect(sim.contact?.hsStabilityMultiplier ?? 0).toBeGreaterThan(0)
    expect(sim.outcome?.status).toBe('landed')
    // Premia wydłuża lot do ~141,2 m, więc ten sam kontakt ląduje twardziej
    // niż kalibracyjne ~139,3 m bez premii (jedna dłoń zamiast czysto).
    // Ustanie i dodatni margines HS bez zmian; progi upadku nienaruszone.
    expect(sim.outcome?.supportHands).toBeLessThanOrEqual(1)
    const repeat = runJump({ gate: 18, pilot: 'ideal', style: 'telemark', prepFlightSeconds: 3.2 })
    expect(repeat.measuredDistanceMeters).toBe(sim.measuredDistanceMeters)
    expect(repeat.outcome?.status).toBe('landed')
    // 0 upadków w N=232 NIE wyznacza krzywej prawdopodobieństwa.
    // eslint-disable-next-line no-console
    console.log('[near-max-jump ' + JSON.stringify({
      distance: Number(distance.toFixed(2)),
      status: sim.outcome?.status,
      style: sim.outcome?.style,
      readiness: sim.contact?.readiness,
      mult: Number((sim.contact?.hsStabilityMultiplier ?? 0).toFixed(4)),
      stability: Number((sim.contact?.stability ?? 0).toFixed(4)),
    }) + ']')
  })

  it('rzeczywisty skok w starym zakazanym, a nowym dozwolonym oknie jest możliwy do ustania', () => {
    // Belka 21, idealny pilot, późny telemark: około 144,8 m z premią
    // (wcześniej ~143,1 bez premii). Poprzedni próg
    // telemarku 142 m zerował mnożnik; nowy 147 m pozostawia dodatni margines.
    const sim = runJump({ gate: 21, pilot: 'ideal', style: 'telemark', prepFlightSeconds: 3.2 })
    const distance = sim.measuredDistanceMeters ?? 0
    expect(distance).toBeGreaterThan(142)
    expect(distance).toBeLessThan(147)
    expect(sim.contact?.readiness).toBe(1)
    expect(sim.contact?.hsStabilityMultiplier ?? 0).toBeGreaterThan(0)
    expect(sim.outcome?.status).toBe('landed')
    const repeat = runJump({ gate: 21, pilot: 'ideal', style: 'telemark', prepFlightSeconds: 3.2 })
    expect(repeat.measuredDistanceMeters).toBe(sim.measuredDistanceMeters)
    expect(repeat.outcome).toEqual(sim.outcome)
  })

  it('loty za progami padają deterministycznie mimo pełnej gotowości', () => {
    // Szczyt rozbiegu (belka 21 = stara 12) z wiatrem +2 m/s.
    const tele = runJump({ gate: 21, pilot: 'ideal', style: 'telemark', windField: steadyWind(2) })
    const para = runJump({ gate: 21, pilot: 'ideal', style: 'parallel', windField: steadyWind(2) })
    expect(tele.measuredDistanceMeters ?? 0).toBeGreaterThan(hill.spec.hillSizeMeters)
    expect(tele.contact?.readiness).toBe(1)
    expect(para.contact?.readiness).toBe(1)
    // 154,9 m leży za oboma nowymi progami (147/150), więc oba mnożniki to 0.
    expect(tele.contact?.hsStabilityMultiplier).toBe(0)
    expect(para.contact?.hsStabilityMultiplier).toBe(0)
    expect(tele.outcome?.status).toBe('fall')
    expect(para.outcome?.status).toBe('fall')
    // Ten sam dystans deterministycznie.
    const repeat = runJump({ gate: 21, pilot: 'ideal', style: 'telemark', windField: steadyWind(2) })
    expect(repeat.measuredDistanceMeters).toBe(tele.measuredDistanceMeters)
    expect(repeat.outcome?.status).toBe('fall')
    // Różnicę stylów w oknie (140 m) sprawdza czysta funkcja powyżej.
    expect(hsStabilityMultiplier(hill, 'telemark', 140)).toBeLessThan(
      hsStabilityMultiplier(hill, 'parallel', 140),
    )
    // eslint-disable-next-line no-console
    console.log('[hs-landing-table ' + JSON.stringify({
      tele: Number((tele.measuredDistanceMeters ?? 0).toFixed(1)),
      teleMult: tele.contact?.hsStabilityMultiplier,
      teleStatus: tele.outcome?.status,
      para: Number((para.measuredDistanceMeters ?? 0).toFixed(1)),
      paraMult: para.contact?.hsStabilityMultiplier,
      paraStatus: para.outcome?.status,
    }) + ']')
  })

  it('przed HS normalny lot bez zmian (belka 17 = stara 8, mnożnik 1)', () => {
    expect(DEFAULT_JUMP_PARAMS.physicsVersion).toBe('pkg008-tune-9')
    // Produkcja z premią: ~127,2 m (wcześniej ~125 bez premii); mnożnik 1.
    const sim = runJump({ gate: 17, pilot: 'ideal', style: 'telemark' })
    expect(sim.measuredDistanceMeters ?? 0).toBeGreaterThan(125)
    expect(sim.measuredDistanceMeters ?? 0).toBeLessThan(129)
    expect(sim.contact?.hsStabilityMultiplier).toBe(1)
    expect(sim.outcome?.status).toBe('landed')
  })
})

describe('PKG-008 — wczesne lądowanie skraca lot (okno <1,0 s)', () => {
  it('natychmiastowe i tuż-po-progu T/R kończy ≥15 m krócej i ≤110 m; wczesne T to dwie nogi albo upadek, nigdy telemark', () => {
    // Fizyczna belka odniesienia (17 = stara 8).
    const normalTele = runJump({ gate: 17, pilot: 'ideal', style: 'telemark' })
    const normalDist = normalTele.measuredDistanceMeters ?? 0
    const earlyTele = runJump({ gate: 17, pilot: 'ideal', style: 'telemark', prepFlightSeconds: 0 })
    const earlyPara = runJump({ gate: 17, pilot: 'ideal', style: 'parallel', prepFlightSeconds: 0 })
    const earlyTeleDist = earlyTele.measuredDistanceMeters ?? 0
    const earlyParaDist = earlyPara.measuredDistanceMeters ?? 0
    expect(normalDist - earlyTeleDist).toBeGreaterThanOrEqual(15)
    expect(normalDist - earlyParaDist).toBeGreaterThanOrEqual(15)
    // Nie dalej niż K−10 m (K120 → 110 m) — żaden exploit zasięgu.
    expect(earlyTeleDist).toBeLessThanOrEqual(hill.spec.kPointMeters - 10)
    expect(earlyParaDist).toBeLessThanOrEqual(hill.spec.kPointMeters - 10)
    // Tuż po progu (0,5 s) wciąż w oknie wczesnym: znacząco krócej i ≤110 m.
    const justAfter = runJump({ gate: 17, pilot: 'ideal', style: 'telemark', prepFlightSeconds: 0.5 })
    const justAfterDist = justAfter.measuredDistanceMeters ?? 0
    expect(justAfter.landingApproachEarly).toBe(true)
    expect(normalDist - justAfterDist).toBeGreaterThanOrEqual(15)
    expect(justAfterDist).toBeLessThanOrEqual(hill.spec.kPointMeters - 10)
    expect(['parallel', 'fall']).toContain(earlyTele.outcome?.style ?? earlyTele.landingStyle)
    expect(earlyTele.outcome?.style).not.toBe('telemark')
    expect(earlyTele.landingStyle).toBe('parallel')
    expect(earlyPara.landingStyle).toBe('parallel')
    expect(earlyTele.events.some((e) => e.detail.includes('wczesny'))).toBe(true)
    // Determinizm bez ukrytej kości.
    const repeat = runJump({ gate: 17, pilot: 'ideal', style: 'telemark', prepFlightSeconds: 0 })
    expect(repeat.measuredDistanceMeters).toBe(earlyTele.measuredDistanceMeters)
    expect(repeat.outcome?.status).toBe(earlyTele.outcome?.status)
    // eslint-disable-next-line no-console
    console.log('[early-prep-delta ' + JSON.stringify({
      normal: Number(normalDist.toFixed(1)),
      earlyTele: Number(earlyTeleDist.toFixed(1)),
      earlyPara: Number(earlyParaDist.toFixed(1)),
      deltaTele: Number((normalDist - earlyTeleDist).toFixed(1)),
      justAfter: Number(justAfterDist.toFixed(1)),
    }) + ']')
  })

  it('późne T wciąż daje telemark (zatrzask tylko dla wczesnych)', () => {
    const late = runJump({ gate: 17, pilot: 'ideal', style: 'telemark', prepFlightSeconds: 3.0 })
    expect(late.landingStyle).toBe('telemark')
    expect(late.earlyTelemarkFallback).toBe(false)
    expect(late.landingApproachEarly).toBe(false)
  })
})
