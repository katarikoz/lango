/* global pickProfile, progress, saveProgress, state, refreshHomeStats */
const { test, expect } = require("@playwright/test");

// P0 regression: the phoenix state comes from ONE source (rebirthPending forces
// "ash"). The visible phoenix status elements were removed for now, but the
// canonical state still drives the artwork — that's what we lock here.

async function setHome(page, rebirth) {
  await page.goto("/");
  await page.waitForFunction(
    () =>
      typeof pickProfile === "function" && typeof refreshHomeStats === "function",
  );
  await page.evaluate((rebirth) => {
    pickProfile("max");
    const p = progress();
    p.lastVisit = new Date().toISOString().slice(0, 10); // visited today
    p.rebirthPending = rebirth;
    saveProgress(state.profile, p);
    refreshHomeStats();
  }, rebirth);
}

test.describe("Home dashboard — single phoenix state (P0)", () => {
  test("rebirth pending → phoenix renders as ash (one canonical state)", async ({
    page,
  }) => {
    await setHome(page, true);
    const cls = await page.locator(".hero-phoenix").getAttribute("class");
    expect(cls).toContain("phoenix-ash");
  });

  test("active (visited today, no rebirth) → phoenix renders active", async ({
    page,
  }) => {
    await setHome(page, false);
    const cls = await page.locator(".hero-phoenix").getAttribute("class");
    expect(cls).toContain("phoenix-active");
  });
});
