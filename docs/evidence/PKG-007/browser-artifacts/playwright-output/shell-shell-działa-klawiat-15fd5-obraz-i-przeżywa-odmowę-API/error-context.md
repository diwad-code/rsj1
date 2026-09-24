# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: shell.spec.ts >> shell działa klawiaturą, skaluje obraz i przeżywa odmowę API
- Location: tests\browser\shell.spec.ts:24:1

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator: locator('#game-canvas')
Expected pattern: /menu główne/
Received string:  "Retro Ski Jumping — pauza"
Timeout: 5000ms

Call log:
  - Expect "toHaveAttribute" locator('#game-canvas') with timeout 5000ms
  - waiting for locator('#game-canvas')
    14 × locator resolved to <canvas width="960" height="540" tabindex="0" id="game-canvas" role="application" aria-label="Retro Ski Jumping — pauza" aria-describedby="screen-reader-status"></canvas>
       - unexpected value "Retro Ski Jumping — pauza"

```

```yaml
- application "Retro Ski Jumping — pauza"
```

# Test source

```ts
  10  |  */
  11  | async function resumeIfPaused(page: Page, attempts = 8): Promise<void> {
  12  |   for (let attempt = 0; attempt < attempts; attempt += 1) {
  13  |     const state = await page.evaluate(() => (
  14  |       window as unknown as { __retroDebugSnapshot: () => RuntimeDebug }
  15  |     ).__retroDebugSnapshot())
  16  |     if (!state.paused) return
  17  |     if (attempt > 0) {
  18  |       expect(state.pauseReason).toBe('zbyt długa przerwa klatki')
  19  |     }
  20  |     await page.keyboard.press('Enter')
  21  |   }
  22  | }
  23  | 
  24  | test('shell działa klawiaturą, skaluje obraz i przeżywa odmowę API', async ({ page }) => {
  25  |   await page.addInitScript(() => {
  26  |     const state = { fullscreenCalls: 0, audioCalls: 0 }
  27  |     Object.defineProperty(window, '__apiTestState', { value: state })
  28  |     Element.prototype.requestFullscreen = () => {
  29  |       state.fullscreenCalls += 1
  30  |       return Promise.reject(new Error('celowa odmowa testowa'))
  31  |     }
  32  | 
  33  |     class RejectedAudioContext {
  34  |       state = 'suspended'
  35  |       resume() {
  36  |         state.audioCalls += 1
  37  |         return Promise.reject(new Error('celowa blokada audio'))
  38  |       }
  39  |     }
  40  |     Object.defineProperty(window, 'AudioContext', { value: RejectedAudioContext })
  41  |   })
  42  | 
  43  |   await page.setViewportSize({ width: 1280, height: 720 })
  44  |   await page.goto('/', { waitUntil: 'domcontentloaded' })
  45  | 
  46  |   const canvas = page.locator('#game-canvas')
  47  |   await expect(canvas).toHaveAttribute('width', '960')
  48  |   await expect(canvas).toHaveAttribute('height', '540')
  49  |   await expect(canvas).toHaveAttribute('aria-label', /ekran tytułowy/)
  50  |   await expect.poll(() => page.evaluate(() => ({
  51  |     scrollWidth: document.documentElement.scrollWidth,
  52  |     width: innerWidth,
  53  |     canvas: document.querySelector('canvas')?.getBoundingClientRect().toJSON(),
  54  |   }))).toMatchObject({
  55  |     scrollWidth: 1280,
  56  |     width: 1280,
  57  |     canvas: { width: 1280, height: 720 },
  58  |   })
  59  |   await page.screenshot({ path: 'docs/evidence/PKG-007/browser-artifacts/regression-title-1280x720.png' })
  60  | 
  61  |   await page.keyboard.press('Enter')
  62  |   await expect.poll(() => page.evaluate(() => ({
  63  |     api: (window as unknown as { __apiTestState: { fullscreenCalls: number; audioCalls: number } }).__apiTestState,
  64  |     debug: (window as unknown as { __retroDebugSnapshot: () => { screen: string; paused: boolean } }).__retroDebugSnapshot(),
  65  |   }))).toMatchObject({
  66  |     api: { fullscreenCalls: 1, audioCalls: 1 },
  67  |     debug: { screen: 'menu' },
  68  |   })
  69  |   await resumeIfPaused(page)
  70  |   await expect(canvas).toHaveAttribute('aria-label', /menu główne/)
  71  | 
  72  |   await page.keyboard.press('f')
  73  |   await expect.poll(() => page.evaluate(() => (
  74  |     window as unknown as { __apiTestState: { fullscreenCalls: number } }
  75  |   ).__apiTestState.fullscreenCalls)).toBe(2)
  76  | 
  77  |   await resumeIfPaused(page)
  78  |   await page.keyboard.press('p')
  79  |   await expect(canvas).toHaveAttribute('aria-label', /pauza/)
  80  |   const pausedTick = await page.evaluate(() => (
  81  |     window as unknown as { __retroDebugSnapshot: () => { tick: number } }
  82  |   ).__retroDebugSnapshot().tick)
  83  |   await page.waitForTimeout(80)
  84  |   expect(await page.evaluate(() => (
  85  |     window as unknown as { __retroDebugSnapshot: () => { tick: number } }
  86  |   ).__retroDebugSnapshot().tick)).toBe(pausedTick)
  87  |   await resumeIfPaused(page)
  88  |   await expect(canvas).toHaveAttribute('aria-label', /menu główne/)
  89  | 
  90  |   await page.screenshot({ path: 'docs/evidence/PKG-007/browser-artifacts/regression-menu-1280x720.png' })
  91  |   await page.setViewportSize({ width: 1920, height: 1080 })
  92  |   await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.getBoundingClientRect().toJSON())).toMatchObject({
  93  |     width: 1920,
  94  |     height: 1080,
  95  |   })
  96  |   await page.screenshot({ path: 'docs/evidence/PKG-007/browser-artifacts/regression-menu-1920x1080.png' })
  97  | 
  98  |   await page.evaluate(() => {
  99  |     Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' })
  100 |     document.dispatchEvent(new Event('visibilitychange'))
  101 |   })
  102 |   await expect(canvas).toHaveAttribute('aria-label', /pauza/)
  103 |   // Powrót do karty jest częścią scenariusza: przy dokumencie trwale `hidden`
  104 |   // przeglądarka dławi rAF, więc pętla wpadałaby w udokumentowaną auto-pauzę.
  105 |   await page.evaluate(() => {
  106 |     Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' })
  107 |     document.dispatchEvent(new Event('visibilitychange'))
  108 |   })
  109 |   await resumeIfPaused(page)
> 110 |   await expect(canvas).toHaveAttribute('aria-label', /menu główne/)
      |                        ^ Error: expect(locator).toHaveAttribute(expected) failed
  111 | 
  112 |   await page.evaluate(() => window.dispatchEvent(new Event('blur')))
  113 |   await expect(canvas).toHaveAttribute('aria-label', /pauza/)
  114 | })
  115 | 
```