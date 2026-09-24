import { expect, test, type Page } from '@playwright/test'

type RuntimeDebug = {
  screen: string
  paused: boolean
  pauseReason: string
  journal: string[]
  debugEnabled: boolean
  reducedMotion: boolean
  canvasScale: number
  jump: { technicalView: boolean } | null
}

/**
 * Czeka, aż dokument naprawdę wróci do widocznego stanu, a następnie wymaga
 * stabilnego okna bez pauzy. Pierwszy rAF po przywróceniu może jeszcze wykryć
 * długą przerwę, dlatego Enter ponawiamy wyłącznie wtedy, gdy gra faktycznie
 * jest w pauzie. Brak wznowienia kończy test z pełnym stanem diagnostycznym.
 */
async function resumeIfPaused(page: Page, timeoutMs = 4_000): Promise<void> {
  try {
    await page.waitForFunction(() => document.visibilityState === 'visible', undefined, { timeout: timeoutMs })
  } catch {
    const evidence = await page.evaluate(() => ({
      visibilityState: document.visibilityState,
      runtime: (window as unknown as { __retroDebugSnapshot: () => RuntimeDebug }).__retroDebugSnapshot(),
    }))
    throw new Error(`Dokument nie wrócił do widocznego stanu: ${JSON.stringify(evidence)}`)
  }

  const deadline = Date.now() + timeoutMs
  const stableWindowMs = 96
  let stableSince: number | null = null
  let resumePresses = 0
  let initialPauseReason: string | null = null

  while (Date.now() < deadline) {
    const state = await page.evaluate(() => (
      window as unknown as { __retroDebugSnapshot: () => RuntimeDebug }
    ).__retroDebugSnapshot())

    if (!state.paused) {
      stableSince ??= Date.now()
      if (Date.now() - stableSince >= stableWindowMs) return
      await page.waitForTimeout(24)
      continue
    }

    stableSince = null
    initialPauseReason ??= state.pauseReason
    const expectedRetry = state.pauseReason === ''
      || state.pauseReason === initialPauseReason
      || state.pauseReason === 'zbyt długa przerwa klatki'
    if (!expectedRetry) {
      throw new Error(`Nieoczekiwany powód pauzy podczas wznawiania: ${JSON.stringify(state)}`)
    }

    resumePresses += 1
    await page.keyboard.press('Enter')
    await page.waitForTimeout(24)
  }

  const evidence = await page.evaluate((presses) => ({
    visibilityState: document.visibilityState,
    runtime: (window as unknown as { __retroDebugSnapshot: () => RuntimeDebug }).__retroDebugSnapshot(),
    resumePresses: presses,
  }), resumePresses)
  throw new Error(`Gra nie wznowiła stabilnego działania: ${JSON.stringify(evidence)}`)
}

test('shell działa klawiaturą, skaluje obraz i przeżywa odmowę API', async ({ page }) => {
  await page.addInitScript(() => {
    const state = { fullscreenCalls: 0, audioCalls: 0 }
    Object.defineProperty(window, '__apiTestState', { value: state })
    Element.prototype.requestFullscreen = () => {
      state.fullscreenCalls += 1
      return Promise.reject(new Error('celowa odmowa testowa'))
    }

    class RejectedAudioContext {
      state = 'suspended'
      resume() {
        state.audioCalls += 1
        return Promise.reject(new Error('celowa blokada audio'))
      }
    }
    Object.defineProperty(window, 'AudioContext', { value: RejectedAudioContext })
  })

  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const canvas = page.locator('#game-canvas')
  // Bufor logiczny 480×270 rośnie wyłącznie o całkowity mnożnik.
  await expect(canvas).toHaveAttribute('width', '480')
  await expect(canvas).toHaveAttribute('height', '270')
  await expect(canvas).toHaveAttribute('aria-label', /ekran tytułowy/)
  await expect.poll(() => page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    width: innerWidth,
    canvas: document.querySelector('canvas')?.getBoundingClientRect().toJSON(),
  }))).toMatchObject({
    scrollWidth: 1280,
    width: 1280,
    canvas: { width: 960, height: 540 },
  })
  await page.screenshot({ path: test.info().outputPath('regression-title-1280x720.png') })

  await page.keyboard.press('Enter')
  await expect.poll(() => page.evaluate(() => ({
    api: (window as unknown as { __apiTestState: { fullscreenCalls: number; audioCalls: number } }).__apiTestState,
    debug: (window as unknown as { __retroDebugSnapshot: () => { screen: string; paused: boolean } }).__retroDebugSnapshot(),
  }))).toMatchObject({
    api: { fullscreenCalls: 1, audioCalls: 1 },
    debug: { screen: 'menu' },
  })
  await resumeIfPaused(page)
  await expect(canvas).toHaveAttribute('aria-label', /menu główne/)

  await page.keyboard.press('f')
  await expect.poll(() => page.evaluate(() => (
    window as unknown as { __apiTestState: { fullscreenCalls: number } }
  ).__apiTestState.fullscreenCalls)).toBe(2)

  await resumeIfPaused(page)
  await page.keyboard.press('p')
  await expect(canvas).toHaveAttribute('aria-label', /pauza/)
  const pausedTick = await page.evaluate(() => (
    window as unknown as { __retroDebugSnapshot: () => { tick: number } }
  ).__retroDebugSnapshot().tick)
  await page.waitForTimeout(80)
  expect(await page.evaluate(() => (
    window as unknown as { __retroDebugSnapshot: () => { tick: number } }
  ).__retroDebugSnapshot().tick)).toBe(pausedTick)
  await resumeIfPaused(page)
  await expect(canvas).toHaveAttribute('aria-label', /menu główne/)

  await page.screenshot({ path: test.info().outputPath('regression-menu-1280x720.png') })
  await page.setViewportSize({ width: 1920, height: 1080 })
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.getBoundingClientRect().toJSON())).toMatchObject({
    width: 1920,
    height: 1080,
  })
  await page.screenshot({ path: test.info().outputPath('regression-menu-1920x1080.png') })

  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(canvas).toHaveAttribute('aria-label', /pauza/)
  // Powrót do karty jest częścią scenariusza: przy dokumencie trwale `hidden`
  // przeglądarka dławi rAF, więc pętla wpadałaby w udokumentowaną auto-pauzę.
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await resumeIfPaused(page)
  await expect(canvas).toHaveAttribute('aria-label', /menu główne/)

  await page.evaluate(() => window.dispatchEvent(new Event('blur')))
  await expect(canvas).toHaveAttribute('aria-label', /pauza/)
})

test('canvas używa skali całkowitej i awaryjnego dopasowania poniżej 480×270', async ({ page }) => {
  const matrix = [
    { viewport: { width: 480, height: 270 }, canvas: { width: 480, height: 270 }, scale: 1 },
    { viewport: { width: 960, height: 540 }, canvas: { width: 960, height: 540 }, scale: 2 },
    { viewport: { width: 1366, height: 768 }, canvas: { width: 960, height: 540 }, scale: 2 },
    { viewport: { width: 1440, height: 810 }, canvas: { width: 1440, height: 810 }, scale: 3 },
    { viewport: { width: 1920, height: 1080 }, canvas: { width: 1920, height: 1080 }, scale: 4 },
  ]
  for (const entry of matrix) {
    await page.setViewportSize(entry.viewport)
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const measured = await page.locator('#game-canvas').evaluate((canvas) => {
      const box = canvas.getBoundingClientRect()
      const state = (window as unknown as { __retroDebugSnapshot: () => RuntimeDebug }).__retroDebugSnapshot()
      return { width: box.width, height: box.height, scale: state.canvasScale }
    })
    expect(measured).toEqual({ ...entry.canvas, scale: entry.scale })
  }

  await page.setViewportSize({ width: 479, height: 269 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const fallback = await page.locator('#game-canvas').evaluate((canvas) => {
    const box = canvas.getBoundingClientRect()
    return { width: box.width, height: box.height, viewportWidth: innerWidth, viewportHeight: innerHeight }
  })
  expect(fallback.width).toBeLessThanOrEqual(fallback.viewportWidth)
  expect(fallback.height).toBeLessThanOrEqual(fallback.viewportHeight)
  expect(fallback.width / fallback.height).toBeCloseTo(16 / 9, 2)
})

test('debug i KeyD są dostępne wyłącznie pod ?debug', async ({ page }) => {
  const openJump = async (url: string): Promise<RuntimeDebug> => {
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    await page.keyboard.press('Enter')
    await expect.poll(() => page.evaluate(() => (
      window as unknown as { __retroDebugSnapshot: () => RuntimeDebug }
    ).__retroDebugSnapshot().screen)).toBe('menu')
    await resumeIfPaused(page)
    await page.keyboard.press('Enter')
    await expect.poll(() => page.evaluate(() => (
      window as unknown as { __retroDebugSnapshot: () => RuntimeDebug }
    ).__retroDebugSnapshot().screen)).toBe('jump')
    await page.keyboard.press('KeyD')
    return page.evaluate(() => (
      window as unknown as { __retroDebugSnapshot: () => RuntimeDebug }
    ).__retroDebugSnapshot())
  }

  const normal = await openJump('/')
  expect(normal.debugEnabled).toBe(false)
  expect(normal.jump?.technicalView).toBe(false)

  const debug = await openJump('/?debug')
  expect(debug.debugEnabled).toBe(true)
  expect(debug.jump?.technicalView).toBe(true)
})

test('fullscreen: wyjście pauzuje z fokusem, F ponawia i wznawia tylko pauzę exit-fullscreen', async ({ page }) => {
  await page.addInitScript(() => {
    const state = { fullscreenCalls: 0 }
    Object.defineProperty(window, '__fsTestState', { value: state })
    Element.prototype.requestFullscreen = function () {
      state.fullscreenCalls += 1
      return Promise.resolve()
    }
  })
  const debugState = (): Promise<{ screen: string; paused: boolean; pauseReason: string; fullscreenAttempts: number }> =>
    page.evaluate(() => (
      window as unknown as { __retroDebugSnapshot: () => { screen: string; paused: boolean; pauseReason: string; fullscreenAttempts: number } }
    ).__retroDebugSnapshot())
  const fullscreenCalls = (): Promise<number> =>
    page.evaluate(() => (
      window as unknown as { __fsTestState: { fullscreenCalls: number } }
    ).__fsTestState.fullscreenCalls)

  await page.setViewportSize({ width: 960, height: 540 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await debugState()).screen).toBe('menu')
  await resumeIfPaused(page)
  const entryCalls = await fullscreenCalls()
  expect(entryCalls).toBe(1)

  // Symulowane wejście i wyjście (Esc) jak w przeglądarce.
  await page.evaluate(() => {
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => document.querySelector('#game-shell') })
    document.dispatchEvent(new Event('fullscreenchange'))
  })
  await page.evaluate(() => {
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => null })
    document.dispatchEvent(new Event('fullscreenchange'))
  })
  await expect.poll(async () => (await debugState()).paused).toBe(true)
  await expect.poll(async () => (await debugState()).pauseReason).toBe('opuszczono pełny ekran')
  await expect.poll(async () => page.evaluate(() => document.activeElement?.id)).toBe('game-canvas')

  // F z gestu klawiatury ponawia request mimo pauzy.
  const callsBeforeRetry = await fullscreenCalls()
  await page.keyboard.press('KeyF')
  await expect.poll(async () => fullscreenCalls()).toBe(callsBeforeRetry + 1)
  await page.evaluate(() => {
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => document.querySelector('#game-shell') })
    document.dispatchEvent(new Event('fullscreenchange'))
  })
  await expect.poll(async () => (await debugState()).paused).toBe(false)

  // Inna pauza (P) nie jest auto-wznawiana udanym requestem F.
  await page.keyboard.press('KeyP')
  await expect.poll(async () => (await debugState()).paused).toBe(true)
  await expect.poll(async () => (await debugState()).pauseReason).toBe('pauza użytkownika')
  const callsBeforeOther = await fullscreenCalls()
  await page.keyboard.press('KeyF')
  await expect.poll(async () => fullscreenCalls()).toBe(callsBeforeOther + 1)
  await page.waitForTimeout(200)
  const stillPaused = await debugState()
  expect(stillPaused.paused).toBe(true)
  expect(stillPaused.pauseReason).toBe('pauza użytkownika')
})

test('prefers-reduced-motion reaguje na żywo i zatrzymuje ruch dekoracyjny', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.keyboard.press('Enter')
  await expect.poll(() => page.evaluate(() => (
    window as unknown as { __retroDebugSnapshot: () => RuntimeDebug }
  ).__retroDebugSnapshot().screen)).toBe('menu')
  await resumeIfPaused(page)
  await page.keyboard.press('Enter')
  await expect.poll(() => page.evaluate(() => (
    window as unknown as { __retroDebugSnapshot: () => RuntimeDebug }
  ).__retroDebugSnapshot().screen)).toBe('jump')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect.poll(() => page.evaluate(() => (
    window as unknown as { __retroDebugSnapshot: () => RuntimeDebug }
  ).__retroDebugSnapshot().reducedMotion)).toBe(true)
  const frames = await page.locator('#game-canvas').evaluate((canvas: HTMLCanvasElement) => new Promise<string[]>((resolve) => {
    const captured: string[] = []
    const sample = (): void => {
      captured.push(canvas.toDataURL())
      if (captured.length === 3) resolve(captured)
      else requestAnimationFrame(sample)
    }
    requestAnimationFrame(sample)
  }))
  expect(frames[2]).toBe(frames[1])
})
