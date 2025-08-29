const path = require("path");
const child = require("child_process");

const commit =
  process.env.VERCEL_GIT_COMMIT_SHA // Vercel が毎ビルドで用意
  || (() => {
      try {
        return child.execSync("git rev-parse --short HEAD").toString().trim();
      } catch {
        return Date.now().toString(); // 最終手段のタイムスタンプ
      }
    })();

const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.resolve(__dirname),

  // ビルドは止めない方針（落ち着いたら外してOK）
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },

  // 静的アセットは長期キャッシュ
  async headers() {
    return [
      {
        source: "/:all*(mp3|ogg)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:all*(png|jpg|jpeg|webp|avif|gif|svg)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  // ← ここで page.tsx から読む “?v=xxxx” を注入
  env: {
    NEXT_PUBLIC_COMMIT_SHA: commit,
  },
};

module.exports = nextConfig;
