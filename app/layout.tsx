import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MikanNav from "@/components/MikanNav";

export const metadata = {
  title: "山川みかん農園 | 北原早生・直売所",
  description:
    "太陽と海風が育てた山川みかん。北原早生を中心に、旬の味を農家直売でお届けします。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-[#faf7f2] text-[#36332e]">
        {/* 🟧 固定ヘッダー（ロゴのみ） */}
        <Header />

        {/* 🍊 画像ナビ（テキストナビを完全置き換え） */}
        <div className="pt-[64px]"> 
          {/* Header が fixed なのでその高さ分余白を入れる */}
          <MikanNav />
        </div>

        {/* 🟧 メインコンテンツ（画像ナビの高さも考慮して余白を調整） */}
        <main className="main-container mt-4">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
