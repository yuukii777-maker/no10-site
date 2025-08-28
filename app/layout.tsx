// app/layout.tsx
import "./globals.css";
import type { Metadata, Viewport } from "next";
import NavBar from "@/app/components/NavBar";
import LoadingOverlay from "@/app/components/LoadingOverlay";

export const metadata: Metadata = {
  title: "VOLCE",
  description: "VOLCE official site",
};

export const viewport: Viewport = {
  themeColor: "#0b0f18",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        {/* 画像ホスト（Drive サムネ対応） */}
        <link rel="preconnect" href="https://lh3.googleusercontent.com" crossOrigin="" />

        {/* 初画に必要な背景などを先読み（安全） */}
        <link rel="preload" as="image" href="/sanctum/background_sky.png" />
        <link rel="preload" as="image" href="/sanctum/temple_main.png" />
        <link rel="preload" as="image" href="/sanctum/cloud_strip.png" />
        <link rel="preload" as="image" href="/RULE/bg_base.jpg" />
        <link rel="preload" as="image" href="/RULE/volce-logo-3d.png" />
      </head>
      <body>
        <NavBar />
        {children}
        {/* 全ページ共通：遷移時に被せる */}
        <LoadingOverlay />
      </body>
    </html>
  );
}
