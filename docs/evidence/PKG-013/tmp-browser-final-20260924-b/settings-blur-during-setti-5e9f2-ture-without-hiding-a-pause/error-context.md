# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings.spec.ts >> blur during settings key capture cancels capture without hiding a pause
- Location: tests\browser\settings.spec.ts:118:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: false
Received: true
```

# Page snapshot

```yaml
- main "Retro Ski Jumping" [ref=e2]:
  - application "Retro Ski Jumping — pauza" [active] [ref=e3]
  - paragraph [ref=e4]: "Pauza: zbyt długa przerwa klatki. Enter wznawia. Wybrano: Ustawienia. TECHNICZNA • K120/HS134. SKOCZNIA TECHNICZNA K120, identyfikator tech-k120-hs134, wersja 3.5.0. Lewo i prawo zmienia skocznię. Góra i dół wybiera tryb, Enter lub Enter zatwierdza, Backspace lub Backspace wraca. F ponawia pełny ekran. P włącza pauzę. Belka automatyczna 10, prognoza wiatru -0,7 metra na sekundę."
```

# Test source

```ts
  37  | test.beforeEach(async ({ page }) => {
  38  |   await page.addInitScript(() => {
  39  |     Element.prototype.requestFullscreen = () => Promise.reject(new Error('test: fullscreen unavailable'))
  40  |   })
  41  | })
  42  | 
  43  | /** Resume only the documented CI frame-gap pause; never treat another pause as success. */
  44  | async function resumeIfOverloaded(page: Page): Promise<void> {
  45  |   const deadline = Date.now() + 4_000
  46  |   let stableSince: number | null = null
  47  |   while (Date.now() < deadline) {
  48  |     const current = await state(page)
  49  |     if (!current.paused) {
  50  |       stableSince ??= Date.now()
  51  |       if (Date.now() - stableSince >= 96) return
  52  |     } else {
  53  |       stableSince = null
  54  |       if (current.pauseReason !== 'zbyt długa przerwa klatki' || current.screen === 'settings') {
  55  |         throw new Error(`Unexpected pause in settings E2E: ${JSON.stringify(current)}`)
  56  |       }
  57  |       await page.keyboard.press('Enter')
  58  |     }
  59  |     await page.waitForTimeout(24)
  60  |   }
  61  |   throw new Error(`Could not resume frame-gap pause: ${JSON.stringify(await state(page))}`)
  62  | }
  63  | 
  64  | async function boot(page: Page, reload = false): Promise<void> {
  65  |   if (reload) await page.reload({ waitUntil: 'domcontentloaded' })
  66  |   else await page.goto('/?debug', { waitUntil: 'domcontentloaded' })
  67  |   await page.keyboard.press('Enter')
  68  |   await expect.poll(async () => (await state(page)).screen).toBe('menu')
  69  |   await expect.poll(async () => (await state(page)).persistence.ready).toBe(true)
  70  |   await resumeIfOverloaded(page)
  71  | }
  72  | 
  73  | async function chooseMenu(page: Page, target: string): Promise<void> {
  74  |   for (let index = 0; index < 10; index += 1) {
  75  |     await resumeIfOverloaded(page)
  76  |     if ((await state(page)).menuSelection === target) return
  77  |     await page.keyboard.press('ArrowDown')
  78  |   }
  79  |   await resumeIfOverloaded(page)
  80  |   expect((await state(page)).menuSelection).toBe(target)
  81  | }
  82  | 
  83  | async function openMenuSelection(page: Page, selection: string, targetScreen: string, confirm = 'Enter'): Promise<void> {
  84  |   await chooseMenu(page, selection)
  85  |   for (let attempt = 0; attempt < 3; attempt += 1) {
  86  |     await resumeIfOverloaded(page)
  87  |     await page.keyboard.press(confirm)
  88  |     const current = await state(page)
  89  |     if (current.screen === targetScreen) return
  90  |     if (current.screen !== 'menu') throw new Error(`Unexpected screen after ${confirm}: ${JSON.stringify(current)}`)
  91  |     // The intended key may have landed in the overload pause instead of the menu.
  92  |     await resumeIfOverloaded(page)
  93  |     expect((await state(page)).menuSelection).toBe(selection)
  94  |   }
  95  |   throw new Error(`Could not open ${targetScreen} with ${confirm}: ${JSON.stringify(await state(page))}`)
  96  | }
  97  | 
  98  | async function settings(page: Page, confirm = 'Enter'): Promise<void> {
  99  |   await openMenuSelection(page, 'settings', 'settings', confirm)
  100 |   expect((await state(page)).settings).toBeTruthy()
  101 | }
  102 | 
  103 | async function row(page: Page, target: string): Promise<void> {
  104 |   for (let index = 0; index < 12 && (await state(page)).selectedRow !== target; index += 1) {
  105 |     await page.keyboard.press('ArrowDown')
  106 |   }
  107 |   expect((await state(page)).selectedRow).toBe(target)
  108 | }
  109 | 
  110 | async function rebind(page: Page, target: string, code: string): Promise<void> {
  111 |   await row(page, target)
  112 |   await page.keyboard.press('Enter')
  113 |   await expect.poll(async () => (await state(page)).captureTarget).toBe(target)
  114 |   await page.keyboard.press(code)
  115 |   await expect.poll(async () => (await state(page)).captureTarget).toBeNull()
  116 | }
  117 | 
  118 | test('blur during settings key capture cancels capture without hiding a pause', async ({ page }) => {
  119 |   await boot(page)
  120 |   await settings(page)
  121 |   await page.keyboard.press('Enter')
  122 |   await expect.poll(async () => (await state(page)).captureTarget).toBe('takeoff')
  123 | 
  124 |   await page.evaluate(() => window.dispatchEvent(new Event('blur')))
  125 |   await expect.poll(async () => (await state(page)).captureTarget).toBeNull()
  126 |   expect((await state(page)).paused).toBe(false)
  127 |   expect((await state(page)).settings.bindings.takeoff).toBe('ArrowUp')
  128 |   await expect(page.locator('#screen-reader-status')).toContainText('ANULOWANO PRZECHWYTYWANIE')
  129 | 
  130 |   await page.keyboard.press('ArrowDown')
  131 |   expect((await state(page)).selectedRow).toBe('left')
  132 |   await page.keyboard.press('Enter')
  133 |   await expect.poll(async () => (await state(page)).captureTarget).toBe('left')
  134 |   await page.keyboard.press('Escape')
  135 |   await page.keyboard.press('Backspace')
  136 |   expect((await state(page)).screen).toBe('menu')
> 137 |   expect((await state(page)).paused).toBe(false)
      |                                      ^ Error: expect(received).toBe(expected) // Object.is equality
  138 | })
  139 | 
  140 | test('menu → remap rejects conflicts/reserved keys; emergency + alternative menu keys; training uses bindings and reload/reset persists', async ({ page }) => {
  141 |   test.setTimeout(90_000)
  142 |   await boot(page)
  143 |   await settings(page)
  144 |   expect((await state(page)).settings).toEqual(DEFAULT_SETTINGS)
  145 | 
  146 |   await row(page, 'takeoff')
  147 |   await page.keyboard.press('Enter')
  148 |   await expect.poll(async () => (await state(page)).captureTarget).toBe('takeoff')
  149 |   await page.keyboard.press('ArrowRight') // bound to another action
  150 |   await expect.poll(async () => (await state(page)).message).toMatch(/KONFLIKT|ZAJĘT|PRZYPISAN|DUPLIKAT/i)
  151 |   expect((await state(page)).settings.bindings.takeoff).toBe('ArrowUp')
  152 |   expect((await state(page)).captureTarget).toBe('takeoff')
  153 |   await page.keyboard.press('KeyD') // shell-reserved debug key, never a jump binding
  154 |   await expect.poll(async () => (await state(page)).message).toMatch(/NIEDOZWOL|ZAJĘT|ZAREZERWOWAN|NIE MOŻNA/i)
  155 |   expect((await state(page)).settings.bindings.takeoff).toBe('ArrowUp')
  156 |   expect((await state(page)).captureTarget).toBe('takeoff')
  157 |   await page.keyboard.press('KeyW')
  158 |   await expect.poll(async () => (await state(page)).settings.bindings.takeoff).toBe('KeyW')
  159 |   await rebind(page, 'right', 'KeyA')
  160 |   await rebind(page, 'menuConfirm', 'KeyE')
  161 |   await rebind(page, 'menuBack', 'KeyB')
  162 | 
  163 |   await page.keyboard.press('Backspace') // emergency fallback even after remapping
  164 |   await expect.poll(async () => (await state(page)).screen).toBe('menu')
  165 |   await settings(page, 'KeyE') // remapped menu confirmation
  166 |   await page.keyboard.press('KeyB') // remapped menu back
  167 |   await expect.poll(async () => (await state(page)).screen).toBe('menu')
  168 |   await settings(page, 'Enter') // emergency confirmation still works
  169 |   await page.keyboard.press('Backspace')
  170 |   await openMenuSelection(page, 'training', 'jump')
  171 |   expect((await state(page)).jump?.phase).toBe('GateGreen')
  172 |   await page.keyboard.press('KeyA') // new right binding opens the gate
  173 |   await expect.poll(async () => (await state(page)).jump?.events.some(event => event.endsWith(' gateOpen'))).toBe(true)
  174 |   for (let attempt = 0; attempt < 8 && !(await state(page)).jump?.events.some(event => event.endsWith(' takeoffImpulseStart')); attempt += 1) {
  175 |     await page.keyboard.press('KeyW')
  176 |     await page.waitForTimeout(35)
  177 |   }
  178 |   await expect.poll(async () => (await state(page)).jump?.events.some(event => event.endsWith(' takeoffImpulseStart'))).toBe(true)
  179 |   await page.keyboard.press('Backspace')
  180 |   await expect.poll(async () => (await state(page)).screen).toBe('menu')
  181 | 
  182 |   await boot(page, true)
  183 |   await settings(page)
  184 |   expect((await state(page)).settings.bindings).toMatchObject({ takeoff: 'KeyW', right: 'KeyA' })
  185 |   expect((await state(page)).settings).toMatchObject({ menuConfirm: 'KeyE', menuBack: 'KeyB' })
  186 |   await row(page, 'reset')
  187 |   await page.keyboard.press('Enter')
  188 |   await expect.poll(async () => (await state(page)).settings).toEqual(DEFAULT_SETTINGS)
  189 |   await boot(page, true)
  190 |   await settings(page)
  191 |   expect((await state(page)).settings).toEqual(DEFAULT_SETTINGS)
  192 | })
  193 | 
  194 | test('settings screenshots at both resolutions; scale, text and reduced motion persist on small screens', async ({ page }) => {
  195 |   await page.setViewportSize({ width: 1280, height: 720 })
  196 |   await boot(page)
  197 |   await settings(page)
  198 |   expect((await state(page)).screen).toBe('settings')
  199 |   await page.screenshot({ path: test.info().outputPath('settings-1280x720.png') })
  200 |   await page.setViewportSize({ width: 960, height: 540 })
  201 |   await expect.poll(async () => (await state(page)).canvasScale).toBe(2)
  202 |   await page.screenshot({ path: test.info().outputPath('settings-960x540.png') })
  203 | 
  204 |   await row(page, 'scaleMode')
  205 |   await page.keyboard.press('ArrowRight')
  206 |   await expect.poll(async () => (await state(page)).settings.scaleMode).toBe('integer')
  207 |   await row(page, 'largeText')
  208 |   await page.keyboard.press('Enter')
  209 |   await expect.poll(async () => (await state(page)).settings.largeText).toBe(true)
  210 |   await row(page, 'reducedMotion')
  211 |   await page.keyboard.press('Enter')
  212 |   await expect.poll(async () => (await state(page)).settings.reducedMotion).toBe(true)
  213 |   await expect.poll(async () => (await state(page)).reducedMotion).toBe(true)
  214 |   await row(page, 'volume')
  215 |   await page.keyboard.press('ArrowLeft')
  216 |   await expect.poll(async () => (await state(page)).settings.volume).toBeLessThan(100)
  217 |   const before = (await state(page)).settings
  218 | 
  219 |   await page.setViewportSize({ width: 400, height: 240 })
  220 |   const small = await page.locator('#game-canvas').evaluate(canvas => {
  221 |     const bounds = canvas.getBoundingClientRect()
  222 |     return { width: bounds.width, height: bounds.height, viewportWidth: innerWidth, viewportHeight: innerHeight }
  223 |   })
  224 |   expect(small.width).toBeLessThanOrEqual(small.viewportWidth)
  225 |   expect(small.height).toBeLessThanOrEqual(small.viewportHeight)
  226 |   await expect(page.locator('#game-canvas')).toHaveAttribute('aria-label', /ustawieni/i)
  227 |   await boot(page, true)
  228 |   await settings(page)
  229 |   expect((await state(page)).settings).toEqual(before)
  230 |   expect((await state(page)).reducedMotion).toBe(true)
  231 | })
  232 | 
  233 | test('pre-remap recorded H01 replay keeps its recorded result and sample tick after remap/reload', async ({ page }) => {
  234 |   test.setTimeout(90_000)
  235 |   await boot(page)
  236 |   // The fixture runs the real deterministic simulation and recorder, then stores its
  237 |   // samples in IndexedDB; it is not an assertion that a human played a jump.
```