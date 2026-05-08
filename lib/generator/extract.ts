// Repo-derived signal extraction.
// Pure function. No file I/O. No network. Inputs are strings/arrays only.
// Caller (route handler or CLI) is responsible for reading files.

import { GenerateInputs, RepoFacts } from "./types";

interface PackageJsonShape {
  name?: string;
  description?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  type?: string;
}

const FRAMEWORK_SIGNALS: { dep: string; label: (v: string) => string }[] = [
  { dep: "next", label: (v) => `Next.js ${majorOf(v)}` },
  { dep: "vite", label: (v) => `Vite ${majorOf(v)}` },
  { dep: "astro", label: (v) => `Astro ${majorOf(v)}` },
  { dep: "remix", label: (v) => `Remix ${majorOf(v)}` },
  { dep: "@remix-run/node", label: (v) => `Remix ${majorOf(v)}` },
  { dep: "nuxt", label: (v) => `Nuxt ${majorOf(v)}` },
  { dep: "@sveltejs/kit", label: (v) => `SvelteKit ${majorOf(v)}` },
  { dep: "express", label: (v) => `Express ${majorOf(v)}` },
  { dep: "fastify", label: (v) => `Fastify ${majorOf(v)}` },
  { dep: "hono", label: (v) => `Hono ${majorOf(v)}` },
];

const DEPLOYMENT_HINTS: { file: string; label: string }[] = [
  { file: "vercel.json", label: "Vercel" },
  { file: "wrangler.toml", label: "Cloudflare Workers" },
  { file: "wrangler.jsonc", label: "Cloudflare Workers" },
  { file: "fly.toml", label: "Fly.io" },
  { file: "netlify.toml", label: "Netlify" },
  { file: "Dockerfile", label: "Docker" },
  { file: "render.yaml", label: "Render" },
];

const COMMAND_LABELS: Record<string, string> = {
  dev: "Dev",
  start: "Start",
  build: "Build",
  test: "Test",
  typecheck: "Typecheck",
  "type-check": "Typecheck",
  lint: "Lint",
  format: "Format",
};

const DIR_ROLES: Record<string, string> = {
  app: "App Router pages and layouts",
  pages: "Pages Router routes",
  src: "source",
  lib: "shared utilities and modules",
  components: "shared React components",
  utils: "shared utilities",
  hooks: "React hooks",
  styles: "global styles",
  public: "static assets served as-is",
  api: "API routes",
  routes: "route handlers",
  server: "server-side code",
  client: "client-side code",
  tests: "tests",
  __tests__: "tests",
  test: "tests",
  e2e: "end-to-end tests",
  scripts: "build and dev scripts",
  docs: "documentation",
};

function majorOf(version: string): string {
  const m = /(\d+)/.exec(version || "");
  return m ? m[1] : "";
}

function safeParseJson<T>(text?: string): T | null {
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function inDeps(
  pkg: PackageJsonShape,
  name: string,
): string | undefined {
  return pkg.dependencies?.[name] ?? pkg.devDependencies?.[name];
}

function detectFramework(pkg: PackageJsonShape): string | undefined {
  for (const { dep, label } of FRAMEWORK_SIGNALS) {
    const v = inDeps(pkg, dep);
    if (v) return label(v);
  }
  return undefined;
}

function detectDeployment(dirListing: string[]): string | undefined {
  const flat = dirListing.map((d) => d.replace(/\/$/, ""));
  for (const { file, label } of DEPLOYMENT_HINTS) {
    if (flat.includes(file)) return label;
  }
  return undefined;
}

function detectLockfile(dirListing: string[]): string | undefined {
  const flat = dirListing.map((d) => d.replace(/\/$/, ""));
  if (flat.includes("pnpm-lock.yaml"))
    return "uses pnpm (pnpm-lock.yaml present); don't run npm or yarn";
  if (flat.includes("bun.lockb") || flat.includes("bun.lock"))
    return "uses bun (bun.lock present); don't run npm or yarn";
  if (flat.includes("yarn.lock"))
    return "uses yarn (yarn.lock present); don't run npm or pnpm";
  if (flat.includes("package-lock.json"))
    return "uses npm (package-lock.json present)";
  return undefined;
}

function detectConventions(
  pkg: PackageJsonShape,
  dirListing: string[],
): string[] {
  const out: string[] = [];

  const lock = detectLockfile(dirListing);
  if (lock) out.push(lock);

  // ORM
  if (inDeps(pkg, "drizzle-orm") || dirListing.includes("drizzle.config.ts")) {
    out.push("Drizzle ORM (not Prisma)");
  } else if (inDeps(pkg, "@prisma/client") || dirListing.includes("prisma/")) {
    out.push("Prisma ORM");
  } else if (inDeps(pkg, "kysely")) {
    out.push("Kysely query builder");
  }

  // Test framework
  if (inDeps(pkg, "vitest")) out.push("Vitest for tests (not Jest)");
  else if (inDeps(pkg, "jest")) out.push("Jest for tests");
  else if (inDeps(pkg, "@playwright/test")) out.push("Playwright for tests");

  // Styling
  if (inDeps(pkg, "tailwindcss")) out.push("Tailwind for styling");
  else if (inDeps(pkg, "styled-components"))
    out.push("styled-components for styling");
  else if (inDeps(pkg, "@emotion/react")) out.push("Emotion for styling");

  // App vs Pages router (Next.js)
  const flat = dirListing.map((d) => d.replace(/\/$/, ""));
  if (flat.includes("app") && !flat.includes("pages")) {
    out.push("App Router (no pages/ directory)");
  } else if (flat.includes("pages") && !flat.includes("app")) {
    out.push("Pages Router");
  }

  // TypeScript ESM
  if (pkg.type === "module") out.push("ESM (\"type\": \"module\" in package.json)");

  return out;
}

function extractFirstParagraph(readme?: string): string | undefined {
  if (!readme) return undefined;
  // Strip leading badges and headings, take the first non-heading paragraph.
  const lines = readme.split("\n");
  const buf: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      if (buf.length > 0) break;
      continue;
    }
    if (line.startsWith("#")) continue;
    if (line.startsWith("![")) continue; // badge or image
    if (line.startsWith("[![")) continue; // badge link
    buf.push(line);
    if (buf.join(" ").length >= 200) break;
  }
  if (buf.length === 0) return undefined;
  let para = buf.join(" ");
  if (para.length > 160) para = para.slice(0, 157).trimEnd() + "...";
  return para;
}

function classifyDirs(
  dirListing: string[],
): { dir: string; role?: string }[] {
  const out: { dir: string; role?: string }[] = [];
  for (const raw of dirListing) {
    // Only top-level directories — entries ending in / or matching known dir names.
    const trimmed = raw.replace(/\/$/, "");
    if (!trimmed) continue;
    if (trimmed.includes("/")) continue; // skip nested
    if (trimmed.startsWith(".")) continue; // skip dotfiles/dotdirs
    if (!raw.endsWith("/") && !DIR_ROLES[trimmed]) continue; // not clearly a dir
    const role = DIR_ROLES[trimmed];
    out.push({ dir: trimmed, role });
  }
  // Cap at 8 dirs to keep the file under the line budget.
  return out.slice(0, 8);
}

function extractCommands(
  pkg: PackageJsonShape,
): { label: string; cmd: string; note?: string }[] {
  const scripts = pkg.scripts ?? {};
  const out: { label: string; cmd: string; note?: string }[] = [];
  // Order matters — keep a predictable presentation.
  const order = ["dev", "start", "build", "test", "typecheck", "type-check", "lint", "format"];
  for (const key of order) {
    const cmd = scripts[key];
    if (!cmd) continue;
    out.push({ label: COMMAND_LABELS[key] ?? key, cmd: `npm run ${key}` });
  }
  return out;
}

export function extractFacts(inputs: GenerateInputs): RepoFacts {
  const pkg = safeParseJson<PackageJsonShape>(inputs.packageJson) ?? {};
  const dirs = inputs.dirListing ?? [];

  const facts: RepoFacts = {
    name: pkg.name,
    description: extractFirstParagraph(inputs.readme),
    framework: detectFramework(pkg),
    deployment: detectDeployment(dirs),
    commands: extractCommands(pkg),
    layout: classifyDirs(dirs),
    conventions: detectConventions(pkg, dirs),
  };

  return facts;
}
