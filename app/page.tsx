const PRODUCTS = [
  {
    name: "Archetype",
    tagline: "Know thyself",
    description: "Discover your AI working style. Get a personalized config in 2 minutes.",
    href: "/archetype",
    status: "live",
  },
  {
    name: "Freshness",
    tagline: "Keep it real",
    description: "Is your CLAUDE.md lying? Paste it, get a drift score and fixes.",
    href: "/freshness",
    status: "soon",
  },
  {
    name: "Generate",
    tagline: "Start clean",
    description: "No CLAUDE.md yet? Paste your repo. Get a working file in 30 seconds.",
    href: "/generate",
    status: "soon",
  },
  {
    name: "Market",
    tagline: "Steal genius",
    description: "Curated skill packs from expert workflows. Install in one click.",
    href: "#",
    status: "soon",
  },
  {
    name: "Sentinel",
    tagline: "Catch errors",
    description: "Your AI keeps making the same mistakes. Sentinel catches the pattern.",
    href: "#",
    status: "soon",
  },
  {
    name: "Chelate",
    tagline: "Ship anywhere",
    description: "Cross-compile your Rust project to every platform. One command.",
    href: "#",
    status: "soon",
  },
  {
    name: "Captain",
    tagline: "Navigate complex",
    description: "Enterprise document intelligence. Extraction, validation, reporting.",
    href: "#",
    status: "soon",
  },
];

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-6">
      {/* Hero */}
      <section className="py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          Your AI crew is waiting.
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
          Thirteen specialists trained on how{" "}
          <span className="text-zinc-100 font-medium">you</span> work. Not
          another generic assistant &mdash; a crew that knows your patterns,
          catches your mistakes, and ships your style.
        </p>
        <a
          href="/archetype"
          className="inline-block bg-amber-400 text-zinc-950 font-semibold px-8 py-3 rounded-lg hover:bg-amber-300 transition"
        >
          Meet Your Crew &rarr;
        </a>
      </section>

      {/* Products */}
      <section id="products" className="pb-24">
        <h2 className="text-2xl font-bold mb-8 text-center">The Crew</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRODUCTS.map((product) => (
            <a
              key={product.name}
              href={product.href}
              className={`block border border-zinc-800 rounded-lg p-6 hover:border-zinc-600 transition ${
                product.status === "soon"
                  ? "opacity-60 pointer-events-none"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                {product.status === "soon" && (
                  <span className="text-xs text-zinc-500 border border-zinc-700 px-2 py-0.5 rounded">
                    soon
                  </span>
                )}
              </div>
              <p className="text-sm text-amber-400 mb-2">{product.tagline}</p>
              <p className="text-sm text-zinc-400">{product.description}</p>
            </a>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="pb-24 text-center">
        <h2 className="text-2xl font-bold mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
          {[
            { step: "1", text: "Take the quiz (2 min)" },
            { step: "2", text: "Get your archetype + crew" },
            { step: "3", text: "Download your seed config" },
            { step: "4", text: "Paste into Claude Code" },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center gap-2">
              <span className="text-2xl font-bold text-amber-400">
                {item.step}
              </span>
              <span className="text-zinc-300">{item.text}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
