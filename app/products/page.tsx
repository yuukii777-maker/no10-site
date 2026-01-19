"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductsPage() {
  const router = useRouter();

  // 規格と価格（送料込み）
  const PRICE_TABLE: Record<"5kg" | "10kg", number> = {
    "5kg": 2500,
    "10kg": 4000, // ★ 変更：10kg を 4000 円に
  };

  const [size, setSize] = useState<"5kg" | "10kg">("5kg");
  const [withBuntan, setWithBuntan] = useState(true); // ★ 名称は既存のまま（互換維持）。true=「みかん＋500gおまけ」
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
          <div className="relative w-full h-72 rounded-xl overflow-hidden shadow-md">
            <Image
              src="/mikan/defect.png"
              alt="傷あり青島みかん"
              fill
              className="object-cover"
            />
          </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 md:p-8">
            <h3 className="text-2xl font-bold mb-2">価格（送料込み）</h3>

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
                <option value="5kg">5kg（2,500円）</option>
                <option value="10kg">10kg（4,000円）</option>
              </select>
            </div>

            {/* 価格 */}
            <p className="text-2xl font-bold text-green-700 mt-6">
              価格：{price.toLocaleString()}円
            </p>

            <p className="text-sm text-gray-600 mt-2">
              ※ 送料込みです。
            </p>

            {/* ★ イベント：みかん＋500gおまけ */}
            <label
              className="
                mt-4 flex items-center gap-3
                bg-orange-50/70 backdrop-blur-sm
                border border-orange-200
                rounded-xl px-4 py-3
                cursor-pointer
              "
            >
              <input
                type="checkbox"
                checked={withBuntan}
                onChange={(e) => setWithBuntan(e.target.checked)}
                className="w-5 h-5 accent-orange-500"
              />

              <div className="text-sm leading-tight">
                <p className="font-semibold text-orange-700">
                  【期間限定】みかん＋500gおまけ
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  ※ 数量限定・無くなり次第終了
                </p>
              </div>
            </label>

            {/* 購入 */}
            <button
              onClick={() => {
                router.push(
                  `/order?product=${encodeURIComponent("傷あり青島みかん（箱詰め）")}&size=${size}&price=${price}&buntan=${withBuntan}`
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

      {/* ====================== */}
      {/* 青果みかん（状態良） */}
      {/* ====================== */}
      <section className="mt-24">
        <h2 className="text-3xl font-semibold text-red-700">
          青果みかん
        </h2>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 md:p-8 mt-4 leading-relaxed text-gray-700">
          贈答用・青果基準で選別した高品質みかんです。
          現在は収穫終了のため販売を停止しています。
        </div>

        <div className="grid md:grid-cols-2 gap-10 mt-10 items-center">
          <div className="relative w-full h-72 rounded-xl overflow-hidden shadow-md">
            <Image
              src="/mikan/premium.png"
              alt="青果みかん(状態良)"
              fill
              className="object-cover"
            />
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 md:p-8">
            <h3 className="text-2xl font-bold mb-4">青果</h3>

            <ul className="text-sm text-gray-700 space-y-1 mb-4">
              <li>・5kg：4,500円（送料込み）</li>
              <li>・10kg：8,000円（送料込み）</li>
            </ul>

            <button
              disabled
              className="w-full bg-red-500 text-white text-lg font-bold py-3 rounded-xl opacity-70 cursor-not-allowed"
            >
              現在売り切れ
            </button>
          </div>
        </div>
      </section>

      {/* ====================== */}
      {/* 文旦 */}
      {/* ====================== */}
      <section className="mt-24">
        <h2 className="text-3xl font-semibold">文旦（箱）</h2>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 md:p-8 mt-4 leading-relaxed text-gray-700">
          さっぱりとした甘さと爽やかな香りの文旦。<br />
          <strong>大きさ不揃いで、5kg箱は6個入り／10kg箱は12個入り</strong>です（目安）。
        </div>

        <div className="grid md:grid-cols-2 gap-10 mt-10 items-center">
          <div className="relative w-full h-72 rounded-xl overflow-hidden shadow-md">
            <Image
              src="/mikan/buntan.jpg"
              alt="文旦（箱）"
              fill
              className="object-cover"
            />
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 md:p-8">
            <h3 className="text-2xl font-bold mb-2">文旦（不揃い）</h3>

            {/* ★ 箱の選択（5kg/10kg） */}
            <div className="mt-2">
              <label className="block text-sm font-medium mb-1">
                規格を選択
              </label>
              <select
                defaultValue="5kg"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                onChange={(e) => {
                  const val = e.target.value as "5kg" | "10kg";
                  const p = val === "5kg" ? 2500 : 4000;
                  router.push(
                    `/order?product=${encodeURIComponent("文旦（不揃い）")}&size=${encodeURIComponent(val === "5kg" ? "5kg（6個）" : "10kg（12個）")}&price=${p}&buntan=false`
                  );
                }}
              >
                <option value="5kg">5kg（6個） 2,500円</option>
                <option value="10kg">10kg（12個） 4,000円</option>
              </select>
            </div>

            <button
              onClick={() => {
                const val: "5kg" | "10kg" = "5kg";
                const p = 2500;
                router.push(
                  `/order?product=${encodeURIComponent("文旦（不揃い）")}&size=${encodeURIComponent("5kg（6個）")}&price=${p}&buntan=false`
                );
              }}
              className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white text-lg font-semibold py-3 rounded-xl shadow-lg transition"
            >
              5kg箱詰め（6個入り）を購入
            </button>

            <button
              onClick={() => {
                const val: "10kg" | "5kg" = "10kg";
                const p = 4000;
                router.push(
                  `/order?product=${encodeURIComponent("文旦（不揃い）")}&size=${encodeURIComponent("10kg（12個）")}&price=${p}&buntan=false`
                );
              }}
              className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white text-lg font-semibold py-3 rounded-xl shadow-lg transition"
            >
              10kg箱詰め（12個入り）を購入
            </button>

            <p className="text-xs text-gray-500 mt-3 text-center">
             「“5kg／10kg”は箱サイズの目安で、実際は個数基準（5kg箱＝6個・10kg箱＝12個）で詰めるため、総重量は前後し“6個＝5kgぴったり”ではありません。」
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
