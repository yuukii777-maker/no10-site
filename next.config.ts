// next.config.ts
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // 「Next.js inferred your workspace root…」の警告を抑える（複数 lockfile がある環境向け）
  experimental: {
    outputFileTracingRoot: process.cwd(),
  },

  images: {
    // 画像CDNを使う場合はここに追記
    remotePatterns: [
      // { protocol: "https", hostname: "images.example.com" }
    ],
  },

  // 追加レスポンスヘッダー（軽めのセキュリティ＆キャッシュ）
  headers: async () => [
    // 静的アセットは長期キャッシュ
    {
      source: "/_next/static/(.*)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
    {
      source: "/(.*)\\.(svg|png|jpg|jpeg|webp|ico|gif)$",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
    // 既定ページ用の軽いセキュリティヘッダー
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
  ],
}

export default nextConfig
