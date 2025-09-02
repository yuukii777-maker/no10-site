// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import NavBar from "./components/NavBar";
import LoadingOverlay from "./components/LoadingOverlay";
import BaseBoot from "./components/BaseBoot";

const SHA = (
  process.env.NEXT_PUBLIC_COMMIT_SHA ??
  process.env.VERCEL_GIT_COMMIT_SHA ??
  ""
).toString().slice(0, 8);
const Q = SHA ? `?v=${SHA}` : "";

export const metadata: Metadata = {
  title: "VOLCE",
  description: "VOLCE Portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        {/* 初回表示の体感UP（ヒーロー周りだけ） */}
        <link rel="preload" as="image" href={`/portal/background2.webp${Q}`} />
        <link rel="preload" as="image" href={`/portal/cloud_mid.webp${Q}`} />
        <link rel="preload" as="image" href={`/portal/cloud_near.webp${Q}`} />
        <meta name="theme-color" content="#0a0f1a" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-[#0a0f1a] text-white antialiased">
        <BaseBoot />
        <LoadingOverlay />
        <NavBar />
        {children}
      </body>
    </html>
  );
}
