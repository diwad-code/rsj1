# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: h04.spec.ts >> H04 competition, real result, bots, transactional save/reload, current and old-version replay isolation
- Location: tests\browser\h04.spec.ts:233:1

# Error details

```
Error: No KeyR input reached the flight: {"phase":"FallSettled","tick":1546,"distance":61.9760354125088,"status":"fall","heightAboveSurface":-7.105427357601002e-15,"targetPitchDeg":8.90000000000004,"flowDeg":-37,"flightSeconds":2.399999999999994,"events":["0 gateOpen","874 takeoffImpulseStart","896 takeoffEdge","1185 measured","1185 contact","1185 fall","1545 fallSettled"]}

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- main "Retro Ski Jumping" [ref=e2]:
  - application "Retro Ski Jumping — KWALIFIKACJE. Tabela konkursu." [active] [ref=e3]
  - paragraph [ref=e4]: KWALIFIKACJE. Tabela konkursu.
```

# Test source

```ts
  40  | const path = (name: string): string => test.info().outputPath(name)
  41  | 
  42  | async function boot(page: Page): Promise<void> {
  43  |   // Resume only the game's documented CI frame-gap pause, without changing simulation state.
  44  |   await page.addInitScript(() => {
  45  |     const w = window as unknown as { __h04ResumeInstalled?: boolean; __retroDebugSnapshot?: () => { paused: boolean; pauseReason: string } }
  46  |     if (w.__h04ResumeInstalled) return
  47  |     w.__h04ResumeInstalled = true
  48  |     const raf = window.requestAnimationFrame.bind(window)
  49  |     window.requestAnimationFrame = callback => raf(now => {
  50  |       const snapshot = w.__retroDebugSnapshot?.()
  51  |       if (snapshot?.paused && snapshot.pauseReason === 'zbyt długa przerwa klatki') {
  52  |         const canvas = document.querySelector('canvas')
  53  |         canvas?.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', bubbles: true }))
  54  |         canvas?.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter', bubbles: true }))
  55  |       }
  56  |       callback(now)
  57  |     })
  58  |   })
  59  |   await page.goto('/?debug')
  60  |   await expect.poll(async () => (await state(page)).persistence.ready).toBe(true)
  61  |   await page.keyboard.press('Enter')
  62  |   await expect.poll(async () => (await state(page)).screen).toBe('menu')
  63  | }
  64  | 
  65  | async function choose(page: Page, key: 'ArrowLeft' | 'ArrowRight', hillId: string): Promise<void> {
  66  |   await page.keyboard.press(key)
  67  |   await expect.poll(async () => {
  68  |     const snapshot = await state(page)
  69  |     return snapshot.selectedHill.loading ? null : snapshot.selectedHill.id
  70  |   }).toBe(hillId)
  71  | }
  72  | 
  73  | async function shot(page: Page, name: string): Promise<void> {
  74  |   expect((await state(page)).paused).toBe(false)
  75  |   const canvas = page.locator('#game-canvas')
  76  |   const box = await canvas.boundingBox()
  77  |   expect([box?.width, box?.height]).toEqual([960, 540])
  78  |   await page.waitForTimeout(100)
  79  |   await canvas.screenshot({ path: path(name) })
  80  | }
  81  | 
  82  | async function startTakeoff(page: Page, mode: 'training' | 'competition'): Promise<void> {
  83  |   const before = await state(page)
  84  |   const gate = mode === 'training' ? before.jump?.gate : before.competition?.actualGateNumber
  85  |   if (!gate) throw new Error('No H04 gate selected for a real keyboard jump')
  86  |   const edge = edgeTickFor(gate, DEFAULT_JUMP_PARAMS, HILL)
  87  |   const lead = Math.round(DEFAULT_JUMP_PARAMS.takeoff.idealLeadSeconds / SIM_DT)
  88  |   await page.keyboard.press('ArrowRight')
  89  |   const events = async () => mode === 'training' ? (await state(page)).jump?.events : (await state(page)).competition?.jump?.events
  90  |   await expect.poll(async () => (await events())?.some(event => event.endsWith(' gateOpen'))).toBe(true)
  91  |   await page.waitForFunction(([edgeTicks, leadTicks, inCompetition]: [number, number, boolean]) => {
  92  |     const snapshot = (window as unknown as { __retroDebugSnapshot(): Snapshot }).__retroDebugSnapshot()
  93  |     const jump = inCompetition ? snapshot.competition?.jump : snapshot.jump
  94  |     const opened = jump?.events.find(event => event.endsWith(' gateOpen'))
  95  |     return opened && jump && jump.tick >= Number(opened.split(' ')[0]) + edgeTicks - leadTicks - 4
  96  |   }, [edge, lead, mode === 'competition'] as [number, number, boolean], { polling: 'raf', timeout: 35_000 })
  97  |   for (let i = 0; i < 10; i += 1) {
  98  |     await page.keyboard.press('ArrowUp')
  99  |     const jump = mode === 'training' ? (await state(page)).jump : (await state(page)).competition?.jump
  100 |     if (jump?.events.some(event => event.endsWith(' takeoffImpulseStart'))) break
  101 |     if (jump?.phase !== 'Inrun' && jump?.phase !== 'Takeoff') break
  102 |     await page.waitForTimeout(25)
  103 |   }
  104 |   await expect.poll(async () => (await events())?.some(event => event.endsWith(' takeoffImpulseStart'))).toBe(true)
  105 | }
  106 | 
  107 | async function finishRealJump(page: Page, mode: 'training' | 'competition', landing: 'KeyR' | 'KeyT', attempt = 1): Promise<void> {
  108 |   let held: 'ArrowLeft' | 'ArrowRight' | null = null
  109 |   let landingSent = false
  110 |   const deadline = Date.now() + 38_000
  111 |   while (Date.now() < deadline) {
  112 |     const snapshot = await state(page)
  113 |     if (mode === 'training' ? snapshot.jump?.status !== null : snapshot.competition?.view !== 'jump') break
  114 |     const phase = mode === 'training' ? snapshot.jump?.phase : snapshot.competition?.jump?.phase
  115 |     if (phase === 'Flight') {
  116 |       const flight = mode === 'training' ? snapshot.jump : snapshot.competition?.jump
  117 |       if (flight && !landingSent) {
  118 |         const desired = flight.flowDeg + (mode === 'training' ? 28 : 32)
  119 |         const next = flight.targetPitchDeg > desired + 0.5 ? 'ArrowRight'
  120 |           : flight.targetPitchDeg < desired - 0.5 ? 'ArrowLeft' : null
  121 |         if (held !== next) {
  122 |           if (held) await page.keyboard.up(held)
  123 |           if (next) await page.keyboard.down(next)
  124 |           held = next
  125 |         }
  126 |       }
  127 |       const ready = mode === 'training' ? (snapshot.jump?.flightSeconds ?? 0) >= 3.2
  128 |         : Boolean(flight && (flight.flightSeconds >= 5
  129 |           || (flight.flightSeconds >= 3 && flight.heightAboveSurface <= 2)))
  130 |       if (!landingSent && ready) {
  131 |         if (held) await page.keyboard.up(held)
  132 |         held = null
  133 |         await page.keyboard.press(landing)
  134 |         landingSent = true
  135 |       }
  136 |     }
  137 |     await page.waitForTimeout(20)
  138 |   }
  139 |   if (held) await page.keyboard.up(held)
> 140 |   expect(landingSent, `No ${landing} input reached the flight: ${JSON.stringify(mode === 'training' ? (await state(page)).jump : (await state(page)).competition?.jump)}`).toBe(true)
      |                                                                                                                                                                            ^ Error: No KeyR input reached the flight: {"phase":"FallSettled","tick":1546,"distance":61.9760354125088,"status":"fall","heightAboveSurface":-7.105427357601002e-15,"targetPitchDeg":8.90000000000004,"flowDeg":-37,"flightSeconds":2.399999999999994,"events":["0 gateOpen","874 takeoffImpulseStart","896 takeoffEdge","1185 measured","1185 contact","1185 fall","1545 fallSettled"]}
  141 |   if (mode === 'training') {
  142 |     await expect.poll(async () => (await state(page)).jump?.completedAttempts, { timeout: 25_000 }).toBe(attempt)
  143 |     expect((await state(page)).jump?.events.some(event => event.endsWith(' landingPrep'))).toBe(true)
  144 |   } else {
  145 |     await expect.poll(async () => (await state(page)).competition?.lastResult, { timeout: 25_000 }).not.toBeNull()
  146 |   }
  147 | }
  148 | 
  149 | async function trainingLanding(page: Page, landing: 'KeyR' | 'KeyT', first: number): Promise<{ attempt: number; raw: number }> {
  150 |   const attempts: Array<{ gate: number; raw: number | null; status: string | null }> = []
  151 |   for (let attempt = first; attempt < first + 4; attempt += 1) {
  152 |     if (attempt !== first) {
  153 |       await page.keyboard.press('Enter')
  154 |       await expect.poll(async () => (await state(page)).jump?.phase).toBe('GateGreen')
  155 |     }
  156 |     const selected = (await state(page)).jump?.gate
  157 |     if (!selected) throw new Error('Missing H04 training gate')
  158 |     // Reach a representative mammoth landing; real wind and keyboard input remain unchanged.
  159 |     // Zachowaj fizyczne pozycje dawnych belek 25/21 po dodaniu 10 niższych.
  160 |     const desired = landing === 'KeyR' ? 35 : 31
  161 |     for (let step = 0; step < HILL.gates.length && (await state(page)).jump?.gate !== desired; step += 1) {
  162 |       const current = (await state(page)).jump?.gate
  163 |       if (!current) throw new Error('Missing H04 training gate during adjustment')
  164 |       await page.keyboard.press(current < desired ? 'BracketRight' : 'BracketLeft')
  165 |       await expect.poll(async () => (await state(page)).jump?.gate).toBe(current + (current < desired ? 1 : -1))
  166 |     }
  167 |     await expect.poll(async () => (await state(page)).jump?.gate).toBe(desired)
  168 |     await startTakeoff(page, 'training')
  169 |     await finishRealJump(page, 'training', landing, attempt)
  170 |     const jump = (await state(page)).jump!
  171 |     attempts.push({ gate: jump.gate, raw: jump.distance, status: jump.status })
  172 |     if (jump.status === 'landed' && (jump.distance ?? 0) >= 200) {
  173 |       console.log(`H04 training ${landing}: attempt ${attempt}, gate ${jump.gate}, raw ${jump.distance?.toFixed(2)}m, result floored ${Math.floor((jump.distance ?? 0) * 2) / 2}m, wind ${jump.windMeasuredMetersPerSecond?.toFixed(2)}m/s`)
  174 |       return { attempt, raw: jump.distance! }
  175 |     }
  176 |   }
  177 |   throw new Error(`No real landed ${landing} attempt >=200m: ${JSON.stringify(attempts)}`)
  178 | }
  179 | 
  180 | test.use({ viewport: { width: 960, height: 540 }, video: { mode: 'on', size: { width: 960, height: 540 } } })
  181 | 
  182 | test('five hills keyboard selection; H04 map and training menu', async ({ page }) => {
  183 |   await boot(page)
  184 |   expect((await state(page)).selectedHill.id).toBe('tech-k120-hs134')
  185 |   for (const id of [H04, 'h03-oberstdorf-large', 'h02-zakopane-large', 'h01-lillehammer-normal', 'tech-k120-hs134']) {
  186 |     await choose(page, 'ArrowLeft', id)
  187 |   }
  188 |   for (const id of ['h01-lillehammer-normal', 'h02-zakopane-large', 'h03-oberstdorf-large', H04]) {
  189 |     await choose(page, 'ArrowRight', id)
  190 |   }
  191 |   expect((await state(page)).selectedHill.version).toBe(VERSION)
  192 |   await expect(page.locator('#screen-reader-status')).toContainText('PLANICA')
  193 |   const markers = buildSportMarkers(HILL)
  194 |   expect(markers.kPoint).toEqual({ meters: 200, point: HILL.surfacePositionAt(200) })
  195 |   expect(markers.hillSize).toEqual({ meters: 240, point: HILL.surfacePositionAt(240) })
  196 |   expect(markers.meterLines.map(line => line.meters)).toEqual(Array.from({ length: 16 }, (_, index) => 165 + 5 * index))
  197 |   for (const line of markers.meterLines) expect(HILL.surfaceDistanceAtPoint(line.point)).toBeCloseTo(line.meters, 1)
  198 |   await page.keyboard.press('Enter')
  199 |   await expect.poll(async () => (await state(page)).screen).toBe('jump')
  200 |   expect((await state(page)).jump?.gateSource).toBe('auto')
  201 |   await page.keyboard.press('Backspace')
  202 |   await page.keyboard.press('ArrowDown')
  203 |   await page.keyboard.press('Enter')
  204 |   await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  205 |   expect((await state(page)).selectedHill.id).toBe(H04)
  206 | })
  207 | 
  208 | test('H04 real keyboard mammoth R and T: scene, shared-map technical view, landed results and full video', async ({ page }) => {
  209 |   test.setTimeout(230_000)
  210 |   await boot(page)
  211 |   await choose(page, 'ArrowLeft', H04)
  212 |   await shot(page, 'h04-menu-960x540.png')
  213 |   await page.keyboard.press('Enter')
  214 |   await expect.poll(async () => (await state(page)).screen).toBe('jump')
  215 |   await shot(page, 'h04-scene-960x540.png')
  216 |   await page.keyboard.press('KeyD')
  217 |   await expect.poll(async () => (await state(page)).jump?.technicalView).toBe(true)
  218 |   await shot(page, 'h04-technical-960x540.png')
  219 |   await page.keyboard.press('KeyD')
  220 |   const parallel = await trainingLanding(page, 'KeyR', 1)
  221 |   expect(parallel.raw).toBeGreaterThanOrEqual(200)
  222 |   await shot(page, 'h04-result-parallel-960x540.png')
  223 |   await page.keyboard.press('Enter')
  224 |   await expect.poll(async () => (await state(page)).jump?.phase).toBe('GateGreen')
  225 |   const telemark = await trainingLanding(page, 'KeyT', parallel.attempt + 1)
  226 |   expect(telemark.raw).toBeGreaterThanOrEqual(200)
  227 |   await shot(page, 'h04-result-telemark-960x540.png')
  228 |   const video = page.video()
  229 |   await page.close()
  230 |   await video?.saveAs(path('h04-real-keyboard-jumps-960x540.webm'))
  231 | })
  232 | 
  233 | test('H04 competition, real result, bots, transactional save/reload, current and old-version replay isolation', async ({ page }) => {
  234 |   test.setTimeout(170_000)
  235 |   await boot(page)
  236 |   await choose(page, 'ArrowLeft', H04)
  237 |   await page.keyboard.press('ArrowDown')
  238 |   await page.keyboard.press('Enter')
  239 |   await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  240 |   await page.keyboard.press('Enter')
```