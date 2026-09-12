// app/layout.tsx

import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MikanNav from "@/components/MikanNav";
import type { Metadata, Viewport } from "next";

const siteName = "山口みかん農園";
const siteUrl = "https://yamaguchi-mikan.vercel.app";

const defaultTitle =
  "山川みかん｜山口みかん農園【福岡県みやま市・農家直送】";

const siteDescription =
  "福岡県みやま市の山口みかん農園。山川みかんを中心に、旬のみかんを農家直送・産地直送で全国発送しています。早味かん、日南、北原早生など、福岡県みやま市で育てたみかんを農園から直接お届けします。";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  // =========================
  // TITLE
  // =========================
  title: {
    default: defaultTitle,
    template: `%s｜${siteName}`,
  },

  // =========================
  // DESCRIPTION
  // =========================
  description: siteDescription,

  // keywords自体のSEO効果は限定的ですが、
  // サイトテーマを整理する意味で残します。
  keywords: [
    "山川みかん",
    "山川 みかん",
    "山川みかん 通販",
    "山川みかん お取り寄せ",
    "山川みかん 農園",
    "山川みかん 直売",
    "みやま市 山川みかん",
    "みやま市 みかん",
    "福岡 山川みかん",
    "福岡 みかん",
    "福岡県産 みかん",
    "山口みかん農園",
    "山口農園",
    "みかん 通販",
    "みかん お取り寄せ",
    "みかん 購入",
    "農家直送 みかん",
    "産地直送 みかん",
    "直売所 みかん",
    "早味かん",
    "日南みかん",
    "北原早生",
  ],

  // =========================
  // CANONICAL
  // =========================
  alternates: {
    canonical: "/",
  },

  // =========================
  // GOOGLE SEARCH CONSOLE
  // =========================
  verification: {
    google: "7o9WMb-8_znavqpAlo0-Y6WUuuIyb_jwnVCK8n8-cbI",
  },

  // =========================
  // SITE / AUTHOR
  // =========================
  applicationName: siteName,

  authors: [
    {
      name: siteName,
      url: siteUrl,
    },
  ],

  creator: siteName,
  publisher: siteName,

  category: "shopping",

  manifest: "/site.webmanifest",

  // =========================
  // OPEN GRAPH
  // =========================
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    siteName,

    title: defaultTitle,

    description: siteDescription,

    images: [
      {
        url: "/ogp.jpg",
        width: 1200,
        height: 630,
        alt: "福岡県みやま市の山川みかん・山口みかん農園",
      },
    ],
  },

  // =========================
  // X / TWITTER
  // =========================
  twitter: {
    card: "summary_large_image",

    title: defaultTitle,

    description: siteDescription,

    images: ["/ogp.jpg"],
  },

  // =========================
  // ROBOTS
  // =========================
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

  // =========================
  // ICONS
  // =========================
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/favicon-16x16.png",
        type: "image/png",
        sizes: "16x16",
      },
      {
        url: "/favicon-32x32.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "/android-chrome-192x192.png",
        type: "image/png",
        sizes: "192x192",
      },
      {
        url: "/android-chrome-512x512.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],

    shortcut: ["/favicon.ico"],

    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],

    other: [
      {
        rel: "mask-icon",
        url: "/favicon.ico",
      },
    ],
  },
};

// =========================
// VIEWPORT
// =========================
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#eea45a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // =========================
  // WEBSITE STRUCTURED DATA
  // =========================
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",

    "@id": `${siteUrl}/#website`,

    url: siteUrl,

    name: siteName,

    alternateName: [
      "山口農園",
      "山川みかん 山口みかん農園",
      "山川みかん通販",
      "福岡県みやま市 山口みかん農園",
    ],

    description: siteDescription,

    inLanguage: "ja-JP",

    publisher: {
      "@id": `${siteUrl}/#organization`,
    },
  };

  // =========================
  // ORGANIZATION
  // =========================
  const organizationJsonLd = {
    "@context": "https://schema.org",

    "@type": [
      "Organization",
      "LocalBusiness",
    ],

    "@id": `${siteUrl}/#organization`,

    name: siteName,

    alternateName: [
      "山口農園",
      "山川みかん 山口みかん農園",
    ],

    url: siteUrl,

    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/icon.png`,
    },

    image: `${siteUrl}/ogp.jpg`,

    description: siteDescription,

    email: "yamaguchinouen0915@gmail.com",

    telephone: "080-1543-9704",

    address: {
      "@type": "PostalAddress",

      addressCountry: "JP",

      addressRegion: "福岡県",

      addressLocality: "みやま市",

      streetAddress: "瀬高町上庄63-11",
    },

    areaServed: [
      {
        "@type": "AdministrativeArea",
        name: "福岡県",
      },
      {
        "@type": "City",
        name: "みやま市",
      },
      {
        "@type": "Country",
        name: "日本",
      },
    ],

    knowsAbout: [
      "山川みかん",
      "みかん栽培",
      "福岡県産みかん",
      "農家直送みかん",
      "産地直送みかん",
      "早味かん",
      "日南みかん",
      "北原早生",
    ],
  };

  // =========================
  // BREADCRUMB
  // =========================
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",

    "@type": "BreadcrumbList",

    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "山川みかん｜山口みかん農園",
        item: siteUrl,
      },
    ],
  };

  return (
    <html lang="ja">
      <body className="text-[#36332e]">

        {/* WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />

        {/* Organization / LocalBusiness */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />

        {/* Breadcrumb */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbJsonLd),
          }}
        />

        <Header />

        <div className="pt-[64px]">
          <MikanNav />
        </div>

        <main className="main-container mt-4">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}