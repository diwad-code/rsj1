import { expect, test } from '@playwright/test'
import { build } from 'vite'
import { resolve } from 'node:path'
import type * as Fixture from './r15-results.fixture'

declare global { interface Window { R15: typeof Fixture } }

const OUT_DIR = resolve('docs/evidence/PKG-008/browser-artifacts')
const scenarios = ['k-telemark', 'hs-plus-parallel', 'hs-plus-telemark', 'one-hand', 'two-hands'] as const

test('PKG-008 r15 — wyniki treningu i konkursu dla nowych zakresów not', async ({ page }) => {
  const output = await build({ configFile: false, logLevel: 'silent', build: {
    write: false, minify: false,
    lib: { entry: resolve('tests/browser/r15-results.fixture.ts'), name: 'R15', formats: ['iife'] },
  } })
  const bundle = Array.isArray(output) ? output[0] : output
  if (!bundle || !('output' in bundle)) throw new Error('Unexpected fixture bundle')
  const chunk = bundle.output.find((item) => item.type === 'chunk')
  if (!chunk || chunk.type !== 'chunk') throw new Error('Missing fixture bundle')
  await page.setContent('<html><body></body></html>')
  await page.addScriptTag({ content: chunk.code })

  for (const scale of [2, 4]) {
    await page.setViewportSize({ width: 480 * scale, height: 270 * scale })
    for (const scenario of scenarios) for (const view of ['training', 'competition'] as const) {
      const evidence = await page.evaluate(
        ({ scenario, view, scale }) => window.R15.render(scenario, view, scale),
        { scenario, view, scale },
      )
      expect(evidence.marksTenths).toHaveLength(5)
      expect(evidence.droppedJudgeIndexes).toHaveLength(2)
      await page.screenshot({
        path: `${OUT_DIR}\\pkg008-r15-${view}-${scenario}-${480 * scale}x${270 * scale}.png`,
      })
    }
  }
})
