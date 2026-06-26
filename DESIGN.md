# Design System — PhoenGo

Companion to `QUALITY.md`. That doc keeps behaviour from breaking; this one keeps the
design **defensible**: every spacing, size, colour, placement and word is derived from
a rule, and every rule is grounded in a source — so we can always answer "why this gap /
size / colour / word." No eyeballing.

Encoded as **CSS custom-property tokens** (vanilla, no build): components consume tokens,
never raw values. **Review with the `/board` skill** (design panel) and **`/kid-content`**
(copy panel) before shipping a screen — both run automatically on the relevant edits.

## The rules (one line · why · source)

### Spacing & rhythm
- **Proximity is the one law:** less space = more related. An element's gap to what it
  belongs to is visibly smaller than its gap to the next thing. *Why: that's what makes
  groups read as groups.* [Gestalt; Laws of UX]
- **4-step scale** (tight / related / block / section); pick by relationship, not by eye.
- **`gap` on the container owns spacing**; zero children's margins (one owner). [Refactoring UI]

### Type
- **Modular scale (~1.25)** for the UI range + one deliberate leap to a display size. [Bringhurst]
- **≤ 3–4 levels per screen, contrastive** (40-24-14, not 16-14-12). [Refactoring UI]
- **Size↔weight inverse** (big lighter, small heavier; never thin at caption size). [Bringhurst]
- **Leading = f(size)** (display ~1.0, body ~1.5); **measure 45–75 chars**. [Bringhurst]

### Colour & contrast
- **~5 semantic roles** (text / muted / surface / page / accent); use the token, not a hex. [Material]
- **60-30-10** — background+air / surfaces+text / one accent. One primary action per screen.
- **WCAG AA:** ≥4.5:1 text, ≥3:1 large text & UI/focus; **never colour alone** (pair with
  text/icon/shape). [WCAG 2.1]
- Kids: keep the accent **warm & saturated** (play/reward), not clinical. [Itten]

### Composition
- **8pt grid** (4px half-steps ok); constant outer margin; capped content column. [Müller-Brockmann]
- **Optical centering**; top-anchor content. **Tap targets ≥44px (kids: 48px).** [Apple HIG; Laws of UX]
- One alignment per region; group by shared space, not borders. [Gestalt]

### Copy & voice — growth-mindset (we evaluate answers)
- Short, concrete, one idea per sentence; age-appropriate.
- **Wrong answer → praise the effort, name the fix, frame it as a step, never shame**
  ("Fast! Schau nochmal", not "Falsch!"). Celebrate XP/progress. [Dweck; NN/g]
- **Buttons verb-first, label = outcome** (not bare "OK"); icon-only buttons get `aria-label`.
- **Errors describe the gap / blame the system, never the child**, and say what to do next. [Nielsen #9]
- Real (adult) terms, explained simply, always showing the *source* of a rule (see `/kid-content`).

### Golden ratio — honest stance
φ is a **tool, not a law.** Use it only where it functions (a type-scale ratio option among
1.2–1.5, or coarse ⅔/⅓ proportion). Reject φ-precision ("golden line-height") as cargo-cult.
Every φ use must be documented and defensible.

## Tokens — current state
- **Colours:** tokenised in `:root` (`--bg`, `--ink`, `--ink-soft`, **`--ink-dim`**, `--accent`,
  `--warn`, `--good`, `--red`, …).
- **Spacing & type:** still mostly one-off `rem` values. **Tokenise incrementally** — prefer
  tokens in anything you touch; don't big-bang refactor the 10k-line file.

## Super-design system — "One fire, tended" (Ive panel, 2026-06-26)

**POV:** PhoenGo is ONE fire, tended — not an app full of fire. Each screen must *choose
what is loudest.* Premium = the confidence to leave one thing lit and let the rest be quiet
ground. Honest, warm, reductive, alive.

**Signature — Ignition, not glow.** The ash→fire phoenix (`phoenix.webp` ramped by `--ash-mix`
0→1) is the identity gesture. Glow is everywhere and means nothing; ignition happens once and
you *feel* it. Palette signature `--accent #f06810` on `--bg #040713`; motion signature = the
relight.

### Principles
1. **One flame:** exactly ONE full-strength accent moment per screen (hero flames / the CTA).
   If orange feels like ≥30% of the screen, pull the rest to structural ink/grey.
2. **Say each thing once:** no progress system / identity label / daily goal appears twice in
   two sizes. Home = one long-arc meter (level/XP) + one daily line folded into it.
3. **Hierarchy by colour + size, not bold.** Three ink tones let you DROP weight to
   de-emphasize instead of adding 700. Bold is not the default "this matters" lever.
4. **Honest states only:** disabled = calm slate "not yet" (never muddy/broken); a finished
   task steps aside (dim + done line), never holds a primary slot. `--red` = error only;
   categories use `--warn` (amber).
5. **Ignition over glow:** motion is spent on the one signature moment (relight, hero breathe),
   not scattered infinite glow-loops. One hero motion per screen; all no-op under reduced-motion.
6. **Single file, no new weight:** inline CSS/SVG; animate the one `phoenix.webp` via CSS vars,
   never new raster.

### Target tokens
**Type** (modular ~1.25, ONE display leap): `--t-display` 2.625rem/700/-0.02em/lh1.05 (hero,
one per screen) · `--t-num` 1.75rem/700 (level numeral, steps *below* the headline) · `--t-h2`
1.5/600 · `--t-body` 1/500/lh1.5 · `--t-label` 0.875/600 · `--t-eyebrow` 0.75/600/upper/+0.12em
· `--t-caption` 0.8125/500.
**Colour roles — THREE ink tones (keystone):** `--ink #eef0f6` · `--ink-soft #8b90a5` ·
`--ink-dim #5b6075` (caption/meta — drop weight by colour). Accent = the 10%, full-strength
only TWICE per screen. Disabled: `#2a2d42` bg / `--ink-dim` ink. `--red` alarm-only; `--warn`
categories.
**Spacing** (4-level proximity, `gap` owns spacing, zero child margins): `--gap-tight .5rem` ·
`--gap-related 1rem` · `--gap-block 2rem` · `--gap-section 3rem`. Tap targets ≥48px (kids).

### Shipped this pass (2026-06-26)
`--ink-dim` added; level hex de-orange'd; honest disabled button; static headline + display
tier; Fix→amber; daily goal folded into the level card; phoenix → 79KB WebP; completed Fix
steps aside; rebirth ignite spark; answer tiles made responsive.
**Remaining:** full type/spacing tokenization · full three-drill meta unification · centre the
hero (#9) · Ember Shield + celebrate() ladder · AI-generated per-stage art (post-validation).

## Review routine
1. Build/iterate the screen; run `npm run screenshots`; **look at the PNGs** (phone + desktop).
2. Run **`/board`** (design) and **`/kid-content`** (copy). Output: what's strong → findings by
   lens (problem · why · fix) → ranked P0/P1/P2 → verdict.
3. Once the design is settled, write/run the behaviour tests (not before — they'd churn).

## Sources
Bringhurst & Lupton · Refactoring UI · Müller-Brockmann · Material Design + Apple HIG ·
Laws of UX (Gestalt, Fitts, Hick) · WCAG 2.1 · NN/g · Dweck.
