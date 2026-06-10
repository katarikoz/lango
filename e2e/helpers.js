const { expect } = require("@playwright/test");

/**
 * Грузит приложение и заходит в конкретную тему предмета, вызывая собственные
 * навигационные функции приложения (надёжнее, чем кликать через все экраны).
 */
async function startTopic(page, { profile = "max", subject = "math", topic }) {
  await page.goto("/");
  await page.waitForFunction(
    () =>
      typeof window.pickProfile === "function" &&
      typeof window.openSubject === "function" &&
      typeof window.openSubjectTopic === "function",
  );
  await page.evaluate(
    ({ profile, subject, topic }) => {
      window.pickProfile(profile);
      window.openSubjects();
      window.openSubject(subject);
      window.openSubjectTopic(topic);
    },
    { profile, subject, topic },
  );
  await expect(page.locator("#subjectRunnerScreen")).toBeVisible();
}

/**
 * Прокликивает info- и choice-карточки, пока не дойдёт до числового
 * упражнения (поле #exNumInput). Бросает, если не дошёл за maxSteps шагов.
 */
async function advanceToNumeric(page, maxSteps = 25) {
  for (let i = 0; i < maxSteps; i++) {
    if (await page.locator("#exNumInput").isVisible()) return;

    const verstanden = page.getByRole("button", { name: /Verstanden/ });
    if (await verstanden.isVisible()) {
      await verstanden.click();
      continue;
    }

    const option = page.locator(".ex-option").first();
    if (await option.isVisible()) {
      await option.click();
      const next = page.locator("#exNextBtn");
      await next.waitFor({ state: "visible" });
      await next.click();
      continue;
    }

    await page.waitForTimeout(50);
  }
  throw new Error("Не дошёл до числового упражнения (#exNumInput)");
}

module.exports = { startTopic, advanceToNumeric };
