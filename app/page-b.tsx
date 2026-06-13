import FreshnessTeaser from "@/app/components/FreshnessTeaser";

export default function HomeB() {
  return (
    <div className="max-w-3xl mx-auto px-6">
      {/* Hero — quiz-first */}
      <section className="py-20">
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Generate your CLAUDE.md.
        </h1>
        <p className="text-lg text-zinc-400 mb-8">
          5 questions. 2 minutes. Get a config shaped around how you actually work.
        </p>
        <a
          href="/archetype"
          className="inline-block bg-amber-400 text-zinc-950 font-semibold px-8 py-3 rounded-xl hover:bg-amber-300 transition"
        >
          Take the Quiz
        </a>
        <p className="mt-4 text-sm text-zinc-500">
          Already have a project?{" "}
          <a
            href="/generate"
            className="text-amber-400 underline hover:text-amber-300"
          >
            Paste your package.json
          </a>{" "}
          instead.
        </p>
      </section>

      {/* Secondary — freshness for returning users */}
      <section className="pb-20">
        <div className="border border-zinc-800 rounded-xl p-8">
          <h2 className="text-xl font-semibold mb-2">
            Already have a CLAUDE.md?
          </h2>
          <p className="text-zinc-400 text-sm mb-6">
            Paste it. We see drift, not docs. Two free a week.
          </p>
          <FreshnessTeaser />
        </div>
      </section>

      {/* The funnel */}
      <section id="products" className="pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/archetype"
            className="block border border-zinc-800 rounded-xl p-6 hover:border-amber-400/50 transition"
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
            className="block border border-zinc-800 rounded-xl p-6 hover:border-amber-400/50 transition"
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
            className="block border border-zinc-800 rounded-xl p-6 hover:border-amber-400/50 transition"
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
