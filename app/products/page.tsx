import Image from "next/image";

export default function ProductsPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 pt-32 pb-20 text-[#333]">

      <h1 className="text-4xl font-bold text-center">商品一覧</h1>
      <p className="text-center text-gray-600 mt-3">
        訳あり100円みかん & 正規品みかんをご用意しています。
      </p>

      {/* ----- 訳ありみかん ----- */}
      <section className="mt-16">
        <h2 className="text-3xl font-semibold">訳ありみかん（100円）</h2>
        <p className="text-gray-600 mt-2">
          見た目に傷がありますが、甘さはそのまま。人気No.1商品です。
        </p>

        <div className="grid md:grid-cols-2 gap-10 mt-10">
          <div className="relative w-full h-80 rounded-xl overflow-hidden shadow-lg">
            <Image src="/mikan/defect.png" alt="訳ありみかん" fill className="object-cover" />
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-2">訳ありみかん（1袋）</h3>

            <p className="text-gray-700 leading-relaxed">
              一袋に4〜6個入り（大きさによる）。味は正規品と同等です。<br/>
              ご家庭用に最も選ばれているお得な商品です。
            </p>

            <p className="text-2xl font-bold text-orange-500 mt-4">¥100 ＋ 送料</p>
          </div>
        </div>
      </section>

      {/* ----- 正規品みかん ----- */}
      <section className="mt-24">
        <h2 className="text-3xl font-semibold">正規みかん（青果）</h2>
        <p className="text-gray-600 mt-2">
          プロが選別した美しいみかんです。
        </p>

        <div className="grid md:grid-cols-2 gap-10 mt-10">
          <div className="relative w-full h-80 rounded-xl overflow-hidden shadow-lg">
            <Image src="/mikan/premium.png" alt="正規みかん" fill className="object-cover" />
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-2">正規みかん（1kg〜）</h3>

            <p className="text-gray-700 leading-relaxed">
              収穫3日以内の超新鮮みかん。スーパーで買うより高品質でお得です。
            </p>

            <p className="text-2xl font-bold text-green-600 mt-4">¥600 / 1kg ＋ 送料</p>
          </div>
        </div>
      </section>
    </main>
  );
}
