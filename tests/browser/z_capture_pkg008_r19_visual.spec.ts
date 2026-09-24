import { expect, test } from '@playwright/test'
import { build } from 'vite'
import { resolve } from 'node:path'
import type * as Fixture from './r16-visual.fixture'

test('PKG-008 r19 — dojście i oparcie belki', async ({ page }) => {
  const output = await build({ configFile: false, logLevel: 'silent', build: {
    write: false, minify: false,
    lib: { entry: resolve('tests/browser/r16-visual.fixture.ts'), name: 'R19', formats: ['iife'] },
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
        (window as unknown as { R19: typeof Fixture }).R19.render('gate', age, scale), { age, scale })
      expect(result.visual.pose).toBe(age === 0 ? 'gate' : 'gatePush')
      if (age === 0) expect(result.phase).toBe('GateGreen')
      // Kadr tej fixture obejmuje wieżę, górne dojście i wybraną belkę.
      await page.screenshot({ path: resolve(`docs/evidence/PKG-008/r19-visual/pkg008-r19-gate-${age === 0 ? 'seated' : 'push'}-${480 * scale}x${270 * scale}.png`) })
    }
  }
})
