import { expect, test } from '@playwright/test'
import { build } from 'vite'
import { resolve } from 'node:path'
import { readFile } from 'node:fs/promises'
import { buildHill } from '../../src/simulation/technicalHill'
import { JUMPER_ART_VERSION, jumperVisualFrame, type SceneActor } from '../../src/render/hillView'
import { actorFromFrame } from '../../src/render/replayView'
import type * as Fixture from './r13-support.fixture'

declare global { interface Window { R13: typeof Fixture } }

test('R13 support contact-hold-recovery, replay precedence and reduced motion', () => {
  expect(JUMPER_ART_VERSION).toBe('pkg008-jumper-solid-silhouette-8')
  const hill = buildHill()
  for (const two of [false, true]) for (const age of [0, 23, 24, 47, 48, 72, 73]) {
    const actor: SceneActor = { hill, position: hill.surfacePositionAt(136), pitchRad: 0,
      phase: 'Outrun', tick: 200 + age, landingStyle: 'parallel', events: [
        { tick: 140, type: 'landingPrep', detail: 'parallel, wysokość 9.0 m' },
        { tick: 200, type: 'contact', detail: '136.0 m, styl parallel' },
        { tick: 200, type: 'handSupport', detail: two ? 'obie dłonie' : 'jedna dłoń' },
      ] }
    const expected = age > 72 ? { pose: 'outrun', frameIndex: 0 }
      : { pose: two ? 'supportTwo' : 'supportOne', frameIndex: Math.min(2, Math.floor(age / 24)) }
    expect(jumperVisualFrame(actor)).toEqual(expected)
    expect(jumperVisualFrame(actor, true)).toEqual(age > 72 ? { pose: 'outrun', frameIndex: 1 } : expected)
    const replay = actorFromFrame(hill, { tick: actor.tick, phase: 'Outrun', x: actor.position.x,
      y: actor.position.y, pitchRad: 0, speedKmh: 90, windUserMetersPerSecond: 0,
      heightAboveSurface: 0, events: actor.events! as Parameters<typeof actorFromFrame>[1]['events'] })
    expect(jumperVisualFrame(replay)).toEqual(expected)
    expect(jumperVisualFrame({ ...actor, phase: 'Fall' }).pose).toBe('fall')
    expect(jumperVisualFrame({ ...actor, phase: 'FallSettled' }).pose).toBe('fall')
  }
})

test('R13 support pixels and focused evidence; accepted R12 views unchanged', async ({ page }) => {
  const output = await build({ configFile: false, logLevel: 'silent', build: {
    write: false, minify: false, lib: { entry: resolve('tests/browser/r13-support.fixture.ts'), name: 'R13', formats: ['iife'] },
  } })
  const bundle = Array.isArray(output) ? output[0] : output
  if (!bundle || !('output' in bundle)) throw new Error('Unexpected fixture bundle')
  const chunk = bundle.output.find((item) => item.type === 'chunk')
  if (!chunk || chunk.type !== 'chunk') throw new Error('Missing fixture bundle')
  await page.setContent('<html><body></body></html>')
  await page.addScriptTag({ content: chunk.code })
  for (const scale of [2, 4]) {
    await page.setViewportSize({ width: 480 * scale, height: 270 * scale })
    for (const two of [false, true]) for (const age of [0, 24, 48]) {
      const evidence = await page.evaluate(({ two, age, scale }) => window.R13.render(two, age, scale), { two, age, scale })
      expect(evidence.frame).toEqual({ pose: two ? 'supportTwo' : 'supportOne', frameIndex: age / 24 })
      expect(evidence.groups.length).toBe(age < 48 ? two ? 2 : 1 : 0)
      expect(evidence.connected.every(Boolean)).toBe(true)
      const normalMotion = await page.evaluate(({ two, age, scale }) => window.R13.render(two, age, scale, 122, false), { two, age, scale })
      expect(normalMotion.suitPixels).toEqual(evidence.suitPixels)
      await page.evaluate(({ two, age, scale }) => window.R13.render(two, age, scale), { two, age, scale })
      await page.screenshot({ path: test.info().outputPath(`pkg008-r13-support-${two ? 'two' : 'one'}-${['contact', 'hold', 'recovery'][age / 24]}-${480 * scale}x${270 * scale}.png`) })
    }
    const frames = await page.evaluate((scale) => window.R13.strip(scale), scale)
    expect(frames.length).toBe(11)
    await page.screenshot({ path: test.info().outputPath(`pkg008-r13-support-strip-${480 * scale}x${270 * scale}.png`) })
    // Compare actual accepted pixels, rather than silently updating snapshots.
    for (const name of ['normal', 'deep-high', 'deep-hs', 'training', 'competition']) {
      await page.evaluate(({ name, scale }) => window.R13.renderFrozen(name, scale), { name, scale })
      const baseline = await readFile(resolve(`docs/evidence/PKG-008/browser-artifacts/pkg008-r12-${name}-${480 * scale}x${270 * scale}.png`))
      const current = await page.screenshot({ path: test.info().outputPath(`pkg008-r13-frozen-${name}-${480 * scale}x${270 * scale}.png`) })
      const equal = await page.evaluate(async ({ old, now, notesOnly, scale }) => {
        const pixels = async (encoded: string) => {
          const image = new Image()
          image.src = `data:image/png;base64,${encoded}`
          await image.decode()
          const canvas = document.createElement('canvas')
          canvas.width = image.width; canvas.height = image.height
          const context = canvas.getContext('2d')!
          context.drawImage(image, 0, 0)
          // Simulation calibration can change distances/points independently.
          // Freeze text, strike-throughs and absence of rectangles. Normalize
          // only the dim scenery visible through the translucent training panel.
          const data = notesOnly ? context.getImageData(60 * scale, 88 * scale, 360 * scale, 44 * scale).data
            : context.getImageData(0, 0, image.width, image.height).data
          if (notesOnly) for (let i = 0; i < data.length; i += 4) {
            if (data[i]! < 100 && data[i + 1]! < 100 && data[i + 2]! < 100) data[i] = data[i + 1] = data[i + 2] = 0
          }
          return data
        }
        const [a, b] = await Promise.all([pixels(old), pixels(now)])
        const differences = []
        for (let i = 0; i < a.length; i += 4) {
          if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2]) {
            if (differences.length < 8) differences.push({ x: i / 4 % (notesOnly ? 360 * scale : 480 * scale),
              y: Math.floor(i / 4 / (notesOnly ? 360 * scale : 480 * scale)), old: [...a.slice(i, i + 3)], now: [...b.slice(i, i + 3)] })
          }
        }
        return differences
      }, { old: baseline.toString('base64'), now: current.toString('base64'), notesOnly: name === 'training' || name === 'competition', scale })
      expect(equal, `${name} must match accepted R12 pixels`).toEqual([])
    }
  }
  // Local slope fitting beyond the single screenshot position.
  for (const meters of [90, 110, 136, 155, 180]) for (const two of [false, true]) {
    const evidence = await page.evaluate(({ meters, two }) => window.R13.render(two, 24, 2, meters), { meters, two })
    expect(evidence.groups.length, `palms at ${meters} m`).toBe(two ? 2 : 1)
    expect(evidence.connected.every(Boolean)).toBe(true)
  }
})
