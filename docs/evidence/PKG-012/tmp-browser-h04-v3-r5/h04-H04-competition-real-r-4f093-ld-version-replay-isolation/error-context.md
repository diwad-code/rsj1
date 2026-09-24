# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: h04.spec.ts >> H04 competition, real result, bots, transactional save/reload, current and old-version replay isolation
- Location: tests\browser\h04.spec.ts:242:1

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 360
Received:    334
```

# Page snapshot

```yaml
- main "Retro Ski Jumping" [ref=e2]:
  - application "Retro Ski Jumping — KWALIFIKACJE. Tabela konkursu." [active] [ref=e3]
  - paragraph [ref=e4]: KWALIFIKACJE. Tabela konkursu.
```

# Test source

```ts
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
  250 |   await expect.poll(async () => (await state(page)).competition?.view).toBe('handover')
  251 |   await page.keyboard.press('Enter')
  252 |   await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('red')
  253 |   const initial = (await state(page)).competition!
  254 |   console.log(`H04 browser jury AUTO ${initial.juryGateNumber}, safe ceiling ${initial.safeGateCeiling}`)
  255 |   expect(initial.juryGateNumber).toBeGreaterThan(1)
  256 |   expect(initial.juryGateNumber).toBeLessThanOrEqual(initial.safeGateCeiling)
  257 |   await page.keyboard.press('BracketLeft')
  258 |   await expect.poll(async () => (await state(page)).competition?.juryGateNumber).toBe(initial.juryGateNumber - 1)
  259 |   // Exercise jury adjustment, then restore the real AUTO gate for a playable jump.
  260 |   await page.keyboard.press('BracketRight')
  261 |   await expect.poll(async () => (await state(page)).competition?.juryGateNumber).toBe(initial.juryGateNumber)
  262 |   await page.keyboard.press('KeyJ')
  263 |   await expect.poll(async () => (await state(page)).competition?.juryHeld).toBe(true)
  264 |   await page.keyboard.press('KeyJ')
  265 |   await expect.poll(async () => (await state(page)).competition?.juryHeld).toBe(false)
  266 |   await page.keyboard.press('Enter')
  267 |   await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('yellow')
  268 |   await page.keyboard.press('Enter')
  269 |   await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('green')
  270 |   expect((await state(page)).competition?.actualGateNumber).toBe(initial.juryGateNumber)
  271 |   await startTakeoff(page, 'competition')
  272 |   await finishRealJump(page, 'competition', 'KeyR')
  273 |   await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')
  274 |   const result = (await state(page)).competition?.lastResult
  275 |   console.log(`H04 competition AUTO: gate ${initial.juryGateNumber}, ${result?.status}, raw ${(await state(page)).competition?.jump?.distance?.toFixed(2)}m, stored ${(result?.distanceHalfMeters ?? 0) / 2}m, flight ${(await state(page)).competition?.jump?.flightSeconds?.toFixed(2)}s`)
  276 |   expect(result?.status).toBe('landed')
> 277 |   expect(result?.distanceHalfMeters ?? 0).toBeGreaterThanOrEqual(360)
      |                                           ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  278 |   expect(result?.distanceHalfMeters).toBeGreaterThan(0)
  279 |   expect(result?.versions.hill).toBe(VERSION)
  280 |   expect(typeof result?.componentTenths.wind).toBe('number')
  281 |   expect(typeof result?.componentTenths.juryGate).toBe('number')
  282 |   console.log(`H04 competition: ${result?.status}, stored ${(result?.distanceHalfMeters ?? 0) / 2}m, version ${result?.versions.hill}`)
  283 |   await page.keyboard.press('KeyV')
  284 |   await expect.poll(async () => (await state(page)).screen).toBe('replay')
  285 |   expect((await state(page)).replay).toMatchObject({ hillId: H04, visualsCompatible: true, resultId: result?.resultId, recordedDistanceHalfMeters: result?.distanceHalfMeters })
  286 |   await page.waitForFunction(() => (window as unknown as { __retroDebugSnapshot(): Snapshot }).__retroDebugSnapshot().replay?.phase === 'Flight', undefined, { polling: 'raf', timeout: 20_000 })
  287 |   await page.keyboard.press('Space')
  288 |   await shot(page, 'h04-replay-flight-960x540.png')
  289 |   await page.keyboard.press('ArrowRight')
  290 |   expect((await state(page)).replay?.recordedDistanceHalfMeters).toBe(result?.distanceHalfMeters)
  291 |   await page.keyboard.press('Backspace')
  292 |   await page.keyboard.press('Enter')
  293 |   await expect.poll(async () => (await state(page)).competition?.botYieldCount, { timeout: 20_000 }).toBeGreaterThan(0)
  294 |   await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')
  295 | 
  296 |   await boot(page)
  297 |   expect((await state(page)).selectedHill.id).toBe('tech-k120-hs134')
  298 |   expect((await state(page)).persistence.resumable).toBe(false)
  299 |   expect((await state(page)).replay).toMatchObject({ hillId: H04, visualsCompatible: true, recordedDistanceHalfMeters: result?.distanceHalfMeters })
  300 |   await choose(page, 'ArrowLeft', H04)
  301 |   await expect.poll(async () => (await state(page)).persistence.resumable).toBe(true)
  302 |   await choose(page, 'ArrowLeft', 'h03-oberstdorf-large')
  303 |   expect((await state(page)).persistence.resumable).toBe(false)
  304 |   await choose(page, 'ArrowRight', H04)
  305 |   await page.keyboard.press('ArrowDown')
  306 |   await page.keyboard.press('Enter')
  307 |   await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  308 |   await page.keyboard.press('Enter')
  309 |   // Bots may have finished qualification and started the next round (index 0).
  310 |   await expect.poll(async () => (await state(page)).persistence.savedRevision ?? 0).toBeGreaterThanOrEqual(2)
  311 |   expect((await state(page)).competition?.view).toBeTruthy()
  312 |   await page.keyboard.press('KeyP') // stop bot progression while altering test-only IndexedDB
  313 |   await expect.poll(async () => (await state(page)).paused).toBe(true)
  314 |   await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')
  315 | 
  316 |   const modifiedVersion = await page.evaluate(async (sessionId) => {
  317 |     const db = await new Promise<IDBDatabase>((ok, bad) => {
  318 |       const req = indexedDB.open('retro-ski-jumping', 1)
  319 |       req.onsuccess = () => ok(req.result)
  320 |       req.onerror = () => bad(req.error)
  321 |     })
  322 |     await new Promise<void>((ok, bad) => {
  323 |       const tx = db.transaction('sessions', 'readwrite')
  324 |       const req = tx.objectStore('sessions').get(sessionId)
  325 |       req.onsuccess = () => {
  326 |         if (!req.result) { bad(new Error('No H04 session checkpoint')); return }
  327 |         tx.objectStore('sessions').put({ ...req.result, versions: { ...req.result.versions, hill: 'h04-inspired-1' } })
  328 |       }
  329 |       tx.oncomplete = () => ok()
  330 |       tx.onabort = () => bad(tx.error)
  331 |     })
  332 |     const version = await new Promise<string>((ok, bad) => {
  333 |       const req = db.transaction('sessions', 'readonly').objectStore('sessions').get(sessionId)
  334 |       req.onsuccess = () => ok(req.result?.versions?.hill)
  335 |       req.onerror = () => bad(req.error)
  336 |     })
  337 |     db.close()
  338 |     return version
  339 |   }, SESSION)
  340 |   expect(modifiedVersion).toBe('h04-inspired-1')
  341 |   await boot(page)
  342 |   await choose(page, 'ArrowLeft', H04)
  343 |   expect((await state(page)).persistence.resumable).toBe(false)
  344 |   expect((await state(page)).persistence.rejectedReason).toContain('STARY ZAPIS PLANICY')
  345 | 
  346 |   await page.evaluate(async (resultId) => {
  347 |     const db = await new Promise<IDBDatabase>((ok, bad) => {
  348 |       const req = indexedDB.open('retro-ski-jumping', 1)
  349 |       req.onsuccess = () => ok(req.result)
  350 |       req.onerror = () => bad(req.error)
  351 |     })
  352 |     await new Promise<void>((ok, bad) => {
  353 |       const tx = db.transaction('replays', 'readwrite')
  354 |       const req = tx.objectStore('replays').get(resultId)
  355 |       req.onsuccess = () => {
  356 |         if (!req.result) { bad(new Error('No real H04 replay')); return }
  357 |         tx.objectStore('replays').put({ ...req.result, versions: { ...req.result.versions, hill: 'h04-inspired-1' } })
  358 |       }
  359 |       tx.oncomplete = () => ok()
  360 |       tx.onabort = () => bad(tx.error)
  361 |     })
  362 |     db.close()
  363 |   }, result!.resultId)
  364 |   await boot(page)
  365 |   expect((await state(page)).replay).toMatchObject({ hillId: H04, visualsCompatible: false, recordedDistanceHalfMeters: result?.distanceHalfMeters })
  366 |   expect((await state(page)).replay?.notice).toContain('STAREGO PROFILU')
  367 |   await page.keyboard.press('ArrowDown')
  368 |   await page.keyboard.press('ArrowDown')
  369 |   await page.keyboard.press('Enter')
  370 |   expect((await state(page)).screen).toBe('menu') // old replay cannot be presented as current
  371 | })
  372 | 
```