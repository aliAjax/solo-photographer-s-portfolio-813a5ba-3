import { defineConfig } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

// 被测应用目录探测（无额外临时配置即可从干净目录运行）：
//   1. 环境变量 APP_DIR
//   2. ../starter（任务包标准布局）
//   3. ../sota-submission（annotator 本地复核布局）
//   4. ..（应用与 tests 位于同一仓库根，即本仓库布局）
const candidates = [
  process.env.APP_DIR,
  path.resolve(process.cwd(), '..', 'starter'),
  path.resolve(process.cwd(), '..', 'sota-submission'),
  path.resolve(process.cwd(), '..'),
].filter((p): p is string => Boolean(p))

const APP_DIR = candidates.find((p) => fs.existsSync(path.join(p, 'package.json')))
if (!APP_DIR) {
  throw new Error('无法定位被测应用目录：请通过 APP_DIR 环境变量指定，或将 tests/ 放在应用同级目录。')
}

// 专用端口 + strictPort：绝不依赖已经打开的端口，冲突时直接失败而非静默复用
const PORT = Number(process.env.PORT ?? 4181)
const BASE_URL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `npm run dev -- --port ${PORT} --host 127.0.0.1 --strictPort`,
    cwd: APP_DIR,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 90_000,
  },
})
