import { defineConfig } from '@playwright/test'

const port = Number(process.env.SMOKE_TEST_PORT || 4180)
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results',
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    browserName: 'chromium',
    channel: 'chrome',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: `npm run server -- --port ${port} --ip 127.0.0.1`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
})
