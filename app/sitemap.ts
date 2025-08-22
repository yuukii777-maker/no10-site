// app/sitemap.ts
import type { MetadataRoute } from "next"

/**
 * サイトマップ（検索エンジン向け）
 * ここに列挙したURLが /sitemap.xml に出力されます。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000"

  // いまはトップページのみ。今後ページを増やしたらここに追記すればOK。
  return [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ]
}
