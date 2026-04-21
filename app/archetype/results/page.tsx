"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Archetype } from "@/lib/questions";
import { InkCell } from "@/lib/scoring";
import { ARCHETYPES } from "@/lib/archetypes";
import { generateSeed } from "@/lib/translator";

function ResultsContent() {
  const searchParams = useSearchParams();
  const [downloading, setDownloading] = useState(false);

  const dominant = searchParams.get("d") as Archetype;
  const point = searchParams.get("p") as Archetype;
  const support = searchParams.get("su") as Archetype;
  const specialist = searchParams.get("sp") as Archetype;

  if (!dominant || !point) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-zinc-400">No results found. <a href="/archetype" className="text-amber-400">Take the quiz</a></p>
      </div>
    );
  }

  const cell: InkCell = { point, support, specialist };
  const info = ARCHETYPES[dominant];

  async function handleDownload() {
    setDownloading(true);
    try {
      const seed = generateSeed(cell);
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      zip.file("CLAUDE.md", seed.claudeMd);
      for (const skill of seed.skills) {
        zip.file(skill.path, skill.content);
      }
      for (const memory of seed.memories) {
        zip.file(memory.path, memory.content);
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `13inks-seed-${dominant.toLowerCase()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      {/* Archetype reveal */}
      <div className="text-center mb-12">
        <p className="text-sm text-zinc-500 uppercase tracking-widest mb-2">
          Your Archetype
        </p>
        <h1
          className="text-5xl font-bold mb-2"
          style={{ color: info.color }}
        >
          {info.title}
        </h1>
        <p className="text-xl text-zinc-300 mb-6">{info.name}</p>
        <p className="text-zinc-400 max-w-lg mx-auto">{info.description}</p>
      </div>

      {/* Ink Cell */}
      <div className="border border-zinc-800 rounded-lg p-6 mb-8">
        <h2 className="font-semibold mb-4">Your Ink Cell</h2>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-500 w-20">POINT</span>
            <span
              className="font-medium"
              style={{ color: ARCHETYPES[point].color }}
            >
              {point}
            </span>
            <span className="text-sm text-zinc-500">&mdash; {ARCHETYPES[point].aiStyle}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-500 w-20">SUPPORT</span>
            <span
              className="font-medium"
              style={{ color: ARCHETYPES[support].color }}
            >
              {support}
            </span>
            <span className="text-sm text-zinc-500">&mdash; {ARCHETYPES[support].aiStyle}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-500 w-20">SPECIALIST</span>
            <span
              className="font-medium"
              style={{ color: ARCHETYPES[specialist].color }}
            >
              {specialist}
            </span>
            <span className="text-sm text-zinc-500">&mdash; {ARCHETYPES[specialist].aiStyle}</span>
          </div>
        </div>
      </div>

      {/* Download */}
      <div className="border border-zinc-800 rounded-lg p-6 mb-8 text-center">
        <h2 className="font-semibold mb-2">Your Seed Config</h2>
        <p className="text-sm text-zinc-400 mb-4">
          Download your personalized CLAUDE.md, skills, and memory files.
          Paste them into your Claude Code project.
        </p>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="bg-amber-400 text-zinc-950 font-semibold px-8 py-3 rounded-lg hover:bg-amber-300 transition disabled:opacity-50"
        >
          {downloading ? "Generating..." : "Download Seed (.zip)"}
        </button>
      </div>

      {/* Install instructions */}
      <div className="border border-zinc-800 rounded-lg p-6 mb-8">
        <h2 className="font-semibold mb-3">Install</h2>
        <ol className="text-sm text-zinc-400 list-decimal list-inside flex flex-col gap-2">
          <li>Unzip into your project root</li>
          <li>Append <code className="text-zinc-200 bg-zinc-800 px-1.5 py-0.5 rounded">CLAUDE.md</code> content to your existing CLAUDE.md (or create one)</li>
          <li>Copy <code className="text-zinc-200 bg-zinc-800 px-1.5 py-0.5 rounded">skills/</code> to <code className="text-zinc-200 bg-zinc-800 px-1.5 py-0.5 rounded">~/.claude/skills/</code></li>
          <li>Copy <code className="text-zinc-200 bg-zinc-800 px-1.5 py-0.5 rounded">memory/</code> to your project&apos;s <code className="text-zinc-200 bg-zinc-800 px-1.5 py-0.5 rounded">.claude/memory/</code></li>
          <li>Start a new Claude Code session &mdash; it adapts immediately</li>
        </ol>
      </div>

      {/* Share + retake */}
      <div className="flex gap-4 justify-center">
        <a
          href="/archetype"
          className="text-sm text-zinc-400 hover:text-zinc-200 transition"
        >
          Retake Quiz
        </a>
        <span className="text-zinc-700">|</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(
              `I'm a ${dominant} (${info.title}) on 13inks.dev \u2014 what's your AI archetype?`
            );
          }}
          className="text-sm text-amber-400 hover:text-amber-300 transition"
        >
          Copy Share Text
        </button>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-6 py-16 text-center text-zinc-400">Loading results...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
