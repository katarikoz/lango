# LanGo — vision, decisions, roadmap

This is the source-of-truth document for what LanGo is, why it exists, what we've built, what we've decided not to build, and what's parked for later.

If something here drifts from the code — fix the doc.

## What it is

A family English-learning mini-app for two specific kids. Their school programme is slow and gives weak vocabulary, so school exposure alone produces short, generic English ("I like football. It is cool."). LanGo fills that gap.

The kids attend a **German-language school** and learn English as a third language from a German textbook. That's why card translations are in German, not Russian — they match what the kids see in class.

**Live:** [lango.milxi.fun](https://lango.milxi.fun)

## Pedagogy

Build Better English, not "learn a language". The aim isn't basic ESL — they have that. The aim is:

- Knowing textbook words ahead of class.
- Replacing weak words (cool / good / bad / nice) with stronger ones (exciting / useful / boring / lovely).
- Answering with full structure (opinion + reason + example + conclusion) instead of one-line answers.
- Spelling cleanly enough to ace dictations.

Daily session shape: about 7 minutes. ~2 minutes school words, ~2 minutes spelling, ~2 minutes better answers / power words, ~1 minute speaking challenge.

## Built modes

### School Words — adaptive spaced repetition

Type-it-yourself practice on the current textbook theme. Show the German prompt, the kid types English, hits Check.

Each word carries adaptive difficulty (`status.difficulty`, range 0–5):

- Difficulty drops by 0.3 on a correct answer.
- Difficulty rises by 1.0 on a wrong answer; +0.5 extra if the previous attempt was also wrong (consecutive errors); +0.5 extra if the pattern was "right twice then wrong" (false knowledge — looked solid, wasn't).
- Last 20 attempts are stored as a binary string in `status.history`.

Difficulty drives two things:

| difficulty | mastery threshold | review intervals (in steps) |
|---|---|---|
| 0–1 (easy) | 3 correct in a row | 5, 12, 30 |
| 1–2.5 (medium) | 4 correct | 4, 8, 20, 40 |
| 2.5+ (hard) | 5 correct | 3, 6, 12, 25, 40 |

A "step" is one word presentation in the session. After a correct answer, the word's `nextShowStep` is set forward by the interval; after a wrong answer, it's set just 5 steps ahead, so it loops back fast.

Session state (current step, queue) is persisted to `localStorage` under `lango.session.{profile}.{themeId}`, so closing the app mid-session and coming back later resumes exactly where they left off.

UI status pill: `new` → `1 of N` → `... of N` → `mastered`. Multi-segment progress dots fill in as the kid progresses through the threshold. A wrong answer shows red dots and resets streak to 0 (but keeps the difficulty raise).

There's a "Don't know — show me" button that reveals the answer without penalty and queues the word again later in the session.

### Power Words

A weak word is shown crossed out (cool, good, bad, big, sad, like, etc.). Kid taps one of four stronger replacements and sees the strong word inside a real sentence. Below: a Better Answer preview pair (weak vs strong full sentence) so the upgrade lands as speech, not just vocabulary.

13 weak→strong sets shipping in v0.5.

### Spelling Trainer

Same typing engine as School Words, fed a different word pool: words flagged `tricky:true` in the theme data, plus any word the kid has recently gotten wrong (`status.red === true`). Drains the riskiest words across all themes regardless of which theme is "current".

## Planned modes

- **Better Answers** — short reply → full, structured answer. "I like football" → "I really enjoy football because it is exciting. For example, the result can change at any moment." Train the structure of a strong answer, not just words.
- **Connectors** — because, however, for example, therefore, although, as a result. Practice slotting connectors into otherwise plain sentences.
- **Speaking Builder** — opinion → reason → example → conclusion. Possibly with audio.

## Content pipeline

Themes come from the school textbook as the kids progress. Each theme is one object pushed onto the `LANGO_THEMES` array near the top of `index.html`:

```js
{
  id: 'theme0X',
  title: 'Theme X — Topic name',
  status: 'current' | 'review',
  words: [
    { en: 'word', de: 'das Wort', ex: '(optional) Example sentence.', tricky: true|undefined }
  ]
}
```

`status: 'current'` is what's being taught right now; `status: 'review'` is past themes still worth revisiting. Both are visible in the theme list with different badges.

Delivered themes so far: **4 — Free time** (96 words), **5 — A birthday party** (100 words).

When a new theme arrives: paste it into `LANGO_THEMES`, mark old `current` themes as `review`, push, done.

## Profiles

Two profiles, separate progress in localStorage.

- 🐱 Cat
- 🦊 Fox

Same content, separate `wordStatus` map per profile. Streak counter is also per-profile.

Storage key: `lango.profile.{cat|fox}` (or whatever the profile id is — currently `max` / `aleks` internally for backward compat with v0.3 saves).

## Architecture

- **One file: `index.html`.** No subfolders, no bundler, no framework. iPad Safari opens it from `file://` and from `https://` identically.
- **Inline data.** `LANGO_THEMES` lives in a `<script>` block at the top. Earlier we tried `data/themes.js`, but Safari blocks relative `<script src>` over `file://` — single file is the durable answer.
- **localStorage for everything user-side.** Profile progress, session resume state, last-visit date for streaks. No server, no database.
- **GitHub Pages from `main`** with custom domain `lango.milxi.fun`. Push to main → live in ~30 seconds.
- **Nunito** via Google Fonts for friendly, readable type. Fallback to system stack.
- **UI is English.** Kids learn English; the UI itself becomes part of the immersion. Card translations are German (matches the textbook). This document and `README.md` are English; in-conversation working language with mum is Russian.

## Conscious "nots"

- **No Supabase / cloud database.** Per-iPad localStorage is enough. We'd reach for a backend only if we needed: cross-device sync of progress, remote content updates without push, mum dashboard with stats from both kids' devices.
- **No real authentication.** A simple lock-screen with a base64 password used to gate access; we removed it once the URL itself was sufficiently obscure to the audience. If we ever need real auth (email-based), Cloudflare Access on Cloudflare Pages is the cleanest add.
- **Not a public/class-wide app.** LanGo exists to give two specific kids an edge. Distribution to a wider class or school is not in scope. If circumstances change, opening it up is mostly removing the gate and adding a "What's your name?" screen — half a day of work.
- **No frameworks.** Vanilla HTML + CSS + JS. Total file under 100KB. Anyone with a text editor can open and edit.
- **No bundler / build step.** Edit, save, push, refresh. That's the whole pipeline.

## Parking lot

Things we've thought about but consciously deferred. Not in any order:

- Audio / TTS for English word pronunciation.
- "Mum's view" — a screen that shows both kids' weak words and progress trends so she knows what to focus on with them at dinner.
- Daily/weekly progress charts.
- Custom hand-drawn avatars (a friendly lion was mooted as a logo; emoji is the placeholder).
- Themes 6, 7, 8+ as they come.
- The three planned modes above (Better Answers, Connectors, Speaking Builder).
- Dictation-style mode: phrase audio → kid types the whole sentence.
- Per-theme "exam mode" for the day before a real dictation.

## How updates ship

1. Edit `index.html` (or any other file).
2. `git commit -am "what changed"` + `git push`.
3. GitHub Pages rebuilds, ~30 seconds.
4. Kids reload `lango.milxi.fun` (or it auto-loads next time they open the home-screen icon).

That's the whole loop.
