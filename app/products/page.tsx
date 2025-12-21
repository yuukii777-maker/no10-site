import Image from "next/image";

export default function ProductsPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 pt-28 pb-24 text-[#333]">

      {/* タイトル */}
      <h1 className="text-4xl font-bold text-center">商品一覧</h1>

      <div className="
        max-w-2xl mx-auto mt-4
        bg-white/60 backdrop-blur-sm rounded-2xl shadow-md
        p-6 md:p-8 text-center text-gray-700
      ">
        訳あり100円みかん & 正規品みかんをご用意しています。
      </div>

      {/* ====================== */}
      {/* 訳ありみかん */}
      {/* ====================== */}
      <section className="mt-16">
        <h2 className="text-3xl font-semibold">訳ありみかん（100円）</h2>

        <div className="
          bg-white/60 backdrop-blur-sm rounded-2xl shadow-md
          p-6 md:p-8 mt-4 leading-relaxed text-gray-700
        ">
          傷ありですが、味はそのまま。最も人気の商品です。
        </div>

        <div className="grid md:grid-cols-2 gap-10 mt-10 items-center">
          <div className="relative w-full h-72 rounded-xl overflow-hidden shadow-md">
            <Image src="/mikan/defect.png" alt="訳ありみかん" fill className="object-cover" />
          </div>

          <div className="
            bg-white/60 backdrop-blur-sm rounded-2xl shadow-md
            p-6 md:p-8
          ">
            <h3 className="text-2xl font-bold mb-2">訳ありみかん（1袋100円）</h3>
            <p className="leading-relaxed text-gray-700">
              皮に傷がありますが、味は全く変わりません。  
              1袋に <span className="font-bold">4〜6個入り</span>（大きさによる）。
            </p>
            <p className="text-2xl font-bold text-orange-500 mt-4">
              ¥100 + 送料
            </p>
          </div>
        </div>
      </section>

      {/* ====================== */}
      {/* 正規品みかん */}
      {/* ====================== */}
      <section className="mt-24">
        <h2 className="text-3xl font-semibold">正規品みかん（青果）</h2>

        <div className="
          bg-white/60 backdrop-blur-sm rounded-2xl shadow-md
          p-6 md:p-8 mt-4 leading-relaxed text-gray-700
        ">
          贈答用・家庭用におすすめのしっかりした品質。
        </div>

        <div className="grid md:grid-cols-2 gap-10 mt-10 items-center">
          <div className="relative w-full h-72 rounded-xl overflow-hidden shadow-md">
            <Image src="/mikan/premium.png" alt="正規品みかん" fill className="object-cover" />
          </div>

          <div className="
            bg-white/60 backdrop-blur-sm rounded-2xl shadow-md
            p-6 md:p-8
          ">
            <h3 className="text-2xl font-bold mb-2">正規品みかん（1kg〜）</h3>
            <p className="leading-relaxed text-gray-700">
              職人が選別した高品質の青果用みかん。  
              収穫3日以内の超新鮮みかんを発送します。
            </p>
            <p className="text-2xl font-bold text-green-600 mt-4">
              ¥600 / 1kg + 送料
            </p>
          </div>
        </div>
      </section>

      {/* ====================== */}
      {/* キャンペーン */}
      {/* ====================== */}
      <section id="campaign-banners" className="mt-24">
        <h2 className="text-3xl font-bold text-center mb-10">キャンペーン情報</h2>

        {[
          {
            src: "/mikan/bnr_shipping_campaign.png",
            text: "九州のお客様は送料無料。その他地域もイベント割引あり。",
          },
          {
            src: "/mikan/bnr_open_special.png",
            text: "新設サイト記念。5kg購入で +1kg プレゼント。",
          },
          {
            src: "/mikan/bnr_oseibo.png",
            text: "年末年始の贈り物に、山川みかんをどうぞ。",
          },
        ].map((item, i) => (
          <div key={i} className="rounded-xl overflow-hidden shadow-md mb-16">
            <Image src={item.src} width={1200} height={700} alt="" className="w-full object-cover" />

            <div className="
              bg-white/60 backdrop-blur-sm rounded-b-2xl shadow-md
              p-6 text-center text-gray-700
            ">
              {item.text}
            </div>
          </div>
        ))}

      </section>
    </main>
  );
}
