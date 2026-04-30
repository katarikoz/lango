# LanGo — Build Better English

Family learning app for kids. School textbook vocabulary, power words, spelling — all in one place.

**Live:** [lango.milxi.fun](https://lango.milxi.fun)

## Modes

- **School Words** — type textbook words (German → English) with adaptive spaced repetition. Difficulty adjusts per word; easy words need 3 correct, hard ones up to 5. Multi-segment progress bar (red/orange/green).
- **Power Words** — replace weak words (cool, good, bad) with stronger alternatives, with example sentences.
- **Spelling Trainer** — tricky words + personal mistakes come back more often.
- **Better Answers** — short reply → full answer (coming soon).
- **Connectors** — because, however, therefore (coming soon).
- **Speaking Builder** — structured opinion framework (coming soon).

## How it works

- Two profiles (🐱 / 🦊) with separate progress
- Themes from the school textbook — add more in the `LANGO_THEMES` array
- Progress stored in localStorage per profile
- Single `index.html`, no build step, font via Google Fonts (Nunito)

## Deploy

GitHub Pages, `main` branch. Push → live in ~30 seconds.
