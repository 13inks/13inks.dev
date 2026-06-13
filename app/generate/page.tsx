// CLAUDE.md generator — Tier 1 web surface.
// Input: README.md + directory listing (package.json removed — CLAUDE.md is language-agnostic).
// Anonymous quota: 2 free per fingerprint per 7-day window.
// Paid one-time ($1) or subscriber bypasses quota.

"use client";

import { useEffect, useState } from "react";

const FP_KEY = "freshness_fp";
const PENDING_KEY = "generate_pending_inputs";

interface GenerateInputs {
  readme?: string;
  dirListing?: string[];
}

interface GenerateResult {
  generated: string;
  sectionsUsed: string[];
  tier: "free" | "paid";
  quota?: { used: number; remaining: number; resetAt: string };
}

interface QuotaError {
  error: "quota_exhausted";
  message: string;
  quota: { used: number; remaining: number; resetAt: string };
  options: {
    single_check: { price_cents: number; label: string };
    subscribe: { price_cents: number; label: string };
  };
}

const README_PLACEHOLDER = `# your-project

A short description of what this project is. The first paragraph here
becomes the "What this is" section in your generated CLAUDE.md.`;

const DIRS_PLACEHOLDER = `app/
components/
lib/
public/
package.json
README.md
tsconfig.json`;

function getFingerprint(): string {
  if (typeof window === "undefined") return "";
  let fp = window.localStorage.getItem(FP_KEY);
  if (!fp) {
    fp =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    window.localStorage.setItem(FP_KEY, fp);
  }
  return fp;
}

function parseDirListing(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

export default function GeneratePage() {
  const [readme, setReadme] = useState("");
  const [dirs, setDirs] = useState("");
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [quotaError, setQuotaError] = useState<QuotaError | null>(null);
  const [loading, setLoading] = useState(false);
  const [genericError, setGenericError] = useState<string | null>(null);
  const [fp, setFp] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setFp(getFingerprint());
    redeemFromUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function redeemFromUrl() {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) return;

    window.history.replaceState({}, "", "/generate");

    const pendingRaw = window.localStorage.getItem(PENDING_KEY) || "";
    let pending: GenerateInputs | null = null;
    try {
      pending = pendingRaw ? (JSON.parse(pendingRaw) as GenerateInputs) : null;
    } catch {
      pending = null;
    }

    setLoading(true);
    try {
      const r = await fetch("/api/checkout/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      if (!r.ok) {
        setGenericError("Payment didn't validate. Try again.");
        return;
      }
      const { token } = (await r.json()) as { token: string };

      if (!pending) {
        setGenericError(
          "Payment cleared. Paste the inputs again — we don't hold onto them.",
        );
        return;
      }

      const c = await fetch("/api/generate-claudemd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs: pending,
          paid: true,
          paid_token: token,
        }),
      });
      if (!c.ok) {
        setGenericError("Generator didn't respond. Try again.");
        return;
      }
      const data = (await c.json()) as GenerateResult;
      setReadme(pending.readme ?? "");
      setDirs((pending.dirListing ?? []).join("\n"));
      setResult(data);
      window.localStorage.removeItem(PENDING_KEY);
    } catch {
      setGenericError("Something went sideways during redeem. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function buildInputs(): GenerateInputs {
    return {
      readme: readme.trim() || undefined,
      dirListing: dirs.trim() ? parseDirListing(dirs) : undefined,
    };
  }

  function hasAnyInput(): boolean {
    return Boolean(readme.trim() || dirs.trim());
  }

  async function generate() {
    setGenericError(null);
    setQuotaError(null);
    setResult(null);
    setLoading(true);

    try {
      const inputs = buildInputs();
      const r = await fetch("/api/generate-claudemd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs, fingerprint: fp }),
      });
      if (r.status === 402) {
        const err = (await r.json()) as QuotaError;
        setQuotaError(err);
        window.localStorage.setItem(PENDING_KEY, JSON.stringify(inputs));
        return;
      }
      if (!r.ok) {
        setGenericError("Generator didn't respond. Try again.");
        return;
      }
      const data = (await r.json()) as GenerateResult;
      setResult(data);
    } catch {
      setGenericError("Something went sideways. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function startCheckout(mode: "single" | "bundle" | "sub") {
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, fingerprint: fp }),
      });
      if (!r.ok) {
        setGenericError("Checkout didn't open. Try again.");
        return;
      }
      const { url } = (await r.json()) as { url: string };
      window.location.href = url;
    } catch {
      setGenericError("Checkout didn't open. Try again.");
    }
  }

  function reset() {
    setResult(null);
    setQuotaError(null);
    setGenericError(null);
    setReadme("");
    setDirs("");
  }

  async function copyToClipboard() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.generated);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setGenericError("Couldn't copy. Try downloading instead.");
    }
  }

  function download() {
    if (!result) return;
    const blob = new Blob([result.generated], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "CLAUDE.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Tell Claude what your project actually is.
        </h1>
        <p className="text-lg text-zinc-400">
          Paste your README and directory structure. Get a CLAUDE.md in 30 seconds.
        </p>
      </header>

      {!result && !quotaError && (
        <div className="space-y-6 mb-10">
          <Field
            label="README.md"
            hint="The first paragraph becomes the project description."
            optional
          >
            <textarea
              value={readme}
              onChange={(e) => setReadme(e.target.value)}
              placeholder={README_PLACEHOLDER}
              rows={6}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-sm focus:outline-none focus:border-zinc-600 resize-y"
            />
          </Field>

          <Field
            label="Top-level files & dirs"
            hint="One per line. Trailing slash for directories. Run `ls -p` and paste."
            optional
          >
            <textarea
              value={dirs}
              onChange={(e) => setDirs(e.target.value)}
              placeholder={DIRS_PLACEHOLDER}
              rows={6}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-sm focus:outline-none focus:border-zinc-600 resize-y"
            />
          </Field>

          <div className="flex items-center justify-between">
            <button
              onClick={generate}
              disabled={loading || !hasAnyInput()}
              className="bg-amber-400 text-zinc-950 font-semibold px-6 py-2.5 rounded-xl hover:bg-amber-300 disabled:opacity-40 transition"
            >
              {loading ? "Reading…" : "Generate"}
            </button>
            <a
              href="/privacy"
              className="text-xs text-zinc-500 underline hover:text-zinc-300"
            >
              See what we keep
            </a>
          </div>
        </div>
      )}

      {genericError && (
        <div className="mb-10 p-4 border border-zinc-800 rounded-xl text-zinc-400">
          {genericError}
          <button
            onClick={() => setGenericError(null)}
            className="ml-3 text-zinc-500 underline hover:text-zinc-300"
          >
            close
          </button>
        </div>
      )}

      {quotaError && (
        <PaywallCard
          err={quotaError}
          onReset={reset}
          onCheckout={startCheckout}
        />
      )}

      {result && (
        <ResultCard
          result={result}
          onCopy={copyToClipboard}
          onDownload={download}
          onReset={reset}
          copied={copied}
        />
      )}

      <footer className="mt-24 pt-8 border-t border-zinc-900 text-xs text-zinc-600">
        <p>
          13inks.{" "}
          <a href="/privacy" className="underline hover:text-zinc-400">
            We don&apos;t keep your file.
          </a>
        </p>
      </footer>
    </div>
  );
}

function Field({
  label,
  hint,
  optional,
  children,
}: {
  label: string;
  hint: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-zinc-200">
          {label}
          {optional && (
            <span className="ml-2 text-xs text-zinc-500">optional</span>
          )}
        </label>
      </div>
      <p className="text-xs text-zinc-500">{hint}</p>
      {children}
    </div>
  );
}

function ResultCard({
  result,
  onCopy,
  onDownload,
  onReset,
  copied,
}: {
  result: GenerateResult;
  onCopy: () => void;
  onDownload: () => void;
  onReset: () => void;
  copied: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-6 p-6 border border-emerald-400/30 rounded-xl">
        <div>
          <p className="text-emerald-400 text-sm font-medium uppercase tracking-wide mb-1">
            Generated
          </p>
          <p className="text-zinc-300">
            {result.sectionsUsed.length} sections, ready to drop into your repo
            as <code className="font-mono text-zinc-200">CLAUDE.md</code>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            className="bg-zinc-800 text-zinc-200 text-sm font-medium px-4 py-2 rounded-xl hover:bg-zinc-700 transition"
          >
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={onDownload}
            className="bg-amber-400 text-zinc-950 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-amber-300 transition"
          >
            Download
          </button>
        </div>
      </div>

      <pre className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 font-mono text-sm text-zinc-200 overflow-x-auto whitespace-pre-wrap">
        {result.generated}
      </pre>

      <div className="p-6 border border-zinc-800 rounded-xl flex items-center justify-between gap-6">
        <div>
          <p className="text-zinc-200 font-medium mb-1">
            Want to keep this fresh?
          </p>
          <p className="text-sm text-zinc-400">
            We&apos;ll flag drift when your code moves on. $1 per check, $9/mo
            for ongoing.
          </p>
        </div>
        <a
          href="/freshness"
          className="text-amber-400 text-sm font-medium hover:text-amber-300 underline whitespace-nowrap"
        >
          Schedule a check →
        </a>
      </div>

      <div className="flex justify-between pt-2">
        <button
          onClick={onReset}
          className="text-sm text-zinc-500 underline hover:text-zinc-300"
        >
          Start over
        </button>
        {result.quota && (
          <p className="text-xs text-zinc-500">
            {result.quota.remaining} free check
            {result.quota.remaining === 1 ? "" : "s"} left this week
          </p>
        )}
      </div>
    </div>
  );
}

function PaywallCard({
  err,
  onReset,
  onCheckout,
}: {
  err: QuotaError;
  onReset: () => void;
  onCheckout: (mode: "single" | "bundle" | "sub") => void;
}) {
  return (
    <div className="space-y-6">
      <div className="p-6 border border-zinc-800 rounded-xl">
        <p className="text-zinc-200 font-medium mb-1">{err.message}</p>
        <p className="text-sm text-zinc-500">
          Resets {new Date(err.quota.resetAt).toLocaleDateString()}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => onCheckout("single")}
          className="text-left p-6 border border-zinc-800 rounded-xl hover:border-zinc-600 transition"
        >
          <p className="text-zinc-100 font-semibold mb-1">Single — $1</p>
          <p className="text-sm text-zinc-400">
            Generate this file once. Pay-as-you-go.
          </p>
        </button>
        <button
          onClick={() => onCheckout("sub")}
          className="text-left p-6 border border-zinc-800 rounded-xl hover:border-zinc-600 transition"
        >
          <p className="text-zinc-100 font-semibold mb-1">Subscribe — $9/mo</p>
          <p className="text-sm text-zinc-400">
            12 credits a month. Rolls over forever.
          </p>
        </button>
      </div>

      <div className="pt-2">
        <button
          onClick={onReset}
          className="text-sm text-zinc-500 underline hover:text-zinc-300"
        >
          Start over
        </button>
      </div>
    </div>
  );
}
