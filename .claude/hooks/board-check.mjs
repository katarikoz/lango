#!/usr/bin/env node
/*
 * PostToolUse guard. When an Edit/Write/MultiEdit changes the LOOK of a screen in
 * index.html (CSS rules, a new screen, layout/markup), inject a non-blocking
 * reminder to run the /board design review. Stays quiet for pure logic/test edits.
 * Must never throw — on any problem it exits 0 quietly.
 */
import { readFileSync } from "node:fs";

function bail() {
  process.exit(0);
}

let data;
try {
  data = JSON.parse(readFileSync(0, "utf8"));
} catch {
  bail();
}

const ti = (data && data.tool_input) || {};
const file = ti.file_path || "";
if (!/index\.html$/.test(file)) bail();

let text = "";
for (const k of ["new_string", "file_text", "content"]) {
  if (typeof ti[k] === "string") text += ti[k] + "\n";
}
if (Array.isArray(ti.edits)) {
  for (const e of ti.edits) {
    if (e && typeof e.new_string === "string") text += e.new_string + "\n";
  }
}
if (!text.trim()) bail();

// visual signals: a new screen, CSS properties, or inline style/markup
const newScreen = /class="screen"/.test(text);
const cssProps =
  /(?:padding|margin|gap|font-size|line-height|font-weight|border-radius|box-shadow|grid-template|justify-content|align-items|display\s*:|flex|width|height|color\s*:|background)\s*:/.test(
    text,
  );
const markup = /<(section|button|input)\b|style="/.test(text);
if (!newScreen && !cssProps && !markup) bail();

const msg =
  "🎨 board guard: you just changed how a screen looks in index.html. Before it " +
  "ships, run the /board design review on it — proximity/spacing scale, type " +
  "hierarchy, 60-30-10 colour + WCAG AA contrast, 8pt grid, tap targets ≥44px, and " +
  "growth-mindset copy. Then check the screenshots (npm run screenshots).";

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: msg },
  }),
);
process.exit(0);
