const js = require("@eslint/js");
const globals = require("globals");

/**
 * ESLint строго проверяет «чистый» новый JS (инструменты, тесты, src/).
 * Инлайн-JS в index.html намеренно НЕ линтится здесь (слишком много легаси-глобалей —
 * будет шум). Его страхуют: парс-проверка + проверка обработчиков в scripts/check-handlers.mjs.
 */
module.exports = [
  {
    ignores: [
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "coverage/**",
      "screenshots/**",
      "**/*.html",
    ],
  },
  js.configs.recommended,
  // Браузерный чистый код
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: { ...globals.browser, module: "writable" },
    },
    rules: {
      "no-unused-vars": "warn",
    },
  },
  // Node-окружение: тесты, e2e, скрипты, конфиги
  {
    files: [
      "e2e/**/*.js",
      "tests/**/*.js",
      "scripts/**/*.{js,mjs}",
      ".claude/hooks/**/*.{js,mjs}",
      "*.config.{js,mjs}",
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      "no-unused-vars": "warn",
    },
  },
];
