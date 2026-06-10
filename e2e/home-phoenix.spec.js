/* global pickProfile, progress, saveProgress, state, refreshHomeStats */
const { test, expect } = require("@playwright/test");

// P0 regression: the phoenix state must come from ONE source. While a rebirth is
// pending the phoenix is "ash" everywhere — energy, banner, artwork, and CTAs can
// never disagree (the screenshot bug: "Burning bright" + "ashes" + "Hatching Quest").

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
  test("rebirth pending → ash everywhere, no competing evolution CTA", async ({
    page,
  }) => {
    await setHome(page, true);

    await expect(page.locator("#rebirthBanner")).toBeVisible();
    await expect(page.locator("#psEnergy")).toHaveText("Empty");
    await expect(page.locator("#psEnergyHint")).toHaveText("Needs rebirth");
    await expect(page.locator("#questCTA")).toBeHidden(); // one primary action
    const cls = await page.locator(".hero-phoenix").getAttribute("class");
    expect(cls).toContain("phoenix-ash");
  });

  test("active (visited today, no rebirth) → burning bright, no ashes banner", async ({
    page,
  }) => {
    await setHome(page, false);

    await expect(page.locator("#rebirthBanner")).toBeHidden();
    await expect(page.locator("#psEnergy")).toHaveText("High");
    await expect(page.locator("#psEnergyHint")).toHaveText("Burning bright");
    const cls = await page.locator(".hero-phoenix").getAttribute("class");
    expect(cls).toContain("phoenix-active");
  });
});
