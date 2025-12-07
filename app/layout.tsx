import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "山川みかん農園 | 北原早生・直売所",
  description:
    "太陽と海風が育てた山川みかん。北原早生を中心に、旬の味を農家直売でお届けします。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-[#faf7f2] text-[#36332e]">
        <Header />
        <main className="main-container">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
