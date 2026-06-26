// The daily flame (#7): mastering words today fills a closeable daily goal on home.
// Counts at the single shared bumpCorrect site; resets per local day. (Added 2026-06-26.)
const { test, expect } = require("@playwright/test");

async function boot(page) {
  await page.goto("/");
  await page.waitForFunction(
    () =>
      typeof window.pickProfile === "function" &&
      typeof window.bumpCorrect === "function" &&
      typeof window.progress === "function",
  );
}

test("correct answers feed today's flame; home shows the count", async ({ page }) => {
  await boot(page);
  await page.evaluate(() => {
    window.pickProfile("max");
    const p = window.progress();
    p.daily = { date: null, count: 0, goal: 15 };
    window.saveProgress("max", p);
    window.bumpCorrect("flametest1", "theme05");
    window.bumpCorrect("flametest2", "theme05");
    window.bumpCorrect("flametest3", "theme05");
    window.refreshHomeStats();
  });
  await expect(page.locator("#dailyFlameCount")).toHaveText("3 / 15");
  await expect(page.locator("#dailyFlameLabel")).toHaveText("Feed the flame");
});

test("reaching the goal shows the 'done' state", async ({ page }) => {
  await boot(page);
  await page.evaluate(() => {
    window.pickProfile("max");
    const p = window.progress();
    p.daily = { date: new Date().toLocaleDateString("en-CA"), count: 15, goal: 15 };
    window.saveProgress("max", p);
    window.refreshHomeStats();
  });
  await expect(page.locator("#dailyFlame")).toHaveClass(/done/);
  await expect(page.locator("#dailyFlameLabel")).toHaveText("Flame fed for today");
});
