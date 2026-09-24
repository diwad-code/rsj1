# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: h04.spec.ts >> H04 competition, real result, bots, transactional save/reload, current and old-version replay isolation
- Location: tests\browser\h04.spec.ts:232:1

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 1
Received:    0

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- main "Retro Ski Jumping" [ref=f1e2]:
  - application "Retro Ski Jumping — PIERWSZA SERIA. Tabela konkursu." [active] [ref=f1e3]
  - paragraph [ref=f1e4]: PIERWSZA SERIA. Tabela konkursu.
```

# Test source

```ts
  189 |   }
  190 |   expect((await state(page)).selectedHill.version).toBe(VERSION)
  191 |   await expect(page.locator('#screen-reader-status')).toContainText('PLANICA')
  192 |   const markers = buildSportMarkers(HILL)
  193 |   expect(markers.kPoint).toEqual({ meters: 200, point: HILL.surfacePositionAt(200) })
  194 |   expect(markers.hillSize).toEqual({ meters: 240, point: HILL.surfacePositionAt(240) })
  195 |   expect(markers.meterLines.map(line => line.meters)).toEqual(Array.from({ length: 16 }, (_, index) => 165 + 5 * index))
  196 |   for (const line of markers.meterLines) expect(HILL.surfaceDistanceAtPoint(line.point)).toBeCloseTo(line.meters, 1)
  197 |   await page.keyboard.press('Enter')
  198 |   await expect.poll(async () => (await state(page)).screen).toBe('jump')
  199 |   expect((await state(page)).jump?.gateSource).toBe('auto')
  200 |   await page.keyboard.press('Backspace')
  201 |   await page.keyboard.press('ArrowDown')
  202 |   await page.keyboard.press('Enter')
  203 |   await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  204 |   expect((await state(page)).selectedHill.id).toBe(H04)
  205 | })
  206 | 
  207 | test('H04 real keyboard mammoth R and T: scene, shared-map technical view, landed results and full video', async ({ page }) => {
  208 |   test.setTimeout(230_000)
  209 |   await boot(page)
  210 |   await choose(page, 'ArrowLeft', H04)
  211 |   await shot(page, 'h04-menu-960x540.png')
  212 |   await page.keyboard.press('Enter')
  213 |   await expect.poll(async () => (await state(page)).screen).toBe('jump')
  214 |   await shot(page, 'h04-scene-960x540.png')
  215 |   await page.keyboard.press('KeyD')
  216 |   await expect.poll(async () => (await state(page)).jump?.technicalView).toBe(true)
  217 |   await shot(page, 'h04-technical-960x540.png')
  218 |   await page.keyboard.press('KeyD')
  219 |   const parallel = await trainingLanding(page, 'KeyR', 1)
  220 |   expect(parallel.raw).toBeGreaterThanOrEqual(200)
  221 |   await shot(page, 'h04-result-parallel-960x540.png')
  222 |   await page.keyboard.press('Enter')
  223 |   await expect.poll(async () => (await state(page)).jump?.phase).toBe('GateGreen')
  224 |   const telemark = await trainingLanding(page, 'KeyT', parallel.attempt + 1)
  225 |   expect(telemark.raw).toBeGreaterThanOrEqual(200)
  226 |   await shot(page, 'h04-result-telemark-960x540.png')
  227 |   const video = page.video()
  228 |   await page.close()
  229 |   await video?.saveAs(path('h04-real-keyboard-jumps-960x540.webm'))
  230 | })
  231 | 
  232 | test('H04 competition, real result, bots, transactional save/reload, current and old-version replay isolation', async ({ page }) => {
  233 |   test.setTimeout(170_000)
  234 |   await boot(page)
  235 |   await choose(page, 'ArrowLeft', H04)
  236 |   await page.keyboard.press('ArrowDown')
  237 |   await page.keyboard.press('Enter')
  238 |   await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  239 |   await page.keyboard.press('Enter')
  240 |   await expect.poll(async () => (await state(page)).competition?.view).toBe('handover')
  241 |   await page.keyboard.press('Enter')
  242 |   await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('red')
  243 |   const initial = (await state(page)).competition!
  244 |   expect(initial.juryGateNumber).toBeGreaterThan(1)
  245 |   expect(initial.juryGateNumber).toBeLessThanOrEqual(initial.safeGateCeiling)
  246 |   await page.keyboard.press('BracketLeft')
  247 |   await expect.poll(async () => (await state(page)).competition?.juryGateNumber).toBe(initial.juryGateNumber - 1)
  248 |   await page.keyboard.press('KeyJ')
  249 |   await expect.poll(async () => (await state(page)).competition?.juryHeld).toBe(true)
  250 |   await page.keyboard.press('KeyJ')
  251 |   await expect.poll(async () => (await state(page)).competition?.juryHeld).toBe(false)
  252 |   await page.keyboard.press('Enter')
  253 |   await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('yellow')
  254 |   await page.keyboard.press('Enter')
  255 |   await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('green')
  256 |   expect((await state(page)).competition?.actualGateNumber).toBe(initial.juryGateNumber - 1)
  257 |   await startTakeoff(page, 'competition')
  258 |   await finishRealJump(page, 'competition', 'KeyR')
  259 |   await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')
  260 |   const result = (await state(page)).competition?.lastResult
  261 |   expect(result?.distanceHalfMeters).toBeGreaterThan(0)
  262 |   expect(result?.versions.hill).toBe(VERSION)
  263 |   expect(typeof result?.componentTenths.wind).toBe('number')
  264 |   expect(typeof result?.componentTenths.juryGate).toBe('number')
  265 |   console.log(`H04 competition: ${result?.status}, stored ${result?.distanceHalfMeters / 2}m, version ${result?.versions.hill}`)
  266 |   await page.keyboard.press('KeyV')
  267 |   await expect.poll(async () => (await state(page)).screen).toBe('replay')
  268 |   expect((await state(page)).replay).toMatchObject({ hillId: H04, visualsCompatible: true, resultId: result?.resultId, recordedDistanceHalfMeters: result?.distanceHalfMeters })
  269 |   await page.waitForFunction(() => (window as unknown as { __retroDebugSnapshot(): Snapshot }).__retroDebugSnapshot().replay?.phase === 'Flight', undefined, { polling: 'raf', timeout: 20_000 })
  270 |   await page.keyboard.press('Space')
  271 |   await shot(page, 'h04-replay-flight-960x540.png')
  272 |   await page.keyboard.press('ArrowRight')
  273 |   expect((await state(page)).replay?.recordedDistanceHalfMeters).toBe(result?.distanceHalfMeters)
  274 |   await page.keyboard.press('Backspace')
  275 |   await page.keyboard.press('Enter')
  276 |   await expect.poll(async () => (await state(page)).competition?.botYieldCount, { timeout: 20_000 }).toBeGreaterThan(0)
  277 |   await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')
  278 | 
  279 |   await boot(page)
  280 |   expect((await state(page)).selectedHill.id).toBe('tech-k120-hs134')
  281 |   expect((await state(page)).persistence.resumable).toBe(false)
  282 |   expect((await state(page)).replay).toMatchObject({ hillId: H04, visualsCompatible: true, recordedDistanceHalfMeters: result?.distanceHalfMeters })
  283 |   await choose(page, 'ArrowLeft', H04)
  284 |   await expect.poll(async () => (await state(page)).persistence.resumable).toBe(true)
  285 |   await page.keyboard.press('ArrowDown')
  286 |   await page.keyboard.press('Enter')
  287 |   await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  288 |   await page.keyboard.press('Enter')
> 289 |   await expect.poll(async () => (await state(page)).competition?.nextStartIndex).toBeGreaterThanOrEqual(1)
      |                                                                                  ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  290 |   await page.keyboard.press('KeyP') // stop bot progression while altering test-only IndexedDB
  291 | 
  292 |   await page.evaluate(async (sessionId) => {
  293 |     const db = await new Promise<IDBDatabase>((ok, bad) => {
  294 |       const req = indexedDB.open('retro-ski-jumping', 1)
  295 |       req.onsuccess = () => ok(req.result)
  296 |       req.onerror = () => bad(req.error)
  297 |     })
  298 |     await new Promise<void>((ok, bad) => {
  299 |       const tx = db.transaction('sessions', 'readwrite')
  300 |       const req = tx.objectStore('sessions').get(sessionId)
  301 |       req.onsuccess = () => {
  302 |         if (!req.result) { bad(new Error('No H04 session checkpoint')); return }
  303 |         tx.objectStore('sessions').put({ ...req.result, versions: { ...req.result.versions, hill: 'h04-inspired-0' } })
  304 |       }
  305 |       tx.oncomplete = () => ok()
  306 |       tx.onabort = () => bad(tx.error)
  307 |     })
  308 |     db.close()
  309 |   }, SESSION)
  310 |   await boot(page)
  311 |   await choose(page, 'ArrowLeft', H04)
  312 |   expect((await state(page)).persistence.resumable).toBe(false)
  313 |   expect((await state(page)).persistence.rejectedReason).toContain('STARY ZAPIS PLANICY')
  314 | 
  315 |   await page.evaluate(async (resultId) => {
  316 |     const db = await new Promise<IDBDatabase>((ok, bad) => {
  317 |       const req = indexedDB.open('retro-ski-jumping', 1)
  318 |       req.onsuccess = () => ok(req.result)
  319 |       req.onerror = () => bad(req.error)
  320 |     })
  321 |     await new Promise<void>((ok, bad) => {
  322 |       const tx = db.transaction('replays', 'readwrite')
  323 |       const req = tx.objectStore('replays').get(resultId)
  324 |       req.onsuccess = () => {
  325 |         if (!req.result) { bad(new Error('No real H04 replay')); return }
  326 |         tx.objectStore('replays').put({ ...req.result, versions: { ...req.result.versions, hill: 'h04-inspired-0' } })
  327 |       }
  328 |       tx.oncomplete = () => ok()
  329 |       tx.onabort = () => bad(tx.error)
  330 |     })
  331 |     db.close()
  332 |   }, result!.resultId)
  333 |   await boot(page)
  334 |   expect((await state(page)).replay).toMatchObject({ hillId: H04, visualsCompatible: false, recordedDistanceHalfMeters: result?.distanceHalfMeters })
  335 |   expect((await state(page)).replay?.notice).toContain('STAREGO PROFILU')
  336 |   await page.keyboard.press('ArrowDown')
  337 |   await page.keyboard.press('ArrowDown')
  338 |   await page.keyboard.press('Enter')
  339 |   expect((await state(page)).screen).toBe('menu') // old replay cannot be presented as current
  340 | })
  341 | 
```