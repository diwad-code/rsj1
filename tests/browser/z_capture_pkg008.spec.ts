/**
 * PKG-008 / P42 — zrzuty i nagrania do bramki V (akceptacja oprawy przez użytkownika).
 *
 * Spec nie sprawdza zachowania gry (to już robią jump.spec.ts / competition.spec.ts /
 * persistence.spec.ts) — zbiera wyłącznie opcjonalny materiał do katalogu testu,
 * te same ekrany i fazy co PKG-007, żeby dało się porównać przed/po.
 */

import { expect, test, type Page } from '@playwright/test'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { edgeTickFor } from '../support/jumpHarness'

const capturePath = (name: string): string => test.info().outputPath(name)
const OVERLOAD_REASON = 'zbyt długa przerwa klatki'

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
  status: 'active' | 'complete' | 'cancelled'
  roundId: 'qualification' | 'first' | 'final'
  nextStartIndex: number
  handoverReady: boolean
  startPhase: 'red' | 'yellow' | 'green' | null
  lastResult: { participantId: string; distanceHalfMeters: number; totalTenths: number } | null
  jump: { phase: string; tick: number; heightAboveSurface: number; status: string | null } | null
}

type Snapshot = {
  screen: string
  paused: boolean
  pauseReason: string
  menuSelection: 'training' | 'competition' | 'replay'
  jump: JumpDebug
  competition: CompetitionDebug | null
  replay: { available: boolean } | null
}

function snapshot(page: Page): Promise<Snapshot> {
  return page.evaluate(() => (
    window as unknown as { __retroDebugSnapshot: () => Snapshot }
  ).__retroDebugSnapshot())
}

async function resumeIfOverloaded(page: Page): Promise<void> {
  const state = await snapshot(page)
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

/**
 * Próg wybicia liczony W STRONIE (rAF, zero CDP na sprawdzenie): tick zdarzenia
 * gateOpen + edgeTickFor − 35. Potem PRAWDZIWY klawisz `ArrowUp` (osobno,
 * w wywołaniu). Pauza w trakcie: timeout, Enter, ponowienie (maks. 4).
 */
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

/**
 * Wejście w fazę Takeoff wykryte W STRONIE (rAF): do naciśnięcia ↑ tam, gdzie
 * dokładny tick nie jest znany (belka od jury). Potem PRAWDZIWY klawisz.
 */
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

/** Minimalny skok kolejnego zawodnika w konkursie — bez dodatkowych zrzutów/asercji. */
async function playMinimalHumanJump(page: Page): Promise<void> {
  await waitForCompetition(page, (c) => c.view === 'handover' && c.handoverReady, 'gotowy handover (kolejny)')
  await page.keyboard.press('Enter')
  await waitForCompetition(page, (c) => c.view === 'start' && c.startPhase === 'red', 'czerwona (kolejny)')
  await page.keyboard.press('Enter')
  await waitForCompetition(page, (c) => c.startPhase === 'yellow', 'żółta (kolejny)')
  await page.keyboard.press('Enter')
  await waitForCompetition(page, (c) => c.startPhase === 'green', 'zielona (kolejny)')
  await page.keyboard.press('ArrowRight')
  // Wejście w Takeoff wykryte W STRONIE (belka od jury, dokładny start impulsu
  // zamiast spóźnionego pollingu CDP). Potem PRAWDZIWY klawisz.
  await waitForTakeoffPhase(page, 'moment wybicia (kolejny)')
  await page.keyboard.press('ArrowUp')
  const flight = await waitForCompetition(page, (c) => c.jump?.phase === 'Flight', 'lot (kolejny)')
  // Krótka korekta + T przy +130 (kontakt ~+420): lądowanie także przy
  // słabszym wybiciu; pełne spłaszczenie wbija w garb, dryf pada.
  await page.keyboard.down('ArrowRight')
  await waitForCompetition(page, (c) => (c.jump?.tick ?? 0) >= (flight.jump?.tick ?? 0) + 130, 'podejście (kolejny)')
  await page.keyboard.up('ArrowRight')
  await page.keyboard.press('KeyT')
  await waitForCompetition(page, (c) => ['result', 'round-summary', 'finished'].includes(c.view), 'wynik (kolejny)')
}

/** Dogrywa konkurs do widoku `finished`; zakłada, że bieżący widok to już `result`/`round-summary`. */
async function driveCompetitionToFinish(page: Page): Promise<void> {
  let state = (await snapshot(page)).competition
  if (!state) throw new Error('Brak stanu konkursu.')
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
}

test.describe('PKG-008 — ekrany i konkurs', () => {
  for (const size of [
    { width: 960, height: 540 },
    { width: 1920, height: 1080 },
  ]) {
    test(`komplet ekranów ${size.width}×${size.height}: tytuł→menu→konkurs→powtórka→tabela końcowa`, async ({ page }) => {
      test.setTimeout(240_000)
      const suffix = `${size.width}x${size.height}`
      await page.setViewportSize(size)

      await page.goto('/', { waitUntil: 'domcontentloaded' })
      await expect(page.locator('#game-canvas')).toHaveAttribute('aria-label', /ekran tytułowy/)
      await page.screenshot({ path: capturePath(`pkg008-title-${suffix}.png`) })

      await page.keyboard.press('Enter')
      await expect.poll(async () => (await snapshot(page)).screen).toBe('menu')
      await resumeIfOverloaded(page)
      await page.waitForTimeout(200)
      await page.screenshot({ path: capturePath(`pkg008-menu-${suffix}.png`) })

      await pressUntilMenu(page, 'ArrowDown', 'competition', 'menu → konkurs')
      await resumeIfOverloaded(page)
      await page.keyboard.press('Enter')
      await expect.poll(async () => (await snapshot(page)).screen).toBe('competition-setup')
      await page.screenshot({ path: capturePath(`pkg008-competition-setup-${suffix}.png`) })

      await resumeIfOverloaded(page)
      await page.keyboard.press('Enter')
      await waitForCompetition(page, (c) => c.view === 'handover' && c.handoverReady, 'gotowy handover')
      await page.waitForTimeout(300)
      await page.screenshot({ path: capturePath(`pkg008-handover-${suffix}.png`) })

      await page.keyboard.press('Enter')
      await waitForCompetition(page, (c) => c.view === 'start' && c.startPhase === 'red', 'faza czerwona')
      await page.waitForTimeout(150)
      await page.screenshot({ path: capturePath(`pkg008-start-red-${suffix}.png`) })

      await page.keyboard.press('Enter')
      await waitForCompetition(page, (c) => c.startPhase === 'yellow', 'faza żółta')
      await page.waitForTimeout(150)
      await page.screenshot({ path: capturePath(`pkg008-start-yellow-${suffix}.png`) })

      await page.keyboard.press('Enter')
      await waitForCompetition(page, (c) => c.startPhase === 'green', 'faza zielona')
      await page.waitForTimeout(150)
      await page.screenshot({ path: capturePath(`pkg008-start-green-${suffix}.png`) })

      await page.keyboard.press('ArrowRight')
      await waitForCompetition(page, (c) => c.view === 'jump' && c.jump?.phase === 'Inrun', 'rozbieg')
      // Belka od jury — wejście w Takeoff wykryte W STRONIE (dokładny start
      // impulsu zamiast spóźnionego pollingu CDP).
      await waitForTakeoffPhase(page, 'moment wybicia')
      await page.keyboard.press('ArrowUp')
      const flight = await waitForCompetition(page, (c) => c.jump?.phase === 'Flight', 'lot')
      // Krótka korekta + T przy +130 (kontakt ~+420); sztywne milisekundy
      // ściany i próg wysokości odpadają — prześwit w korekcie nie
      // przekracza ~4 m, a pełne spłaszczenie wbija w garb.
      await page.keyboard.down('ArrowRight')
      await waitForCompetition(page, (c) => (c.jump?.tick ?? 0) >= (flight.jump?.tick ?? 0) + 130, 'korekta pozycji')
      await page.keyboard.up('ArrowRight')
      await page.keyboard.press('KeyT')
      await waitForCompetition(page, (c) => c.lastResult !== null, 'wynik człowieka')
      await page.waitForTimeout(200)
      await page.screenshot({ path: capturePath(`pkg008-result-table-${suffix}.png`) })

      await expect.poll(async () => (await snapshot(page)).replay?.available).toBe(true)
      await page.keyboard.press('KeyV')
      await expect.poll(async () => (await snapshot(page)).screen).toBe('replay')
      await page.waitForTimeout(200)
      await page.screenshot({ path: capturePath(`pkg008-replay-screen-${suffix}.png`) })
      await page.keyboard.press('Backspace')
      await expect.poll(async () => (await snapshot(page)).screen).toBe('competition')

      await driveCompetitionToFinish(page)
      await page.waitForTimeout(200)
      await page.screenshot({ path: capturePath(`pkg008-final-table-${suffix}.png`) })
    })
  }
})

test.describe('PKG-008 — powtórka z niezgodną wersją danych wizualnych', () => {
  for (const size of [
    { width: 960, height: 540 },
    { width: 1920, height: 1080 },
  ]) {
    test(`widok techniczny powtórki ${size.width}×${size.height}`, async ({ page }) => {
      await page.setViewportSize(size)
      const suffix = `${size.width}x${size.height}`
      await page.goto('/', { waitUntil: 'domcontentloaded' })
      await page.keyboard.press('Enter')
      await expect.poll(async () => (await snapshot(page)).screen).toBe('menu')

      // Ten sam wzorzec co tests/browser/persistence.spec.ts: replay zapisany na
      // starszej/nieznanej skoczni, żeby wymusić `replayVisualsCompatible === false`
      // bez zmiany kodu gry — to tylko dane brzegowe w bazie.
      await page.evaluate(async () => {
        const open = indexedDB.open('retro-ski-jumping', 1)
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          open.onsuccess = () => resolve(open.result)
          open.onerror = () => reject(open.error)
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
          id: 'pkg008-archiwalny-replay',
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
          recordedResult: { resultId: 'pkg008-archiwalny-wynik', distanceHalfMeters: 237, totalTenths: 1184, status: 'landed' },
        }
        await new Promise<void>((resolve, reject) => {
          const transaction = db.transaction(['replays'], 'readwrite')
          transaction.objectStore('replays').put(replay)
          transaction.oncomplete = () => resolve()
          transaction.onabort = () => reject(transaction.error)
        })
        db.close()
      })

      await page.reload({ waitUntil: 'domcontentloaded' })
      await page.keyboard.press('Enter')
      await expect.poll(async () => (await snapshot(page)).screen).toBe('menu')
      // Dwa kroki w dół (training → competition → replay) z ponowieniem
      // zgubionego klawisza — pod obciążeniem drugi ArrowDown ginął.
      await pressUntilMenu(page, 'ArrowDown', 'competition', 'menu → konkurs')
      await pressUntilMenu(page, 'ArrowDown', 'replay', 'menu → powtórka')
      await page.keyboard.press('Enter')
      await expect.poll(async () => (await snapshot(page)).screen).toBe('replay')
      await page.waitForTimeout(200)
      await page.screenshot({ path: capturePath(`pkg008-replay-technical-${suffix}.png`) })
    })
  }
})

test.describe('PKG-008 — fazy skoku (960×540)', () => {
  test('GateGreen → Inrun → Takeoff → Flight×3 → LandingPrep → Outrun → FinishLine', async ({ page }) => {
    test.setTimeout(90_000)
    await page.setViewportSize({ width: 960, height: 540 })
    await openJumpScreen(page)

    expect((await snapshot(page)).jump?.phase).toBe('GateGreen')
    await page.screenshot({ path: capturePath('pkg008-phase-gategreen-960x540.png') })

    await page.keyboard.press('ArrowRight')
    // Dopiero przy realnej prędkości skoczek jest na stromej części rozbiegu —
    // zrzut zaraz po starcie łapał go na belce, gdzie kuca nie widać.
    // (Opóźnienia przed progiem nie szkodzą: kotwica gateOpen jest absolutna.)
    await waitForJump(page, 'jump.speedKmh >= 60')
    await page.screenshot({ path: capturePath('pkg008-phase-inrun-960x540.png') })

    // Próg wybicia liczony W STRONIE od zdarzenia gateOpen (kotwica dokładna,
    // odporna na opóźnienia IPC i na zrzuty w trakcie rozbiegu): gateOpen +
    // edgeTickFor(faktycznej belki) − 35. Potem PRAWDZIWY klawisz. Bez tego lot bierny
    // kończył się przed odpytaniem fazy Flight.
    await waitForAttemptTakeoffTick(page, 35)
    await page.keyboard.press('ArrowUp')
    // Faza Takeoff trwa krótko, dlatego czekamy bezpośrednio na nią zamiast
    // dodawać stałe +20 ticków (przy szybszym najeździe dawało to już Flight).
    // Pełne sześć klatek wybicia zapisuje osobny arkusz pose-evidence.
    await waitForJump(page, `jump.phase === 'Takeoff'`)
    await page.screenshot({ path: capturePath('pkg008-phase-takeoff-960x540.png') })

    await waitForJump(page, `jump.phase === 'Flight'`)
    const flightTick = (await snapshot(page)).jump?.tick ?? 0
    await page.screenshot({ path: capturePath('pkg008-phase-flight-early-960x540.png') })

    await page.keyboard.down('ArrowRight')
    // Prześwit w korekcie nie przekracza ~4 m — lot wyznacza czas symulacji
    // (tu ~+90 ticków po starcie lotu), nie próg wysokości.
    await waitForJump(page, `jump.tick >= ${flightTick + 90}`)
    await page.screenshot({ path: capturePath('pkg008-phase-flight-mid-960x540.png') })

    await waitForJump(page, `jump.tick >= ${flightTick + 120}`)
    await page.screenshot({ path: capturePath('pkg008-phase-flight-late-960x540.png') })

    // Krótka korekta + T przy +130 (kontakt ~+420): ponad sekunda
    // przygotowania telemarku; pełne spłaszczenie wbija w garb, dryf pada.
    await page.keyboard.up('ArrowRight')
    await page.keyboard.press('KeyT')
    await expect.poll(async () => (await snapshot(page)).jump?.phase).toBe('LandingPrep')
    await page.screenshot({ path: capturePath('pkg008-phase-landingprep-960x540.png') })

    // Sylwetka lądowania rozwija się z wysokości nad zeskokiem, więc zrzut tuż
    // po wciśnięciu T pokazuje jeszcze pozę lotu. Drugi zrzut, przy samym
    // śniegu, jest jedynym dowodem na telemark i pracę rąk dla równowagi.
    await waitForJump(page, 'jump.heightAboveSurface <= 1.5')
    await page.screenshot({ path: capturePath('pkg008-phase-telemark-960x540.png') })

    // Kontakt jest niewidoczny z zewnątrz — patrz REPORT.md PKG-007 §4 #12.
    await waitForJump(page, `jump.phase === 'Outrun'`)
    await page.screenshot({ path: capturePath('pkg008-phase-outrun-960x540.png') })

    await waitForJump(page, 'jump.status !== null')
    const finished = await snapshot(page)
    expect(finished.jump?.status).toBe('landed')
    expect(finished.jump?.terminalPhase).toBe('FinishLine')
    await page.screenshot({ path: capturePath('pkg008-phase-finishline-960x540.png') })
  })

  test('Fall → FallSettled (brak przygotowania lądowania)', async ({ page }) => {
    test.setTimeout(60_000)
    await page.setViewportSize({ width: 960, height: 540 })
    await openJumpScreen(page)

    await page.keyboard.press('ArrowRight')
    // Próg w stronie jak w teście faz (kotwica gateOpen, potem prawdziwy ↑).
    await waitForAttemptTakeoffTick(page, 35)
    await page.keyboard.press('ArrowUp')
    await waitForJump(page, `jump.phase === 'Flight'`)
    await page.keyboard.down('ArrowRight')
    await waitForJump(page, 'jump.tick >= 1020')
    await page.keyboard.up('ArrowRight')

    await waitForJump(page, `jump.phase === 'Fall'`)
    await page.screenshot({ path: capturePath('pkg008-phase-fall-960x540.png') })

    await waitForJump(page, 'jump.status !== null')
    const finished = await snapshot(page)
    expect(finished.jump?.status).toBe('fall')
    expect(finished.jump?.terminalPhase).toBe('FallSettled')
    await page.screenshot({ path: capturePath('pkg008-phase-fallsettled-960x540.png') })
  })

  test('podpórka jedną i obiema dłońmi jest widoczna w rzeczywistym skoku', async ({ page }) => {
    test.setTimeout(90_000)
    await page.setViewportSize({ width: 960, height: 540 })

    const captureSupport = async (delayTicks: number, name: string) => {
      await openJumpScreen(page)
      await page.keyboard.press('ArrowRight')
      await waitForAttemptTakeoffTick(page, 35)
      await page.keyboard.press('ArrowUp')
      await waitForJump(page, `jump.phase === 'Flight'`)
      const flightTick = (await snapshot(page)).jump?.tick ?? 0
      if (delayTicks > 0) await waitForJump(page, `jump.tick >= ${flightTick + delayTicks}`)
      await page.keyboard.press('KeyT')
      await waitForJump(page, `jump.events.some((event) => event.includes('handSupport'))`)
      const supported = await snapshot(page)
      expect(supported.jump?.events.some((event) => event.endsWith(' handSupport'))).toBe(true)
      const supportTick = supported.jump?.tick ?? 0
      await waitForJump(page, `jump.tick >= ${supportTick + 24}`)
      await page.screenshot({ path: capturePath(name) })
      await waitForJump(page, 'jump.status !== null')
      expect((await snapshot(page)).jump?.status).toBe('landed')
    }

    await captureSupport(0, 'pkg008-phase-support-two-hands-960x540.png')
    await page.reload({ waitUntil: 'domcontentloaded' })
    await captureSupport(60, 'pkg008-phase-support-one-hand-960x540.png')
  })
})

/**
 * Wycina dokładny prostokąt z zapisanego PNG-a i zapisuje go jako osobny plik —
 * raz bez skalowania (dowód siatki pikseli 1:1), raz powiększony całkowitą skalą
 * przez `drawImage` z `imageSmoothingEnabled = false` (nearest-neighbour, ta sama
 * flaga co w `src/app/main.ts`).
 */
async function cropAndUpscale(
  page: Page,
  sourcePngPath: string,
  region: { x: number; y: number; w: number; h: number },
  scale: number,
  outPath: string,
): Promise<void> {
  const fileUrl = `file:///${resolve(sourcePngPath).replace(/\\/g, '/')}`
  await page.goto(fileUrl)
  const dataUrl = await page.evaluate(
    ({ x, y, w, h, scale }) => new Promise<string>((promiseResolve, promiseReject) => {
      const image = document.images[0]
      if (!image) {
        promiseReject(new Error('Strona nie zawiera obrazu do wycięcia.'))
        return
      }
      const draw = () => {
        const canvas = document.createElement('canvas')
        canvas.width = w * scale
        canvas.height = h * scale
        const context = canvas.getContext('2d')
        if (!context) {
          promiseReject(new Error('Brak kontekstu 2D do wycięcia.'))
          return
        }
        context.imageSmoothingEnabled = false
        context.drawImage(image, x, y, w, h, 0, 0, w * scale, h * scale)
        promiseResolve(canvas.toDataURL('image/png'))
      }
      if (image.complete) draw()
      else image.onload = draw
    }),
    { x: region.x, y: region.y, w: region.w, h: region.h, scale },
  )
  const base64 = dataUrl.split(',')[1] ?? ''
  writeFileSync(outPath, Buffer.from(base64, 'base64'))
}

test.describe.skip('PKG-008 — starsze wycinki 1:1 wymagające współdzielonego katalogu', () => {
  test('skoczek, HUD i krawędź zeskoku z fazy Outrun (960×540)', async ({ page }) => {
    const source = capturePath('pkg008-phase-outrun-960x540.png')
    // Kamera trzyma zawodnika na 38% szerokości (365 px przy 960), a w pionie
    // tym wyżej, im większy prześwit nad śniegiem — wycinki idą za tą regułą.
    const targets: Array<{ name: string; region: { x: number; y: number; w: number; h: number } }> = [
      { name: 'skoczek', region: { x: 296, y: 252, w: 160, h: 120 } },
      { name: 'hud', region: { x: 14, y: 8, w: 220, h: 60 } },
      { name: 'krawedz-zeskoku', region: { x: 296, y: 320, w: 160, h: 90 } },
    ]
    for (const target of targets) {
      await cropAndUpscale(page, source, target.region, 1, capturePath(`pkg008-crop-${target.name}-1x.png`))
      await cropAndUpscale(page, source, target.region, 6, capturePath(`pkg008-crop-${target.name}-upscaled6x.png`))
    }
  })

  test('skoczek w locie — sprawdzenie V-stylu nart (flight-mid, 960×540)', async ({ page }) => {
    const source = capturePath('pkg008-phase-flight-mid-960x540.png')
    const region = { x: 300, y: 210, w: 150, h: 110 }
    await cropAndUpscale(page, source, region, 1, capturePath('pkg008-crop-skoczek-lot-1x.png'))
    await cropAndUpscale(page, source, region, 6, capturePath('pkg008-crop-skoczek-lot-upscaled6x.png'))
  })

  test('skoczek na belce, rozbiegu, wybiciu i lądowaniu (960×540)', async ({ page }) => {
    // Bramka V wymaga oceny sylwetki w KAŻDEJ fazie (kuc, ręce wzdłuż tułowia,
    // rozdzielenie nart i ciała), a nie tylko w locie i na odjeździe. Kamera
    // trzyma zawodnika na 38% szerokości, więc wycinek jest stały.
    const targets: Array<{ name: string; phase: string; y: number }> = [
      { name: 'skoczek-belka', phase: 'gategreen', y: 266 },
      { name: 'skoczek-rozbieg', phase: 'inrun', y: 268 },
      { name: 'skoczek-wybicie', phase: 'takeoff', y: 219 },
      { name: 'skoczek-ladowanie', phase: 'landingprep', y: 247 },
      { name: 'skoczek-telemark', phase: 'telemark', y: 258 },
    ]
    for (const target of targets) {
      const source = capturePath(`pkg008-phase-${target.phase}-960x540.png`)
      const region = { x: 300, y: target.y, w: 150, h: 110 }
      await cropAndUpscale(page, source, region, 1, capturePath(`pkg008-crop-${target.name}-1x.png`))
      await cropAndUpscale(page, source, region, 6, capturePath(`pkg008-crop-${target.name}-upscaled6x.png`))
    }
  })

  test('siatka pikseli: ten sam fragment tytułu przy 960×540 i 1920×1080', async ({ page }) => {
    // Ten sam logiczny fragment (grot świerku na dole tytułu), wycięty naturalnie
    // z obu rozdzielczości i powiększony do tego samego rozmiaru końcowego
    // (640×320): 960×540 ×4 vs 1920×1080 ×2 — dowód, że wyższa rozdzielczość okna
    // tylko dubluje te same piksele bufora 480×270 (index.html), nie ostrzejszą siatkę.
    await cropAndUpscale(
      page,
      capturePath('pkg008-title-960x540.png'),
      { x: 40, y: 190, w: 160, h: 80 },
      4,
      capturePath('pkg008-crop-siatka-960x540-upscaled4x.png'),
    )
    await cropAndUpscale(
      page,
      capturePath('pkg008-title-1920x1080.png'),
      { x: 80, y: 380, w: 320, h: 160 },
      2,
      capturePath('pkg008-crop-siatka-1920x1080-upscaled2x.png'),
    )
  })
})
