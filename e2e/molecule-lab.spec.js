const { test, expect } = require("@playwright/test");

async function openLab(page) {
  await page.goto("/");
  await page.waitForFunction(
    () =>
      typeof window.pickProfile === "function" &&
      typeof window.openMoleculeLab === "function",
  );
  await page.evaluate(() => {
    window.pickProfile("max");
    window.openObservatory();
  });
  await page.locator(".obs-lab-btn", { hasText: "Molecule Lab" }).click();
  await expect(page.locator("#moleculeLabScreen")).toBeVisible();
  // первый заход показывает обучающий экран — закрываем его, чтобы добраться до полки
  const intro = page.getByRole("button", { name: /Let's brew/ });
  if (await intro.isVisible().catch(() => false)) await intro.click();
}

function element(page, name) {
  return page.locator("#mlShelf").getByRole("button", { name });
}

test.describe("Molecule Lab — atoms into molecules", () => {
  test("entry from the Observatory Chemistry row opens the lab", async ({
    page,
  }) => {
    await openLab(page);
    await expect(page.locator("#mlRank")).toContainText(
      "0 / 10 molecules discovered",
    );
  });

  test("correct stoichiometry forms a molecule, with XP and a fact", async ({
    page,
  }) => {
    await openLab(page);
    await element(page, "Hydrogen").click();
    await element(page, "Hydrogen").click();
    await element(page, "Oxygen").click();
    await page.locator("#mlReactBtn").click();

    const card = page.locator("#mlResultCard");
    await expect(card.locator(".pl-result-name")).toContainText("H₂O");
    await expect(card.locator(".pl-result-name")).toContainText("Water");
    await expect(card.locator(".pl-result-tag.new")).toContainText("+20 XP");

    await page.getByRole("button", { name: /Keep building/ }).click();
    await expect(page.locator("#mlRank")).toContainText(
      "1 / 10 molecules discovered",
    );
    await expect(page.locator("#mlBook .pl-potion.revealed")).toContainText("H₂O");
  });

  test("wrong amounts give a stoichiometry hint (1 H + 1 O is not water)", async ({
    page,
  }) => {
    await openLab(page);
    await element(page, "Hydrogen").click();
    await element(page, "Oxygen").click();
    await page.locator("#mlReactBtn").click();

    await expect(page.locator("#mlResultCard")).toContainText("So close");
    await expect(page.locator("#mlResultCard")).toContainText("H₂O");
    // ничего не открылось
    await page.getByRole("button", { name: /Got it/ }).click();
    await expect(page.locator("#mlRank")).toContainText(
      "0 / 10 molecules discovered",
    );
  });

  test("noble gases refuse to react", async ({ page }) => {
    await openLab(page);
    await element(page, "Helium").click();
    await element(page, "Helium").click();
    await page.locator("#mlReactBtn").click();
    await expect(page.locator("#mlResultCard")).toContainText("inert");
    await expect(page.locator("#mlResultCard")).toContainText("no bonds");
  });

  test("the intro teaches the bonding-arms rule (basics, not guesswork)", async ({
    page,
  }) => {
    await openLab(page); // helper dismisses the auto-intro
    await page.getByRole("button", { name: /How it works/ }).click();
    const card = page.locator("#mlResultCard");
    await expect(card).toContainText("bonds");
    await expect(card).toContainText("outer ring");
    await expect(card).toContainText("inert");
    await expect(card).toContainText("H₂O");
    await page.getByRole("button", { name: /Let's brew/ }).click();
    await expect(page.locator("#mlOverlay")).not.toHaveClass(/show/);
  });

  test("tapping the backdrop always closes the result — never trapped", async ({
    page,
  }) => {
    await openLab(page);
    await element(page, "Hydrogen").click();
    await element(page, "Hydrogen").click();
    await element(page, "Oxygen").click();
    await page.locator("#mlReactBtn").click();
    await expect(page.locator("#mlOverlay")).toHaveClass(/show/);

    // клик по фону (не по карточке) закрывает
    await page.locator("#mlOverlay").click({ position: { x: 6, y: 6 } });
    await expect(page.locator("#mlOverlay")).not.toHaveClass(/show/);
    await expect(page.locator("#moleculeLabScreen")).toBeVisible();
  });
});
