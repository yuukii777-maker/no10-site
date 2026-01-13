"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductsPage() {
  const router = useRouter();

  // 規格と価格（送料別・みかん原体のみ）
  const PRICE_TABLE: Record<"5kg" | "10kg", number> = {
    "5kg": 1500,
    "10kg": 2500,
  };

  const [size, setSize] = useState<"5kg" | "10kg">("5kg");
  const price = PRICE_TABLE[size];

  return (
    <main className="max-w-5xl mx-auto px-6 pt-28 pb-24 text-[#333]">
      <h1 className="text-4xl font-bold text-center">商品一覧</h1>

      <div className="max-w-2xl mx-auto mt-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 md:p-8 text-center text-gray-700">
        見た目に傷はありますが、味には自信のある青島みかんです。
      </div>

      {/* ====================== */}
      {/* 傷あり青島みかん */}
      {/* ====================== */}
      <section className="mt-16">
        <h2 className="text-3xl font-semibold">
          傷あり青島みかん（箱詰め）
        </h2>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 md:p-8 mt-4 leading-relaxed text-gray-700">
          見た目に多少の傷がありますが、  
          <strong>糖度12.5〜13度になることもある</strong>、家庭用に人気のみかんです。
        </div>

        <div className="grid md:grid-cols-2 gap-10 mt-10 items-center">
          {/* 画像 */}
          <div className="relative w-full h-72 rounded-xl overflow-hidden shadow-md">
            <Image
              src="/mikan/defect.png"
              alt="傷あり青島みかん"
              fill
              className="object-cover"
            />
          </div>

          {/* 購入カード */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 md:p-8">
            <h3 className="text-2xl font-bold mb-2">
              規格・価格
            </h3>

            {/* 規格選択 */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">
                内容量を選択
              </label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value as "5kg" | "10kg")}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="5kg">5kg（1,500円）</option>
                <option value="10kg">10kg（2,500円）</option>
              </select>
            </div>

            <p className="text-2xl font-bold text-green-700 mt-6">
              価格：{price.toLocaleString()}円
            </p>

            <p className="text-sm text-gray-600 mt-2">
              ※ 送料は別途必要です
            </p>

            <button
              onClick={() => {
                router.push(
                  `/order?size=${size}&price=${price}`
                );
              }}
              className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white text-lg font-semibold py-3 rounded-xl shadow-lg transition"
            >
              購入手続きへ
            </button>

            <p className="text-xs text-gray-500 mt-3 text-center">
              ※ 家庭用・不揃い商品のため、見た目による返品交換はご遠慮ください
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
