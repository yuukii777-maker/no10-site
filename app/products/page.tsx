import Image from "next/image";

export const metadata = {
  title: "商品一覧｜山川みかん農園",
  description:
    "訳あり100円みかん・正規品みかんの販売ページ。1袋100円の訳ありみかん、1kg600円の正規品など、山川みかん農園の新鮮なみかんを直売価格でお届けします。",
};

export default function ProductsPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 pt-32 pb-24 text-[#333]">

      {/* ================================ */}
      {/* タイトル */}
      {/* ================================ */}
      <h1 className="text-4xl font-bold text-center">商品一覧</h1>
      <p className="text-center text-gray-600 mt-3">
        訳あり100円みかん & 正規品みかんをご用意しています。
      </p>

      {/* ================================ */}
      {/* 訳あり100円みかん */}
      {/* ================================ */}
      <section className="mt-20">
        <h2 className="text-3xl font-semibold">訳ありみかん（1袋100円）</h2>

        <p className="text-gray-600 mt-2">
          傷があるだけで、味は正規品と同じ。本物の甘さを気軽に楽しめる人気商品です。
        </p>

        <div className="grid md:grid-cols-2 gap-10 mt-10">
          {/* 左画像 */}
          <div className="relative w-full h-80 rounded-xl overflow-hidden shadow-lg">
            <Image src="/mikan/defect.png" alt="訳ありみかん" fill className="object-cover" />
          </div>

          {/* 説明 */}
          <div>
            <h3 className="text-2xl font-bold mb-2">訳ありみかん（1袋100円）</h3>

            <p className="text-gray-700 leading-relaxed">
              ・皮に傷・スレがありますが甘さは本物。  
              ・当農園人気No.1の商品です。  
              ・1袋に <b>4〜6個</b> 入っています（大きさによる）。
            </p>

            <p className="text-2xl font-bold text-orange-500 mt-4">¥100 ＋ 送料</p>

            <a
              href="/contact"
              className="inline-block mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-full shadow-md transition"
            >
              お問い合わせ・注文する
            </a>
          </div>
        </div>
      </section>

      {/* ================================ */}
      {/* 正規品みかん */}
      {/* ================================ */}
      <section className="mt-24">
        <h2 className="text-3xl font-semibold">正規品みかん（青果）</h2>

        <p className="text-gray-600 mt-2">
          見た目・糖度・香りがそろった贈答にも使える品質。
        </p>

        <div className="grid md:grid-cols-2 gap-10 mt-10">
          {/* 左画像 */}
          <div className="relative w-full h-80 rounded-xl overflow-hidden shadow-lg">
            <Image src="/mikan/premium.png" alt="正規品みかん" fill className="object-cover" />
          </div>

          {/* 説明 */}
          <div>
            <h3 className="text-2xl font-bold mb-2">正規品みかん（1kg 600円）</h3>

            <p className="text-gray-700 leading-relaxed">
              ・プロの目で選別した見た目も美しい高品質みかん。  
              ・収穫から <b>3日以内</b> の超新鮮な状態でお届けします。  
              ・スーパーよりお得に購入できる直売価格。
            </p>

            <p className="text-2xl font-bold text-green-600 mt-4">¥600（1kg）＋ 送料</p>

            <a
              href="/contact"
              className="inline-block mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-full shadow-md transition"
            >
              詳しく問い合わせる
            </a>
          </div>
        </div>
      </section>

      {/* ================================ */}
      {/* キャンペーンバナー（飛んでくる場所） */}
      {/* ================================ */}
      <section id="campaign-banners" className="mt-32">
        <h2 className="text-3xl font-bold text-center mb-10">キャンペーン情報</h2>

        <div className="space-y-12">

          {/* ① 冬ギフト */}
          <div className="rounded-xl overflow-hidden shadow-xl">
            <Image
              src="/mikan/bnr_oseibo.png"
              alt="冬ギフト"
              width={1200}
              height={700}
              className="w-full object-cover"
            />
            <p className="text-center text-gray-700 mt-3">
              冬ギフトに、採れたて山川みかんをお届けします。
            </p>
          </div>

          {/* ② 送料無料キャンペーン */}
          <div className="rounded-xl overflow-hidden shadow-xl">
            <Image
              src="/mikan/bnr_shipping_campaign.png"
              alt="送料無料キャンペーン"
              width={1200}
              height={700}
              className="w-full object-cover"
            />
            <p className="text-center text-gray-700 mt-3">
              九州限定で送料無料。その他地域も期間中は割引価格でお届けします。
            </p>
          </div>

          {/* ③ ＋1kg キャンペーン */}
          <div className="rounded-xl overflow-hidden shadow-xl">
            <Image
              src="/mikan/bnr_open_special.png"
              alt="追加1kgキャンペーン"
              width={1200}
              height={700}
              className="w-full object-cover"
            />
            <p className="text-center text-gray-700 mt-3">
              新設サイト記念。5kgご購入で +1kg プレゼント！
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}
