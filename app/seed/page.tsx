"use client";

// /seed — Seed packet generator.
// Takes archetype (from quiz or manual selection) + optional project context.
// Outputs a 4-file zip: PLANT.md + CLAUDE.md + 2 archetype-matched Anchor skills.

import { useState } from "react";
import { Archetype } from "@/lib/questions";
import { ARCHETYPES } from "@/lib/archetypes";
import { generateSeed } from "@/lib/translator";

const ARCHETYPES_LIST: Archetype[] = ["Architect", "Synthesizer", "Creator", "Guardian", "Healer"];

// Minimal cell: dominant archetype fills point, balanced defaults for support/specialist.
// The seed packet is primarily archetype-shaped; the cell nuance is secondary here.
const SUPPORT_DEFAULT: Record<Archetype, Archetype> = {
  Architect: "Guardian",
  Synthesizer: "Architect",
  Creator: "Synthesizer",
  Guardian: "Healer",
  Healer: "Guardian",
};
const SPECIALIST_DEFAULT: Record<Archetype, Archetype> = {
  Architect: "Synthesizer",
  Synthesizer: "Creator",
  Creator: "Guardian",
  Guardian: "Architect",
  Healer: "Creator",
};

export default function SeedPage() {
  const [archetype, setArchetype] = useState<Archetype | null>(null);
  const [context, setContext] = useState("");
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (!archetype) return;
    setDownloading(true);
    try {
      const cell = {
        point: archetype,
        support: SUPPORT_DEFAULT[archetype],
        specialist: SPECIALIST_DEFAULT[archetype],
      };
      const seed = generateSeed(cell);

      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      zip.file("13inks-seed-packet/PLANT.md", seed.plantMd);
      zip.file("13inks-seed-packet/CLAUDE.md", seed.claudeMd);
      for (const skill of seed.skills) {
        zip.file(`13inks-seed-packet/${skill.path}`, skill.content);
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `13inks-seed-${archetype.toLowerCase()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <header className="mb-12">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Seed packet</p>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Get your starter ecosystem.
        </h1>
        <p className="text-lg text-zinc-400">
          Pick your archetype. Download the packet. Prompt your Claude to plant it.
          Four files. Five minutes.
        </p>
      </header>

      {/* Step 1: Archetype */}
      <section className="mb-10">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-sm font-medium text-zinc-200">Your archetype</h2>
          <a href="/archetype" className="text-xs text-amber-400 hover:text-amber-300 transition">
            Take the quiz →
          </a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ARCHETYPES_LIST.map((a) => {
            const info = ARCHETYPES[a];
            const selected = archetype === a;
            return (
              <button
                key={a}
                onClick={() => setArchetype(a)}
                className={`text-left p-4 rounded-xl border transition ${
                  selected
                    ? "border-amber-400/60 bg-zinc-900"
                    : "border-zinc-800 hover:border-zinc-600"
                }`}
              >
                <p
                  className="text-sm font-semibold mb-0.5"
                  style={{ color: selected ? info.color : undefined }}
                >
                  {a}
                </p>
                <p className="text-xs text-zinc-500 leading-snug">{info.aiStyle}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Step 2: Project context (optional) */}
      <section className="mb-10">
        <label className="block text-sm font-medium text-zinc-200 mb-1">
          Project context
          <span className="ml-2 text-xs text-zinc-500">optional</span>
        </label>
        <p className="text-xs text-zinc-500 mb-3">
          One sentence about your project. Claude will use this when personalizing the scaffold.
        </p>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="e.g. A Next.js SaaS app for tracking fitness goals, TypeScript, Postgres."
          rows={3}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:border-zinc-600 resize-none text-zinc-200 placeholder:text-zinc-600"
        />
      </section>

      {/* What's in the packet */}
      {archetype && (
        <section className="mb-10 p-4 border border-zinc-800 rounded-xl">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Your packet will contain</p>
          <ul className="text-sm text-zinc-400 flex flex-col gap-1.5">
            <li><span className="font-mono text-zinc-300">PLANT.md</span> — the prompt to paste into Claude</li>
            <li><span className="font-mono text-zinc-300">CLAUDE.md</span> — {archetype}-shaped scaffold</li>
            <li>
              <span className="font-mono text-zinc-300">skills/</span> — 2 Anchor skills matched to {archetype}
            </li>
          </ul>
        </section>
      )}

      {/* Download */}
      <button
        onClick={handleDownload}
        disabled={!archetype || downloading}
        className="w-full bg-amber-400 text-zinc-950 font-semibold py-3 rounded-xl hover:bg-amber-300 disabled:opacity-40 transition"
      >
        {downloading ? "Building packet…" : "Download seed packet (.zip)"}
      </button>

      {!archetype && (
        <p className="text-xs text-zinc-500 text-center mt-3">Select an archetype first.</p>
      )}

      {/* Expand teaser */}
      <div className="mt-16 p-6 border border-zinc-800 rounded-xl text-center">
        <p className="text-zinc-300 font-medium mb-1">Ready to grow further?</p>
        <p className="text-sm text-zinc-500 mb-4">
          Memory files, rule constraints, agent scaffolds, and a living-garden tier that keeps your CLAUDE.md fresh as your codebase evolves.
        </p>
        <a
          href="/seed/expand"
          className="text-amber-400 text-sm font-medium hover:text-amber-300 transition"
        >
          Join the waitlist →
        </a>
      </div>
    </div>
  );
}
