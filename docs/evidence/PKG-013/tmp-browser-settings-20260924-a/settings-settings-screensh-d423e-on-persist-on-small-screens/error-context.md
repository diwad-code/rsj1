# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings.spec.ts >> settings screenshots at both resolutions; scale, text and reduced motion persist on small screens
- Location: tests\browser\settings.spec.ts:136:1

# Error details

```
Error: expect(received).toBeTruthy()

Received: undefined
```

# Page snapshot

```yaml
- main "Retro Ski Jumping" [ref=e2]:
  - application "Retro Ski Jumping — ustawienia, Wybicie" [active] [ref=e3]
  - paragraph [ref=e4]: Ustawienia. Wybicie. Góra/dół wybiera, Enter lub Enter zmienia, lewo/prawo ustawia wartość, Backspace wraca.
```

# Test source

```ts
  1   | /** PKG-013/P22: user input is always a real Playwright keyboard event. */
  2   | import { expect, test, type Page } from '@playwright/test'
  3   | import { build } from 'vite'
  4   | import { resolve } from 'node:path'
  5   | import type * as ReplayFixture from './h01-replay.fixture'
  6   | import { DEFAULT_SETTINGS, type GameSettings } from '../../src/settings/settings'
  7   | 
  8   | type SettingsDebug = {
  9   |   settings: GameSettings
  10  |   selectedRow: string
  11  |   captureTarget: string | null
  12  |   message: string | null
  13  | }
  14  | type Snapshot = {
  15  |   screen: string
  16  |   paused: boolean
  17  |   pauseReason: string
  18  |   menuSelection: string
  19  |   canvasScale: number
  20  |   reducedMotion: boolean
  21  |   settings: SettingsDebug
  22  |   persistence: { ready: boolean; resultCount: number }
  23  |   jump: { phase: string; tick: number; events: string[]; status: string | null } | null
  24  |   replay: {
  25  |     resultId: string | null
  26  |     tick: number
  27  |     playing: boolean
  28  |     sampleCount: number
  29  |     recordedDistanceHalfMeters: number | null
  30  |     recordedTotalTenths: number | null
  31  |   } | null
  32  | }
  33  | 
  34  | const state = (page: Page): Promise<Snapshot> => page.evaluate(() => (
  35  |   window as unknown as { __retroDebugSnapshot: () => Snapshot }
  36  | ).__retroDebugSnapshot())
  37  | 
  38  | async function boot(page: Page, reload = false): Promise<void> {
  39  |   if (reload) await page.reload({ waitUntil: 'domcontentloaded' })
  40  |   else await page.goto('/?debug', { waitUntil: 'domcontentloaded' })
  41  |   await page.keyboard.press('Enter')
  42  |   await expect.poll(async () => (await state(page)).screen).toBe('menu')
  43  |   await expect.poll(async () => (await state(page)).persistence.ready).toBe(true)
  44  |   if ((await state(page)).paused) {
  45  |     expect((await state(page)).pauseReason).toBe('zbyt długa przerwa klatki')
  46  |     await page.keyboard.press('Enter')
  47  |     await expect.poll(async () => (await state(page)).paused).toBe(false)
  48  |   }
  49  | }
  50  | 
  51  | async function chooseMenu(page: Page, target: string): Promise<void> {
  52  |   for (let index = 0; index < 5 && (await state(page)).menuSelection !== target; index += 1) {
  53  |     await page.keyboard.press('ArrowDown')
  54  |   }
  55  |   expect((await state(page)).menuSelection).toBe(target)
  56  | }
  57  | 
  58  | async function settings(page: Page, confirm = 'Enter'): Promise<void> {
  59  |   await chooseMenu(page, 'settings')
  60  |   await page.keyboard.press(confirm)
  61  |   await expect.poll(async () => (await state(page)).screen).toBe('settings')
> 62  |   expect((await state(page)).settings?.settings).toBeTruthy()
      |                                                  ^ Error: expect(received).toBeTruthy()
  63  | }
  64  | 
  65  | async function row(page: Page, target: string): Promise<void> {
  66  |   for (let index = 0; index < 12 && (await state(page)).settings.selectedRow !== target; index += 1) {
  67  |     await page.keyboard.press('ArrowDown')
  68  |   }
  69  |   expect((await state(page)).settings.selectedRow).toBe(target)
  70  | }
  71  | 
  72  | async function rebind(page: Page, target: string, code: string): Promise<void> {
  73  |   await row(page, target)
  74  |   await page.keyboard.press('Enter')
  75  |   await expect.poll(async () => (await state(page)).settings.captureTarget).toBe(target)
  76  |   await page.keyboard.press(code)
  77  |   await expect.poll(async () => (await state(page)).settings.captureTarget).toBeNull()
  78  | }
  79  | 
  80  | test('menu → remap rejects conflicts/reserved keys; emergency + alternative menu keys; training uses bindings and reload/reset persists', async ({ page }) => {
  81  |   test.setTimeout(90_000)
  82  |   await boot(page)
  83  |   await settings(page)
  84  |   expect((await state(page)).settings.settings).toEqual(DEFAULT_SETTINGS)
  85  | 
  86  |   await row(page, 'takeoff')
  87  |   await page.keyboard.press('Enter')
  88  |   await expect.poll(async () => (await state(page)).settings.captureTarget).toBe('takeoff')
  89  |   await page.keyboard.press('ArrowRight') // bound to another action
  90  |   await expect.poll(async () => (await state(page)).settings.message).toMatch(/KONFLIKT|ZAJĘT|PRZYPISAN|DUPLIKAT/i)
  91  |   expect((await state(page)).settings.settings.bindings.takeoff).toBe('ArrowUp')
  92  |   expect((await state(page)).settings.captureTarget).toBe('takeoff')
  93  |   await page.keyboard.press('KeyD') // shell-reserved debug key, never a jump binding
  94  |   await expect.poll(async () => (await state(page)).settings.message).toMatch(/NIEDOZWOL|ZAJĘT|ZAREZERWOWAN|NIE MOŻNA/i)
  95  |   expect((await state(page)).settings.settings.bindings.takeoff).toBe('ArrowUp')
  96  |   expect((await state(page)).settings.captureTarget).toBe('takeoff')
  97  |   await page.keyboard.press('KeyW')
  98  |   await expect.poll(async () => (await state(page)).settings.settings.bindings.takeoff).toBe('KeyW')
  99  |   await rebind(page, 'right', 'KeyA')
  100 |   await rebind(page, 'menuConfirm', 'KeyE')
  101 |   await rebind(page, 'menuBack', 'KeyB')
  102 | 
  103 |   await page.keyboard.press('Backspace') // emergency fallback even after remapping
  104 |   await expect.poll(async () => (await state(page)).screen).toBe('menu')
  105 |   await settings(page, 'KeyE') // remapped menu confirmation
  106 |   await page.keyboard.press('KeyB') // remapped menu back
  107 |   await expect.poll(async () => (await state(page)).screen).toBe('menu')
  108 |   await settings(page, 'Enter') // emergency confirmation still works
  109 |   await page.keyboard.press('Backspace')
  110 |   await chooseMenu(page, 'training')
  111 |   await page.keyboard.press('Enter')
  112 |   await expect.poll(async () => (await state(page)).screen).toBe('jump')
  113 |   expect((await state(page)).jump?.phase).toBe('GateGreen')
  114 |   await page.keyboard.press('KeyA') // new right binding opens the gate
  115 |   await expect.poll(async () => (await state(page)).jump?.events.some(event => event.endsWith(' gateOpen'))).toBe(true)
  116 |   for (let attempt = 0; attempt < 8 && !(await state(page)).jump?.events.some(event => event.endsWith(' takeoffImpulseStart')); attempt += 1) {
  117 |     await page.keyboard.press('KeyW')
  118 |     await page.waitForTimeout(35)
  119 |   }
  120 |   await expect.poll(async () => (await state(page)).jump?.events.some(event => event.endsWith(' takeoffImpulseStart'))).toBe(true)
  121 |   await page.keyboard.press('Backspace')
  122 |   await expect.poll(async () => (await state(page)).screen).toBe('menu')
  123 | 
  124 |   await boot(page, true)
  125 |   await settings(page)
  126 |   expect((await state(page)).settings.settings.bindings).toMatchObject({ takeoff: 'KeyW', right: 'KeyA' })
  127 |   expect((await state(page)).settings.settings).toMatchObject({ menuConfirm: 'KeyE', menuBack: 'KeyB' })
  128 |   await row(page, 'reset')
  129 |   await page.keyboard.press('Enter')
  130 |   await expect.poll(async () => (await state(page)).settings.settings).toEqual(DEFAULT_SETTINGS)
  131 |   await boot(page, true)
  132 |   await settings(page)
  133 |   expect((await state(page)).settings.settings).toEqual(DEFAULT_SETTINGS)
  134 | })
  135 | 
  136 | test('settings screenshots at both resolutions; scale, text and reduced motion persist on small screens', async ({ page }) => {
  137 |   await page.setViewportSize({ width: 1280, height: 720 })
  138 |   await boot(page)
  139 |   await settings(page)
  140 |   expect((await state(page)).screen).toBe('settings')
  141 |   await page.screenshot({ path: test.info().outputPath('settings-1280x720.png') })
  142 |   await page.setViewportSize({ width: 960, height: 540 })
  143 |   await expect.poll(async () => (await state(page)).canvasScale).toBe(2)
  144 |   await page.screenshot({ path: test.info().outputPath('settings-960x540.png') })
  145 | 
  146 |   await row(page, 'scaleMode')
  147 |   await page.keyboard.press('ArrowRight')
  148 |   await expect.poll(async () => (await state(page)).settings.settings.scaleMode).toBe('integer')
  149 |   await row(page, 'largeText')
  150 |   await page.keyboard.press('Enter')
  151 |   await expect.poll(async () => (await state(page)).settings.settings.largeText).toBe(true)
  152 |   await row(page, 'reducedMotion')
  153 |   await page.keyboard.press('Enter')
  154 |   await expect.poll(async () => (await state(page)).settings.settings.reducedMotion).toBe(true)
  155 |   await expect.poll(async () => (await state(page)).reducedMotion).toBe(true)
  156 |   await row(page, 'volume')
  157 |   await page.keyboard.press('ArrowLeft')
  158 |   await expect.poll(async () => (await state(page)).settings.settings.volume).toBeLessThan(100)
  159 |   const before = (await state(page)).settings.settings
  160 | 
  161 |   await page.setViewportSize({ width: 400, height: 240 })
  162 |   const small = await page.locator('#game-canvas').evaluate(canvas => {
```