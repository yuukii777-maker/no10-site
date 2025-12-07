// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <div>

      {/* ------------------------- */}
      {/* ① ヒーローセクション */}
      {/* ------------------------- */}
      <section
        style={{
          padding: "90px 20px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, #faf7f2 0%, #f2e9df 100%)",
          textAlign: "center",
          marginBottom: "80px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
        }}
      >
        <h1
          style={{
            fontSize: "48px",
            fontWeight: 700,
            marginBottom: "20px",
            color: "#433f39",
          }}
        >
          山川みかん農園<br />
          北原早生 − 無人直売所
        </h1>

        <p
          style={{
            fontSize: "20px",
            maxWidth: "680px",
            margin: "0 auto 36px",
            lineHeight: "1.7",
            color: "#5b544b",
          }}
        >
          太陽と海風に育まれた、香り高く甘いみかん。<br />
          旬の味を、一番良い状態でお届けします。
        </p>

        <Link href="/products" className="btn-primary">
          🍊 みかんを購入する
        </Link>
      </section>

      {/* ------------------------- */}
      {/* ② 特徴セクション */}
      {/* ------------------------- */}
      <section style={{ marginBottom: "80px" }}>
        <h2
          style={{
            fontSize: "32px",
            textAlign: "center",
            marginBottom: "40px",
            color: "#433f39",
          }}
        >
          山川みかんが愛される理由
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "32px",
          }}
        >
          {/* 甘み */}
          <div
            style={{
              background: "#ffffff",
              padding: "28px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              textAlign: "center",
            }}
          >
            <h3 style={{ fontSize: "22px", marginBottom: "12px" }}>強い甘み</h3>
            <p style={{ color: "#6b6357", lineHeight: "1.6" }}>
              温暖な気候と十分な日照時間により、濃厚な甘みが育ちます。
            </p>
          </div>

          {/* 香り */}
          <div
            style={{
              background: "#ffffff",
              padding: "28px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              textAlign: "center",
            }}
          >
            <h3 style={{ fontSize: "22px", marginBottom: "12px" }}>豊かな香り</h3>
            <p style={{ color: "#6b6357", lineHeight: "1.6" }}>
              海風が運ぶミネラルが、みかんの香りをより芳醇にします。
            </p>
          </div>

          {/* 旬 */}
          <div
            style={{
              background: "#ffffff",
              padding: "28px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              textAlign: "center",
            }}
          >
            <h3 style={{ fontSize: "22px", marginBottom: "12px" }}>旬のおいしさ</h3>
            <p style={{ color: "#6b6357", lineHeight: "1.6" }}>
              収穫したての新鮮な北原早生を、そのまま直売でお届けします。
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------- */}
      {/* ③ 農園紹介（軽めの導線） */}
      {/* ------------------------- */}
      <section
        style={{
          background: "#f3ece4",
          padding: "60px 30px",
          borderRadius: "16px",
        }}
      >
        <h2
          style={{
            fontSize: "32px",
            marginBottom: "20px",
            textAlign: "center",
            color: "#433f39",
          }}
        >
          山川みかん農園について
        </h2>

        <p
          style={{
            maxWidth: "720px",
            margin: "0 auto 32px",
            fontSize: "18px",
            lineHeight: "1.8",
            color: "#5b544b",
            textAlign: "center",
          }}
        >
          みかんづくりに最適な山川の土地で、家族で大切に育てています。  
          北原早生を中心に「安全でおいしいみかん」を追求しています。
        </p>

        <div style={{ textAlign: "center" }}>
          <Link
            href="/about"
            style={{
              color: "#d67b2d",
              fontWeight: 600,
              fontSize: "18px",
            }}
          >
            農園をもっと見る →
          </Link>
        </div>
      </section>
    </div>
  );
}
