# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: h03.spec.ts >> H03 konkurs: jury/belki/wiatr, zapis, boty, reload, replay bieżący i odrzucenie starego/cross-hill
- Location: tests\browser\h03.spec.ts:265:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "h03-oberstdorf-large"
Received: "h04-planica-flying"

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- main "Retro Ski Jumping" [ref=e2]:
  - application "Retro Ski Jumping — menu główne" [active] [ref=e3]
  - paragraph [ref=e4]: Menu główne. PLANICA MAMUT INSP. • K200/HS240. PLANICA — INSPIROWANA, identyfikator h04-planica-flying, wersja h04-inspired-1. Lewo i prawo zmienia skocznię. Góra i dół wybiera tryb. F ponawia pełny ekran. P włącza pauzę. Belka automatyczna 17, prognoza wiatru -0,7 metra na sekundę.
```

# Test source

```ts
  1   | /** PKG-011 V: rzeczywiste wejścia klawiatury i wynik renderowany z builda H03. */
  2   | import { expect, test, type Page } from '@playwright/test'
  3   | import { copyFile } from 'node:fs/promises'
  4   | import { resolve } from 'node:path'
  5   | import { edgeTickFor } from '../support/jumpHarness'
  6   | import { OBERSTDORF_LARGE } from '../../src/simulation/hills/oberstdorfLarge'
  7   | import { buildHill } from '../../src/simulation/technicalHill'
  8   | import { DEFAULT_JUMP_PARAMS } from '../../src/simulation/params'
  9   | import { SIM_DT } from '../../src/simulation/jump'
  10  | 
  11  | const H03 = 'h03-oberstdorf-large'
  12  | const VERSION = 'h03-inspired-1'
  13  | const SESSION = 'standard-h03-oberstdorf-large-1'
  14  | // Nawet opt-in zapisuje najpierw do katalogu testu; archiwizujemy dopiero po udanej próbie.
  15  | const artifactPath = (name: string): string => test.info().outputPath(name)
  16  | async function publishArtifacts(names: readonly string[]): Promise<void> {
  17  |   if (process.env.H03_CAPTURE_ARTIFACTS !== '1') return
  18  |   for (const name of names) {
  19  |     await copyFile(artifactPath(name), resolve('docs/evidence/PKG-011/artifacts', name))
  20  |   }
  21  | }
  22  | type Snapshot = {
  23  |   screen: string
  24  |   paused: boolean
  25  |   pauseReason: string
  26  |   menuSelection: string
  27  |   selectedHill: { id: string; version: string; loading: boolean }
  28  |   jump: {
  29  |     phase: string; tick: number; events: string[]; gate: number; gateSource: string
  30  |     flightSeconds: number; heightAboveSurface: number; flowDeg: number; targetPitchDeg: number
  31  |     distance: number | null; status: string | null; technicalView: boolean; completedAttempts: number
  32  |     resultComponentsTenths: { distance: number; wind: number; juryGate: number } | null
  33  |   } | null
  34  |   competition: {
  35  |     view: string; roundId: string; nextStartIndex: number; startPhase: string | null
  36  |     handoverReady: boolean; juryHeld: boolean; juryGateNumber: number; actualGateNumber: number
  37  |     safeGateCeiling: number; botYieldCount: number
  38  |     lastResult: {
  39  |       resultId: string; status: string; distanceHalfMeters: number; landingSupportHands: number
  40  |       componentTenths: { wind: number; juryGate: number; coachGate: number }
  41  |       versions: { hill: string }
  42  |     } | null
  43  |     jump: { phase: string; tick: number; events: string[]; distance: number | null; status: string | null } | null
  44  |   } | null
  45  |   persistence: {
  46  |     ready: boolean; saveState: string; resumable: boolean; rejectedReason: string | null
  47  |     savedRevision: number | null; recordDistanceHalfMeters: number | null
  48  |   }
  49  |   replay: {
  50  |     hillId: string; visualsCompatible: boolean; notice: string
  51  |     recordedDistanceHalfMeters: number; resultId: string; phase: string | null
  52  |   } | null
  53  | }
  54  | const state = (page: Page): Promise<Snapshot> => page.evaluate(() => (window as unknown as { __retroDebugSnapshot(): Snapshot }).__retroDebugSnapshot())
  55  | 
  56  | async function boot(page: Page): Promise<void> {
  57  |   // Tylko udokumentowana automatyczna pauza przeciążenia CI; nie ustawiamy stanu gry.
  58  |   await page.addInitScript(() => {
  59  |     const w = window as unknown as { __h03ResumeInstalled?: boolean; __retroDebugSnapshot?: () => { paused: boolean; pauseReason: string } }
  60  |     if (w.__h03ResumeInstalled) return
  61  |     w.__h03ResumeInstalled = true
  62  |     const raf = window.requestAnimationFrame.bind(window)
  63  |     window.requestAnimationFrame = callback => raf(now => {
  64  |       const s = w.__retroDebugSnapshot?.()
  65  |       if (s?.paused && s.pauseReason === 'zbyt długa przerwa klatki') {
  66  |         const canvas = document.querySelector('canvas')
  67  |         canvas?.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', bubbles: true }))
  68  |         canvas?.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter', bubbles: true }))
  69  |       }
  70  |       callback(now)
  71  |     })
  72  |   })
  73  |   await page.goto('/?debug')
  74  |   await expect.poll(async () => (await state(page)).persistence.ready).toBe(true)
  75  |   await page.keyboard.press('Enter')
  76  |   await expect.poll(async () => (await state(page)).screen).toBe('menu')
  77  | }
  78  | 
  79  | async function choose(page: Page, key: 'ArrowLeft' | 'ArrowRight', expected: string): Promise<void> {
  80  |   await page.keyboard.press(key)
  81  |   await expect.poll(async () => {
  82  |     const snap = await state(page)
  83  |     return snap.selectedHill.loading ? null : snap.selectedHill.id
> 84  |   }).toBe(expected)
      |      ^ Error: expect(received).toBe(expected) // Object.is equality
  85  | }
  86  | 
  87  | async function shot(page: Page, name: string): Promise<void> {
  88  |   expect((await state(page)).paused).toBe(false)
  89  |   const canvas = page.locator('#game-canvas')
  90  |   const box = await canvas.boundingBox()
  91  |   expect([box?.width, box?.height]).toEqual([960, 540])
  92  |   await page.waitForTimeout(100)
  93  |   await canvas.screenshot({ path: artifactPath(name) })
  94  | }
  95  | 
  96  | async function startTakeoff(page: Page, mode: 'training' | 'competition'): Promise<void> {
  97  |   const initial = await state(page)
  98  |   const gate = mode === 'training' ? initial.jump?.gate : initial.competition?.actualGateNumber
  99  |   if (!gate) throw new Error('Brak wybranej belki H03')
  100 |   const edge = edgeTickFor(gate, DEFAULT_JUMP_PARAMS, buildHill(OBERSTDORF_LARGE))
  101 |   const lead = Math.round(DEFAULT_JUMP_PARAMS.takeoff.idealLeadSeconds / SIM_DT)
  102 |   await page.keyboard.press('ArrowRight')
  103 |   const events = async () => mode === 'training' ? (await state(page)).jump?.events : (await state(page)).competition?.jump?.events
  104 |   await expect.poll(async () => (await events())?.some(e => e.endsWith(' gateOpen'))).toBe(true)
  105 |   await page.waitForFunction(([edgeTicks, leadTicks, competition]: [number, number, boolean]) => {
  106 |     const snap = (window as unknown as { __retroDebugSnapshot(): Snapshot }).__retroDebugSnapshot()
  107 |     const jump = competition ? snap.competition?.jump : snap.jump
  108 |     const opened = jump?.events.find(e => e.endsWith(' gateOpen'))
  109 |     return opened && jump && jump.tick >= Number(opened.split(' ')[0]) + edgeTicks - leadTicks - (competition ? 4 : 12)
  110 |   }, [edge, lead, mode === 'competition'] as [number, number, boolean], { polling: 'raf', timeout: 30_000 })
  111 |   for (let i = 0; i < 10; i += 1) {
  112 |     await page.keyboard.press('ArrowUp')
  113 |     const jump = mode === 'training' ? (await state(page)).jump : (await state(page)).competition?.jump
  114 |     if (jump?.events.some(e => e.endsWith(' takeoffImpulseStart'))) break
  115 |     if (jump?.phase !== 'Inrun' && jump?.phase !== 'Takeoff') break
  116 |     await page.waitForTimeout(25)
  117 |   }
  118 |   await expect.poll(async () => (await events())?.some(e => e.endsWith(' takeoffImpulseStart'))).toBe(true)
  119 | }
  120 | 
  121 | async function finishRealJump(page: Page, mode: 'training' | 'competition', style: 'KeyR' | 'KeyT', attempt = 1): Promise<void> {
  122 |   let held: 'ArrowLeft' | 'ArrowRight' | null = null
  123 |   let landingSent = false
  124 |   let previousHeight: number | null = null
  125 |   const deadline = Date.now() + 26_000
  126 |   while (Date.now() < deadline) {
  127 |     const snap = await state(page)
  128 |     if (mode === 'training' ? snap.jump?.status !== null : snap.competition?.view !== 'jump') break
  129 |     const phase = mode === 'training' ? snap.jump?.phase : snap.competition?.jump?.phase
  130 |     if (phase === 'Flight') {
  131 |       if (mode === 'training' && snap.jump && !landingSent) {
  132 |         // Bufor kilku stopni chroni przed chwilowym przesterowaniem AoA
  133 |         // między odczytami CDP i utratą nośności na początku lotu.
  134 |         const target = snap.jump.flowDeg + 28
  135 |         const next = snap.jump.targetPitchDeg > target + 0.5 ? 'ArrowRight'
  136 |           : snap.jump.targetPitchDeg < target - 0.5 ? 'ArrowLeft' : null
  137 |         if (held !== next) {
  138 |           if (held) await page.keyboard.up(held)
  139 |           if (next) await page.keyboard.down(next)
  140 |           held = next
  141 |         }
  142 |       }
  143 |       // W konkursie snapshot nie eksponuje flightSeconds; warunek przygotowania
  144 |       // opiera się na ticku zdarzenia takeoffEdge z tego samego realnego skoku.
  145 |       const edge = snap.competition?.jump?.events.find(e => e.endsWith(' takeoffEdge'))
  146 |       // T/R dopiero przy zejściu nad stok; w testach symulacji R po ~3,4 s
  147 |       // daje okolice K, a przygotowanie potrzebuje 0,16 / 0,28 s.
  148 |       const currentHeight = snap.jump?.heightAboveSurface ?? Infinity
  149 |       const descending = previousHeight !== null && currentHeight < previousHeight
  150 |       const ready = mode === 'training'
  151 |         ? (snap.jump?.flightSeconds ?? 0) >= 2.6 && currentHeight <= 10
  152 |           && (descending || (snap.jump?.flightSeconds ?? 0) >= 3.7)
  153 |         : Boolean(edge && (snap.competition?.jump?.tick ?? 0) >= Number(edge.split(' ')[0]) + 240)
  154 |       if (mode === 'training') previousHeight = currentHeight
  155 |       if (!landingSent && ready) {
  156 |         if (held) await page.keyboard.up(held)
  157 |         held = null
  158 |         await page.keyboard.press(style)
  159 |         landingSent = true
  160 |       }
  161 |     }
  162 |     await page.waitForTimeout(20)
  163 |   }
  164 |   if (held) await page.keyboard.up(held)
  165 |   if (mode === 'training') {
  166 |     await expect.poll(async () => (await state(page)).jump?.completedAttempts, { timeout: 20_000 }).toBe(attempt)
  167 |   } else {
  168 |     await expect.poll(async () => (await state(page)).competition?.lastResult, { timeout: 20_000 }).not.toBeNull()
  169 |   }
  170 | }
  171 | 
  172 | async function landTraining(page: Page, style: 'KeyR' | 'KeyT', startingAttempt: number): Promise<number> {
  173 |   const attempts: Array<{ gate: number; status: string | null; meters: number | null; flightSeconds: number; events: string[] }> = []
  174 |   for (let attempt = startingAttempt; attempt < startingAttempt + 4; attempt += 1) {
  175 |     if (attempt !== startingAttempt) {
  176 |       await page.keyboard.press('Enter')
  177 |       await expect.poll(async () => (await state(page)).jump?.phase).toBe('GateGreen')
  178 |     }
  179 |     // Ręczna wyższa belka treningowa: AUTO wybiera sufit dla konkursu, a tu
  180 |     // pokazujemy grywalny długi skok bez zmiany wiatru, fizyki ani seedów.
  181 |     const desiredGate = style === 'KeyR' ? 24 : 23
  182 |     const currentGate = (await state(page)).jump?.gate
  183 |     if (currentGate === undefined) throw new Error('Brak belki H03 w treningu')
  184 |     const key = currentGate < desiredGate ? 'BracketRight' : 'BracketLeft'
```