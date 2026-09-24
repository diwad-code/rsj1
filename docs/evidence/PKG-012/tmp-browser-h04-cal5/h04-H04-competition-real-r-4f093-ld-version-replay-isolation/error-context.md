# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: h04.spec.ts >> H04 competition, real result, bots, transactional save/reload, current and old-version replay isolation
- Location: tests\browser\h04.spec.ts:227:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: false
Received: true
```

# Page snapshot

```yaml
- main "Retro Ski Jumping" [ref=f2e2]:
  - application "Retro Ski Jumping — menu główne" [active] [ref=f2e3]
  - paragraph [ref=f2e4]: Menu główne. PLANICA MAMUT INSP. • K200/HS240. PLANICA — INSPIROWANA, identyfikator h04-planica-flying, wersja h04-inspired-1. Lewo i prawo zmienia skocznię. Góra i dół wybiera tryb. F ponawia pełny ekran. P włącza pauzę. Belka automatyczna 17, prognoza wiatru -0,7 metra na sekundę.
```

# Test source

```ts
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
  239 |   expect(initial.juryGateNumber).toBeGreaterThan(1)
  240 |   expect(initial.juryGateNumber).toBeLessThanOrEqual(initial.safeGateCeiling)
  241 |   await page.keyboard.press('BracketLeft')
  242 |   await expect.poll(async () => (await state(page)).competition?.juryGateNumber).toBe(initial.juryGateNumber - 1)
  243 |   await page.keyboard.press('KeyJ')
  244 |   await expect.poll(async () => (await state(page)).competition?.juryHeld).toBe(true)
  245 |   await page.keyboard.press('KeyJ')
  246 |   await expect.poll(async () => (await state(page)).competition?.juryHeld).toBe(false)
  247 |   await page.keyboard.press('Enter')
  248 |   await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('yellow')
  249 |   await page.keyboard.press('Enter')
  250 |   await expect.poll(async () => (await state(page)).competition?.startPhase).toBe('green')
  251 |   expect((await state(page)).competition?.actualGateNumber).toBe(initial.juryGateNumber - 1)
  252 |   await startTakeoff(page, 'competition')
  253 |   await finishRealJump(page, 'competition', 'KeyR')
  254 |   await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')
  255 |   const result = (await state(page)).competition?.lastResult
  256 |   expect(result?.distanceHalfMeters).toBeGreaterThan(0)
  257 |   expect(result?.versions.hill).toBe(VERSION)
  258 |   expect(typeof result?.componentTenths.wind).toBe('number')
  259 |   expect(typeof result?.componentTenths.juryGate).toBe('number')
  260 |   console.log(`H04 competition: ${result?.status}, stored ${result?.distanceHalfMeters / 2}m, version ${result?.versions.hill}`)
  261 |   await page.keyboard.press('KeyV')
  262 |   await expect.poll(async () => (await state(page)).screen).toBe('replay')
  263 |   expect((await state(page)).replay).toMatchObject({ hillId: H04, visualsCompatible: true, resultId: result?.resultId, recordedDistanceHalfMeters: result?.distanceHalfMeters })
  264 |   await page.waitForFunction(() => (window as unknown as { __retroDebugSnapshot(): Snapshot }).__retroDebugSnapshot().replay?.phase === 'Flight', undefined, { polling: 'raf', timeout: 20_000 })
  265 |   await page.keyboard.press('Space')
  266 |   await shot(page, 'h04-replay-flight-960x540.png')
  267 |   await page.keyboard.press('ArrowRight')
  268 |   expect((await state(page)).replay?.recordedDistanceHalfMeters).toBe(result?.distanceHalfMeters)
  269 |   await page.keyboard.press('Backspace')
  270 |   await page.keyboard.press('Enter')
  271 |   await expect.poll(async () => (await state(page)).competition?.botYieldCount, { timeout: 20_000 }).toBeGreaterThan(0)
  272 |   await expect.poll(async () => (await state(page)).persistence.saveState).toBe('saved')
  273 | 
  274 |   await boot(page)
  275 |   expect((await state(page)).selectedHill.id).toBe('tech-k120-hs134')
  276 |   expect((await state(page)).persistence.resumable).toBe(false)
  277 |   expect((await state(page)).replay).toMatchObject({ hillId: H04, visualsCompatible: true, recordedDistanceHalfMeters: result?.distanceHalfMeters })
  278 |   await choose(page, 'ArrowLeft', H04)
  279 |   await expect.poll(async () => (await state(page)).persistence.resumable).toBe(true)
  280 |   await choose(page, 'ArrowLeft', 'h03-oberstdorf-large')
  281 |   expect((await state(page)).persistence.resumable).toBe(false)
  282 |   await choose(page, 'ArrowRight', H04)
  283 |   await page.keyboard.press('ArrowDown')
  284 |   await page.keyboard.press('Enter')
  285 |   await expect.poll(async () => (await state(page)).screen).toBe('competition-setup')
  286 |   await page.keyboard.press('Enter')
  287 |   // Bots may have finished qualification and started the next round (index 0).
  288 |   await expect.poll(async () => (await state(page)).persistence.savedRevision ?? 0).toBeGreaterThanOrEqual(2)
  289 |   expect((await state(page)).competition?.view).toBeTruthy()
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
> 312 |   expect((await state(page)).persistence.resumable).toBe(false)
      |                                                     ^ Error: expect(received).toBe(expected) // Object.is equality
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