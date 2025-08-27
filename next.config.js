/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ルート推測の警告を黙らせる（複数ロックファイルがあってもOKにする）
  outputFileTracingRoot: __dirname,
};

module.exports = nextConfig;
