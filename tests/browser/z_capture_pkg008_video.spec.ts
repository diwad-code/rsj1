/**
 * PKG-008 / P42 — nagrania wideo do bramki V (pełny skok człowieka i fragment
 * konkursu z botami). Osobny plik, bo `test.use({ video: 'on' })` musi być na
 * poziomie pliku (Playwright odmawia tego wewnątrz `describe`).
 */

import { expect, test, type Page } from '@playwright/test'
import { edgeTickFor } from '../support/jumpHarness'

const OVERLOAD_REASON = 'zbyt długa przerwa klatki'
// Pomiar konkursu: opóźnienie prasy→zdarzenie 17–29 ticków, więc kotwica 46
// centruje faktyczny lead w 17–29 (ideal 24 = 0,20 s), obie granice łagodne.
const TAKEOFF_CAPTURE_LEAD = 46
// Pomiar treningu: opóźnienie prasy→zdarzenie waha się 17–24 ticki, więc
// kotwica 44 centruje faktyczny lead w 20–27 (ideal 24 = 0,20 s).
const TRAINING_CAPTURE_LEAD = 44

test.use({ video: 'on' })

type JumpDebug = { phase: string; tick: number; gate: number; heightAboveSurface: number; status: string | null; distance: number | null; events: string[] } | null

type CompetitionDebug = {
  view: 'handover' | 'start' | 'jump' | 'bots' | 'result' | 'round-summary' | 'withdraw-confirm' | 'finished'
  startPhase: 'red' | 'yellow' | 'green' | null
  handoverReady: boolean
  actualGateNumber: number
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

async function resumeIfOverloaded(page: Page, knownState?: Snapshot): Promise<void> {
  const state = knownState ?? await snapshot(page)
  if (!state.paused) return
  // Udokumentowana pauza przeciążenia albo przejściowy pusty powód —
  // Enter w grze wznawia każdą pauzę.
  if (state.pauseReason !== '' && state.pauseReason !== OVERLOAD_REASON) {
    expect(state.pauseReason).toBe(OVERLOAD_REASON)
    return
  }
  await page.keyboard.press('Enter')
  await page.waitForTimeout(16)
}

/**
 * Nagranie nie powinno zawierać długich plansz pauzy wywołanych wyłącznie
 * obciążeniem hosta automatyzacji. Wznawiamy tylko znaną pauzę przeciążenia
 * tuż przed callbackiem rAF; sterowanie skokiem nadal idzie prawdziwymi
 * klawiszami Playwright i musi wytworzyć realne zdarzenia symulacji.
 */
async function installOverloadAutoResume(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const nativeRequestAnimationFrame = window.requestAnimationFrame.bind(window)
    window.requestAnimationFrame = (callback: FrameRequestCallback): number =>
      nativeRequestAnimationFrame((now) => {
        const state = (window as unknown as {
          __retroDebugSnapshot?: () => { paused: boolean; pauseReason: string }
        }).__retroDebugSnapshot?.()
        if (state?.paused && (state.pauseReason === '' || state.pauseReason === 'zbyt długa przerwa klatki')) {
          const canvas = document.querySelector('canvas')
          canvas?.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', key: 'Enter', bubbles: true }))
          canvas?.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter', key: 'Enter', bubbles: true }))
        }
        callback(now)
      })
  })
}

/**
 * Wybór w menu PRAWDZIWYM klawiszem ze sprawdzeniem stanu docelowego:
 * zgubione wejście ponawia, maks. 4 naciśnięcia.
 */
async function pressUntilMenu(
  page: Page,
  key: string,
  target: string,
  description: string,
): Promise<void> {
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

/**
 * Próg wybicia z debug snapshot: gateOpen + edgeTickFor − lead.
 * Pauzę wznawiamy na bieżąco. Potem PRAWDZIWY klawisz w wywołaniu.
 */
async function waitForTakeoffTick(page: Page, edge: number, lead: number): Promise<void> {
  const deadline = Date.now() + 20_000
  while (Date.now() < deadline) {
    const state = await snapshot(page)
    if (state.paused) {
      await resumeIfOverloaded(page, state)
      continue
    }
    const jump = state.competition?.jump ?? state.jump
    const gateOpen = jump?.events.find((entry) => entry.endsWith(' gateOpen'))
    if (!state.paused && jump && gateOpen) {
      const gateTick = Number(gateOpen.split(' ')[0] ?? '0')
      if (jump.tick >= gateTick + edge - lead) return
    }
    await page.waitForTimeout(12)
  }
  throw new Error('Nie osiągnięto progu wybicia')
}

/** Potwierdzamy zdarzenie, nie samo wysłanie klawisza przez Playwright. */
async function pressUntilJumpEvent(
  page: Page,
  key: string,
  event: string,
  allowedPhases: readonly string[],
): Promise<void> {
  const confirmed = async (): Promise<boolean> => {
    let state = await snapshot(page)
    if (state.paused) {
      await resumeIfOverloaded(page, state)
      state = await snapshot(page)
    }
    const jump = state.competition?.jump ?? state.jump
    if (jump?.events.some((entry) => entry.endsWith(` ${event}`))) return true
    if (!jump || !allowedPhases.includes(jump.phase)) {
      throw new Error(`Brak ${event}; nie ponawiam ${key} w fazie ${jump?.phase ?? 'brak skoku'}; status=${jump?.status}, dystans=${jump?.distance} m; zdarzenia: ${jump?.events.join(', ')}`)
    }
    return false
  }
  for (let attempt = 0; attempt < 4; attempt += 1) {
    if (await confirmed()) return
    await page.keyboard.press(key, { delay: 24 })
    const deadline = Date.now() + 48
    while (Date.now() < deadline) {
      if (await confirmed()) return
      await page.waitForTimeout(12)
    }
  }
  if (await confirmed()) return
  throw new Error(`Brak ${event} po 4× ${key}`)
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

function logTakeoffLead(name: string, jump: JumpDebug): void {
  const eventTick = (type: string): number | null => {
    const entry = jump?.events.find((item) => item.endsWith(` ${type}`))
    return entry ? Number(entry.split(' ')[0]) : null
  }
  const impulse = eventTick('takeoffImpulseStart')
  const edge = eventTick('takeoffEdge')
  console.log(`${name}: impulseTick=${impulse}, edgeTick=${edge}, faktyczny lead=${impulse !== null && edge !== null ? edge - impulse : 'brak danych'} ticków`)
}

async function playMinimalHumanJump(page: Page): Promise<void> {
  await waitForCompetition(page, (c) => c.view === 'handover' && c.handoverReady, 'gotowy handover')
  await page.keyboard.press('Enter')
  await waitForCompetition(page, (c) => c.view === 'start' && c.startPhase === 'red', 'czerwona')
  await page.keyboard.press('Enter')
  await waitForCompetition(page, (c) => c.startPhase === 'yellow', 'żółta')
  await page.keyboard.press('Enter')
  await waitForCompetition(page, (c) => c.startPhase === 'green', 'zielona')
  let inrun: CompetitionDebug | null = null
  for (let attempt = 0; attempt < 4 && !inrun; attempt += 1) {
    await resumeIfOverloaded(page)
    const before = (await snapshot(page)).competition
    if (before?.jump?.phase === 'Inrun') {
      inrun = before
      break
    }
    // Ponawiamy wyłącznie zgubiony start, nigdy korektę podczas skoku.
    if (!(before?.view === 'start' && before.startPhase === 'green')
      && before?.jump?.phase !== 'GateGreen') {
      throw new Error('Nieoczekiwany stan przed startem rozbiegu')
    }
    await page.keyboard.press('ArrowRight')
    const deadline = Date.now() + 250
    while (Date.now() < deadline) {
      await resumeIfOverloaded(page)
      const state = await snapshot(page)
      if (!state.paused && state.competition?.jump?.phase === 'Inrun') {
        inrun = state.competition
        break
      }
      await page.waitForTimeout(12)
    }
  }
  if (!inrun) throw new Error('Nie rozpoczęto rozbiegu po 4× ArrowRight')
  const actualGateNumber = inrun.actualGateNumber
  await waitForTakeoffTick(page, edgeTickFor(actualGateNumber), TAKEOFF_CAPTURE_LEAD)
  await pressUntilJumpEvent(page, 'ArrowUp', 'takeoffImpulseStart', ['Inrun', 'Takeoff'])
  const flight = await waitForCompetition(page, (c) => c.jump?.phase === 'Flight', 'lot')
  logTakeoffLead('Konkurs', flight.jump)
  // Krótka korekta + T przy +130 (kontakt ~+420) — bez sztywnych
  // milisekund ściany i bez progu wysokości (prześwit nie przekracza ~4 m).
  await page.keyboard.down('ArrowRight')
  await waitForCompetition(page, (c) => (c.jump?.tick ?? 0) >= (flight.jump?.tick ?? 0) + 130, 'podejście')
  await page.keyboard.up('ArrowRight')
  await pressUntilJumpEvent(page, 'KeyT', 'landingPrep', ['Flight', 'LandingPrep'])
  const result = await waitForCompetition(page, (c) => ['result', 'round-summary', 'finished'].includes(c.view), 'wynik')
  console.log(`Konkurs: status=${result.jump?.status}, dystans=${result.jump?.distance} m`)
}

test('nagranie pełnego skoku człowieka w scenie produkcyjnej', async ({ page }) => {
  test.setTimeout(60_000)
  await installOverloadAutoResume(page)
  await page.setViewportSize({ width: 960, height: 540 })
  await openJumpScreen(page)
  await page.waitForTimeout(400)

  await pressUntilJumpEvent(page, 'ArrowRight', 'gateOpen', ['GateGreen'])
  // Wcześniejsza kotwica kompensuje zmierzone opóźnienie wejścia przy nagrywaniu.
  const trainingGate = (await snapshot(page)).jump?.gate
  if (!trainingGate) throw new Error('Brak belki bieżącej próby treningowej.')
  await waitForTakeoffTick(page, edgeTickFor(trainingGate), TRAINING_CAPTURE_LEAD)
  await pressUntilJumpEvent(page, 'ArrowUp', 'takeoffImpulseStart', ['Inrun', 'Takeoff'])
  await waitForJump(page, `jump.phase === 'Flight'`)
  const flight = (await snapshot(page)).jump
  const flightTick = flight?.tick ?? 0
  logTakeoffLead('Pełny skok', flight)
  await page.keyboard.down('ArrowRight')
  // Prześwit w korekcie nie przekracza ~4 m — lot wyznacza czas symulacji,
  // nie próg wysokości. Krótka korekta + T przy +130 (kontakt ~+420).
  await waitForJump(page, `jump.tick >= ${flightTick + 130}`)
  await page.keyboard.up('ArrowRight')
  // T daje ponad sekundę przygotowania telemarku (wymagane 0,28 s).
  await pressUntilJumpEvent(page, 'KeyT', 'landingPrep', ['Flight', 'LandingPrep'])
  await waitForJump(page, 'jump.status !== null')
  const result = (await snapshot(page)).jump
  console.log(`Pełny skok: status=${result?.status}, dystans=${result?.distance} m`)
  expect(result?.status).toBe('landed')
  // Nagranie ma udowodnić wykonanie pełnej sekwencji, nie jakość timingu
  // prawdziwego klawisza pod enkoderem wideo. Belki 1–9 rundy 13 i jitter
  // ±kilkunastu ticków zmieniają dystans; wymagamy impulsu, przygotowania,
  // ustania i odległości wyraźnie ponad biernym wpadnięciem w garb (~22 m).
  expect(result?.events.some((entry) => entry.endsWith(' takeoffEdge'))).toBe(true)
  expect(result?.events.some((entry) => entry.endsWith(' landingPrep'))).toBe(true)
  expect(result?.distance ?? 0).toBeGreaterThan(30)
  await page.waitForTimeout(1200)
  // `video.saveAs()` czeka na zamknięcie strony, więc nie wołamy go tutaj — Playwright
  // zapisuje nagranie pod `outputDir` po zakończeniu testu; stamtąd trafia do video-review/.
})

test('nagranie fragmentu konkursu z botami', async ({ page }) => {
  test.setTimeout(90_000)
  await installOverloadAutoResume(page)
  await page.setViewportSize({ width: 960, height: 540 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await snapshot(page)).screen).toBe('menu')
  await resumeIfOverloaded(page)
  await pressUntilMenu(page, 'ArrowDown', 'competition', 'menu → konkurs')
  await resumeIfOverloaded(page)
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await snapshot(page)).screen).toBe('competition-setup')
  await resumeIfOverloaded(page)
  await page.keyboard.press('Enter')

  await playMinimalHumanJump(page)
  await page.keyboard.press('Enter') // opuszcza wynik/tabelę serii
  await waitForCompetition(page, (c) => c.view === 'bots', 'boty przejmują skoki')
  // Fragment 8 s samodzielnej gry botów tym samym rdzeniem symulacji.
  await page.waitForTimeout(8_000)
})
