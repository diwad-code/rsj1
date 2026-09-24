import { expect, test, type Page } from '@playwright/test'
import { edgeTickFor } from '../support/jumpHarness'
import { ZAKOPANE_LARGE } from '../../src/simulation/hills/zakopaneLarge'
import { buildHill } from '../../src/simulation/technicalHill'
import { DEFAULT_JUMP_PARAMS } from '../../src/simulation/params'
import { SIM_DT } from '../../src/simulation/jump'

const H02 = 'h02-zakopane-large'
const SESSION = 'standard-h02-zakopane-large-1'
type Snapshot = {
  screen: string
  paused: boolean
  pauseReason: string
  menuSelection: string
  selectedHill: { id: string; version: string; name: string; loading: boolean }
  jump: {
    phase: string; tick: number; events: string[]; gate: number; gateSource: string
    flightSeconds: number; flowDeg: number; targetPitchDeg: number
    distance: number | null; status: string | null; technicalView: boolean; completedAttempts: number
  } | null
  competition: {
    view: string; roundId: string; nextStartIndex: number; startPhase: string | null
    handoverReady: boolean; actualGateNumber: number
    lastResult: { resultId: string; status: string; distanceHalfMeters: number; versions: { hill: string } } | null
    jump: { phase: string; tick: number; events: string[]; distance: number | null; status: string | null } | null
  } | null
  persistence: { ready: boolean; saveState: string; resumable: boolean; rejectedReason: string | null; savedRevision: number | null }
  replay: { hillId: string; visualsCompatible: boolean; notice: string; recordedDistanceHalfMeters: number; resultId: string; phase: string | null } | null
}
const state = (page: Page): Promise<Snapshot> => page.evaluate(() => (window as unknown as { __retroDebugSnapshot(): Snapshot }).__retroDebugSnapshot())

async function boot(page: Page, url = '/?debug'): Promise<void> {
  // Przeciążenie maszyny CI może spauzować grę: tylko ten techniczny typ pauzy
  // jest automatycznie wznawiany. Nie przesuwamy symulacji debug setterem.
  await page.addInitScript(() => {
    const w = window as unknown as { __h02ResumeInstalled?: boolean; __retroDebugSnapshot?: () => { paused: boolean; pauseReason: string } }
    if (w.__h02ResumeInstalled) return
    w.__h02ResumeInstalled = true
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
  await page.goto(url)
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
  await page.waitForTimeout(100) // aktualny frame Canvas po zmianie ekranu
  await page.locator('#game-canvas').screenshot({ path: test.info().outputPath(name) })
}

async function pressTakeoff(page: Page, mode: 'training' | 'competition'): Promise<void> {
  const snap = await state(page)
  const gate = mode === 'training' ? snap.jump?.gate : undefined
  const compGate = snap.competition?.actualGateNumber
  const targetGate = mode === 'training' ? gate : compGate
  if (!targetGate) throw new Error('Brak belki przed skokiem H02')
  const edge = edgeTickFor(targetGate, DEFAULT_JUMP_PARAMS, buildHill(ZAKOPANE_LARGE))
  const lead = Math.round(DEFAULT_JUMP_PARAMS.takeoff.idealLeadSeconds / SIM_DT)
  await page.keyboard.press('ArrowRight')
  await expect.poll(async () => (mode === 'training' ? (await state(page)).jump?.events : (await state(page)).competition?.jump?.events)?.some(e => e.endsWith(' gateOpen'))).toBe(true)
  await page.waitForFunction(([edgeTicks, leadTicks, competition]: [number, number, boolean]) => {
    const snapshot = (window as unknown as { __retroDebugSnapshot(): Snapshot }).__retroDebugSnapshot()
    const jump = competition ? snapshot.competition?.jump : snapshot.jump
    const gateOpen = jump?.events.find(e => e.endsWith(' gateOpen'))
    return gateOpen && jump && jump.tick >= Number(gateOpen.split(' ')[0]) + edgeTicks - leadTicks - 10
  }, [edge, lead, mode === 'competition'] as [number, number, boolean], { polling: 'raf', timeout: 30_000 })
  for (let i = 0; i < 10; i += 1) {
    await page.keyboard.press('ArrowUp')
    const jump = mode === 'training' ? (await state(page)).jump : (await state(page)).competition?.jump
    if (jump?.events.some(e => e.endsWith(' takeoffImpulseStart'))) break
    if (jump?.phase !== 'Inrun' && jump?.phase !== 'Takeoff') break
    await page.waitForTimeout(25)
  }
  await expect.poll(async () => (mode === 'training' ? (await state(page)).jump : (await state(page)).competition?.jump)?.events.some(e => e.endsWith(' takeoffImpulseStart'))).toBe(true)
}

async function finishRealJump(page: Page, mode: 'training' | 'competition'): Promise<void> {
  let held: 'ArrowLeft' | 'ArrowRight' | null = null
  let landingSent = false
  const competitionGate = (await state(page)).competition?.actualGateNumber
  const competitionEdge = competitionGate ? edgeTickFor(competitionGate, DEFAULT_JUMP_PARAMS, buildHill(ZAKOPANE_LARGE)) : 0
  const deadline = Date.now() + 22_000
  while (Date.now() < deadline) {
    const snap = await state(page)
    if (mode === 'training' ? snap.jump?.status !== null : snap.competition?.view !== 'jump') break
    const phase = mode === 'training' ? snap.jump?.phase : snap.competition?.jump?.phase
    if (phase === 'Flight') {
      const flightSeconds = snap.jump?.flightSeconds ?? 0
      if ((mode === 'training' && flightSeconds >= 3.2 || mode === 'competition' && snap.competition?.jump && snap.competition.jump.tick >= competitionEdge + 240) && !landingSent) {
        if (held) await page.keyboard.up(held)
        held = null
        await page.keyboard.press('KeyR')
        landingSent = true
      } else if (mode === 'training' && !landingSent && snap.jump) {
        const target = snap.jump.flowDeg + 32
        const next = snap.jump.targetPitchDeg > target + 0.5 ? 'ArrowRight'
          : snap.jump.targetPitchDeg < target - 0.5 ? 'ArrowLeft' : null
        if (held !== next) {
          if (held) await page.keyboard.up(held)
          if (next) await page.keyboard.down(next)
          held = next
        }
      }
    }
    await page.waitForTimeout(20)
  }
  if (held) await page.keyboard.up(held)
  if (mode === 'training') await expect.poll(async () => (await state(page)).jump?.completedAttempts, { timeout: 20_000 }).toBe(1)
  else await expect.poll(async () => (await state(page)).competition?.lastResult, { timeout: 20_000 }).not.toBeNull()
}

test.use({ viewport: { width: 960, height: 540 }, video: { mode: 'on', size: { width: 960, height: 540 } } })

test('pięć skoczni: lewo/prawo w obie strony, H02 w treningu i konfiguracji konkursu', async ({ page }) => {
  await boot(page)
  expect((await state(page)).selectedHill.id).toBe('tech-k120-hs134')
  await choose(page, 'ArrowLeft', 'h04-planica-flying')
  await choose(page, 'ArrowLeft', 'h03-oberstdorf-large')
  await choose(page, 'ArrowLeft', H02)
  await choose(page, 'ArrowRight', 'h03-oberstdorf-large')
  await choose(page, 'ArrowRight', 'h04-planica-flying')
  await choose(page, 'ArrowRight', 'tech-k120-hs134')
  await choose(page, 'ArrowRight', 'h01-lillehammer-normal')
  await choose(page, 'ArrowRight', H02)
  await choose(page, 'ArrowLeft', 'h01-lillehammer-normal')
  await choose(page, 'ArrowRight', H02)
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).screen).toBe('jump')
  expect((await state(page)).jump?.gateSource).toBe('auto')
  await page.keyboard.press('Backspace')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  expect((await state(page)).selectedHill.id).toBe(H02)
  await expect(page.locator('#screen-reader-status')).toContainText('ZAKOPANE')
  await page.keyboard.press('Backspace')
  await choose(page, 'ArrowLeft', 'h01-lillehammer-normal')
  await choose(page, 'ArrowLeft', 'tech-k120-hs134')
  await choose(page, 'ArrowRight', 'h01-lillehammer-normal')
  await choose(page, 'ArrowRight', H02)
})

test('prawdziwy skok H02 klawiaturą: scena, techniczny, wynik oraz trwałe zrzuty i film', async ({ page }) => {
  test.setTimeout(80_000)
  await boot(page)
  await choose(page, 'ArrowLeft', 'h04-planica-flying')
  await choose(page, 'ArrowLeft', 'h03-oberstdorf-large')
  await choose(page, 'ArrowLeft', H02)
  expect((await state(page)).selectedHill.version).toBe('h02-inspired-1')
  await shot(page, 'h02-menu-960x540.png')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).screen).toBe('jump')
  await shot(page, 'h02-scene-960x540.png')
  await page.keyboard.press('KeyD')
  await expect.poll(async () => (await state(page)).jump?.technicalView).toBe(true)
  await shot(page, 'h02-technical-960x540.png')
  await page.keyboard.press('KeyD')
  await pressTakeoff(page, 'training')
  await finishRealJump(page, 'training')
  const finished = (await state(page)).jump
  expect(finished?.distance).toBeGreaterThan(0)
  expect(['landed', 'fall']).toContain(finished?.status)
  await shot(page, 'h02-real-result-960x540.png')
  const video = page.video()
  await page.close()
  await video?.saveAs(test.info().outputPath('h02-real-keyboard-jump-960x540.webm'))
})

test('H02 konkurs: klawiatura, zapis/reload, replay bieżący i starsza wersja, cross-hill restore odrzucony', async ({ page }) => {
  test.setTimeout(100_000)
  await boot(page)
  await choose(page, 'ArrowLeft', 'h04-planica-flying')
  await choose(page, 'ArrowLeft', 'h03-oberstdorf-large')
  await choose(page, 'ArrowLeft', H02)
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).competition?.view).toBe('handover')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('red')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('yellow')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('green')
  await pressTakeoff(page, 'competition')
  await finishRealJump(page, 'competition')
  await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')
  const result = (await state(page)).competition?.lastResult
  expect(result?.distanceHalfMeters).toBeGreaterThan(0)
  expect(result?.versions.hill).toBe('h02-inspired-1')
  await page.keyboard.press('KeyV')
  await expect.poll(async () => (await state(page)).screen).toBe('replay')
  expect((await state(page)).replay).toMatchObject({ hillId: H02, visualsCompatible: true, resultId: result?.resultId })
  await page.waitForFunction(() => (window as unknown as { __retroDebugSnapshot(): Snapshot }).__retroDebugSnapshot().replay?.phase === 'Flight', undefined, { polling: 'raf', timeout: 15_000 })
  await page.keyboard.press('Space') // kadr rzeczywistego lotu z zapisanego replaya
  await shot(page, 'h02-real-replay-960x540.png')
  await page.keyboard.press('Backspace')

  // Reload otwiera techniczną domyślnie; H02 musi mieć swój zapis i resume.
  await boot(page)
  expect((await state(page)).selectedHill.id).toBe('tech-k120-hs134')
  expect((await state(page)).persistence.resumable).toBe(false)
  await choose(page, 'ArrowLeft', 'h04-planica-flying')
  await choose(page, 'ArrowLeft', 'h03-oberstdorf-large')
  await choose(page, 'ArrowLeft', H02)
  await expect.poll(async () => (await state(page)).persistence.resumable).toBe(true)
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).competition?.nextStartIndex).toBeGreaterThanOrEqual(1)
  await page.keyboard.press('KeyP') // boty nie nadpisują przechwyconego checkpointu

  // Podmieniony hillId pod tym samym sessionId nie może wznowić innej skoczni.
  await page.evaluate(async (sessionId) => {
    const db = await new Promise<IDBDatabase>((ok, bad) => {
      const req = indexedDB.open('retro-ski-jumping', 1)
      req.onsuccess = () => ok(req.result)
      req.onerror = () => bad(req.error)
    })
    await new Promise<void>((ok, bad) => {
      const tx = db.transaction('sessions', 'readwrite')
      const r = tx.objectStore('sessions').get(sessionId)
      r.onsuccess = () => {
        if (!r.result) { bad(new Error('Brak checkpointu H02')); return }
        tx.objectStore('sessions').put({ ...r.result, hillId: 'tech-k120-hs134' })
      }
      tx.oncomplete = () => ok()
      tx.onabort = () => bad(tx.error)
    })
    db.close()
  }, SESSION)
  await boot(page)
  await choose(page, 'ArrowLeft', 'h04-planica-flying')
  await choose(page, 'ArrowLeft', 'h03-oberstdorf-large')
  await choose(page, 'ArrowLeft', H02)
  expect((await state(page)).persistence.resumable).toBe(false)
  expect((await state(page)).persistence.rejectedReason).toContain('INNA SKOCZNIA')

  // Replay ma nadal zapisane próbki, lecz stara wersja hillVersion nie może
  // być odtwarzana jako zgodny wizualnie H02 (bez przeliczania wyniku).
  await page.evaluate(async (resultId) => {
    const db = await new Promise<IDBDatabase>((ok, bad) => {
      const req = indexedDB.open('retro-ski-jumping', 1)
      req.onsuccess = () => ok(req.result)
      req.onerror = () => bad(req.error)
    })
    await new Promise<void>((ok, bad) => {
      const tx = db.transaction('replays', 'readwrite')
      const r = tx.objectStore('replays').get(resultId)
      r.onsuccess = () => {
        if (!r.result) { bad(new Error('Brak replay H02')); return }
        const current = r.result
        tx.objectStore('replays').put({ ...current, versions: { ...current.versions, hill: 'h02-inspired-0' } })
      }
      tx.oncomplete = () => ok()
      tx.onabort = () => bad(tx.error)
    })
    db.close()
  }, result!.resultId)
  await boot(page)
  expect((await state(page)).replay).toMatchObject({ hillId: H02, visualsCompatible: false })
  expect((await state(page)).replay?.notice).toContain('STAREGO PROFILU')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  expect((await state(page)).screen).toBe('menu')
})
