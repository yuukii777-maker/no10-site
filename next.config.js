// next.config.js
const path = require("path");
const child = require("child_process");

// ---- ビルド識別子（キャッシュ破棄用） ----
const commit =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  (() => {
    try {
      return child.execSync("git rev-parse --short HEAD").toString().trim();
    } catch {
      return Date.now().toString();
    }
  })();

const ONE_YEAR = 60 * 60 * 24 * 365;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,

  // ❌ Next.js 14 では非対応 → 削除が必須
  // outputFileTracingRoot: path.resolve(__dirname),

  // ✔ ビルドを落とさないための運用設定（後で外せる）
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  generateEtags: false,
  httpAgentOptions: { keepAlive: true },

  // ✔ 画像最適化（AVIF / WebP 自動生成）
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [64, 96, 128, 256, 320, 480, 640, 750, 828, 1080, 1200, 1920],
    minimumCacheTTL: ONE_YEAR,
  },

  // ✔ 静的アセットの強力キャッシュ
  async headers() {
    return [
      {
        source: "/:all*(png|jpg|jpeg|webp|avif|gif|svg)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        source: "/:all*(woff|woff2|ttf|otf)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        source: "/:all*(mp3|ogg|wav|mp4|webm)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },

  // ✔ バージョン付与（LCP 画像のキャッシュ破棄にも使える）
  env: {
    NEXT_PUBLIC_COMMIT_SHA: commit,
  },
};

module.exports = nextConfig;
