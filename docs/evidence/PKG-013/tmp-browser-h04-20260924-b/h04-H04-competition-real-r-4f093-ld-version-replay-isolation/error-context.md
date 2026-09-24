# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: h04.spec.ts >> H04 competition, real result, bots, transactional save/reload, current and old-version replay isolation
- Location: tests\browser\h04.spec.ts:253:1

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 360
Received:    336
```

# Page snapshot

```yaml
- main "Retro Ski Jumping" [ref=e2]:
  - application "Retro Ski Jumping — KWALIFIKACJE. Tabela konkursu." [active] [ref=e3]
  - paragraph [ref=e4]: KWALIFIKACJE. Tabela konkursu.
```

# Test source

```ts
  189 |     await finishRealJump(page, 'training', landing, attempt)
  190 |     const jump = (await state(page)).jump!
  191 |     attempts.push({ gate: jump.gate, raw: jump.distance, status: jump.status })
  192 |     if (jump.status === 'landed' && (jump.distance ?? 0) >= 200) {
  193 |       console.log(`H04 training ${landing}: attempt ${attempt}, gate ${jump.gate}, raw ${jump.distance?.toFixed(2)}m, result floored ${Math.floor((jump.distance ?? 0) * 2) / 2}m, wind ${jump.windMeasuredMetersPerSecond?.toFixed(2)}m/s`)
  194 |       return { attempt, raw: jump.distance! }
  195 |     }
  196 |   }
  197 |   throw new Error(`No real landed ${landing} attempt >=200m: ${JSON.stringify(attempts)}`)
  198 | }
  199 | 
  200 | test.use({ viewport: { width: 960, height: 540 }, video: { mode: 'on', size: { width: 960, height: 540 } } })
  201 | 
  202 | test('five hills keyboard selection; H04 map and training menu', async ({ page }) => {
  203 |   await boot(page)
  204 |   expect((await state(page)).selectedHill.id).toBe('tech-k120-hs134')
  205 |   for (const id of [H04, 'h03-oberstdorf-large', 'h02-zakopane-large', 'h01-lillehammer-normal', 'tech-k120-hs134']) {
  206 |     await choose(page, 'ArrowLeft', id)
  207 |   }
  208 |   for (const id of ['h01-lillehammer-normal', 'h02-zakopane-large', 'h03-oberstdorf-large', H04]) {
  209 |     await choose(page, 'ArrowRight', id)
  210 |   }
  211 |   expect((await state(page)).selectedHill.version).toBe(VERSION)
  212 |   await expect(page.locator('#screen-reader-status')).toContainText('PLANICA')
  213 |   const markers = buildSportMarkers(HILL)
  214 |   expect(markers.kPoint).toEqual({ meters: 200, point: HILL.surfacePositionAt(200) })
  215 |   expect(markers.hillSize).toEqual({ meters: 240, point: HILL.surfacePositionAt(240) })
  216 |   expect(markers.meterLines.map(line => line.meters)).toEqual(Array.from({ length: 16 }, (_, index) => 165 + 5 * index))
  217 |   for (const line of markers.meterLines) expect(HILL.surfaceDistanceAtPoint(line.point)).toBeCloseTo(line.meters, 1)
  218 |   await page.keyboard.press('Enter')
  219 |   await expect.poll(async () => (await state(page)).screen).toBe('jump')
  220 |   expect((await state(page)).jump?.gateSource).toBe('auto')
  221 |   await page.keyboard.press('Backspace')
  222 |   await page.keyboard.press('ArrowDown')
  223 |   await page.keyboard.press('Enter')
  224 |   await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  225 |   expect((await state(page)).selectedHill.id).toBe(H04)
  226 | })
  227 | 
  228 | test('H04 real keyboard mammoth R and T: scene, shared-map technical view, landed results and full video', async ({ page }) => {
  229 |   test.setTimeout(230_000)
  230 |   await boot(page)
  231 |   await choose(page, 'ArrowLeft', H04)
  232 |   await shot(page, 'h04-menu-960x540.png')
  233 |   await page.keyboard.press('Enter')
  234 |   await expect.poll(async () => (await state(page)).screen).toBe('jump')
  235 |   await shot(page, 'h04-scene-960x540.png')
  236 |   await page.keyboard.press('KeyD')
  237 |   await expect.poll(async () => (await state(page)).jump?.technicalView).toBe(true)
  238 |   await shot(page, 'h04-technical-960x540.png')
  239 |   await page.keyboard.press('KeyD')
  240 |   const parallel = await trainingLanding(page, 'KeyR', 1)
  241 |   expect(parallel.raw).toBeGreaterThanOrEqual(200)
  242 |   await shot(page, 'h04-result-parallel-960x540.png')
  243 |   await page.keyboard.press('Enter')
  244 |   await expect.poll(async () => (await state(page)).jump?.phase).toBe('GateGreen')
  245 |   const telemark = await trainingLanding(page, 'KeyT', parallel.attempt + 1)
  246 |   expect(telemark.raw).toBeGreaterThanOrEqual(200)
  247 |   await shot(page, 'h04-result-telemark-960x540.png')
  248 |   const video = page.video()
  249 |   await page.close()
  250 |   await video?.saveAs(path('h04-real-keyboard-jumps-960x540.webm'))
  251 | })
  252 | 
  253 | test('H04 competition, real result, bots, transactional save/reload, current and old-version replay isolation', async ({ page }) => {
  254 |   test.setTimeout(170_000)
  255 |   await boot(page)
  256 |   await choose(page, 'ArrowLeft', H04)
  257 |   await page.keyboard.press('ArrowDown')
  258 |   await page.keyboard.press('Enter')
  259 |   await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  260 |   await page.keyboard.press('Enter')
  261 |   await expect.poll(async () => (await state(page)).competition?.view).toBe('handover')
  262 |   await page.keyboard.press('Enter')
  263 |   await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('red')
  264 |   const initial = (await state(page)).competition!
  265 |   console.log(`H04 browser jury AUTO ${initial.juryGateNumber}, safe ceiling ${initial.safeGateCeiling}`)
  266 |   expect(initial.juryGateNumber).toBeGreaterThan(1)
  267 |   expect(initial.juryGateNumber).toBeLessThanOrEqual(initial.safeGateCeiling)
  268 |   await page.keyboard.press('BracketLeft')
  269 |   await expect.poll(async () => (await state(page)).competition?.juryGateNumber).toBe(initial.juryGateNumber - 1)
  270 |   // Exercise jury adjustment, then restore the real AUTO gate for a playable jump.
  271 |   await page.keyboard.press('BracketRight')
  272 |   await expect.poll(async () => (await state(page)).competition?.juryGateNumber).toBe(initial.juryGateNumber)
  273 |   await page.keyboard.press('KeyJ')
  274 |   await expect.poll(async () => (await state(page)).competition?.juryHeld).toBe(true)
  275 |   await page.keyboard.press('KeyJ')
  276 |   await expect.poll(async () => (await state(page)).competition?.juryHeld).toBe(false)
  277 |   await page.keyboard.press('Enter')
  278 |   await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('yellow')
  279 |   await page.keyboard.press('Enter')
  280 |   await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('green')
  281 |   expect((await state(page)).competition?.actualGateNumber).toBe(initial.juryGateNumber)
  282 |   await startTakeoff(page, 'competition')
  283 |   await finishRealJump(page, 'competition', 'KeyR')
  284 |   await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')
  285 |   const result = (await state(page)).competition?.lastResult
  286 |   const contact = (await state(page)).competition?.jump
  287 |   console.log(`H04 competition AUTO: gate ${initial.juryGateNumber}, wind ${result?.wind.measuredMeanUserMetersPerSecond.toFixed(2)}m/s, ${result?.status}, raw ${contact?.distance?.toFixed(2)}m, stored ${(result?.distanceHalfMeters ?? 0) / 2}m, flight ${contact?.flightSeconds.toFixed(2)}s, events ${contact?.events.join('; ')}`)
  288 |   expect(result?.status).toBe('landed')
> 289 |   expect(result?.distanceHalfMeters ?? 0).toBeGreaterThanOrEqual(360)
      |                                           ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  290 |   expect(result?.distanceHalfMeters).toBeGreaterThan(0)
  291 |   expect(result?.versions.hill).toBe(VERSION)
  292 |   expect(typeof result?.componentTenths.wind).toBe('number')
  293 |   expect(typeof result?.componentTenths.juryGate).toBe('number')
  294 |   console.log(`H04 competition: ${result?.status}, stored ${(result?.distanceHalfMeters ?? 0) / 2}m, version ${result?.versions.hill}`)
  295 |   await page.keyboard.press('KeyV')
  296 |   await expect.poll(async () => (await state(page)).screen).toBe('replay')
  297 |   expect((await state(page)).replay).toMatchObject({ hillId: H04, visualsCompatible: true, resultId: result?.resultId, recordedDistanceHalfMeters: result?.distanceHalfMeters })
  298 |   await page.waitForFunction(() => (window as unknown as { __retroDebugSnapshot(): Snapshot }).__retroDebugSnapshot().replay?.phase === 'Flight', undefined, { polling: 'raf', timeout: 20_000 })
  299 |   await page.keyboard.press('Space')
  300 |   await shot(page, 'h04-replay-flight-960x540.png')
  301 |   await page.keyboard.press('ArrowRight')
  302 |   expect((await state(page)).replay?.recordedDistanceHalfMeters).toBe(result?.distanceHalfMeters)
  303 |   await page.keyboard.press('Backspace')
  304 |   await page.keyboard.press('Enter')
  305 |   await expect.poll(async () => (await state(page)).competition?.botYieldCount, { timeout: 20_000 }).toBeGreaterThan(0)
  306 |   await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')
  307 | 
  308 |   await boot(page)
  309 |   expect((await state(page)).selectedHill.id).toBe('tech-k120-hs134')
  310 |   expect((await state(page)).persistence.resumable).toBe(false)
  311 |   expect((await state(page)).replay).toMatchObject({ hillId: H04, visualsCompatible: true, recordedDistanceHalfMeters: result?.distanceHalfMeters })
  312 |   await choose(page, 'ArrowLeft', H04)
  313 |   await expect.poll(async () => (await state(page)).persistence.resumable).toBe(true)
  314 |   await choose(page, 'ArrowLeft', 'h03-oberstdorf-large')
  315 |   expect((await state(page)).persistence.resumable).toBe(false)
  316 |   await choose(page, 'ArrowRight', H04)
  317 |   await page.keyboard.press('ArrowDown')
  318 |   await page.keyboard.press('Enter')
  319 |   await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  320 |   await page.keyboard.press('Enter')
  321 |   // Bots may have finished qualification and started the next round (index 0).
  322 |   await expect.poll(async () => (await state(page)).persistence.savedRevision ?? 0).toBeGreaterThanOrEqual(2)
  323 |   expect((await state(page)).competition?.view).toBeTruthy()
  324 |   await page.keyboard.press('KeyP') // stop bot progression while altering test-only IndexedDB
  325 |   await expect.poll(async () => (await state(page)).paused).toBe(true)
  326 |   await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')
  327 | 
  328 |   const modifiedVersion = await page.evaluate(async ([sessionId, dbName, dbVersion]) => {
  329 |     const db = await new Promise<IDBDatabase>((ok, bad) => {
  330 |       const req = indexedDB.open(dbName, dbVersion)
  331 |       req.onsuccess = () => ok(req.result)
  332 |       req.onerror = () => bad(req.error)
  333 |     })
  334 |     await new Promise<void>((ok, bad) => {
  335 |       const tx = db.transaction('sessions', 'readwrite')
  336 |       const req = tx.objectStore('sessions').get(sessionId)
  337 |       req.onsuccess = () => {
  338 |         if (!req.result) { bad(new Error('No H04 session checkpoint')); return }
  339 |         tx.objectStore('sessions').put({ ...req.result, versions: { ...req.result.versions, hill: 'h04-inspired-1' } })
  340 |       }
  341 |       tx.oncomplete = () => ok()
  342 |       tx.onabort = () => bad(tx.error)
  343 |     })
  344 |     const version = await new Promise<string>((ok, bad) => {
  345 |       const req = db.transaction('sessions', 'readonly').objectStore('sessions').get(sessionId)
  346 |       req.onsuccess = () => ok(req.result?.versions?.hill)
  347 |       req.onerror = () => bad(req.error)
  348 |     })
  349 |     db.close()
  350 |     return version
  351 |   }, [SESSION, DB_NAME, DB_VERSION] as const)
  352 |   expect(modifiedVersion).toBe('h04-inspired-1')
  353 |   await boot(page)
  354 |   await choose(page, 'ArrowLeft', H04)
  355 |   expect((await state(page)).persistence.resumable).toBe(false)
  356 |   expect((await state(page)).persistence.rejectedReason).toContain('STARY ZAPIS PLANICY')
  357 | 
  358 |   await page.evaluate(async ([resultId, dbName, dbVersion]) => {
  359 |     const db = await new Promise<IDBDatabase>((ok, bad) => {
  360 |       const req = indexedDB.open(dbName, dbVersion)
  361 |       req.onsuccess = () => ok(req.result)
  362 |       req.onerror = () => bad(req.error)
  363 |     })
  364 |     await new Promise<void>((ok, bad) => {
  365 |       const tx = db.transaction('replays', 'readwrite')
  366 |       const req = tx.objectStore('replays').get(resultId)
  367 |       req.onsuccess = () => {
  368 |         if (!req.result) { bad(new Error('No real H04 replay')); return }
  369 |         tx.objectStore('replays').put({ ...req.result, versions: { ...req.result.versions, hill: 'h04-inspired-1' } })
  370 |       }
  371 |       tx.oncomplete = () => ok()
  372 |       tx.onabort = () => bad(tx.error)
  373 |     })
  374 |     db.close()
  375 |   }, [result!.resultId, DB_NAME, DB_VERSION] as const)
  376 |   await boot(page)
  377 |   expect((await state(page)).replay).toMatchObject({ hillId: H04, visualsCompatible: false, recordedDistanceHalfMeters: result?.distanceHalfMeters })
  378 |   expect((await state(page)).replay?.notice).toContain('STAREGO PROFILU')
  379 |   await page.keyboard.press('ArrowDown')
  380 |   await page.keyboard.press('ArrowDown')
  381 |   await page.keyboard.press('Enter')
  382 |   expect((await state(page)).screen).toBe('menu') // old replay cannot be presented as current
  383 | })
  384 | 
```