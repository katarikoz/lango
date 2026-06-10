/*
 * Чистые функции PhoenGo — без DOM и без сети.
 * Единый источник правды: грузится в index.html обычным <script src> (без сборки)
 * и в юнит-тестах через require(). В браузере функции остаются глобальными,
 * как раньше в инлайне (window.parseNumericAnswer), чтобы код страницы не менялся.
 *
 * Сюда выносим только то, что реально чистое (вход → выход, без побочных эффектов):
 * валидацию ответов, XP/уровни, пороги редкости и т.п. — это и есть юнит-тестируемый слой.
 */
(function (root) {
  // Понимает целые, десятичные (запятая/точка), дроби "3/8" и смешанные "1 3/4".
  // Возвращает число или NaN, если ввод не распознан.
  function parseNumericAnswer(raw) {
    if (raw == null) return NaN;
    const s = String(raw)
      .trim()
      .replace(",", ".")
      .replace(/\s+/g, " ")
      .replace(/\s*\/\s*/g, "/"); // "3 / 8" → "3/8", не трогая пробел в "1 3/4"
    if (!s) return NaN;
    let m = s.match(/^(-?\d+)\s+(\d+)\/(\d+)$/); // смешанное число: 1 3/4
    if (m) {
      const d = parseInt(m[3], 10);
      if (!d) return NaN;
      const w = parseInt(m[1], 10);
      const frac = parseInt(m[2], 10) / d;
      return w < 0 ? w - frac : w + frac;
    }
    m = s.match(/^(-?\d+)\/(\d+)$/); // простая дробь: 3/8
    if (m) {
      const d = parseInt(m[2], 10);
      if (!d) return NaN;
      return parseInt(m[1], 10) / d;
    }
    if (/^-?\d*\.?\d+$/.test(s)) return parseFloat(s); // обычное число
    return NaN;
  }

  const api = { parseNumericAnswer };

  // Node / Vitest
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  // Браузер: и пространство имён, и глобали (как было в инлайне)
  root.PhoenGoPure = api;
  root.parseNumericAnswer = parseNumericAnswer;
})(typeof globalThis !== "undefined" ? globalThis : this);
