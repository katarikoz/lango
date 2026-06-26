// The new `match` card: tap a left chip then its partner; pairing IS the answer.
// Walks the prozent topic, pairs the match correctly, asserts it completes + no errors.
const { test, expect } = require("@playwright/test");
const { startTopic } = require("./helpers");

test("match card: pairing all tiles completes the card and the topic finishes", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await startTopic(page, { topic: "math-brueche-prozent" });

  let sawMatch = false;
  for (let step = 0; step < 80; step++) {
    const ex = await page.evaluate(() => {
      const e = window.currentExercise();
      return e ? { type: e.type, answer: e.answer, correctIndex: e.correctIndex } : null;
    });
    if (!ex) break;

    if (ex.type === "match") {
      sawMatch = true;
      const keys = await page.$$eval('.ex-match[data-side="L"]', (els) =>
        els.map((e) => e.dataset.key),
      );
      expect(keys.length).toBeGreaterThan(0);
      for (const k of keys) {
        await page.click(`.ex-match[data-side="L"][data-key="${k}"]`);
        await page.click(`.ex-match[data-side="R"][data-key="${k}"]`);
      }
      // all pairs locked → Weiter appears
      await expect(page.locator("#exNextBtn")).toBeVisible();
      await page.locator("#exNextBtn").click();
    } else if (ex.type === "info") {
      await page.evaluate(() => window.exAcknowledgeInfo());
    } else if (ex.type === "choice") {
      await page.evaluate((i) => window.exChooseOption(i), ex.correctIndex);
      await page.evaluate(() => window.advanceSubject());
    } else if (ex.type === "numeric") {
      await page.evaluate((a) => { document.getElementById("exNumInput").value = String(a); }, ex.answer);
      await page.evaluate(() => window.exCheckNumeric());
      await page.evaluate(() => window.advanceSubject());
    }
  }

  expect(sawMatch, "the prozent topic should contain a match card (cp-12)").toBe(true);
  expect(errors, "no JS errors").toEqual([]);
});
