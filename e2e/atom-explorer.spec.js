const { test, expect } = require("@playwright/test");

async function openExplorer(page) {
  await page.goto("/");
  await page.waitForFunction(
    () =>
      typeof window.pickProfile === "function" &&
      typeof window.openAtomExplorer === "function",
  );
  await page.evaluate(() => {
    window.pickProfile("max");
    window.openAtomExplorer();
  });
  await expect(page.locator("#atomExplorerScreen")).toBeVisible();
}

function atom(page, name) {
  return page.locator("#aeShelf").getByRole("button", { name });
}

test.describe("Atom Explorer", () => {
  test("a non-metal shows electrons in rings and derives its bonds", async ({
    page,
  }) => {
    await openExplorer(page);
    await atom(page, "Oxygen").click();

    const readout = page.locator("#aeReadout");
    await expect(readout).toContainText("#8");
    await expect(readout).toContainText("2, 6"); // shells
    await expect(readout).toContainText("2 bonds");
    await expect(readout).toContainText("non-metal");
    // diagram drew electrons
    await expect(page.locator("#aeDiagram svg")).toBeVisible();
  });

  test("a noble gas is shown as full and inert (word kept + explained)", async ({
    page,
  }) => {
    await openExplorer(page);
    await atom(page, "Neon").click();
    const readout = page.locator("#aeReadout");
    await expect(readout).toContainText("full");
    await expect(readout).toContainText("0 bonds");
    await expect(readout).toContainText("inert");
  });

  test("a metal is explained as giving electrons away", async ({ page }) => {
    await openExplorer(page);
    await atom(page, "Sodium").click();
    const readout = page.locator("#aeReadout");
    await expect(readout).toContainText("metal");
    await expect(readout).toContainText("give");
    await expect(readout).toContainText("1 bond");
  });

  test("reachable from the Molecule Lab", async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(
      () => typeof window.openMoleculeLab === "function",
    );
    await page.evaluate(() => {
      window.pickProfile("max");
      window.openMoleculeLab();
    });
    // dismiss the first-time intro if present
    const intro = page.getByRole("button", { name: /Let's brew/ });
    if (await intro.isVisible().catch(() => false)) await intro.click();
    await page.getByRole("button", { name: /How atoms work/ }).click();
    await expect(page.locator("#atomExplorerScreen")).toBeVisible();
  });
});
