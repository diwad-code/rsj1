import { expect, test } from '@playwright/test'

test.use({ video: 'on' })

test('krótki zapis tytułu i wejścia do menu', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('#game-canvas')).toHaveAttribute('aria-label', /ekran tytułowy/)
  await page.keyboard.press('Enter')
  await expect.poll(() => page.evaluate(() => (
    window as unknown as { __retroDebugSnapshot: () => { screen: string } }
  ).__retroDebugSnapshot().screen)).toBe('menu')
  await page.waitForTimeout(350)
})
