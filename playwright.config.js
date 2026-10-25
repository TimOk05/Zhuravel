const { defineConfig } = require('@playwright/test');
const os = require('node:os');
const path = require('node:path');

module.exports = defineConfig({
  testDir: './tests',
  outputDir: path.join(os.tmpdir(), 'zhuravel-playwright-results'),
  fullyParallel: true,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4177',
    browserName: 'chromium',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:4177',
    reuseExistingServer: true,
    timeout: 30_000
  }
});
