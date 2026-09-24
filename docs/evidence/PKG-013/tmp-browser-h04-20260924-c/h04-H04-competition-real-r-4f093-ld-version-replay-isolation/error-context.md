# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: h04.spec.ts >> H04 competition, real result, bots, transactional save/reload, current and old-version replay isolation
- Location: tests\browser\h04.spec.ts:281:1

# Error details

```
Error: expect(received).toBeTruthy()

Received: undefined
```

# Page snapshot

```yaml
- main "Retro Ski Jumping" [ref=f1e2]:
  - application "Retro Ski Jumping — PIERWSZA SERIA. Tabela konkursu." [active] [ref=f1e3]
  - paragraph [ref=f1e4]: PIERWSZA SERIA. Tabela konkursu.
```

# Test source

```ts
  260 |   await shot(page, 'h04-menu-960x540.png')
  261 |   await page.keyboard.press('Enter')
  262 |   await expect.poll(async () => (await state(page)).screen).toBe('jump')
  263 |   await shot(page, 'h04-scene-960x540.png')
  264 |   await page.keyboard.press('KeyD')
  265 |   await expect.poll(async () => (await state(page)).jump?.technicalView).toBe(true)
  266 |   await shot(page, 'h04-technical-960x540.png')
  267 |   await page.keyboard.press('KeyD')
  268 |   const parallel = await trainingLanding(page, 'KeyR', 1)
  269 |   expect(parallel.raw).toBeGreaterThanOrEqual(200)
  270 |   await shot(page, 'h04-result-parallel-960x540.png')
  271 |   await page.keyboard.press('Enter')
  272 |   await expect.poll(async () => (await state(page)).jump?.phase).toBe('GateGreen')
  273 |   const telemark = await trainingLanding(page, 'KeyT', parallel.attempt + 1)
  274 |   expect(telemark.raw).toBeGreaterThanOrEqual(200)
  275 |   await shot(page, 'h04-result-telemark-960x540.png')
  276 |   const video = page.video()
  277 |   await page.close()
  278 |   await video?.saveAs(path('h04-real-keyboard-jumps-960x540.webm'))
  279 | })
  280 | 
  281 | test('H04 competition, real result, bots, transactional save/reload, current and old-version replay isolation', async ({ page }) => {
  282 |   test.setTimeout(170_000)
  283 |   await page.clock.install() // before navigation; clock flows normally through the real-keyboard takeoff
  284 |   await boot(page)
  285 |   await choose(page, 'ArrowLeft', H04)
  286 |   await page.keyboard.press('ArrowDown')
  287 |   await page.keyboard.press('Enter')
  288 |   await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  289 |   await page.keyboard.press('Enter')
  290 |   await expect.poll(async () => (await state(page)).competition?.view).toBe('handover')
  291 |   await page.keyboard.press('Enter')
  292 |   await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('red')
  293 |   const initial = (await state(page)).competition!
  294 |   console.log(`H04 browser jury AUTO ${initial.juryGateNumber}, safe ceiling ${initial.safeGateCeiling}`)
  295 |   expect(initial.juryGateNumber).toBeGreaterThan(1)
  296 |   expect(initial.juryGateNumber).toBeLessThanOrEqual(initial.safeGateCeiling)
  297 |   await page.keyboard.press('BracketLeft')
  298 |   await expect.poll(async () => (await state(page)).competition?.juryGateNumber).toBe(initial.juryGateNumber - 1)
  299 |   // Exercise jury adjustment, then restore the real AUTO gate for a playable jump.
  300 |   await page.keyboard.press('BracketRight')
  301 |   await expect.poll(async () => (await state(page)).competition?.juryGateNumber).toBe(initial.juryGateNumber)
  302 |   await page.keyboard.press('KeyJ')
  303 |   await expect.poll(async () => (await state(page)).competition?.juryHeld).toBe(true)
  304 |   await page.keyboard.press('KeyJ')
  305 |   await expect.poll(async () => (await state(page)).competition?.juryHeld).toBe(false)
  306 |   await page.keyboard.press('Enter')
  307 |   await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('yellow')
  308 |   await page.keyboard.press('Enter')
  309 |   await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('green')
  310 |   expect((await state(page)).competition?.actualGateNumber).toBe(initial.juryGateNumber)
  311 |   await startTakeoff(page, 'competition')
  312 |   // pauseAt requires a browser-clock timestamp in the future; a host new Date()
  313 |   // is already in the past by the time its CDP command reaches the browser.
  314 |   const virtualNow = await page.evaluate(() => Date.now())
  315 |   await page.clock.pauseAt(virtualNow + 50)
  316 |   try {
  317 |     await finishRealJump(page, 'competition', 'KeyR', 1, true)
  318 |   } finally {
  319 |     await page.clock.resume() // save, bots and replay continue with the regular flowing clock
  320 |   }
  321 |   await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')
  322 |   const result = (await state(page)).competition?.lastResult
  323 |   const contact = (await state(page)).competition?.jump
  324 |   console.log(`H04 competition AUTO: gate ${initial.juryGateNumber}, wind ${result?.wind.measuredMeanUserMetersPerSecond.toFixed(2)}m/s, ${result?.status}, raw ${contact?.distance?.toFixed(2)}m, stored ${(result?.distanceHalfMeters ?? 0) / 2}m, flight ${contact?.flightSeconds.toFixed(2)}s, events ${contact?.events.join('; ')}`)
  325 |   expect(result?.status).toBe('landed')
  326 |   expect(result?.distanceHalfMeters ?? 0).toBeGreaterThanOrEqual(360)
  327 |   expect(result?.distanceHalfMeters).toBeGreaterThan(0)
  328 |   expect(result?.versions.hill).toBe(VERSION)
  329 |   expect(typeof result?.componentTenths.wind).toBe('number')
  330 |   expect(typeof result?.componentTenths.juryGate).toBe('number')
  331 |   console.log(`H04 competition: ${result?.status}, stored ${(result?.distanceHalfMeters ?? 0) / 2}m, version ${result?.versions.hill}`)
  332 |   await page.keyboard.press('KeyV')
  333 |   await expect.poll(async () => (await state(page)).screen).toBe('replay')
  334 |   expect((await state(page)).replay).toMatchObject({ hillId: H04, visualsCompatible: true, resultId: result?.resultId, recordedDistanceHalfMeters: result?.distanceHalfMeters })
  335 |   await page.waitForFunction(() => (window as unknown as { __retroDebugSnapshot(): Snapshot }).__retroDebugSnapshot().replay?.phase === 'Flight', undefined, { polling: 'raf', timeout: 20_000 })
  336 |   await page.keyboard.press('Space')
  337 |   await shot(page, 'h04-replay-flight-960x540.png')
  338 |   await page.keyboard.press('ArrowRight')
  339 |   expect((await state(page)).replay?.recordedDistanceHalfMeters).toBe(result?.distanceHalfMeters)
  340 |   await page.keyboard.press('Backspace')
  341 |   await page.keyboard.press('Enter')
  342 |   await expect.poll(async () => (await state(page)).competition?.botYieldCount, { timeout: 20_000 }).toBeGreaterThan(0)
  343 |   await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')
  344 | 
  345 |   await boot(page)
  346 |   expect((await state(page)).selectedHill.id).toBe('tech-k120-hs134')
  347 |   expect((await state(page)).persistence.resumable).toBe(false)
  348 |   expect((await state(page)).replay).toMatchObject({ hillId: H04, visualsCompatible: true, recordedDistanceHalfMeters: result?.distanceHalfMeters })
  349 |   await choose(page, 'ArrowLeft', H04)
  350 |   await expect.poll(async () => (await state(page)).persistence.resumable).toBe(true)
  351 |   await choose(page, 'ArrowLeft', 'h03-oberstdorf-large')
  352 |   expect((await state(page)).persistence.resumable).toBe(false)
  353 |   await choose(page, 'ArrowRight', H04)
  354 |   await page.keyboard.press('ArrowDown')
  355 |   await page.keyboard.press('Enter')
  356 |   await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  357 |   await page.keyboard.press('Enter')
  358 |   // Bots may have finished qualification and started the next round (index 0).
  359 |   await expect.poll(async () => (await state(page)).persistence.savedRevision ?? 0).toBeGreaterThanOrEqual(2)
> 360 |   expect((await state(page)).competition?.view).toBeTruthy()
      |                                                 ^ Error: expect(received).toBeTruthy()
  361 |   await page.keyboard.press('KeyP') // stop bot progression while altering test-only IndexedDB
  362 |   await expect.poll(async () => (await state(page)).paused).toBe(true)
  363 |   await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')
  364 | 
  365 |   const modifiedVersion = await page.evaluate(async ([sessionId, dbName, dbVersion]) => {
  366 |     const db = await new Promise<IDBDatabase>((ok, bad) => {
  367 |       const req = indexedDB.open(dbName, dbVersion)
  368 |       req.onsuccess = () => ok(req.result)
  369 |       req.onerror = () => bad(req.error)
  370 |     })
  371 |     await new Promise<void>((ok, bad) => {
  372 |       const tx = db.transaction('sessions', 'readwrite')
  373 |       const req = tx.objectStore('sessions').get(sessionId)
  374 |       req.onsuccess = () => {
  375 |         if (!req.result) { bad(new Error('No H04 session checkpoint')); return }
  376 |         tx.objectStore('sessions').put({ ...req.result, versions: { ...req.result.versions, hill: 'h04-inspired-1' } })
  377 |       }
  378 |       tx.oncomplete = () => ok()
  379 |       tx.onabort = () => bad(tx.error)
  380 |     })
  381 |     const version = await new Promise<string>((ok, bad) => {
  382 |       const req = db.transaction('sessions', 'readonly').objectStore('sessions').get(sessionId)
  383 |       req.onsuccess = () => ok(req.result?.versions?.hill)
  384 |       req.onerror = () => bad(req.error)
  385 |     })
  386 |     db.close()
  387 |     return version
  388 |   }, [SESSION, DB_NAME, DB_VERSION] as const)
  389 |   expect(modifiedVersion).toBe('h04-inspired-1')
  390 |   await boot(page)
  391 |   await choose(page, 'ArrowLeft', H04)
  392 |   expect((await state(page)).persistence.resumable).toBe(false)
  393 |   expect((await state(page)).persistence.rejectedReason).toContain('STARY ZAPIS PLANICY')
  394 | 
  395 |   await page.evaluate(async ([resultId, dbName, dbVersion]) => {
  396 |     const db = await new Promise<IDBDatabase>((ok, bad) => {
  397 |       const req = indexedDB.open(dbName, dbVersion)
  398 |       req.onsuccess = () => ok(req.result)
  399 |       req.onerror = () => bad(req.error)
  400 |     })
  401 |     await new Promise<void>((ok, bad) => {
  402 |       const tx = db.transaction('replays', 'readwrite')
  403 |       const req = tx.objectStore('replays').get(resultId)
  404 |       req.onsuccess = () => {
  405 |         if (!req.result) { bad(new Error('No real H04 replay')); return }
  406 |         tx.objectStore('replays').put({ ...req.result, versions: { ...req.result.versions, hill: 'h04-inspired-1' } })
  407 |       }
  408 |       tx.oncomplete = () => ok()
  409 |       tx.onabort = () => bad(tx.error)
  410 |     })
  411 |     db.close()
  412 |   }, [result!.resultId, DB_NAME, DB_VERSION] as const)
  413 |   await boot(page)
  414 |   expect((await state(page)).replay).toMatchObject({ hillId: H04, visualsCompatible: false, recordedDistanceHalfMeters: result?.distanceHalfMeters })
  415 |   expect((await state(page)).replay?.notice).toContain('STAREGO PROFILU')
  416 |   await page.keyboard.press('ArrowDown')
  417 |   await page.keyboard.press('ArrowDown')
  418 |   await page.keyboard.press('Enter')
  419 |   expect((await state(page)).screen).toBe('menu') // old replay cannot be presented as current
  420 | })
  421 | 
```