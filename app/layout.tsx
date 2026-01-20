// app/layout.tsx
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MikanNav from "@/components/MikanNav";
import type { Metadata, Viewport } from "next";

/** ページ基本情報 + アイコン完全版 */
export const metadata: Metadata = {
  title: "山口みかん農園 | 北原早生・直売所",
  description:
    "太陽と海風が育てた山口みかん。北原早生を中心に、旬の味を農家直売でお届けします。",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" }, // 既存ICO（あればそのまま）
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  themeColor: "#eea45a",
  applicationName: "山口みかん農園",
  generator: "Next.js",
};

/** iOS/Safari ズーム挙動などの基本Viewport（任意） */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="text-[#36332e]">
        <Header />
        {/* Header高さ分をここで一元管理 */}
        <div className="pt-[64px]">
          <MikanNav />
        </div>

        <main className="main-container mt-4">{children}</main>

        <Footer />
      </body>
    </html>
  );
}
