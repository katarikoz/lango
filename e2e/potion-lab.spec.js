const { test, expect } = require("@playwright/test");

async function openLab(page) {
  await page.goto("/");
  await page.waitForFunction(
    () =>
      typeof window.pickProfile === "function" &&
      typeof window.openObservatory === "function",
  );
  await page.evaluate(() => {
    window.pickProfile("alex");
    window.openObservatory();
  });
  await page.locator(".obs-lab-btn").click(); // real entry from the Alchemy row
  await expect(page.locator("#potionLabScreen")).toBeVisible();
}

function ingredient(page, name) {
  return page.locator("#plShelf").getByRole("button", { name });
}

test.describe("Potion Lab", () => {
  test("entry button leads from the Observatory into the workshop", async ({
    page,
  }) => {
    await openLab(page);
    await expect(page.locator("#plRank")).toContainText("0 / 7 potions brewed");
  });

  test("brewing a real recipe shows the magical result, XP and the hidden secret", async ({
    page,
  }) => {
    await openLab(page);

    await ingredient(page, "Dragon Powder").click();
    await ingredient(page, "Serpent's Sting").click();
    await expect(page.locator("#plBrewBtn")).toBeEnabled();
    await page.locator("#plBrewBtn").click();

    const card = page.locator("#plResultCard");
    await expect(card).toBeVisible();
    await expect(card.locator(".pl-result-name")).toHaveText(
      "Potion of Roaring Fury",
    );
    await expect(card.locator(".pl-result-tag.new")).toContainText("+15 XP");

    // секрет скрыт, пока не нажали "Reveal the Secret"
    await expect(card.locator("#plSecret")).toBeHidden();
    await card.locator("#plSecretBtn").click();
    await expect(card.locator("#plSecret")).toBeVisible();
    await expect(card.locator("#plSecret")).toContainText("carbon dioxide");
    await expect(card.locator("#plSecret")).toContainText("Bubbling Potion of Fury");

    // закрываем — рецепт записан в книгу заклинаний
    await page.getByRole("button", { name: /Brew again/ }).click();
    await expect(page.locator("#plRank")).toContainText("1 / 7 potions brewed");
    await expect(page.locator("#plSpellbook .pl-potion.revealed")).toHaveCount(1);
    await expect(
      page.locator("#plSpellbook .pl-potion.revealed"),
    ).toContainText("Potion of Roaring Fury");
  });

  test("a non-recipe mix fizzles gently instead of breaking", async ({
    page,
  }) => {
    await openLab(page);

    await ingredient(page, "Dragon Powder").click();
    await ingredient(page, "Moonwell Water").click();
    await page.locator("#plBrewBtn").click();

    await expect(page.locator("#plResultCard")).toContainText(
      "The cauldron sputters",
    );
    // ничего не записалось в книгу
    await page.getByRole("button", { name: /Try again/ }).click();
    await expect(page.locator("#plRank")).toContainText("0 / 7 potions brewed");
  });
});
