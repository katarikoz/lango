const { test, expect } = require("@playwright/test");

async function openWorkshop(page) {
  await page.goto("/");
  await page.waitForFunction(
    () =>
      typeof window.pickProfile === "function" &&
      typeof window.openWorkshop === "function",
  );
  await page.evaluate(() => {
    window.pickProfile("alex");
    window.openObservatory();
  });
  await page.locator(".obs-lab-btn", { hasText: "Workshop" }).click();
  await expect(page.locator("#workshopScreen")).toBeVisible();
}

function part(page, name) {
  return page.locator("#wsShelf").getByRole("button", { name });
}

async function build(page, a, b) {
  await part(page, a).click();
  await part(page, b).click();
  await expect(page.locator("#wsBuildBtn")).toBeEnabled();
  await page.locator("#wsBuildBtn").click();
}

test.describe("Inventor's Workshop", () => {
  test("entry from the Observatory Engineering row", async ({ page }) => {
    await openWorkshop(page);
    await expect(page.locator("#wsRank")).toContainText("0 / 7 machines built");
  });

  test("a simple machine builds and explains how it works", async ({
    page,
  }) => {
    await openWorkshop(page);
    await build(page, "Beam", "Block"); // → Lever

    const card = page.locator("#wsResultCard");
    await expect(card.locator(".pl-result-name")).toHaveText("Lever");
    await card.locator("#wsSecretBtn").click();
    await expect(card.locator("#wsSecret")).toContainText("multiplies your force");
    await page.getByRole("button", { name: /Keep building/ }).click();

    // the crafted part is now on the bench
    await expect(part(page, "Lever")).toBeVisible();
  });

  test("two identical parts combine (Gear + Gear → Gear Train)", async ({
    page,
  }) => {
    await openWorkshop(page);
    await part(page, "Gear").click();
    await part(page, "Gear").click(); // duplicates allowed
    await page.locator("#wsBuildBtn").click();
    await expect(page.locator("#wsResultCard .pl-result-name")).toHaveText(
      "Gear Train",
    );
  });

  test("a machine counts toward the collection and XP", async ({ page }) => {
    await openWorkshop(page);
    await build(page, "Rope", "Rod"); // → Windlass (a machine)
    const card = page.locator("#wsResultCard");
    await expect(card.locator(".pl-result-name")).toHaveText("Windlass");
    await expect(card.locator(".pl-result-tag.new")).toContainText("+20 XP");
    await page.getByRole("button", { name: /Keep building/ }).click();
    await expect(page.locator("#wsRank")).toContainText("1 / 7 machines built");
  });

  test("a bad pair fizzles and the result is always dismissable", async ({
    page,
  }) => {
    await openWorkshop(page);
    await build(page, "Gear", "Rope"); // no such machine
    await expect(page.locator("#wsResultCard")).toContainText(
      "don't fit",
    );
    // backdrop closes it — never trapped
    await page.locator("#wsOverlay").click({ position: { x: 6, y: 6 } });
    await expect(page.locator("#wsOverlay")).not.toHaveClass(/show/);
  });
});
