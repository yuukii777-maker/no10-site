/* ===========================
   商品ページ（iPhone最適化済み）
=========================== */

import Image from "next/image";

export default function ProductsPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 pt-28 pb-24 text-[#333]">

      {/* タイトル */}
      <h1 className="text-4xl font-bold text-center">商品一覧</h1>
      <p className="text-center text-gray-600 mt-3">
        訳あり100円みかん & 正規品みかんをご用意しています。
      </p>

      {/* ====================== */}
      {/* 訳ありみかん          */}
      {/* ====================== */}
      <section className="mt-16">
        <h2 className="text-3xl font-semibold">訳ありみかん（100円）</h2>
        <p className="text-gray-600 mt-2">
          傷ありですが、味はそのまま。最も人気の商品です。
        </p>

        <div className="grid md:grid-cols-2 gap-10 mt-10 items-center">
          {/* 画像 */}
          <div className="relative w-full h-72 rounded-xl overflow-hidden shadow-lg">
            <Image
              src="/mikan/defect.png"
              alt="訳ありみかん"
              fill
              className="object-cover"
            />
          </div>

          {/* 説明 */}
          <div>
            <h3 className="text-2xl font-bold mb-2">
              訳ありみかん（1袋100円）
            </h3>

            <p className="text-gray-700 leading-relaxed">
              皮に傷がありますが、味は全く変わりません。<br />
              1袋に <span className="font-bold">4〜6個入り</span>（大きさによる）。
            </p>

            <p className="text-2xl font-bold text-orange-500 mt-4">
              ¥100 + 送料
            </p>
          </div>
        </div>
      </section>

      {/* ====================== */}
      {/* 正規品みかん           */}
      {/* ====================== */}
      <section className="mt-24">
        <h2 className="text-3xl font-semibold">正規品みかん（青果）</h2>
        <p className="text-gray-600 mt-2">
          贈答用・家庭用におすすめのしっかりした品質。
        </p>

        <div className="grid md:grid-cols-2 gap-10 mt-10 items-center">
          {/* 画像 */}
          <div className="relative w-full h-72 rounded-xl overflow-hidden shadow-lg">
            <Image
              src="/mikan/premium.png"
              alt="正規品みかん"
              fill
              className="object-cover"
            />
          </div>

          {/* 説明 */}
          <div>
            <h3 className="text-2xl font-bold mb-2">正規品みかん（1kg〜）</h3>

            <p className="text-gray-700 leading-relaxed">
              職人が選別した高品質の青果用みかん。<br />
              <span className="font-bold">収穫3日以内</span>の超新鮮みかんを発送します。
            </p>

            <p className="text-2xl font-bold text-green-600 mt-4">
              ¥600 / 1kg + 送料
            </p>
          </div>
        </div>
      </section>

      {/* ====================== */}
      {/* キャンペーン（固定3枚） */}
      {/* ====================== */}
      <section id="campaign-banners" className="mt-24">
        <h2 className="text-3xl font-bold text-center mb-10">
          キャンペーン情報
        </h2>

        <div className="space-y-12">
          {/* ① 送料無料 */}
          <div className="rounded-xl overflow-hidden shadow-xl">
            <Image
              src="/mikan/bnr_shipping_campaign.png"
              width={1200}
              height={700}
              alt="送料無料キャンペーン"
              className="w-full object-cover"
            />
            <p className="text-center mt-4 text-gray-700 text-sm">
              九州のお客様は送料無料。その他地域もイベント割引あり。
            </p>
          </div>

          {/* ② ＋1kg */}
          <div className="rounded-xl overflow-hidden shadow-xl">
            <Image
              src="/mikan/bnr_open_special.png"
              width={1200}
              height={700}
              alt="＋1kgキャンペーン"
              className="w-full object-cover"
            />
            <p className="text-center mt-4 text-gray-700 text-sm">
              新設サイト記念。5kg購入で +1kg プレゼント。
            </p>
          </div>

          {/* ③ 冬ギフト */}
          <div className="rounded-xl overflow-hidden shadow-xl">
            <Image
              src="/mikan/bnr_oseibo.png"
              width={1200}
              height={700}
              alt="冬ギフト受付中"
              className="w-full object-cover"
            />
            <p className="text-center mt-4 text-gray-700 text-sm">
              年末年始の贈り物に、山川みかんをどうぞ。
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
