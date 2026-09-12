// app/page.tsx

import type { Metadata } from "next";
import HomeClient from "./HomeClient";

const SITE_NAME = "山口みかん農園";
const SITE_URL = "https://yamaguchi-mikan.vercel.app";

const TITLE =
  "山川みかん｜山口みかん農園【福岡県みやま市・農家直送】";

const DESCRIPTION =
  "福岡県みやま市の山口みかん農園。山川みかんを中心に、早味かん・日南・北原早生など旬のみかんを栽培し、農家直送・産地直送で全国へお届けしています。山川みかんの通販・お取り寄せなら山口みかん農園。";

/* =========================================================
   トップページ専用 SEO Metadata
========================================================= */
export const metadata: Metadata = {
  /**
   * layout.tsx の title.template による
   * 「山口みかん農園」の二重表示を防ぐため absolute を使用
   */
  title: {
    absolute: TITLE,
  },

  description: DESCRIPTION,

  applicationName: SITE_NAME,

  authors: [
    {
      name: SITE_NAME,
      url: SITE_URL,
    },
  ],

  creator: SITE_NAME,
  publisher: SITE_NAME,

  /**
   * トップページの正規URL
   */
  alternates: {
    canonical: SITE_URL,
  },

  /**
   * 検索エンジンへのクロール指示
   */
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

  /**
   * SNS・Google Discover等で利用される情報
   */
  openGraph: {
    type: "website",

    locale: "ja_JP",

    url: SITE_URL,

    siteName: SITE_NAME,

    title: TITLE,

    description: DESCRIPTION,

    images: [
      {
        url: `${SITE_URL}/ogp.jpg`,
        width: 1200,
        height: 630,
        alt: "福岡県みやま市の山川みかん｜山口みかん農園",
      },
    ],
  },

  /**
   * X（旧Twitter）
   */
  twitter: {
    card: "summary_large_image",

    title: TITLE,

    description: DESCRIPTION,

    images: [`${SITE_URL}/ogp.jpg`],
  },

  /**
   * 検索結果のカテゴリ認識補助
   */
  category: "shopping",
};

/* =========================================================
   トップページ
========================================================= */
export default function Page() {
  /**
   * WebPage 構造化データ
   *
   * layout.tsx 側
   * ・WebSite
   * ・Organization / LocalBusiness
   *
   * page.tsx 側
   * ・WebPage
   *
   * と役割を分ける
   */
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",

    "@id": `${SITE_URL}/#webpage`,

    url: SITE_URL,

    name: TITLE,

    description: DESCRIPTION,

    inLanguage: "ja-JP",

    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },

    about: {
      "@id": `${SITE_URL}/#organization`,
    },

    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },

    breadcrumb: {
      "@id": `${SITE_URL}/#breadcrumb`,
    },

    primaryImageOfPage: {
      "@type": "ImageObject",
      url: `${SITE_URL}/ogp.jpg`,
      width: 1200,
      height: 630,
    },

    keywords: [
      "山川みかん",
      "山川 みかん",
      "山川みかん 通販",
      "山川みかん お取り寄せ",
      "山川みかん 農園",
      "みやま市 山川みかん",
      "福岡 山川みかん",
      "福岡県産みかん",
      "山口みかん農園",
      "農家直送みかん",
      "産地直送みかん",
      "早味かん",
      "日南みかん",
      "北原早生",
    ],
  };

  return (
    <>
      {/* =====================================================
          SEO構造化データ
      ===================================================== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webPageJsonLd),
        }}
      />

      {/* =====================================================
          実際のホーム画面
      ===================================================== */}
      <HomeClient />
    </>
  );
}