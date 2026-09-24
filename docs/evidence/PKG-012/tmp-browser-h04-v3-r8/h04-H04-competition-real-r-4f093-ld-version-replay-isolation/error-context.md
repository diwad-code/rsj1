# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: h04.spec.ts >> H04 competition, real result, bots, transactional save/reload, current and old-version replay isolation
- Location: tests\browser\h04.spec.ts:243:1

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 360
Received:    238
```

# Page snapshot

```yaml
- main "Retro Ski Jumping" [ref=e2]:
  - application "Retro Ski Jumping — KWALIFIKACJE. Tabela konkursu." [active] [ref=e3]
  - paragraph [ref=e4]: KWALIFIKACJE. Tabela konkursu.
```

# Test source

```ts
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
  276 |   const contact = (await state(page)).competition?.jump
  277 |   console.log(`H04 competition AUTO: gate ${initial.juryGateNumber}, wind ${result?.wind.measuredMeanUserMetersPerSecond.toFixed(2)}m/s, ${result?.status}, raw ${contact?.distance?.toFixed(2)}m, stored ${(result?.distanceHalfMeters ?? 0) / 2}m, flight ${contact?.flightSeconds.toFixed(2)}s, events ${contact?.events.join('; ')}`)
  278 |   expect(result?.status).toBe('landed')
> 279 |   expect(result?.distanceHalfMeters ?? 0).toBeGreaterThanOrEqual(360)
      |                                           ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  280 |   expect(result?.distanceHalfMeters).toBeGreaterThan(0)
  281 |   expect(result?.versions.hill).toBe(VERSION)
  282 |   expect(typeof result?.componentTenths.wind).toBe('number')
  283 |   expect(typeof result?.componentTenths.juryGate).toBe('number')
  284 |   console.log(`H04 competition: ${result?.status}, stored ${(result?.distanceHalfMeters ?? 0) / 2}m, version ${result?.versions.hill}`)
  285 |   await page.keyboard.press('KeyV')
  286 |   await expect.poll(async () => (await state(page)).screen).toBe('replay')
  287 |   expect((await state(page)).replay).toMatchObject({ hillId: H04, visualsCompatible: true, resultId: result?.resultId, recordedDistanceHalfMeters: result?.distanceHalfMeters })
  288 |   await page.waitForFunction(() => (window as unknown as { __retroDebugSnapshot(): Snapshot }).__retroDebugSnapshot().replay?.phase === 'Flight', undefined, { polling: 'raf', timeout: 20_000 })
  289 |   await page.keyboard.press('Space')
  290 |   await shot(page, 'h04-replay-flight-960x540.png')
  291 |   await page.keyboard.press('ArrowRight')
  292 |   expect((await state(page)).replay?.recordedDistanceHalfMeters).toBe(result?.distanceHalfMeters)
  293 |   await page.keyboard.press('Backspace')
  294 |   await page.keyboard.press('Enter')
  295 |   await expect.poll(async () => (await state(page)).competition?.botYieldCount, { timeout: 20_000 }).toBeGreaterThan(0)
  296 |   await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')
  297 | 
  298 |   await boot(page)
  299 |   expect((await state(page)).selectedHill.id).toBe('tech-k120-hs134')
  300 |   expect((await state(page)).persistence.resumable).toBe(false)
  301 |   expect((await state(page)).replay).toMatchObject({ hillId: H04, visualsCompatible: true, recordedDistanceHalfMeters: result?.distanceHalfMeters })
  302 |   await choose(page, 'ArrowLeft', H04)
  303 |   await expect.poll(async () => (await state(page)).persistence.resumable).toBe(true)
  304 |   await choose(page, 'ArrowLeft', 'h03-oberstdorf-large')
  305 |   expect((await state(page)).persistence.resumable).toBe(false)
  306 |   await choose(page, 'ArrowRight', H04)
  307 |   await page.keyboard.press('ArrowDown')
  308 |   await page.keyboard.press('Enter')
  309 |   await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  310 |   await page.keyboard.press('Enter')
  311 |   // Bots may have finished qualification and started the next round (index 0).
  312 |   await expect.poll(async () => (await state(page)).persistence.savedRevision ?? 0).toBeGreaterThanOrEqual(2)
  313 |   expect((await state(page)).competition?.view).toBeTruthy()
  314 |   await page.keyboard.press('KeyP') // stop bot progression while altering test-only IndexedDB
  315 |   await expect.poll(async () => (await state(page)).paused).toBe(true)
  316 |   await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')
  317 | 
  318 |   const modifiedVersion = await page.evaluate(async (sessionId) => {
  319 |     const db = await new Promise<IDBDatabase>((ok, bad) => {
  320 |       const req = indexedDB.open('retro-ski-jumping', 1)
  321 |       req.onsuccess = () => ok(req.result)
  322 |       req.onerror = () => bad(req.error)
  323 |     })
  324 |     await new Promise<void>((ok, bad) => {
  325 |       const tx = db.transaction('sessions', 'readwrite')
  326 |       const req = tx.objectStore('sessions').get(sessionId)
  327 |       req.onsuccess = () => {
  328 |         if (!req.result) { bad(new Error('No H04 session checkpoint')); return }
  329 |         tx.objectStore('sessions').put({ ...req.result, versions: { ...req.result.versions, hill: 'h04-inspired-1' } })
  330 |       }
  331 |       tx.oncomplete = () => ok()
  332 |       tx.onabort = () => bad(tx.error)
  333 |     })
  334 |     const version = await new Promise<string>((ok, bad) => {
  335 |       const req = db.transaction('sessions', 'readonly').objectStore('sessions').get(sessionId)
  336 |       req.onsuccess = () => ok(req.result?.versions?.hill)
  337 |       req.onerror = () => bad(req.error)
  338 |     })
  339 |     db.close()
  340 |     return version
  341 |   }, SESSION)
  342 |   expect(modifiedVersion).toBe('h04-inspired-1')
  343 |   await boot(page)
  344 |   await choose(page, 'ArrowLeft', H04)
  345 |   expect((await state(page)).persistence.resumable).toBe(false)
  346 |   expect((await state(page)).persistence.rejectedReason).toContain('STARY ZAPIS PLANICY')
  347 | 
  348 |   await page.evaluate(async (resultId) => {
  349 |     const db = await new Promise<IDBDatabase>((ok, bad) => {
  350 |       const req = indexedDB.open('retro-ski-jumping', 1)
  351 |       req.onsuccess = () => ok(req.result)
  352 |       req.onerror = () => bad(req.error)
  353 |     })
  354 |     await new Promise<void>((ok, bad) => {
  355 |       const tx = db.transaction('replays', 'readwrite')
  356 |       const req = tx.objectStore('replays').get(resultId)
  357 |       req.onsuccess = () => {
  358 |         if (!req.result) { bad(new Error('No real H04 replay')); return }
  359 |         tx.objectStore('replays').put({ ...req.result, versions: { ...req.result.versions, hill: 'h04-inspired-1' } })
  360 |       }
  361 |       tx.oncomplete = () => ok()
  362 |       tx.onabort = () => bad(tx.error)
  363 |     })
  364 |     db.close()
  365 |   }, result!.resultId)
  366 |   await boot(page)
  367 |   expect((await state(page)).replay).toMatchObject({ hillId: H04, visualsCompatible: false, recordedDistanceHalfMeters: result?.distanceHalfMeters })
  368 |   expect((await state(page)).replay?.notice).toContain('STAREGO PROFILU')
  369 |   await page.keyboard.press('ArrowDown')
  370 |   await page.keyboard.press('ArrowDown')
  371 |   await page.keyboard.press('Enter')
  372 |   expect((await state(page)).screen).toBe('menu') // old replay cannot be presented as current
  373 | })
  374 | 
```