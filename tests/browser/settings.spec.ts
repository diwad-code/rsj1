/** PKG-013/P22: user input is always a real Playwright keyboard event. */
import { expect, test, type Page } from '@playwright/test'
import { build } from 'vite'
import { resolve } from 'node:path'
import type * as ReplayFixture from './h01-replay.fixture'
import { DEFAULT_SETTINGS, type GameSettings } from '../../src/settings/settings'

type Snapshot = {
  screen: string
  paused: boolean
  pauseReason: string
  menuSelection: string
  canvasScale: number
  reducedMotion: boolean
  settings: GameSettings
  selectedRow: string
  captureTarget: string | null
  message: string | null
  persistence: { ready: boolean; resultCount: number }
  jump: { phase: string; tick: number; events: string[]; status: string | null } | null
  replay: {
    resultId: string | null
    tick: number
    playing: boolean
    sampleCount: number
    recordedDistanceHalfMeters: number | null
    recordedTotalTenths: number | null
  } | null
}

const state = (page: Page): Promise<Snapshot> => page.evaluate(() => (
  window as unknown as { __retroDebugSnapshot: () => Snapshot }
).__retroDebugSnapshot())

// Windowed viewport screenshots: the title's real Enter gesture still runs, but
// fullscreen is intentionally unavailable, as in shell.spec.ts's API-denial case.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = () => Promise.reject(new Error('test: fullscreen unavailable'))
  })
})

/** Resume only the documented CI frame-gap pause; never treat another pause as success. */
async function resumeIfOverloaded(page: Page): Promise<void> {
  const deadline = Date.now() + 4_000
  let stableSince: number | null = null
  while (Date.now() < deadline) {
    const current = await state(page)
    if (!current.paused) {
      stableSince ??= Date.now()
      if (Date.now() - stableSince >= 96) return
    } else {
      stableSince = null
      if (current.pauseReason !== 'zbyt długa przerwa klatki' || current.screen === 'settings') {
        throw new Error(`Unexpected pause in settings E2E: ${JSON.stringify(current)}`)
      }
      await page.keyboard.press('Enter')
    }
    await page.waitForTimeout(24)
  }
  throw new Error(`Could not resume frame-gap pause: ${JSON.stringify(await state(page))}`)
}

async function boot(page: Page, reload = false): Promise<void> {
  if (reload) await page.reload({ waitUntil: 'domcontentloaded' })
  else await page.goto('/?debug', { waitUntil: 'domcontentloaded' })
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).screen).toBe('menu')
  await expect.poll(async () => (await state(page)).persistence.ready).toBe(true)
  await resumeIfOverloaded(page)
}

async function chooseMenu(page: Page, target: string): Promise<void> {
  for (let index = 0; index < 10; index += 1) {
    await resumeIfOverloaded(page)
    if ((await state(page)).menuSelection === target) return
    await page.keyboard.press('ArrowDown')
  }
  await resumeIfOverloaded(page)
  expect((await state(page)).menuSelection).toBe(target)
}

async function openMenuSelection(page: Page, selection: string, targetScreen: string, confirm = 'Enter'): Promise<void> {
  await chooseMenu(page, selection)
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await resumeIfOverloaded(page)
    await page.keyboard.press(confirm)
    const current = await state(page)
    if (current.screen === targetScreen) return
    if (current.screen !== 'menu') throw new Error(`Unexpected screen after ${confirm}: ${JSON.stringify(current)}`)
    // The intended key may have landed in the overload pause instead of the menu.
    await resumeIfOverloaded(page)
    expect((await state(page)).menuSelection).toBe(selection)
  }
  throw new Error(`Could not open ${targetScreen} with ${confirm}: ${JSON.stringify(await state(page))}`)
}

async function settings(page: Page, confirm = 'Enter'): Promise<void> {
  await openMenuSelection(page, 'settings', 'settings', confirm)
  expect((await state(page)).settings).toBeTruthy()
}

async function row(page: Page, target: string): Promise<void> {
  for (let index = 0; index < 12 && (await state(page)).selectedRow !== target; index += 1) {
    await page.keyboard.press('ArrowDown')
  }
  expect((await state(page)).selectedRow).toBe(target)
}

async function rebind(page: Page, target: string, code: string): Promise<void> {
  await row(page, target)
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).captureTarget).toBe(target)
  await page.keyboard.press(code)
  await expect.poll(async () => (await state(page)).captureTarget).toBeNull()
}

test('blur during settings key capture cancels capture without hiding a pause', async ({ page }) => {
  await boot(page)
  await settings(page)
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).captureTarget).toBe('takeoff')

  await page.evaluate(() => window.dispatchEvent(new Event('blur')))
  await expect.poll(async () => (await state(page)).captureTarget).toBeNull()
  expect((await state(page)).paused).toBe(false)
  expect((await state(page)).settings.bindings.takeoff).toBe('ArrowUp')
  await expect(page.locator('#screen-reader-status')).toContainText('ANULOWANO PRZECHWYTYWANIE')

  await page.keyboard.press('ArrowDown')
  expect((await state(page)).selectedRow).toBe('left')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).captureTarget).toBe('left')
  await page.keyboard.press('Escape')
  await page.keyboard.press('Backspace')
  await expect.poll(async () => (await state(page)).screen).toBe('menu')
  // CI frame-gap overload may pause the menu; resume only that documented pause.
  await resumeIfOverloaded(page)
  expect((await state(page)).paused).toBe(false)
})

test('menu → remap rejects conflicts/reserved keys; emergency + alternative menu keys; training uses bindings and reload/reset persists', async ({ page }) => {
  test.setTimeout(90_000)
  await boot(page)
  await settings(page)
  expect((await state(page)).settings).toEqual(DEFAULT_SETTINGS)

  await row(page, 'takeoff')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).captureTarget).toBe('takeoff')
  await page.keyboard.press('ArrowRight') // bound to another action
  await expect.poll(async () => (await state(page)).message).toMatch(/KONFLIKT|ZAJĘT|PRZYPISAN|DUPLIKAT/i)
  expect((await state(page)).settings.bindings.takeoff).toBe('ArrowUp')
  expect((await state(page)).captureTarget).toBe('takeoff')
  await page.keyboard.press('KeyD') // shell-reserved debug key, never a jump binding
  await expect.poll(async () => (await state(page)).message).toMatch(/NIEDOZWOL|ZAJĘT|ZAREZERWOWAN|NIE MOŻNA/i)
  expect((await state(page)).settings.bindings.takeoff).toBe('ArrowUp')
  expect((await state(page)).captureTarget).toBe('takeoff')
  await page.keyboard.press('KeyW')
  await expect.poll(async () => (await state(page)).settings.bindings.takeoff).toBe('KeyW')
  await rebind(page, 'right', 'KeyA')
  await rebind(page, 'menuConfirm', 'KeyE')
  await rebind(page, 'menuBack', 'KeyB')

  await page.keyboard.press('Backspace') // emergency fallback even after remapping
  await expect.poll(async () => (await state(page)).screen).toBe('menu')
  await settings(page, 'KeyE') // remapped menu confirmation
  await page.keyboard.press('KeyB') // remapped menu back
  await expect.poll(async () => (await state(page)).screen).toBe('menu')
  await settings(page, 'Enter') // emergency confirmation still works
  await page.keyboard.press('Backspace')
  await openMenuSelection(page, 'training', 'jump')
  expect((await state(page)).jump?.phase).toBe('GateGreen')
  await page.keyboard.press('KeyA') // new right binding opens the gate
  await expect.poll(async () => (await state(page)).jump?.events.some(event => event.endsWith(' gateOpen'))).toBe(true)
  for (let attempt = 0; attempt < 8 && !(await state(page)).jump?.events.some(event => event.endsWith(' takeoffImpulseStart')); attempt += 1) {
    await page.keyboard.press('KeyW')
    await page.waitForTimeout(35)
  }
  await expect.poll(async () => (await state(page)).jump?.events.some(event => event.endsWith(' takeoffImpulseStart'))).toBe(true)
  await page.keyboard.press('Backspace')
  await expect.poll(async () => (await state(page)).screen).toBe('menu')

  await boot(page, true)
  await settings(page)
  expect((await state(page)).settings.bindings).toMatchObject({ takeoff: 'KeyW', right: 'KeyA' })
  expect((await state(page)).settings).toMatchObject({ menuConfirm: 'KeyE', menuBack: 'KeyB' })
  await row(page, 'reset')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).settings).toEqual(DEFAULT_SETTINGS)
  await boot(page, true)
  await settings(page)
  expect((await state(page)).settings).toEqual(DEFAULT_SETTINGS)
})

test('settings screenshots at both resolutions; scale, text and reduced motion persist on small screens', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await boot(page)
  await settings(page)
  expect((await state(page)).screen).toBe('settings')
  await page.screenshot({ path: test.info().outputPath('settings-1280x720.png') })
  await page.setViewportSize({ width: 960, height: 540 })
  await expect.poll(async () => (await state(page)).canvasScale).toBe(2)
  await page.screenshot({ path: test.info().outputPath('settings-960x540.png') })

  await row(page, 'scaleMode')
  await page.keyboard.press('ArrowRight')
  await expect.poll(async () => (await state(page)).settings.scaleMode).toBe('integer')
  await row(page, 'largeText')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).settings.largeText).toBe(true)
  await row(page, 'reducedMotion')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await state(page)).settings.reducedMotion).toBe(true)
  await expect.poll(async () => (await state(page)).reducedMotion).toBe(true)
  await row(page, 'volume')
  await page.keyboard.press('ArrowLeft')
  await expect.poll(async () => (await state(page)).settings.volume).toBeLessThan(100)
  const before = (await state(page)).settings

  await page.setViewportSize({ width: 400, height: 240 })
  const small = await page.locator('#game-canvas').evaluate(canvas => {
    const bounds = canvas.getBoundingClientRect()
    return { width: bounds.width, height: bounds.height, viewportWidth: innerWidth, viewportHeight: innerHeight }
  })
  expect(small.width).toBeLessThanOrEqual(small.viewportWidth)
  expect(small.height).toBeLessThanOrEqual(small.viewportHeight)
  await expect(page.locator('#game-canvas')).toHaveAttribute('aria-label', /ustawieni/i)
  await boot(page, true)
  await settings(page)
  expect((await state(page)).settings).toEqual(before)
  expect((await state(page)).reducedMotion).toBe(true)
})

test('pre-remap recorded H01 replay keeps its recorded result and sample tick after remap/reload', async ({ page }) => {
  test.setTimeout(90_000)
  await boot(page)
  // The fixture runs the real deterministic simulation and recorder, then stores its
  // samples in IndexedDB; it is not an assertion that a human played a jump.
  const output = await build({ configFile: false, logLevel: 'silent', build: {
    write: false, minify: false,
    lib: { entry: resolve('tests/browser/h01-replay.fixture.ts'), name: 'H01Fixture', formats: ['iife'] },
  } })
  const bundle = Array.isArray(output) ? output[0] : output
  if (!bundle || !('output' in bundle)) throw new Error('Replay fixture bundle unavailable')
  const chunk = bundle.output.find(item => item.type === 'chunk')
  if (!chunk) throw new Error('Replay fixture chunk unavailable')
  await page.addScriptTag({ content: chunk.code })
  const recorded = await page.evaluate(() => (
    window as unknown as { H01Fixture: typeof ReplayFixture }
  ).H01Fixture.install())
  await boot(page, true) // reload the game's saved-replay index

  async function replayAtTick30(): Promise<NonNullable<Snapshot['replay']>> {
    await chooseMenu(page, 'replay')
    await page.keyboard.press('Enter')
    await expect.poll(async () => (await state(page)).screen).toBe('replay')
    await page.keyboard.press('KeyR')
    // Restart resumes playback; real scrub pauses it and clamps at the first tick.
    for (let index = 0; index < 20 && ((await state(page)).replay?.playing || (await state(page)).replay?.tick !== 0); index += 1) {
      await page.keyboard.press('ArrowLeft')
    }
    expect((await state(page)).replay).toMatchObject({ playing: false, tick: 0 })
    await page.keyboard.press('ArrowRight')
    await expect.poll(async () => (await state(page)).replay?.tick).toBe(30)
    const replay = (await state(page)).replay
    if (!replay) throw new Error('Replay disappeared')
    await page.keyboard.press('Backspace')
    await expect.poll(async () => (await state(page)).screen).toBe('menu')
    return replay
  }

  const before = await replayAtTick30()
  expect(before.sampleCount).toBeGreaterThan(20)
  expect(before.recordedDistanceHalfMeters).toBe(recorded.distance)
  expect(before.recordedTotalTenths).toBe(recorded.total)
  await settings(page)
  await rebind(page, 'takeoff', 'KeyW')
  await rebind(page, 'right', 'KeyA')
  await page.keyboard.press('Backspace')
  await boot(page, true)
  expect((await state(page)).settings.bindings).toMatchObject({ takeoff: 'KeyW', right: 'KeyA' })
  const after = await replayAtTick30()
  expect(after).toMatchObject({
    resultId: before.resultId,
    tick: before.tick,
    sampleCount: before.sampleCount,
    recordedDistanceHalfMeters: before.recordedDistanceHalfMeters,
    recordedTotalTenths: before.recordedTotalTenths,
  })
  expect((await state(page)).persistence.resultCount).toBe(0)
})
