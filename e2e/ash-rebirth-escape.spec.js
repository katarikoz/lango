// Regression: a kid in "ash" (rebirthPending) MUST have a visible escape button.
// The rebirth markup was missing, so startRebirthQuest had no caller — a save-state
// trap (the phoenix could never be relit). (Fixed 2026-06-26.)
const { test, expect } = require("@playwright/test");

async function boot(page) {
  await page.goto("/");
  await page.waitForFunction(
    () =>
      typeof window.pickProfile === "function" &&
      typeof window.progress === "function" &&
      typeof window.startRebirthQuest === "function",
  );
}

test("ash state shows a working 'Relight your phoenix' CTA", async ({ page }) => {
  await boot(page);
  await page.evaluate(() => {
    window.pickProfile("max");
    const p = window.progress();
    p.rebirthPending = true;
    window.saveProgress("max", p);
    window.refreshHomeStats();
  });
  const banner = page.locator("#rebirthBanner");
  await expect(banner).toBeVisible();
  await expect(banner.locator(".rebirth-btn")).toBeVisible();
  // The escape actually goes somewhere (no longer a dead end).
  await banner.locator(".rebirth-btn").click();
  await expect(page.locator("#homeScreen")).not.toBeVisible();
});

test("normal (non-ash) state hides the rebirth banner", async ({ page }) => {
  await boot(page);
  await page.evaluate(() => {
    window.pickProfile("max");
    const p = window.progress();
    p.rebirthPending = false;
    p.lastVisit = new Date().toLocaleDateString("en-CA");
    window.saveProgress("max", p);
    window.refreshHomeStats();
  });
  await expect(page.locator("#rebirthBanner")).toBeHidden();
});
