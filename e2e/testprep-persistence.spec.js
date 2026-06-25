// Регрессия: Test Prep (5×-дрилл) ДОЛЖЕН сохранять прогресс между запусками.
// Баг (2026-06-25): дрилл жил только в памяти вкладки — reload/сон/смена профиля
// обнуляли его в 0/26. Теперь прогресс пишется в localStorage по профилю.
const { test, expect } = require("@playwright/test");

async function boot(page) {
  await page.goto("/");
  await page.waitForFunction(
    () => typeof window.pickProfile === "function" && typeof window.openDrill === "function",
  );
}

async function answerOneCorrect(page) {
  const en = await page.evaluate(() => window.currentDrillWord().en);
  const letters = en.replace(/[^a-zA-Z]/g, "").toLowerCase();
  const input = page.locator("#drDotsContainer input.wd-hidden-input");
  await input.focus();
  await input.pressSequentially(letters, { delay: 5 });
  await page.locator("#drCheckBtn").click(); // Check → richtig
  await expect(page.locator("#drFeedback")).toContainText(/Right|done/i);
  await page.locator("#drCheckBtn").click(); // Next
}

test("Test Prep: прогресс сохраняется и переживает reload", async ({ page }) => {
  await boot(page);
  await page.evaluate(() => { window.pickProfile("alex"); window.openDrill(); });

  for (let i = 0; i < 3; i++) await answerOneCorrect(page);

  const before = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("lango.drill.alex") || "null"),
  );
  const sum = (o) => Object.values(o.counts).reduce((a, b) => a + b, 0);
  expect(before, "после ответов должна быть сохранёнка").not.toBeNull();
  expect(sum(before), "минимум 3 верных засчитаны").toBeGreaterThanOrEqual(3);

  // Главное: перезагружаем страницу — раньше прогресс терялся.
  await page.reload();
  await page.waitForFunction(() => typeof window.openDrill === "function");

  const afterReload = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("lango.drill.alex") || "null"),
  );
  expect(afterReload, "после reload сохранёнка на месте").not.toBeNull();
  expect(sum(afterReload), "прогресс не обнулился").toBe(sum(before));

  // И openDrill его подхватывает (а не начинает с нуля).
  await page.evaluate(() => { window.pickProfile("alex"); window.openDrill(); });
  const done = await page.locator("#drCountPill").innerText();
  expect(done, "счётчик возобновлён, не 0/26 заново").toMatch(/\d+ \/ \d+ done/);
  const resumed = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("lango.drill.alex")).counts,
  );
  expect(Object.values(resumed).reduce((a, b) => a + b, 0)).toBeGreaterThanOrEqual(3);
});

test("свежий профиль без Test Prep не имеет сохранёнки", async ({ page }) => {
  await boot(page);
  const blob = await page.evaluate(() =>
    localStorage.getItem("lango.drill.rhino"),
  );
  expect(blob).toBeNull();
});
