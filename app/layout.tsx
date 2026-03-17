// app/layout.tsx
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MikanNav from "@/components/MikanNav";
import type { Metadata, Viewport } from "next";

const siteName = "山口みかん農園";
const siteUrl = "https://yamaguchi-mikan.vercel.app";
const siteDescription =
  "農家直送のみかんを全国発送。太陽と海風が育てた福岡県産のみかんを中心に、旬の味を農家直売でお届けします。みかん通販・産地直送なら山口みかん農園。";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "山口みかん農園 | 農家直送のみかんを全国発送",
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "山口みかん農園",
    "みかん 購入",
    "みかん 通販",
    "農家直送 みかん",
    "産地直送 みかん",
    "福岡 みかん",
    "福岡県産 みかん",
    "みかん お取り寄せ",
    "文旦 通販",
    "直売所 みかん",
  ],
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    google: "7o9WMb-8_znavqpAlo0-Y6WUuuIyb_jwnVCK8n8-cbI",
  },
  applicationName: siteName,
  generator: "Next.js",
  category: "shopping",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    siteName,
    title: "山口みかん農園 | 農家直送のみかんを全国発送",
    description: siteDescription,
    images: [
      {
        url: "/ogp.jpg",
        width: 1200,
        height: 630,
        alt: "山口みかん農園",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "山口みかん農園 | 農家直送のみかんを全国発送",
    description: siteDescription,
    images: ["/ogp.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#eea45a",
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

        <div className="pt-[64px]">
          <MikanNav />
        </div>

        <main className="main-container mt-4">{children}</main>

        <Footer />
      </body>
    </html>
  );
}