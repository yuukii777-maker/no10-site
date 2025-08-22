// app/opengraph-image.tsx
import { ImageResponse } from "next/og"

export const runtime = "edge"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

/**
 * シンプルで上品なOGカードをサーバ側で描画して返す。
 * 画像ファイルを用意しなくても、各SNSで綺麗に表示されます。
 */
export default function OGImage() {
  const bg = `
    radial-gradient(1000px 600px at 15% 20%, rgba(255,255,255,.12), transparent 40%),
    radial-gradient(800px 500px at 85% 10%, rgba(255,255,255,.10), transparent 45%),
    linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 30%, #2a2a2a 100%)
  `

  return new ImageResponse(
    (
      <div
        style={{
          width: size.width,
          height: size.height,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px",
          color: "#fff",
          backgroundImage: bg,
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: 6, textTransform: "uppercase", opacity: 0.75 }}>
          Legacy & Innovation
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 92,
            lineHeight: 1.08,
            fontWeight: 600,
            fontFamily:
              'Cormorant Garamond, "Times New Roman", Georgia, ui-serif, system-ui, -apple-system',
          }}
        >
          No.10 Family Office
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 28,
            maxWidth: 900,
            opacity: 0.9,
          }}
        >
          Crafting long-term value across culture, technology, and communities.
        </div>

        {/* 右下の小さなセパレーター */}
        <div
          style={{
            position: "absolute",
            right: 72,
            bottom: 64,
            width: 240,
            height: 2,
            background:
              "linear-gradient(90deg, rgba(255,255,255,.0) 0%, rgba(255,255,255,.6) 30%, rgba(255,255,255,.0) 100%)",
          }}
        />
      </div>
    ),
    { ...size }
  )
}
