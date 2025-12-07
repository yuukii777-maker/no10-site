"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY * 0.4);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="pt-[80px] text-[#333]"> 
      {/* ヘッダーが fixed なのでそのぶん余白を足す */}

      {/* ============================================ */}
      {/* ① ヒーローセクション（パララックス） */}
      {/* ============================================ */}
      <section className="relative h-[80vh] overflow-hidden">

        {/* 背景パララックス画像 */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translateY(${offset * 0.2}px)`,
            transition: "transform 0.1s linear",
          }}
        >
          <Image
            src="/mikan/farm.png"
            alt="山川みかん農園"
            fill
            priority
            className="object-cover brightness-90"
          />
        </div>

        {/* 黒の薄いフィルター */}
        <div className="absolute inset-0 bg-black/30" />

        {/* 手前の袋みかん画像 */}
        <div className="absolute bottom-5 right-5 z-10 hidden md:block">
          <Image
            src="/mikan/hand.png"
            alt="100円みかん"
            width={280}
            height={280}
            className="rounded-lg shadow-xl"
          />
        </div>

        {/* テキスト */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-6 drop-shadow-xl">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            山川みかん農園
          </h1>
          <h2 className="text-2xl md:text-3xl mt-4">
            北原早生・山川ブランド — 無人直売所
          </h2>

          <p className="mt-6 text-lg md:text-xl font-light">
            “驚きの100円みかん”を、旬の鮮度そのままに。
          </p>

          <a
            href="/products"
            className="mt-8 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full text-lg shadow-lg transition"
          >
            🧺 みかんを購入する
          </a>
        </div>
      </section>

      {/* ============================================ */}
      {/* ② なぜ100円なのか？ */}
      {/* ============================================ */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center">100円みかんの理由</h2>

        <p className="text-center text-gray-600 mt-4 leading-relaxed">
          傷があっても味は抜群。
          “山川みかんを気軽に味わってほしい”という想いから、訳あり品を特別価格で提供しています。
        </p>

        <div className="grid md:grid-cols-2 gap-10 mt-14">

          {/* 写真1 */}
          <div className="bg-white rounded-xl shadow-md p-6 border">
            <Image
              src="/mikan/defect.png"
              alt="訳あり"
              width={600}
              height={400}
              className="rounded-lg mx-auto"
            />
            <h3 className="text-xl font-semibold mt-6 text-center">見た目に傷があるだけ</h3>
            <p className="text-gray-600 mt-3 text-center">
              味・鮮度・香りは通常品と同じ。
              形や傷だけで味は変わりません。
            </p>
          </div>

          {/* 写真2 */}
          <div className="bg-white rounded-xl shadow-md p-6 border">
            <Image
              src="/mikan/shelf.png"
              alt="直売所"
              width={600}
              height={400}
              className="rounded-lg mx-auto"
            />
            <h3 className="text-xl font-semibold mt-6 text-center">無人販売だからこそ実現</h3>
            <p className="text-gray-600 mt-3 text-center">
              手間を省き、お客様に還元しています。
              毎年リピーターが絶えない人気商品です。
            </p>
          </div>

        </div>
      </section>

      {/* ============================================ */}
      {/* ③ 商品紹介（訳あり / 通常） */}
      {/* ============================================ */}
      <section className="bg-[#fafafa] py-20 border-t">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center">商品一覧</h2>

          <div className="grid md:grid-cols-2 gap-10 mt-14">

            {/* 訳あり */}
            <a
              href="/products"
              className="bg-white rounded-xl shadow-md p-8 border hover:shadow-lg transition"
            >
              <Image
                src="/mikan/hand.png"
                width={400}
                height={300}
                alt="訳ありみかん"
                className="rounded-lg mx-auto"
              />
              <h3 className="text-2xl font-semibold mt-6 text-center text-orange-600">
                【訳あり】山川みかん（1袋100円）
              </h3>
              <p className="text-center text-gray-600 mt-3">
                傷ありでも味はそのまま。
                人気No.1商品です。
              </p>
            </a>

            {/* 通常品 */}
            <a
              href="/products"
              className="bg-white rounded-xl shadow-md p-8 border hover:shadow-lg transition"
            >
              <Image
                src="/mikan/premium.png"
                width={400}
                height={300}
                alt="通常品"
                className="rounded-lg mx-auto"
              />
              <h3 className="text-2xl font-semibold mt-6 text-center">
                【通常品】山川みかん（3kg〜）
              </h3>
              <p className="text-center text-gray-600 mt-3">
                贈り物にも喜ばれる品質。
              </p>
            </a>

          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* ④ パララックス2段目 */}
      {/* ============================================ */}
      <section className="relative h-[50vh] overflow-hidden mt-20">
        <div
          className="absolute inset-0"
          style={{
            transform: `translateY(${offset * 0.15}px)`,
            transition: "transform 0.1s linear",
          }}
        >
          <Image
            src="/mikan/farm.png"
            alt="山川みかん畑"
            fill
            className="object-cover brightness-80"
          />
        </div>

        <div className="absolute inset-0 bg-black/20" />

        <div className="absolute inset-0 flex justify-center items-center text-white text-3xl md:text-4xl font-bold drop-shadow-lg">
          山川の自然が育む、特別なみかん
        </div>
      </section>

      {/* ============================================ */}
      {/* ⑤ 想いセクション */}
      {/* ============================================ */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center">農園の想い</h2>

        <p className="text-center text-gray-700 mt-6 leading-relaxed text-lg">
          みかんを通して、地域に貢献したい。
          毎年楽しみにしてくれるお客様へ、変わらず「美味しい」を届けたい。
          その想いで、家族みんなで育てています。
        </p>
      </section>

    </main>
  );
}
