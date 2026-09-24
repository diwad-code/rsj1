# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: h04.spec.ts >> H04 competition, real result, bots, transactional save/reload, current and old-version replay isolation
- Location: tests\browser\h04.spec.ts:252:1

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 360
Received:    346
```

# Page snapshot

```yaml
- main "Retro Ski Jumping" [ref=e2]:
  - application "Retro Ski Jumping — KWALIFIKACJE. Tabela konkursu." [active] [ref=e3]
  - paragraph [ref=e4]: KWALIFIKACJE. Tabela konkursu.
```

# Test source

```ts
  188 |     await finishRealJump(page, 'training', landing, attempt)
  189 |     const jump = (await state(page)).jump!
  190 |     attempts.push({ gate: jump.gate, raw: jump.distance, status: jump.status })
  191 |     if (jump.status === 'landed' && (jump.distance ?? 0) >= 200) {
  192 |       console.log(`H04 training ${landing}: attempt ${attempt}, gate ${jump.gate}, raw ${jump.distance?.toFixed(2)}m, result floored ${Math.floor((jump.distance ?? 0) * 2) / 2}m, wind ${jump.windMeasuredMetersPerSecond?.toFixed(2)}m/s`)
  193 |       return { attempt, raw: jump.distance! }
  194 |     }
  195 |   }
  196 |   throw new Error(`No real landed ${landing} attempt >=200m: ${JSON.stringify(attempts)}`)
  197 | }
  198 | 
  199 | test.use({ viewport: { width: 960, height: 540 }, video: { mode: 'on', size: { width: 960, height: 540 } } })
  200 | 
  201 | test('five hills keyboard selection; H04 map and training menu', async ({ page }) => {
  202 |   await boot(page)
  203 |   expect((await state(page)).selectedHill.id).toBe('tech-k120-hs134')
  204 |   for (const id of [H04, 'h03-oberstdorf-large', 'h02-zakopane-large', 'h01-lillehammer-normal', 'tech-k120-hs134']) {
  205 |     await choose(page, 'ArrowLeft', id)
  206 |   }
  207 |   for (const id of ['h01-lillehammer-normal', 'h02-zakopane-large', 'h03-oberstdorf-large', H04]) {
  208 |     await choose(page, 'ArrowRight', id)
  209 |   }
  210 |   expect((await state(page)).selectedHill.version).toBe(VERSION)
  211 |   await expect(page.locator('#screen-reader-status')).toContainText('PLANICA')
  212 |   const markers = buildSportMarkers(HILL)
  213 |   expect(markers.kPoint).toEqual({ meters: 200, point: HILL.surfacePositionAt(200) })
  214 |   expect(markers.hillSize).toEqual({ meters: 240, point: HILL.surfacePositionAt(240) })
  215 |   expect(markers.meterLines.map(line => line.meters)).toEqual(Array.from({ length: 16 }, (_, index) => 165 + 5 * index))
  216 |   for (const line of markers.meterLines) expect(HILL.surfaceDistanceAtPoint(line.point)).toBeCloseTo(line.meters, 1)
  217 |   await page.keyboard.press('Enter')
  218 |   await expect.poll(async () => (await state(page)).screen).toBe('jump')
  219 |   expect((await state(page)).jump?.gateSource).toBe('auto')
  220 |   await page.keyboard.press('Backspace')
  221 |   await page.keyboard.press('ArrowDown')
  222 |   await page.keyboard.press('Enter')
  223 |   await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  224 |   expect((await state(page)).selectedHill.id).toBe(H04)
  225 | })
  226 | 
  227 | test('H04 real keyboard mammoth R and T: scene, shared-map technical view, landed results and full video', async ({ page }) => {
  228 |   test.setTimeout(230_000)
  229 |   await boot(page)
  230 |   await choose(page, 'ArrowLeft', H04)
  231 |   await shot(page, 'h04-menu-960x540.png')
  232 |   await page.keyboard.press('Enter')
  233 |   await expect.poll(async () => (await state(page)).screen).toBe('jump')
  234 |   await shot(page, 'h04-scene-960x540.png')
  235 |   await page.keyboard.press('KeyD')
  236 |   await expect.poll(async () => (await state(page)).jump?.technicalView).toBe(true)
  237 |   await shot(page, 'h04-technical-960x540.png')
  238 |   await page.keyboard.press('KeyD')
  239 |   const parallel = await trainingLanding(page, 'KeyR', 1)
  240 |   expect(parallel.raw).toBeGreaterThanOrEqual(200)
  241 |   await shot(page, 'h04-result-parallel-960x540.png')
  242 |   await page.keyboard.press('Enter')
  243 |   await expect.poll(async () => (await state(page)).jump?.phase).toBe('GateGreen')
  244 |   const telemark = await trainingLanding(page, 'KeyT', parallel.attempt + 1)
  245 |   expect(telemark.raw).toBeGreaterThanOrEqual(200)
  246 |   await shot(page, 'h04-result-telemark-960x540.png')
  247 |   const video = page.video()
  248 |   await page.close()
  249 |   await video?.saveAs(path('h04-real-keyboard-jumps-960x540.webm'))
  250 | })
  251 | 
  252 | test('H04 competition, real result, bots, transactional save/reload, current and old-version replay isolation', async ({ page }) => {
  253 |   test.setTimeout(170_000)
  254 |   await boot(page)
  255 |   await choose(page, 'ArrowLeft', H04)
  256 |   await page.keyboard.press('ArrowDown')
  257 |   await page.keyboard.press('Enter')
  258 |   await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  259 |   await page.keyboard.press('Enter')
  260 |   await expect.poll(async () => (await state(page)).competition?.view).toBe('handover')
  261 |   await page.keyboard.press('Enter')
  262 |   await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('red')
  263 |   const initial = (await state(page)).competition!
  264 |   console.log(`H04 browser jury AUTO ${initial.juryGateNumber}, safe ceiling ${initial.safeGateCeiling}`)
  265 |   expect(initial.juryGateNumber).toBeGreaterThan(1)
  266 |   expect(initial.juryGateNumber).toBeLessThanOrEqual(initial.safeGateCeiling)
  267 |   await page.keyboard.press('BracketLeft')
  268 |   await expect.poll(async () => (await state(page)).competition?.juryGateNumber).toBe(initial.juryGateNumber - 1)
  269 |   // Exercise jury adjustment, then restore the real AUTO gate for a playable jump.
  270 |   await page.keyboard.press('BracketRight')
  271 |   await expect.poll(async () => (await state(page)).competition?.juryGateNumber).toBe(initial.juryGateNumber)
  272 |   await page.keyboard.press('KeyJ')
  273 |   await expect.poll(async () => (await state(page)).competition?.juryHeld).toBe(true)
  274 |   await page.keyboard.press('KeyJ')
  275 |   await expect.poll(async () => (await state(page)).competition?.juryHeld).toBe(false)
  276 |   await page.keyboard.press('Enter')
  277 |   await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('yellow')
  278 |   await page.keyboard.press('Enter')
  279 |   await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('green')
  280 |   expect((await state(page)).competition?.actualGateNumber).toBe(initial.juryGateNumber)
  281 |   await startTakeoff(page, 'competition')
  282 |   await finishRealJump(page, 'competition', 'KeyR')
  283 |   await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')
  284 |   const result = (await state(page)).competition?.lastResult
  285 |   const contact = (await state(page)).competition?.jump
  286 |   console.log(`H04 competition AUTO: gate ${initial.juryGateNumber}, wind ${result?.wind.measuredMeanUserMetersPerSecond.toFixed(2)}m/s, ${result?.status}, raw ${contact?.distance?.toFixed(2)}m, stored ${(result?.distanceHalfMeters ?? 0) / 2}m, flight ${contact?.flightSeconds.toFixed(2)}s, events ${contact?.events.join('; ')}`)
  287 |   expect(result?.status).toBe('landed')
> 288 |   expect(result?.distanceHalfMeters ?? 0).toBeGreaterThanOrEqual(360)
      |                                           ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  289 |   expect(result?.distanceHalfMeters).toBeGreaterThan(0)
  290 |   expect(result?.versions.hill).toBe(VERSION)
  291 |   expect(typeof result?.componentTenths.wind).toBe('number')
  292 |   expect(typeof result?.componentTenths.juryGate).toBe('number')
  293 |   console.log(`H04 competition: ${result?.status}, stored ${(result?.distanceHalfMeters ?? 0) / 2}m, version ${result?.versions.hill}`)
  294 |   await page.keyboard.press('KeyV')
  295 |   await expect.poll(async () => (await state(page)).screen).toBe('replay')
  296 |   expect((await state(page)).replay).toMatchObject({ hillId: H04, visualsCompatible: true, resultId: result?.resultId, recordedDistanceHalfMeters: result?.distanceHalfMeters })
  297 |   await page.waitForFunction(() => (window as unknown as { __retroDebugSnapshot(): Snapshot }).__retroDebugSnapshot().replay?.phase === 'Flight', undefined, { polling: 'raf', timeout: 20_000 })
  298 |   await page.keyboard.press('Space')
  299 |   await shot(page, 'h04-replay-flight-960x540.png')
  300 |   await page.keyboard.press('ArrowRight')
  301 |   expect((await state(page)).replay?.recordedDistanceHalfMeters).toBe(result?.distanceHalfMeters)
  302 |   await page.keyboard.press('Backspace')
  303 |   await page.keyboard.press('Enter')
  304 |   await expect.poll(async () => (await state(page)).competition?.botYieldCount, { timeout: 20_000 }).toBeGreaterThan(0)
  305 |   await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')
  306 | 
  307 |   await boot(page)
  308 |   expect((await state(page)).selectedHill.id).toBe('tech-k120-hs134')
  309 |   expect((await state(page)).persistence.resumable).toBe(false)
  310 |   expect((await state(page)).replay).toMatchObject({ hillId: H04, visualsCompatible: true, recordedDistanceHalfMeters: result?.distanceHalfMeters })
  311 |   await choose(page, 'ArrowLeft', H04)
  312 |   await expect.poll(async () => (await state(page)).persistence.resumable).toBe(true)
  313 |   await choose(page, 'ArrowLeft', 'h03-oberstdorf-large')
  314 |   expect((await state(page)).persistence.resumable).toBe(false)
  315 |   await choose(page, 'ArrowRight', H04)
  316 |   await page.keyboard.press('ArrowDown')
  317 |   await page.keyboard.press('Enter')
  318 |   await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  319 |   await page.keyboard.press('Enter')
  320 |   // Bots may have finished qualification and started the next round (index 0).
  321 |   await expect.poll(async () => (await state(page)).persistence.savedRevision ?? 0).toBeGreaterThanOrEqual(2)
  322 |   expect((await state(page)).competition?.view).toBeTruthy()
  323 |   await page.keyboard.press('KeyP') // stop bot progression while altering test-only IndexedDB
  324 |   await expect.poll(async () => (await state(page)).paused).toBe(true)
  325 |   await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')
  326 | 
  327 |   const modifiedVersion = await page.evaluate(async (sessionId) => {
  328 |     const db = await new Promise<IDBDatabase>((ok, bad) => {
  329 |       const req = indexedDB.open('retro-ski-jumping', 1)
  330 |       req.onsuccess = () => ok(req.result)
  331 |       req.onerror = () => bad(req.error)
  332 |     })
  333 |     await new Promise<void>((ok, bad) => {
  334 |       const tx = db.transaction('sessions', 'readwrite')
  335 |       const req = tx.objectStore('sessions').get(sessionId)
  336 |       req.onsuccess = () => {
  337 |         if (!req.result) { bad(new Error('No H04 session checkpoint')); return }
  338 |         tx.objectStore('sessions').put({ ...req.result, versions: { ...req.result.versions, hill: 'h04-inspired-1' } })
  339 |       }
  340 |       tx.oncomplete = () => ok()
  341 |       tx.onabort = () => bad(tx.error)
  342 |     })
  343 |     const version = await new Promise<string>((ok, bad) => {
  344 |       const req = db.transaction('sessions', 'readonly').objectStore('sessions').get(sessionId)
  345 |       req.onsuccess = () => ok(req.result?.versions?.hill)
  346 |       req.onerror = () => bad(req.error)
  347 |     })
  348 |     db.close()
  349 |     return version
  350 |   }, SESSION)
  351 |   expect(modifiedVersion).toBe('h04-inspired-1')
  352 |   await boot(page)
  353 |   await choose(page, 'ArrowLeft', H04)
  354 |   expect((await state(page)).persistence.resumable).toBe(false)
  355 |   expect((await state(page)).persistence.rejectedReason).toContain('STARY ZAPIS PLANICY')
  356 | 
  357 |   await page.evaluate(async (resultId) => {
  358 |     const db = await new Promise<IDBDatabase>((ok, bad) => {
  359 |       const req = indexedDB.open('retro-ski-jumping', 1)
  360 |       req.onsuccess = () => ok(req.result)
  361 |       req.onerror = () => bad(req.error)
  362 |     })
  363 |     await new Promise<void>((ok, bad) => {
  364 |       const tx = db.transaction('replays', 'readwrite')
  365 |       const req = tx.objectStore('replays').get(resultId)
  366 |       req.onsuccess = () => {
  367 |         if (!req.result) { bad(new Error('No real H04 replay')); return }
  368 |         tx.objectStore('replays').put({ ...req.result, versions: { ...req.result.versions, hill: 'h04-inspired-1' } })
  369 |       }
  370 |       tx.oncomplete = () => ok()
  371 |       tx.onabort = () => bad(tx.error)
  372 |     })
  373 |     db.close()
  374 |   }, result!.resultId)
  375 |   await boot(page)
  376 |   expect((await state(page)).replay).toMatchObject({ hillId: H04, visualsCompatible: false, recordedDistanceHalfMeters: result?.distanceHalfMeters })
  377 |   expect((await state(page)).replay?.notice).toContain('STAREGO PROFILU')
  378 |   await page.keyboard.press('ArrowDown')
  379 |   await page.keyboard.press('ArrowDown')
  380 |   await page.keyboard.press('Enter')
  381 |   expect((await state(page)).screen).toBe('menu') // old replay cannot be presented as current
  382 | })
  383 | 
```