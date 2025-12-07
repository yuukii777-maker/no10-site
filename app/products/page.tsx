import Image from "next/image";

export default function ProductsPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 pt-32 pb-20 text-[#333]">

      {/* タイトル */}
      <h1 className="text-4xl font-bold text-center">商品一覧</h1>
      <p className="text-center text-gray-600 mt-3">
        訳あり100円みかん & 通常みかんをご用意しています。
      </p>

      {/* ====================== */}
      {/* 訳ありみかん（主役） */}
      {/* ====================== */}
      <section className="mt-16">
        <h2 className="text-3xl font-semibold">訳ありみかん（100円）</h2>
        <p className="text-gray-600 mt-2">
          傷ありですが、味はそのまま。最も人気の商品です。
        </p>

        <div className="grid md:grid-cols-2 gap-10 mt-10">
          {/* 画像 */}
          <div className="relative w-full h-80 rounded-xl overflow-hidden shadow-lg">
            <Image src="/mikan/defect.png" alt="訳ありみかん" fill className="object-cover" />
          </div>

          {/* 説明 */}
          <div>
            <h3 className="text-2xl font-bold mb-2">訳ありみかん（1袋100円）</h3>

            <p className="text-gray-700 leading-relaxed">
              皮に傷がありますが、味は全く変わりません。<br />
              直売所でも非常に人気で、早い時間に売り切れることも多い商品です。
            </p>

            <p className="text-2xl font-bold text-orange-500 mt-4">¥100</p>

            <a
              href="/contact"
              className="inline-block mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-full shadow-md transition"
            >
              お問い合わせ・注文する
            </a>
          </div>
        </div>
      </section>

      {/* ====================== */}
      {/* 通常みかん            */}
      {/* ====================== */}
      <section className="mt-24">
        <h2 className="text-3xl font-semibold">通常みかん（青果）</h2>
        <p className="text-gray-600 mt-2">
          贈答用・家庭用におすすめのしっかりした品質。
        </p>

        <div className="grid md:grid-cols-2 gap-10 mt-10">
          {/* 画像 */}
          <div className="relative w-full h-80 rounded-xl overflow-hidden shadow-lg">
            <Image src="/mikan/premium.png" alt="通常みかん" fill className="object-cover" />
          </div>

          {/* 説明 */}
          <div>
            <h3 className="text-2xl font-bold mb-2">通常みかん（1kg〜）</h3>

            <p className="text-gray-700 leading-relaxed">
              糖度・風味・見た目のバランスが良い青果用みかん。<br />
              ご家庭用はもちろん、贈答品としても選ばれています。
            </p>

            <p className="text-2xl font-bold text-green-600 mt-4">相場価格：¥300〜¥500（1kg）</p>

            <a
              href="/contact"
              className="inline-block mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-full shadow-md transition"
            >
              詳しく問い合わせる
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
