// app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

// 本文 Inter / 見出し Cormorant
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// 公開URLを環境変数から（無ければローカル）
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "No.10 Family Office — Legacy & Innovation",
  description:
    "Stewarding multigenerational capital with craftsmanship, technology, and cultural impact.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "No.10 Family Office — Legacy & Innovation",
    description:
      "Stewarding multigenerational capital with craftsmanship, technology, and cultural impact.",
    url: "/",
    siteName: "No.10 Family Office",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "No.10 Family Office" }],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "No.10 Family Office — Legacy & Innovation",
    description:
      "Stewarding multigenerational capital with craftsmanship, technology, and cultural impact.",
    images: ["/og.jpg"],
  },
  icons: { icon: "/favicon.ico" },
  keywords: [
    "family office",
    "investment",
    "legacy",
    "venture",
    "culture",
    "philanthropy",
    "Japan",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="min-h-screen bg-neutral-50 text-neutral-900 selection:bg-black selection:text-white antialiased">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b border-neutral-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* 内部遷移は Link を使用 */}
            <Link href="/" className="group inline-flex items-baseline gap-2">
              <span className="font-display font-semibold tracking-wide text-2xl">No.10</span>
              <span className="text-sm uppercase tracking-[.25em] text-neutral-500 group-hover:text-neutral-900 transition">
                Family Office
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm">
              {/* 同一ページ内のアンカーは <a> でOK */}
              <a href="#ethos" className="hover:text-neutral-500 transition">Ethos</a>
              <a href="#legacy" className="hover:text-neutral-500 transition">Legacy</a>
              <a href="#portfolio" className="hover:text-neutral-500 transition">Portfolio</a>
              <a href="#people" className="hover:text-neutral-500 transition">People</a>
              <a href="#philanthropy" className="hover:text-neutral-500 transition">Philanthropy</a>
              <a
                href="#contact"
                className="inline-flex items-center rounded-full border border-neutral-300 px-3 py-1.5 hover:bg-black hover:text-white transition"
              >
                Contact
              </a>
            </nav>

            <button
              aria-label="Open menu"
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 hover:bg-neutral-100"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</main>

        {/* Footer */}
        <footer className="mt-24 border-t border-neutral-200 bg-white/90">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid gap-8 md:grid-cols-3">
            <div>
              <div className="font-display text-xl">No.10 Family Office</div>
              <p className="mt-2 text-sm text-neutral-600">
                Crafting long-term value across culture, technology, and communities.
              </p>
            </div>
            <div className="text-sm">
              <div className="font-medium text-neutral-900">Navigation</div>
              <ul className="mt-3 space-y-2">
                <li><a className="hover:text-neutral-500 transition" href="#ethos">Ethos</a></li>
                <li><a className="hover:text-neutral-500 transition" href="#legacy">Legacy</a></li>
                <li><a className="hover:text-neutral-500 transition" href="#portfolio">Portfolio</a></li>
                <li><a className="hover:text-neutral-500 transition" href="#people">People</a></li>
                <li><a className="hover:text-neutral-500 transition" href="#philanthropy">Philanthropy</a></li>
              </ul>
            </div>
            <div className="text-sm">
              <div className="font-medium text-neutral-900">Contact</div>
              <p className="mt-3 text-neutral-600">
                For partnerships and inquiries: <a href="#contact" className="underline">Get in touch</a>
              </p>
              <p className="mt-6 text-neutral-400 text-xs">
                © {new Date().getFullYear()} No.10 Family Office. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
