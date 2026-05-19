// Markdown assembly with section gating and a hard line budget.
// Pure function — string in, string out. No side effects.

import { ComposeResult, RepoFacts, SectionKey } from "./types";

const HARD_LINE_CAP = 60;

function composeWhatThisIs(facts: RepoFacts): string[] {
  const parts: string[] = [];
  if (facts.name) parts.push(facts.name);
  if (facts.framework) parts.push(`— ${facts.framework}`);
  if (facts.description) parts.push(`— ${facts.description}`);
  else if (facts.deployment) parts.push(`(deployed to ${facts.deployment})`);
  if (parts.length === 0) return [];
  return ["## What this is", parts.join(" "), ""];
}

function composeHowToWork(facts: RepoFacts): string[] {
  if (facts.commands.length === 0) return [];
  const lines: string[] = ["## How to work in it"];
  for (const c of facts.commands) {
    lines.push(`- ${c.label}: \`${c.cmd}\``);
  }
  lines.push("");
  return lines;
}

function composeLayout(facts: RepoFacts): string[] {
  if (facts.layout.length === 0) return [];
  const lines: string[] = ["## Layout"];
  for (const l of facts.layout) {
    if (l.role) lines.push(`- \`${l.dir}/\` — ${l.role}`);
    else lines.push(`- \`${l.dir}/\``);
  }
  lines.push("");
  return lines;
}

function composeConventions(facts: RepoFacts): string[] {
  if (facts.conventions.length === 0) return [];
  const lines: string[] = ["## Conventions detected"];
  for (const c of facts.conventions) lines.push(`- ${c}`);
  lines.push("");
  return lines;
}

function composeCheckBefore(): string[] {
  return [
    "## Check with me before",
    "- Adding a new dependency",
    "- Changing the database schema",
    "- Editing anything under auth or payments",
    "",
  ];
}

function composeFooter(facts: RepoFacts): string[] {
  const date = new Date().toISOString().slice(0, 10);
  const sources: string[] = [];
  if (facts.name || facts.framework) sources.push("package.json");
  if (facts.description) sources.push("README");
  if (facts.layout.length > 0) sources.push("repo layout");
  const src = sources.length > 0 ? sources.join(" + ") : "repo scan";
  return [
    "---",
    `_Generated ${date} from ${src}. Doc Refresher will flag drift._`,
  ];
}

export function compose(facts: RepoFacts): ComposeResult {
  const sectionsUsed: SectionKey[] = [];
  const out: string[] = ["# CLAUDE.md", ""];

  const sections: { key: SectionKey; lines: string[] }[] = [
    { key: "what_this_is", lines: composeWhatThisIs(facts) },
    { key: "how_to_work", lines: composeHowToWork(facts) },
    { key: "layout", lines: composeLayout(facts) },
    { key: "conventions", lines: composeConventions(facts) },
    { key: "check_before", lines: composeCheckBefore() },
  ];

  for (const s of sections) {
    if (s.lines.length === 0) continue;
    sectionsUsed.push(s.key);
    out.push(...s.lines);
  }

  out.push(...composeFooter(facts));

  // Apply the hard line cap. If we overflow (rare with the gating above
  // but possible with very long descriptions), trim the longest section
  // first — but in practice section gating + 8-dir cap + 8-command cap
  // keeps us well under 60. Defensive only.
  let markdown = out.join("\n");
  let lineCount = markdown.split("\n").length;
  if (lineCount > HARD_LINE_CAP) {
    const trimmed = out.slice(0, HARD_LINE_CAP - 2);
    trimmed.push("", "_(trimmed at line cap; some sections elided)_");
    markdown = trimmed.join("\n");
    lineCount = markdown.split("\n").length;
  }

  return { markdown, sectionsUsed, lineCount };
}
