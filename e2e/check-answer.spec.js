const { test, expect } = require("@playwright/test");
const { startTopic, advanceToNumeric } = require("./helpers");

// Регрессии на класс бага «кнопка Prüfen ничего не делает» в темах дробей.
// До фикса: непарсимый ввод приводил к молчаливому return (мёртвая кнопка),
// а parseFloat("3/8") давал 3 (тихий неверный результат).
test.describe("Математика · дроби · проверка ответа", () => {
  const TOPIC = "math-brueche-grundlagen";

  test("Prüfen всегда отвечает: непонятный ввод даёт подсказку, а не мёртвую кнопку", async ({
    page,
  }) => {
    await startTopic(page, { topic: TOPIC });
    await advanceToNumeric(page);

    await page.locator("#exNumInput").fill("abc");
    await page.locator("#exCheckBtn").click();

    // До фикса фидбэк оставался пустым (return по NaN) — тест бы упал здесь.
    await expect(page.locator("#exFeedback")).toContainText("Bitte gib");
  });

  test("Верный числовой ответ показывает позитивный фидбэк", async ({
    page,
  }) => {
    await startTopic(page, { topic: TOPIC });
    await advanceToNumeric(page);

    const answer = await page.evaluate(() => window.currentExercise().answer);
    await page.locator("#exNumInput").fill(String(answer));
    await page.locator("#exCheckBtn").click();

    await expect(page.locator("#exFeedback")).toContainText("Richtig");
  });

  test("Дробь, эквивалентная целому ответу, засчитывается (а не режется parseFloat)", async ({
    page,
  }) => {
    await startTopic(page, { topic: TOPIC });
    await advanceToNumeric(page);

    const answer = await page.evaluate(() => window.currentExercise().answer);
    // Эквивалентная дробь: (2·answer)/2. Новый парсер → answer (верно).
    // Старый parseFloat("16/2") → 16 (неверно) — тест бы упал.
    const equivalentFraction = `${2 * Number(answer)}/2`;
    await page.locator("#exNumInput").fill(equivalentFraction);
    await page.locator("#exCheckBtn").click();

    await expect(page.locator("#exFeedback")).toContainText("Richtig");
  });
});
