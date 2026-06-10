---
name: board
description: Run BEFORE shipping any UI screen or visual change in PhoenGo — a new screen, a layout/spacing/colour/type change, a component, an overlay, a card. Reviews the screen through a panel of world-class design lenses (UX, typography, colour, accessibility, child psychology, and the kid's eyes), grounded in citable sources, and returns ranked findings with concrete fixes. Invoke with /board (point at the screen / paste the markup+CSS, or run the screenshot script first).
---

# /board — design review panel, Apple-level, grounded in rules

No design decision is random. Every spacing, size, colour, placement and word is
**derived from a rule**, and every rule is **grounded in an authoritative source** —
so you can always answer "why this gap / this size / this colour / this word."
Form **and** content are both systematic. No "let's just eyeball it."

PhoenGo is a **build-free vanilla** app; encode the system as **CSS custom-property
tokens** and have components consume tokens, never raw values. Colours are already
tokenised (`--bg`, `--ink`, `--accent`…); spacing and type are being tokenised
incrementally — prefer tokens in anything you touch.

## The grounded rules (check the screen against these)

**1. Spacing & rhythm — proximity (the one law).** The more two things belong
together, the LESS space between them; a gap to what an element belongs to must be
visibly SMALLER than the gap to the next, unrelated thing. Use a 4-step scale
(tight / related / block / section), pick by *relationship* not by eye. `gap` on the
container owns spacing; zero the children's margins (one owner). Never glue distinct
things with a bare `<br>`. [Gestalt; Laws of UX; Refactoring UI]

**2. Type scale & hierarchy.** A modular scale (~1.25) for the UI range + one
deliberate leap to a display size. ≤ 3–4 type levels per screen, with *contrastive*
steps (40-24-14, not 16-14-12). Size↔weight inverse (big lighter, small heavier;
never thin at caption size). Leading = f(size): display ~1.0, body ~1.5. Measure
45–75 chars. [Bringhurst; Refactoring UI]

**3. Colour & contrast.** ~5 semantic roles per screen (text / muted / surface /
page / accent); components use the semantic token, never a raw hex. 60-30-10
(background+air / surfaces+text / ONE accent). One primary action per screen.
**WCAG AA:** ≥4.5:1 normal text, ≥3:1 large text & UI/focus. **Never encode meaning
by colour alone** — pair with text/icon/shape (~8% of boys are colour-deficient).
For kids, keep the accent warm & saturated (play/reward), not clinical. [Material; WCAG 2.1; Itten]

**4. Composition & proportion.** 8pt grid (4px half-steps ok); constant outer
margin; capped content column. Optical (not mathematical) centering; top-anchor
content. **Tap targets ≥44px (kids: aim 48px).** Eye lands top-left (F/Z); primary
CTA in the thumb zone. One alignment per region; group by shared space, not borders.
[Müller-Brockmann; Apple HIG; Laws of UX]

**5. Copy & voice — growth-mindset (PhoenGo evaluates answers).** Age-appropriate,
short, concrete, one idea per sentence. On a wrong answer: praise the *effort* not the
person, name the fix, frame it as a learning step, celebrate progress — **never shame**
("Fast! Schau nochmal", not "Falsch!"). Buttons verb-first, label = outcome (not bare
"OK"); icon-only buttons get an `aria-label`. Errors blame the system / describe the
gap, never the child, and say what to do next. Reward copy makes knowledge feel
*earned and exciting*. [Dweck; NN/g; Nielsen #9]

**Golden ratio — honest stance.** φ is a tool, not a law. Use it only where it
*functions* (a type-scale ratio option among 1.2–1.5, or coarse ⅔/⅓ proportion).
Reject φ-precision ("golden line-height", "perfect typography = φ") as cargo-cult.
Every φ use must be documented and defensible.

## The panel (play each relevant lens, no flattery)

1. **UX/UI** — hierarchy, affordances, is the action obvious, rhythm/proximity, tap
   targets, where the eye lands.
2. **Typography** — scale, levels, leading, measure, weight↔size.
3. **Colour & accessibility** — semantic roles, 60-30-10, WCAG AA contrast, visible
   focus, never colour-alone, reduced-motion.
4. **Composition** — grid, margins, alignment, optical centering, thumb zone.
5. **Child developmental psychology** — age fit, cognitive load, autonomy & competence,
   **emotional safety — never shame**.
6. **Through the kid's eyes** (the 11-year-old, has veto) — is it fun? clear? boring?
   too much text? is the XP/reward loop motivating? do they want the next one?
7. **Copy** — short, growth-mindset, clear labels/errors. (For deep copy work, also
   run /kid-content.)

## Output format

1. **What's already strong** (don't touch).
2. **Findings by lens** — each as *problem · why · concrete fix*.
3. **Ranked P0 / P1 / P2.**
4. **One-paragraph verdict.**

## Before you call it done

Render the screen headless (Playwright — `npm run screenshots`) at phone (390×844)
and desktop widths and **look at the PNGs yourself.** Code review and tests can't see
pixels — this is how you catch cramped spacing, broken layout, low contrast, an
invisible selected-state.

## Rhythm

While *iterating* a screen's design, refine with the panel + screenshots — don't write
behaviour tests yet (they'd churn). Write them once the design is called done.

## Sources (cite per rule — citable = defensible)

Bringhurst & Lupton (type) · Refactoring UI (UI) · Müller-Brockmann (grids) ·
Material Design + Apple HIG · Laws of UX (Gestalt, Fitts, Hick) · WCAG 2.1 · NN/g
(UX writing) · Dweck (mindset).
