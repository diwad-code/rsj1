import { expect, test, type Page } from '@playwright/test'
import { edgeTickFor } from '../support/jumpHarness'

type JumpDebug = {
  phase: string
  tick: number
  gate: number
  gateSource?: 'auto' | 'manual' | null
  gateAutoNumber?: number | null
  gateForecastMean?: number | null
  speedKmh: number
  heightAboveSurface: number
  distance: number | null
  status: string | null
  terminalPhase: string | null
  windUserMetersPerSecond: number
  windMeasuredMetersPerSecond: number | null
  windSeed: number | null
  resultTotalTenths: number | null
  resultComponentsTenths: {
    distance: number
    style: number
    wind: number
    juryGate: number
    coachGate: number
  } | null
  leadingTargetHalfMeters: number | null
  attemptNumber: number
  completedAttempts: number
  technicalView: boolean
  snowEnabled: boolean
  events: string[]
  visualPose: string
  visualFrame: number
} | null

type Snapshot = {
  screen: string
  paused: boolean
  pauseReason: string
  tick: number
  jump: JumpDebug
}

const OVERLOAD_REASON = 'zbyt długa przerwa klatki'

function snapshot(page: Page): Promise<Snapshot> {
  return page.evaluate(() => (
    window as unknown as { __retroDebugSnapshot: () => Snapshot }
  ).__retroDebugSnapshot())
}

/**
 * Pętla 120 Hz celowo przechodzi w pauzę, gdy klatka przekroczy limit
 * nadrabiania — pod obciążeniem automatyzacji zdarza się to także w locie.
 * Czekając na warunek, wznawiamy taką pauzę i sprawdzamy, że jej powodem jest
 * wyłącznie ten udokumentowany mechanizm. Ograniczona czasem i stabilnym
 * oknem jak shell resumeIfPaused: 12 szybkich prób wyczerpywało się pod
 * obciążeniem suity, więc wymagamy 96 ms stabilnie bez pauzy w 4 s.
 */
async function resumeIfOverloaded(page: Page, timeoutMs = 4_000): Promise<void> {
  const deadline = Date.now() + timeoutMs
  const stableWindowMs = 96
  let stableSince: number | null = null
  while (Date.now() < deadline) {
    const state = await snapshot(page)
    if (!state.paused) {
      stableSince ??= Date.now()
      if (Date.now() - stableSince >= stableWindowMs) return
      await page.waitForTimeout(24)
      continue
    }
    stableSince = null
    // Udokumentowana pauza przeciążenia albo przejściowy pusty powód —
    // Enter w grze wznawia każdą pauzę. Inne nazwane powody failują.
    if (state.pauseReason !== '' && state.pauseReason !== OVERLOAD_REASON) {
      expect(state.pauseReason).toBe(OVERLOAD_REASON)
      return
    }
    await page.keyboard.press('Enter')
    await page.waitForTimeout(24)
  }
  const evidence = await snapshot(page)
  expect(evidence.paused).toBe(false)
}

async function pressTakeoffUntilImpulse(page: Page): Promise<void> {
  // Najpierw pojedynczy klawisz natychmiast po kotwicy (ten sam timing co
  // historyczny test); pętla ratuje tylko zgubione wejście, nie zmienia timingu.
  await page.keyboard.press('ArrowUp')
  const deadline = Date.now() + 4_000
  while (Date.now() < deadline) {
    const state = await snapshot(page)
    if ((state.jump?.events ?? []).some((entry) => entry.endsWith(' takeoffImpulseStart'))) return
    if (state.paused) {
      await resumeIfOverloaded(page)
      continue
    }
    if (state.jump && state.jump.phase !== 'Inrun' && state.jump.phase !== 'Takeoff') break
    await page.keyboard.press('ArrowUp')
    await page.waitForTimeout(60)
  }
  throw new Error('Wejście wybicia nie zostało potwierdzone zdarzeniem takeoffImpulseStart')
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
 * w wywołaniu). Kotwicą jest stan symulacji, nie wall-tick pierwszego
 * snapshotu. Pauza natychmiast kończy oczekiwanie w stronie (predykat wraca
 * true przy paused), klasyfikujemy powód jednym snapshotem i wznawiamy
 * wyłącznie potwierdzone przeciążenie; blur/hidden failuje. Jeden wspólny
 * deadline zamiast 4×20 s.
 */
async function waitForTakeoffTick(
  page: Page,
  edge: number,
  lead: number,
  timeoutMs = 30_000,
  fastReturnAfterThreshold = false,
): Promise<void> {
  const arg: [number, number] = [edge, lead]
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const remaining = deadline - Date.now()
    let observed: { paused: boolean; pauseReason: string; tick: number; gateTick: number }
    try {
      const handle = await page.waitForFunction(
        ([edgeTicks, leadTicks]: [number, number]) => {
          const state = (window as unknown as { __retroDebugSnapshot: () => {
            paused: boolean
            pauseReason: string
            jump: { tick: number; events: string[] } | null
          } }).__retroDebugSnapshot()
          const jump = state.jump
          if (!jump) return false
          const gateOpen = (jump.events ?? []).find((entry: string) => entry.endsWith(' gateOpen'))
          if (!gateOpen) return false
          const gateTick = Number(gateOpen.split(' ')[0] ?? '0')
          if (state.paused || jump.tick >= gateTick + edgeTicks - leadTicks) {
            return { paused: state.paused, pauseReason: state.pauseReason, tick: jump.tick, gateTick }
          }
          return false
        },
        arg,
        { polling: 'raf', timeout: Math.min(2_000, remaining) },
      )
      observed = await handle.jsonValue() as { paused: boolean; pauseReason: string; tick: number; gateTick: number }
    } catch {
      continue
    }
    if (observed.paused) {
      if (observed.pauseReason !== '' && observed.pauseReason !== OVERLOAD_REASON) {
        expect(observed.pauseReason).toBe(OVERLOAD_REASON)
        return
      }
      await page.keyboard.press('Enter')
      await page.waitForTimeout(16)
      continue
    }
    if (!fastReturnAfterThreshold) {
      const state = await snapshot(page)
      if (state.paused) {
        if (state.pauseReason !== '' && state.pauseReason !== OVERLOAD_REASON) {
          expect(state.pauseReason).toBe(OVERLOAD_REASON)
          return
        }
        await page.keyboard.press('Enter')
        await page.waitForTimeout(16)
        continue
      }
      const jump = state.jump
      const gateOpen = (jump?.events ?? []).find((entry) => entry.endsWith(' gateOpen'))
      if (gateOpen && (jump?.tick ?? 0) >= Number(gateOpen.split(' ')[0] ?? '0') + edge - lead) return
      continue
    }
    if (observed.tick >= observed.gateTick + edge - lead) return
  }
  const final = await snapshot(page)
  const gateOpen = final.jump?.events.find((entry) => entry.endsWith(' gateOpen')) ?? 'brak'
  throw new Error(`Nie osiągnięto progu wybicia: phase=${final.jump?.phase}, tick=${final.jump?.tick}, gateOpen=${gateOpen}, paused=${final.paused}`)
}

/**
 * Próg wybicia dla faktycznej belki bieżącej próby treningowej: po P42 rundzie
 * 11 belka domyślnie wynika z prognozy wiatru, a nie ze stałego 8.
 */
async function waitForAttemptTakeoffTick(
  page: Page,
  lead: number,
  timeoutMs = 30_000,
  fastReturnAfterThreshold = false,
): Promise<void> {
  const gate = (await snapshot(page)).jump?.gate
  if (!gate) throw new Error('Brak belki bieżącej próby treningowej.')
  await waitForTakeoffTick(page, edgeTickFor(gate), lead, timeoutMs, fastReturnAfterThreshold)
}

/**
 * Potwierdzone opuszczenie belki PRAWDZIWYM klawiszem: wznawia wyłącznie
 * potwierdzoną pauzę przeciążenia, wysyła realny ArrowRight i czeka W STRONIE
 * na gateOpen LUB pauzę. Ponawia tylko gdy ta sama próba/start jest nadal
 * nieotwarta; nigdy nie dosyla po gateOpen.
 */
async function openGateAcknowledged(page: Page): Promise<number> {
  const deadline = Date.now() + 15_000
  const startAttempt = (await snapshot(page)).jump?.attemptNumber ?? 1
  let pressStartTick: number | null = null
  while (Date.now() < deadline) {
    const state = await snapshot(page)
    const gateOpen = (state.jump?.events ?? []).find((entry) => entry.endsWith(' gateOpen'))
    if (gateOpen) {
      const gateTick = Number(gateOpen.split(' ')[0] ?? '0')
      return pressStartTick === null ? 0 : Math.max(0, gateTick - pressStartTick)
    }
    if ((state.jump?.attemptNumber ?? startAttempt) !== startAttempt) {
      throw new Error(`Zmiana próby podczas otwierania belki: ${startAttempt} → ${state.jump?.attemptNumber}`)
    }
    if (state.paused) {
      if (state.pauseReason !== '' && state.pauseReason !== OVERLOAD_REASON) {
        expect(state.pauseReason).toBe(OVERLOAD_REASON)
        return 0
      }
      await page.keyboard.press('Enter')
      await page.waitForTimeout(16)
      continue
    }
    if (state.jump?.phase !== 'GateGreen') {
      await page.waitForTimeout(24)
      continue
    }
    pressStartTick = state.jump.tick
    await page.keyboard.press('ArrowRight')
    try {
      await page.waitForFunction(() => {
        const current = (window as unknown as { __retroDebugSnapshot: () => Snapshot }).__retroDebugSnapshot()
        if ((current.jump?.events ?? []).some((entry: string) => entry.endsWith(' gateOpen'))) return true
        if (current.paused) return true
        return false
      }, undefined, { polling: 'raf', timeout: 2_000 })
    } catch {
      // Timeout: pętla sprawdzi gateOpen/próbę przed kolejnym dosłaniem.
    }
  }
  throw new Error('Belka nie otworzyła rozbiegu (brak gateOpen)')
}

/**
 * Kotwica lotu: tick parsowany W STRONIE ze zdarzenia `takeoffEdge`, nie
 * wall-tick pierwszego snapshotu Flight. Pauza natychmiast kończy czekanie,
 * klasyfikowana jak w waitForTakeoffTick, w jednym deadline.
 */
async function waitForTakeoffEdgeTick(page: Page): Promise<number> {
  const deadline = Date.now() + 20_000
  while (Date.now() < deadline) {
    const remaining = deadline - Date.now()
    let outcome: unknown
    try {
      const handle = await page.waitForFunction(() => {
        const state = (window as unknown as { __retroDebugSnapshot: () => {
          paused: boolean
          jump: { events: string[] } | null
        } }).__retroDebugSnapshot()
        if (state.paused) return 'paused'
        const edge = (state.jump?.events ?? []).find((entry: string) => entry.endsWith(' takeoffEdge'))
        if (!edge) return false
        return edge.split(' ')[0] ?? false
      }, undefined, { polling: 'raf', timeout: Math.min(2_000, remaining) })
      outcome = await handle.jsonValue()
    } catch {
      continue
    }
    if (outcome === 'paused') {
      const state = await snapshot(page)
      if (state.pauseReason !== '' && state.pauseReason !== OVERLOAD_REASON) {
        expect(state.pauseReason).toBe(OVERLOAD_REASON)
        throw new Error(`Pauza w locie: ${state.pauseReason}`)
      }
      await page.keyboard.press('Enter')
      await page.waitForTimeout(16)
      continue
    }
    if (typeof outcome === 'string') {
      const tick = Number(outcome)
      if (Number.isFinite(tick)) return tick
    }
  }
  throw new Error('Brak zdarzenia takeoffEdge')
}

/**
 * Czeka W STRONIE na tick >= takeoffEdge+hold (krytyczna korekta lotu).
 * Odporna na pauzę przeciążenia: goły waitForFunction głuchnie, gdy rAF staje
 * pod obciążeniem, więc pętla wznawia potwierdzoną pauzę jak waitForTakeoffTick.
 */
async function waitForFlightTick(page: Page, takeoffTick: number, holdTicks: number): Promise<void> {
  const arg: [number, number] = [takeoffTick, holdTicks]
  const deadline = Date.now() + 60_000
  while (Date.now() < deadline) {
    const remaining = deadline - Date.now()
    try {
      await page.waitForFunction(
        ([takeoff, hold]: [number, number]) => {
          const state = (window as unknown as { __retroDebugSnapshot: () => {
            paused: boolean
            jump: { tick: number } | null
          } }).__retroDebugSnapshot()
          if (state.paused) return true
          return (state.jump?.tick ?? 0) >= takeoff + hold
        },
        arg,
        { polling: 'raf', timeout: Math.min(2_000, remaining) },
      )
    } catch {
      continue
    }
    const state = await snapshot(page)
    if (state.paused) {
      if (state.pauseReason !== '' && state.pauseReason !== OVERLOAD_REASON) {
        expect(state.pauseReason).toBe(OVERLOAD_REASON)
        return
      }
      await page.keyboard.press('Enter')
      await page.waitForTimeout(16)
      continue
    }
    if ((state.jump?.tick ?? 0) >= takeoffTick + holdTicks) return
  }
  throw new Error(`Nie osiągnięto ticku lotu ${takeoffTick}+${holdTicks}`)
}

/** Czeka na zużycie zwolnienia `right` (held w stronie, bez dosyłania keyup). */
async function waitForRightRelease(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const state = (window as unknown as { __retroDebugSnapshot: () => { held: string[] } }).__retroDebugSnapshot()
    return !(state.held ?? []).includes('right')
  }, undefined, { polling: 'raf', timeout: 2_000 })
}

/**
 * Telemark z ograniczonym ponowieniem wyłącznie w locie do LandingPrep.
 * Zgubione T (pauza zjadła wejście) ponawia maks. 3×, nigdy po LandingPrep.
 */
async function pressTelemarkUntilPrep(page: Page): Promise<void> {
  const deadline = Date.now() + 8_000
  let presses = 0
  while (Date.now() < deadline && presses < 5) {
    await page.keyboard.press('KeyT')
    presses += 1
    try {
      await page.waitForFunction(() => {
        const state = (window as unknown as { __retroDebugSnapshot: () => Snapshot }).__retroDebugSnapshot()
        return state.paused || state.jump?.phase !== 'Flight'
      }, undefined, { polling: 'raf', timeout: 1_500 })
    } catch {
      // Sprawdzamy stan przed ewentualnym, ograniczonym ponowieniem klawisza.
    }
    const state = await snapshot(page)
    if (state.paused) {
      await resumeIfOverloaded(page)
      continue
    }
    const phase = state.jump?.phase ?? ''
    if (phase === 'LandingPrep' || phase !== 'Flight') return
  }
}

/**
 * Ograniczone przejście treningowe: przy pauzie przeciążenia wznów i sprawdź
 * ponownie; gdy nadal ukończona poprzednia próba — Enter; czekaj W STRONIE na
 * dokładnie previous+1 i GateGreen LUB pauzę. Bez pomijania, z dokładnym
 * licznikiem ukończonych.
 */
async function advanceTrainingAttempt(page: Page, previousAttempt: number): Promise<void> {
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    const state = await snapshot(page)
    if (state.paused) {
      if (state.pauseReason !== '' && state.pauseReason !== OVERLOAD_REASON) {
        expect(state.pauseReason).toBe(OVERLOAD_REASON)
        return
      }
      await page.keyboard.press('Enter')
      await page.waitForTimeout(24)
      continue
    }
    const attempt = state.jump?.attemptNumber ?? 0
    const completed = state.jump?.completedAttempts ?? 0
    if (attempt === previousAttempt + 1 && state.jump?.phase === 'GateGreen') {
      expect(completed).toBe(previousAttempt)
      return
    }
    if (attempt > previousAttempt + 1) {
      throw new Error(`Pomijanie prób treningu: ${previousAttempt} → ${attempt}`)
    }
    if (attempt === previousAttempt && completed === previousAttempt) {
      await page.keyboard.press('Enter')
      try {
        await page.waitForFunction(
          ([prev]: [number]) => {
            const current = (window as unknown as { __retroDebugSnapshot: () => Snapshot }).__retroDebugSnapshot()
            if (current.paused) return true
            return current.jump?.attemptNumber === prev + 1 && current.jump?.phase === 'GateGreen'
          },
          [previousAttempt] as [number],
          { polling: 'raf', timeout: 3_000 },
        )
      } catch {
        // Pętla zweryfikuje dokładny stan przed kolejnym Enter.
      }
      continue
    }
    await page.waitForTimeout(50)
  }
  throw new Error(`Brak przejścia do próby ${previousAttempt + 1}`)
}

async function openJumpScreen(page: Page, url = '/'): Promise<void> {
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await expect(page.locator('#game-canvas')).toHaveAttribute('aria-label', /ekran tytułowy/)
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await snapshot(page)).screen).toBe('menu')

  // Enter w pauzie wznawia, a dopiero Enter w działającym menu startuje próbę.
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

// Rozmiar okna ustawiamy przed wejściem w tryb pełnoekranowy: po udanym
// `requestFullscreen()` przeglądarka odmawia zmiany rozmiaru okna.
for (const size of [
  { width: 960, height: 540 },
  { width: 1920, height: 1080 },
]) {
  test(`scena produkcyjna i techniczna są zgodne przed opuszczeniem belki w ${size.width}×${size.height}`, async ({ page }) => {
    await page.setViewportSize(size)
    await openJumpScreen(page, '/?debug')

    const state = await snapshot(page)
    expect(state.jump?.phase).toBe('GateGreen')
    expect(state.jump?.gateSource).toBe('auto')
    expect(state.jump?.gate).toBe(state.jump?.gateAutoNumber)
    expect(state.jump?.distance).toBeNull()
    await expect
      .poll(() => page.evaluate(() => document.querySelector('canvas')?.getBoundingClientRect().toJSON()))
      .toMatchObject(size)

    expect(state.jump?.leadingTargetHalfMeters).not.toBeNull()
    // Runda 17: treningowy cel to połowa K–HS (K120/HS134 → 127 m = 254 połówki).
    expect(state.jump?.leadingTargetHalfMeters).toBe(254)
    await page.screenshot({ path: test.info().outputPath(`regression-leading-target-127-${size.width}x${size.height}.png`) })
    await page.screenshot({ path: test.info().outputPath(`regression-scene-production-${size.width}x${size.height}.png`) })
    await page.keyboard.press('KeyD')
    await expect.poll(async () => (await snapshot(page)).jump?.technicalView).toBe(true)
    await page.screenshot({ path: test.info().outputPath(`regression-scene-technical-${size.width}x${size.height}.png`) })
    await page.keyboard.press('KeyD')
  })
}

test('pełny skok sterowany wyłącznie klawiaturą kończy się stanem terminalnym', async ({ page }) => {
  test.setTimeout(120_000)
  await page.setViewportSize({ width: 960, height: 540 })
  await openJumpScreen(page, '/?debug')

  // Zielone światło → potwierdzone opuszczenie belki.
  const keyboardDelayTicks = await openGateAcknowledged(page)
  // Mierzone opóźnienie prawdziwego klawisza kompensuje próg po stronie gry;
  // celujemy w idealny lead 0,20 s = 24 ticki, zamiast stałej wartości IPC.
  // Ponowienie do potwierdzonego impulsu: pierwsza dostarcza timing jak pojedynczy
  // klawisz, kolejne są no-opami albo ratują zgubione wejście pod obciążeniem.
  await waitForAttemptTakeoffTick(page, 24 + keyboardDelayTicks, 30_000, true)
  await pressTakeoffUntilImpulse(page)
  // Kotwica lotu: tick z takeoffEdge w stronie; korekta startuje natychmiast,
  // bez snapshotu ani screenshota w nieprzerwanej ścieżce sterowania.
  const takeoffTick = await waitForTakeoffEdgeTick(page)

  // Korekta pozycji w locie: krótkie przytrzymanie (nie do oporu — pełne
  // spłaszczenie przy słabszym wybiciu wbija w garb, a dryf przeciąga).
  // Model FIS: korygowany lot w przeglądarce wznosi się tylko do ~4 m
  // (nigdy 5 m — garb 6,17°→37° trzyma tor nisko), więc lot wyznaczają ticki
  // symulacji (deterministyczne, odporne na pauzy), nie progi wysokości.
  await page.keyboard.down('ArrowRight')
  await waitForFlightTick(page, takeoffTick, 160)
  await page.keyboard.up('ArrowRight')
  await waitForRightRelease(page)

  // Wczesna sylwetka lotu po zwolnieniu korekty (nadal Flight, przed T).
  const earlySnapshot = await snapshot(page)
  const earlyFlight = earlySnapshot.jump
  expect(earlyFlight?.visualPose, `Early-flight state: ${JSON.stringify(earlySnapshot)}`).toBe('flight')
  expect(earlyFlight?.visualFrame).toBeGreaterThanOrEqual(0)
  expect(earlyFlight?.visualFrame).toBeLessThan(8)

  // Telemark PO oknie wczesnym ( kontakt ~+420): runda 8 PKG-008 wydłużyła
  // karane wczesne podejście z 0,4 s do 1,0 s lotu, więc T przy +90 tickach
  // trafił do środka okna i skracał skok. Używamy jawnego +160 ticków
  // symulacji zamiast liczyć na opóźnienie IPC: to normalny telemark z dużym
  // zapasem przygotowania wobec wymaganych 0,28 s.
  // Późniejsze T (przy +260 i dalej) przy słabszym wybiciu trafiało już po
  // kontakcie (FallSettled). Zgubione T ponawiamy, tylko w locie i maks. 3×.
  await pressTelemarkUntilPrep(page)
  await expect.poll(async () => (await snapshot(page)).jump?.phase, { timeout: 8_000 }).toBe('LandingPrep')
  expect((await snapshot(page)).jump?.visualPose).toBe('landingPrep')
  expect((await snapshot(page)).jump?.visualFrame).toBeLessThan(7)
  // Dokładny kadr tuż nad śniegiem jest w capture P42. Tutaj nie polujemy na
  // jedną klatkę 120 Hz przez CDP — potwierdzony LandingPrep wystarcza dla E2E.
  await page.screenshot({ path: test.info().outputPath('regression-landing-telemark-960x540.png') })

  // Późniejsza faza lotu mieści w jednym kadrze K, HS, cel, rekord i fall line.
  await waitForFlightTick(page, takeoffTick, 260)
  await page.screenshot({ path: test.info().outputPath('regression-markers-production-960x540.png') })
  const productionTick = (await snapshot(page)).jump?.tick ?? 0
  const toggleStartedAt = performance.now()
  await page.keyboard.press('KeyD')
  await expect.poll(async () => (await snapshot(page)).jump?.technicalView, { intervals: [10, 25, 50] }).toBe(true)
  const technicalTick = (await snapshot(page)).jump?.tick ?? 0
  // Przełączenie jest synchroniczne, ale odczyt przez CDP kosztuje na tej
  // maszynie 100–200 ms. Pilnujemy braku nadrabiania ponad realny czas i mały
  // margines planisty 8 ticków, zamiast mieszać opóźnienie IPC z kosztem renderera.
  const toggleWallTicks = (performance.now() - toggleStartedAt) / (1000 / 120)
  expect(technicalTick - productionTick).toBeLessThanOrEqual(Math.ceil(toggleWallTicks) + 8)
  await page.screenshot({ path: test.info().outputPath('regression-markers-technical-960x540.png') })
  await page.keyboard.press('KeyD')
  await waitForJump(page, 'jump.status !== null')
  const finished = await snapshot(page)
  expect(finished.jump?.status).toBe('landed')
  expect(finished.jump?.terminalPhase).toBe('FinishLine')
  expect(finished.jump?.distance ?? 0).toBeGreaterThan(90)
  expect(finished.jump?.windSeed).not.toBeNull()
  expect(finished.jump?.windMeasuredMetersPerSecond).not.toBeNull()
  expect(finished.jump?.resultTotalTenths ?? 0).toBeGreaterThan(0)
  expect(finished.jump?.resultComponentsTenths).not.toBeNull()
  expect(finished.jump?.resultComponentsTenths?.wind).not.toBe(0)
  expect(finished.jump?.resultComponentsTenths?.coachGate).toBe(0)
  expect(finished.jump?.events.filter((entry) => entry.endsWith(' measured'))).toHaveLength(1)
  expect(page.locator('#screen-reader-status')).toContainText(/skok ustany/)

  await page.screenshot({ path: test.info().outputPath('regression-training-result-960x540.png') })

  // Wynik pozwala jednym klawiszem rozpocząć następną próbę.
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await snapshot(page)).jump?.attemptNumber).toBe(2)
  expect((await snapshot(page)).jump?.phase).toBe('GateGreen')
  // Na obciążonej maszynie Playwright sporadycznie gubi pojedynczy keydown.
  // Ponawiamy ten sam klawisz, bez omijania ścieżki klawiaturowej aplikacji.
  for (let attempt = 0; attempt < 4 && (await snapshot(page)).screen !== 'menu'; attempt += 1) {
    if ((await snapshot(page)).paused) await page.keyboard.press('Enter')
    await page.keyboard.press('Backspace')
    await page.waitForTimeout(100)
  }
  await expect.poll(async () => (await snapshot(page)).screen).toBe('menu')
})

test('brak przygotowania kończy się upadkiem i rozliczeniem FallSettled', async ({ page }) => {
  await page.setViewportSize({ width: 960, height: 540 })
  await openJumpScreen(page)

  await openGateAcknowledged(page)
  // Próg w stronie (kotwica: gateOpen + edgeTickFor(faktycznej belki) − 35); potem prawdziwy ↑.
  await waitForAttemptTakeoffTick(page, 45)
  await page.keyboard.press('ArrowUp')
  await waitForTakeoffEdgeTick(page)

  await page.keyboard.down('ArrowRight')
  // waitForJump wznawia pauzę przeciążenia; goły waitForFunction głuchnie,
  // gdy rAF staje pod obciążeniem pełnego przebiegu.
  await waitForJump(page, 'jump.tick >= 1020', 30_000)
  await page.keyboard.up('ArrowRight')

  await waitForJump(page, 'jump.status !== null')
  const finished = await snapshot(page)
  expect(finished.jump?.status).toBe('fall')
  expect(finished.jump?.terminalPhase).toBe('FallSettled')
  expect(finished.jump?.visualPose).toBe('fall')
  expect(finished.jump?.visualFrame).toBe(2)
  expect(finished.jump?.events.some((entry) => entry.endsWith(' fallSettled'))).toBe(true)
  await page.screenshot({ path: test.info().outputPath('regression-training-fall-960x540.png') })

  for (let attempt = 0; attempt < 6 && (await snapshot(page)).screen !== 'menu'; attempt += 1) {
    await resumeIfOverloaded(page)
    if ((await snapshot(page)).screen === 'menu') break
    await page.keyboard.press('Backspace')
    await page.waitForTimeout(80)
  }
  await expect.poll(async () => (await snapshot(page)).screen).toBe('menu')
})

test('R wybiera osobną równoległą animację podejścia i kontaktu', async ({ page }) => {
  await page.setViewportSize({ width: 960, height: 540 })
  await openJumpScreen(page)

  await openGateAcknowledged(page)
  await waitForAttemptTakeoffTick(page, 45)
  await page.keyboard.press('ArrowUp')
  const takeoffTick = await waitForTakeoffEdgeTick(page)
  await page.keyboard.down('ArrowRight')
  await waitForFlightTick(page, takeoffTick, 90)
  await page.keyboard.up('ArrowRight')
  await waitForRightRelease(page)

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const loopState = await snapshot(page)
    if (loopState.paused) {
      await resumeIfOverloaded(page)
      await page.waitForTimeout(16)
      continue
    }
    if ((loopState.jump?.phase ?? '') !== 'Flight') break
    await page.keyboard.press('KeyR')
    await page.waitForTimeout(120)
  }
  const afterParallel = await snapshot(page)
  // Na szybkim hoście LandingPrep może przejść w Outrun/FinishLine między
  // klawiszem a CDP. Zdarzenie jest kontraktem wejścia; dokładne klatki
  // landingParallel pilnują unit/capture P42.
  expect(afterParallel.jump?.events.some((entry) => entry.endsWith(' landingPrep'))).toBe(true)
  if (afterParallel.jump?.phase === 'LandingPrep') {
    expect(afterParallel.jump.visualPose).toBe('landingParallel')
    expect(afterParallel.jump.visualFrame).toBeLessThan(7)
    await waitForJump(page, 'jump.phase === "LandingPrep" && jump.heightAboveSurface <= 1.5')
    const approach = (await snapshot(page)).jump
    expect(approach?.visualPose).toBe('landingParallel')
    expect(approach?.visualFrame).toBeGreaterThanOrEqual(5)
    await page.screenshot({ path: test.info().outputPath('regression-landing-parallel-960x540.png') })
  }

  await waitForJump(page, 'jump.status !== null')
  const finished = await snapshot(page)
  expect(finished.jump?.status).toBe('landed')
  expect(finished.jump?.terminalPhase).toBe('FinishLine')
})

test('pauza w locie zatrzymuje symulację i nie zostawia trzymanego klawisza', async ({ page }) => {
  await page.setViewportSize({ width: 960, height: 540 })
  await openJumpScreen(page)

  await openGateAcknowledged(page)
  // Próg w stronie (kotwica: gateOpen + edgeTickFor(faktycznej belki) − 35); potem prawdziwy ↑.
  await waitForAttemptTakeoffTick(page, 35)
  await page.keyboard.press('ArrowUp')
  await waitForTakeoffEdgeTick(page)
  await page.keyboard.down('ArrowRight')
  await page.waitForFunction(() => {
    const state = (window as unknown as { __retroDebugSnapshot: () => Snapshot }).__retroDebugSnapshot()
    return (state.jump?.tick ?? 0) >= 820
  }, undefined, { polling: 'raf', timeout: 15_000 })

  await page.keyboard.press('KeyP')
  await expect(page.locator('#game-canvas')).toHaveAttribute('aria-label', /pauza/)
  const paused = await snapshot(page)
  await page.waitForTimeout(400)
  const stillPaused = await snapshot(page)
  expect(stillPaused.jump?.tick).toBe(paused.jump?.tick)

  // Fizyczne zwolnienie klawisza w pauzie, a następnie wznowienie.
  await page.keyboard.up('ArrowRight')
  const resumeWallStart = Date.now()
  await page.keyboard.press('Enter')
  await resumeIfOverloaded(page)
  await expect(page.locator('#game-canvas')).not.toHaveAttribute('aria-label', /pauza/)

  const resumed = await snapshot(page)
  // Prawdziwy kontrakt to brak nadrabiania: po wznowieniu sim idzie w czasie
  // rzeczywistym (120 Hz), więc dopuszczamy ticki za zmierzony czas ściany
  // plus mały jawny margines szeregowania (wejście/wznowienie/odpytywanie),
  // a nie sztywną liczbę niezależną od opóźnień CDP (poprzednie <8 padało
  // przy delcie 28 na wolnej maszynie, choć pauza trzymała tick idealnie).
  const wallMs = Date.now() - resumeWallStart
  const elapsedTicks = (resumed.jump?.tick ?? 0) - (paused.jump?.tick ?? 0)
  expect(elapsedTicks).toBeLessThanOrEqual(wallMs / (1000 / 120) + 8)

  await waitForJump(page, 'jump.status !== null')
  const finished = await snapshot(page)
  expect(['landed', 'fall']).toContain(finished.jump?.status)
  expect(['FinishLine', 'FallSettled']).toContain(finished.jump?.terminalPhase)
})

test('ukrycie karty w locie pauzuje symulację bez nadrabiania czasu', async ({ page }) => {
  await page.setViewportSize({ width: 960, height: 540 })
  await openJumpScreen(page)

  await openGateAcknowledged(page)
  // Próg w stronie (kotwica: gateOpen + edgeTickFor(faktycznej belki) − 35); potem prawdziwy ↑.
  await waitForAttemptTakeoffTick(page, 35)
  await page.keyboard.press('ArrowUp')
  await waitForTakeoffEdgeTick(page)

  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(page.locator('#game-canvas')).toHaveAttribute('aria-label', /pauza/)
  const paused = await snapshot(page)
  await page.waitForTimeout(500)
  expect((await snapshot(page)).jump?.tick).toBe(paused.jump?.tick)

  await page.keyboard.press('Enter')
  await page.waitForTimeout(100)
  const resumed = await snapshot(page)
  expect((resumed.jump?.tick ?? 0) - (paused.jump?.tick ?? 0)).toBeLessThan(40)
})

test('belka treningowa zmienia się wyłącznie na zielonym świetle', async ({ page }) => {
  await page.setViewportSize({ width: 960, height: 540 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await snapshot(page)).screen).toBe('menu')
  await resumeIfOverloaded(page)

  // [ ] w menu nie ustawia ręcznej belki.
  await page.keyboard.press('BracketRight')
  await page.keyboard.press('BracketRight')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await snapshot(page)).screen).toBe('jump')
  await resumeIfOverloaded(page)
  const afterMenuBrackets = await snapshot(page)
  expect(afterMenuBrackets.jump?.phase).toBe('GateGreen')
  expect(afterMenuBrackets.jump?.gateSource).toBe('auto')
  expect(afterMenuBrackets.jump?.gate).toBe(afterMenuBrackets.jump?.gateAutoNumber)

  // ]] na zielonym: ta sama próba, auto+2/manual, ten sam seed i auto-propozycja.
  const before = await snapshot(page)
  const attempt = before.jump?.attemptNumber ?? 1
  const auto = before.jump?.gateAutoNumber ?? 0
  const seed = before.jump?.windSeed
  expect(auto).not.toBeNull()
  await page.keyboard.press('BracketRight')
  await resumeIfOverloaded(page)
  await page.keyboard.press('BracketRight')
  await resumeIfOverloaded(page)
  await expect.poll(async () => (await snapshot(page)).jump?.gate).toBe(Math.min(21, auto + 2))
  const retuned = await snapshot(page)
  expect(retuned.jump?.gateSource).toBe('manual')
  expect(retuned.jump?.attemptNumber).toBe(attempt)
  expect(retuned.jump?.gateAutoNumber).toBe(auto)
  expect(retuned.jump?.windSeed).toBe(seed)
  expect(retuned.jump?.phase).toBe('GateGreen')
  expect(retuned.jump?.events).toHaveLength(0)

  // Wyjście z belki potwierdzone zdarzeniem gateOpen, potem [ ] to no-op.
  await openGateAcknowledged(page)
  const opened = await snapshot(page)
  expect(opened.jump?.events[0]).toMatch(/gateOpen/)
  const openedGate = opened.jump?.gate
  expect(opened.jump?.phase).not.toBe('GateGreen')
  await page.keyboard.press('BracketRight')
  await page.keyboard.press('BracketLeft')
  await page.waitForTimeout(120)
  await resumeIfOverloaded(page)
  const afterExit = await snapshot(page)
  expect(afterExit.jump?.gate).toBe(openedGate)
  expect(afterExit.jump?.attemptNumber).toBe(attempt)

  // Po wyjściu do menu nowa sesja treningowa wraca do AUTO.
  await page.keyboard.press('Backspace')
  await expect.poll(async () => (await snapshot(page)).screen).toBe('menu')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await snapshot(page)).screen).toBe('jump')
  const freshSession = await snapshot(page)
  expect(freshSession.jump?.attemptNumber).toBe(1)
  expect(freshSession.jump?.gateSource).toBe('auto')
  expect(freshSession.jump?.gate).toBe(freshSession.jump?.gateAutoNumber)
})

test('Backspace wraca z zielonego światła do menu jednym naciśnięciem, także z pauzy', async ({ page }) => {
  await page.setViewportSize({ width: 960, height: 540 })
  await openJumpScreen(page)
  await resumeIfOverloaded(page)
  expect((await snapshot(page)).jump?.phase).toBe('GateGreen')

  await page.keyboard.press('Backspace')
  await expect.poll(async () => (await snapshot(page)).screen).toBe('menu')

  await page.keyboard.press('Enter')
  await expect.poll(async () => (await snapshot(page)).screen).toBe('jump')
  await resumeIfOverloaded(page)
  await page.keyboard.press('KeyP')
  await expect.poll(async () => (await snapshot(page)).paused).toBe(true)
  await page.keyboard.press('Backspace')
  await expect.poll(async () => (await snapshot(page)).screen).toBe('menu')
  expect((await snapshot(page)).paused).toBe(false)
})

test('Backspace w locie wraca do menu jednym naciśnięciem', async ({ page }) => {
  await page.setViewportSize({ width: 960, height: 540 })
  await openJumpScreen(page)

  await openGateAcknowledged(page)
  await waitForAttemptTakeoffTick(page, 35)
  await page.keyboard.press('ArrowUp')
  await waitForTakeoffEdgeTick(page)
  const inFlight = await snapshot(page)
  expect(['Flight', 'LandingPrep'].includes(inFlight.jump?.phase ?? '')).toBe(true)

  await page.keyboard.press('Backspace')
  await expect.poll(async () => (await snapshot(page)).screen).toBe('menu')
})

test('10 kolejnych prób działa wyłącznie klawiaturą i nie gubi stanu treningu', async ({ page }) => {
  test.setTimeout(240_000)
  await page.setViewportSize({ width: 960, height: 540 })
  await page.addInitScript(() => {
    // Długi soak obciąża współdzielony host. Wznawiamy wyłącznie istniejący
    // bezpiecznik długiej klatki, nadal przez publiczną ścieżkę klawiatury.
    const nativeRequestAnimationFrame = window.requestAnimationFrame.bind(window)
    window.requestAnimationFrame = (callback: FrameRequestCallback): number =>
      nativeRequestAnimationFrame((now) => {
        const state = (window as unknown as {
          __retroDebugSnapshot?: () => { paused: boolean; pauseReason: string }
        }).__retroDebugSnapshot?.()
        if (state?.paused && (state.pauseReason === '' || state.pauseReason === 'zbyt długa przerwa klatki')) {
          const canvas = document.querySelector('#game-canvas')
          canvas?.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', key: 'Enter', bubbles: true }))
          canvas?.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter', key: 'Enter', bubbles: true }))
        }
        callback(now)
      })
  })
  await openJumpScreen(page)

  for (let attempt = 1; attempt <= 10; attempt += 1) {
    await resumeIfOverloaded(page)
    const ready = await snapshot(page)
    expect(ready.jump?.attemptNumber).toBe(attempt)
    expect(ready.jump?.gateSource).toBe('auto')
    expect(ready.jump?.phase).toBe('GateGreen')
    expect(ready.paused).toBe(false)

    // Potwierdzone otwarcie belki dla tej samej próby; nigdy po gateOpen.
    await openGateAcknowledged(page)
    expect((await snapshot(page)).jump?.phase).not.toBe('GateGreen')
    await waitForJump(page, 'jump.status !== null', 35_000)
    const finished = await snapshot(page)
    expect(finished.jump?.completedAttempts).toBe(attempt)
    expect(finished.jump?.resultTotalTenths).not.toBeNull()

    if (attempt < 10) {
      await advanceTrainingAttempt(page, attempt)
    }
  }

  for (let attempt = 0; attempt < 6 && (await snapshot(page)).screen !== 'menu'; attempt += 1) {
    await resumeIfOverloaded(page)
    if ((await snapshot(page)).screen === 'menu') break
    await page.keyboard.press('Backspace')
    await page.waitForTimeout(80)
  }
  await expect.poll(async () => (await snapshot(page)).screen).toBe('menu')
})

test('one-event-one-sound: udany skok treningowy gra każdy dźwięk raz', async ({ page }) => {
  test.setTimeout(180_000)
  await page.setViewportSize({ width: 960, height: 540 })
  await page.addInitScript(() => {
    // Na mocno obciążonym hoście pierwszy rAF po ręcznym wznowieniu potrafi
    // ponownie przekroczyć 66,7 ms. Wznawiamy wyłącznie udokumentowaną pauzę
    // przeciążenia tuż przed callbackiem rAF; wejścia skoku pozostają realnymi
    // klawiszami Playwright i nadal muszą wytworzyć prawdziwe zdarzenia gry.
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
    const store = window as unknown as { __audioStarts: number[] };
    store.__audioStarts = [];
    class FakeAudioContext {
      state = 'suspended';
      currentTime = 0;
      destination = {};
      resume(): Promise<void> {
        this.state = 'running';
        return Promise.resolve();
      }
      createOscillator(): unknown {
        let initialFreq = 0;
        const getStore = (): number[] =>
          (window as unknown as { __audioStarts: number[] }).__audioStarts;
        return {
          type: 'square',
          frequency: {
            setValueAtTime: (value: number): void => {
              initialFreq = value;
            },
            exponentialRampToValueAtTime: (): void => {},
          },
          connect: (node: unknown): unknown => node,
          start: (): void => {
            getStore().push(initialFreq);
          },
          stop: (): void => {},
        };
      }
      createGain(): unknown {
        return {
          gain: {
            setValueAtTime: (): void => {},
            exponentialRampToValueAtTime: (): void => {},
          },
          connect: (node: unknown): unknown => node,
        };
      }
    }
    (window as unknown as { AudioContext: unknown }).AudioContext = FakeAudioContext;
  });
  await openJumpScreen(page, '/?debug')

  await openGateAcknowledged(page)
  await waitForAttemptTakeoffTick(page, 45, 45_000)
  await pressTakeoffUntilImpulse(page)
  const takeoffTick = await waitForTakeoffEdgeTick(page)
  await page.keyboard.down('ArrowRight')
  // Test mierzy one-event-one-sound, nie jakość sportową: bezpieczne wczesne
  // R daje ustany kontakt także przy zmiennym opóźnieniu IPC.
  await waitForFlightTick(page, takeoffTick, 10)
  await page.keyboard.up('ArrowRight')
  await waitForRightRelease(page)
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const state = await snapshot(page)
    if (state.paused) {
      await resumeIfOverloaded(page)
      continue
    }
    if (state.jump?.phase !== 'Flight') break
    await page.keyboard.press('KeyR')
    await page.waitForTimeout(120)
  }

  await waitForJump(page, 'jump.status !== null')
  const finished = await snapshot(page)
  expect(finished.jump?.status).toBe('landed')
  expect(finished.jump?.distance ?? 0).toBeGreaterThan(15)

  const starts = await page.evaluate(
    () => (window as unknown as { __audioStarts?: number[] }).__audioStarts ?? [],
  )
  const count = (freq: number): number => starts.filter((value) => value === freq).length
  expect(count(220)).toBe(1)
  expect(count(165)).toBe(1)
  expect(count(150)).toBe(1)
  expect(count(330)).toBe(1)
  expect(count(90)).toBe(0)
  expect(starts).toHaveLength(4)
})
