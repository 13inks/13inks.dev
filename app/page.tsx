"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FreshnessTeaser from "@/app/components/FreshnessTeaser";

function HomeContent() {
  const searchParams = useSearchParams();
  const rail = searchParams.get("rail");

  // Audience-A: already has a CLAUDE.md
  if (rail === "have") {
    return (
      <div className="max-w-3xl mx-auto px-6">
        <section className="py-20">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">You already know</p>
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Upgrade your CLAUDE.md.
          </h1>
          <p className="text-lg text-zinc-400 mb-8">
            Check for drift, grow your skill set, or bootstrap a full ecosystem
            around what you already have.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/freshness"
              className="inline-block bg-amber-400 text-zinc-950 font-semibold px-8 py-3 rounded-lg hover:bg-amber-300 transition text-center"
            >
              Check for drift
            </a>
            <a
              href="/seed"
              className="inline-block border border-zinc-700 text-zinc-200 font-semibold px-8 py-3 rounded-lg hover:border-zinc-500 transition text-center"
            >
              Get the seed packet
            </a>
          </div>
        </section>

        <section className="pb-20">
          <div className="border border-zinc-800 rounded-lg p-8">
            <h2 className="text-xl font-semibold mb-2">Check your CLAUDE.md for drift</h2>
            <p className="text-zinc-400 text-sm mb-6">
              Paste it. We see drift, not docs. Two free checks a week.
            </p>
            <FreshnessTeaser />
          </div>
        </section>

        <section className="pb-20 text-center">
          <p className="text-sm text-zinc-500">
            <button
              type="button"
              onClick={() => window.history.replaceState({}, "", "/")}
              className="text-zinc-500 hover:text-zinc-300 transition underline"
            >
              Not sure which you are?
            </button>
          </p>
        </section>
      </div>
    );
  }

  // Audience-B: new to CLAUDE.md (default / ?rail=new)
  return (
    <div className="max-w-3xl mx-auto px-6">
      {/* Rail selector */}
      <section className="py-20">
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          <span className="text-amber-400">Your Claude.</span> Shaped around how you work.
        </h1>
        <p className="text-lg text-zinc-400 mb-10">
          CLAUDE.md is a file that tells Claude how to act, respond, and work with you.
          We create one based on how you actually think, or refine the one you already have.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <a
            href="/?rail=have"
            className="block border border-zinc-800 rounded-lg p-6 hover:border-amber-400/50 transition"
          >
            <h3 className="font-semibold text-lg mb-1">I have a CLAUDE.md</h3>
            <p className="text-sm text-amber-400 mb-2">Upgrade it</p>
            <p className="text-sm text-zinc-400">
              Check it for drift, get a skill pack, or build out your full ecosystem.
            </p>
          </a>
          <a
            href="/archetype"
            className="block border border-zinc-800 rounded-lg p-6 hover:border-amber-400/50 transition"
          >
            <h3 className="font-semibold text-lg mb-1">Starting fresh?</h3>
            <p className="text-sm text-amber-400 mb-2">Start here</p>
            <p className="text-sm text-zinc-400">
              Take the 5-question quiz. Get a seed packet shaped around how you actually work.
            </p>
          </a>
        </div>
      </section>

      <section className="pb-20 flex flex-col items-center gap-6 text-center">
        <a
          href="https://buy.stripe.com/8x27sLbRHfyC4VJ5UM0RG00"
          className="inline-block border border-amber-400/40 text-amber-400 text-sm font-medium px-6 py-2.5 rounded-lg hover:border-amber-400/70 hover:bg-amber-400/5 transition"
        >
          Support the project
        </a>
        <p className="text-sm text-zinc-500">
          Give your AI a personality shaped by how you actually think. And own it.{" "}
          <a href="/privacy" className="text-zinc-500 hover:text-zinc-300 transition underline">
            Privacy
          </a>
        </p>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-6 py-20" />}>
      <HomeContent />
    </Suspense>
  );
}
