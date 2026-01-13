import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MikanNav from "@/components/MikanNav";

export const metadata = {
  title: "山口みかん農園 | 北原早生・直売所",
  description:
    "太陽と海風が育てた山口みかん。北原早生を中心に、旬の味を農家直売でお届けします。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="text-[#36332e]">
        <Header />

        {/* Header高さ分をここで一元管理 */}
        <div className="pt-[64px]">
          <MikanNav />
        </div>

        <main className="main-container mt-4">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
