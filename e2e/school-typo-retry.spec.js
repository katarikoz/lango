// School Words: a single-letter typo earns ONE free "Fast! Schau nochmal" retry
// (growth-mindset, no penalty). A second miss is graded normally. Spelling/Test Prep
// stay strict — only daily recall is forgiving. (Added 2026-06-25.)
const { test, expect } = require("@playwright/test");

async function boot(page) {
  await page.goto("/");
  await page.waitForFunction(
    () => typeof window.pickProfile === "function" && typeof window.openTopic === "function",
  );
  await page.evaluate(() => { window.pickProfile("max"); window.openTopic("theme05"); });
  await expect(page.locator("#tpDotsContainer")).toBeVisible();
}

function currentEn(page) {
  return page.evaluate(() => {
    const de = document.getElementById("tpDe").textContent;
    for (const t of window.LANGO_THEMES)
      for (const w of t.words) if (w.de === de) return w.en;
    return null;
  });
}

async function typeWord(page, text) {
  const input = page.locator("#tpDotsContainer input.wd-hidden-input");
  await input.focus();
  for (let i = 0; i < 32; i++) await page.keyboard.press("Backspace"); // clear
  await input.pressSequentially(text.replace(/[^a-zA-Z]/g, "").toLowerCase(), { delay: 5 });
}

// Advance until the current word is a single, ≥4-letter, all-letters word (typo-eligible).
async function findEligibleWord(page) {
  for (let i = 0; i < 20; i++) {
    const en = await currentEn(page);
    if (en && /^[a-z]{4,}$/.test(en)) return en;
    await typeWord(page, en || "x"); // answer (best effort) and move on
    await page.locator("#tpCheckBtn").click();
    await page.locator("#tpCheckBtn").click(); // "Next"
  }
  throw new Error("no typo-eligible word found");
}

function typoOf(en) {
  const a = en.toLowerCase().split("");
  a[1] = a[1] === "x" ? "y" : "x"; // one substitution → Levenshtein 1
  return a.join("");
}

test("один-буквенная опечатка → бесплатный повтор, потом верно засчитывается", async ({ page }) => {
  await boot(page);
  const en = await findEligibleWord(page);

  await typeWord(page, typoOf(en));
  await page.locator("#tpCheckBtn").click();
  await expect(page.locator("#tpFeedback")).toContainText("Fast"); // retry, not red
  await expect(page.locator("#tpCheckBtn")).toHaveText("Check"); // still answering, not "Next"

  await typeWord(page, en);
  await page.locator("#tpCheckBtn").click();
  await expect(page.locator("#tpFeedback")).toContainText(/Right|Mastered/);
  await expect(page.locator("#tpCheckBtn")).toHaveText("Next");
});

test("вторая ошибка подряд засчитывается как неверно", async ({ page }) => {
  await boot(page);
  const en = await findEligibleWord(page);

  await typeWord(page, typoOf(en));
  await page.locator("#tpCheckBtn").click();
  await expect(page.locator("#tpFeedback")).toContainText("Fast");

  await typeWord(page, typoOf(en)); // same typo again → now graded
  await page.locator("#tpCheckBtn").click();
  await expect(page.locator("#tpFeedback")).toContainText(/Right answer|Almost/);
  await expect(page.locator("#tpCheckBtn")).toHaveText("Next");
});
