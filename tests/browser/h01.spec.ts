import { expect, test, type Page } from '@playwright/test'
import { resolve } from 'node:path'
import { build } from 'vite'
import type * as Fixture from './h01-replay.fixture'
import { edgeTickFor } from '../support/jumpHarness'
import { buildHill } from '../../src/simulation/technicalHill'
import { LILLEHAMMER_NORMAL } from '../../src/simulation/hills/lillehammerNormal'
import { SIM_DT } from '../../src/simulation/jump'
import { DEFAULT_JUMP_PARAMS } from '../../src/simulation/params'

const H01 = 'h01-lillehammer-normal'
type State = {
  screen: string; paused: boolean; selectedHill: { id: string; version: string; loading: boolean }
  menuSelection: string
  persistence: { ready: boolean; resumable: boolean; saveState: string; rejectedReason: string | null }
  jump: { tick: number; events: string[]; gateSource: string; gate: number; leadingTargetHalfMeters: number; phase: string; technicalView: boolean; distance: number | null; status: string | null; completedAttempts: number; attemptNumber: number; targetPitchDeg: number; flowDeg: number; flightSeconds: number } | null
  competition: {
    view: string; roundId: string; nextStartIndex: number; roundSize: number
    standings: Array<{ participantId: string; status: string; totalTenths: number | null }>
    lastAdministrative: { status: string } | null
  } | null
  replay: {
    hillId: string; visualsCompatible: boolean; notice: string
    recordedTotalTenths: number; recordedDistanceHalfMeters: number
  } | null
}
const state = (page: Page) => page.evaluate(() => (window as unknown as { __retroDebugSnapshot(): State }).__retroDebugSnapshot())
async function boot(page: Page, url = '/') {
  await page.addInitScript(() => {
    const w = window as unknown as { __h01ResumeInstalled?: boolean; __retroDebugSnapshot?: () => { paused: boolean; pauseReason: string } }
    if (w.__h01ResumeInstalled) return
    w.__h01ResumeInstalled = true
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
  await page.waitForTimeout(200)
}
async function capture(page: Page, name: string) {
  if ((await state(page)).paused) await page.keyboard.press('Enter')
  await page.locator('canvas').screenshot({ path: test.info().outputPath(`${name}.png`) })
}

test.use({ viewport: { width: 960, height: 540 }, video: { mode: 'on', size: { width: 960, height: 540 } } })
test('H01 keyboard attempt reaches a scored result and can be repeated', async ({ page }) => {
  test.setTimeout(60_000)
  await boot(page)
  await page.keyboard.press('ArrowRight')
  await expect.poll(async () => (await state(page)).selectedHill.id).toBe(H01)
  await expect.poll(async () => (await state(page)).selectedHill.loading).toBe(false)
  await capture(page, 'h01-menu-live')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).screen).toBe('jump')
  await capture(page, 'h01-scene-live')
  const gate = (await state(page)).jump?.gate
  expect(gate).toBe(9)
  const edge = edgeTickFor(gate!, DEFAULT_JUMP_PARAMS, buildHill(LILLEHAMMER_NORMAL))
  const lead = Math.round(DEFAULT_JUMP_PARAMS.takeoff.idealLeadSeconds / SIM_DT)
  await page.keyboard.press('ArrowRight')
  await expect.poll(async () => (await state(page)).jump?.events.some((event) => event.endsWith(' gateOpen'))).toBe(true)
  await page.waitForFunction(([edgeTicks, leadTicks]) => {
    const jump = (window as unknown as { __retroDebugSnapshot(): State }).__retroDebugSnapshot().jump
    const gateOpen = jump?.events.find((event) => event.endsWith(' gateOpen'))
    return gateOpen && jump && jump.tick >= Number(gateOpen.split(' ')[0]) + edgeTicks - leadTicks - 10
  }, [edge, lead], { polling: 'raf', timeout: 30_000 })
  for (let tries = 0; tries < 8; tries += 1) {
    await page.keyboard.press('ArrowUp')
    const jump = (await state(page)).jump
    if (jump?.events.some((event) => event.endsWith(' takeoffImpulseStart'))) break
    if (jump?.phase !== 'Inrun' && jump?.phase !== 'Takeoff') break
    await page.waitForTimeout(50)
  }
  await expect.poll(async () => (await state(page)).jump?.events.some((event) => event.endsWith(' takeoffImpulseStart'))).toBe(true)
  await expect.poll(async () => (await state(page)).jump?.phase).toBe('Flight')
  let held: 'ArrowLeft' | 'ArrowRight' | null = null
  let landingSent = false
  let flightReached = false
  const deadline = Date.now() + 20_000
  while (Date.now() < deadline) {
    const jump = (await state(page)).jump
    if (!jump || jump.status !== null) break
    if (jump.phase === 'Flight') flightReached = true
    if (jump.phase === 'Flight' && jump.flightSeconds >= 2.3 && !landingSent) {
      if (held) await page.keyboard.up(held)
      held = null
      await page.keyboard.press('KeyR')
      landingSent = true
    } else if (jump.phase === 'Flight' && !landingSent) {
      const desired = jump.flowDeg + 28
      const next = jump.targetPitchDeg > desired + 0.5 ? 'ArrowRight'
        : jump.targetPitchDeg < desired - 0.5 ? 'ArrowLeft' : null
      if (held !== next) {
        if (held) await page.keyboard.up(held)
        if (next) await page.keyboard.down(next)
        held = next
      }
    }
    await page.waitForTimeout(24)
  }
  if (held) await page.keyboard.up(held)
  await expect.poll(async () => (await state(page)).jump?.completedAttempts, { timeout: 30_000 }).toBe(1)
  const finished = (await state(page)).jump
  expect(flightReached).toBe(true)
  expect(finished?.distance ?? 0).toBeGreaterThan(0)
  expect(['landed', 'fall']).toContain(finished?.status)
  await capture(page, 'h01-live-result')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).jump?.attemptNumber).toBe(2)
})

test('technical K120 and inspired H01 are selectable; H01 session resumes only on its own version', async ({ page }) => {
  await boot(page, '/?debug')
  const technicalId = (await state(page)).selectedHill.id
  expect(technicalId).toBe('tech-k120-hs134')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).jump?.leadingTargetHalfMeters).toBe(254)
  await capture(page, 'technical-regression')
  await page.keyboard.press('Backspace')
  await page.keyboard.press('ArrowRight')
  await expect.poll(async () => (await state(page)).selectedHill.id).toBe(H01)
  await expect.poll(async () => (await state(page)).selectedHill.loading).toBe(false)
  expect((await state(page)).selectedHill.version).toBe('h01-inspired-4')
  await expect(page.locator('#screen-reader-status')).toContainText('INSPIROWANA')
  await capture(page, 'h01-selection')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).jump?.leadingTargetHalfMeters).toBe(188)
  expect((await state(page)).jump?.gate).toBe(9)
  await capture(page, 'h01-scene')
  await page.keyboard.press('KeyD')
  await expect.poll(async () => (await state(page)).jump?.technicalView).toBe(true)
  await capture(page, 'h01-technical')
  await page.keyboard.press('Backspace')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  await capture(page, 'h01-competition-setup')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')
  await expect.poll(async () => (await state(page)).screen).toBe('competition')
  await capture(page, 'h01-competition-start')

  // Save a non-empty H01 checkpoint and verify its normal restore path.
  await page.keyboard.press('KeyQ')
  await expect.poll(async () => (await state(page)).competition?.view).toBe('withdraw-confirm')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).competition?.view).toBe('result')
  await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')
  const checkpoint = await state(page)
  expect(checkpoint.competition).toMatchObject({
    roundId: 'qualification',
    nextStartIndex: 1,
    lastAdministrative: { status: 'withdrawn' },
  })

  await boot(page)
  expect((await state(page)).selectedHill.id).toBe(technicalId)
  expect((await state(page)).persistence.resumable).toBe(false)
  await page.keyboard.press('ArrowRight')
  await expect.poll(async () => (await state(page)).selectedHill.id).toBe(H01)
  await expect.poll(async () => (await state(page)).selectedHill.loading).toBe(false)
  expect((await state(page)).persistence.resumable).toBe(true)

  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  await page.keyboard.press('Enter')
  await expect.poll(async () => {
    const s = await state(page)
    return s.screen === 'competition'
      && s.competition?.standings.some((entry) => entry.participantId === 'local-01' && entry.status === 'withdrawn') === true
  }).toBe(true)
  const resumed = await state(page)
  expect(resumed.selectedHill.id).toBe(H01)
  expect(resumed.competition).toMatchObject({ roundId: 'qualification', roundSize: 75 })
  expect(resumed.competition?.nextStartIndex ?? 0).toBeGreaterThanOrEqual(1)
  expect(resumed.competition?.standings).toContainEqual(expect.objectContaining({
    participantId: 'local-01',
    status: 'withdrawn',
    totalTenths: null,
  }))

  // Stop bot advancement while verifying the wrong-hill guard against storage.
  await page.keyboard.press('KeyP')
  await expect.poll(async () => (await state(page)).paused).toBe(true)
  await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')
  // A save relabeled as K120 must be rejected rather than restored on H01.
  const storedHillId = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open('retro-ski-jumping', 1)
      r.onsuccess = () => resolve(r.result)
      r.onerror = () => reject(r.error)
    })
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('sessions', 'readwrite')
      const store = tx.objectStore('sessions')
      const r = store.get('standard-h01-lillehammer-normal-5')
      r.onsuccess = () => {
        if (!r.result) {
          reject(new Error('Brak zapisu sesji H01 do testu mismatch.'))
          return
        }
        store.put({ ...r.result, hillId: 'tech-k120-hs134' })
      }
      tx.oncomplete = () => resolve()
      tx.onabort = () => reject(tx.error)
    })
    const hillId = await new Promise<string | undefined>((resolve, reject) => {
      const r = db.transaction('sessions', 'readonly').objectStore('sessions').get('standard-h01-lillehammer-normal-5')
      r.onsuccess = () => resolve(r.result?.hillId)
      r.onerror = () => reject(r.error)
    })
    db.close()
    return hillId
  })
  expect(storedHillId).toBe(technicalId)
  await boot(page)
  expect((await state(page)).selectedHill.id).toBe(technicalId)
  await page.keyboard.press('ArrowRight')
  await expect.poll(async () => (await state(page)).selectedHill.id).toBe(H01)
  await expect.poll(async () => (await state(page)).selectedHill.loading).toBe(false)
  expect((await state(page)).persistence.resumable).toBe(false)
  expect((await state(page)).persistence.rejectedReason).toContain('INNA SKOCZNIA')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  await expect(page.locator('#screen-reader-status')).toContainText('INNA SKOCZNIA')
  await capture(page, 'h01-mismatch-rejected')
})

test('current H01 replay opens; archived prototype replay is refused', async ({ page }) => {
  await boot(page)
  const output = await build({ configFile: false, logLevel: 'silent', build: {
    write: false, minify: false,
    lib: { entry: resolve('tests/browser/h01-replay.fixture.ts'), name: 'H01Fixture', formats: ['iife'] },
  } })
  const bundle = Array.isArray(output) ? output[0] : output
  if (!bundle || !('output' in bundle)) throw new Error('Brak fixture')
  const chunk = bundle.output.find(item => item.type === 'chunk')!
  await page.addScriptTag({ content: chunk.code })
  const recorded = await page.evaluate(() => (window as unknown as { H01Fixture: typeof Fixture }).H01Fixture.install())
  // Capture the result returned by the deterministic fixture, without the live RAF overwriting it.
  await page.evaluate(png => {
    const image = document.createElement('img')
    image.src = png
    image.id = 'recorded-result'
    image.style.cssText = 'position:fixed;inset:0;width:960px;height:540px;image-rendering:pixelated;z-index:10'
    ;(document.fullscreenElement ?? document.body).append(image)
  }, recorded.png)
  await page.locator('#recorded-result').screenshot({ path: test.info().outputPath('h01-result-fixture.png') })
  await boot(page)
  const loaded = await state(page)
  expect(loaded.selectedHill.id).toBe('tech-k120-hs134')
  expect(loaded.replay?.hillId).toBe(H01)
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  expect((await state(page)).menuSelection).toBe('replay')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).screen).toBe('replay')
  expect((await state(page)).replay).toMatchObject({ hillId: H01, visualsCompatible: true })
  expect((await state(page)).replay?.recordedDistanceHalfMeters).toBe(recorded.distance)
  await capture(page, 'h01-replay')
  await page.keyboard.press('Backspace')

  await page.addScriptTag({ content: chunk.code })
  await page.evaluate(() => (window as unknown as { H01Fixture: typeof Fixture }).H01Fixture.install(true))
  await boot(page)
  const archived = await state(page)
  expect(archived.replay).toMatchObject({ hillId: H01, visualsCompatible: false })
  expect(archived.replay?.notice).toContain('STAREGO PROFILU')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  expect((await state(page)).screen).toBe('menu')
  await expect(page.locator('#screen-reader-status')).toContainText(/niedostępna/i)
  await capture(page, 'h01-old-replay-blocked')
})
