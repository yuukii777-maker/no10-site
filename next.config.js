// next.config.js
const path = require("path");
const child = require("child_process");

// ---- ビルド識別子（静的アセットのキャッシュ破棄用） ----
const commit =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  (() => {
    try {
      return child.execSync("git rev-parse --short HEAD").toString().trim();
    } catch {
      return Date.now().toString(); // 最終手段: タイムスタンプ
    }
  })();

const ONE_YEAR = 60 * 60 * 24 * 365;

const nextConfig = {
  reactStrictMode: true,
  // Vercel ではデフォ圧縮/Brotli有効だが、ローカル/他環境でも念のため
  compress: true,

  // RSCのファイル追跡誤検知を避けるためのルート指定
  outputFileTracingRoot: path.resolve(__dirname),

  // “ビルドは止めない”運用（落ち着いたら外してOK）
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  poweredByHeader: false,
  productionBrowserSourceMaps: false, // クライアントのソースマップを配信しない
  generateEtags: false,               // Vercelのキャッシュに任せる
  httpAgentOptions: { keepAlive: true },

  // 画像最適化（端末幅に合わせた解像度を自動配信）
  images: {
    formats: ["image/avif", "image/webp"],
    // 代表的なデバイス幅：LCP画像の過配信を避ける
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [64, 96, 128, 256, 320, 480, 640, 750, 828, 1080, 1200, 1920],
    minimumCacheTTL: ONE_YEAR, // 変換後画像のCDNキャッシュを長めに
  },

  // 静的アセットの長期キャッシュ（ファイル名 or ?v=xxxx で破棄）
  async headers() {
    return [
      {
        // 画像（/public 配下）
        source: "/:all*(png|jpg|jpeg|webp|avif|gif|svg)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        // フォント
        source: "/:all*(woff|woff2|ttf|otf)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        // 音声・動画（使う場合）
        source: "/:all*(mp3|ogg|wav|mp4|webm)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },

  // ページ側で ?v=xxxx を使えるように公開
  env: {
    NEXT_PUBLIC_COMMIT_SHA: commit,
  },

  // （任意）パッケージ最適化を使うならここに列挙
  // experimental: { optimizePackageImports: ["lodash-es", "date-fns"] },
};

module.exports = nextConfig;
