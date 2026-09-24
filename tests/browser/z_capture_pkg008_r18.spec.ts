import { expect, test } from '@playwright/test'
import { build } from 'vite'
import { resolve } from 'node:path'
import type * as Fixture from './r16-visual.fixture'

test('PKG-008 r18 — perspektywa wsporników belki', async ({ page }) => {
  const output = await build({ configFile: false, logLevel: 'silent', build: {
    write: false, minify: false,
    lib: { entry: resolve('tests/browser/r16-visual.fixture.ts'), name: 'R18', formats: ['iife'] },
  } })
  const bundle = Array.isArray(output) ? output[0] : output
  if (!bundle || !('output' in bundle)) throw new Error('Brak paczki fixture')
  const chunk = bundle.output.find(item => item.type === 'chunk')
  if (!chunk || chunk.type !== 'chunk') throw new Error('Brak kodu fixture')
  await page.setContent('<html><body></body></html>')
  await page.addScriptTag({ content: chunk.code })
  for (const scale of [2, 4]) {
    await page.setViewportSize({ width: 480 * scale, height: 270 * scale })
    for (const age of [0, 21]) {
      const result = await page.evaluate(({ age, scale }) =>
        (window as unknown as { R18: typeof Fixture }).R18.render('gate', age, scale), { age, scale })
      expect(result.visual.pose).toBe(age === 0 ? 'gate' : 'gatePush')
      await page.screenshot({ path: resolve(`docs/evidence/PKG-008/r18-gate-perspective/pkg008-r18-gate-${age === 0 ? 'seated' : 'push'}-${480 * scale}x${270 * scale}.png`) })
    }
  }
})
