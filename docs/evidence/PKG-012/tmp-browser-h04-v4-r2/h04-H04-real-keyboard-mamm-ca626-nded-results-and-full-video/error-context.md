# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: h04.spec.ts >> H04 real keyboard mammoth R and T: scene, shared-map technical view, landed results and full video
- Location: tests\browser\h04.spec.ts:218:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 8
Received: 7

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- main "Retro Ski Jumping" [ref=e2]:
  - application "Retro Ski Jumping — trening, faza GateGreen" [active] [ref=e3]
  - paragraph [ref=e4]: "Trening: PLANICA MAMUT INSP. • K200/HS240. Faza GateGreen."
```

# Test source

```ts
  75  |   expect((await state(page)).paused).toBe(false)
  76  |   const canvas = page.locator('#game-canvas')
  77  |   const box = await canvas.boundingBox()
  78  |   expect([box?.width, box?.height]).toEqual([960, 540])
  79  |   await page.waitForTimeout(100)
  80  |   await canvas.screenshot({ path: path(name) })
  81  | }
  82  | 
  83  | async function startTakeoff(page: Page, mode: 'training' | 'competition'): Promise<void> {
  84  |   const before = await state(page)
  85  |   const gate = mode === 'training' ? before.jump?.gate : before.competition?.actualGateNumber
  86  |   if (!gate) throw new Error('No H04 gate selected for a real keyboard jump')
  87  |   const edge = edgeTickFor(gate, DEFAULT_JUMP_PARAMS, HILL)
  88  |   const lead = Math.round(DEFAULT_JUMP_PARAMS.takeoff.idealLeadSeconds / SIM_DT)
  89  |   const events = async () => mode === 'training' ? (await state(page)).jump?.events : (await state(page)).competition?.jump?.events
  90  |   for (let attempt = 0; attempt < 3 && !(await events())?.some(event => event.endsWith(' gateOpen')); attempt += 1) {
  91  |     await page.keyboard.press('ArrowRight')
  92  |     try {
  93  |       await expect.poll(async () => (await events())?.some(event => event.endsWith(' gateOpen')), { timeout: 800 }).toBe(true)
  94  |     } catch {
  95  |       // A press on the same render frame as gate setup can be missed; retry only while still green.
  96  |       if ((mode === 'training' ? (await state(page)).jump?.phase : (await state(page)).competition?.startPhase) !== 'GateGreen'
  97  |         && (mode !== 'competition' || (await state(page)).competition?.startPhase !== 'green')) throw new Error('Gate did not open after ArrowRight')
  98  |     }
  99  |   }
  100 |   expect((await events())?.some(event => event.endsWith(' gateOpen'))).toBe(true)
  101 |   await page.waitForFunction(([edgeTicks, leadTicks, inCompetition]: [number, number, boolean]) => {
  102 |     const snapshot = (window as unknown as { __retroDebugSnapshot(): Snapshot }).__retroDebugSnapshot()
  103 |     const jump = inCompetition ? snapshot.competition?.jump : snapshot.jump
  104 |     const opened = jump?.events.find(event => event.endsWith(' gateOpen'))
  105 |     return opened && jump && jump.tick >= Number(opened.split(' ')[0]) + edgeTicks - leadTicks - 4
  106 |   }, [edge, lead, mode === 'competition'] as [number, number, boolean], { polling: 'raf', timeout: 35_000 })
  107 |   for (let i = 0; i < 10; i += 1) {
  108 |     await page.keyboard.press('ArrowUp')
  109 |     const jump = mode === 'training' ? (await state(page)).jump : (await state(page)).competition?.jump
  110 |     if (jump?.events.some(event => event.endsWith(' takeoffImpulseStart'))) break
  111 |     if (jump?.phase !== 'Inrun' && jump?.phase !== 'Takeoff') break
  112 |     await page.waitForTimeout(25)
  113 |   }
  114 |   await expect.poll(async () => (await events())?.some(event => event.endsWith(' takeoffImpulseStart'))).toBe(true)
  115 | }
  116 | 
  117 | async function finishRealJump(page: Page, mode: 'training' | 'competition', landing: 'KeyR' | 'KeyT', attempt = 1): Promise<void> {
  118 |   let held: 'ArrowLeft' | 'ArrowRight' | null = null
  119 |   let landingSent = false
  120 |   const deadline = Date.now() + 38_000
  121 |   while (Date.now() < deadline) {
  122 |     const snapshot = await state(page)
  123 |     if (mode === 'training' ? snapshot.jump?.status !== null : snapshot.competition?.view !== 'jump') break
  124 |     const phase = mode === 'training' ? snapshot.jump?.phase : snapshot.competition?.jump?.phase
  125 |     if (phase === 'Flight') {
  126 |       const flight = mode === 'training' ? snapshot.jump : snapshot.competition?.jump
  127 |       if (flight && !landingSent) {
  128 |         const desired = flight.flowDeg + (mode === 'training' ? 28 : 29)
  129 |         const next = flight.targetPitchDeg > desired + 0.5 ? 'ArrowRight'
  130 |           : flight.targetPitchDeg < desired - 0.5 ? 'ArrowLeft' : null
  131 |         if (held !== next) {
  132 |           if (held) await page.keyboard.up(held)
  133 |           if (next) await page.keyboard.down(next)
  134 |           held = next
  135 |         }
  136 |       }
  137 |       const ready = mode === 'training' ? (snapshot.jump?.flightSeconds ?? 0) >= 3.2
  138 |         : Boolean(flight && (flight.flightSeconds >= 5
  139 |           || (flight.flightSeconds >= 3 && flight.heightAboveSurface <= 1.6)))
  140 |       if (!landingSent && ready) {
  141 |         if (held) await page.keyboard.up(held)
  142 |         held = null
  143 |         await page.keyboard.press(landing)
  144 |         landingSent = true
  145 |       }
  146 |     }
  147 |     await page.waitForTimeout(20)
  148 |   }
  149 |   if (held) await page.keyboard.up(held)
  150 |   expect(landingSent, `No ${landing} input reached the flight: ${JSON.stringify(mode === 'training' ? (await state(page)).jump : (await state(page)).competition?.jump)}`).toBe(true)
  151 |   if (mode === 'training') {
  152 |     await expect.poll(async () => (await state(page)).jump?.completedAttempts, { timeout: 25_000 }).toBe(attempt)
  153 |     expect((await state(page)).jump?.events.some(event => event.endsWith(' landingPrep'))).toBe(true)
  154 |   } else {
  155 |     await expect.poll(async () => (await state(page)).competition?.lastResult, { timeout: 25_000 }).not.toBeNull()
  156 |   }
  157 | }
  158 | 
  159 | async function trainingLanding(page: Page, landing: 'KeyR' | 'KeyT', first: number): Promise<{ attempt: number; raw: number }> {
  160 |   const attempts: Array<{ gate: number; raw: number | null; status: string | null }> = []
  161 |   for (let attempt = first; attempt < first + 4; attempt += 1) {
  162 |     if (attempt !== first) {
  163 |       await page.keyboard.press('Enter')
  164 |       await expect.poll(async () => (await state(page)).jump?.phase).toBe('GateGreen')
  165 |     }
  166 |     const selected = (await state(page)).jump?.gate
  167 |     if (!selected) throw new Error('Missing H04 training gate')
  168 |     // Reach a representative mammoth landing; real wind and keyboard input remain unchanged.
  169 |     // Zachowaj fizyczne pozycje dawnych belek 25/21 po dodaniu 10 niższych.
  170 |     const desired = landing === 'KeyR' ? 35 : 31
  171 |     for (let step = 0; step < HILL.gates.length && (await state(page)).jump?.gate !== desired; step += 1) {
  172 |       const current = (await state(page)).jump?.gate
  173 |       if (!current) throw new Error('Missing H04 training gate during adjustment')
  174 |       await page.keyboard.press(current < desired ? 'BracketRight' : 'BracketLeft')
> 175 |       await expect.poll(async () => (await state(page)).jump?.gate).toBe(current + (current < desired ? 1 : -1))
      |                                                                     ^ Error: expect(received).toBe(expected) // Object.is equality
  176 |     }
  177 |     await expect.poll(async () => (await state(page)).jump?.gate).toBe(desired)
  178 |     await startTakeoff(page, 'training')
  179 |     await finishRealJump(page, 'training', landing, attempt)
  180 |     const jump = (await state(page)).jump!
  181 |     attempts.push({ gate: jump.gate, raw: jump.distance, status: jump.status })
  182 |     if (jump.status === 'landed' && (jump.distance ?? 0) >= 200) {
  183 |       console.log(`H04 training ${landing}: attempt ${attempt}, gate ${jump.gate}, raw ${jump.distance?.toFixed(2)}m, result floored ${Math.floor((jump.distance ?? 0) * 2) / 2}m, wind ${jump.windMeasuredMetersPerSecond?.toFixed(2)}m/s`)
  184 |       return { attempt, raw: jump.distance! }
  185 |     }
  186 |   }
  187 |   throw new Error(`No real landed ${landing} attempt >=200m: ${JSON.stringify(attempts)}`)
  188 | }
  189 | 
  190 | test.use({ viewport: { width: 960, height: 540 }, video: { mode: 'on', size: { width: 960, height: 540 } } })
  191 | 
  192 | test('five hills keyboard selection; H04 map and training menu', async ({ page }) => {
  193 |   await boot(page)
  194 |   expect((await state(page)).selectedHill.id).toBe('tech-k120-hs134')
  195 |   for (const id of [H04, 'h03-oberstdorf-large', 'h02-zakopane-large', 'h01-lillehammer-normal', 'tech-k120-hs134']) {
  196 |     await choose(page, 'ArrowLeft', id)
  197 |   }
  198 |   for (const id of ['h01-lillehammer-normal', 'h02-zakopane-large', 'h03-oberstdorf-large', H04]) {
  199 |     await choose(page, 'ArrowRight', id)
  200 |   }
  201 |   expect((await state(page)).selectedHill.version).toBe(VERSION)
  202 |   await expect(page.locator('#screen-reader-status')).toContainText('PLANICA')
  203 |   const markers = buildSportMarkers(HILL)
  204 |   expect(markers.kPoint).toEqual({ meters: 200, point: HILL.surfacePositionAt(200) })
  205 |   expect(markers.hillSize).toEqual({ meters: 240, point: HILL.surfacePositionAt(240) })
  206 |   expect(markers.meterLines.map(line => line.meters)).toEqual(Array.from({ length: 16 }, (_, index) => 165 + 5 * index))
  207 |   for (const line of markers.meterLines) expect(HILL.surfaceDistanceAtPoint(line.point)).toBeCloseTo(line.meters, 1)
  208 |   await page.keyboard.press('Enter')
  209 |   await expect.poll(async () => (await state(page)).screen).toBe('jump')
  210 |   expect((await state(page)).jump?.gateSource).toBe('auto')
  211 |   await page.keyboard.press('Backspace')
  212 |   await page.keyboard.press('ArrowDown')
  213 |   await page.keyboard.press('Enter')
  214 |   await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  215 |   expect((await state(page)).selectedHill.id).toBe(H04)
  216 | })
  217 | 
  218 | test('H04 real keyboard mammoth R and T: scene, shared-map technical view, landed results and full video', async ({ page }) => {
  219 |   test.setTimeout(230_000)
  220 |   await boot(page)
  221 |   await choose(page, 'ArrowLeft', H04)
  222 |   await shot(page, 'h04-menu-960x540.png')
  223 |   await page.keyboard.press('Enter')
  224 |   await expect.poll(async () => (await state(page)).screen).toBe('jump')
  225 |   await shot(page, 'h04-scene-960x540.png')
  226 |   await page.keyboard.press('KeyD')
  227 |   await expect.poll(async () => (await state(page)).jump?.technicalView).toBe(true)
  228 |   await shot(page, 'h04-technical-960x540.png')
  229 |   await page.keyboard.press('KeyD')
  230 |   const parallel = await trainingLanding(page, 'KeyR', 1)
  231 |   expect(parallel.raw).toBeGreaterThanOrEqual(200)
  232 |   await shot(page, 'h04-result-parallel-960x540.png')
  233 |   await page.keyboard.press('Enter')
  234 |   await expect.poll(async () => (await state(page)).jump?.phase).toBe('GateGreen')
  235 |   const telemark = await trainingLanding(page, 'KeyT', parallel.attempt + 1)
  236 |   expect(telemark.raw).toBeGreaterThanOrEqual(200)
  237 |   await shot(page, 'h04-result-telemark-960x540.png')
  238 |   const video = page.video()
  239 |   await page.close()
  240 |   await video?.saveAs(path('h04-real-keyboard-jumps-960x540.webm'))
  241 | })
  242 | 
  243 | test('H04 competition, real result, bots, transactional save/reload, current and old-version replay isolation', async ({ page }) => {
  244 |   test.setTimeout(170_000)
  245 |   await boot(page)
  246 |   await choose(page, 'ArrowLeft', H04)
  247 |   await page.keyboard.press('ArrowDown')
  248 |   await page.keyboard.press('Enter')
  249 |   await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  250 |   await page.keyboard.press('Enter')
  251 |   await expect.poll(async () => (await state(page)).competition?.view).toBe('handover')
  252 |   await page.keyboard.press('Enter')
  253 |   await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('red')
  254 |   const initial = (await state(page)).competition!
  255 |   console.log(`H04 browser jury AUTO ${initial.juryGateNumber}, safe ceiling ${initial.safeGateCeiling}`)
  256 |   expect(initial.juryGateNumber).toBeGreaterThan(1)
  257 |   expect(initial.juryGateNumber).toBeLessThanOrEqual(initial.safeGateCeiling)
  258 |   await page.keyboard.press('BracketLeft')
  259 |   await expect.poll(async () => (await state(page)).competition?.juryGateNumber).toBe(initial.juryGateNumber - 1)
  260 |   // Exercise jury adjustment, then restore the real AUTO gate for a playable jump.
  261 |   await page.keyboard.press('BracketRight')
  262 |   await expect.poll(async () => (await state(page)).competition?.juryGateNumber).toBe(initial.juryGateNumber)
  263 |   await page.keyboard.press('KeyJ')
  264 |   await expect.poll(async () => (await state(page)).competition?.juryHeld).toBe(true)
  265 |   await page.keyboard.press('KeyJ')
  266 |   await expect.poll(async () => (await state(page)).competition?.juryHeld).toBe(false)
  267 |   await page.keyboard.press('Enter')
  268 |   await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('yellow')
  269 |   await page.keyboard.press('Enter')
  270 |   await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('green')
  271 |   expect((await state(page)).competition?.actualGateNumber).toBe(initial.juryGateNumber)
  272 |   await startTakeoff(page, 'competition')
  273 |   await finishRealJump(page, 'competition', 'KeyR')
  274 |   await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')
  275 |   const result = (await state(page)).competition?.lastResult
```