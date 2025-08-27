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
      <body>
        <NavBar />
        {children}
        {/* 全ページ共通：遷移時に被せる */}
        <LoadingOverlay />
      </body>
    </html>
  );
}
