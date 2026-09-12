// app/robots.ts

import type { MetadataRoute } from "next";

const BASE_URL = "https://yamaguchi-mikan.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",

        // 公開ページはクロール許可
        allow: "/",

        // 管理画面・APIはクロールさせない
        disallow: [
          "/admin/",
          "/api/",
        ],
      },

      // Googlebotにも同じルールを明示
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
        ],
      },
    ],

    // XMLサイトマップ
    sitemap: `${BASE_URL}/sitemap.xml`,

    // サイトの基準URL
    host: BASE_URL,
  };
}