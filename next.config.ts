import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // ここが正解：experimental ではなくトップレベル
  outputFileTracingRoot: process.cwd(),

  headers: async () => [
    { source: "/_next/static/(.*)",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    { source: "/(.*)\\.(svg|png|jpg|jpeg|webp|ico|gif)$",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000" }] },
    { source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ] },
  ],
};

export default nextConfig;
