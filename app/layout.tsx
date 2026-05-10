import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "13inks \u2014 AI personality, shaped by you",
  description:
    "Check drift. Discover your archetype. Generate a fresh CLAUDE.md.",
  openGraph: {
    title: "13inks \u2014 AI personality, shaped by you",
    description: "Check drift. Discover your archetype. Generate a fresh CLAUDE.md.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <nav className="border-b border-zinc-800 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <a href="/" className="text-xl font-bold tracking-tight">
              <span className="text-amber-400">13</span>inks
            </a>
            <div className="flex gap-6 text-sm text-zinc-400">
              <a href="/archetype" className="hover:text-zinc-100 transition">
                Archetype
              </a>
              <a href="/freshness" className="hover:text-zinc-100 transition">
                Freshness
              </a>
              <a href="/generate" className="hover:text-zinc-100 transition">
                Generate
              </a>
            </div>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-zinc-800 px-6 py-6 text-center text-sm text-zinc-500">
          <span className="text-zinc-300 font-medium">13inks</span> by MUCA Labs
        </footer>
      </body>
    </html>
  );
}
