import { defineConfig } from "vitest/config";

// Юнит-тесты живут в tests/unit. E2E (Playwright) в e2e/ — их Vitest не трогает.
export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.js"],
    environment: "node",
  },
});
