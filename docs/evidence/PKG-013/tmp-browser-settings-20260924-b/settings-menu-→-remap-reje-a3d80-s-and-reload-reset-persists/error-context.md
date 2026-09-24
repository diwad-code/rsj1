# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings.spec.ts >> menu → remap rejects conflicts/reserved keys; emergency + alternative menu keys; training uses bindings and reload/reset persists
- Location: tests\browser\settings.spec.ts:77:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "settings"
Received: "menu"

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- main "Retro Ski Jumping" [ref=e2]:
  - application "Retro Ski Jumping — pauza" [active] [ref=e3]
  - paragraph [ref=e4]: "Pauza: zbyt długa przerwa klatki. Enter wznawia. Wybrano: Ustawienia. TECHNICZNA • K120/HS134. SKOCZNIA TECHNICZNA K120, identyfikator tech-k120-hs134, wersja 3.5.0. Lewo i prawo zmienia skocznię. Góra i dół wybiera tryb, Enter lub KeyE zatwierdza, Backspace lub KeyB wraca. F ponawia pełny ekran. P włącza pauzę. Belka automatyczna 10, prognoza wiatru -0,7 metra na sekundę."
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
  8   | type Snapshot = {
  9   |   screen: string
  10  |   paused: boolean
  11  |   pauseReason: string
  12  |   menuSelection: string
  13  |   canvasScale: number
  14  |   reducedMotion: boolean
  15  |   settings: GameSettings
  16  |   selectedRow: string
  17  |   captureTarget: string | null
  18  |   message: string | null
  19  |   persistence: { ready: boolean; resultCount: number }
  20  |   jump: { phase: string; tick: number; events: string[]; status: string | null } | null
  21  |   replay: {
  22  |     resultId: string | null
  23  |     tick: number
  24  |     playing: boolean
  25  |     sampleCount: number
  26  |     recordedDistanceHalfMeters: number | null
  27  |     recordedTotalTenths: number | null
  28  |   } | null
  29  | }
  30  | 
  31  | const state = (page: Page): Promise<Snapshot> => page.evaluate(() => (
  32  |   window as unknown as { __retroDebugSnapshot: () => Snapshot }
  33  | ).__retroDebugSnapshot())
  34  | 
  35  | async function boot(page: Page, reload = false): Promise<void> {
  36  |   if (reload) await page.reload({ waitUntil: 'domcontentloaded' })
  37  |   else await page.goto('/?debug', { waitUntil: 'domcontentloaded' })
  38  |   await page.keyboard.press('Enter')
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
> 58  |   await expect.poll(async () => (await state(page)).screen).toBe('settings')
      |                                                             ^ Error: expect(received).toBe(expected) // Object.is equality
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
  139 |   await page.setViewportSize({ width: 960, height: 540 })
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
```