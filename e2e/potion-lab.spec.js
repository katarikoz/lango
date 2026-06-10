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

function shelf(page, name) {
  return page.locator("#plShelf").getByRole("button", { name });
}

async function combine(page, a, b) {
  await shelf(page, a).click();
  await shelf(page, b).click();
  await expect(page.locator("#plBrewBtn")).toBeEnabled();
  await page.locator("#plBrewBtn").click();
}

test.describe("Potion Lab — crafting tree", () => {
  test("entry from the Observatory opens the lab", async ({ page }) => {
    await openLab(page);
    await expect(page.locator("#plRank")).toContainText("0 / 10 potions brewed");
  });

  test("combining a real reaction brews a potion with XP and the hidden secret", async ({
    page,
  }) => {
    await openLab(page);
    await combine(page, "Dragon Powder", "Sunfruit"); // soda + lemon → Potion of Flight

    const card = page.locator("#plResultCard");
    await expect(card.locator(".pl-result-name")).toHaveText("Potion of Flight");
    await expect(card.locator(".pl-result-tag.new")).toContainText("+20 XP");

    await expect(card.locator("#plSecret")).toBeHidden();
    await card.locator("#plSecretBtn").click();
    await expect(card.locator("#plSecret")).toContainText("carbon-dioxide");

    await page.getByRole("button", { name: /Keep brewing/ }).click();
    await expect(page.locator("#plRank")).toContainText("1 / 10 potions brewed");
    await expect(
      page.locator("#plSpellbook .pl-potion.revealed"),
    ).toContainText("Potion of Flight");
  });

  test("crafting an intermediate adds it to the shelf for deeper combos (Sand+Fire→Glass→Invisibility)", async ({
    page,
  }) => {
    await openLab(page);

    // step 1: craft the intermediate
    await combine(page, "Quartz Sand", "Dragonfire");
    await expect(page.locator("#plResultCard .pl-result-name")).toHaveText(
      "Enchanted Glass",
    );
    await page.getByRole("button", { name: /Keep brewing/ }).click();

    // the new intermediate is now on the shelf
    await expect(shelf(page, "Enchanted Glass")).toBeVisible();

    // step 2: use it to reach the Invisibility potion
    await combine(page, "Enchanted Glass", "Basilisk Oil");
    await expect(page.locator("#plResultCard .pl-result-name")).toHaveText(
      "Potion of Invisibility",
    );
  });

  test("a non-reacting mix fizzles gently and brews nothing", async ({
    page,
  }) => {
    await openLab(page);
    await combine(page, "Dragon Powder", "Witch's Salt"); // no such reaction
    await expect(page.locator("#plResultCard")).toContainText(
      "The cauldron sputters",
    );
    await page.getByRole("button", { name: /Try again/ }).click();
    await expect(page.locator("#plRank")).toContainText("0 / 10 potions brewed");
  });
});
