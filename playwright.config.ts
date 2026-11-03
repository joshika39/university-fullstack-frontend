import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    channel: 'chromium',
    baseURL: 'http://127.0.0.1:4201',
  },
  webServer: {
    command: 'npm start -- --host 127.0.0.1 --port 4201',
    url: 'http://127.0.0.1:4201',
    reuseExistingServer: !process.env['CI'],
  },
});
