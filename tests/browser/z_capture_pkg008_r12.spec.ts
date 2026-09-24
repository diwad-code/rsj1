import { expect, test } from '@playwright/test'
import { build } from 'vite'
import { resolve } from 'node:path'
import { buildHill } from '../../src/simulation/technicalHill'
import { jumperVisualFrame, type SceneActor } from '../../src/render/hillView'
import { actorFromFrame } from '../../src/render/replayView'
import { runJump } from '../support/jumpHarness'

test('R12 deterministic normal, high and beyond-HS R; support and replay precedence', () => {
  const hill = buildHill()
  const actor = (height: number, meters: number, age = 24): SceneActor => ({
    hill, position: hill.surfacePositionAt(meters), pitchRad: 0, phase: 'Outrun', tick: 200 + age,
    landingStyle: 'parallel', events: [
      { tick: 100, type: 'landingPrep', detail: `parallel, wysokość ${height.toFixed(1)} m` },
      { tick: 200, type: 'contact', detail: `${meters.toFixed(1)} m, styl parallel` },
    ],
  })
  expect(jumperVisualFrame(actor(4, 120, 12)).pose).toBe('landingParallel')
  expect(jumperVisualFrame(actor(4, 134, 12)).pose).toBe('landingParallel')
  for (const candidate of [actor(9, 120), actor(4, 136)]) {
    expect(jumperVisualFrame(candidate)).toEqual({ pose: 'landingDeep', frameIndex: 2 })
    expect(jumperVisualFrame(candidate, true)).toEqual(jumperVisualFrame(candidate))
    const replay = actorFromFrame(hill, { tick: candidate.tick, phase: 'Outrun', x: candidate.position.x,
      y: candidate.position.y, pitchRad: 0, speedKmh: 90, windUserMetersPerSecond: 0,
      heightAboveSurface: 0, events: candidate.events! as Parameters<typeof actorFromFrame>[1]['events'] })
    expect(jumperVisualFrame(replay)).toEqual(jumperVisualFrame(candidate))
    expect(jumperVisualFrame({ ...candidate, phase: 'Fall' }).pose).toBe('fall')
  }
  expect([0, 10, 24, 48, 64, 73].map((age) => jumperVisualFrame(actor(9, 120, age))))
    .toEqual([0, 1, 2, 3, 4].map((frameIndex) => ({ pose: 'landingDeep', frameIndex })).concat([{ pose: 'outrun', frameIndex: 0 }]))
  for (const [detail, pose] of [['jedna dłoń', 'supportOne'], ['obie dłonie', 'supportTwo']]) {
    const base = actor(9, 136)
    expect(jumperVisualFrame({ ...base, events: [...base.events!, { tick: 200, type: 'handSupport', detail }] }))
      .toEqual({ pose, frameIndex: 1 })
  }
  // Real deterministic successful jump: selection never mutates the outcome.
  const poses = new Set<string>()
  const sim = runJump({ pilot: 'ideal', style: 'parallel', prepFlightSeconds: 3,
    onStep: (live) => { poses.add(jumperVisualFrame(live).pose) } })
  expect(sim.outcome?.status).toBe('landed')
  expect(poses.has('landingDeep'), JSON.stringify({ events: sim.events, poses: [...poses] })).toBe(true)
})

test('R12 focused renderer captures at 2x and 4x', async ({ page }) => {
  const output = await build({ configFile: false, logLevel: 'silent', build: {
    write: false, minify: false, lib: { entry: resolve('tests/browser/r12-visual.fixture.ts'), name: 'R12', formats: ['iife'] },
  } })
  const bundle = Array.isArray(output) ? output[0] : output
  if (!bundle || !('output' in bundle)) throw new Error('Unexpected fixture bundle')
  const chunk = bundle.output.find((item) => item.type === 'chunk')
  if (!chunk || chunk.type !== 'chunk') throw new Error('Missing fixture bundle')
  await page.setContent('<html><body></body></html>')
  await page.addScriptTag({ content: chunk.code })
  for (const scale of [2, 4]) {
    await page.setViewportSize({ width: 480 * scale, height: 270 * scale })
    for (const name of ['training', 'competition', 'normal', 'deep-high', 'deep-hs', 'support-one', 'support-two', 'strip']) {
      const frame = await page.evaluate(({ name, scale }) => (window as unknown as {
        R12: { render(name: string, scale: number): { pose: string; frameIndex: number } | null }
      }).R12.render(name, scale), { name, scale })
      if (name.startsWith('deep')) expect(frame).toEqual({ pose: 'landingDeep', frameIndex: 2 })
      if (name.startsWith('support')) expect(frame?.pose).toBe(name === 'support-one' ? 'supportOne' : 'supportTwo')
      if (name === 'normal') expect(frame?.pose).toBe('landingParallel')
      await page.screenshot({ path: test.info().outputPath(`r12-${name}-${480 * scale}x${270 * scale}.png`), fullPage: name === 'strip' })
    }
  }
})
