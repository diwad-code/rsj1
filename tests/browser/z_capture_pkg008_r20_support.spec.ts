import { expect, test } from '@playwright/test'
import { build } from 'vite'
import { resolve } from 'node:path'
import { buildHill } from '../../src/simulation/technicalHill'
import { JUMPER_POSE_FRAME_COUNTS, jumperVisualFrame, supportTwoVariant, type SceneActor } from '../../src/render/hillView'
import { actorFromFrame } from '../../src/render/replayView'
import type * as Fixture from './r13-support.fixture'

declare global { interface Window { R13: typeof Fixture } }

test('R20 stable variants, replay parity, unchanged phases and longer telemark', () => {
  const hill = buildHill()
  const base: SceneActor = { hill, position: hill.surfacePositionAt(122), pitchRad: 0,
    phase: 'Outrun', tick: 200, landingStyle: 'parallel', contact: { distanceMeters: 122.049 },
    events: [
      { tick: 140, type: 'landingPrep', detail: 'parallel, wysokość 9.0 m' },
      { tick: 200, type: 'contact', detail: '122.0 m, styl parallel' },
      { tick: 200, type: 'handSupport', detail: 'obie dłonie' },
    ] }
  expect(JUMPER_POSE_FRAME_COUNTS.supportTwo).toBe(3)
  for (const [gateNumber, variant] of [[1, 'front'], [3, 'back']] as const) {
    const actor = { ...base, gateNumber }
    expect(supportTwoVariant(actor)).toBe(variant)
    expect(supportTwoVariant(actor)).toBe(variant)
    for (const age of [0, 23, 24, 47, 48, 72]) {
      const live = { ...actor, tick: 200 + age }
      const replay = actorFromFrame(hill, { tick: live.tick, phase: 'Outrun', x: live.position.x,
        y: live.position.y, pitchRad: 0, speedKmh: 90, windUserMetersPerSecond: 0,
        heightAboveSurface: 0, events: live.events! as Parameters<typeof actorFromFrame>[1]['events'] }, gateNumber)
      expect(supportTwoVariant(live)).toBe(variant)
      expect(supportTwoVariant(replay)).toBe(variant)
      expect(jumperVisualFrame(live)).toEqual({ pose: 'supportTwo', frameIndex: Math.min(2, Math.floor(age / 24)) })
      expect(jumperVisualFrame(replay)).toEqual(jumperVisualFrame(live))
    }
  }
  const telemark: SceneActor = { ...base, landingStyle: 'telemark', events: [
    { tick: 140, type: 'landingPrep', detail: 'telemark, wysokość 9.0 m' },
    { tick: 200, type: 'contact', detail: '122.0 m, styl telemark' },
  ] }
  for (const age of [0, 19, 36, 54]) {
    expect(jumperVisualFrame({ ...telemark, tick: 200 + age })).toEqual({ pose: 'landingPrep', frameIndex: 6 })
  }
  expect(jumperVisualFrame({ ...telemark, tick: 255 }).pose).toBe('outrun')
  // Support precedence stays stronger than telemark; deep parallel still lasts 72 ticks.
  expect(jumperVisualFrame({ ...base, landingStyle: 'telemark', tick: 260 }).pose).toBe('supportTwo')
  expect(jumperVisualFrame({ ...base, tick: 272, events: base.events!.slice(0, 2) }).pose).toBe('landingDeep')
})

test('R20 FRONT/BACK contact and hold pixels, recovery cache and telemark evidence', async ({ page }) => {
  const output = await build({ configFile: false, logLevel: 'silent', build: {
    write: false, minify: false, lib: { entry: resolve('tests/browser/r13-support.fixture.ts'), name: 'R13', formats: ['iife'] },
  } })
  const bundle = Array.isArray(output) ? output[0] : output
  if (!bundle || !('output' in bundle)) throw new Error('Unexpected fixture bundle')
  const chunk = bundle.output.find((item) => item.type === 'chunk')
  if (!chunk || chunk.type !== 'chunk') throw new Error('Missing fixture bundle')
  await page.setViewportSize({ width: 960, height: 540 })
  await page.setContent('<html><body></body></html>')
  await page.addScriptTag({ content: chunk.code })
  const evidence = resolve('docs/evidence/PKG-008/r20-support')
  const recoveries: number[][] = []
  for (const [gate, variant] of [[1, 'front'], [3, 'back']] as const) {
    for (const age of [0, 24, 48]) {
      const result = await page.evaluate(({ gate, age }) => window.R13.render(true, age, 2, 122, true, gate), { gate, age })
      expect(result.variant).toBe(variant)
      expect(result.frame).toEqual({ pose: 'supportTwo', frameIndex: age / 24 })
      expect(result.groups.length).toBe(age < 48 ? 2 : 0)
      expect(result.connected.every(Boolean)).toBe(true)
      if (age === 48) recoveries.push(result.suitPixels)
      const phase = age === 0 ? 'contact' : age === 24 ? 'hold' : 'recovery'
      await page.screenshot({ path: resolve(evidence, `r20-${variant}-${phase}-960x540.png`) })
      await page.evaluate(() => window.R13.crop())
      await page.screenshot({ path: resolve(evidence, `r20-${variant}-${phase}-crop.png`) })
    }
  }
  expect(recoveries[0]).not.toEqual(recoveries[1])
  const cachedFront = await page.evaluate(() => window.R13.render(true, 48, 2, 122, true, 1))
  expect(cachedFront.suitPixels).toEqual(recoveries[0])
  for (const age of [0, 36, 54, 55]) {
    const result = await page.evaluate((age) => window.R13.render(false, age, 2, 122, true, 1, true), age)
    expect(result.frame.pose).toBe(age <= 54 ? 'landingPrep' : 'outrun')
    await page.screenshot({ path: resolve(evidence, `r20-telemark-t${age}-960x540.png`) })
    await page.evaluate(() => window.R13.crop())
    await page.screenshot({ path: resolve(evidence, `r20-telemark-t${age}-crop.png`) })
  }
  // Both variants over the same range of slopes as R13, not only the capture hill position.
  for (const meters of [90, 110, 136, 155, 180]) for (const age of [0, 24]) {
    const seen = new Set<string>()
    for (let gate = 1; gate <= 21 && seen.size < 2; gate++) {
      const result = await page.evaluate(({ meters, gate, age }) => window.R13.render(true, age, 2, meters, true, gate), { meters, gate, age })
      seen.add(result.variant)
      expect(result.groups.length, `${result.variant} at ${meters} m`).toBe(2)
      expect(result.connected.every(Boolean)).toBe(true)
    }
    expect(seen.size).toBe(2)
  }
})
