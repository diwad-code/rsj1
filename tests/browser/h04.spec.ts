/** PKG-012 V — only real keyboard actions and the current built preview. */
import { expect, test, type Page } from '@playwright/test'
import { edgeTickFor } from '../support/jumpHarness'
import { buildHill } from '../../src/simulation/technicalHill'
import { PLANICA_FLYING } from '../../src/simulation/hills/planicaFlying'
import { buildSportMarkers } from '../../src/render/sportMarkers'
import { DEFAULT_JUMP_PARAMS } from '../../src/simulation/params'
import { SIM_DT } from '../../src/simulation/jump'
import { DB_NAME, DB_VERSION } from '../../src/storage/schema'

const H04 = 'h04-planica-flying'
const VERSION = 'h04-inspired-4'
const SESSION = 'standard-h04-planica-flying-4'
const HILL = buildHill(PLANICA_FLYING)
type Snapshot = {
  screen: string; paused: boolean; pauseReason: string; menuSelection: string
  selectedHill: { id: string; name: string; version: string; loading: boolean }
  jump: {
    phase: string; tick: number; events: string[]; gate: number; gateSource: string
    gateAutoNumber: number | null; gateForecastMean: number | null
    flightSeconds: number; heightAboveSurface: number; flowDeg: number; targetPitchDeg: number
    windUserMetersPerSecond: number; windMeasuredMetersPerSecond: number | null
    distance: number | null; status: string | null; technicalView: boolean; completedAttempts: number
    resultComponentsTenths: { distance: number; wind: number; juryGate: number } | null
  } | null
  competition: {
    view: string; roundId: string; nextStartIndex: number; startPhase: string | null
    juryHeld: boolean; juryGateNumber: number; actualGateNumber: number; safeGateCeiling: number
    botYieldCount: number
    lastResult: { resultId: string; status: string; distanceHalfMeters: number; landingSupportHands: number
      componentTenths: { wind: number; juryGate: number }; versions: { hill: string }
      wind: { measuredMeanUserMetersPerSecond: number } } | null
    jump: { phase: string; tick: number; events: string[]; distance: number | null; status: string | null
      targetPitchDeg: number; flowDeg: number; flightSeconds: number; heightAboveSurface: number } | null
  } | null
  persistence: { ready: boolean; saveState: string; resumable: boolean; rejectedReason: string | null
    recordDistanceHalfMeters: number | null; savedRevision: number | null }
  replay: { hillId: string; visualsCompatible: boolean; notice: string; phase: string | null
    recordedDistanceHalfMeters: number; resultId: string } | null
}
const state = (page: Page): Promise<Snapshot> => page.evaluate(() => (window as unknown as { __retroDebugSnapshot(): Snapshot }).__retroDebugSnapshot())
const path = (name: string): string => test.info().outputPath(name)

async function boot(page: Page): Promise<void> {
  // Resume only the game's documented CI frame-gap pause, without changing simulation state.
  await page.addInitScript(() => {
    const w = window as unknown as { __h04ResumeInstalled?: boolean; __retroDebugSnapshot?: () => { paused: boolean; pauseReason: string } }
    if (w.__h04ResumeInstalled) return
    w.__h04ResumeInstalled = true
    const raf = window.requestAnimationFrame.bind(window)
    window.requestAnimationFrame = callback => raf(now => {
      const snapshot = w.__retroDebugSnapshot?.()
      if (snapshot?.paused && snapshot.pauseReason === 'zbyt długa przerwa klatki') {
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

async function choose(page: Page, key: 'ArrowLeft' | 'ArrowRight', hillId: string): Promise<void> {
  await page.keyboard.press(key)
  await expect.poll(async () => {
    const snapshot = await state(page)
    return snapshot.selectedHill.loading ? null : snapshot.selectedHill.id
  }).toBe(hillId)
}

async function shot(page: Page, name: string): Promise<void> {
  expect((await state(page)).paused).toBe(false)
  const canvas = page.locator('#game-canvas')
  const box = await canvas.boundingBox()
  expect([box?.width, box?.height]).toEqual([960, 540])
  await page.waitForTimeout(100)
  await canvas.screenshot({ path: path(name) })
}

async function startTakeoff(page: Page, mode: 'training' | 'competition'): Promise<void> {
  const before = await state(page)
  const gate = mode === 'training' ? before.jump?.gate : before.competition?.actualGateNumber
  if (!gate) throw new Error('No H04 gate selected for a real keyboard jump')
  const edge = edgeTickFor(gate, DEFAULT_JUMP_PARAMS, HILL)
  const lead = Math.round(DEFAULT_JUMP_PARAMS.takeoff.idealLeadSeconds / SIM_DT)
  const events = async () => mode === 'training' ? (await state(page)).jump?.events : (await state(page)).competition?.jump?.events
  for (let attempt = 0; attempt < 3 && !(await events())?.some(event => event.endsWith(' gateOpen')); attempt += 1) {
    await page.keyboard.press('ArrowRight')
    try {
      await expect.poll(async () => (await events())?.some(event => event.endsWith(' gateOpen')), { timeout: 800 }).toBe(true)
    } catch {
      // A press on the same render frame as gate setup can be missed; retry only while still green.
      if ((mode === 'training' ? (await state(page)).jump?.phase : (await state(page)).competition?.startPhase) !== 'GateGreen'
        && (mode !== 'competition' || (await state(page)).competition?.startPhase !== 'green')) throw new Error('Gate did not open after ArrowRight')
    }
  }
  expect((await events())?.some(event => event.endsWith(' gateOpen'))).toBe(true)
  await page.waitForFunction(([edgeTicks, leadTicks, inCompetition]: [number, number, boolean]) => {
    const snapshot = (window as unknown as { __retroDebugSnapshot(): Snapshot }).__retroDebugSnapshot()
    const jump = inCompetition ? snapshot.competition?.jump : snapshot.jump
    const opened = jump?.events.find(event => event.endsWith(' gateOpen'))
    return opened && jump && jump.tick >= Number(opened.split(' ')[0]) + edgeTicks - leadTicks - 4
  }, [edge, lead, mode === 'competition'] as [number, number, boolean], { polling: 'raf', timeout: 35_000 })
  for (let i = 0; i < 10; i += 1) {
    await page.keyboard.press('ArrowUp')
    const jump = mode === 'training' ? (await state(page)).jump : (await state(page)).competition?.jump
    if (jump?.events.some(event => event.endsWith(' takeoffImpulseStart'))) break
    if (jump?.phase !== 'Inrun' && jump?.phase !== 'Takeoff') break
    await page.waitForTimeout(25)
  }
  await expect.poll(async () => (await events())?.some(event => event.endsWith(' takeoffImpulseStart'))).toBe(true)
}

async function finishRealJump(page: Page, mode: 'training' | 'competition', landing: 'KeyR' | 'KeyT', attempt = 1, clocked = false): Promise<void> {
  let held: 'ArrowLeft' | 'ArrowRight' | null = null
  let landingSent = false
  const deadline = Date.now() + 38_000
  let frames = 0
  let lastFlightTick: number | null = null
  let maxFlightTickDelta = 0
  let maxPitchError = 0
  while (Date.now() < deadline && (!clocked || frames++ < 3_000)) {
    const snapshot = await state(page)
    if (clocked && snapshot.paused) throw new Error(`Clocked H04 flight paused: ${snapshot.pauseReason}`)
    if (mode === 'training' ? snapshot.jump?.status !== null : snapshot.competition?.view !== 'jump') break
    const phase = mode === 'training' ? snapshot.jump?.phase : snapshot.competition?.jump?.phase
    if (phase === 'Flight') {
      const flight = mode === 'training' ? snapshot.jump : snapshot.competition?.jump
      if (flight && clocked) {
        if (lastFlightTick !== null) maxFlightTickDelta = Math.max(maxFlightTickDelta, flight.tick - lastFlightTick)
        lastFlightTick = flight.tick
        maxPitchError = Math.max(maxPitchError, Math.abs(flight.targetPitchDeg - (flight.flowDeg + 29)))
      }
      // Contact readiness is measured before any extra steering/frame advancement.
      const ready = mode === 'training' ? (snapshot.jump?.flightSeconds ?? 0) >= 3.2
        : Boolean(flight && (flight.flightSeconds >= 5
          || (flight.flightSeconds >= 3 && flight.heightAboveSurface <= 1.6)))
      if (!landingSent && ready) {
        if (held) {
          await page.keyboard.up(held)
          if (clocked) await page.clock.runFor(16)
        }
        held = null
        await page.keyboard.press(landing)
        landingSent = true
      } else if (flight && !landingSent) {
        const desired = flight.flowDeg + (mode === 'training' ? 28 : 29)
        const next = flight.targetPitchDeg > desired + 0.5 ? 'ArrowRight'
          : flight.targetPitchDeg < desired - 0.5 ? 'ArrowLeft' : null
        if (held !== next) {
          if (held) {
            await page.keyboard.up(held)
            if (clocked) await page.clock.runFor(16) // keyup must reach a simulation tick before reversal
          }
          if (next) await page.keyboard.down(next)
          held = next
        }
      }
    }
    if (clocked) await page.clock.runFor(16)
    else await page.waitForTimeout(20)
  }
  if (held) await page.keyboard.up(held)
  if (clocked) {
    console.log(`H04 controlled flight: ${frames} frames, max observation gap ${maxFlightTickDelta} ticks, max pitch error ${maxPitchError.toFixed(1)}°`)
    expect(maxFlightTickDelta, 'Steering observations must remain closer than 67 ms of game time').toBeLessThanOrEqual(8)
  }
  expect(landingSent, `No ${landing} input reached the flight: ${JSON.stringify(mode === 'training' ? (await state(page)).jump : (await state(page)).competition?.jump)}`).toBe(true)
  if (mode === 'training') {
    await expect.poll(async () => (await state(page)).jump?.completedAttempts, { timeout: 25_000 }).toBe(attempt)
    expect((await state(page)).jump?.events.some(event => event.endsWith(' landingPrep'))).toBe(true)
  } else {
    if (clocked) {
      // Result commit may need a few game-time ticks after the view leaves
      // 'jump'; advance the paused clock deterministically before asserting.
      for (let i = 0; i < 100 && (await state(page)).competition?.lastResult === null; i += 1) {
        await page.clock.runFor(16)
      }
      expect((await state(page)).competition?.lastResult).not.toBeNull()
    } else await expect.poll(async () => (await state(page)).competition?.lastResult, { timeout: 25_000 }).not.toBeNull()
  }
}

async function trainingLanding(page: Page, landing: 'KeyR' | 'KeyT', first: number): Promise<{ attempt: number; raw: number }> {
  const attempts: Array<{ gate: number; raw: number | null; status: string | null }> = []
  for (let attempt = first; attempt < first + 4; attempt += 1) {
    if (attempt !== first) {
      await page.keyboard.press('Enter')
      await expect.poll(async () => (await state(page)).jump?.phase).toBe('GateGreen')
    }
    const selected = (await state(page)).jump?.gate
    if (!selected) throw new Error('Missing H04 training gate')
    // Reach a representative mammoth landing; real wind and keyboard input remain unchanged.
    // Zachowaj fizyczne pozycje dawnych belek 25/21 po dodaniu 10 niższych.
    const desired = landing === 'KeyR' ? 35 : 31
    for (let step = 0; step < HILL.gates.length && (await state(page)).jump?.gate !== desired; step += 1) {
      const current = (await state(page)).jump?.gate
      if (!current) throw new Error('Missing H04 training gate during adjustment')
      const next = current + (current < desired ? 1 : -1)
      for (let retry = 0; retry < 3; retry += 1) {
        await page.keyboard.press(current < desired ? 'BracketRight' : 'BracketLeft')
        try {
          await expect.poll(async () => (await state(page)).jump?.gate, { timeout: 600 }).toBe(next)
          break
        } catch {
          const observed = (await state(page)).jump?.gate
          if (observed !== current || retry === 2) throw new Error(`Gate step ${current}→${next} failed: ${observed}`)
        }
      }
    }
    await expect.poll(async () => (await state(page)).jump?.gate).toBe(desired)
    await startTakeoff(page, 'training')
    await finishRealJump(page, 'training', landing, attempt)
    const jump = (await state(page)).jump!
    attempts.push({ gate: jump.gate, raw: jump.distance, status: jump.status })
    if (jump.status === 'landed' && (jump.distance ?? 0) >= 200) {
      console.log(`H04 training ${landing}: attempt ${attempt}, gate ${jump.gate}, raw ${jump.distance?.toFixed(2)}m, result floored ${Math.floor((jump.distance ?? 0) * 2) / 2}m, wind ${jump.windMeasuredMetersPerSecond?.toFixed(2)}m/s`)
      return { attempt, raw: jump.distance! }
    }
  }
  throw new Error(`No real landed ${landing} attempt >=200m: ${JSON.stringify(attempts)}`)
}

test.use({ viewport: { width: 960, height: 540 }, video: { mode: 'on', size: { width: 960, height: 540 } } })

test('five hills keyboard selection; H04 map and training menu', async ({ page }) => {
  await boot(page)
  expect((await state(page)).selectedHill.id).toBe('tech-k120-hs134')
  for (const id of [H04, 'h03-oberstdorf-large', 'h02-zakopane-large', 'h01-lillehammer-normal', 'tech-k120-hs134']) {
    await choose(page, 'ArrowLeft', id)
  }
  for (const id of ['h01-lillehammer-normal', 'h02-zakopane-large', 'h03-oberstdorf-large', H04]) {
    await choose(page, 'ArrowRight', id)
  }
  expect((await state(page)).selectedHill.version).toBe(VERSION)
  await expect(page.locator('#screen-reader-status')).toContainText('PLANICA')
  const markers = buildSportMarkers(HILL)
  expect(markers.kPoint).toEqual({ meters: 200, point: HILL.surfacePositionAt(200) })
  expect(markers.hillSize).toEqual({ meters: 240, point: HILL.surfacePositionAt(240) })
  expect(markers.meterLines.map(line => line.meters)).toEqual(Array.from({ length: 16 }, (_, index) => 165 + 5 * index))
  for (const line of markers.meterLines) expect(HILL.surfaceDistanceAtPoint(line.point)).toBeCloseTo(line.meters, 1)
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).screen).toBe('jump')
  expect((await state(page)).jump?.gateSource).toBe('auto')
  await page.keyboard.press('Backspace')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  expect((await state(page)).selectedHill.id).toBe(H04)
})

test('H04 real keyboard mammoth R and T: scene, shared-map technical view, landed results and full video', async ({ page }) => {
  test.setTimeout(230_000)
  await boot(page)
  await choose(page, 'ArrowLeft', H04)
  await shot(page, 'h04-menu-960x540.png')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).screen).toBe('jump')
  await shot(page, 'h04-scene-960x540.png')
  await page.keyboard.press('KeyD')
  await expect.poll(async () => (await state(page)).jump?.technicalView).toBe(true)
  await shot(page, 'h04-technical-960x540.png')
  await page.keyboard.press('KeyD')
  const parallel = await trainingLanding(page, 'KeyR', 1)
  expect(parallel.raw).toBeGreaterThanOrEqual(200)
  await shot(page, 'h04-result-parallel-960x540.png')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).jump?.phase).toBe('GateGreen')
  const telemark = await trainingLanding(page, 'KeyT', parallel.attempt + 1)
  expect(telemark.raw).toBeGreaterThanOrEqual(200)
  await shot(page, 'h04-result-telemark-960x540.png')
  const video = page.video()
  await page.close()
  await video?.saveAs(path('h04-real-keyboard-jumps-960x540.webm'))
})

test('H04 competition, real result, bots, transactional save/reload, current and old-version replay isolation', async ({ page }) => {
  test.setTimeout(170_000)
  await page.clock.install() // before navigation; clock flows normally through the real-keyboard takeoff
  await boot(page)
  await choose(page, 'ArrowLeft', H04)
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).competition?.view).toBe('handover')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('red')
  const initial = (await state(page)).competition!
  console.log(`H04 browser jury AUTO ${initial.juryGateNumber}, safe ceiling ${initial.safeGateCeiling}`)
  expect(initial.juryGateNumber).toBeGreaterThan(1)
  expect(initial.juryGateNumber).toBeLessThanOrEqual(initial.safeGateCeiling)
  await page.keyboard.press('BracketLeft')
  await expect.poll(async () => (await state(page)).competition?.juryGateNumber).toBe(initial.juryGateNumber - 1)
  // Exercise jury adjustment, then restore the real AUTO gate for a playable jump.
  await page.keyboard.press('BracketRight')
  await expect.poll(async () => (await state(page)).competition?.juryGateNumber).toBe(initial.juryGateNumber)
  await page.keyboard.press('KeyJ')
  await expect.poll(async () => (await state(page)).competition?.juryHeld).toBe(true)
  await page.keyboard.press('KeyJ')
  await expect.poll(async () => (await state(page)).competition?.juryHeld).toBe(false)
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('yellow')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('green')
  expect((await state(page)).competition?.actualGateNumber).toBe(initial.juryGateNumber)
  await startTakeoff(page, 'competition')
  // pauseAt requires a browser-clock timestamp in the future; a host new Date()
  // is already in the past by the time its CDP command reaches the browser.
  const virtualNow = await page.evaluate(() => Date.now())
  await page.clock.pauseAt(virtualNow + 50)
  try {
    await finishRealJump(page, 'competition', 'KeyR', 1, true)
  } finally {
    await page.clock.resume() // save, bots and replay continue with the regular flowing clock
  }
  await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')
  const result = (await state(page)).competition?.lastResult
  const contact = (await state(page)).competition?.jump
  console.log(`H04 competition AUTO: gate ${initial.juryGateNumber}, wind ${result?.wind.measuredMeanUserMetersPerSecond.toFixed(2)}m/s, ${result?.status}, raw ${contact?.distance?.toFixed(2)}m, stored ${(result?.distanceHalfMeters ?? 0) / 2}m, flight ${contact?.flightSeconds.toFixed(2)}s, events ${contact?.events.join('; ')}`)
  expect(result?.status).toBe('landed')
  expect(result?.distanceHalfMeters ?? 0).toBeGreaterThanOrEqual(360)
  expect(result?.distanceHalfMeters).toBeGreaterThan(0)
  expect(result?.versions.hill).toBe(VERSION)
  expect(typeof result?.componentTenths.wind).toBe('number')
  expect(typeof result?.componentTenths.juryGate).toBe('number')
  console.log(`H04 competition: ${result?.status}, stored ${(result?.distanceHalfMeters ?? 0) / 2}m, version ${result?.versions.hill}`)
  await page.keyboard.press('KeyV')
  await expect.poll(async () => (await state(page)).screen).toBe('replay')
  expect((await state(page)).replay).toMatchObject({ hillId: H04, visualsCompatible: true, resultId: result?.resultId, recordedDistanceHalfMeters: result?.distanceHalfMeters })
  await page.waitForFunction(() => (window as unknown as { __retroDebugSnapshot(): Snapshot }).__retroDebugSnapshot().replay?.phase === 'Flight', undefined, { polling: 'raf', timeout: 20_000 })
  await page.keyboard.press('Space')
  await shot(page, 'h04-replay-flight-960x540.png')
  await page.keyboard.press('ArrowRight')
  expect((await state(page)).replay?.recordedDistanceHalfMeters).toBe(result?.distanceHalfMeters)
  await page.keyboard.press('Backspace')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).competition?.botYieldCount, { timeout: 20_000 }).toBeGreaterThan(0)
  await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')

  await boot(page)
  expect((await state(page)).selectedHill.id).toBe('tech-k120-hs134')
  expect((await state(page)).persistence.resumable).toBe(false)
  expect((await state(page)).replay).toMatchObject({ hillId: H04, visualsCompatible: true, recordedDistanceHalfMeters: result?.distanceHalfMeters })
  await choose(page, 'ArrowLeft', H04)
  await expect.poll(async () => (await state(page)).persistence.resumable).toBe(true)
  await choose(page, 'ArrowLeft', 'h03-oberstdorf-large')
  expect((await state(page)).persistence.resumable).toBe(false)
  await choose(page, 'ArrowRight', H04)
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  await page.keyboard.press('Enter')
  // Bots may have finished qualification and started the next round (index 0).
  await expect.poll(async () => (await state(page)).persistence.savedRevision ?? 0).toBeGreaterThanOrEqual(2)
  // Resumed competition constructs asynchronously; poll instead of asserting instantly.
  await expect.poll(async () => (await state(page)).competition?.view ?? null, { timeout: 15_000 }).toBeTruthy()
  await page.keyboard.press('KeyP') // stop bot progression while altering test-only IndexedDB
  await expect.poll(async () => (await state(page)).paused).toBe(true)
  await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')

  const modifiedVersion = await page.evaluate(async ([sessionId, dbName, dbVersion]) => {
    const db = await new Promise<IDBDatabase>((ok, bad) => {
      const req = indexedDB.open(dbName, dbVersion)
      req.onsuccess = () => ok(req.result)
      req.onerror = () => bad(req.error)
    })
    await new Promise<void>((ok, bad) => {
      const tx = db.transaction('sessions', 'readwrite')
      const req = tx.objectStore('sessions').get(sessionId)
      req.onsuccess = () => {
        if (!req.result) { bad(new Error('No H04 session checkpoint')); return }
        tx.objectStore('sessions').put({ ...req.result, versions: { ...req.result.versions, hill: 'h04-inspired-1' } })
      }
      tx.oncomplete = () => ok()
      tx.onabort = () => bad(tx.error)
    })
    const version = await new Promise<string>((ok, bad) => {
      const req = db.transaction('sessions', 'readonly').objectStore('sessions').get(sessionId)
      req.onsuccess = () => ok(req.result?.versions?.hill)
      req.onerror = () => bad(req.error)
    })
    db.close()
    return version
  }, [SESSION, DB_NAME, DB_VERSION] as const)
  expect(modifiedVersion).toBe('h04-inspired-1')
  await boot(page)
  await choose(page, 'ArrowLeft', H04)
  expect((await state(page)).persistence.resumable).toBe(false)
  expect((await state(page)).persistence.rejectedReason).toContain('STARY ZAPIS PLANICY')

  await page.evaluate(async ([resultId, dbName, dbVersion]) => {
    const db = await new Promise<IDBDatabase>((ok, bad) => {
      const req = indexedDB.open(dbName, dbVersion)
      req.onsuccess = () => ok(req.result)
      req.onerror = () => bad(req.error)
    })
    await new Promise<void>((ok, bad) => {
      const tx = db.transaction('replays', 'readwrite')
      const req = tx.objectStore('replays').get(resultId)
      req.onsuccess = () => {
        if (!req.result) { bad(new Error('No real H04 replay')); return }
        tx.objectStore('replays').put({ ...req.result, versions: { ...req.result.versions, hill: 'h04-inspired-1' } })
      }
      tx.oncomplete = () => ok()
      tx.onabort = () => bad(tx.error)
    })
    db.close()
  }, [result!.resultId, DB_NAME, DB_VERSION] as const)
  await boot(page)
  expect((await state(page)).replay).toMatchObject({ hillId: H04, visualsCompatible: false, recordedDistanceHalfMeters: result?.distanceHalfMeters })
  expect((await state(page)).replay?.notice).toContain('STAREGO PROFILU')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  expect((await state(page)).screen).toBe('menu') // old replay cannot be presented as current
})
