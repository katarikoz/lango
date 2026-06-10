#!/usr/bin/env node
/*
 * PostToolUse guard. When an Edit/Write/MultiEdit touches kid-facing COPY in
 * index.html, inject a non-blocking reminder to run the /kid-content panel
 * review. Stays silent for CSS/logic/test edits so it doesn't nag.
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

// collect the text this edit introduced
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

// did this touch kid-facing copy? (content data fields or known content arrays / copy containers)
const contentField =
  /\b(flavor|secret|fact|mindBlowingFact|lesson|prompt|question|explanation|title|name|label|text)\s*:\s*["'`]/;
const contentArray =
  /POTION_ELEMENTS|POTION_COMBOS|MOLECULES|MOL_ELEMENTS|OBSERVATORY_DISCOVERIES|OBSERVATORY_LESSONS|LANGO_SUBJECTS|POWER_WORDS|LANGO_THEMES|pl-result-flavor|pl-secret-body|ml-intro-rule|pl-potion-name/;
if (!contentField.test(text) && !contentArray.test(text)) bail();

const msg =
  "🧒 kid-content guard: you just edited kid-facing copy in index.html. " +
  "Before this ships, run the /kid-content panel review on the new text — use real (adult) " +
  "terms explained simply, reveal the SOURCE of each rule (not just the fact), never hide or " +
  "dumb-down, and choose a fresh framing the 9–13 audience loves.";

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: msg },
  }),
);
process.exit(0);
