"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductsPage() {
  const router = useRouter();

  // ★追加：箱数と価格管理
  const PRICE_TABLE: Record<number, number> = {
    1: 3000,
    2: 5500,
  };

  const [boxCount, setBoxCount] = useState<1 | 2>(2);
  const price = PRICE_TABLE[boxCount];

  return (
    <main className="max-w-5xl mx-auto px-6 pt-28 pb-24 text-[#333]">

      {/* タイトル */}
      <h1 className="text-4xl font-bold text-center">商品一覧</h1>

      <div
        className="
          max-w-2xl mx-auto mt-4
          bg-white/60 backdrop-blur-sm rounded-2xl shadow-md
          p-6 md:p-8 text-center text-gray-700
        "
      >
        訳あり100円みかん & 正規品みかんをご用意しています。
      </div>

      {/* ====================== */}
      {/* 訳ありみかん */}
      {/* ====================== */}
      <section className="mt-16">
        <h2 className="text-3xl font-semibold">訳ありみかん（100円）</h2>

        <div
          className="
            bg-white/60 backdrop-blur-sm rounded-2xl shadow-md
            p-6 md:p-8 mt-4 leading-relaxed text-gray-700
          "
        >
          傷ありですが、味はそのまま。最も人気の商品です。
        </div>

        <div className="grid md:grid-cols-2 gap-10 mt-10 items-center">
          <div className="relative w-full h-72 rounded-xl overflow-hidden shadow-md">
            <Image
              src="/mikan/defect.png"
              alt="訳ありみかん"
              fill
              className="object-cover"
            />
          </div>

          {/* ★購入UI付きカード */}
          <div
            className="
              bg-white/60 backdrop-blur-sm rounded-2xl shadow-md
              p-6 md:p-8
            "
          >
            <h3 className="text-2xl font-bold mb-2">
              山川100円みかん（家庭用）
            </h3>

            <p className="leading-relaxed text-gray-700">
              山川で実際に100円で販売している家庭用みかん。<br />
              見た目より<strong>量と味</strong>を重視しています。
            </p>

            <p className="text-sm text-gray-600 mt-3">
              約10kg（1袋 約600g × 16〜18袋分・目安）<br />
              発送：ご注文から3日以内
            </p>

            {/* ★箱数選択 */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-1">
                箱数を選択
              </label>
              <select
                value={boxCount}
                onChange={(e) =>
                  setBoxCount(Number(e.target.value) as 1 | 2)
                }
                className="
                  w-full border border-gray-300 rounded-lg
                  px-4 py-2
                "
              >
                <option value={1}>1箱（3,000円・送料込み）</option>
                <option value={2}>2箱（5,500円・送料込み・おすすめ）</option>
              </select>
            </div>

            {/* ★金額表示 */}
            <p className="text-2xl font-bold text-green-600 mt-6">
              合計：{price.toLocaleString()}円（税込・送料込み）
            </p>

            {/* ★購入ボタン */}
            <button
              onClick={() => {
                router.push(
                  `/order?boxes=${boxCount}&price=${price}`
                );
              }}
              className="
                mt-6 w-full
                bg-green-600 hover:bg-green-700
                text-white text-lg font-semibold
                py-3 rounded-xl shadow-lg
                transition
              "
            >
              購入する
            </button>

            <p className="text-xs text-gray-500 mt-3 text-center">
              ※家庭用・不揃いのため、見た目による返品交換はご遠慮ください
            </p>
          </div>
        </div>
      </section>

      {/* ====================== */}
      {/* 正規品みかん */}
      {/* ====================== */}
      <section className="mt-24">
        <h2 className="text-3xl font-semibold">正規品みかん（青果）</h2>

        <div
          className="
            bg-white/60 backdrop-blur-sm rounded-2xl shadow-md
            p-6 md:p-8 mt-4 leading-relaxed text-gray-700
          "
        >
          贈答用・家庭用におすすめのしっかりした品質。
        </div>

        <div className="grid md:grid-cols-2 gap-10 mt-10 items-center">
          <div className="relative w-full h-72 rounded-xl overflow-hidden shadow-md">
            <Image
              src="/mikan/premium.png"
              alt="正規品みかん"
              fill
              className="object-cover"
            />
          </div>

          <div
            className="
              bg-white/60 backdrop-blur-sm rounded-2xl shadow-md
              p-6 md:p-8
            "
          >
            <h3 className="text-2xl font-bold mb-2">
              正規品みかん（1kg〜）
            </h3>
            <p className="leading-relaxed text-gray-700">
              職人が選別した高品質の青果用みかん。<br />
              収穫3日以内の超新鮮みかんを発送します。
            </p>
            <p className="text-2xl font-bold text-red-600 mt-4">
              現在品切れ
            </p>
          </div>
        </div>
      </section>

      {/* ====================== */}
      {/* キャンペーン */}
      {/* ====================== */}
      <section
        id="campaign-banners"
        className="mt-24 scroll-mt-24"
      >
        <h2 className="text-3xl font-bold text-center mb-10">
          キャンペーン情報
        </h2>

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
          <div
            key={i}
            className="rounded-xl overflow-hidden shadow-md mb-16"
          >
            <Image
              src={item.src}
              width={1200}
              height={700}
              alt={`キャンペーン ${i + 1}`}
              className="w-full object-cover"
            />

            <div
              className="
                bg-white/60 backdrop-blur-sm rounded-b-2xl shadow-md
                p-6 text-center text-gray-700
              "
            >
              {item.text}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
