import { expect, test, type Page } from '@playwright/test'
import { DEFAULT_JUMP_PARAMS } from '../../src/simulation/params'
import { edgeTickFor } from '../support/jumpHarness'

const shotPath = (name: string): string => test.info().outputPath(name)
const OVERLOAD_REASON = 'zbyt długa przerwa klatki'

type CompetitionDebug = {
  view: string
  roundId: string
  nextStartIndex: number
  currentParticipantName: string | null
  startPhase: string | null
  greenSecondsRemaining: number | null
  actualGateNumber: number
  juryGateNumber: number
  lastResult: { resultId: string; participantId: string; status: string; distanceHalfMeters: number; totalTenths: number } | null
  standings: Array<{ participantId: string; rank: number | null; totalTenths: number | null; status: string }>
  jump: { phase: string; tick: number; heightAboveSurface: number; events: string[] } | null
}

type Persistence = {
  ready: boolean
  saveState: 'idle' | 'saving' | 'saved' | 'failed' | 'readonly'
  saveMessage: string
  revision: number
  savedRevision: number | null
  savedNextStartIndex: number | null
  savedRoundId: string | null
  resumable: boolean
  rejectedReason: string | null
  ownerId: string
  leaseRole: 'owner' | 'reader'
  leaseTakeoverAvailable: boolean
  recordDistanceHalfMeters: number | null
  resultCount: number
}

type ReplayDebug = {
  available: boolean
  resultId: string | null
  participantName: string | null
  tick: number
  playing: boolean
  rate: number
  phase: string | null
  progress: number
  visualsCompatible: boolean
  notice: string
  sampleCount: number
  recordedTotalTenths: number | null
  recordedDistanceHalfMeters: number | null
  physicsVersion: string | null
}

type Snapshot = {
  screen: string
  paused: boolean
  pauseReason: string
  held: string[]
  menuSelection: string
  competitionSetup: { profileCount: number; difficulty: string }
  persistence: Persistence
  replay: ReplayDebug | null
  competition: CompetitionDebug | null
  jump: { phase: string; tick: number; gate: number; status: string | null; distance: number | null; events: string[] } | null
}

function snapshot(page: Page): Promise<Snapshot> {
  return page.evaluate(() => (window as unknown as { __retroDebugSnapshot: () => Snapshot }).__retroDebugSnapshot())
}

/** Czeka na zużycie zwolnienia (held w stronie, bez dosyłania keyup w pętli). */
async function waitForHeldRelease(page: Page, action: string, timeoutMs = 2_000): Promise<void> {
  await page.waitForFunction(
    (expected: string) => !(
      window as unknown as { __retroDebugSnapshot: () => Snapshot }
    ).__retroDebugSnapshot().held.includes(expected),
    action,
    { polling: 'raf', timeout: timeoutMs },
  )
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
}

async function pressTakeoffUntilImpulse(page: Page): Promise<void> {
  const deadline = Date.now() + 4_000
  while (Date.now() < deadline) {
    const state = await snapshot(page)
    const jump = state.competition?.jump ?? state.jump
    if ((jump?.events ?? []).some((entry) => entry.endsWith(' takeoffImpulseStart'))) return
    if (state.paused) {
      await resumeIfOverloaded(page)
      await page.waitForTimeout(16)
      continue
    }
    if (jump && jump.phase !== 'Inrun' && jump.phase !== 'Takeoff') break
    await page.keyboard.press('ArrowUp')
    await page.waitForTimeout(16)
  }
  throw new Error('Wejście wybicia nie zostało potwierdzone zdarzeniem takeoffImpulseStart')
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
 * Próg wybicia liczony W STRONIE (rAF, zero CDP na sprawdzenie): tick zdarzenia
 * gateOpen + edgeTickFor − 35. Potem PRAWDZIWY klawisz `ArrowUp` (osobno,
 * w wywołaniu). Działa dla skoku treningowego (state.jump) i konkursowego
 * (state.competition.jump). Pauza natychmiast kończy czekanie w stronie;
 * klasyfikacja w jednym deadline, blur/hidden failuje zamiast cichej zgody.
 */
async function waitForTakeoffTick(page: Page, edge: number, lead: number): Promise<void> {
  const arg: [number, number] = [edge, lead]
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    const remaining = deadline - Date.now()
    try {
      await page.waitForFunction(
        ([edgeTicks, leadTicks]: [number, number]) => {
          const state = (window as unknown as { __retroDebugSnapshot: () => {
            paused: boolean
            jump: { tick: number; events: string[] } | null
            competition: { jump: { tick: number; events: string[] } | null } | null
          } }).__retroDebugSnapshot()
          if (state.paused) return true
          const jump = state.competition?.jump ?? state.jump
          if (!jump) return false
          const gateOpen = (jump.events ?? []).find((entry: string) => entry.endsWith(' gateOpen'))
          if (!gateOpen) return false
          const gateTick = Number(gateOpen.split(' ')[0] ?? '0')
          return jump.tick >= gateTick + edgeTicks - leadTicks
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
    const jump = state.competition?.jump ?? state.jump
    const gateOpen = (jump?.events ?? []).find((entry) => entry.endsWith(' gateOpen'))
    if (gateOpen && (jump?.tick ?? 0) >= Number(gateOpen.split(' ')[0] ?? '0') + edge - lead) return
  }
  throw new Error('Nie osiągnięto progu wybicia')
}

/**
 * Potwierdzone otwarcie belki treningowej: wyłącznie potwierdzona pauza
 * przeciążenia jest wznawiana; realny ArrowRight; czekanie W STRONIE na
 * gateOpen LUB pauzę; ponowienie tylko gdy ta sama próba nadal nieotwarta,
 * nigdy po gateOpen.
 */
async function openTrainingGateAcknowledged(page: Page): Promise<void> {
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    const state = await snapshot(page)
    if ((state.jump?.events ?? []).some((entry) => entry.endsWith(' gateOpen'))) return
    if (state.paused) {
      if (state.pauseReason !== '' && state.pauseReason !== OVERLOAD_REASON) {
        expect(state.pauseReason).toBe(OVERLOAD_REASON)
        return
      }
      await page.keyboard.press('Enter')
      await page.waitForTimeout(16)
      continue
    }
    if ((state.jump?.phase ?? '') !== 'GateGreen') {
      await page.waitForTimeout(24)
      continue
    }
    await page.keyboard.press('ArrowRight')
    try {
      await page.waitForFunction(() => {
        const current = (window as unknown as { __retroDebugSnapshot: () => Snapshot }).__retroDebugSnapshot()
        if ((current.jump?.events ?? []).some((entry: string) => entry.endsWith(' gateOpen'))) return true
        if (current.paused) return true
        return false
      }, undefined, { polling: 'raf', timeout: 2_000 })
    } catch {
      // Pętla zweryfikuje gateOpen przed kolejnym dosłaniem.
    }
  }
  throw new Error('Belka treningowa nie otworzyła rozbiegu (brak gateOpen)')
}

/**
 * Potwierdzone zejście z belki konkursowej (zielona faza startu): ten sam
 * kontrakt co trening — gateOpen LUB pauza w stronie, bez dosyłania po otwarciu.
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
 * Kotwica lotu: tick z `takeoffEdge` w stronie (trening albo konkurs),
 * nie wall-tick pierwszego snapshotu Flight. Pauza klasyfikowana w deadline.
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
          competition: { jump: { events: string[] } | null } | null
        } }).__retroDebugSnapshot()
        if (state.paused) return 'paused'
        const jump = state.competition?.jump ?? state.jump
        const edge = (jump?.events ?? []).find((entry: string) => entry.endsWith(' takeoffEdge'))
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

/** Krytyczna korekta: tick >= takeoffEdge+hold, W STRONIE (trening/konkurs). */
async function waitForFlightTick(page: Page, takeoffTick: number, holdTicks: number): Promise<void> {
  const arg: [number, number] = [takeoffTick, holdTicks]
  await page.waitForFunction(
    ([takeoff, hold]: [number, number]) => {
      const state = (window as unknown as { __retroDebugSnapshot: () => {
        jump: { tick: number } | null
        competition: { jump: { tick: number } | null } | null
      } }).__retroDebugSnapshot()
      const tick = state.competition?.jump?.tick ?? state.jump?.tick ?? 0
      return tick >= takeoff + hold
    },
    arg,
    { polling: 'raf', timeout: 15_000 },
  )
}

async function waitFor(
  page: Page,
  predicate: (state: Snapshot) => boolean,
  description: string,
  timeoutMs = 45_000,
): Promise<Snapshot> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    await resumeIfOverloaded(page)
    const state = await snapshot(page)
    if (predicate(state)) return state
    await page.waitForTimeout(12)
  }
  throw new Error(`Nie osiągnięto stanu: ${description}`)
}

/**
 * Replay sam niczego nie zapisuje, ale przed jego otwarciem może już trwać
 * legalna transakcja bota. Bazę porównania bierzemy dopiero po opróżnieniu tej
 * kolejki: stan `saved` i niezmienny licznik przez krótkie okno obserwacji.
 */
async function waitForStableSavedResultCount(page: Page, stableWindowMs = 400): Promise<Snapshot> {
  const deadline = Date.now() + 5_000
  let observedCount: number | null = null
  let stableSince: number | null = null
  let latest = await snapshot(page)

  while (Date.now() < deadline) {
    latest = await snapshot(page)
    const count = latest.persistence.resultCount
    if (latest.persistence.saveState !== 'saved' || count !== observedCount) {
      observedCount = count
      stableSince = latest.persistence.saveState === 'saved' ? Date.now() : null
    } else {
      stableSince ??= Date.now()
      if (Date.now() - stableSince >= stableWindowMs) return latest
    }
    await page.waitForTimeout(40)
  }

  throw new Error(`Licznik wyników nie ustabilizował się po zapisie: ${JSON.stringify(latest.persistence)}`)
}

async function bootToMenu(page: Page): Promise<void> {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.keyboard.press('Enter')
  await waitFor(page, (state) => state.screen === 'menu' && state.persistence.ready, 'menu z gotowym zapisem')
}

async function openCompetitionSetup(page: Page): Promise<void> {
  await resumeIfOverloaded(page)
  await pressUntilMenu(page, 'ArrowDown', 'competition', 'wybór konkursu')
  await resumeIfOverloaded(page)
  await page.keyboard.press('Enter')
  await waitFor(page, (state) => state.screen === 'competition-setup', 'ekran konfiguracji')
}

/** Pełny skok człowieka prawdziwymi zdarzeniami klawiatury, do zatwierdzonego wyniku. */
async function playHumanJump(page: Page): Promise<CompetitionDebug> {
  await waitFor(page, (state) => state.competition?.view === 'handover' && Boolean(state.competition), 'przekazanie')
  await waitFor(page, (state) => state.screen === 'competition', 'ekran konkursu')
  await page.keyboard.press('Enter')
  const start = await waitFor(page, (state) => state.competition?.startPhase === 'red', 'czerwona faza')
  const gate = start.competition?.actualGateNumber ?? 8
  await page.keyboard.press('Enter')
  await waitFor(page, (state) => state.competition?.startPhase === 'yellow', 'żółta faza')
  await page.keyboard.press('Enter')
  await waitFor(page, (state) => state.competition?.startPhase === 'green', 'zielona faza')
  await openCompetitionGateAcknowledged(page)
  const edgeTick = edgeTickFor(gate)
  // Próg 60 ticków przed krawędzią daje zapas na opóźnienie IPC.
  await waitForTakeoffTick(page, edgeTick, 60)
  await pressTakeoffUntilImpulse(page)
  await waitForHeldRelease(page, 'takeoff')
  // Kotwica: tick z takeoffEdge w stronie; korekta startuje natychmiast.
  const takeoffTick = await waitForTakeoffEdgeTick(page)
  // Krótka korekta i bezpieczne wczesne R: test mierzy zapis/replay,
  // nie jakość sportową skoku pod zmiennym opóźnieniem IPC.
  await page.keyboard.down('ArrowRight')
  await waitForFlightTick(page, takeoffTick, 10)
  await page.keyboard.up('ArrowRight')
  await waitForHeldRelease(page, 'right')
  await page.keyboard.press('KeyR')
  {
    const deadline = Date.now() + 8_000
    let presses = 1
    for (;;) {
      const state = await snapshot(page)
      if (state.paused) {
        await resumeIfOverloaded(page)
        await page.waitForTimeout(16)
        continue
      }
      const phase = state.competition?.jump?.phase ?? ''
      if (phase === 'LandingPrep') break
      if (phase !== 'Flight') break
      if (Date.now() > deadline) break
      if (presses < 5) {
        await page.keyboard.press('KeyR')
        presses += 1
      }
      await page.waitForTimeout(120)
    }
  }
  const settled = await waitFor(
    page,
    (state) => ['result', 'round-summary', 'finished'].includes(state.competition?.view ?? '') && state.competition?.lastResult !== null,
    'zatwierdzony wynik',
  )
  const competition = settled.competition
  if (!competition) throw new Error('brak stanu konkursu po skoku')
  return competition
}

test.use({ video: 'on' })

test.describe('PKG-006 — trwała sesja i replay', () => {
  test('konkurs → wynik → reload → wznowienie → ostatnia powtórka, wyłącznie klawiaturą', async ({ page }) => {
    test.setTimeout(180_000)
    await page.setViewportSize({ width: 960, height: 540 })
    await bootToMenu(page)

    const fresh = await snapshot(page)
    expect(fresh.persistence).toMatchObject({ leaseRole: 'owner', resumable: false, resultCount: 0, recordDistanceHalfMeters: null })
    expect(fresh.replay).toBeNull()

    await openCompetitionSetup(page)
    await page.keyboard.press('ArrowUp')
    await waitFor(page, (state) => state.competitionSetup.difficulty === 'easy', 'trudność łatwa')
    await page.screenshot({ path: shotPath('pkg006-setup-bez-zapisu-960x540.png') })
    await page.keyboard.press('Enter')

    const settled = await playHumanJump(page)
    expect(settled.lastResult?.distanceHalfMeters ?? 0).toBeGreaterThan(30)
    const resultId = settled.lastResult?.resultId
    const humanId = settled.lastResult?.participantId
    const totalTenths = settled.lastResult?.totalTenths ?? 0

    const saved = await waitFor(page, (state) => state.persistence.saveState === 'saved', 'zapisana transakcja')
    expect(saved.persistence.resultCount).toBe(1)
    expect(saved.persistence.savedRevision).toBeGreaterThan(0)
    expect(saved.persistence.recordDistanceHalfMeters).toBe(settled.lastResult?.distanceHalfMeters)
    expect(saved.replay).toMatchObject({ available: true, resultId, visualsCompatible: true })
    expect(saved.replay?.sampleCount ?? 0).toBeGreaterThan(20)
    expect(saved.replay?.recordedTotalTenths).toBe(totalTenths)
    await page.screenshot({ path: shotPath('pkg006-zapis-po-wyniku-960x540.png') })

    const beforeReload = saved.persistence
    const standingsBefore = settled.standings.filter((entry) => entry.totalTenths !== null)

    // --- reload ---------------------------------------------------------------
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.keyboard.press('Enter')
    const restored = await waitFor(
      page,
      (state) => state.screen === 'menu' && state.persistence.ready && state.persistence.resumable,
      'wznawialny zapis po reloadzie',
    )
    expect(restored.persistence).toMatchObject({
      leaseRole: 'owner',
      rejectedReason: null,
      savedRevision: beforeReload.savedRevision,
      savedNextStartIndex: beforeReload.savedNextStartIndex,
      savedRoundId: beforeReload.savedRoundId,
    })
    expect(restored.replay).toMatchObject({ available: true, resultId })

    await openCompetitionSetup(page)
    await page.screenshot({ path: shotPath('pkg006-setup-wznowienie-960x540.png') })
    await page.keyboard.press('Enter')
    const resumed = await waitFor(page, (state) => state.screen === 'competition' && state.competition !== null, 'wznowiony konkurs')

    expect(resumed.competition?.roundId).toBe(beforeReload.savedRoundId)
    // Wznowienie startuje od zapisanego checkpointu; boty ruszają dopiero potem.
    expect(resumed.competition?.nextStartIndex ?? 0).toBeGreaterThanOrEqual(beforeReload.savedNextStartIndex ?? 0)
    const humanRows = (resumed.competition?.standings ?? []).filter((entry) => entry.participantId === humanId)
    expect(humanRows).toHaveLength(1)
    expect(humanRows[0]?.totalTenths).toBe(totalTenths)
    expect(standingsBefore.filter((entry) => entry.participantId === humanId)).toHaveLength(1)
    await page.screenshot({ path: shotPath('pkg006-wznowiony-konkurs-960x540.png') })

    // --- powtórka -------------------------------------------------------------
    const afterBots = await waitFor(page, (state) => state.competition?.view !== 'jump', 'stan pozwalający otworzyć powtórkę')
    expect(afterBots.competition).not.toBeNull()
    await page.keyboard.press('KeyV')
    const replayOpen = await waitFor(page, (state) => state.screen === 'replay', 'ekran powtórki')
    expect(replayOpen.replay).toMatchObject({ playing: true, visualsCompatible: true, resultId })
    expect(replayOpen.replay?.physicsVersion).toBe(DEFAULT_JUMP_PARAMS.physicsVersion)

    await waitFor(page, (state) => (state.replay?.tick ?? 0) > 60, 'odtwarzanie postępuje')
    await page.screenshot({ path: shotPath('pkg006-powtorka-odtwarzanie-960x540.png') })

    const stableBeforeReplayControls = await waitForStableSavedResultCount(page)
    const resultCountBefore = stableBeforeReplayControls.persistence.resultCount
    const recordBefore = stableBeforeReplayControls.persistence.recordDistanceHalfMeters

    await page.keyboard.press('Space')
    const paused = await waitFor(page, (state) => state.replay?.playing === false, 'pauza powtórki')
    const pausedTick = paused.replay?.tick ?? 0
    await page.waitForTimeout(400)
    expect((await snapshot(page)).replay?.tick).toBe(pausedTick)

    await page.keyboard.press('ArrowRight')
    const forward = await waitFor(page, (state) => (state.replay?.tick ?? 0) > pausedTick, 'przewijanie w przód')
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    const backward = await waitFor(page, (state) => (state.replay?.tick ?? 0) < (forward.replay?.tick ?? 0), 'przewijanie w tył')
    expect(backward.replay?.tick ?? 0).toBeGreaterThanOrEqual(0)

    await page.keyboard.press('ArrowUp')
    await waitFor(page, (state) => (state.replay?.rate ?? 1) === 2, 'tempo ×2')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await waitFor(page, (state) => (state.replay?.rate ?? 1) === 0.5, 'tempo ×0,5')
    await page.screenshot({ path: shotPath('pkg006-powtorka-scrub-960x540.png') })

    // Odtwarzanie nie zapisuje, nie nalicza wyniku i nie rusza rekordu.
    const afterReplay = await snapshot(page)
    expect(afterReplay.persistence.resultCount).toBe(resultCountBefore)
    expect(afterReplay.persistence.recordDistanceHalfMeters).toBe(recordBefore)
    expect(afterReplay.replay?.recordedTotalTenths).toBe(totalTenths)
    expect(afterReplay.replay?.recordedDistanceHalfMeters).toBe(settled.lastResult?.distanceHalfMeters)

    await page.keyboard.press('Backspace')
    const back = await waitFor(page, (state) => state.screen === 'competition', 'powrót do konkursu')
    expect(back.competition?.standings.find((entry) => entry.participantId === humanId)?.totalTenths).toBe(totalTenths)
  })

  test('trening nie ustanawia oficjalnego rekordu konkursowego', async ({ page }) => {
    test.setTimeout(120_000)
    await page.setViewportSize({ width: 960, height: 540 })
    await bootToMenu(page)
    expect((await snapshot(page)).persistence.recordDistanceHalfMeters).toBeNull()

  await page.keyboard.press('Enter')
  await waitFor(page, (state) => state.screen === 'jump', 'trening')
  await openTrainingGateAcknowledged(page)
  // Próg 60 ticków przed krawędzią daje zapas na opóźnienie IPC; potem prawdziwy ↑.
  // Gołe ↑ tuż za belką dawało lot 17,7 m prosto w garb.
  const trainingGate = (await snapshot(page)).jump?.gate
  if (!trainingGate) throw new Error('Brak belki bieżącej próby treningowej.')
  await waitForTakeoffTick(page, edgeTickFor(trainingGate), 60)
  await pressTakeoffUntilImpulse(page)
  await waitForHeldRelease(page, 'takeoff')
  const takeoffTick = await waitForTakeoffEdgeTick(page)
  // Krótka korekta i bezpieczne wczesne R. Wszystkie wejścia idą przez klawiaturę.
  // Kotwica: takeoffEdge w stronie; korekta startuje natychmiast.
  await page.keyboard.down('ArrowRight')
  await waitForFlightTick(page, takeoffTick, 10)
  await page.keyboard.up('ArrowRight')
  await waitForHeldRelease(page, 'right')

  await page.keyboard.press('KeyR')
  {
    const deadline = Date.now() + 8_000
    let presses = 1
    for (;;) {
      const state = await snapshot(page)
      if (state.paused) {
        await resumeIfOverloaded(page)
        await page.waitForTimeout(16)
        continue
      }
      const phase = state.jump?.phase ?? ''
      if (phase === 'LandingPrep' || phase !== 'Flight' || Date.now() > deadline) break
      if (presses < 5) {
        await page.keyboard.press('KeyR')
        presses += 1
      }
      await page.waitForTimeout(120)
    }
  }
  const prepared = await snapshot(page)
  expect(prepared.jump?.phase).toBe('LandingPrep')
    const settled = await waitFor(page, (state) => state.jump?.status !== null, 'zakończony skok treningowy', 60_000)
    // Runda 13 dodała fizycznie niższe belki 1–9. Ten test pilnuje trwałości,
    // nie jakości wybicia: potwierdzamy realny impuls, przygotowanie i ustany
    // skok; wczesne R celowo skraca próbę.
    expect(settled.jump?.status).toBe('landed')
    expect(settled.jump?.events.some((entry) => entry.endsWith(' takeoffEdge'))).toBe(true)
    expect(settled.jump?.events.some((entry) => entry.endsWith(' landingPrep'))).toBe(true)
    expect(settled.jump?.distance ?? 0).toBeGreaterThan(15)

    // Trening kończy się bez zapisu wyniku, rekordu i replaya.
    const after = await snapshot(page)
    expect(after.persistence.recordDistanceHalfMeters).toBeNull()
    expect(after.persistence.resultCount).toBe(0)
    expect(after.replay).toBeNull()
  })

  test('replay archiwalnej wersji pokazuje graczowy komunikat zgodności bez przeliczania wyniku', async ({ page }) => {
    test.setTimeout(120_000)
    await page.setViewportSize({ width: 960, height: 540 })
    await bootToMenu(page)

    // Stan brzegowy przygotowany w bazie: replay zapisany na starszej wersji
    // danych wizualnych. Na zwykłym URL produkt pokazuje prosty komunikat dla
    // gracza, zachowując zapisane dane bez przeliczania ich nową fizyką.
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
        id: 'archiwalny-replay',
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
        recordedResult: { resultId: 'archiwalny-wynik', distanceHalfMeters: 237, totalTenths: 1184, status: 'landed' },
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
    await waitFor(page, (state) => state.screen === 'menu' && state.persistence.ready, 'menu po podmianie replaya')
    // Dwa kroki w dół (training → competition → replay) z ponowieniem
    // zgubionego klawisza — ten sam wzorzec co w z_capture_pkg008.
    await pressUntilMenu(page, 'ArrowDown', 'competition', 'menu → konkurs')
    await pressUntilMenu(page, 'ArrowDown', 'replay', 'menu → powtórka')
    await page.keyboard.press('Enter')

    const open = await waitFor(page, (state) => state.screen === 'replay', 'ekran powtórki archiwalnej')
    expect(open.replay).toMatchObject({
      resultId: 'archiwalny-replay',
      visualsCompatible: false,
      physicsVersion: 'archiwalna-0',
      recordedDistanceHalfMeters: 237,
      recordedTotalTenths: 1184,
    })
    expect(open.replay?.notice).toBe('TA POWTÓRKA POCHODZI Z INNEGO WYDANIA GRY')
    await waitFor(page, (state) => (state.replay?.tick ?? 0) > 10, 'odtwarzanie z próbek')
    await page.screenshot({ path: shotPath('pkg006-powtorka-komunikat-zgodnosci-960x540.png') })

    // Nie przeliczamy replaya nową fizyką: zapisany wynik pozostaje bez zmian.
    const afterPlayback = await snapshot(page)
    expect(afterPlayback.replay).toMatchObject({
      recordedDistanceHalfMeters: 237,
      recordedTotalTenths: 1184,
      visualsCompatible: false,
    })
    expect(afterPlayback.persistence.resultCount).toBe(0)
  })

  test('dwie karty: tylko właściciel lease zapisuje, przejęcie po wygaśnięciu', async ({ page, context }) => {
    test.setTimeout(180_000)
    await page.setViewportSize({ width: 960, height: 540 })
    await bootToMenu(page)
    expect((await snapshot(page)).persistence.leaseRole).toBe('owner')

    const second = await context.newPage()
    await second.setViewportSize({ width: 960, height: 540 })
    await bootToMenu(second)
    const reader = await snapshot(second)
    expect(reader.persistence.leaseRole).toBe('reader')
    expect(reader.persistence.saveState).toBe('readonly')
    expect(reader.persistence.leaseTakeoverAvailable).toBe(false)

    // Druga karta nie zapisuje równocześnie tej samej sesji.
    await openCompetitionSetup(second)
    await second.keyboard.press('Enter')
    const denied = await waitFor(
      second,
      (state) => state.screen === 'competition' && state.persistence.saveState === 'readonly',
      'odmowa zapisu w drugiej karcie',
      30_000,
    )
    expect(denied.persistence.saveMessage).toContain('zapisuje karta')
    expect(denied.persistence.resultCount).toBe(0)
    await second.screenshot({ path: shotPath('pkg006-druga-karta-tylko-odczyt-960x540.png') })

    // Zamknięcie właściciela zatrzymuje heartbeat; lease wygasa po TTL.
    await page.close()
    await waitFor(second, (state) => state.persistence.leaseTakeoverAvailable, 'wygasły lease', 70_000)
    await second.keyboard.press('KeyL')
    const owner = await waitFor(second, (state) => state.persistence.leaseRole === 'owner', 'jawne przejęcie zapisu')
    expect(owner.persistence.saveState).not.toBe('readonly')
    await second.screenshot({ path: shotPath('pkg006-przejecie-lease-960x540.png') })
  })
})
