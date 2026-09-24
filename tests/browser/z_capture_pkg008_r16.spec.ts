import { expect, test } from '@playwright/test'
import { build } from 'vite'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type * as Fixture from './r16-visual.fixture'

declare global { interface Window { R16: typeof Fixture } }
const OUT_DIR = resolve('docs/evidence/PKG-008/browser-artifacts')

test('PKG-008 r16 — celowane sceny belki i rzeczywistego idealnego wybicia', async ({ page }) => {
  test.setTimeout(90_000)
  const output = await build({ configFile: false, logLevel: 'silent', build: {
    write: false, minify: false,
    lib: { entry: resolve('tests/browser/r16-visual.fixture.ts'), name: 'R16', formats: ['iife'] },
  } })
  const bundle = Array.isArray(output) ? output[0] : output
  if (!bundle || !('output' in bundle)) throw new Error('Brak paczki fixture')
  const chunk = bundle.output.find(item => item.type === 'chunk')
  if (!chunk || chunk.type !== 'chunk') throw new Error('Brak kodu fixture')
  await page.setContent('<html><body></body></html>')
  await page.addScriptTag({ content: chunk.code })
  const evidence = []
  for (const scale of [2, 4]) {
    await page.setViewportSize({ width: 480 * scale, height: 270 * scale })
    for (const kind of ['gate', 'perfect', 'ordinary'] as const) {
      for (const age of kind === 'gate' ? [0, 7, 14, 21, 28, 60] : [0, 6, 12, 24, 25]) {
        const result = await page.evaluate(({ kind, age, scale }) => window.R16.render(kind, age, scale), { kind, age, scale })
        if (kind === 'gate') {
          expect(result.visual.pose).toBe(age === 0 ? 'gate' : age < 28 ? 'gatePush' : 'inrun')
        } else {
          expect(result.perfect).toBe(kind === 'perfect')
          expect(result.events.some(event => event.type === 'perfectTakeoff')).toBe(kind === 'perfect')
        }
        const path = `${OUT_DIR}/pkg008-r16-fixed-${kind}-${age}-${480 * scale}x${270 * scale}.png`
        await page.screenshot({ path })
        evidence.push({ ...result, path })
      }
    }
  }
  writeFileSync(`${OUT_DIR}/pkg008-r16-fixed-scenes.json`, JSON.stringify(evidence, null, 2))
})
