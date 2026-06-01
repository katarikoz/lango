# PhoenGo — vision, decisions, roadmap

Source-of-truth document. If something here drifts from the code — fix the doc.

## What it is

A family learning app for two kids (9–13) and one pre-schooler. The older two attend a German-language school and learn English as a third language from a German textbook. Their school programme is slow and produces short, generic English ("I like football. It is cool."). PhoenGo fills that gap — and has expanded beyond English into sailing, maths, and (soon) German.

**Live:** [lango.milxi.fun](https://lango.milxi.fun)

**Target audience:** pre-teens / early teens. The UI tone, gamification layer, and phoenix companion are designed to feel like a game, not a homework tool. Language in the UI: "On fire!", "Awesome!", "Keep it going!" — not "Correct answer. Proceed."

## Pedagogy

Build Better English, not "learn a language". The aim isn't basic ESL — they have that. The aim is:

- Knowing textbook words ahead of class.
- Replacing weak words (cool / good / bad / nice) with stronger ones (exciting / useful / boring / lovely).
- Answering with full structure (opinion + reason + example + conclusion) instead of one-line answers.
- Spelling cleanly enough to ace dictations.

Daily session shape: about 7 minutes. ~2 min school words, ~2 min spelling, ~2 min power words, ~1 min stretch.

---

## Worlds

The home screen is organized around **worlds** — subject areas, each with its own card, gradient, and icon. Worlds appear in the "Today's Quests" list (quick access with status dots) and in the 2×2 "Explore Worlds" grid.

| World | Icon | Status | Content |
|---|---|---|---|
| **English Kingdom** | 📚 | Active | School Words, Power Words, Spelling Trainer (+ planned modes) |
| **Sailing Harbor** | ⛵ | Active | 80 Jugendsegelschein questions (German sailing theory) |
| **Math Citadel** | 📐 | Active | Subjects system — currently 1 topic (Umfang & Fläche, 5 exercises) |
| **Deutsch Academy** | 📖 | Locked | Placeholder, "Coming soon" |

### Subjects system (Math Citadel and future worlds)

`LANGO_SUBJECTS` is a generic array of subjects (math, deutsch, erdkunde, nawi). Each subject has topics, each topic has exercises with types: `info`, `numeric`, `choice`. Math Citadel reads from `SUBJECTS_BY_ID["math"]`. Other subjects have empty topic arrays — ready for content.

---

## English Kingdom — built modes

### School Words — adaptive spaced repetition

Type-it-yourself practice on the current textbook theme. Show the German prompt, the kid types English, hits Check.

Each word carries adaptive difficulty (`status.difficulty`, range 0–5):

- Difficulty drops by 0.3 on a correct answer.
- Difficulty rises by 1.0 on a wrong answer; +0.5 extra if the previous attempt was also wrong (consecutive errors); +0.5 extra if the pattern was "right twice then wrong" (false knowledge).
- Last 20 attempts are stored as a binary string in `status.history`.

Difficulty drives two things:

| difficulty | mastery threshold | review intervals (in steps) |
|---|---|---|
| 0–1 (easy) | 3 correct in a row | 5, 12, 30 |
| 1–2.5 (medium) | 4 correct | 4, 8, 20, 40 |
| 2.5+ (hard) | 5 correct | 3, 6, 12, 25, 40 |

Session state persisted to `localStorage` under `lango.session.{profile}.{themeId}` — closing the app mid-session resumes exactly where they left off.

UI: status pills (`new` → `1 of N` → `mastered`), multi-segment progress dots, confetti on mastery.

"Don't know — show me" button reveals the answer without penalty and queues the word again.

### Power Words

A weak word is shown crossed out (cool, good, bad, big, etc.). Kid taps one of four stronger replacements and sees the strong word inside a real sentence. Below: a Better Answer preview pair (weak vs strong full sentence) so the upgrade lands as speech, not just vocabulary.

13 weak→strong sets.

### Spelling Trainer

Same typing engine as School Words, fed a different word pool: words flagged `tricky:true` in the theme data + any word the kid has recently gotten wrong (`status.red === true`). Drains the riskiest words across all themes.

---

## Sailing Harbor

80 German sailing theory questions for the Jugendsegelschein. Same spaced-repetition engine adapted for Q&A format with fuzzy answer matching (accepts multiple valid answers per question). Session queue: up to 15 questions per round (due → fresh → not-due).

---

## Phoenix Companion System

The phoenix is the central engagement mechanic — a creature that evolves as the kid progresses.

### Evolution stages

| Stage | Name | Emoji | Level req | Themes mastered | Best streak | Quest |
|---|---|---|---|---|---|---|
| 1 | Ember Egg | 🥚 | 1 | 0 | 0 | — |
| 2 | Hatchling Phoenix | 🐣 | 3 | 0 | 0 | Hatching (15 words, 13 correct) |
| 3 | Young Phoenix | 🔥 | 7 | 1 | 0 | — |
| 4 | Rising Phoenix | 🦅 | 15 | 2 | 7 days | — |
| 5 | Blazing Phoenix | 🌟 | 25 | 4 | 0 | Ascension (30 words, 25 correct) |

Evolution is automatic when ALL conditions are met (level + themes + streak + quest).

### Phoenix states (engagement tracking)

Based on days since last visit:

| State | Missed days | Visual | Streak |
|---|---|---|---|
| Active 🔥 | 0 (today) | brightness(1.1) | Maintained |
| Cooling 💨 | 1 | desaturated | Resets to 1 |
| Dormant 😴 | 2–3 | dim, 0.6 opacity | Resets to 1 |
| Ash ⚫ | 4+ | sepia, 0.4 opacity | Resets to 1, rebirth required |

**Ash recovery:** kid must complete a Rebirth Quest (10 words, 100% correct) to restore the phoenix.

### Phoenix status card (home screen sidebar)

Shows current streak, phoenix state label, evolution stage emoji. Visible through glassmorphism card on the home screen.

---

## XP & Level System

| Level | Rank | XP needed |
|---|---|---|
| 1 | Newbie | 0 |
| 2 | Rookie | 50 |
| 3 | Explorer | 130 |
| 4 | Warrior | 250 |
| 5 | Knight | 420 |
| 6 | Champion | 650 |
| 7 | Master | 950 |
| 8 | Legend | 1,350 |
| 9 | Mythic | 1,850 |
| 10 | Immortal | 2,500 |
| 11+ | Immortal II, III… | +800 each |

**XP rewards:**
- Correct answer: +10 XP
- Word mastered: +25 XP (gold animation)
- Self-correct after "don't know": +5 XP

Level-up triggers a modal overlay with rank name, confetti, and auto-dismiss.

---

## Streaks

Two kinds:

- **Daily streak** — consecutive days of practice. Drives phoenix state and evolution requirements. Shown on home screen. Glow effects at streak ≥ 3.
- **Session streak** — consecutive correct answers within a session. Drives confetti intensity (8 + streak × 2 particles). Resets on wrong answer.

---

## Profiles

Three profiles, separate progress in localStorage:

| Internal ID | Name | Emoji |
|---|---|---|
| `max` | Cat | 🐱 |
| `alex` | Fox | 🦊 |
| `rhino` | Rhino | 🦏 |

Same content, separate `wordStatus`, XP, streak, phoenix stage per profile. Storage key: `lango.profile.{id}`.

Per-profile data:
```js
{
  wordStatus: {},           // word mastery tracking
  learnedPowerWords: [],    // completed power word sets
  streak: 0,                // current daily streak
  bestStreak: 0,            // longest streak ever
  xp: 0,                    // total XP
  lastVisit: "YYYY-MM-DD",  // last active date
  phoenixStage: 1,          // evolution stage (1–5)
  completedQuests: [],      // ["hatching", "ascension"]
  rebirthPending: false     // true if missed ≥4 days
}
```

---

## Content pipeline

### English themes

Themes from the school textbook, added to `LANGO_THEMES` array:

```js
{
  id: 'theme0X',
  title: 'Theme X — Topic name',
  status: 'current' | 'review',
  words: [
    { en: 'word', de: 'das Wort', ex: 'Example sentence.', tricky: true|undefined }
  ]
}
```

Delivered themes:
- **Theme 4** — Free time (96 words) — `review`
- **Theme 5** — A birthday party (100 words) — `current`
- **Theme 5a** — Test prep (subset of Theme 5 + months + ordinals) — `current`

When a new theme arrives: paste it into `LANGO_THEMES`, mark old themes as `review`, push, done.

### Sailing questions

80 questions in `SAILING_QUESTIONS`, each with `q`, `a`, `accept` (array of valid answers), `keywords`, and `category`.

### Math exercises

Topics in `LANGO_SUBJECTS` → math → topics array. Exercise types: `info` (explanatory), `numeric` (type a number), `choice` (multiple choice). Currently 1 topic: Umfang & Fläche (5 exercises).

---

## Architecture

- **One file: `index.html`.** No subfolders, no bundler, no framework. iPad Safari opens it from `file://` and `https://` identically.
- **Inline data.** `LANGO_THEMES`, `LANGO_SUBJECTS`, `SAILING_QUESTIONS` live in `<script>` blocks. Safari blocks relative `<script src>` over `file://` — single file is the durable answer.
- **localStorage as primary store.** Profile progress, session state, streaks.
- **Supabase for cloud sync.** Login gate → profile picker → app. localStorage is primary, Supabase syncs on login (heavier side wins on conflict). Gives cross-device continuity.
- **GitHub Pages from `main`** with custom domain `lango.milxi.fun`. Push to main → live in ~30 seconds.
- **Font:** Inter via Google Fonts. Fallback to system stack.
- **UI is English.** Kids learn English; the UI itself is immersion. Card translations are German (matches the textbook). This document is English; working language with mum is Russian.

---

## Planned modes (not built yet)

These have concept + early UX sketches but no code. Each needs a proper design pass before implementation.

### Better Answers

**Goal:** train the *structure* of a strong answer. Take a flat short reply ("I like football. It is cool.") and turn it into a full one ("I really enjoy football because it is exciting. For example, the result can change at any moment.").

**UX sketch:** show a weak answer at the top. Build-up buttons for each upgrade: *add a reason*, *add an example*, *add a connector*, *swap the weak word*. Each button reveals a template, the kid fills in their own content. At the end — their own full, structurally correct answer.

**Open questions:**
- Source of weak-answer prompts? Curated, generated from themes, or kid-typed?
- Free-form or fill-in-the-blanks?
- How to score progress? (Not a vocabulary set — no "mastered".)

### Connectors

**Goal:** internalise linking words so sentences stop being staccato. because, however, for example, therefore, although, etc.

**UX sketch:** two sentences stacked. Kid taps the right connector to link them, or types it. Start multiple choice, graduate to free typing. Bonus: given one sentence + connector, write the second half.

**Open questions:**
- Connector vocabulary size? Start with 6, expand to 10+?
- Tie to textbook themes?
- Accept multiple valid connectors?

### Speaking Builder

**Goal:** four-step opinion template — Opinion → Reason → Example → Conclusion. Makes "say something interesting in English" mechanical.

**UX sketch:** topic at the top ("My favourite animal"). Four labelled boxes. Kid fills each in. At the end, stitched into a single paragraph — their own structured mini-essay.

**Open questions:**
- Topic bank source?
- How much help per box? Just label, or sentence-starters too?
- Text-only first, audio layer later?

### Overlap note

Better Answers = take a *given* weak reply and rebuild (reactive). Speaking Builder = compose from a *topic* from scratch (generative). Both reinforce opinion + reason + example + conclusion, from opposite directions.

---

## Conscious "nots"

- **Not a public/class-wide app.** Built for two specific kids + one pre-schooler. If circumstances change, opening up is half a day of work.
- **No frameworks.** Vanilla HTML + CSS + JS. Total file well under 200KB. Anyone with a text editor can edit.
- **No bundler / build step.** Edit, save, push, refresh.

---

## Parking lot

Things we've thought about but consciously deferred:

- Audio / TTS for pronunciation
- "Mum's view" — both kids' weak words and progress trends on one screen
- Daily/weekly progress charts
- Custom hand-drawn avatars (a lion was mooted; emoji is the placeholder)
- Themes 6, 7, 8+ as they come in school
- Deutsch Academy content
- Erdkunde / NaWi content (subjects exist in data, topics empty)
- Dictation-style mode: phrase audio → kid types the sentence
- Per-theme exam mode for the day before a real dictation
- Theming / dark-mode toggle (currently dark only)

---

## How updates ship

1. Edit `index.html`.
2. `git commit -am "what changed"` + `git push`.
3. GitHub Pages rebuilds, ~30 seconds.
4. Kids reload `lango.milxi.fun`.

That's the whole loop.
