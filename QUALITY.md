# Quality & Testing — PhoenGo

PhoenGo is a **build-free vanilla HTML/CSS/JS** app (single `index.html`, no
framework, no bundler — edit, save, refresh). The tooling in this repo exists to
keep that simplicity *safe*: catch broken behaviour (a dead button, wrong
scoring, an unlock that doesn't fire) before a kid does. Tooling never becomes a
build step for the app itself.

## Commands

```bash
npm run serve        # serve the app on http://localhost:9999  (our canonical port)
npm test             # unit tests (Vitest)            — fast, pure logic
npm run test:e2e     # end-to-end tests (Playwright)   — real browser, real clicks
npm run lint         # eslint + index.html handler check + stylelint
npm run screenshots  # PNGs of key screens → screenshots/ (phone + desktop)
```

## Two test layers

**E2E (Playwright) — the priority.** Loads the real `index.html` in a real
browser and drives real user flows: open a topic → answer → click the check
button → assert feedback + scoring → earn XP → assert the observatory unlock.
This is what catches the bug class we actually hit. Specs live in `e2e/`;
`e2e/helpers.js` drives navigation via the app's own functions.

**Unit (Vitest) — pure logic.** Pure functions (answer validation, scoring, XP
math, unlock thresholds) live in `src/pure.js` — a single source of truth loaded
by `index.html` via a plain `<script src>` (still no build step) **and** required
by tests. Specs live in `tests/unit/`. When you write a new pure helper, put it
in `src/pure.js` and unit-test it there.

## Static checks

- **ESLint** (`eslint.config.js`) strictly lints the clean JS: `src/`, `e2e/`,
  `tests/`, `scripts/`, config files. The big inline `<script>` in `index.html`
  is **intentionally out of scope** (too many legacy globals → noise).
- **`scripts/check-handlers.mjs`** is the targeted guard for `index.html`: it
  parse-checks every inline script and verifies every `on*="fn()"` handler points
  at a **defined** function — i.e. the "typo'd handler kills a button" class.
- **Stylelint** (`stylelint-config-recommended`, error-level only) lints the
  inline CSS for real mistakes (empty blocks, duplicate properties), not style.

## Git hooks (husky)

- **pre-commit** → `lint-staged` (eslint / handler check / stylelint on staged
  files) + unit tests. Broken code can't be committed.
- **pre-push** → full lint + unit + E2E. The pre-deploy gate (push auto-deploys
  via GitHub Pages). If E2E ever gets in the way of the workflow, the last line
  of `.husky/pre-push` can be removed.

## The working rhythm

1. **Regression-guard rule.** Every confirmed bug gets an automated test that
   reproduces it *first* (watch it fail), then fix the code (watch it pass). The
   suite only grows; bugs can't silently come back. (Example already in the repo:
   the Prüfen "dead button" → `e2e/check-answer.spec.js`; the `parseFloat("3/8")`
   mistake → `tests/unit/pure.test.js`.)

2. **Design → test rhythm.** While *iterating the design* of a screen
   (layout/copy/visuals), refine with **screenshots + an expert-panel review** —
   don't write behaviour tests yet (they'd churn). Write/run the behaviour tests
   once the design is settled. Lint runs on every commit regardless — it's free.

3. **Look at the screenshots.** Run `npm run screenshots` and actually open the
   PNGs before calling a screen done — it catches cramped spacing, broken layout
   and low contrast that code review and tests can't see.

4. **Expert-panel review before "done"** (world-class bar, no flattery):
   - **UX/UI** — clear hierarchy, obvious action, tap targets **≥44px** (kids),
     nothing cut off.
   - **Child developmental psychology** — age-appropriate, low cognitive load,
     reward effort, **never shame a wrong answer**.
   - **Through a kid's eyes** — is it fun? is the reward earned? is the XP /
     observatory loop motivating?
   - **Copy** — short, encouraging, clear button labels and error/empty states.
   - **Accessibility** — colour contrast (AA), visible keyboard focus, target
     size, reduced-motion.

5. **Git discipline** — Conventional Commits with scope (`fix(math): …`,
   `feat(observatory): …`, `test: …`, `chore(quality): …`). Group by logical
   change. **Never push without an explicit OK** (push deploys).

## Notes

- Canonical dev/test port is **9999** (5555 is squatted by another local app).
- `node_modules/`, `screenshots/`, `playwright-report/`, `test-results/` are
  gitignored — none of them are needed by GitHub Pages.
