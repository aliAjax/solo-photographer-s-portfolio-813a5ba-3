import { defineConfig } from '@playwright/test'

// 本地复核用配置：指向根目录的最终实现（默认配置指向 ../sota-submission）
const APP_DIR = '/workspace'
const PORT = 5173
const BASE_URL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    viewport: { width: 1440, height: 1000 },
  },
  webServer: {
    command: `npm run dev -- --port ${PORT} --host 127.0.0.1`,
    cwd: APP_DIR,
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
