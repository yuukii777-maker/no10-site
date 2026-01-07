"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductsPage() {
  const router = useRouter();

  // 価格テーブル
  const PRICE_TABLE: Record<number, number> = {
    1: 3000,
    2: 5500,
  };

  // ★ 初期は1箱（3,000円）
  const [boxCount, setBoxCount] = useState<1 | 2>(1);
  const price = PRICE_TABLE[boxCount];

  return (
    <main className="max-w-5xl mx-auto px-6 pt-28 pb-24 text-[#333]">

      {/* タイトル */}
      <h1 className="text-4xl font-bold text-center">商品一覧</h1>

      <div className="
        max-w-2xl mx-auto mt-4
        bg-white/60 backdrop-blur-sm rounded-2xl shadow-md
        p-6 md:p-8 text-center text-gray-700
      ">
        山川で実際に100円で売られているみかんを、全国へお届けします。
      </div>

      {/* ====================== */}
      {/* 100円みかん */}
      {/* ====================== */}
      <section className="mt-16">
        <h2 className="text-3xl font-semibold">
          山川100円みかん（家庭用）
        </h2>

        <div className="
          bg-white/60 backdrop-blur-sm rounded-2xl shadow-md
          p-6 md:p-8 mt-4 leading-relaxed text-gray-700
        ">
          山川で <strong>1袋100円</strong> で販売されている家庭用みかん。  
          見た目より「量」と「味」を重視した、ご自宅向けの商品です。
        </div>

        <div className="grid md:grid-cols-2 gap-10 mt-10 items-center">
          {/* 画像 */}
          <div className="relative w-full h-72 rounded-xl overflow-hidden shadow-md">
            <Image
              src="/mikan/defect.png"
              alt="山川100円みかん"
              fill
              className="object-cover"
            />
          </div>

          {/* 購入カード */}
          <div className="
            bg-white/60 backdrop-blur-sm rounded-2xl shadow-md
            p-6 md:p-8
          ">
            <h3 className="text-2xl font-bold mb-2">
              100円みかん・箱売り
            </h3>

            <p className="text-sm text-gray-700 leading-relaxed">
              約10kg（1袋 約600g × 16〜18袋分・目安）<br />
              発送：ご注文から <strong>3日以内</strong>
            </p>

            {/* 箱数選択 */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-1">
                箱数を選択
              </label>
              <select
                value={boxCount}
                onChange={(e) =>
                  setBoxCount(Number(e.target.value) as 1 | 2)
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value={1}>
                  1箱（3,000円・送料込み）
                </option>
                <option value={2}>
                  2箱（5,500円・送料込み・おすすめ）
                </option>
              </select>
            </div>

            {/* 金額 */}
            <p className="text-2xl font-bold text-green-700 mt-6">
              合計：{price.toLocaleString()}円（税込・送料込み）
            </p>

            {/* 購入ボタン */}
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
              ※ 家庭用・不揃い商品のため、見た目による返品交換はご遠慮ください
            </p>
          </div>
        </div>
      </section>

      {/* ====================== */}
      {/* 正規品 */}
      {/* ====================== */}
      <section className="mt-24">
        <h2 className="text-3xl font-semibold">
          正規品みかん（青果）
        </h2>

        <div className="
          bg-white/60 backdrop-blur-sm rounded-2xl shadow-md
          p-6 md:p-8 mt-4 leading-relaxed text-gray-700
        ">
          贈答用・家庭用向けの正規品みかん。
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

          <div className="
            bg-white/60 backdrop-blur-sm rounded-2xl shadow-md
            p-6 md:p-8
          ">
            <h3 className="text-2xl font-bold mb-2">
              正規品みかん
            </h3>
            <p className="text-2xl font-bold text-red-600 mt-4">
              現在品切れ
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
