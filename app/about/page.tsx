export const metadata = {
  title: "About — 13inks",
  description: "AI personality, shaped by how you actually work. A small team building tools that adapt to you.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-zinc-300">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-3 text-zinc-100">
          AI that adapts to you, not the other way around.
        </h1>
        <p className="text-lg text-zinc-400">
          Most AI tools want you to flatten how you think into the model&apos;s defaults. We go the other way &mdash; figure out how you work, then ship config that makes your AI agent move the way you do.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">What we build</h2>
        <p className="mb-4 text-zinc-400">
          Your <span className="text-zinc-100 font-medium">seed</span> is a bundle &mdash; CLAUDE.md, skills, memories &mdash; tuned to how you think. Take the quiz, download the zip, paste it into your Claude Code project. Start a fresh session and the agent moves differently. Its defaults now match yours.
        </p>
        <p className="text-zinc-400">
          See the full lineup on the <a href="/#products" className="text-amber-400 hover:text-amber-300 transition">landing page</a>. What we do and don&apos;t store is anchored to file paths on the <a href="/privacy" className="text-amber-400 hover:text-amber-300 transition">privacy page</a>.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">Who we are</h2>
        <p className="text-zinc-400">
          We are a small, dedicated team at <span className="text-zinc-100 font-medium">MUCA Labs</span>. We build the engine underneath and ship the tools on top. The engine is private. The products are the surface.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">Why</h2>
        <p className="text-zinc-400 mb-4">
          Most software gets built for the median user. That&apos;s fine for spreadsheets. It&apos;s not fine for the tool you trust to ship code on your behalf.
        </p>
        <p className="text-zinc-400">
          We&apos;d rather build a small system that learns one person at a time than a big system that flattens everyone.
        </p>
      </section>
    </div>
  );
}
