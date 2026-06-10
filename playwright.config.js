// @ts-check
const { defineConfig, devices } = require("@playwright/test");

/**
 * E2E грузит реальный index.html через тот же статический сервер,
 * что и в обычной разработке: наш канонический порт — 9999 (`npm run serve`).
 */
module.exports = defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:9999",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  // 9999 — наш закреплённый порт. Локально переиспользуем уже запущенный
  // `npm run serve`; в CI всегда поднимаем свежий сервер сами.
  webServer: {
    command: "npx http-server -p 9999 -c-1 --silent",
    url: "http://localhost:9999",
    reuseExistingServer: !process.env.CI,
    timeout: 20_000,
  },
});
