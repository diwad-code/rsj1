# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: h04.spec.ts >> H04 competition, real result, bots, transactional save/reload, current and old-version replay isolation
- Location: tests\browser\h04.spec.ts:242:1

# Error details

```
Error: No KeyR input reached the flight: {"phase":"FallSettled","tick":1604,"distance":73.82656495680531,"status":"fall","heightAboveSurface":0,"targetPitchDeg":5.591666666666703,"flowDeg":-37,"flightSeconds":2.8833333333333258,"events":["0 gateOpen","873 takeoffImpulseStart","896 perfectTakeoff","896 takeoffEdge","1243 measured","1243 contact","1243 fall","1603 fallSettled"]}

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
  49  |     const raf = window.requestAnimationFrame.bind(window)
  50  |     window.requestAnimationFrame = callback => raf(now => {
  51  |       const snapshot = w.__retroDebugSnapshot?.()
  52  |       if (snapshot?.paused && snapshot.pauseReason === 'zbyt długa przerwa klatki') {
  53  |         const canvas = document.querySelector('canvas')
  54  |         canvas?.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', bubbles: true }))
  55  |         canvas?.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter', bubbles: true }))
  56  |       }
  57  |       callback(now)
  58  |     })
  59  |   })
  60  |   await page.goto('/?debug')
  61  |   await expect.poll(async () => (await state(page)).persistence.ready).toBe(true)
  62  |   await page.keyboard.press('Enter')
  63  |   await expect.poll(async () => (await state(page)).screen).toBe('menu')
  64  | }
  65  | 
  66  | async function choose(page: Page, key: 'ArrowLeft' | 'ArrowRight', hillId: string): Promise<void> {
  67  |   await page.keyboard.press(key)
  68  |   await expect.poll(async () => {
  69  |     const snapshot = await state(page)
  70  |     return snapshot.selectedHill.loading ? null : snapshot.selectedHill.id
  71  |   }).toBe(hillId)
  72  | }
  73  | 
  74  | async function shot(page: Page, name: string): Promise<void> {
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
  105 |     return opened && jump && jump.tick >= Number(opened.split(' ')[0]) + edgeTicks - leadTicks - (inCompetition ? 10 : 4)
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
  128 |         const desired = flight.flowDeg + (mode === 'training' ? 28 : 30)
  129 |         const next = flight.targetPitchDeg > desired + 0.5 ? 'ArrowRight'
  130 |           : flight.targetPitchDeg < desired - 0.5 ? 'ArrowLeft' : null
  131 |         if (held !== next) {
  132 |           if (held) await page.keyboard.up(held)
  133 |           if (next) await page.keyboard.down(next)
  134 |           held = next
  135 |         }
  136 |       }
  137 |       const ready = mode === 'training' ? (snapshot.jump?.flightSeconds ?? 0) >= 3.2
  138 |         : Boolean(flight && flight.flightSeconds >= 5.7)
  139 |       if (!landingSent && ready) {
  140 |         if (held) await page.keyboard.up(held)
  141 |         held = null
  142 |         await page.keyboard.press(landing)
  143 |         landingSent = true
  144 |       }
  145 |     }
  146 |     await page.waitForTimeout(20)
  147 |   }
  148 |   if (held) await page.keyboard.up(held)
> 149 |   expect(landingSent, `No ${landing} input reached the flight: ${JSON.stringify(mode === 'training' ? (await state(page)).jump : (await state(page)).competition?.jump)}`).toBe(true)
      |                                                                                                                                                                            ^ Error: No KeyR input reached the flight: {"phase":"FallSettled","tick":1604,"distance":73.82656495680531,"status":"fall","heightAboveSurface":0,"targetPitchDeg":5.591666666666703,"flowDeg":-37,"flightSeconds":2.8833333333333258,"events":["0 gateOpen","873 takeoffImpulseStart","896 perfectTakeoff","896 takeoffEdge","1243 measured","1243 contact","1243 fall","1603 fallSettled"]}
  150 |   if (mode === 'training') {
  151 |     await expect.poll(async () => (await state(page)).jump?.completedAttempts, { timeout: 25_000 }).toBe(attempt)
  152 |     expect((await state(page)).jump?.events.some(event => event.endsWith(' landingPrep'))).toBe(true)
  153 |   } else {
  154 |     await expect.poll(async () => (await state(page)).competition?.lastResult, { timeout: 25_000 }).not.toBeNull()
  155 |   }
  156 | }
  157 | 
  158 | async function trainingLanding(page: Page, landing: 'KeyR' | 'KeyT', first: number): Promise<{ attempt: number; raw: number }> {
  159 |   const attempts: Array<{ gate: number; raw: number | null; status: string | null }> = []
  160 |   for (let attempt = first; attempt < first + 4; attempt += 1) {
  161 |     if (attempt !== first) {
  162 |       await page.keyboard.press('Enter')
  163 |       await expect.poll(async () => (await state(page)).jump?.phase).toBe('GateGreen')
  164 |     }
  165 |     const selected = (await state(page)).jump?.gate
  166 |     if (!selected) throw new Error('Missing H04 training gate')
  167 |     // Reach a representative mammoth landing; real wind and keyboard input remain unchanged.
  168 |     // Zachowaj fizyczne pozycje dawnych belek 25/21 po dodaniu 10 niższych.
  169 |     const desired = landing === 'KeyR' ? 35 : 31
  170 |     for (let step = 0; step < HILL.gates.length && (await state(page)).jump?.gate !== desired; step += 1) {
  171 |       const current = (await state(page)).jump?.gate
  172 |       if (!current) throw new Error('Missing H04 training gate during adjustment')
  173 |       await page.keyboard.press(current < desired ? 'BracketRight' : 'BracketLeft')
  174 |       await expect.poll(async () => (await state(page)).jump?.gate).toBe(current + (current < desired ? 1 : -1))
  175 |     }
  176 |     await expect.poll(async () => (await state(page)).jump?.gate).toBe(desired)
  177 |     await startTakeoff(page, 'training')
  178 |     await finishRealJump(page, 'training', landing, attempt)
  179 |     const jump = (await state(page)).jump!
  180 |     attempts.push({ gate: jump.gate, raw: jump.distance, status: jump.status })
  181 |     if (jump.status === 'landed' && (jump.distance ?? 0) >= 200) {
  182 |       console.log(`H04 training ${landing}: attempt ${attempt}, gate ${jump.gate}, raw ${jump.distance?.toFixed(2)}m, result floored ${Math.floor((jump.distance ?? 0) * 2) / 2}m, wind ${jump.windMeasuredMetersPerSecond?.toFixed(2)}m/s`)
  183 |       return { attempt, raw: jump.distance! }
  184 |     }
  185 |   }
  186 |   throw new Error(`No real landed ${landing} attempt >=200m: ${JSON.stringify(attempts)}`)
  187 | }
  188 | 
  189 | test.use({ viewport: { width: 960, height: 540 }, video: { mode: 'on', size: { width: 960, height: 540 } } })
  190 | 
  191 | test('five hills keyboard selection; H04 map and training menu', async ({ page }) => {
  192 |   await boot(page)
  193 |   expect((await state(page)).selectedHill.id).toBe('tech-k120-hs134')
  194 |   for (const id of [H04, 'h03-oberstdorf-large', 'h02-zakopane-large', 'h01-lillehammer-normal', 'tech-k120-hs134']) {
  195 |     await choose(page, 'ArrowLeft', id)
  196 |   }
  197 |   for (const id of ['h01-lillehammer-normal', 'h02-zakopane-large', 'h03-oberstdorf-large', H04]) {
  198 |     await choose(page, 'ArrowRight', id)
  199 |   }
  200 |   expect((await state(page)).selectedHill.version).toBe(VERSION)
  201 |   await expect(page.locator('#screen-reader-status')).toContainText('PLANICA')
  202 |   const markers = buildSportMarkers(HILL)
  203 |   expect(markers.kPoint).toEqual({ meters: 200, point: HILL.surfacePositionAt(200) })
  204 |   expect(markers.hillSize).toEqual({ meters: 240, point: HILL.surfacePositionAt(240) })
  205 |   expect(markers.meterLines.map(line => line.meters)).toEqual(Array.from({ length: 16 }, (_, index) => 165 + 5 * index))
  206 |   for (const line of markers.meterLines) expect(HILL.surfaceDistanceAtPoint(line.point)).toBeCloseTo(line.meters, 1)
  207 |   await page.keyboard.press('Enter')
  208 |   await expect.poll(async () => (await state(page)).screen).toBe('jump')
  209 |   expect((await state(page)).jump?.gateSource).toBe('auto')
  210 |   await page.keyboard.press('Backspace')
  211 |   await page.keyboard.press('ArrowDown')
  212 |   await page.keyboard.press('Enter')
  213 |   await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  214 |   expect((await state(page)).selectedHill.id).toBe(H04)
  215 | })
  216 | 
  217 | test('H04 real keyboard mammoth R and T: scene, shared-map technical view, landed results and full video', async ({ page }) => {
  218 |   test.setTimeout(230_000)
  219 |   await boot(page)
  220 |   await choose(page, 'ArrowLeft', H04)
  221 |   await shot(page, 'h04-menu-960x540.png')
  222 |   await page.keyboard.press('Enter')
  223 |   await expect.poll(async () => (await state(page)).screen).toBe('jump')
  224 |   await shot(page, 'h04-scene-960x540.png')
  225 |   await page.keyboard.press('KeyD')
  226 |   await expect.poll(async () => (await state(page)).jump?.technicalView).toBe(true)
  227 |   await shot(page, 'h04-technical-960x540.png')
  228 |   await page.keyboard.press('KeyD')
  229 |   const parallel = await trainingLanding(page, 'KeyR', 1)
  230 |   expect(parallel.raw).toBeGreaterThanOrEqual(200)
  231 |   await shot(page, 'h04-result-parallel-960x540.png')
  232 |   await page.keyboard.press('Enter')
  233 |   await expect.poll(async () => (await state(page)).jump?.phase).toBe('GateGreen')
  234 |   const telemark = await trainingLanding(page, 'KeyT', parallel.attempt + 1)
  235 |   expect(telemark.raw).toBeGreaterThanOrEqual(200)
  236 |   await shot(page, 'h04-result-telemark-960x540.png')
  237 |   const video = page.video()
  238 |   await page.close()
  239 |   await video?.saveAs(path('h04-real-keyboard-jumps-960x540.webm'))
  240 | })
  241 | 
  242 | test('H04 competition, real result, bots, transactional save/reload, current and old-version replay isolation', async ({ page }) => {
  243 |   test.setTimeout(170_000)
  244 |   await boot(page)
  245 |   await choose(page, 'ArrowLeft', H04)
  246 |   await page.keyboard.press('ArrowDown')
  247 |   await page.keyboard.press('Enter')
  248 |   await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  249 |   await page.keyboard.press('Enter')
```