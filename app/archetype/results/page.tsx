"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Archetype } from "@/lib/questions";
import { InkCell, ArchetypeScores } from "@/lib/scoring";
import { ARCHETYPES, RARITY_COLORS, InkResult } from "@/lib/archetypes";
import { generateSeed } from "@/lib/translator";

function ResultsContent() {
  const searchParams = useSearchParams();
  const [downloading, setDownloading] = useState(false);

  const dominant = searchParams.get("d") as Archetype;
  const rawInk = searchParams.get("ink");
  const ink: InkResult | null = rawInk ? JSON.parse(rawInk) : null;

  // Fallback cell for seed generation (still uses archetype triple internally)
  const point = (searchParams.get("p") ?? dominant) as Archetype;
  const support = (searchParams.get("su") ?? dominant) as Archetype;
  const specialist = (searchParams.get("sp") ?? dominant) as Archetype;

  if (!ink) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-zinc-400">No results found. <a href="/archetype" className="text-amber-400">Take the quiz</a></p>
      </div>
    );
  }

  const cell: InkCell = { point, support, specialist };

  async function handleDownload() {
    setDownloading(true);
    try {
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
      a.download = `13inks-seed-${ink!.title.toLowerCase().replace(/\s/g, "-")}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  // Parse scores from URL for virtue stat display
  const rawScores = searchParams.get("s");
  const scores: ArchetypeScores | null = rawScores ? JSON.parse(rawScores) : null;
  const maxScore = scores ? Math.max(...Object.values(scores), 0.01) : 1;

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      {/* Ink reveal */}
      <div className="text-center mb-12">
        <p className="text-sm text-zinc-500 uppercase tracking-widest mb-2">
          Your Ink
        </p>
        <h1
          className="text-5xl font-bold mb-3"
          style={{ color: ink.color }}
        >
          {ink.title}
        </h1>
        {/* Rarity badge — only shown for Uncommon and above */}
        {ink.rarity !== "Common" && (
          <p
            className="text-xs font-mono uppercase tracking-widest mb-6"
            style={{ color: RARITY_COLORS[ink.rarity] }}
          >
            ◆ {ink.rarity}
          </p>
        )}
        {ink.rarity === "Common" && <div className="mb-6" />}
        <p className="text-zinc-400 max-w-lg mx-auto">{ink.description}</p>
      </div>

      {/* Virtue stats */}
      {scores && (
        <div className="border border-zinc-800 rounded-xl p-6 mb-8">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Your Virtues</p>
          <div className="flex flex-col gap-2.5">
            {Object.entries(scores)
              .sort(([, a], [, b]) => b - a)
              .map(([arch, score]) => {
                const a = ARCHETYPES[arch as Archetype];
                return (
                  <div key={arch} className="flex items-center gap-3">
                    <span className="text-xs w-28 text-right" style={{ color: a.color }}>
                      {a.virtue}
                    </span>
                    <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(score / maxScore) * 100}%`,
                          backgroundColor: a.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Download */}
      <div className="border border-zinc-800 rounded-xl p-6 mb-8 text-center">
        <h2 className="font-semibold mb-2">Your Seed Config</h2>
        <p className="text-sm text-zinc-400 mb-4">
          Download your personalized CLAUDE.md, skills, and memory files.
          Paste them into your Claude Code project.
        </p>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="bg-amber-400 text-zinc-950 font-semibold px-8 py-3 rounded-xl hover:bg-amber-300 transition disabled:opacity-50"
        >
          {downloading ? "Generating..." : "Download Seed (.zip)"}
        </button>
      </div>

      {/* Plant instructions */}
      <div className="border border-zinc-800 rounded-xl p-6 mb-8">
        <h2 className="font-semibold mb-3">Plant it</h2>
        <p className="text-sm text-zinc-400 mb-4">
          The zip contains a <code className="text-zinc-200 bg-zinc-800 px-1.5 py-0.5 rounded-md">PLANT.md</code> with the exact prompt to paste.
          Your Claude session does the rest — it reads the packet, looks at your real project, and proposes where everything goes.
          You review and approve before anything lands.
        </p>
        <ol className="text-sm text-zinc-400 list-decimal list-inside flex flex-col gap-2">
          <li>Unzip and move the <code className="text-zinc-200 bg-zinc-800 px-1.5 py-0.5 rounded-md">13inks-seed-packet/</code> folder into your project root</li>
          <li>Open Claude Code in your project root</li>
          <li>Open <code className="text-zinc-200 bg-zinc-800 px-1.5 py-0.5 rounded-md">PLANT.md</code> and paste the prompt inside it into Claude</li>
          <li>Review the plan Claude proposes, approve, and let it place the files</li>
        </ol>
        <p className="text-xs text-zinc-500 mt-4">
          New to Claude Code? Get it at{" "}
          <a href="https://claude.com/code" className="text-amber-400 hover:text-amber-300 transition">claude.com/code</a> first.
        </p>
      </div>

      {/* AIO beta CTA */}
      <div className="border border-zinc-700 rounded-xl p-6 mb-8 text-center bg-zinc-900/40">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Early access</p>
        <h2 className="font-semibold text-zinc-100 mb-2">Take this further.</h2>
        <p className="text-sm text-zinc-400 mb-5">
          AIO learns your patterns across every session — so Claude already knows
          how you think when you show up. Your CLAUDE.md is just the start.
        </p>
        <a
          href={`/beta?d=${dominant}&p=${point}&su=${support}&sp=${specialist}`}
          className="inline-block bg-amber-400 text-zinc-950 font-semibold px-8 py-3 rounded-xl hover:bg-amber-300 transition text-sm"
        >
          Claim early access →
        </a>
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
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
          }}
          className="text-sm text-amber-400 hover:text-amber-300 transition"
        >
          Copy Share Link
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
