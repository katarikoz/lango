/*
 * Лёгкий линтер для index.html (инлайн-JS строгим ESLint не покрываем — шумно).
 * Делает две вещи, прицельно под наш класс багов:
 *   1) парс-проверка каждого инлайн-<script> (синтаксические ошибки = мёртвая страница);
 *   2) проверка инлайн-обработчиков: каждый on*="fn(...)" должен ссылаться на
 *      ОПРЕДЕЛЁННУЮ функцию (опечатка в имени обработчика убивает кнопку).
 * Выход !=0 при любой проблеме — годится для pre-commit и CI.
 */
import { readFileSync } from "node:fs";

const FILE = "index.html";
const html = readFileSync(new URL("../" + FILE, import.meta.url), "utf8");

let problems = 0;
const fail = (msg) => {
  problems++;
  console.error("✗ " + msg);
};

// --- собрать инлайн-скрипты ---
const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const inlineScripts = [];
let m;
while ((m = scriptRe.exec(html))) {
  if (/\bsrc\s*=/.test(m[1])) continue; // внешние пропускаем
  inlineScripts.push(m[2]);
}

// --- 1) парс-проверка ---
inlineScripts.forEach((code, i) => {
  try {
    new Function(code);
  } catch (e) {
    fail(`инлайн-скрипт #${i + 1}: синтаксическая ошибка — ${e.message}`);
  }
});

// --- собрать определённые имена (функции/глобали) из всех инлайн-скриптов + src/pure.js ---
const allCode =
  inlineScripts.join("\n") +
  "\n" +
  readFileSync(new URL("../src/pure.js", import.meta.url), "utf8");

const defined = new Set();
const addAll = (re) => {
  let mm;
  while ((mm = re.exec(allCode))) defined.add(mm[1]);
};
addAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g);
addAll(
  /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function\b|\([^)]*\)\s*=>|[A-Za-z_$][\w$]*\s*=>)/g,
);
addAll(/\b([A-Za-z_$][\w$]*)\s*[:=]\s*(?:async\s*)?function\b/g);
addAll(/(?:window|globalThis|root)\.([A-Za-z_$][\w$]*)\s*=/g);

// встроенные/браузерные глобали, которые можно звать из обработчика
const BUILTINS = new Set([
  "event","window","document","console","alert","confirm","prompt","setTimeout",
  "setInterval","clearTimeout","clearInterval","parseInt","parseFloat","isNaN",
  "Math","JSON","Number","String","Boolean","Array","Object","Date","RegExp",
  "location","navigator","localStorage","sessionStorage","history","fetch",
  "requestAnimationFrame","encodeURIComponent","decodeURIComponent","this",
  "return","if","for","while","switch","typeof","void","new","delete","await",
  "true","false","null","undefined","function","lucide",
]);

// --- 2) проверка инлайн-обработчиков ---
const handlerRe = /\son[a-z]+\s*=\s*"([^"]*)"/gi;
const callRe = /(?<![.\w$])([A-Za-z_$][\w$]*)\s*\(/g;
let handlerCount = 0;
while ((m = handlerRe.exec(html))) {
  const body = m[1];
  let c;
  while ((c = callRe.exec(body))) {
    const name = c[1];
    handlerCount++;
    if (!defined.has(name) && !BUILTINS.has(name)) {
      fail(`обработчик ссылается на неопределённую функцию: ${name}(...)  →  ${m[0].slice(0, 70)}`);
    }
  }
}

if (problems === 0) {
  console.log(
    `✓ index.html: ${inlineScripts.length} инлайн-скрипта без синтаксических ошибок, ` +
      `${handlerCount} вызовов в обработчиках — все ссылаются на определённые функции.`,
  );
  process.exit(0);
} else {
  console.error(`\n${problems} проблем(ы) в ${FILE}.`);
  process.exit(1);
}
