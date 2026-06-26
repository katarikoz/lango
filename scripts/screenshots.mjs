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
  { name: "02b-home-ash", go: () => { window.pickProfile("max"); const p = window.progress(); p.rebirthPending = true; p.lastVisit = new Date().toISOString().slice(0, 10); window.saveProgress("max", p); window.refreshHomeStats(); } },
  { name: "03-math-fractions", go: () => { window.pickProfile("max"); window.openSubjects(); window.openSubject("math"); window.openSubjectTopic("math-brueche-grundlagen"); } },
  { name: "04-observatory", go: () => { window.pickProfile("alex"); window.openObservatory(); } },
  { name: "05-potion-lab", go: () => { window.pickProfile("alex"); window.openPotionLab(); } },
  { name: "06-potion-result", go: () => { window.pickProfile("alex"); window.openPotionLab(); window.potionPick("soda"); window.potionPick("lemon"); window.potionBrew(); window.potionRevealSecret(); } },
  { name: "07-molecule-lab", go: () => { window.pickProfile("max"); window.openMoleculeLab(); window.closeMolResult(); window.molAddAtom("H"); window.molAddAtom("H"); window.molAddAtom("O"); } },
  { name: "08-molecule-result", go: () => { window.pickProfile("max"); window.openMoleculeLab(); window.closeMolResult(); window.molAddAtom("H"); window.molAddAtom("H"); window.molAddAtom("O"); window.molReact(); } },
  { name: "09-molecule-intro", go: () => { window.pickProfile("max"); window.openMoleculeLab(); window.molShowIntro(); } },
  { name: "10-atom-oxygen", go: () => { window.pickProfile("max"); window.openAtomExplorer(); window.atomSelect("O"); } },
  { name: "11-atom-sodium", go: () => { window.pickProfile("max"); window.openAtomExplorer(); window.atomSelect("Na"); } },
  { name: "12-workshop", go: () => { window.pickProfile("alex"); window.openWorkshop(); window.inventPick("beam"); window.inventPick("block"); } },
  { name: "13-workshop-result", go: () => { window.pickProfile("alex"); window.openWorkshop(); window.inventPick("beam"); window.inventPick("block"); window.inventBuild(); window.inventRevealSecret(); } },
  { name: "14-testprep", go: () => { window.pickProfile("max"); window.openDrill(); } },
  { name: "15-testprep-copy", go: () => { window.pickProfile("max"); window.openDrill(); window.enterDrillRewrite(window.currentDrillWord()); } },
  { name: "16-brueche-verstehen", go: () => { window.pickProfile("max"); window.openSubjects(); window.openSubject("math"); window.openSubjectTopic("math-brueche-verstehen"); } },
  { name: "17-brueche-profi", go: () => { window.pickProfile("max"); window.openSubjects(); window.openSubject("math"); window.openSubjectTopic("math-brueche-profi"); } },
  { name: "18-brueche-prozent", go: () => { window.pickProfile("max"); window.openSubjects(); window.openSubject("math"); window.openSubjectTopic("math-brueche-prozent"); window.advanceSubject(); window.advanceSubject(); window.advanceSubject(); } },
  { name: "19-brueche-anteile", go: () => { window.pickProfile("max"); window.openSubjects(); window.openSubject("math"); window.openSubjectTopic("math-brueche-anteile"); } },
  { name: "20-school-card", go: () => { window.pickProfile("max"); window.openTopic("theme05"); } },
  { name: "21-rebirth-quest", go: () => { window.pickProfile("max"); const p = window.progress(); p.rebirthPending = true; p.wordStatus = p.wordStatus || {}; const th = window.LANGO_THEMES.find(t => t.id === "theme05"); th.words.slice(0, 12).forEach(w => { p.wordStatus[w.en] = { streak: 5, red: false, hits: 5, misses: 0, difficulty: 0, themeId: "theme05", history: "11111" }; }); window.saveProgress("max", p); window.startRebirthQuest(); } },
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
