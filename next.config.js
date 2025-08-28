const path = require("path");


const nextConfig = {
reactStrictMode: true,
outputFileTracingRoot: path.resolve(__dirname),
eslint: { ignoreDuringBuilds: true },
typescript: { ignoreBuildErrors: true }, // 後で外せるよう段階的に
poweredByHeader: false,
images: { formats: ["image/avif", "image/webp"] },
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
};


module.exports = nextConfig;