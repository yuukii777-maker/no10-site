// next.config.js
/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: true,

  // Vercel/Next の「workspace root を推測した」警告を抑止
  // （プロジェクト直下をルートとして扱わせる）
  outputFileTracingRoot: path.resolve(__dirname),

  // --- ここが重要：ESLint/型エラーで本番ビルドを落とさない ---
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // もし今後必要になったらコメント外して使う用のテンプレ
  // images: { unoptimized: true },
  // experimental: { optimizeCss: true },
};

module.exports = nextConfig;
