# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: h04.spec.ts >> H04 real keyboard mammoth R and T: scene, shared-map technical view, landed results and full video
- Location: tests\browser\h04.spec.ts:202:1

# Error details

```
Error: No KeyR input reached the flight: {"phase":"FallSettled","tick":1933,"gate":25,"gateSource":"manual","gateAutoNumber":14,"gateForecastMean":1.9601982338888446,"speedKmh":59.436625934361615,"targetPitchDeg":-16.333333333333318,"flowDeg":-37,"flightSeconds":4.208333333333332,"heightAboveSurface":0,"distance":101.46206333849643,"status":"fall","terminalPhase":"FallSettled","perfectTakeoff":false,"takeoffTimingOffsetSeconds":-0.033333333333333354,"windUserMetersPerSecond":1.9166147645562885,"windMeasuredMetersPerSecond":2.066215812595876,"windSeed":4232232379,"resultTotalTenths":0,"resultComponentsTenths":{"distance":12,"style":225,"wind":-298,"juryGate":-619,"coachGate":0},"leadingTargetHalfMeters":440,"attemptNumber":3,"completedAttempts":3,"technicalView":false,"snowEnabled":true,"events":["61 gateOpen","1046 takeoffImpulseStart","1066 takeoffEdge","1572 measured","1572 contact","1572 fall","1932 fallSettled"],"visualPose":"fall","visualFrame":2}

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- main "Retro Ski Jumping" [ref=e2]:
  - application "Retro Ski Jumping — trening, faza FallSettled" [active] [ref=e3]
  - paragraph [ref=e4]: "Trening: PLANICA MAMUT INSP. • K200/HS240. Wynik: upadek, 101.0 metra, 0.0 punktu. Enter rozpoczyna następną próbę, Backspace wraca do menu."
```

# Test source

```ts
  38  | const state = (page: Page): Promise<Snapshot> => page.evaluate(() => (window as unknown as { __retroDebugSnapshot(): Snapshot }).__retroDebugSnapshot())
  39  | const path = (name: string): string => test.info().outputPath(name)
  40  | 
  41  | async function boot(page: Page): Promise<void> {
  42  |   // Resume only the game's documented CI frame-gap pause, without changing simulation state.
  43  |   await page.addInitScript(() => {
  44  |     const w = window as unknown as { __h04ResumeInstalled?: boolean; __retroDebugSnapshot?: () => { paused: boolean; pauseReason: string } }
  45  |     if (w.__h04ResumeInstalled) return
  46  |     w.__h04ResumeInstalled = true
  47  |     const raf = window.requestAnimationFrame.bind(window)
  48  |     window.requestAnimationFrame = callback => raf(now => {
  49  |       const snapshot = w.__retroDebugSnapshot?.()
  50  |       if (snapshot?.paused && snapshot.pauseReason === 'zbyt długa przerwa klatki') {
  51  |         const canvas = document.querySelector('canvas')
  52  |         canvas?.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', bubbles: true }))
  53  |         canvas?.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter', bubbles: true }))
  54  |       }
  55  |       callback(now)
  56  |     })
  57  |   })
  58  |   await page.goto('/?debug')
  59  |   await expect.poll(async () => (await state(page)).persistence.ready).toBe(true)
  60  |   await page.keyboard.press('Enter')
  61  |   await expect.poll(async () => (await state(page)).screen).toBe('menu')
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
  116 |         const desired = snapshot.jump.flowDeg + 32
  117 |         const next = snapshot.jump.targetPitchDeg > desired + 0.5 ? 'ArrowRight'
  118 |           : snapshot.jump.targetPitchDeg < desired - 0.5 ? 'ArrowLeft' : null
  119 |         if (held !== next) {
  120 |           if (held) await page.keyboard.up(held)
  121 |           if (next) await page.keyboard.down(next)
  122 |           held = next
  123 |         }
  124 |       }
  125 |       const takeoffEdge = snapshot.competition?.jump?.events.find(event => event.endsWith(' takeoffEdge'))
  126 |       const ready = mode === 'training' ? (snapshot.jump?.flightSeconds ?? 0) >= 5
  127 |         : Boolean(takeoffEdge && (snapshot.competition?.jump?.tick ?? 0) >= Number(takeoffEdge.split(' ')[0]) + 5 * 120)
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
> 138 |   expect(landingSent, `No ${landing} input reached the flight: ${JSON.stringify(mode === 'training' ? (await state(page)).jump : (await state(page)).competition?.jump)}`).toBe(true)
      |                                                                                                                                                                            ^ Error: No KeyR input reached the flight: {"phase":"FallSettled","tick":1933,"gate":25,"gateSource":"manual","gateAutoNumber":14,"gateForecastMean":1.9601982338888446,"speedKmh":59.436625934361615,"targetPitchDeg":-16.333333333333318,"flowDeg":-37,"flightSeconds":4.208333333333332,"heightAboveSurface":0,"distance":101.46206333849643,"status":"fall","terminalPhase":"FallSettled","perfectTakeoff":false,"takeoffTimingOffsetSeconds":-0.033333333333333354,"windUserMetersPerSecond":1.9166147645562885,"windMeasuredMetersPerSecond":2.066215812595876,"windSeed":4232232379,"resultTotalTenths":0,"resultComponentsTenths":{"distance":12,"style":225,"wind":-298,"juryGate":-619,"coachGate":0},"leadingTargetHalfMeters":440,"attemptNumber":3,"completedAttempts":3,"technicalView":false,"snowEnabled":true,"events":["61 gateOpen","1046 takeoffImpulseStart","1066 takeoffEdge","1572 measured","1572 contact","1572 fall","1932 fallSettled"],"visualPose":"fall","visualFrame":2}
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
  157 |     const desired = landing === 'KeyR' ? 25 : 21
  158 |     for (let gate = selected; gate !== desired; gate += gate < desired ? 1 : -1) {
  159 |       await page.keyboard.press(gate < desired ? 'BracketRight' : 'BracketLeft')
  160 |     }
  161 |     await expect.poll(async () => (await state(page)).jump?.gate).toBe(desired)
  162 |     await startTakeoff(page, 'training')
  163 |     await finishRealJump(page, 'training', landing, attempt)
  164 |     const jump = (await state(page)).jump!
  165 |     attempts.push({ gate: jump.gate, raw: jump.distance, status: jump.status })
  166 |     if (jump.status === 'landed' && (jump.distance ?? 0) >= 200) {
  167 |       console.log(`H04 training ${landing}: attempt ${attempt}, gate ${jump.gate}, raw ${jump.distance?.toFixed(2)}m, result floored ${Math.floor((jump.distance ?? 0) * 2) / 2}m, wind ${jump.windMeasuredMetersPerSecond?.toFixed(2)}m/s`)
  168 |       return { attempt, raw: jump.distance! }
  169 |     }
  170 |   }
  171 |   throw new Error(`No real landed ${landing} attempt >=200m: ${JSON.stringify(attempts)}`)
  172 | }
  173 | 
  174 | test.use({ viewport: { width: 960, height: 540 }, video: { mode: 'on', size: { width: 960, height: 540 } } })
  175 | 
  176 | test('five hills keyboard selection; H04 map and training menu', async ({ page }) => {
  177 |   await boot(page)
  178 |   expect((await state(page)).selectedHill.id).toBe('tech-k120-hs134')
  179 |   for (const id of [H04, 'h03-oberstdorf-large', 'h02-zakopane-large', 'h01-lillehammer-normal', 'tech-k120-hs134']) {
  180 |     await choose(page, 'ArrowLeft', id)
  181 |   }
  182 |   for (const id of ['h01-lillehammer-normal', 'h02-zakopane-large', 'h03-oberstdorf-large', H04]) {
  183 |     await choose(page, 'ArrowRight', id)
  184 |   }
  185 |   expect((await state(page)).selectedHill.version).toBe(VERSION)
  186 |   await expect(page.locator('#screen-reader-status')).toContainText('PLANICA')
  187 |   const markers = buildSportMarkers(HILL)
  188 |   expect(markers.kPoint).toEqual({ meters: 200, point: HILL.surfacePositionAt(200) })
  189 |   expect(markers.hillSize).toEqual({ meters: 240, point: HILL.surfacePositionAt(240) })
  190 |   expect(markers.meterLines.map(line => line.meters)).toEqual(Array.from({ length: 16 }, (_, index) => 165 + 5 * index))
  191 |   for (const line of markers.meterLines) expect(HILL.surfaceDistanceAtPoint(line.point)).toBeCloseTo(line.meters, 1)
  192 |   await page.keyboard.press('Enter')
  193 |   await expect.poll(async () => (await state(page)).screen).toBe('jump')
  194 |   expect((await state(page)).jump?.gateSource).toBe('auto')
  195 |   await page.keyboard.press('Backspace')
  196 |   await page.keyboard.press('ArrowDown')
  197 |   await page.keyboard.press('Enter')
  198 |   await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  199 |   expect((await state(page)).selectedHill.id).toBe(H04)
  200 | })
  201 | 
  202 | test('H04 real keyboard mammoth R and T: scene, shared-map technical view, landed results and full video', async ({ page }) => {
  203 |   test.setTimeout(230_000)
  204 |   await boot(page)
  205 |   await choose(page, 'ArrowLeft', H04)
  206 |   await shot(page, 'h04-menu-960x540.png')
  207 |   await page.keyboard.press('Enter')
  208 |   await expect.poll(async () => (await state(page)).screen).toBe('jump')
  209 |   await shot(page, 'h04-scene-960x540.png')
  210 |   await page.keyboard.press('KeyD')
  211 |   await expect.poll(async () => (await state(page)).jump?.technicalView).toBe(true)
  212 |   await shot(page, 'h04-technical-960x540.png')
  213 |   await page.keyboard.press('KeyD')
  214 |   const parallel = await trainingLanding(page, 'KeyR', 1)
  215 |   expect(parallel.raw).toBeGreaterThanOrEqual(200)
  216 |   await shot(page, 'h04-result-parallel-960x540.png')
  217 |   await page.keyboard.press('Enter')
  218 |   await expect.poll(async () => (await state(page)).jump?.phase).toBe('GateGreen')
  219 |   const telemark = await trainingLanding(page, 'KeyT', parallel.attempt + 1)
  220 |   expect(telemark.raw).toBeGreaterThanOrEqual(200)
  221 |   await shot(page, 'h04-result-telemark-960x540.png')
  222 |   const video = page.video()
  223 |   await page.close()
  224 |   await video?.saveAs(path('h04-real-keyboard-jumps-960x540.webm'))
  225 | })
  226 | 
  227 | test('H04 competition, real result, bots, transactional save/reload, current and old-version replay isolation', async ({ page }) => {
  228 |   test.setTimeout(170_000)
  229 |   await boot(page)
  230 |   await choose(page, 'ArrowLeft', H04)
  231 |   await page.keyboard.press('ArrowDown')
  232 |   await page.keyboard.press('Enter')
  233 |   await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  234 |   await page.keyboard.press('Enter')
  235 |   await expect.poll(async () => (await state(page)).competition?.view).toBe('handover')
  236 |   await page.keyboard.press('Enter')
  237 |   await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('red')
  238 |   const initial = (await state(page)).competition!
```