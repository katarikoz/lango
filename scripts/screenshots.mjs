/*
 * Скриншоты ключевых экранов на телефоне и десктопе.
 * Назначение: смотреть на PNG глазами перед тем, как считать экран готовым —
 * это ловит то, что тесты и линт не видят (тесная вёрстка, обрезка, контраст).
 *
 * Запуск: npm run screenshots  (PNG → screenshots/, не коммитятся)
 */
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const BASE = "http://localhost:9999";
const OUT = fileURLToPath(new URL("../screenshots/", import.meta.url));
mkdirSync(OUT, { recursive: true });

const DEVICES = [
  { name: "phone", width: 390, height: 844 },
  { name: "desktop", width: 1280, height: 900 },
];

// Экран → как до него добраться (через собственные функции приложения).
// go() выполняется в браузере через page.evaluate — зовём через window.*
const SCREENS = [
  { name: "01-profiles", go: () => {} },
  { name: "02-home", go: () => { window.pickProfile("max"); } },
  { name: "03-math-fractions", go: () => { window.pickProfile("max"); window.openSubjects(); window.openSubject("math"); window.openSubjectTopic("math-brueche-grundlagen"); } },
  { name: "04-observatory", go: () => { window.pickProfile("alex"); window.openObservatory(); } },
  { name: "05-potion-lab", go: () => { window.pickProfile("alex"); window.openPotionLab(); } },
  { name: "06-potion-result", go: () => { window.pickProfile("alex"); window.openPotionLab(); window.potionPick("soda"); window.potionPick("lemon"); window.potionBrew(); window.potionRevealSecret(); } },
  { name: "07-molecule-lab", go: () => { window.pickProfile("max"); window.openMoleculeLab(); window.molAddAtom("H"); window.molAddAtom("H"); window.molAddAtom("O"); } },
  { name: "08-molecule-result", go: () => { window.pickProfile("max"); window.openMoleculeLab(); window.molAddAtom("H"); window.molAddAtom("H"); window.molAddAtom("O"); window.molReact(); } },
];

async function serverUp() {
  try {
    const r = await fetch(BASE + "/index.html");
    return r.ok;
  } catch {
    return false;
  }
}

async function main() {
  let server = null;
  if (!(await serverUp())) {
    server = spawn("npx", ["http-server", "-p", "9999", "-c-1", "--silent"], {
      stdio: "ignore",
    });
    for (let i = 0; i < 40 && !(await serverUp()); i++) await sleep(250);
  }

  const browser = await chromium.launch();
  const saved = [];
  try {
    for (const device of DEVICES) {
      const page = await browser.newPage({
        viewport: { width: device.width, height: device.height },
      });
      for (const screen of SCREENS) {
        await page.goto(BASE + "/", { waitUntil: "load" });
        await page.waitForFunction(() => typeof window.pickProfile === "function");
        await page.evaluate(screen.go);
        await sleep(450); // дать анимациям/рендеру осесть
        const file = join(OUT, `${screen.name}-${device.name}.png`);
        await page.screenshot({ path: file, fullPage: true });
        saved.push(file);
      }
      await page.close();
    }
  } finally {
    await browser.close();
    if (server) server.kill();
  }

  console.log("Сохранено " + saved.length + " скриншотов:");
  saved.forEach((p) => console.log("  " + p));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
