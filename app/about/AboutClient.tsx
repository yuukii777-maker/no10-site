"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/* =======================================
   ３枚ローテーション用スライダー画像
======================================= */
const slides = [
  "/mikan/bnr_shipping_campaign.png", // 九州送料無料キャンペーン
  "/mikan/bnr_open_special.png",      // 新設サイト記念 +1kg
  "/mikan/bnr_oseibo.png",            // 冬ギフト（お歳暮）
];

export default function AboutClient() {
  const [index, setIndex] = useState(0);

  /* =======================================
     スライダー（2秒ごとに切り替え）
  ======================================= */
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="px-6 pb-24 text-[#333]">

      {/* ================================ */}
      {/* ① トップビジュアル（farm.png） */}
      {/* ================================ */}
      <section className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden rounded-xl shadow-lg mt-6 max-w-6xl mx-auto">
        <Image
          src="/mikan/farm.png"
          alt="山川みかん農園"
          fill
          priority
          className="object-cover brightness-[0.95]"
        />

        <div className="absolute inset-0 bg-black/20" />

        <div className="absolute inset-0 flex flex-col justify-center items-center text-white drop-shadow-2xl text-center px-6">
          <h1 className="text-4xl md:text-5xl font-bold">山川みかん農園について</h1>
          <p className="text-lg md:text-xl mt-4 max-w-2xl leading-relaxed opacity-90">
            海風・日当たり・水はけの良い山川の大地で育つ、高品質なみかん。
            手作業のこだわりと自然の恵みをご紹介します。
          </p>
        </div>
      </section>

      {/* ================================ */}
      {/* ② 農園紹介テキスト */}
      {/* ================================ */}
      <section className="max-w-4xl mx-auto text-center py-12">
        <p className="text-gray-700 leading-relaxed">
          福岡県みやま市山川町は、みかん栽培に最適な自然環境が整う地域。
          海風の通り道となる地形と、日当たりが良く水はけのよい土壌が、
          甘味・香りの強い山川みかんを育てています。
        </p>
      </section>

      {/* ================================ */}
      {/* ③ キャンペーンスライダー（３枚） */}
      {/* ================================ */}
      <section className="max-w-5xl mx-auto mt-4">
        <div className="relative w-full h-[250px] md:h-[320px] rounded-2xl overflow-hidden shadow-xl">

          {slides.map((src, i) => (
            <Image
              key={i}
              src={src}
              alt={`キャンペーンバナー${i + 1}`}
              fill
              className={`object-cover transition-opacity duration-700 ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

        </div>
      </section>

      {/* ================================ */}
      {/* ④ 農園写真セクション */}
      {/* ================================ */}
      <section className="max-w-5xl mx-auto mt-16">
        <div className="relative w-full h-[400px] md:h-[480px] rounded-2xl overflow-hidden shadow-md">
          <Image
            src="/mikan/farm.png"
            alt="農園風景"
            fill
            className="object-cover scale-[1.03]"
          />
        </div>

        <p className="text-center text-gray-600 mt-6 leading-relaxed max-w-3xl mx-auto">
          収穫はすべて手作業。一つひとつの実を確認しながら、
          食べ頃を逃さないタイミングで丁寧に摘み取っています。
        </p>
      </section>
    </main>
  );
}
