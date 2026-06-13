"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Archetype } from "@/lib/questions";
import { InkCell } from "@/lib/scoring";
import { generateSeed } from "@/lib/translator";

type State = "idle" | "loading" | "success" | "error";

function BetaContent() {
  const searchParams = useSearchParams();
  const [pat, setPat] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const [instructions, setInstructions] = useState("");
  const [claudeMd, setClaudeMd] = useState<string | null>(null);

  // Read quiz result from URL params if coming from /archetype/results
  const dominant = searchParams.get("d") as Archetype | null;
  const point = searchParams.get("p") as Archetype | null;
  const support = searchParams.get("su") as Archetype | null;
  const specialist = searchParams.get("sp") as Archetype | null;

  const hasQuizResult = !!(dominant && point && support && specialist);

  useEffect(() => {
    if (hasQuizResult) {
      const cell: InkCell = { point: point!, support: support!, specialist: specialist! };
      const seed = generateSeed(cell);
      setClaudeMd(seed.claudeMd);
    }
  }, [hasQuizResult, point, support, specialist]);

  async function handleRedeem() {
    if (!pat.trim()) return;
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/beta/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pat }),
      });
      const data = await res.json();
      if (data.valid) {
        setInstructions(data.installInstructions);
        setState("success");
      } else {
        setError(data.error ?? "Invalid token.");
        setState("error");
      }
    } catch {
      setError("Something went wrong. Try again.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">You're in</p>
        <h1 className="text-3xl font-bold mb-4">Get AIO running.</h1>
        <p className="text-zinc-400 mb-8">
          Download both files, then follow the setup steps below.
        </p>

        {/* Downloads */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          <a
            href={`/api/beta/download?pat=${encodeURIComponent(pat)}&file=binary`}
            download="aio-mcp-server"
            className="flex items-center gap-3 border border-zinc-700 rounded-xl px-5 py-4 hover:border-amber-400/50 hover:bg-zinc-900 transition"
          >
            <span className="text-amber-400 text-lg">↓</span>
            <div>
              <p className="text-sm font-medium text-zinc-200">aio-mcp-server</p>
              <p className="text-xs text-zinc-500">Apple Silicon · standalone</p>
            </div>
          </a>
          {claudeMd ? (
            <button
              type="button"
              onClick={() => {
                const blob = new Blob([claudeMd], { type: "text/markdown" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "CLAUDE.md";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-3 border border-zinc-700 rounded-xl px-5 py-4 hover:border-amber-400/50 hover:bg-zinc-900 transition text-left"
            >
              <span className="text-amber-400 text-lg">↓</span>
              <div>
                <p className="text-sm font-medium text-zinc-200">CLAUDE.md</p>
                <p className="text-xs text-zinc-500">{dominant}-shaped · personalized</p>
              </div>
            </button>
          ) : (
            <a
              href={`/api/beta/download?pat=${encodeURIComponent(pat)}&file=claudemd`}
              download="CLAUDE.md"
              className="flex items-center gap-3 border border-zinc-700 rounded-xl px-5 py-4 hover:border-amber-400/50 hover:bg-zinc-900 transition"
            >
              <span className="text-amber-400 text-lg">↓</span>
              <div>
                <p className="text-sm font-medium text-zinc-200">CLAUDE.md</p>
                <p className="text-xs text-zinc-500">Your starter config</p>
              </div>
            </a>
          )}
        </div>

        {/* Instructions */}
        <pre className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-sm text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {instructions}
        </pre>

        <div className="mt-10 p-5 border border-zinc-800 rounded-xl">
          <p className="text-zinc-300 font-medium mb-1">Ready for more?</p>
          <p className="text-sm text-zinc-500">
            Mesh capabilities — connecting your node to the fleet, shared corpus, multi-node coordination — are available on request.
          </p>
          <a
            href="mailto:ashton@mucalabs.com"
            className="inline-block mt-3 text-sm text-amber-400 hover:text-amber-300 transition"
          >
            Request mesh access →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Early access</p>
      <h1 className="text-4xl font-bold tracking-tight mb-6">
        Your AI resets every session.
      </h1>
      <p className="text-lg text-zinc-400 mb-16">
        Every conversation starts cold. It doesn&apos;t know what you built last week,
        what you tried and abandoned, what decisions you made and why.
        You carry all of that. It doesn&apos;t.
      </p>

      {/* What you get */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
        <div className="border border-zinc-800 rounded-xl p-5">
          <p className="font-mono text-amber-400 text-sm mb-2">CLAUDE.md</p>
          <p className="text-sm text-zinc-400">
            A configuration file shaped around how you actually think —
            generated from your archetype, kept current as you work.
          </p>
        </div>
        <div className="border border-zinc-800 rounded-xl p-5">
          <p className="font-mono text-amber-400 text-sm mb-2">aio-mcp-server</p>
          <p className="text-sm text-zinc-400">
            The persistent layer. Runs locally. Connects to Claude Code.
            Learns your patterns. Never sends data to the cloud.
          </p>
        </div>
      </div>

      {/* Spores */}
      <div className="mb-16">
        <h2 className="text-xl font-bold mb-4">What if it didn&apos;t reset?</h2>
        <p className="text-zinc-400 mb-4">
          Imagine your AI already knowing your patterns, your preferences, the decisions
          you made last week and why. No re-explaining. No warming up.
        </p>
        <p className="text-zinc-400 mb-6">
          Spores are how AIO remembers.
        </p>
        <p className="text-zinc-400 mb-6">
          When you work — writing code, debugging, making decisions — AIO watches. It extracts
          the patterns that matter: what you reached for, what you corrected, how you think.
          These get stored locally as spores — structured, searchable, yours.
        </p>
        <p className="text-zinc-400 mb-8">
          Next session, AIO rehydrates from your corpus. Claude arrives already knowing your
          patterns. You don&apos;t re-explain yourself.
        </p>

        <div className="border border-zinc-800 rounded-xl p-5 flex flex-col gap-4">
          <p className="text-xs text-zinc-500 uppercase tracking-widest">How capture works</p>
          <div>
            <p className="text-sm font-medium text-zinc-200 mb-1">Automatic</p>
            <p className="text-sm text-zinc-500">
              AIO watches your session in the background. Every 60 seconds, a local model
              extracts what&apos;s worth keeping. You do nothing.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-200 mb-1">Manual</p>
            <p className="text-sm text-zinc-500">
              When something important happens, you can capture it directly. A decision,
              a breakthrough, a pattern worth preserving.
            </p>
          </div>
        </div>

        <p className="text-sm text-zinc-500 mt-6">
          Over time, your corpus becomes a fingerprint of how you actually work —
          not how you&apos;d describe yourself on a form. Earned, not configured.
        </p>
      </div>

      {/* Quiz result context if present */}
      {hasQuizResult && (
        <div className="mb-8 px-4 py-3 border border-zinc-800 rounded-xl bg-zinc-900/40 flex items-center gap-3">
          <span className="text-amber-400 text-sm">✓</span>
          <p className="text-sm text-zinc-400">
            Quiz result loaded — your CLAUDE.md will be shaped for <span className="text-zinc-200 font-medium">{dominant}</span>.
          </p>
        </div>
      )}

      {/* PAT gate */}
      <div className="border border-zinc-800 rounded-xl p-6">
        <p className="text-sm font-medium text-zinc-200 mb-1">Access token</p>
        <p className="text-sm text-zinc-500 mb-4">
          We issue tokens manually. If you have one, enter it below.
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={pat}
            onChange={(e) => setPat(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRedeem()}
            placeholder="13inks-..."
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
          />
          <button
            type="button"
            onClick={handleRedeem}
            disabled={!pat.trim() || state === "loading"}
            className="bg-amber-400 text-zinc-950 font-semibold px-5 py-2.5 rounded-xl hover:bg-amber-300 disabled:opacity-40 transition text-sm"
          >
            {state === "loading" ? "Checking…" : "Get access"}
          </button>
        </div>
        {state === "error" && (
          <p className="text-sm text-red-400 mt-3">{error}</p>
        )}
        <p className="text-xs text-zinc-600 mt-4">
          No token? We&apos;re not public yet.{" "}
          <a href="mailto:ashton@mucalabs.com" className="text-zinc-500 hover:text-zinc-400 transition">
            Reach out →
          </a>
        </p>
      </div>
    </div>
  );
}


export default function BetaPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-6 py-16 text-center text-zinc-400">Loading...</div>}>
      <BetaContent />
    </Suspense>
  );
}
