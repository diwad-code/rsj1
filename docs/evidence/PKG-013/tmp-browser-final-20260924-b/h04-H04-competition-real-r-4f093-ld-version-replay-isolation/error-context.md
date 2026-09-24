# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: h04.spec.ts >> H04 competition, real result, bots, transactional save/reload, current and old-version replay isolation
- Location: tests\browser\h04.spec.ts:275:1

# Error details

```
Error: expect(received).not.toBeNull()

Received: null
```

# Page snapshot

```yaml
- main "Retro Ski Jumping" [ref=e2]:
  - application "Retro Ski Jumping — KWALIFIKACJE. Tabela konkursu." [active] [ref=e3]
  - paragraph [ref=e4]: KWALIFIKACJE. Tabela konkursu.
```

# Test source

```ts
  77  |   const canvas = page.locator('#game-canvas')
  78  |   const box = await canvas.boundingBox()
  79  |   expect([box?.width, box?.height]).toEqual([960, 540])
  80  |   await page.waitForTimeout(100)
  81  |   await canvas.screenshot({ path: path(name) })
  82  | }
  83  | 
  84  | async function startTakeoff(page: Page, mode: 'training' | 'competition'): Promise<void> {
  85  |   const before = await state(page)
  86  |   const gate = mode === 'training' ? before.jump?.gate : before.competition?.actualGateNumber
  87  |   if (!gate) throw new Error('No H04 gate selected for a real keyboard jump')
  88  |   const edge = edgeTickFor(gate, DEFAULT_JUMP_PARAMS, HILL)
  89  |   const lead = Math.round(DEFAULT_JUMP_PARAMS.takeoff.idealLeadSeconds / SIM_DT)
  90  |   const events = async () => mode === 'training' ? (await state(page)).jump?.events : (await state(page)).competition?.jump?.events
  91  |   for (let attempt = 0; attempt < 3 && !(await events())?.some(event => event.endsWith(' gateOpen')); attempt += 1) {
  92  |     await page.keyboard.press('ArrowRight')
  93  |     try {
  94  |       await expect.poll(async () => (await events())?.some(event => event.endsWith(' gateOpen')), { timeout: 800 }).toBe(true)
  95  |     } catch {
  96  |       // A press on the same render frame as gate setup can be missed; retry only while still green.
  97  |       if ((mode === 'training' ? (await state(page)).jump?.phase : (await state(page)).competition?.startPhase) !== 'GateGreen'
  98  |         && (mode !== 'competition' || (await state(page)).competition?.startPhase !== 'green')) throw new Error('Gate did not open after ArrowRight')
  99  |     }
  100 |   }
  101 |   expect((await events())?.some(event => event.endsWith(' gateOpen'))).toBe(true)
  102 |   await page.waitForFunction(([edgeTicks, leadTicks, inCompetition]: [number, number, boolean]) => {
  103 |     const snapshot = (window as unknown as { __retroDebugSnapshot(): Snapshot }).__retroDebugSnapshot()
  104 |     const jump = inCompetition ? snapshot.competition?.jump : snapshot.jump
  105 |     const opened = jump?.events.find(event => event.endsWith(' gateOpen'))
  106 |     return opened && jump && jump.tick >= Number(opened.split(' ')[0]) + edgeTicks - leadTicks - 4
  107 |   }, [edge, lead, mode === 'competition'] as [number, number, boolean], { polling: 'raf', timeout: 35_000 })
  108 |   for (let i = 0; i < 10; i += 1) {
  109 |     await page.keyboard.press('ArrowUp')
  110 |     const jump = mode === 'training' ? (await state(page)).jump : (await state(page)).competition?.jump
  111 |     if (jump?.events.some(event => event.endsWith(' takeoffImpulseStart'))) break
  112 |     if (jump?.phase !== 'Inrun' && jump?.phase !== 'Takeoff') break
  113 |     await page.waitForTimeout(25)
  114 |   }
  115 |   await expect.poll(async () => (await events())?.some(event => event.endsWith(' takeoffImpulseStart'))).toBe(true)
  116 | }
  117 | 
  118 | async function finishRealJump(page: Page, mode: 'training' | 'competition', landing: 'KeyR' | 'KeyT', attempt = 1, clocked = false): Promise<void> {
  119 |   let held: 'ArrowLeft' | 'ArrowRight' | null = null
  120 |   let landingSent = false
  121 |   const deadline = Date.now() + 38_000
  122 |   let frames = 0
  123 |   let lastFlightTick: number | null = null
  124 |   let maxFlightTickDelta = 0
  125 |   let maxPitchError = 0
  126 |   while (Date.now() < deadline && (!clocked || frames++ < 3_000)) {
  127 |     const snapshot = await state(page)
  128 |     if (clocked && snapshot.paused) throw new Error(`Clocked H04 flight paused: ${snapshot.pauseReason}`)
  129 |     if (mode === 'training' ? snapshot.jump?.status !== null : snapshot.competition?.view !== 'jump') break
  130 |     const phase = mode === 'training' ? snapshot.jump?.phase : snapshot.competition?.jump?.phase
  131 |     if (phase === 'Flight') {
  132 |       const flight = mode === 'training' ? snapshot.jump : snapshot.competition?.jump
  133 |       if (flight && clocked) {
  134 |         if (lastFlightTick !== null) maxFlightTickDelta = Math.max(maxFlightTickDelta, flight.tick - lastFlightTick)
  135 |         lastFlightTick = flight.tick
  136 |         maxPitchError = Math.max(maxPitchError, Math.abs(flight.targetPitchDeg - (flight.flowDeg + 29)))
  137 |       }
  138 |       // Contact readiness is measured before any extra steering/frame advancement.
  139 |       const ready = mode === 'training' ? (snapshot.jump?.flightSeconds ?? 0) >= 3.2
  140 |         : Boolean(flight && (flight.flightSeconds >= 5
  141 |           || (flight.flightSeconds >= 3 && flight.heightAboveSurface <= 1.6)))
  142 |       if (!landingSent && ready) {
  143 |         if (held) {
  144 |           await page.keyboard.up(held)
  145 |           if (clocked) await page.clock.runFor(16)
  146 |         }
  147 |         held = null
  148 |         await page.keyboard.press(landing)
  149 |         landingSent = true
  150 |       } else if (flight && !landingSent) {
  151 |         const desired = flight.flowDeg + (mode === 'training' ? 28 : 29)
  152 |         const next = flight.targetPitchDeg > desired + 0.5 ? 'ArrowRight'
  153 |           : flight.targetPitchDeg < desired - 0.5 ? 'ArrowLeft' : null
  154 |         if (held !== next) {
  155 |           if (held) {
  156 |             await page.keyboard.up(held)
  157 |             if (clocked) await page.clock.runFor(16) // keyup must reach a simulation tick before reversal
  158 |           }
  159 |           if (next) await page.keyboard.down(next)
  160 |           held = next
  161 |         }
  162 |       }
  163 |     }
  164 |     if (clocked) await page.clock.runFor(16)
  165 |     else await page.waitForTimeout(20)
  166 |   }
  167 |   if (held) await page.keyboard.up(held)
  168 |   if (clocked) {
  169 |     console.log(`H04 controlled flight: ${frames} frames, max observation gap ${maxFlightTickDelta} ticks, max pitch error ${maxPitchError.toFixed(1)}°`)
  170 |     expect(maxFlightTickDelta, 'Steering observations must remain closer than 67 ms of game time').toBeLessThanOrEqual(8)
  171 |   }
  172 |   expect(landingSent, `No ${landing} input reached the flight: ${JSON.stringify(mode === 'training' ? (await state(page)).jump : (await state(page)).competition?.jump)}`).toBe(true)
  173 |   if (mode === 'training') {
  174 |     await expect.poll(async () => (await state(page)).jump?.completedAttempts, { timeout: 25_000 }).toBe(attempt)
  175 |     expect((await state(page)).jump?.events.some(event => event.endsWith(' landingPrep'))).toBe(true)
  176 |   } else {
> 177 |     if (clocked) expect((await state(page)).competition?.lastResult).not.toBeNull()
      |                                                                          ^ Error: expect(received).not.toBeNull()
  178 |     else await expect.poll(async () => (await state(page)).competition?.lastResult, { timeout: 25_000 }).not.toBeNull()
  179 |   }
  180 | }
  181 | 
  182 | async function trainingLanding(page: Page, landing: 'KeyR' | 'KeyT', first: number): Promise<{ attempt: number; raw: number }> {
  183 |   const attempts: Array<{ gate: number; raw: number | null; status: string | null }> = []
  184 |   for (let attempt = first; attempt < first + 4; attempt += 1) {
  185 |     if (attempt !== first) {
  186 |       await page.keyboard.press('Enter')
  187 |       await expect.poll(async () => (await state(page)).jump?.phase).toBe('GateGreen')
  188 |     }
  189 |     const selected = (await state(page)).jump?.gate
  190 |     if (!selected) throw new Error('Missing H04 training gate')
  191 |     // Reach a representative mammoth landing; real wind and keyboard input remain unchanged.
  192 |     // Zachowaj fizyczne pozycje dawnych belek 25/21 po dodaniu 10 niższych.
  193 |     const desired = landing === 'KeyR' ? 35 : 31
  194 |     for (let step = 0; step < HILL.gates.length && (await state(page)).jump?.gate !== desired; step += 1) {
  195 |       const current = (await state(page)).jump?.gate
  196 |       if (!current) throw new Error('Missing H04 training gate during adjustment')
  197 |       const next = current + (current < desired ? 1 : -1)
  198 |       for (let retry = 0; retry < 3; retry += 1) {
  199 |         await page.keyboard.press(current < desired ? 'BracketRight' : 'BracketLeft')
  200 |         try {
  201 |           await expect.poll(async () => (await state(page)).jump?.gate, { timeout: 600 }).toBe(next)
  202 |           break
  203 |         } catch {
  204 |           const observed = (await state(page)).jump?.gate
  205 |           if (observed !== current || retry === 2) throw new Error(`Gate step ${current}→${next} failed: ${observed}`)
  206 |         }
  207 |       }
  208 |     }
  209 |     await expect.poll(async () => (await state(page)).jump?.gate).toBe(desired)
  210 |     await startTakeoff(page, 'training')
  211 |     await finishRealJump(page, 'training', landing, attempt)
  212 |     const jump = (await state(page)).jump!
  213 |     attempts.push({ gate: jump.gate, raw: jump.distance, status: jump.status })
  214 |     if (jump.status === 'landed' && (jump.distance ?? 0) >= 200) {
  215 |       console.log(`H04 training ${landing}: attempt ${attempt}, gate ${jump.gate}, raw ${jump.distance?.toFixed(2)}m, result floored ${Math.floor((jump.distance ?? 0) * 2) / 2}m, wind ${jump.windMeasuredMetersPerSecond?.toFixed(2)}m/s`)
  216 |       return { attempt, raw: jump.distance! }
  217 |     }
  218 |   }
  219 |   throw new Error(`No real landed ${landing} attempt >=200m: ${JSON.stringify(attempts)}`)
  220 | }
  221 | 
  222 | test.use({ viewport: { width: 960, height: 540 }, video: { mode: 'on', size: { width: 960, height: 540 } } })
  223 | 
  224 | test('five hills keyboard selection; H04 map and training menu', async ({ page }) => {
  225 |   await boot(page)
  226 |   expect((await state(page)).selectedHill.id).toBe('tech-k120-hs134')
  227 |   for (const id of [H04, 'h03-oberstdorf-large', 'h02-zakopane-large', 'h01-lillehammer-normal', 'tech-k120-hs134']) {
  228 |     await choose(page, 'ArrowLeft', id)
  229 |   }
  230 |   for (const id of ['h01-lillehammer-normal', 'h02-zakopane-large', 'h03-oberstdorf-large', H04]) {
  231 |     await choose(page, 'ArrowRight', id)
  232 |   }
  233 |   expect((await state(page)).selectedHill.version).toBe(VERSION)
  234 |   await expect(page.locator('#screen-reader-status')).toContainText('PLANICA')
  235 |   const markers = buildSportMarkers(HILL)
  236 |   expect(markers.kPoint).toEqual({ meters: 200, point: HILL.surfacePositionAt(200) })
  237 |   expect(markers.hillSize).toEqual({ meters: 240, point: HILL.surfacePositionAt(240) })
  238 |   expect(markers.meterLines.map(line => line.meters)).toEqual(Array.from({ length: 16 }, (_, index) => 165 + 5 * index))
  239 |   for (const line of markers.meterLines) expect(HILL.surfaceDistanceAtPoint(line.point)).toBeCloseTo(line.meters, 1)
  240 |   await page.keyboard.press('Enter')
  241 |   await expect.poll(async () => (await state(page)).screen).toBe('jump')
  242 |   expect((await state(page)).jump?.gateSource).toBe('auto')
  243 |   await page.keyboard.press('Backspace')
  244 |   await page.keyboard.press('ArrowDown')
  245 |   await page.keyboard.press('Enter')
  246 |   await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  247 |   expect((await state(page)).selectedHill.id).toBe(H04)
  248 | })
  249 | 
  250 | test('H04 real keyboard mammoth R and T: scene, shared-map technical view, landed results and full video', async ({ page }) => {
  251 |   test.setTimeout(230_000)
  252 |   await boot(page)
  253 |   await choose(page, 'ArrowLeft', H04)
  254 |   await shot(page, 'h04-menu-960x540.png')
  255 |   await page.keyboard.press('Enter')
  256 |   await expect.poll(async () => (await state(page)).screen).toBe('jump')
  257 |   await shot(page, 'h04-scene-960x540.png')
  258 |   await page.keyboard.press('KeyD')
  259 |   await expect.poll(async () => (await state(page)).jump?.technicalView).toBe(true)
  260 |   await shot(page, 'h04-technical-960x540.png')
  261 |   await page.keyboard.press('KeyD')
  262 |   const parallel = await trainingLanding(page, 'KeyR', 1)
  263 |   expect(parallel.raw).toBeGreaterThanOrEqual(200)
  264 |   await shot(page, 'h04-result-parallel-960x540.png')
  265 |   await page.keyboard.press('Enter')
  266 |   await expect.poll(async () => (await state(page)).jump?.phase).toBe('GateGreen')
  267 |   const telemark = await trainingLanding(page, 'KeyT', parallel.attempt + 1)
  268 |   expect(telemark.raw).toBeGreaterThanOrEqual(200)
  269 |   await shot(page, 'h04-result-telemark-960x540.png')
  270 |   const video = page.video()
  271 |   await page.close()
  272 |   await video?.saveAs(path('h04-real-keyboard-jumps-960x540.webm'))
  273 | })
  274 | 
  275 | test('H04 competition, real result, bots, transactional save/reload, current and old-version replay isolation', async ({ page }) => {
  276 |   test.setTimeout(170_000)
  277 |   await page.clock.install() // before navigation; clock flows normally through the real-keyboard takeoff
```