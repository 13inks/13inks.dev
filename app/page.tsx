import FreshnessTeaser from "@/app/components/FreshnessTeaser";

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto px-6">
      {/* Hero — immediate utility */}
      <section className="py-20">
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Your CLAUDE.md was written for code that&apos;s moved on.
        </h1>
        <p className="text-lg text-zinc-400 mb-8">
          Paste it. We see drift, not docs. Two free a week.
        </p>
        <FreshnessTeaser />
        <p className="mt-4 text-sm text-zinc-500">
          No CLAUDE.md yet?{" "}
          <a
            href="/archetype"
            className="text-amber-400 underline hover:text-amber-300"
          >
            Take the quiz
          </a>{" "}
          or{" "}
          <a
            href="/generate"
            className="text-amber-400 underline hover:text-amber-300"
          >
            generate one
          </a>
          .
        </p>
      </section>

      {/* The funnel */}
      <section className="pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/archetype"
            className="block border border-zinc-800 rounded-lg p-6 hover:border-amber-400/50 transition"
          >
            <h3 className="font-semibold text-lg mb-1">Archetype</h3>
            <p className="text-sm text-amber-400 mb-2">Know thyself</p>
            <p className="text-sm text-zinc-400">
              Don&apos;t have a CLAUDE.md yet? 5 questions, 2 minutes.
              Discover how you work and get a config shaped around it.
            </p>
          </a>

          <a
            href="/generate"
            className="block border border-zinc-800 rounded-lg p-6 hover:border-amber-400/50 transition"
          >
            <h3 className="font-semibold text-lg mb-1">Generate</h3>
            <p className="text-sm text-amber-400 mb-2">Start clean</p>
            <p className="text-sm text-zinc-400">
              Paste your package.json. Get a CLAUDE.md in 30 seconds.
              No quiz required.
            </p>
          </a>

          <a
            href="/freshness"
            className="block border border-zinc-800 rounded-lg p-6 hover:border-amber-400/50 transition"
          >
            <h3 className="font-semibold text-lg mb-1">Freshness</h3>
            <p className="text-sm text-amber-400 mb-2">Keep it real</p>
            <p className="text-sm text-zinc-400">
              Already have one? Check it for drift.
              We flag claims your code has outgrown.
            </p>
          </a>
        </div>
      </section>

      {/* Brand */}
      <section className="pb-20 text-center">
        <p className="text-sm text-zinc-500">
          Give your AI a personality shaped by how you actually think.
          And own it.
        </p>
      </section>
    </div>
  );
}
