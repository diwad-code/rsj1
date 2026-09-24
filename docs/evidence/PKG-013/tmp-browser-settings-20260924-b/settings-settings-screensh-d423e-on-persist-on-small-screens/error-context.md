# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings.spec.ts >> settings screenshots at both resolutions; scale, text and reduced motion persist on small screens
- Location: tests\browser\settings.spec.ts:133:1

# Error details

```
Error: page.setViewportSize: Protocol error (Browser.setWindowBounds): To resize minimized/maximized/fullscreen window, restore it to normal state first.
```

# Page snapshot

```yaml
- main "Retro Ski Jumping" [ref=e2]:
  - application "Retro Ski Jumping — ustawienia, Wybicie" [active] [ref=e3]
  - paragraph [ref=e4]: Ustawienia. Wybicie. Góra/dół wybiera, Enter lub Enter zmienia, lewo/prawo ustawia wartość, Backspace wraca.
```

# Test source

```ts
  39  |   await expect.poll(async () => (await state(page)).screen).toBe('menu')
  40  |   await expect.poll(async () => (await state(page)).persistence.ready).toBe(true)
  41  |   if ((await state(page)).paused) {
  42  |     expect((await state(page)).pauseReason).toBe('zbyt długa przerwa klatki')
  43  |     await page.keyboard.press('Enter')
  44  |     await expect.poll(async () => (await state(page)).paused).toBe(false)
  45  |   }
  46  | }
  47  | 
  48  | async function chooseMenu(page: Page, target: string): Promise<void> {
  49  |   for (let index = 0; index < 5 && (await state(page)).menuSelection !== target; index += 1) {
  50  |     await page.keyboard.press('ArrowDown')
  51  |   }
  52  |   expect((await state(page)).menuSelection).toBe(target)
  53  | }
  54  | 
  55  | async function settings(page: Page, confirm = 'Enter'): Promise<void> {
  56  |   await chooseMenu(page, 'settings')
  57  |   await page.keyboard.press(confirm)
  58  |   await expect.poll(async () => (await state(page)).screen).toBe('settings')
  59  |   expect((await state(page)).settings).toBeTruthy()
  60  | }
  61  | 
  62  | async function row(page: Page, target: string): Promise<void> {
  63  |   for (let index = 0; index < 12 && (await state(page)).selectedRow !== target; index += 1) {
  64  |     await page.keyboard.press('ArrowDown')
  65  |   }
  66  |   expect((await state(page)).selectedRow).toBe(target)
  67  | }
  68  | 
  69  | async function rebind(page: Page, target: string, code: string): Promise<void> {
  70  |   await row(page, target)
  71  |   await page.keyboard.press('Enter')
  72  |   await expect.poll(async () => (await state(page)).captureTarget).toBe(target)
  73  |   await page.keyboard.press(code)
  74  |   await expect.poll(async () => (await state(page)).captureTarget).toBeNull()
  75  | }
  76  | 
  77  | test('menu → remap rejects conflicts/reserved keys; emergency + alternative menu keys; training uses bindings and reload/reset persists', async ({ page }) => {
  78  |   test.setTimeout(90_000)
  79  |   await boot(page)
  80  |   await settings(page)
  81  |   expect((await state(page)).settings).toEqual(DEFAULT_SETTINGS)
  82  | 
  83  |   await row(page, 'takeoff')
  84  |   await page.keyboard.press('Enter')
  85  |   await expect.poll(async () => (await state(page)).captureTarget).toBe('takeoff')
  86  |   await page.keyboard.press('ArrowRight') // bound to another action
  87  |   await expect.poll(async () => (await state(page)).message).toMatch(/KONFLIKT|ZAJĘT|PRZYPISAN|DUPLIKAT/i)
  88  |   expect((await state(page)).settings.bindings.takeoff).toBe('ArrowUp')
  89  |   expect((await state(page)).captureTarget).toBe('takeoff')
  90  |   await page.keyboard.press('KeyD') // shell-reserved debug key, never a jump binding
  91  |   await expect.poll(async () => (await state(page)).message).toMatch(/NIEDOZWOL|ZAJĘT|ZAREZERWOWAN|NIE MOŻNA/i)
  92  |   expect((await state(page)).settings.bindings.takeoff).toBe('ArrowUp')
  93  |   expect((await state(page)).captureTarget).toBe('takeoff')
  94  |   await page.keyboard.press('KeyW')
  95  |   await expect.poll(async () => (await state(page)).settings.bindings.takeoff).toBe('KeyW')
  96  |   await rebind(page, 'right', 'KeyA')
  97  |   await rebind(page, 'menuConfirm', 'KeyE')
  98  |   await rebind(page, 'menuBack', 'KeyB')
  99  | 
  100 |   await page.keyboard.press('Backspace') // emergency fallback even after remapping
  101 |   await expect.poll(async () => (await state(page)).screen).toBe('menu')
  102 |   await settings(page, 'KeyE') // remapped menu confirmation
  103 |   await page.keyboard.press('KeyB') // remapped menu back
  104 |   await expect.poll(async () => (await state(page)).screen).toBe('menu')
  105 |   await settings(page, 'Enter') // emergency confirmation still works
  106 |   await page.keyboard.press('Backspace')
  107 |   await chooseMenu(page, 'training')
  108 |   await page.keyboard.press('Enter')
  109 |   await expect.poll(async () => (await state(page)).screen).toBe('jump')
  110 |   expect((await state(page)).jump?.phase).toBe('GateGreen')
  111 |   await page.keyboard.press('KeyA') // new right binding opens the gate
  112 |   await expect.poll(async () => (await state(page)).jump?.events.some(event => event.endsWith(' gateOpen'))).toBe(true)
  113 |   for (let attempt = 0; attempt < 8 && !(await state(page)).jump?.events.some(event => event.endsWith(' takeoffImpulseStart')); attempt += 1) {
  114 |     await page.keyboard.press('KeyW')
  115 |     await page.waitForTimeout(35)
  116 |   }
  117 |   await expect.poll(async () => (await state(page)).jump?.events.some(event => event.endsWith(' takeoffImpulseStart'))).toBe(true)
  118 |   await page.keyboard.press('Backspace')
  119 |   await expect.poll(async () => (await state(page)).screen).toBe('menu')
  120 | 
  121 |   await boot(page, true)
  122 |   await settings(page)
  123 |   expect((await state(page)).settings.bindings).toMatchObject({ takeoff: 'KeyW', right: 'KeyA' })
  124 |   expect((await state(page)).settings).toMatchObject({ menuConfirm: 'KeyE', menuBack: 'KeyB' })
  125 |   await row(page, 'reset')
  126 |   await page.keyboard.press('Enter')
  127 |   await expect.poll(async () => (await state(page)).settings).toEqual(DEFAULT_SETTINGS)
  128 |   await boot(page, true)
  129 |   await settings(page)
  130 |   expect((await state(page)).settings).toEqual(DEFAULT_SETTINGS)
  131 | })
  132 | 
  133 | test('settings screenshots at both resolutions; scale, text and reduced motion persist on small screens', async ({ page }) => {
  134 |   await page.setViewportSize({ width: 1280, height: 720 })
  135 |   await boot(page)
  136 |   await settings(page)
  137 |   expect((await state(page)).screen).toBe('settings')
  138 |   await page.screenshot({ path: test.info().outputPath('settings-1280x720.png') })
> 139 |   await page.setViewportSize({ width: 960, height: 540 })
      |              ^ Error: page.setViewportSize: Protocol error (Browser.setWindowBounds): To resize minimized/maximized/fullscreen window, restore it to normal state first.
  140 |   await expect.poll(async () => (await state(page)).canvasScale).toBe(2)
  141 |   await page.screenshot({ path: test.info().outputPath('settings-960x540.png') })
  142 | 
  143 |   await row(page, 'scaleMode')
  144 |   await page.keyboard.press('ArrowRight')
  145 |   await expect.poll(async () => (await state(page)).settings.scaleMode).toBe('integer')
  146 |   await row(page, 'largeText')
  147 |   await page.keyboard.press('Enter')
  148 |   await expect.poll(async () => (await state(page)).settings.largeText).toBe(true)
  149 |   await row(page, 'reducedMotion')
  150 |   await page.keyboard.press('Enter')
  151 |   await expect.poll(async () => (await state(page)).settings.reducedMotion).toBe(true)
  152 |   await expect.poll(async () => (await state(page)).reducedMotion).toBe(true)
  153 |   await row(page, 'volume')
  154 |   await page.keyboard.press('ArrowLeft')
  155 |   await expect.poll(async () => (await state(page)).settings.volume).toBeLessThan(100)
  156 |   const before = (await state(page)).settings
  157 | 
  158 |   await page.setViewportSize({ width: 400, height: 240 })
  159 |   const small = await page.locator('#game-canvas').evaluate(canvas => {
  160 |     const bounds = canvas.getBoundingClientRect()
  161 |     return { width: bounds.width, height: bounds.height, viewportWidth: innerWidth, viewportHeight: innerHeight }
  162 |   })
  163 |   expect(small.width).toBeLessThanOrEqual(small.viewportWidth)
  164 |   expect(small.height).toBeLessThanOrEqual(small.viewportHeight)
  165 |   await expect(page.locator('#game-canvas')).toHaveAttribute('aria-label', /ustawieni/i)
  166 |   await boot(page, true)
  167 |   await settings(page)
  168 |   expect((await state(page)).settings).toEqual(before)
  169 |   expect((await state(page)).reducedMotion).toBe(true)
  170 | })
  171 | 
  172 | test('pre-remap recorded H01 replay keeps its recorded result and sample tick after remap/reload', async ({ page }) => {
  173 |   test.setTimeout(90_000)
  174 |   await boot(page)
  175 |   // The fixture runs the real deterministic simulation and recorder, then stores its
  176 |   // samples in IndexedDB; it is not an assertion that a human played a jump.
  177 |   const output = await build({ configFile: false, logLevel: 'silent', build: {
  178 |     write: false, minify: false,
  179 |     lib: { entry: resolve('tests/browser/h01-replay.fixture.ts'), name: 'H01Fixture', formats: ['iife'] },
  180 |   } })
  181 |   const bundle = Array.isArray(output) ? output[0] : output
  182 |   if (!bundle || !('output' in bundle)) throw new Error('Replay fixture bundle unavailable')
  183 |   const chunk = bundle.output.find(item => item.type === 'chunk')
  184 |   if (!chunk) throw new Error('Replay fixture chunk unavailable')
  185 |   await page.addScriptTag({ content: chunk.code })
  186 |   const recorded = await page.evaluate(() => (
  187 |     window as unknown as { H01Fixture: typeof ReplayFixture }
  188 |   ).H01Fixture.install())
  189 |   await boot(page, true) // reload the game's saved-replay index
  190 | 
  191 |   async function replayAtTick30(): Promise<NonNullable<Snapshot['replay']>> {
  192 |     await chooseMenu(page, 'replay')
  193 |     await page.keyboard.press('Enter')
  194 |     await expect.poll(async () => (await state(page)).screen).toBe('replay')
  195 |     await page.keyboard.press('KeyR')
  196 |     // Restart resumes playback; real scrub pauses it and clamps at the first tick.
  197 |     for (let index = 0; index < 20 && ((await state(page)).replay?.playing || (await state(page)).replay?.tick !== 0); index += 1) {
  198 |       await page.keyboard.press('ArrowLeft')
  199 |     }
  200 |     expect((await state(page)).replay).toMatchObject({ playing: false, tick: 0 })
  201 |     await page.keyboard.press('ArrowRight')
  202 |     await expect.poll(async () => (await state(page)).replay?.tick).toBe(30)
  203 |     const replay = (await state(page)).replay
  204 |     if (!replay) throw new Error('Replay disappeared')
  205 |     await page.keyboard.press('Backspace')
  206 |     await expect.poll(async () => (await state(page)).screen).toBe('menu')
  207 |     return replay
  208 |   }
  209 | 
  210 |   const before = await replayAtTick30()
  211 |   expect(before.sampleCount).toBeGreaterThan(20)
  212 |   expect(before.recordedDistanceHalfMeters).toBe(recorded.distance)
  213 |   expect(before.recordedTotalTenths).toBe(recorded.total)
  214 |   await settings(page)
  215 |   await rebind(page, 'takeoff', 'KeyW')
  216 |   await rebind(page, 'right', 'KeyA')
  217 |   await page.keyboard.press('Backspace')
  218 |   await boot(page, true)
  219 |   expect((await state(page)).settings.bindings).toMatchObject({ takeoff: 'KeyW', right: 'KeyA' })
  220 |   const after = await replayAtTick30()
  221 |   expect(after).toMatchObject({
  222 |     resultId: before.resultId,
  223 |     tick: before.tick,
  224 |     sampleCount: before.sampleCount,
  225 |     recordedDistanceHalfMeters: before.recordedDistanceHalfMeters,
  226 |     recordedTotalTenths: before.recordedTotalTenths,
  227 |   })
  228 |   expect((await state(page)).persistence.resultCount).toBe(0)
  229 | })
  230 | 
```