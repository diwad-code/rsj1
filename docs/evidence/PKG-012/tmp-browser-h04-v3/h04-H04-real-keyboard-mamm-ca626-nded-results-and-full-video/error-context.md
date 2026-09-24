# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: h04.spec.ts >> H04 real keyboard mammoth R and T: scene, shared-map technical view, landed results and full video
- Location: tests\browser\h04.spec.ts:203:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 35
Received: 34

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
  62  | }
  63  | 
  64  | async function choose(page: Page, key: 'ArrowLeft' | 'ArrowRight', hillId: string): Promise<void> {
  65  |   await page.keyboard.press(key)
  66  |   await expect.poll(async () => {
  67  |     const snapshot = await state(page)
  68  |     return snapshot.selectedHill.loading ? null : snapshot.selectedHill.id
  69  |   }).toBe(hillId)
  70  | }
  71  | 
  72  | async function shot(page: Page, name: string): Promise<void> {
  73  |   expect((await state(page)).paused).toBe(false)
  74  |   const canvas = page.locator('#game-canvas')
  75  |   const box = await canvas.boundingBox()
  76  |   expect([box?.width, box?.height]).toEqual([960, 540])
  77  |   await page.waitForTimeout(100)
  78  |   await canvas.screenshot({ path: path(name) })
  79  | }
  80  | 
  81  | async function startTakeoff(page: Page, mode: 'training' | 'competition'): Promise<void> {
  82  |   const before = await state(page)
  83  |   const gate = mode === 'training' ? before.jump?.gate : before.competition?.actualGateNumber
  84  |   if (!gate) throw new Error('No H04 gate selected for a real keyboard jump')
  85  |   const edge = edgeTickFor(gate, DEFAULT_JUMP_PARAMS, HILL)
  86  |   const lead = Math.round(DEFAULT_JUMP_PARAMS.takeoff.idealLeadSeconds / SIM_DT)
  87  |   await page.keyboard.press('ArrowRight')
  88  |   const events = async () => mode === 'training' ? (await state(page)).jump?.events : (await state(page)).competition?.jump?.events
  89  |   await expect.poll(async () => (await events())?.some(event => event.endsWith(' gateOpen'))).toBe(true)
  90  |   await page.waitForFunction(([edgeTicks, leadTicks, inCompetition]: [number, number, boolean]) => {
  91  |     const snapshot = (window as unknown as { __retroDebugSnapshot(): Snapshot }).__retroDebugSnapshot()
  92  |     const jump = inCompetition ? snapshot.competition?.jump : snapshot.jump
  93  |     const opened = jump?.events.find(event => event.endsWith(' gateOpen'))
  94  |     return opened && jump && jump.tick >= Number(opened.split(' ')[0]) + edgeTicks - leadTicks - 4
  95  |   }, [edge, lead, mode === 'competition'] as [number, number, boolean], { polling: 'raf', timeout: 35_000 })
  96  |   for (let i = 0; i < 10; i += 1) {
  97  |     await page.keyboard.press('ArrowUp')
  98  |     const jump = mode === 'training' ? (await state(page)).jump : (await state(page)).competition?.jump
  99  |     if (jump?.events.some(event => event.endsWith(' takeoffImpulseStart'))) break
  100 |     if (jump?.phase !== 'Inrun' && jump?.phase !== 'Takeoff') break
  101 |     await page.waitForTimeout(25)
  102 |   }
  103 |   await expect.poll(async () => (await events())?.some(event => event.endsWith(' takeoffImpulseStart'))).toBe(true)
  104 | }
  105 | 
  106 | async function finishRealJump(page: Page, mode: 'training' | 'competition', landing: 'KeyR' | 'KeyT', attempt = 1): Promise<void> {
  107 |   let held: 'ArrowLeft' | 'ArrowRight' | null = null
  108 |   let landingSent = false
  109 |   const deadline = Date.now() + 38_000
  110 |   while (Date.now() < deadline) {
  111 |     const snapshot = await state(page)
  112 |     if (mode === 'training' ? snapshot.jump?.status !== null : snapshot.competition?.view !== 'jump') break
  113 |     const phase = mode === 'training' ? snapshot.jump?.phase : snapshot.competition?.jump?.phase
  114 |     if (phase === 'Flight') {
  115 |       if (mode === 'training' && snapshot.jump && !landingSent) {
  116 |         const desired = snapshot.jump.flowDeg + 28
  117 |         const next = snapshot.jump.targetPitchDeg > desired + 0.5 ? 'ArrowRight'
  118 |           : snapshot.jump.targetPitchDeg < desired - 0.5 ? 'ArrowLeft' : null
  119 |         if (held !== next) {
  120 |           if (held) await page.keyboard.up(held)
  121 |           if (next) await page.keyboard.down(next)
  122 |           held = next
  123 |         }
  124 |       }
  125 |       const takeoffEdge = snapshot.competition?.jump?.events.find(event => event.endsWith(' takeoffEdge'))
  126 |       const ready = mode === 'training' ? (snapshot.jump?.flightSeconds ?? 0) >= 3.2
  127 |         : Boolean(takeoffEdge && (snapshot.competition?.jump?.tick ?? 0) >= Number(takeoffEdge.split(' ')[0]) + 3.2 * 120)
  128 |       if (!landingSent && ready) {
  129 |         if (held) await page.keyboard.up(held)
  130 |         held = null
  131 |         await page.keyboard.press(landing)
  132 |         landingSent = true
  133 |       }
  134 |     }
  135 |     await page.waitForTimeout(20)
  136 |   }
  137 |   if (held) await page.keyboard.up(held)
  138 |   expect(landingSent, `No ${landing} input reached the flight: ${JSON.stringify(mode === 'training' ? (await state(page)).jump : (await state(page)).competition?.jump)}`).toBe(true)
  139 |   if (mode === 'training') {
  140 |     await expect.poll(async () => (await state(page)).jump?.completedAttempts, { timeout: 25_000 }).toBe(attempt)
  141 |     expect((await state(page)).jump?.events.some(event => event.endsWith(' landingPrep'))).toBe(true)
  142 |   } else {
  143 |     await expect.poll(async () => (await state(page)).competition?.lastResult, { timeout: 25_000 }).not.toBeNull()
  144 |   }
  145 | }
  146 | 
  147 | async function trainingLanding(page: Page, landing: 'KeyR' | 'KeyT', first: number): Promise<{ attempt: number; raw: number }> {
  148 |   const attempts: Array<{ gate: number; raw: number | null; status: string | null }> = []
  149 |   for (let attempt = first; attempt < first + 4; attempt += 1) {
  150 |     if (attempt !== first) {
  151 |       await page.keyboard.press('Enter')
  152 |       await expect.poll(async () => (await state(page)).jump?.phase).toBe('GateGreen')
  153 |     }
  154 |     const selected = (await state(page)).jump?.gate
  155 |     if (!selected) throw new Error('Missing H04 training gate')
  156 |     // Reach a representative mammoth landing; real wind and keyboard input remain unchanged.
  157 |     // Zachowaj fizyczne pozycje dawnych belek 25/21 po dodaniu 10 niższych.
  158 |     const desired = landing === 'KeyR' ? 35 : 31
  159 |     for (let gate = selected; gate !== desired; gate += gate < desired ? 1 : -1) {
  160 |       await page.keyboard.press(gate < desired ? 'BracketRight' : 'BracketLeft')
  161 |     }
> 162 |     await expect.poll(async () => (await state(page)).jump?.gate).toBe(desired)
      |                                                                   ^ Error: expect(received).toBe(expected) // Object.is equality
  163 |     await startTakeoff(page, 'training')
  164 |     await finishRealJump(page, 'training', landing, attempt)
  165 |     const jump = (await state(page)).jump!
  166 |     attempts.push({ gate: jump.gate, raw: jump.distance, status: jump.status })
  167 |     if (jump.status === 'landed' && (jump.distance ?? 0) >= 200) {
  168 |       console.log(`H04 training ${landing}: attempt ${attempt}, gate ${jump.gate}, raw ${jump.distance?.toFixed(2)}m, result floored ${Math.floor((jump.distance ?? 0) * 2) / 2}m, wind ${jump.windMeasuredMetersPerSecond?.toFixed(2)}m/s`)
  169 |       return { attempt, raw: jump.distance! }
  170 |     }
  171 |   }
  172 |   throw new Error(`No real landed ${landing} attempt >=200m: ${JSON.stringify(attempts)}`)
  173 | }
  174 | 
  175 | test.use({ viewport: { width: 960, height: 540 }, video: { mode: 'on', size: { width: 960, height: 540 } } })
  176 | 
  177 | test('five hills keyboard selection; H04 map and training menu', async ({ page }) => {
  178 |   await boot(page)
  179 |   expect((await state(page)).selectedHill.id).toBe('tech-k120-hs134')
  180 |   for (const id of [H04, 'h03-oberstdorf-large', 'h02-zakopane-large', 'h01-lillehammer-normal', 'tech-k120-hs134']) {
  181 |     await choose(page, 'ArrowLeft', id)
  182 |   }
  183 |   for (const id of ['h01-lillehammer-normal', 'h02-zakopane-large', 'h03-oberstdorf-large', H04]) {
  184 |     await choose(page, 'ArrowRight', id)
  185 |   }
  186 |   expect((await state(page)).selectedHill.version).toBe(VERSION)
  187 |   await expect(page.locator('#screen-reader-status')).toContainText('PLANICA')
  188 |   const markers = buildSportMarkers(HILL)
  189 |   expect(markers.kPoint).toEqual({ meters: 200, point: HILL.surfacePositionAt(200) })
  190 |   expect(markers.hillSize).toEqual({ meters: 240, point: HILL.surfacePositionAt(240) })
  191 |   expect(markers.meterLines.map(line => line.meters)).toEqual(Array.from({ length: 16 }, (_, index) => 165 + 5 * index))
  192 |   for (const line of markers.meterLines) expect(HILL.surfaceDistanceAtPoint(line.point)).toBeCloseTo(line.meters, 1)
  193 |   await page.keyboard.press('Enter')
  194 |   await expect.poll(async () => (await state(page)).screen).toBe('jump')
  195 |   expect((await state(page)).jump?.gateSource).toBe('auto')
  196 |   await page.keyboard.press('Backspace')
  197 |   await page.keyboard.press('ArrowDown')
  198 |   await page.keyboard.press('Enter')
  199 |   await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  200 |   expect((await state(page)).selectedHill.id).toBe(H04)
  201 | })
  202 | 
  203 | test('H04 real keyboard mammoth R and T: scene, shared-map technical view, landed results and full video', async ({ page }) => {
  204 |   test.setTimeout(230_000)
  205 |   await boot(page)
  206 |   await choose(page, 'ArrowLeft', H04)
  207 |   await shot(page, 'h04-menu-960x540.png')
  208 |   await page.keyboard.press('Enter')
  209 |   await expect.poll(async () => (await state(page)).screen).toBe('jump')
  210 |   await shot(page, 'h04-scene-960x540.png')
  211 |   await page.keyboard.press('KeyD')
  212 |   await expect.poll(async () => (await state(page)).jump?.technicalView).toBe(true)
  213 |   await shot(page, 'h04-technical-960x540.png')
  214 |   await page.keyboard.press('KeyD')
  215 |   const parallel = await trainingLanding(page, 'KeyR', 1)
  216 |   expect(parallel.raw).toBeGreaterThanOrEqual(200)
  217 |   await shot(page, 'h04-result-parallel-960x540.png')
  218 |   await page.keyboard.press('Enter')
  219 |   await expect.poll(async () => (await state(page)).jump?.phase).toBe('GateGreen')
  220 |   const telemark = await trainingLanding(page, 'KeyT', parallel.attempt + 1)
  221 |   expect(telemark.raw).toBeGreaterThanOrEqual(200)
  222 |   await shot(page, 'h04-result-telemark-960x540.png')
  223 |   const video = page.video()
  224 |   await page.close()
  225 |   await video?.saveAs(path('h04-real-keyboard-jumps-960x540.webm'))
  226 | })
  227 | 
  228 | test('H04 competition, real result, bots, transactional save/reload, current and old-version replay isolation', async ({ page }) => {
  229 |   test.setTimeout(170_000)
  230 |   await boot(page)
  231 |   await choose(page, 'ArrowLeft', H04)
  232 |   await page.keyboard.press('ArrowDown')
  233 |   await page.keyboard.press('Enter')
  234 |   await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  235 |   await page.keyboard.press('Enter')
  236 |   await expect.poll(async () => (await state(page)).competition?.view).toBe('handover')
  237 |   await page.keyboard.press('Enter')
  238 |   await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('red')
  239 |   const initial = (await state(page)).competition!
  240 |   expect(initial.juryGateNumber).toBeGreaterThan(1)
  241 |   expect(initial.juryGateNumber).toBeLessThanOrEqual(initial.safeGateCeiling)
  242 |   await page.keyboard.press('BracketLeft')
  243 |   await expect.poll(async () => (await state(page)).competition?.juryGateNumber).toBe(initial.juryGateNumber - 1)
  244 |   await page.keyboard.press('KeyJ')
  245 |   await expect.poll(async () => (await state(page)).competition?.juryHeld).toBe(true)
  246 |   await page.keyboard.press('KeyJ')
  247 |   await expect.poll(async () => (await state(page)).competition?.juryHeld).toBe(false)
  248 |   await page.keyboard.press('Enter')
  249 |   await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('yellow')
  250 |   await page.keyboard.press('Enter')
  251 |   await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('green')
  252 |   expect((await state(page)).competition?.actualGateNumber).toBe(initial.juryGateNumber - 1)
  253 |   await startTakeoff(page, 'competition')
  254 |   await finishRealJump(page, 'competition', 'KeyR')
  255 |   await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')
  256 |   const result = (await state(page)).competition?.lastResult
  257 |   expect(result?.distanceHalfMeters).toBeGreaterThan(0)
  258 |   expect(result?.versions.hill).toBe(VERSION)
  259 |   expect(typeof result?.componentTenths.wind).toBe('number')
  260 |   expect(typeof result?.componentTenths.juryGate).toBe('number')
  261 |   console.log(`H04 competition: ${result?.status}, stored ${(result?.distanceHalfMeters ?? 0) / 2}m, version ${result?.versions.hill}`)
  262 |   await page.keyboard.press('KeyV')
```