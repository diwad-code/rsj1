/** PKG-011 V: rzeczywiste wejścia klawiatury i wynik renderowany z builda H03. */
import { expect, test, type Page } from '@playwright/test'
import { copyFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { edgeTickFor } from '../support/jumpHarness'
import { OBERSTDORF_LARGE } from '../../src/simulation/hills/oberstdorfLarge'
import { buildHill } from '../../src/simulation/technicalHill'
import { DEFAULT_JUMP_PARAMS } from '../../src/simulation/params'
import { SIM_DT } from '../../src/simulation/jump'

const H03 = 'h03-oberstdorf-large'
const VERSION = 'h03-inspired-1'
const SESSION = 'standard-h03-oberstdorf-large-1'
// Nawet opt-in zapisuje najpierw do katalogu testu; archiwizujemy dopiero po udanej próbie.
const artifactPath = (name: string): string => test.info().outputPath(name)
async function publishArtifacts(names: readonly string[]): Promise<void> {
  if (process.env.H03_CAPTURE_ARTIFACTS !== '1') return
  for (const name of names) {
    await copyFile(artifactPath(name), resolve('docs/evidence/PKG-011/artifacts', name))
  }
}
type Snapshot = {
  screen: string
  paused: boolean
  pauseReason: string
  menuSelection: string
  selectedHill: { id: string; version: string; loading: boolean }
  jump: {
    phase: string; tick: number; events: string[]; gate: number; gateSource: string
    flightSeconds: number; heightAboveSurface: number; flowDeg: number; targetPitchDeg: number
    distance: number | null; status: string | null; technicalView: boolean; completedAttempts: number
    resultComponentsTenths: { distance: number; wind: number; juryGate: number } | null
  } | null
  competition: {
    view: string; roundId: string; nextStartIndex: number; startPhase: string | null
    handoverReady: boolean; juryHeld: boolean; juryGateNumber: number; actualGateNumber: number
    safeGateCeiling: number; botYieldCount: number
    lastResult: {
      resultId: string; status: string; distanceHalfMeters: number; landingSupportHands: number
      componentTenths: { wind: number; juryGate: number; coachGate: number }
      versions: { hill: string }
    } | null
    jump: { phase: string; tick: number; events: string[]; distance: number | null; status: string | null } | null
  } | null
  persistence: {
    ready: boolean; saveState: string; resumable: boolean; rejectedReason: string | null
    savedRevision: number | null; recordDistanceHalfMeters: number | null
  }
  replay: {
    hillId: string; visualsCompatible: boolean; notice: string
    recordedDistanceHalfMeters: number; resultId: string; phase: string | null
  } | null
}
const state = (page: Page): Promise<Snapshot> => page.evaluate(() => (window as unknown as { __retroDebugSnapshot(): Snapshot }).__retroDebugSnapshot())

async function boot(page: Page): Promise<void> {
  // Tylko udokumentowana automatyczna pauza przeciążenia CI; nie ustawiamy stanu gry.
  await page.addInitScript(() => {
    const w = window as unknown as { __h03ResumeInstalled?: boolean; __retroDebugSnapshot?: () => { paused: boolean; pauseReason: string } }
    if (w.__h03ResumeInstalled) return
    w.__h03ResumeInstalled = true
    const raf = window.requestAnimationFrame.bind(window)
    window.requestAnimationFrame = callback => raf(now => {
      const s = w.__retroDebugSnapshot?.()
      if (s?.paused && s.pauseReason === 'zbyt długa przerwa klatki') {
        const canvas = document.querySelector('canvas')
        canvas?.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', bubbles: true }))
        canvas?.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter', bubbles: true }))
      }
      callback(now)
    })
  })
  await page.goto('/?debug')
  await expect.poll(async () => (await state(page)).persistence.ready).toBe(true)
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).screen).toBe('menu')
}

async function choose(page: Page, key: 'ArrowLeft' | 'ArrowRight', expected: string): Promise<void> {
  await page.keyboard.press(key)
  await expect.poll(async () => {
    const snap = await state(page)
    return snap.selectedHill.loading ? null : snap.selectedHill.id
  }).toBe(expected)
}

async function shot(page: Page, name: string): Promise<void> {
  expect((await state(page)).paused).toBe(false)
  const canvas = page.locator('#game-canvas')
  const box = await canvas.boundingBox()
  expect([box?.width, box?.height]).toEqual([960, 540])
  await page.waitForTimeout(100)
  await canvas.screenshot({ path: artifactPath(name) })
}

async function startTakeoff(page: Page, mode: 'training' | 'competition'): Promise<void> {
  const initial = await state(page)
  const gate = mode === 'training' ? initial.jump?.gate : initial.competition?.actualGateNumber
  if (!gate) throw new Error('Brak wybranej belki H03')
  const edge = edgeTickFor(gate, DEFAULT_JUMP_PARAMS, buildHill(OBERSTDORF_LARGE))
  const lead = Math.round(DEFAULT_JUMP_PARAMS.takeoff.idealLeadSeconds / SIM_DT)
  await page.keyboard.press('ArrowRight')
  const events = async () => mode === 'training' ? (await state(page)).jump?.events : (await state(page)).competition?.jump?.events
  await expect.poll(async () => (await events())?.some(e => e.endsWith(' gateOpen'))).toBe(true)
  await page.waitForFunction(([edgeTicks, leadTicks, competition]: [number, number, boolean]) => {
    const snap = (window as unknown as { __retroDebugSnapshot(): Snapshot }).__retroDebugSnapshot()
    const jump = competition ? snap.competition?.jump : snap.jump
    const opened = jump?.events.find(e => e.endsWith(' gateOpen'))
    return opened && jump && jump.tick >= Number(opened.split(' ')[0]) + edgeTicks - leadTicks - (competition ? 4 : 12)
  }, [edge, lead, mode === 'competition'] as [number, number, boolean], { polling: 'raf', timeout: 30_000 })
  for (let i = 0; i < 10; i += 1) {
    await page.keyboard.press('ArrowUp')
    const jump = mode === 'training' ? (await state(page)).jump : (await state(page)).competition?.jump
    if (jump?.events.some(e => e.endsWith(' takeoffImpulseStart'))) break
    if (jump?.phase !== 'Inrun' && jump?.phase !== 'Takeoff') break
    await page.waitForTimeout(25)
  }
  await expect.poll(async () => (await events())?.some(e => e.endsWith(' takeoffImpulseStart'))).toBe(true)
}

async function finishRealJump(page: Page, mode: 'training' | 'competition', style: 'KeyR' | 'KeyT', attempt = 1): Promise<void> {
  let held: 'ArrowLeft' | 'ArrowRight' | null = null
  let landingSent = false
  let previousHeight: number | null = null
  const deadline = Date.now() + 26_000
  while (Date.now() < deadline) {
    const snap = await state(page)
    if (mode === 'training' ? snap.jump?.status !== null : snap.competition?.view !== 'jump') break
    const phase = mode === 'training' ? snap.jump?.phase : snap.competition?.jump?.phase
    if (phase === 'Flight') {
      if (mode === 'training' && snap.jump && !landingSent) {
        // Bufor kilku stopni chroni przed chwilowym przesterowaniem AoA
        // między odczytami CDP i utratą nośności na początku lotu.
        const target = snap.jump.flowDeg + 28
        const next = snap.jump.targetPitchDeg > target + 0.5 ? 'ArrowRight'
          : snap.jump.targetPitchDeg < target - 0.5 ? 'ArrowLeft' : null
        if (held !== next) {
          if (held) await page.keyboard.up(held)
          if (next) await page.keyboard.down(next)
          held = next
        }
      }
      // W konkursie snapshot nie eksponuje flightSeconds; warunek przygotowania
      // opiera się na ticku zdarzenia takeoffEdge z tego samego realnego skoku.
      const edge = snap.competition?.jump?.events.find(e => e.endsWith(' takeoffEdge'))
      // T/R dopiero przy zejściu nad stok; w testach symulacji R po ~3,4 s
      // daje okolice K, a przygotowanie potrzebuje 0,16 / 0,28 s.
      const currentHeight = snap.jump?.heightAboveSurface ?? Infinity
      const descending = previousHeight !== null && currentHeight < previousHeight
      const ready = mode === 'training'
        ? (snap.jump?.flightSeconds ?? 0) >= 2.6 && currentHeight <= 10
          && (descending || (snap.jump?.flightSeconds ?? 0) >= 3.7)
        : Boolean(edge && (snap.competition?.jump?.tick ?? 0) >= Number(edge.split(' ')[0]) + 240)
      if (mode === 'training') previousHeight = currentHeight
      if (!landingSent && ready) {
        if (held) await page.keyboard.up(held)
        held = null
        await page.keyboard.press(style)
        landingSent = true
      }
    }
    await page.waitForTimeout(20)
  }
  if (held) await page.keyboard.up(held)
  if (mode === 'training') {
    await expect.poll(async () => (await state(page)).jump?.completedAttempts, { timeout: 20_000 }).toBe(attempt)
  } else {
    await expect.poll(async () => (await state(page)).competition?.lastResult, { timeout: 20_000 }).not.toBeNull()
  }
}

async function landTraining(page: Page, style: 'KeyR' | 'KeyT', startingAttempt: number): Promise<number> {
  const attempts: Array<{ gate: number; status: string | null; meters: number | null; flightSeconds: number; events: string[] }> = []
  for (let attempt = startingAttempt; attempt < startingAttempt + 4; attempt += 1) {
    if (attempt !== startingAttempt) {
      await page.keyboard.press('Enter')
      await expect.poll(async () => (await state(page)).jump?.phase).toBe('GateGreen')
    }
    // Ręczna wyższa belka treningowa: AUTO wybiera sufit dla konkursu, a tu
    // pokazujemy grywalny długi skok bez zmiany wiatru, fizyki ani seedów.
    const desiredGate = style === 'KeyR' ? 24 : 23
    const currentGate = (await state(page)).jump?.gate
    if (currentGate === undefined) throw new Error('Brak belki H03 w treningu')
    const key = currentGate < desiredGate ? 'BracketRight' : 'BracketLeft'
    for (let gate = currentGate; gate !== desiredGate; gate += currentGate < desiredGate ? 1 : -1) {
      await page.keyboard.press(key)
    }
    await expect.poll(async () => (await state(page)).jump?.gate).toBe(desiredGate)
    await startTakeoff(page, 'training')
    await finishRealJump(page, 'training', style, attempt)
    const jump = (await state(page)).jump!
    attempts.push({ gate: jump.gate, status: jump.status, meters: jump.distance, flightSeconds: jump.flightSeconds, events: jump.events })
    if (jump.status === 'landed' && (jump.distance ?? 0) >= 110 && jump.events.some(e => e.endsWith(' landingPrep'))) {
      console.log(`H03 browser ${style}: próba ${attempt}, belka ${jump.gate}, surowe ${jump.distance?.toFixed(2)} m, ustana`)
      return attempt
    }
  }
  throw new Error(`Nie uzyskano ustanej próby ${style}: ${JSON.stringify(attempts)}`)
}

test.use({ viewport: { width: 960, height: 540 }, video: { mode: 'on', size: { width: 960, height: 540 } } })

test('pięć skoczni: pełny cykl w obie strony, H03 trening i konfiguracja konkursu', async ({ page }) => {
  await boot(page)
  expect((await state(page)).selectedHill.id).toBe('tech-k120-hs134')
  await choose(page, 'ArrowLeft', 'h04-planica-flying')
  await choose(page, 'ArrowLeft', H03)
  expect((await state(page)).selectedHill.version).toBe(VERSION)
  await choose(page, 'ArrowLeft', 'h02-zakopane-large')
  await choose(page, 'ArrowLeft', 'h01-lillehammer-normal')
  await choose(page, 'ArrowLeft', 'tech-k120-hs134')
  await choose(page, 'ArrowRight', 'h01-lillehammer-normal')
  await choose(page, 'ArrowRight', 'h02-zakopane-large')
  await choose(page, 'ArrowRight', H03)
  await choose(page, 'ArrowRight', 'h04-planica-flying')
  await choose(page, 'ArrowRight', 'tech-k120-hs134')
  await choose(page, 'ArrowLeft', 'h04-planica-flying')
  await choose(page, 'ArrowLeft', H03)
  await expect(page.locator('#screen-reader-status')).toContainText('OBERSTDORF')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).screen).toBe('jump')
  expect((await state(page)).jump?.gateSource).toBe('auto')
  await page.keyboard.press('Backspace')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  expect((await state(page)).selectedHill.id).toBe(H03)
  await expect(page.locator('#screen-reader-status')).toContainText('OBERSTDORF')
})

test('realna próba H03: menu, produkcyjna/techniczna mapa, R i T, wynik oraz film klawiatury', async ({ page }) => {
  test.setTimeout(180_000)
  await boot(page)
  await choose(page, 'ArrowLeft', 'h04-planica-flying')
  await choose(page, 'ArrowLeft', H03)
  await shot(page, 'h03-menu-960x540.png')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).screen).toBe('jump')
  await shot(page, 'h03-production-gate-960x540.png')
  await page.keyboard.press('KeyD')
  await expect.poll(async () => (await state(page)).jump?.technicalView).toBe(true)
  await shot(page, 'h03-technical-960x540.png')
  await page.keyboard.press('KeyD')
  const parallelAttempt = await landTraining(page, 'KeyR', 1)
  const parallel = (await state(page)).jump
  expect(parallel?.status).toBe('landed')
  expect(parallel?.distance ?? 0).toBeGreaterThanOrEqual(110)
  await shot(page, 'h03-real-result-parallel-960x540.png')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).jump?.phase).toBe('GateGreen')
  await landTraining(page, 'KeyT', parallelAttempt + 1)
  const telemark = (await state(page)).jump
  expect(telemark?.status).toBe('landed')
  expect(telemark?.distance ?? 0).toBeGreaterThanOrEqual(110)
  await shot(page, 'h03-real-result-telemark-960x540.png')
  const video = page.video()
  await page.close()
  await video?.saveAs(artifactPath('h03-real-keyboard-jumps-960x540.webm'))
  await publishArtifacts([
    'h03-menu-960x540.png', 'h03-production-gate-960x540.png', 'h03-technical-960x540.png',
    'h03-real-result-parallel-960x540.png', 'h03-real-result-telemark-960x540.png',
    'h03-real-keyboard-jumps-960x540.webm',
  ])
})

test('H03 konkurs: jury/belki/wiatr, zapis, boty, reload, replay bieżący i odrzucenie starego/cross-hill', async ({ page }) => {
  test.setTimeout(130_000)
  await boot(page)
  await choose(page, 'ArrowLeft', 'h04-planica-flying')
  await choose(page, 'ArrowLeft', H03)
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).competition?.view).toBe('handover')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('red')
  const start = (await state(page)).competition!
  expect(start.juryGateNumber).toBeLessThanOrEqual(start.safeGateCeiling)
  expect(start.juryGateNumber).toBeGreaterThan(1)
  await page.keyboard.press('BracketLeft')
  await expect.poll(async () => (await state(page)).competition?.juryGateNumber).toBe(start.juryGateNumber - 1)
  await page.keyboard.press('KeyJ')
  await expect.poll(async () => (await state(page)).competition?.juryHeld).toBe(true)
  await page.keyboard.press('KeyJ')
  await expect.poll(async () => (await state(page)).competition?.juryHeld).toBe(false)
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('yellow')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('green')
  const gate = (await state(page)).competition!
  expect(gate.actualGateNumber).toBe(start.juryGateNumber - 1)
  await startTakeoff(page, 'competition')
  await finishRealJump(page, 'competition', 'KeyR')
  await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')
  const result = (await state(page)).competition?.lastResult
  expect(result?.distanceHalfMeters).toBeGreaterThan(0)
  expect(result?.versions.hill).toBe(VERSION)
  expect(typeof result?.componentTenths.wind).toBe('number')
  expect(typeof result?.componentTenths.juryGate).toBe('number')
  await page.keyboard.press('KeyV')
  await expect.poll(async () => (await state(page)).screen).toBe('replay')
  expect((await state(page)).replay).toMatchObject({ hillId: H03, resultId: result?.resultId, visualsCompatible: true, recordedDistanceHalfMeters: result?.distanceHalfMeters })
  await page.waitForFunction(() => (window as unknown as { __retroDebugSnapshot(): Snapshot }).__retroDebugSnapshot().replay?.phase === 'Flight', undefined, { polling: 'raf', timeout: 15_000 })
  await page.keyboard.press('Space')
  await shot(page, 'h03-real-replay-flight-960x540.png')
  await page.keyboard.press('ArrowRight') // scrub próbki bez naliczenia drugiego wyniku
  expect((await state(page)).replay?.recordedDistanceHalfMeters).toBe(result?.distanceHalfMeters)
  await page.keyboard.press('Backspace')
  await page.keyboard.press('Enter') // tabela wyniku → boty
  await expect.poll(async () => (await state(page)).competition?.botYieldCount, { timeout: 15_000 }).toBeGreaterThan(0)
  await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')

  await boot(page)
  expect((await state(page)).selectedHill.id).toBe('tech-k120-hs134')
  expect((await state(page)).persistence.resumable).toBe(false)
  await choose(page, 'ArrowLeft', 'h04-planica-flying')
  await choose(page, 'ArrowLeft', H03)
  await expect.poll(async () => (await state(page)).persistence.resumable).toBe(true)
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).competition?.nextStartIndex).toBeGreaterThanOrEqual(1)
  await page.keyboard.press('KeyP')

  // Tylko dane testowego IndexedDB: nie modyfikujemy produkcyjnej ścieżki zapisu.
  await page.evaluate(async (sessionId) => {
    const db = await new Promise<IDBDatabase>((ok, bad) => {
      const req = indexedDB.open('retro-ski-jumping', 1)
      req.onsuccess = () => ok(req.result)
      req.onerror = () => bad(req.error)
    })
    await new Promise<void>((ok, bad) => {
      const tx = db.transaction('sessions', 'readwrite')
      const req = tx.objectStore('sessions').get(sessionId)
      req.onsuccess = () => {
        if (!req.result) { bad(new Error('Brak checkpointu H03')); return }
        tx.objectStore('sessions').put({ ...req.result, hillId: 'tech-k120-hs134' })
      }
      tx.oncomplete = () => ok()
      tx.onabort = () => bad(tx.error)
    })
    db.close()
  }, SESSION)
  await boot(page)
  await choose(page, 'ArrowLeft', 'h04-planica-flying')
  await choose(page, 'ArrowLeft', H03)
  expect((await state(page)).persistence.resumable).toBe(false)
  expect((await state(page)).persistence.rejectedReason).toContain('INNA SKOCZNIA')

  await page.evaluate(async (resultId) => {
    const db = await new Promise<IDBDatabase>((ok, bad) => {
      const req = indexedDB.open('retro-ski-jumping', 1)
      req.onsuccess = () => ok(req.result)
      req.onerror = () => bad(req.error)
    })
    await new Promise<void>((ok, bad) => {
      const tx = db.transaction('replays', 'readwrite')
      const req = tx.objectStore('replays').get(resultId)
      req.onsuccess = () => {
        if (!req.result) { bad(new Error('Brak replay H03')); return }
        tx.objectStore('replays').put({ ...req.result, versions: { ...req.result.versions, hill: 'h03-inspired-0' } })
      }
      tx.oncomplete = () => ok()
      tx.onabort = () => bad(tx.error)
    })
    db.close()
  }, result!.resultId)
  await boot(page)
  expect((await state(page)).replay).toMatchObject({ hillId: H03, visualsCompatible: false, recordedDistanceHalfMeters: result?.distanceHalfMeters })
  expect((await state(page)).replay?.notice).toContain('STAREGO PROFILU')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  expect((await state(page)).screen).toBe('menu')
  await publishArtifacts(['h03-real-replay-flight-960x540.png'])
})

test('regresja H02 bez nadpisywania archiwum: trzy kroki w lewo i zapis konkursu izolowany od H03', async ({ page }) => {
  await boot(page)
  await choose(page, 'ArrowLeft', 'h04-planica-flying')
  await choose(page, 'ArrowLeft', H03)
  await choose(page, 'ArrowLeft', 'h02-zakopane-large')
  expect((await state(page)).persistence.resumable).toBe(false)
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).competition?.view).toBe('handover')
  await page.keyboard.press('KeyQ')
  await expect.poll(async () => (await state(page)).competition?.view).toBe('withdraw-confirm')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).competition?.view).toBe('result')
  await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')
  await boot(page)
  await choose(page, 'ArrowLeft', 'h04-planica-flying')
  await choose(page, 'ArrowLeft', H03)
  expect((await state(page)).persistence.resumable).toBe(false)
  await choose(page, 'ArrowLeft', 'h02-zakopane-large')
  await expect.poll(async () => (await state(page)).persistence.resumable).toBe(true)
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).competition?.nextStartIndex).toBeGreaterThanOrEqual(1)
})
