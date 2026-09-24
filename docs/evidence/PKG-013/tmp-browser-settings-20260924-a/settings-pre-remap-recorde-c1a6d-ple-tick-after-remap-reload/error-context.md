# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings.spec.ts >> pre-remap recorded H01 replay keeps its recorded result and sample tick after remap/reload
- Location: tests\browser\settings.spec.ts:175:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: 501.98399999999873

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- main "Retro Ski Jumping" [ref=f1e2]:
  - application "Retro Ski Jumping — powtórka ostatniego skoku" [active] [ref=f1e3]
  - paragraph [ref=f1e4]: "Powtórka skoku: Łucja Wicher, 84.5 metra. Pauza, tempo 1. Spacja pauzuje, strzałki lewo i prawo przewijają, Backspace wychodzi. Odtwarzanie nie nalicza wyniku."
```

# Test source

```ts
  101 |   await rebind(page, 'menuBack', 'KeyB')
  102 | 
  103 |   await page.keyboard.press('Backspace') // emergency fallback even after remapping
  104 |   await expect.poll(async () => (await state(page)).screen).toBe('menu')
  105 |   await settings(page, 'KeyE') // remapped menu confirmation
  106 |   await page.keyboard.press('KeyB') // remapped menu back
  107 |   await expect.poll(async () => (await state(page)).screen).toBe('menu')
  108 |   await settings(page, 'Enter') // emergency confirmation still works
  109 |   await page.keyboard.press('Backspace')
  110 |   await chooseMenu(page, 'training')
  111 |   await page.keyboard.press('Enter')
  112 |   await expect.poll(async () => (await state(page)).screen).toBe('jump')
  113 |   expect((await state(page)).jump?.phase).toBe('GateGreen')
  114 |   await page.keyboard.press('KeyA') // new right binding opens the gate
  115 |   await expect.poll(async () => (await state(page)).jump?.events.some(event => event.endsWith(' gateOpen'))).toBe(true)
  116 |   for (let attempt = 0; attempt < 8 && !(await state(page)).jump?.events.some(event => event.endsWith(' takeoffImpulseStart')); attempt += 1) {
  117 |     await page.keyboard.press('KeyW')
  118 |     await page.waitForTimeout(35)
  119 |   }
  120 |   await expect.poll(async () => (await state(page)).jump?.events.some(event => event.endsWith(' takeoffImpulseStart'))).toBe(true)
  121 |   await page.keyboard.press('Backspace')
  122 |   await expect.poll(async () => (await state(page)).screen).toBe('menu')
  123 | 
  124 |   await boot(page, true)
  125 |   await settings(page)
  126 |   expect((await state(page)).settings.settings.bindings).toMatchObject({ takeoff: 'KeyW', right: 'KeyA' })
  127 |   expect((await state(page)).settings.settings).toMatchObject({ menuConfirm: 'KeyE', menuBack: 'KeyB' })
  128 |   await row(page, 'reset')
  129 |   await page.keyboard.press('Enter')
  130 |   await expect.poll(async () => (await state(page)).settings.settings).toEqual(DEFAULT_SETTINGS)
  131 |   await boot(page, true)
  132 |   await settings(page)
  133 |   expect((await state(page)).settings.settings).toEqual(DEFAULT_SETTINGS)
  134 | })
  135 | 
  136 | test('settings screenshots at both resolutions; scale, text and reduced motion persist on small screens', async ({ page }) => {
  137 |   await page.setViewportSize({ width: 1280, height: 720 })
  138 |   await boot(page)
  139 |   await settings(page)
  140 |   expect((await state(page)).screen).toBe('settings')
  141 |   await page.screenshot({ path: test.info().outputPath('settings-1280x720.png') })
  142 |   await page.setViewportSize({ width: 960, height: 540 })
  143 |   await expect.poll(async () => (await state(page)).canvasScale).toBe(2)
  144 |   await page.screenshot({ path: test.info().outputPath('settings-960x540.png') })
  145 | 
  146 |   await row(page, 'scaleMode')
  147 |   await page.keyboard.press('ArrowRight')
  148 |   await expect.poll(async () => (await state(page)).settings.settings.scaleMode).toBe('integer')
  149 |   await row(page, 'largeText')
  150 |   await page.keyboard.press('Enter')
  151 |   await expect.poll(async () => (await state(page)).settings.settings.largeText).toBe(true)
  152 |   await row(page, 'reducedMotion')
  153 |   await page.keyboard.press('Enter')
  154 |   await expect.poll(async () => (await state(page)).settings.settings.reducedMotion).toBe(true)
  155 |   await expect.poll(async () => (await state(page)).reducedMotion).toBe(true)
  156 |   await row(page, 'volume')
  157 |   await page.keyboard.press('ArrowLeft')
  158 |   await expect.poll(async () => (await state(page)).settings.settings.volume).toBeLessThan(100)
  159 |   const before = (await state(page)).settings.settings
  160 | 
  161 |   await page.setViewportSize({ width: 400, height: 240 })
  162 |   const small = await page.locator('#game-canvas').evaluate(canvas => {
  163 |     const bounds = canvas.getBoundingClientRect()
  164 |     return { width: bounds.width, height: bounds.height, viewportWidth: innerWidth, viewportHeight: innerHeight }
  165 |   })
  166 |   expect(small.width).toBeLessThanOrEqual(small.viewportWidth)
  167 |   expect(small.height).toBeLessThanOrEqual(small.viewportHeight)
  168 |   await expect(page.locator('#game-canvas')).toHaveAttribute('aria-label', /ustawieni/i)
  169 |   await boot(page, true)
  170 |   await settings(page)
  171 |   expect((await state(page)).settings.settings).toEqual(before)
  172 |   expect((await state(page)).reducedMotion).toBe(true)
  173 | })
  174 | 
  175 | test('pre-remap recorded H01 replay keeps its recorded result and sample tick after remap/reload', async ({ page }) => {
  176 |   test.setTimeout(90_000)
  177 |   await boot(page)
  178 |   // The fixture runs the real deterministic simulation and recorder, then stores its
  179 |   // samples in IndexedDB; it is not an assertion that a human played a jump.
  180 |   const output = await build({ configFile: false, logLevel: 'silent', build: {
  181 |     write: false, minify: false,
  182 |     lib: { entry: resolve('tests/browser/h01-replay.fixture.ts'), name: 'H01Fixture', formats: ['iife'] },
  183 |   } })
  184 |   const bundle = Array.isArray(output) ? output[0] : output
  185 |   if (!bundle || !('output' in bundle)) throw new Error('Replay fixture bundle unavailable')
  186 |   const chunk = bundle.output.find(item => item.type === 'chunk')
  187 |   if (!chunk) throw new Error('Replay fixture chunk unavailable')
  188 |   await page.addScriptTag({ content: chunk.code })
  189 |   const recorded = await page.evaluate(() => (
  190 |     window as unknown as { H01Fixture: typeof ReplayFixture }
  191 |   ).H01Fixture.install())
  192 |   await boot(page, true) // reload the game's saved-replay index
  193 | 
  194 |   async function replayAtTick30(): Promise<NonNullable<Snapshot['replay']>> {
  195 |     await chooseMenu(page, 'replay')
  196 |     await page.keyboard.press('Enter')
  197 |     await expect.poll(async () => (await state(page)).screen).toBe('replay')
  198 |     await page.keyboard.press('Space')
  199 |     await expect.poll(async () => (await state(page)).replay?.playing).toBe(false)
  200 |     await page.keyboard.press('KeyR')
> 201 |     await expect.poll(async () => (await state(page)).replay?.tick).toBe(0)
      |                                                                     ^ Error: expect(received).toBe(expected) // Object.is equality
  202 |     await page.keyboard.press('ArrowRight')
  203 |     await expect.poll(async () => (await state(page)).replay?.tick).toBe(30)
  204 |     const replay = (await state(page)).replay
  205 |     if (!replay) throw new Error('Replay disappeared')
  206 |     await page.keyboard.press('Backspace')
  207 |     await expect.poll(async () => (await state(page)).screen).toBe('menu')
  208 |     return replay
  209 |   }
  210 | 
  211 |   const before = await replayAtTick30()
  212 |   expect(before.sampleCount).toBeGreaterThan(20)
  213 |   expect(before.recordedDistanceHalfMeters).toBe(recorded.distance)
  214 |   expect(before.recordedTotalTenths).toBe(recorded.total)
  215 |   await settings(page)
  216 |   await rebind(page, 'takeoff', 'KeyW')
  217 |   await rebind(page, 'right', 'KeyA')
  218 |   await page.keyboard.press('Backspace')
  219 |   await boot(page, true)
  220 |   expect((await state(page)).settings.settings.bindings).toMatchObject({ takeoff: 'KeyW', right: 'KeyA' })
  221 |   const after = await replayAtTick30()
  222 |   expect(after).toMatchObject({
  223 |     resultId: before.resultId,
  224 |     tick: before.tick,
  225 |     sampleCount: before.sampleCount,
  226 |     recordedDistanceHalfMeters: before.recordedDistanceHalfMeters,
  227 |     recordedTotalTenths: before.recordedTotalTenths,
  228 |   })
  229 |   expect((await state(page)).persistence.resultCount).toBe(0)
  230 | })
  231 | 
```