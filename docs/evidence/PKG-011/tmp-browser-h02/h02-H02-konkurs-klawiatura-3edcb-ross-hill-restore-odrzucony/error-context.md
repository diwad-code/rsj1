# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: h02.spec.ts >> H02 konkurs: klawiatura, zapis/reload, replay bieżący i starsza wersja, cross-hill restore odrzucony
- Location: tests\browser\h02.spec.ts:187:1

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:4173/?debug
Call log:
  - navigating to "http://127.0.0.1:4173/?debug", waiting until "load"

```

# Test source

```ts
  1   | import { expect, test, type Page } from '@playwright/test'
  2   | import { resolve } from 'node:path'
  3   | import { edgeTickFor } from '../support/jumpHarness'
  4   | import { ZAKOPANE_LARGE } from '../../src/simulation/hills/zakopaneLarge'
  5   | import { buildHill } from '../../src/simulation/technicalHill'
  6   | import { DEFAULT_JUMP_PARAMS } from '../../src/simulation/params'
  7   | import { SIM_DT } from '../../src/simulation/jump'
  8   | 
  9   | const H02 = 'h02-zakopane-large'
  10  | const SESSION = 'standard-h02-zakopane-large-1'
  11  | const artifacts = resolve('docs/evidence/PKG-010/artifacts')
  12  | type Snapshot = {
  13  |   screen: string
  14  |   paused: boolean
  15  |   pauseReason: string
  16  |   menuSelection: string
  17  |   selectedHill: { id: string; version: string; name: string; loading: boolean }
  18  |   jump: {
  19  |     phase: string; tick: number; events: string[]; gate: number; gateSource: string
  20  |     flightSeconds: number; flowDeg: number; targetPitchDeg: number
  21  |     distance: number | null; status: string | null; technicalView: boolean; completedAttempts: number
  22  |   } | null
  23  |   competition: {
  24  |     view: string; roundId: string; nextStartIndex: number; startPhase: string | null
  25  |     handoverReady: boolean; actualGateNumber: number
  26  |     lastResult: { resultId: string; status: string; distanceHalfMeters: number; versions: { hill: string } } | null
  27  |     jump: { phase: string; tick: number; events: string[]; distance: number | null; status: string | null } | null
  28  |   } | null
  29  |   persistence: { ready: boolean; saveState: string; resumable: boolean; rejectedReason: string | null; savedRevision: number | null }
  30  |   replay: { hillId: string; visualsCompatible: boolean; notice: string; recordedDistanceHalfMeters: number; resultId: string; phase: string | null } | null
  31  | }
  32  | const state = (page: Page): Promise<Snapshot> => page.evaluate(() => (window as unknown as { __retroDebugSnapshot(): Snapshot }).__retroDebugSnapshot())
  33  | 
  34  | async function boot(page: Page, url = '/?debug'): Promise<void> {
  35  |   // Przeciążenie maszyny CI może spauzować grę: tylko ten techniczny typ pauzy
  36  |   // jest automatycznie wznawiany. Nie przesuwamy symulacji debug setterem.
  37  |   await page.addInitScript(() => {
  38  |     const w = window as unknown as { __h02ResumeInstalled?: boolean; __retroDebugSnapshot?: () => { paused: boolean; pauseReason: string } }
  39  |     if (w.__h02ResumeInstalled) return
  40  |     w.__h02ResumeInstalled = true
  41  |     const raf = window.requestAnimationFrame.bind(window)
  42  |     window.requestAnimationFrame = callback => raf(now => {
  43  |       const s = w.__retroDebugSnapshot?.()
  44  |       if (s?.paused && s.pauseReason === 'zbyt długa przerwa klatki') {
  45  |         const canvas = document.querySelector('canvas')
  46  |         canvas?.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', bubbles: true }))
  47  |         canvas?.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter', bubbles: true }))
  48  |       }
  49  |       callback(now)
  50  |     })
  51  |   })
> 52  |   await page.goto(url)
      |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:4173/?debug
  53  |   await expect.poll(async () => (await state(page)).persistence.ready).toBe(true)
  54  |   await page.keyboard.press('Enter')
  55  |   await expect.poll(async () => (await state(page)).screen).toBe('menu')
  56  | }
  57  | 
  58  | async function choose(page: Page, key: 'ArrowLeft' | 'ArrowRight', expected: string): Promise<void> {
  59  |   await page.keyboard.press(key)
  60  |   await expect.poll(async () => {
  61  |     const snap = await state(page)
  62  |     return snap.selectedHill.loading ? null : snap.selectedHill.id
  63  |   }).toBe(expected)
  64  | }
  65  | 
  66  | async function shot(page: Page, name: string): Promise<void> {
  67  |   expect((await state(page)).paused).toBe(false)
  68  |   await page.waitForTimeout(100) // aktualny frame Canvas po zmianie ekranu
  69  |   await page.locator('#game-canvas').screenshot({ path: resolve(artifacts, name) })
  70  | }
  71  | 
  72  | async function pressTakeoff(page: Page, mode: 'training' | 'competition'): Promise<void> {
  73  |   const snap = await state(page)
  74  |   const gate = mode === 'training' ? snap.jump?.gate : undefined
  75  |   const compGate = snap.competition?.actualGateNumber
  76  |   const targetGate = mode === 'training' ? gate : compGate
  77  |   if (!targetGate) throw new Error('Brak belki przed skokiem H02')
  78  |   const edge = edgeTickFor(targetGate, DEFAULT_JUMP_PARAMS, buildHill(ZAKOPANE_LARGE))
  79  |   const lead = Math.round(DEFAULT_JUMP_PARAMS.takeoff.idealLeadSeconds / SIM_DT)
  80  |   await page.keyboard.press('ArrowRight')
  81  |   await expect.poll(async () => (mode === 'training' ? (await state(page)).jump?.events : (await state(page)).competition?.jump?.events)?.some(e => e.endsWith(' gateOpen'))).toBe(true)
  82  |   await page.waitForFunction(([edgeTicks, leadTicks, competition]: [number, number, boolean]) => {
  83  |     const snapshot = (window as unknown as { __retroDebugSnapshot(): Snapshot }).__retroDebugSnapshot()
  84  |     const jump = competition ? snapshot.competition?.jump : snapshot.jump
  85  |     const gateOpen = jump?.events.find(e => e.endsWith(' gateOpen'))
  86  |     return gateOpen && jump && jump.tick >= Number(gateOpen.split(' ')[0]) + edgeTicks - leadTicks - 10
  87  |   }, [edge, lead, mode === 'competition'] as [number, number, boolean], { polling: 'raf', timeout: 30_000 })
  88  |   for (let i = 0; i < 10; i += 1) {
  89  |     await page.keyboard.press('ArrowUp')
  90  |     const jump = mode === 'training' ? (await state(page)).jump : (await state(page)).competition?.jump
  91  |     if (jump?.events.some(e => e.endsWith(' takeoffImpulseStart'))) break
  92  |     if (jump?.phase !== 'Inrun' && jump?.phase !== 'Takeoff') break
  93  |     await page.waitForTimeout(25)
  94  |   }
  95  |   await expect.poll(async () => (mode === 'training' ? (await state(page)).jump : (await state(page)).competition?.jump)?.events.some(e => e.endsWith(' takeoffImpulseStart'))).toBe(true)
  96  | }
  97  | 
  98  | async function finishRealJump(page: Page, mode: 'training' | 'competition'): Promise<void> {
  99  |   let held: 'ArrowLeft' | 'ArrowRight' | null = null
  100 |   let landingSent = false
  101 |   const competitionGate = (await state(page)).competition?.actualGateNumber
  102 |   const competitionEdge = competitionGate ? edgeTickFor(competitionGate, DEFAULT_JUMP_PARAMS, buildHill(ZAKOPANE_LARGE)) : 0
  103 |   const deadline = Date.now() + 22_000
  104 |   while (Date.now() < deadline) {
  105 |     const snap = await state(page)
  106 |     if (mode === 'training' ? snap.jump?.status !== null : snap.competition?.view !== 'jump') break
  107 |     const phase = mode === 'training' ? snap.jump?.phase : snap.competition?.jump?.phase
  108 |     if (phase === 'Flight') {
  109 |       const flightSeconds = snap.jump?.flightSeconds ?? 0
  110 |       if ((mode === 'training' && flightSeconds >= 3.2 || mode === 'competition' && snap.competition?.jump && snap.competition.jump.tick >= competitionEdge + 240) && !landingSent) {
  111 |         if (held) await page.keyboard.up(held)
  112 |         held = null
  113 |         await page.keyboard.press('KeyR')
  114 |         landingSent = true
  115 |       } else if (mode === 'training' && !landingSent && snap.jump) {
  116 |         const target = snap.jump.flowDeg + 32
  117 |         const next = snap.jump.targetPitchDeg > target + 0.5 ? 'ArrowRight'
  118 |           : snap.jump.targetPitchDeg < target - 0.5 ? 'ArrowLeft' : null
  119 |         if (held !== next) {
  120 |           if (held) await page.keyboard.up(held)
  121 |           if (next) await page.keyboard.down(next)
  122 |           held = next
  123 |         }
  124 |       }
  125 |     }
  126 |     await page.waitForTimeout(20)
  127 |   }
  128 |   if (held) await page.keyboard.up(held)
  129 |   if (mode === 'training') await expect.poll(async () => (await state(page)).jump?.completedAttempts, { timeout: 20_000 }).toBe(1)
  130 |   else await expect.poll(async () => (await state(page)).competition?.lastResult, { timeout: 20_000 }).not.toBeNull()
  131 | }
  132 | 
  133 | test.use({ viewport: { width: 960, height: 540 }, video: { mode: 'on', size: { width: 960, height: 540 } } })
  134 | 
  135 | test('cztery skocznie: lewo/prawo w obie strony, H02 w treningu i konfiguracji konkursu', async ({ page }) => {
  136 |   await boot(page)
  137 |   expect((await state(page)).selectedHill.id).toBe('tech-k120-hs134')
  138 |   await choose(page, 'ArrowLeft', 'h03-oberstdorf-large')
  139 |   await choose(page, 'ArrowLeft', H02)
  140 |   await choose(page, 'ArrowRight', 'h03-oberstdorf-large')
  141 |   await choose(page, 'ArrowRight', 'tech-k120-hs134')
  142 |   await choose(page, 'ArrowRight', 'h01-lillehammer-normal')
  143 |   await choose(page, 'ArrowRight', H02)
  144 |   await choose(page, 'ArrowLeft', 'h01-lillehammer-normal')
  145 |   await choose(page, 'ArrowRight', H02)
  146 |   await page.keyboard.press('Enter')
  147 |   await expect.poll(async () => (await state(page)).screen).toBe('jump')
  148 |   expect((await state(page)).jump?.gateSource).toBe('auto')
  149 |   await page.keyboard.press('Backspace')
  150 |   await page.keyboard.press('ArrowDown')
  151 |   await page.keyboard.press('Enter')
  152 |   await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
```