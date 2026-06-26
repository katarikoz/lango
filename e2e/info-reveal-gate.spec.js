// Регрессия: info-карточка с `reveal` НЕ должна показывать «Weiter», пока
// ребёнок не тапнул «Aufdecken». Так мы заставляем читать, а не проматывать.
// (Введено 2026-06-25 после того, как Алекс скипал длинные тексты.)
const { test, expect } = require("@playwright/test");
const { startTopic } = require("./helpers");

test("reveal-гейт: «Weiter» появляется только после тапа на «Aufdecken»", async ({
  page,
}) => {
  // Тестируем сам МЕХАНИЗМ reveal-gate, не привязываясь к конкретной карточке урока
  // (контент-карточки могут конвертироваться в «ставки»). Сеем временную info+reveal.
  await page.goto("/");
  await page.waitForFunction(
    () =>
      typeof window.openSubjectTopic === "function" &&
      typeof window.LANGO_SUBJECTS !== "undefined",
  );
  await page.evaluate(() => {
    const math = window.LANGO_SUBJECTS.find((s) => s.id === "math");
    math.topics.push({
      id: "temp-reveal-test", title: "Reveal-Test", short: "Reveal",
      grade: 6, status: "current", ordered: true,
      exercises: [
        { id: "tr-1", type: "info", title: "Test", text: "Was ist 1 %?",
          reveal: "1 % = 1/100.", revealLabel: "👀 Aufdecken" },
      ],
    });
    window.pickProfile("max");
    window.openSubjects();
    window.openSubject("math");
    window.openSubjectTopic("temp-reveal-test");
  });

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
