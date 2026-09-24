import { defineConfig } from '@playwright/test'

// Fixture składa renderer w pamięci; nie korzysta z serwera ani produkcyjnego dist.
export default defineConfig({
  testDir: '.', testMatch: 'z_capture_pkg008_r16.spec.ts', workers: 1,
  reporter: 'list', outputDir: '../../test-results-r16-visual',
  use: { video: 'off', trace: 'retain-on-failure' },
})
