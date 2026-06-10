// @ts-check
const { defineConfig, devices } = require("@playwright/test");

/**
 * E2E грузит реальный index.html через тот же статический сервер,
 * что и в обычной разработке (http-server на :5555).
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
    baseURL: "http://localhost:5599",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  // Отдельный порт для тестов и НЕ переиспользуем чужой сервер: на 5555 может
  // висеть другое приложение. Playwright поднимает наш index.html сам.
  webServer: {
    command: "npx http-server -p 5599 -c-1 --silent",
    url: "http://localhost:5599",
    reuseExistingServer: false,
    timeout: 20_000,
  },
});
