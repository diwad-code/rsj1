import { writeFileSync } from 'node:fs'
import { cpus, freemem, platform, release, totalmem } from 'node:os'
import { expect, test } from '@playwright/test'

test.use({ headless: false })

const RELEASE_FRAME_BUDGET = {
  p95Ms: 20,
  p99Ms: 25,
  maximumLongFrameRate: 0.005,
} as const

type Snapshot = {
  screen: string
  paused: boolean
  jump: {
    tick: number
    snowEnabled: boolean
    windUserMetersPerSecond: number
  } | null
}

test.skip('P15 — 60 sekund finalnej sceny z aktywnym śniegiem i wiatrem', async ({ page, browser }) => {
  test.setTimeout(90_000)
  await page.setViewportSize({ width: 960, height: 540 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.keyboard.press('Enter')
  await expect.poll(() => page.evaluate(() => (
    window as unknown as { __retroDebugSnapshot: () => Snapshot }
  ).__retroDebugSnapshot().screen)).toBe('menu')

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const state = await page.evaluate(() => (
      window as unknown as { __retroDebugSnapshot: () => Snapshot }
    ).__retroDebugSnapshot())
    if (state.screen === 'jump' && !state.paused) break
    await page.keyboard.press('Enter')
    await page.waitForTimeout(20)
  }

  const before = await page.evaluate(() => (
    window as unknown as { __retroDebugSnapshot: () => Snapshot }
  ).__retroDebugSnapshot())
  expect(before.screen).toBe('jump')
  expect(before.jump?.snowEnabled).toBe(true)

  const browserMetrics = await page.evaluate(async (durationMs) => {
    const frameDurations: number[] = []
    const longTasks: number[] = []
    const observer = typeof PerformanceObserver === 'function'
      ? new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) longTasks.push(entry.duration)
        })
      : null
    try {
      observer?.observe({ entryTypes: ['longtask'] })
    } catch {
      // Nie każda przeglądarka udostępnia Long Tasks API; interwały rAF pozostają dowodem.
    }

    const gpuCanvas = document.createElement('canvas')
    const gl = gpuCanvas.getContext('webgl')
    const debugInfo = gl?.getExtension('WEBGL_debug_renderer_info')
    const gpuVendor = gl && debugInfo ? String(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)) : 'unavailable'
    const gpuRenderer = gl && debugInfo ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)) : 'unavailable'
    const memory = performance as Performance & {
      memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number }
    }
    const startHeap = memory.memory?.usedJSHeapSize ?? null
    const start = performance.now()
    let previous: number | null = null

    await new Promise<void>((resolve) => {
      const sample = (now: number): void => {
        if (previous !== null) frameDurations.push(now - previous)
        previous = now

        const state = (window as unknown as { __retroDebugSnapshot: () => Snapshot }).__retroDebugSnapshot()
        if (state.paused) {
          const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas')
          canvas?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'Enter', key: 'Enter' }))
          canvas?.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, code: 'Enter', key: 'Enter' }))
        }

        if (now - start >= durationMs) resolve()
        else requestAnimationFrame(sample)
      }
      requestAnimationFrame(sample)
    })
    observer?.disconnect()

    const sorted = [...frameDurations].sort((left, right) => left - right)
    const percentile = (fraction: number): number => {
      const index = Math.max(0, Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1))
      return sorted[index] ?? 0
    }
    const endHeap = memory.memory?.usedJSHeapSize ?? null
    return {
      durationMs: performance.now() - start,
      frameCount: frameDurations.length,
      p50Ms: percentile(0.5),
      p95Ms: percentile(0.95),
      p99Ms: percentile(0.99),
      maximumMs: sorted.at(-1) ?? 0,
      longFramesOver50Ms: frameDurations.filter((duration) => duration > 50).length,
      longTaskCount: longTasks.length,
      longestTaskMs: Math.max(0, ...longTasks),
      startHeapBytes: startHeap,
      endHeapBytes: endHeap,
      userAgent: navigator.userAgent,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemoryGiB: (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? null,
      devicePixelRatio: window.devicePixelRatio,
      viewport: { width: innerWidth, height: innerHeight },
      gpuVendor,
      gpuRenderer,
    }
  }, 60_000)

  const after = await page.evaluate(() => (
    window as unknown as { __retroDebugSnapshot: () => Snapshot }
  ).__retroDebugSnapshot())
  expect(browserMetrics.durationMs).toBeGreaterThanOrEqual(60_000)
  expect(browserMetrics.frameCount).toBeGreaterThan(1_000)
  expect(browserMetrics.p95Ms).toBeLessThanOrEqual(RELEASE_FRAME_BUDGET.p95Ms)
  expect(browserMetrics.p99Ms).toBeLessThanOrEqual(RELEASE_FRAME_BUDGET.p99Ms)
  expect(browserMetrics.longFramesOver50Ms / browserMetrics.frameCount)
    .toBeLessThanOrEqual(RELEASE_FRAME_BUDGET.maximumLongFrameRate)
  expect((after.jump?.tick ?? 0) - (before.jump?.tick ?? 0)).toBeGreaterThan(1_000)
  expect(after.jump?.windUserMetersPerSecond).not.toBe(before.jump?.windUserMetersPerSecond)

  const cpu = cpus()[0]
  const report = {
    measuredAt: new Date().toISOString(),
    method: 'Playwright Chromium headed, requestAnimationFrame intervals, 60 s, Canvas2D 960x540, snow ON, live seeded wind',
    browserVersion: browser.version(),
    host: {
      platform: platform(),
      release: release(),
      cpu: cpu?.model ?? 'unknown',
      logicalCpuCount: cpus().length,
      speedMHz: cpu?.speed ?? null,
      totalMemoryBytes: totalmem(),
      freeMemoryBytesAtReport: freemem(),
    },
    browser: browserMetrics,
    scene: {
      canvas: 'Canvas2D 960x540',
      snowEnabled: after.jump?.snowEnabled ?? false,
      windStartMetersPerSecond: before.jump?.windUserMetersPerSecond ?? null,
      windEndMetersPerSecond: after.jump?.windUserMetersPerSecond ?? null,
      simulationTicks: (after.jump?.tick ?? 0) - (before.jump?.tick ?? 0),
    },
    longFrameDefinition: '> 50 ms requestAnimationFrame interval',
    releaseFrameBudget: RELEASE_FRAME_BUDGET,
  }
  writeFileSync(test.info().outputPath('benchmark.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  await page.screenshot({ path: test.info().outputPath('benchmark-scene-960x540.png') })
})
