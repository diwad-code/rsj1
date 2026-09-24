/**
 * PKG-008 / P42 runda 11 — audyt formatowania KAŻDEGO widoku (zadanie F).
 *
 * Zrzuty bazowe (przed poprawkami) i końcowe (po poprawkach) tego samego
 * kompletu widoków: R11_STAGE=base|final (domyślnie base). Pliki trafiają
 * od razu do docs/evidence/PKG-008/browser-artifacts/.
 *
 * Spec zbiera wyłącznie materiał dowodowy; zachowanie gry sprawdzają
 * jump.spec.ts / competition.spec.ts / persistence.spec.ts.
 */

import { expect, test, type Page } from '@playwright/test'
import { resolve } from 'node:path'
import { edgeTickFor } from '../support/jumpHarness'

const STAGE = process.env.R11_STAGE === 'final' ? 'final' : 'base'
const OUT_DIR = resolve('docs/evidence/PKG-008/browser-artifacts')
const OVERLOAD_REASON = 'zbyt długa przerwa klatki'

const shot = (view: string): string => `${OUT_DIR}\\pkg008-r11-${STAGE}-${view}-960x540.png`
const shotLarge = (view: string): string => `${OUT_DIR}\\pkg008-r11-${STAGE}-${view}-1920x1080.png`

type JumpDebug = {
  phase: string
  tick: number
  gate: number
  speedKmh: number
  heightAboveSurface: number
  distance: number | null
  status: string | null
  terminalPhase: string | null
  events: string[]
} | null

type CompetitionDebug = {
  view: 'handover' | 'start' | 'jump' | 'bots' | 'result' | 'round-summary' | 'withdraw-confirm' | 'finished'
  status: string
  roundId: 'qualification' | 'first' | 'final'
  roundLabel: string
  nextStartIndex: number
  roundSize: number
  currentParticipantName: string | null
  handoverReady: boolean
  startPhase: 'red' | 'yellow' | 'green' | null
  coachPanelOpen: boolean
  coachDecision: string
  juryGateNumber: number
  actualGateNumber: number
  lastResult: { participantId: string; distanceHalfMeters: number; totalTenths: number } | null
  standings: Array<{ participantId: string; rank: number | null; totalTenths: number | null; status: string }>
  jump: JumpDebug
}

type Snapshot = {
  screen: string
  paused: boolean
  pauseReason: string
  menuSelection: 'training' | 'competition' | 'replay'
  jump: JumpDebug
  competition: CompetitionDebug | null
}

function snapshot(page: Page): Promise<Snapshot> {
  return page.evaluate(() => (
    window as unknown as { __retroDebugSnapshot: () => Snapshot }
  ).__retroDebugSnapshot())
}

async function resumeIfOverloaded(page: Page): Promise<void> {
  const state = await snapshot(page)
  if (!state.paused) return
  if (state.pauseReason !== '' && state.pauseReason !== OVERLOAD_REASON) {
    expect(state.pauseReason).toBe(OVERLOAD_REASON)
    return
  }
  await page.keyboard.press('Enter')
  await page.waitForTimeout(16)
}

async function waitForJump(page: Page, predicate: string, timeoutMs = 30_000): Promise<void> {
  const deadline = Date.now() + timeoutMs
  const check = (source: string): Promise<boolean> =>
    page.evaluate((expression: string) => {
      const state = (window as unknown as { __retroDebugSnapshot: () => Snapshot }).__retroDebugSnapshot()
      if (!state.jump) return false
      return new Function('jump', `return ${expression}`)(state.jump) as boolean
    }, source)

  while (Date.now() < deadline) {
    if (await check(predicate)) return
    await resumeIfOverloaded(page)
    await page.waitForTimeout(16)
  }
  throw new Error(`Warunek nie został spełniony w ${timeoutMs} ms: ${predicate}`)
}

async function waitForTakeoffTick(page: Page, edge: number, lead: number): Promise<void> {
  const arg: [number, number] = [edge, lead]
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      await page.waitForFunction(
        ([edgeTicks, leadTicks]: [number, number]) => {
          const state = (window as unknown as { __retroDebugSnapshot: () => {
            jump: { tick: number; events: string[] } | null
          } }).__retroDebugSnapshot()
          const jump = state.jump
          if (!jump) return false
          const gateOpen = (jump.events ?? []).find((entry: string) => entry.endsWith(' gateOpen'))
          if (!gateOpen) return false
          const gateTick = Number(gateOpen.split(' ')[0] ?? '0')
          return jump.tick >= gateTick + edgeTicks - leadTicks
        },
        arg,
        { polling: 'raf', timeout: 20_000 },
      )
      return
    } catch (error) {
      const state = await snapshot(page)
      if (!state.paused) throw error
      await page.keyboard.press('Enter')
      continue
    }
  }
  throw new Error('Nie osiągnięto progu wybicia')
}

/**
 * Próg wybicia dla faktycznej belki bieżącej próby treningowej: po P42 rundzie
 * 11 belka domyślnie wynika z prognozy wiatru, a nie ze stałego 8.
 */
async function waitForAttemptTakeoffTick(page: Page, lead: number): Promise<void> {
  const gate = (await snapshot(page)).jump?.gate
  if (!gate) throw new Error('Brak belki bieżącej próby treningowej.')
  await waitForTakeoffTick(page, edgeTickFor(gate), lead)
}

async function waitForTakeoffPhase(page: Page, description: string): Promise<void> {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      await page.waitForFunction(
        () => {
          const state = (window as unknown as { __retroDebugSnapshot: () => {
            jump: { phase: string } | null
            competition: { jump: { phase: string } | null } | null
          } }).__retroDebugSnapshot()
          const phase = state.competition?.jump?.phase ?? state.jump?.phase ?? ''
          return phase === 'Takeoff'
        },
        undefined,
        { polling: 'raf', timeout: 20_000 },
      )
      return
    } catch {
      const state = await snapshot(page)
      if (state.paused) {
        await page.keyboard.press('Enter')
        continue
      }
      throw new Error(`Nie osiągnięto fazy Takeoff: ${description}`)
    }
  }
  throw new Error(`Nie osiągnięto fazy Takeoff: ${description}`)
}

/**
 * Potwierdzone opuszczenie belki konkursowej: pojedynczy ArrowRight potrafi
 * zostać zjedzony przez pauzę przeciążenia, więc naciskamy do zdarzenia
 * gateOpen (jak openCompetitionGateAcknowledged w competition.spec.ts).
 */
async function openCompetitionGateAcknowledged(page: Page): Promise<void> {
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    const state = await snapshot(page)
    if ((state.competition?.jump?.events ?? []).some((entry) => entry.endsWith(' gateOpen'))) return
    if (state.paused) {
      if (state.pauseReason !== '' && state.pauseReason !== OVERLOAD_REASON) {
        expect(state.pauseReason).toBe(OVERLOAD_REASON)
        return
      }
      await page.keyboard.press('Enter')
      await page.waitForTimeout(16)
      continue
    }
    await page.keyboard.press('ArrowRight')
    try {
      await page.waitForFunction(() => {
        const current = (window as unknown as { __retroDebugSnapshot: () => Snapshot }).__retroDebugSnapshot()
        if ((current.competition?.jump?.events ?? []).some((entry: string) => entry.endsWith(' gateOpen'))) return true
        if (current.paused) return true
        return false
      }, undefined, { polling: 'raf', timeout: 2_000 })
    } catch {
      // Pętla zweryfikuje gateOpen przed kolejnym dosłaniem.
    }
  }
  throw new Error('Belka konkursowa nie otworzyła rozbiegu (brak gateOpen)')
}

/**
 * Telemark z ograniczonym ponowieniem: pauza przeciążenia potrafi zjeść
 * pierwsze naciśnięcie T, a goły poll bez resume wygasa w fazie Flight.
 * Ponawiamy maks. 3×, wyłącznie w locie, z wznawianiem na bieżąco.
 */
async function pressTelemarkUntilPrep(page: Page): Promise<void> {
  await page.keyboard.press('KeyT')
  const deadline = Date.now() + 8_000
  let presses = 1
  for (;;) {
    const state = await snapshot(page)
    if (state.paused) {
      await resumeIfOverloaded(page)
      continue
    }
    const phase = state.competition?.jump?.phase ?? state.jump?.phase ?? ''
    if (phase === 'LandingPrep' || phase !== 'Flight') return
    if (Date.now() > deadline) throw new Error('Nie osiągnięto przygotowania lądowania po T')
    if (presses < 3) {
      await page.keyboard.press('KeyT')
      presses += 1
    }
    await page.waitForTimeout(120)
  }
}

async function waitForCompetition(
  page: Page,
  predicate: (competition: CompetitionDebug) => boolean,
  description: string,
  timeoutMs = 45_000,
): Promise<CompetitionDebug> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    await resumeIfOverloaded(page)
    const state = await snapshot(page)
    if (state.competition && predicate(state.competition)) return state.competition
    await page.waitForTimeout(12)
  }
  throw new Error(`Nie osiągnięto stanu: ${description}`)
}

async function pressUntilMenu(page: Page, key: string, target: string, description: string): Promise<void> {
  const seen = async (): Promise<boolean> => {
    const deadline = Date.now() + 1_500
    while (Date.now() < deadline) {
      const state = await snapshot(page)
      if (state.paused) {
        await page.keyboard.press('Enter')
        continue
      }
      if ((state.menuSelection ?? '') === target) return true
      await page.waitForTimeout(80)
    }
    return false
  }
  for (let attempt = 0; attempt < 4; attempt += 1) {
    if (await seen()) return
    await page.keyboard.press(key)
  }
  if (await seen()) return
  throw new Error(`Brak wyboru menu po 4× ${key}: ${description}`)
}

async function openJumpScreen(page: Page): Promise<void> {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await snapshot(page)).screen).toBe('menu')
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const state = await snapshot(page)
    if (state.screen === 'jump' && !state.paused) return
    if (state.paused && state.pauseReason !== '' && state.pauseReason !== OVERLOAD_REASON) expect(state.pauseReason).toBe(OVERLOAD_REASON)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(24)
  }
  const final = await snapshot(page)
  expect(final.screen).toBe('jump')
  expect(final.paused).toBe(false)
}

/** Minimalny skok człowieka w konkursie (bez dodatkowych zrzutów). */
async function playMinimalHumanJump(page: Page): Promise<void> {
  await waitForCompetition(page, (c) => c.view === 'handover' && c.handoverReady, 'gotowy handover (kolejny)')
  await page.keyboard.press('Enter')
  await waitForCompetition(page, (c) => c.view === 'start' && c.startPhase === 'red', 'czerwona (kolejny)')
  await page.keyboard.press('Enter')
  await waitForCompetition(page, (c) => c.startPhase === 'yellow', 'żółta (kolejny)')
  await page.keyboard.press('Enter')
  await waitForCompetition(page, (c) => c.startPhase === 'green', 'zielona (kolejny)')
  await openCompetitionGateAcknowledged(page)
  await waitForTakeoffPhase(page, 'moment wybicia (kolejny)')
  await page.keyboard.press('ArrowUp')
  const flight = await waitForCompetition(page, (c) => c.jump?.phase === 'Flight', 'lot (kolejny)')
  await page.keyboard.down('ArrowRight')
  await waitForCompetition(page, (c) => (c.jump?.tick ?? 0) >= (flight.jump?.tick ?? 0) + 130, 'podejście (kolejny)')
  await page.keyboard.up('ArrowRight')
  await pressTelemarkUntilPrep(page)
  await waitForCompetition(page, (c) => ['result', 'round-summary', 'finished'].includes(c.view), 'wynik (kolejny)')
}

test.describe(`PKG-008 runda 11 — audyt widoków (${STAGE})`, () => {
  // Uwaga techniczna: Enter na ekranie tytułowym prosi o pełny ekran, więc
  // rozmiaru viewportu NIE zmieniamy w trakcie testu (Playwright odmawia
  // wtedy setViewportSize). Ekrany 1920×1080 mają własne testy z rozmiarem
  // ustawionym przed wejściem na stronę — jak w pozostałych specach projektu.

  test('konkurs 960×540: wszystkie widoki od tytułu do tabeli końcowej', async ({ page }) => {
    test.setTimeout(300_000)
    await page.setViewportSize({ width: 960, height: 540 })

    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(250)
    await page.screenshot({ path: shot('title') })

    await page.keyboard.press('Enter')
    await expect.poll(async () => (await snapshot(page)).screen).toBe('menu')
    await resumeIfOverloaded(page)
    await page.waitForTimeout(250)
    await page.screenshot({ path: shot('menu') })

    await pressUntilMenu(page, 'ArrowDown', 'competition', 'menu → konkurs')
    await resumeIfOverloaded(page)
    await page.keyboard.press('Enter')
    await expect.poll(async () => (await snapshot(page)).screen).toBe('competition-setup')
    await page.waitForTimeout(250)
    await page.screenshot({ path: shot('competition-setup') })

    await resumeIfOverloaded(page)
    await page.keyboard.press('Enter')
    await waitForCompetition(page, (c) => c.view === 'handover' && c.handoverReady, 'gotowy handover')
    await page.waitForTimeout(300)
    await page.screenshot({ path: shot('handover') })

    await page.keyboard.press('Enter')
    await waitForCompetition(page, (c) => c.view === 'start' && c.startPhase === 'red', 'faza czerwona')
    await page.waitForTimeout(150)
    await page.screenshot({ path: shot('start-red') })

    // Otwarty panel trenera w czerwonej fazie (osobny widok do audytu).
    await page.keyboard.press('KeyC')
    await waitForCompetition(page, (c) => c.coachPanelOpen, 'panel trenera otwarty')
    await page.waitForTimeout(150)
    await page.screenshot({ path: shot('start-red-coach') })
    await page.keyboard.press('KeyC')
    // Runda 12: sufit AUTO potrafi wskazać belkę 1 — trener nie ma niższej
    // propozycji i jury wprost odrzuca zatwierdzenie. Poniżej belki 1 decyzja
    // nadal musi być przyjęta i realnie obniżać start.
    const coach = await waitForCompetition(
      page,
      (c) => c.coachDecision === 'accepted' || c.coachDecision === 'rejected-gate',
      'decyzja trenera',
    )
    if (coach.juryGateNumber > 1) {
      expect(coach.coachDecision).toBe('accepted')
      expect(coach.actualGateNumber).toBeLessThan(coach.juryGateNumber)
    } else {
      expect(coach.coachDecision).toBe('rejected-gate')
      expect(coach.actualGateNumber).toBe(1)
    }

    await page.keyboard.press('Enter')
    await waitForCompetition(page, (c) => c.startPhase === 'yellow', 'faza żółta')
    await page.waitForTimeout(150)
    await page.screenshot({ path: shot('start-yellow') })

    await page.keyboard.press('Enter')
    await waitForCompetition(page, (c) => c.startPhase === 'green', 'faza zielona')
    await page.waitForTimeout(150)
    await page.screenshot({ path: shot('start-green') })

    await openCompetitionGateAcknowledged(page)
    const inrunStart = await waitForCompetition(page, (c) => c.view === 'jump' && c.jump?.phase === 'Inrun', 'rozbieg')
    // Snapshot konkursu nie ma speedKmh (pole treningu) — kotwica ticków
    // od zdarzenia gateOpen daje pewny środek rozbiegu niezależnie od obciążenia.
    const gateOpenTick = Number(
      (inrunStart.jump?.events.find((entry) => entry.endsWith(' gateOpen')) ?? '0').split(' ')[0] ?? '0',
    )
    await waitForCompetition(page, (c) => (c.jump?.tick ?? 0) >= gateOpenTick + 280, 'rozpędzanie rozbiegu')
    await page.screenshot({ path: shot('hud-inrun') })

    await waitForTakeoffPhase(page, 'moment wybicia')
    await page.keyboard.press('ArrowUp')
    const flight = await waitForCompetition(page, (c) => c.jump?.phase === 'Flight', 'lot')
    await page.keyboard.down('ArrowRight')
    await waitForCompetition(page, (c) => (c.jump?.tick ?? 0) >= (flight.jump?.tick ?? 0) + 90, 'korekta pozycji')
    await page.screenshot({ path: shot('hud-flight') })
    await waitForCompetition(page, (c) => (c.jump?.tick ?? 0) >= (flight.jump?.tick ?? 0) + 130, 'podejście')
    await page.keyboard.up('ArrowRight')
    await pressTelemarkUntilPrep(page)
    await waitForCompetition(page, (c) => c.jump?.phase === 'LandingPrep', 'przygotowanie lądowania')
    await page.screenshot({ path: shot('hud-landingprep') })

    await waitForCompetition(page, (c) => ['result', 'round-summary', 'finished'].includes(c.view) && c.lastResult !== null, 'wynik człowieka')
    await page.waitForTimeout(250)
    await page.screenshot({ path: shot('competition-result') })

    // Powtórka produkcyjna (zgodne dane wizualne) prosto z widoku wyniku.
    await page.keyboard.press('KeyV')
    await expect.poll(async () => (await snapshot(page)).screen).toBe('replay')
    await page.waitForTimeout(300)
    await page.screenshot({ path: shot('replay-production') })
    await page.keyboard.press('Backspace')
    await expect.poll(async () => (await snapshot(page)).screen).toBe('competition')

    // Dojazd do końca kwalifikacji: plansza wyników serii nie znika bez Enter.
    let state = (await snapshot(page)).competition
    if (!state) throw new Error('Brak stanu konkursu.')
    let qualificationView: string = state.view
    for (let guard = 0; guard < 500 && qualificationView !== 'round-summary'; guard += 1) {
      if (qualificationView === 'result' || qualificationView === 'round-summary') {
        await page.keyboard.press('Enter')
      } else if (qualificationView === 'handover') {
        await playMinimalHumanJump(page)
        const next = (await snapshot(page)).competition
        if (!next) throw new Error('Brak stanu konkursu po skoku.')
        state = next
        qualificationView = state.view
        continue
      }
      state = await waitForCompetition(
        page,
        (next) => next.view !== 'bots' || next.roundId !== state?.roundId || next.nextStartIndex !== state?.nextStartIndex,
        'kolejny krok kwalifikacji',
        60_000,
      )
      qualificationView = state.view
    }
    expect(state.view).toBe('round-summary')
    await page.waitForTimeout(300)
    await page.screenshot({ path: shot('round-summary') })
    await page.keyboard.press('Enter')
    // Odświeżenie stanu po zatwierdzeniu planszy: w odwróconej kolejności
    // finału zaraz po Enter może czekać handover człowieka, a podwójny Enter
    // wystawiony ze starego stanu przyjąłby przekazanie bez sterowania skokiem
    // i zostawił pętelkę na widoku start.
    state = await waitForCompetition(
      page,
      (next) => next.view !== 'round-summary',
      'początek drugiej serii',
      60_000,
    )

    // Dalej do końca konkursu (tabela końcowa).
    for (let guard = 0; guard < 500 && state.view !== 'finished'; guard += 1) {
      if (state.view === 'result' || state.view === 'round-summary') {
        await page.keyboard.press('Enter')
      } else if (state.view === 'handover') {
        await playMinimalHumanJump(page)
        const next = (await snapshot(page)).competition
        if (!next) throw new Error('Brak stanu konkursu po skoku.')
        state = next
        continue
      }
      state = await waitForCompetition(
        page,
        (next) => next.view !== 'bots' || next.roundId !== state?.roundId || next.nextStartIndex !== state?.nextStartIndex,
        'kolejny krok konkursu',
        60_000,
      )
    }
    expect(state.view).toBe('finished')
    await page.waitForTimeout(300)
    await page.screenshot({ path: shot('final-table') })
  })

  test('konkurs 1920×1080: ekrany wyniku i plansza serii', async ({ page }) => {
    test.setTimeout(300_000)
    await page.setViewportSize({ width: 1920, height: 1080 })

    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.keyboard.press('Enter')
    await expect.poll(async () => (await snapshot(page)).screen).toBe('menu')
    await resumeIfOverloaded(page)
    await pressUntilMenu(page, 'ArrowDown', 'competition', 'menu → konkurs')
    await page.keyboard.press('Enter')
    await expect.poll(async () => (await snapshot(page)).screen).toBe('competition-setup')
    await page.keyboard.press('Enter')
    await waitForCompetition(page, (c) => c.view === 'handover' && c.handoverReady, 'gotowy handover')
    await page.keyboard.press('Enter')
    await waitForCompetition(page, (c) => c.view === 'start' && c.startPhase === 'red', 'faza czerwona')
    await page.keyboard.press('Enter')
    await waitForCompetition(page, (c) => c.startPhase === 'yellow', 'faza żółta')
    await page.keyboard.press('Enter')
    await waitForCompetition(page, (c) => c.startPhase === 'green', 'faza zielona')
    await page.keyboard.press('ArrowRight')
    await waitForTakeoffPhase(page, 'moment wybicia')
    await page.keyboard.press('ArrowUp')
    const flight = await waitForCompetition(page, (c) => c.jump?.phase === 'Flight', 'lot')
    await page.keyboard.down('ArrowRight')
    await waitForCompetition(page, (c) => (c.jump?.tick ?? 0) >= (flight.jump?.tick ?? 0) + 130, 'podejście')
    await page.keyboard.up('ArrowRight')
    await page.keyboard.press('KeyT')
    await waitForCompetition(page, (c) => ['result', 'round-summary', 'finished'].includes(c.view) && c.lastResult !== null, 'wynik człowieka')
    await page.waitForTimeout(250)
    await page.screenshot({ path: shotLarge('competition-result') })
    await page.keyboard.press('Enter')

    let state = (await snapshot(page)).competition
    if (!state) throw new Error('Brak stanu konkursu.')
    let largeQualificationView: string = state.view
    for (let guard = 0; guard < 500 && largeQualificationView !== 'round-summary'; guard += 1) {
      if (largeQualificationView === 'result' || largeQualificationView === 'round-summary') {
        await page.keyboard.press('Enter')
      } else if (largeQualificationView === 'handover') {
        await playMinimalHumanJump(page)
        const next = (await snapshot(page)).competition
        if (!next) throw new Error('Brak stanu konkursu po skoku.')
        state = next
        largeQualificationView = state.view
        continue
      }
      state = await waitForCompetition(
        page,
        (next) => next.view !== 'bots' || next.roundId !== state?.roundId || next.nextStartIndex !== state?.nextStartIndex,
        'kolejny krok kwalifikacji',
        60_000,
      )
      largeQualificationView = state.view
    }
    expect(state.view).toBe('round-summary')
    await page.waitForTimeout(300)
    await page.screenshot({ path: shotLarge('round-summary') })
  })

  test('trening 960×540: fazy HUD, wynik i pauza', async ({ page }) => {
    test.setTimeout(120_000)
    await page.setViewportSize({ width: 960, height: 540 })
    await openJumpScreen(page)

    await page.keyboard.press('ArrowRight')
    await waitForJump(page, 'jump.speedKmh >= 60')
    await page.screenshot({ path: shot('training-inrun') })

    await waitForAttemptTakeoffTick(page, 35)
    await page.keyboard.press('ArrowUp')
    await waitForJump(page, `jump.phase === 'Flight'`)
    const flightTick = (await snapshot(page)).jump?.tick ?? 0

    await page.keyboard.down('ArrowRight')
    await waitForJump(page, `jump.tick >= ${flightTick + 90}`)
    await page.screenshot({ path: shot('training-flight') })

    // Pauza w locie — widok banneru pauzy.
    await page.keyboard.press('KeyP')
    await expect.poll(async () => (await snapshot(page)).paused).toBe(true)
    await page.waitForTimeout(200)
    await page.screenshot({ path: shot('pause') })
    await page.keyboard.press('Enter')
    await expect.poll(async () => (await snapshot(page)).paused).toBe(false)

    await waitForJump(page, `jump.tick >= ${flightTick + 130}`)
    await page.keyboard.up('ArrowRight')
    await pressTelemarkUntilPrep(page)
    const prep = await snapshot(page)
    expect(prep.jump?.phase).toBe('LandingPrep')
    await page.screenshot({ path: shot('training-landingprep') })

    await waitForJump(page, 'jump.status !== null')
    await page.waitForTimeout(300)
    await page.screenshot({ path: shot('training-result') })
  })

  test('trening 1920×1080: ekran wyniku', async ({ page }) => {
    test.setTimeout(90_000)
    await page.setViewportSize({ width: 1920, height: 1080 })
    await openJumpScreen(page)
    await page.keyboard.press('ArrowRight')
    await waitForAttemptTakeoffTick(page, 35)
    await page.keyboard.press('ArrowUp')
    await waitForJump(page, `jump.phase === 'Flight'`)
    const flightTick = (await snapshot(page)).jump?.tick ?? 0
    await page.keyboard.down('ArrowRight')
    await waitForJump(page, `jump.tick >= ${flightTick + 130}`)
    await page.keyboard.up('ArrowRight')
    await page.keyboard.press('KeyT')
    await waitForJump(page, 'jump.status !== null')
    await page.waitForTimeout(300)
    await page.screenshot({ path: shotLarge('training-result') })
  })

  test('druga karta tylko odczyt oraz powtórka techniczna', async ({ page, context }) => {
    test.setTimeout(90_000)
    await page.setViewportSize({ width: 960, height: 540 })

    // Karta właściciela: wejście w konkurs przejmuje lease i bije heartbeat.
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.keyboard.press('Enter')
    await expect.poll(async () => (await snapshot(page)).screen).toBe('menu')
    await pressUntilMenu(page, 'ArrowDown', 'competition', 'menu → konkurs')
    await page.keyboard.press('Enter')
    await expect.poll(async () => (await snapshot(page)).screen).toBe('competition-setup')
    await page.keyboard.press('Enter')
    await waitForCompetition(page, (c) => c.view === 'handover', 'handover na karcie właściciela')
    await page.waitForTimeout(600)

    // Druga karta w tym samym kontekście: osobny sessionStorage = inny ownerId.
    const second = await context.newPage()
    await second.setViewportSize({ width: 960, height: 540 })
    await second.goto('/', { waitUntil: 'domcontentloaded' })
    await second.keyboard.press('Enter')
    await expect.poll(async () => (await snapshot(second)).screen).toBe('menu')
    await second.keyboard.press('ArrowDown')
    await second.keyboard.press('Enter')
    await expect.poll(async () => (await snapshot(second)).screen).toBe('competition-setup')
    await second.waitForTimeout(900)
    await second.screenshot({ path: shot('second-tab-readonly') })
    await second.close()

    // Powtórka techniczna: replay zapisany na archiwalnej wersji danych.
    await page.evaluate(async () => {
      const open = indexedDB.open('retro-ski-jumping', 1)
      const db = await new Promise<IDBDatabase>((resolvePromise, rejectPromise) => {
        open.onsuccess = () => resolvePromise(open.result)
        open.onerror = () => rejectPromise(open.error)
      })
      const samples = Array.from({ length: 24 }, (_, index) => ({
        tick: index * 4,
        x: index * 1.5,
        y: 6 - index * 0.35,
        pitchRad: -0.2,
        phase: index < 4 ? 'Inrun' : index < 20 ? 'Flight' : 'Outrun',
        speedKmh: 92 - index,
        windUserMetersPerSecond: 0.4,
        heightAboveSurface: Math.max(0, 5 - index * 0.2),
      }))
      const replay = {
        schemaVersion: 1,
        id: 'pkg008-r11-archiwalny-replay',
        sessionId: 'standard-tech-k120-1',
        kind: 'auto',
        createdAtMs: Date.now(),
        formatVersion: 'pkg006-replay-1',
        versions: { rules: 'pkg004-rules-1', physics: 'archiwalna-0', hill: '0.9.0' },
        sampleHz: 30,
        initialState: {
          competitionId: 'standard-tech-k120-1',
          roundId: 'first',
          participantId: 'local-01',
          participantName: 'Łucja Wicher',
          gateNumber: 8,
          juryGateNumber: 8,
          coachRequested: false,
          windSeed: 4660,
          windVersion: 'pkg003-wind-1',
          hillId: 'archiwalna-skocznia',
        },
        inputs: [{ tick: 12, sequence: 0, action: 'takeoff', edge: 'pressed' }],
        samples,
        discreteEvents: [
          { tick: 12, type: 'takeoffEdge', detail: 'archiwum' },
          { tick: 80, type: 'measured', detail: '118,50 m' },
        ],
        recordedResult: { resultId: 'pkg008-r11-archiwalny-wynik', distanceHalfMeters: 237, totalTenths: 1184, status: 'landed' },
      }
      await new Promise<void>((resolvePromise, rejectPromise) => {
        const transaction = db.transaction(['replays'], 'readwrite')
        transaction.objectStore('replays').put(replay)
        transaction.oncomplete = () => resolvePromise()
        transaction.onabort = () => rejectPromise(transaction.error)
      })
      db.close()
    })

    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.keyboard.press('Enter')
    await expect.poll(async () => (await snapshot(page)).screen).toBe('menu')
    await pressUntilMenu(page, 'ArrowDown', 'competition', 'menu → konkurs')
    await pressUntilMenu(page, 'ArrowDown', 'replay', 'menu → powtórka')
    await page.keyboard.press('Enter')
    await expect.poll(async () => (await snapshot(page)).screen).toBe('replay')
    await page.waitForTimeout(300)
    await page.screenshot({ path: shot('replay-technical') })
  })
})
