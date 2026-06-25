// Регрессия: info-карточка с `reveal` НЕ должна показывать «Weiter», пока
// ребёнок не тапнул «Aufdecken». Так мы заставляем читать, а не проматывать.
// (Введено 2026-06-25 после того, как Алекс скипал длинные тексты.)
const { test, expect } = require("@playwright/test");
const { startTopic } = require("./helpers");

test("reveal-гейт: «Weiter» появляется только после тапа на «Aufdecken»", async ({
  page,
}) => {
  // Первая карточка темы «Brüche & Prozent» (cp-01) — info с reveal.
  await startTopic(page, { topic: "math-brueche-prozent" });

  // До тапа: есть кнопка раскрытия, скрытый reveal-текст, «Weiter» спрятан.
  await expect(page.locator("#exRevealBtn")).toBeVisible();
  await expect(page.locator("#exInfoReveal")).toBeHidden();
  await expect(page.locator("#exInfoNext")).toBeHidden();

  // Тап → reveal-текст и «Weiter» появляются, кнопка раскрытия исчезает.
  await page.locator("#exRevealBtn").click();
  await expect(page.locator("#exInfoReveal")).toBeVisible();
  await expect(page.locator("#exInfoNext")).toBeVisible();
  await expect(page.locator("#exRevealBtn")).toBeHidden();
});

test("обычная info без reveal показывает «Weiter» сразу", async ({ page }) => {
  // Тема «Grundlagen» начинается с обычной info-карточки (fg-01).
  await startTopic(page, { topic: "math-brueche-grundlagen" });
  await expect(
    page.getByRole("button", { name: /Verstanden/ }),
  ).toBeVisible();
  await expect(page.locator("#exRevealBtn")).toHaveCount(0);
});
