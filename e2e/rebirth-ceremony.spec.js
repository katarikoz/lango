// Signature "Ashes Remember": the rebirth quest is drawn from the kid's own
// mastered words; relighting all 10 ends in "Risen." and clears the ash.
const { test, expect } = require("@playwright/test");

async function boot(page) {
  await page.goto("/");
  await page.waitForFunction(
    () =>
      typeof window.pickProfile === "function" &&
      typeof window.startRebirthQuest === "function" &&
      typeof window.progress === "function",
  );
}

async function typeQuest(page, text) {
  const input = page.locator("#questDotsContainer input.wd-hidden-input");
  await input.focus();
  for (let i = 0; i < 32; i++) await page.keyboard.press("Backspace");
  await input.pressSequentially(text.replace(/[^a-zA-Z]/g, "").toLowerCase(), { delay: 4 });
}

test("relighting 10 mastered words rises the phoenix from ash", async ({ page }) => {
  await boot(page);
  await page.evaluate(() => {
    window.pickProfile("max");
    const p = window.progress();
    p.rebirthPending = true;
    p.rebornCount = 0;
    p.wordStatus = p.wordStatus || {};
    const theme = window.LANGO_THEMES.find((t) => t.id === "theme05");
    // mastered, simple single-token words → typeable into the dots
    theme.words
      .filter((w) => /^[a-zA-Z]{3,}$/.test(w.en))
      .slice(0, 14)
      .forEach((w) => {
        p.wordStatus[w.en] = {
          streak: 5, red: false, hits: 5, misses: 0, difficulty: 0,
          themeId: "theme05", history: "11111", totalHits: 5, totalMisses: 0,
        };
      });
    window.saveProgress("max", p);
    window.startRebirthQuest();
  });

  await expect(page.locator("#questPhoenix")).toBeVisible();

  for (let i = 0; i < 10; i++) {
    const en = await page.evaluate(() => {
      const de = document.getElementById("questDe").textContent;
      for (const t of window.LANGO_THEMES)
        for (const w of t.words) if (w.de === de) return w.en;
      return null;
    });
    await typeQuest(page, en);
    await page.locator("#questCheckBtn").click(); // check
    await page.locator("#questCheckBtn").click(); // next
  }

  await expect(page.locator("#questResultScreen")).toBeVisible();
  await expect(page.locator("#questResultTitle")).toContainText("Risen");
  const reborn = await page.evaluate(() => window.progress().rebornCount);
  expect(reborn).toBe(1);
  const stillAsh = await page.evaluate(() => window.progress().rebirthPending);
  expect(stillAsh).toBe(false);
});
