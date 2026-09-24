# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: h01.spec.ts >> H01 keyboard attempt reaches a scored result and can be repeated
- Location: tests\browser\h01.spec.ts:56:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- main "Retro Ski Jumping" [ref=e2]:
  - application "Retro Ski Jumping — trening, faza GateGreen" [active] [ref=e3]
  - paragraph [ref=e4]: "Trening: LILLEHAMMER INSP. • K90/HS98. Faza GateGreen."
```

# Test source

```ts
  1   | import { expect, test, type Page } from '@playwright/test'
  2   | import { resolve } from 'node:path'
  3   | import { build } from 'vite'
  4   | import type * as Fixture from './h01-replay.fixture'
  5   | import { edgeTickFor } from '../support/jumpHarness'
  6   | import { buildHill } from '../../src/simulation/technicalHill'
  7   | import { LILLEHAMMER_NORMAL } from '../../src/simulation/hills/lillehammerNormal'
  8   | import { SIM_DT } from '../../src/simulation/jump'
  9   | import { DEFAULT_JUMP_PARAMS } from '../../src/simulation/params'
  10  | 
  11  | const H01 = 'h01-lillehammer-normal'
  12  | type State = {
  13  |   screen: string; paused: boolean; selectedHill: { id: string; version: string; loading: boolean }
  14  |   menuSelection: string
  15  |   persistence: { ready: boolean; resumable: boolean; saveState: string; rejectedReason: string | null }
  16  |   jump: { tick: number; events: string[]; gateSource: string; gate: number; leadingTargetHalfMeters: number; phase: string; technicalView: boolean; distance: number | null; status: string | null; completedAttempts: number; attemptNumber: number; targetPitchDeg: number; flowDeg: number; flightSeconds: number } | null
  17  |   competition: {
  18  |     view: string; roundId: string; nextStartIndex: number; roundSize: number
  19  |     standings: Array<{ participantId: string; status: string; totalTenths: number | null }>
  20  |     lastAdministrative: { status: string } | null
  21  |   } | null
  22  |   replay: {
  23  |     hillId: string; visualsCompatible: boolean; notice: string
  24  |     recordedTotalTenths: number; recordedDistanceHalfMeters: number
  25  |   } | null
  26  | }
  27  | const state = (page: Page) => page.evaluate(() => (window as unknown as { __retroDebugSnapshot(): State }).__retroDebugSnapshot())
  28  | async function boot(page: Page, url = '/') {
  29  |   await page.addInitScript(() => {
  30  |     const w = window as unknown as { __h01ResumeInstalled?: boolean; __retroDebugSnapshot?: () => { paused: boolean; pauseReason: string } }
  31  |     if (w.__h01ResumeInstalled) return
  32  |     w.__h01ResumeInstalled = true
  33  |     const raf = window.requestAnimationFrame.bind(window)
  34  |     window.requestAnimationFrame = callback => raf(now => {
  35  |       const s = w.__retroDebugSnapshot?.()
  36  |       if (s?.paused && s.pauseReason === 'zbyt długa przerwa klatki') {
  37  |         const canvas = document.querySelector('canvas')
  38  |         canvas?.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', bubbles: true }))
  39  |         canvas?.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter', bubbles: true }))
  40  |       }
  41  |       callback(now)
  42  |     })
  43  |   })
  44  |   await page.goto(url)
  45  |   await expect.poll(async () => (await state(page)).persistence.ready).toBe(true)
  46  |   await page.keyboard.press('Enter')
  47  |   await expect.poll(async () => (await state(page)).screen).toBe('menu')
  48  |   await page.waitForTimeout(200)
  49  | }
  50  | async function capture(page: Page, name: string) {
  51  |   if ((await state(page)).paused) await page.keyboard.press('Enter')
  52  |   await page.locator('canvas').screenshot({ path: test.info().outputPath(`${name}.png`) })
  53  | }
  54  | 
  55  | test.use({ viewport: { width: 960, height: 540 }, video: { mode: 'on', size: { width: 960, height: 540 } } })
  56  | test('H01 keyboard attempt reaches a scored result and can be repeated', async ({ page }) => {
  57  |   test.setTimeout(60_000)
  58  |   await boot(page)
  59  |   await page.keyboard.press('ArrowRight')
  60  |   await expect.poll(async () => (await state(page)).selectedHill.id).toBe(H01)
  61  |   await expect.poll(async () => (await state(page)).selectedHill.loading).toBe(false)
  62  |   await capture(page, 'h01-menu-live')
  63  |   await page.keyboard.press('Enter')
  64  |   await expect.poll(async () => (await state(page)).screen).toBe('jump')
  65  |   await capture(page, 'h01-scene-live')
  66  |   const gate = (await state(page)).jump?.gate
  67  |   expect(gate).toBe(9)
  68  |   const edge = edgeTickFor(gate!, DEFAULT_JUMP_PARAMS, buildHill(LILLEHAMMER_NORMAL))
  69  |   const lead = Math.round(DEFAULT_JUMP_PARAMS.takeoff.idealLeadSeconds / SIM_DT)
  70  |   await page.keyboard.press('ArrowRight')
> 71  |   await expect.poll(async () => (await state(page)).jump?.events.some((event) => event.endsWith(' gateOpen'))).toBe(true)
      |                                                                                                                ^ Error: expect(received).toBe(expected) // Object.is equality
  72  |   await page.waitForFunction(([edgeTicks, leadTicks]) => {
  73  |     const jump = (window as unknown as { __retroDebugSnapshot(): State }).__retroDebugSnapshot().jump
  74  |     const gateOpen = jump?.events.find((event) => event.endsWith(' gateOpen'))
  75  |     return gateOpen && jump && jump.tick >= Number(gateOpen.split(' ')[0]) + edgeTicks - leadTicks - 10
  76  |   }, [edge, lead], { polling: 'raf', timeout: 30_000 })
  77  |   for (let tries = 0; tries < 8; tries += 1) {
  78  |     await page.keyboard.press('ArrowUp')
  79  |     const jump = (await state(page)).jump
  80  |     if (jump?.events.some((event) => event.endsWith(' takeoffImpulseStart'))) break
  81  |     if (jump?.phase !== 'Inrun' && jump?.phase !== 'Takeoff') break
  82  |     await page.waitForTimeout(50)
  83  |   }
  84  |   await expect.poll(async () => (await state(page)).jump?.events.some((event) => event.endsWith(' takeoffImpulseStart'))).toBe(true)
  85  |   await expect.poll(async () => (await state(page)).jump?.phase).toBe('Flight')
  86  |   let held: 'ArrowLeft' | 'ArrowRight' | null = null
  87  |   let landingSent = false
  88  |   let flightReached = false
  89  |   const deadline = Date.now() + 20_000
  90  |   while (Date.now() < deadline) {
  91  |     const jump = (await state(page)).jump
  92  |     if (!jump || jump.status !== null) break
  93  |     if (jump.phase === 'Flight') flightReached = true
  94  |     if (jump.phase === 'Flight' && jump.flightSeconds >= 2.3 && !landingSent) {
  95  |       if (held) await page.keyboard.up(held)
  96  |       held = null
  97  |       await page.keyboard.press('KeyR')
  98  |       landingSent = true
  99  |     } else if (jump.phase === 'Flight' && !landingSent) {
  100 |       const desired = jump.flowDeg + 28
  101 |       const next = jump.targetPitchDeg > desired + 0.5 ? 'ArrowRight'
  102 |         : jump.targetPitchDeg < desired - 0.5 ? 'ArrowLeft' : null
  103 |       if (held !== next) {
  104 |         if (held) await page.keyboard.up(held)
  105 |         if (next) await page.keyboard.down(next)
  106 |         held = next
  107 |       }
  108 |     }
  109 |     await page.waitForTimeout(24)
  110 |   }
  111 |   if (held) await page.keyboard.up(held)
  112 |   await expect.poll(async () => (await state(page)).jump?.completedAttempts, { timeout: 30_000 }).toBe(1)
  113 |   const finished = (await state(page)).jump
  114 |   expect(flightReached).toBe(true)
  115 |   expect(finished?.distance ?? 0).toBeGreaterThan(0)
  116 |   expect(['landed', 'fall']).toContain(finished?.status)
  117 |   await capture(page, 'h01-live-result')
  118 |   await page.keyboard.press('Enter')
  119 |   await expect.poll(async () => (await state(page)).jump?.attemptNumber).toBe(2)
  120 | })
  121 | 
  122 | test('technical K120 and inspired H01 are selectable; H01 session resumes only on its own version', async ({ page }) => {
  123 |   await boot(page, '/?debug')
  124 |   const technicalId = (await state(page)).selectedHill.id
  125 |   expect(technicalId).toBe('tech-k120-hs134')
  126 |   await page.keyboard.press('Enter')
  127 |   await expect.poll(async () => (await state(page)).jump?.leadingTargetHalfMeters).toBe(254)
  128 |   await capture(page, 'technical-regression')
  129 |   await page.keyboard.press('Backspace')
  130 |   await page.keyboard.press('ArrowRight')
  131 |   await expect.poll(async () => (await state(page)).selectedHill.id).toBe(H01)
  132 |   await expect.poll(async () => (await state(page)).selectedHill.loading).toBe(false)
  133 |   expect((await state(page)).selectedHill.version).toBe('h01-inspired-4')
  134 |   await expect(page.locator('#screen-reader-status')).toContainText('INSPIROWANA')
  135 |   await capture(page, 'h01-selection')
  136 |   await page.keyboard.press('Enter')
  137 |   await expect.poll(async () => (await state(page)).jump?.leadingTargetHalfMeters).toBe(188)
  138 |   expect((await state(page)).jump?.gate).toBe(9)
  139 |   await capture(page, 'h01-scene')
  140 |   await page.keyboard.press('KeyD')
  141 |   await expect.poll(async () => (await state(page)).jump?.technicalView).toBe(true)
  142 |   await capture(page, 'h01-technical')
  143 |   await page.keyboard.press('Backspace')
  144 |   await page.keyboard.press('ArrowDown')
  145 |   await page.keyboard.press('Enter')
  146 |   await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  147 |   await capture(page, 'h01-competition-setup')
  148 |   await page.keyboard.press('Enter')
  149 |   await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')
  150 |   await expect.poll(async () => (await state(page)).screen).toBe('competition')
  151 |   await capture(page, 'h01-competition-start')
  152 | 
  153 |   // Save a non-empty H01 checkpoint and verify its normal restore path.
  154 |   await page.keyboard.press('KeyQ')
  155 |   await expect.poll(async () => (await state(page)).competition?.view).toBe('withdraw-confirm')
  156 |   await page.keyboard.press('Enter')
  157 |   await expect.poll(async () => (await state(page)).competition?.view).toBe('result')
  158 |   await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')
  159 |   const checkpoint = await state(page)
  160 |   expect(checkpoint.competition).toMatchObject({
  161 |     roundId: 'qualification',
  162 |     nextStartIndex: 1,
  163 |     lastAdministrative: { status: 'withdrawn' },
  164 |   })
  165 | 
  166 |   await boot(page)
  167 |   expect((await state(page)).selectedHill.id).toBe(technicalId)
  168 |   expect((await state(page)).persistence.resumable).toBe(false)
  169 |   await page.keyboard.press('ArrowRight')
  170 |   await expect.poll(async () => (await state(page)).selectedHill.id).toBe(H01)
  171 |   await expect.poll(async () => (await state(page)).selectedHill.loading).toBe(false)
```