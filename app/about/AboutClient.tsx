"use client";

import Image from "next/image";
import { useRef, useEffect } from "react";

/* フェードイン */
function useFadeIn() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("opacity-100", "translate-y-0");
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

export default function AboutClient() {
  return (
    <main className="text-[#333]">

      {/* ============================= */}
      {/* ① ヒーロー（farm.png） */}
      {/* ============================= */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <Image
          src="/mikan/farm.png"
          alt="農園の風景"
          fill
          priority
          className="object-cover brightness-[0.85]"
        />
        <div className="absolute inset-0 bg-black/30" />

        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-6">
          <h1 className="text-4xl md:text-6xl font-bold drop-shadow-xl">
            農園について
          </h1>
          <p className="mt-4 text-lg md:text-xl drop-shadow">
            山川の自然が育てる、甘くて香り高いみかん
          </p>
        </div>
      </section>

      {/* ============================= */}
      {/* ② 山川の環境（風土紹介） */}
      {/* ============================= */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center">山川がみかんに向く理由</h2>

        <p className="text-center text-gray-600 mt-4 leading-relaxed">
          山川町は海風・日当たり・水はけの良い傾斜がそろった、
          みかん栽培に最適な地域です。
        </p>

        <div className="grid md:grid-cols-2 gap-10 mt-14 items-center">
          <div className="relative w-full h-72 rounded-xl overflow-hidden shadow-lg">
            <Image
              src="/mikan/farm.png"
              alt="山川の環境"
              fill
              className="object-cover"
            />
          </div>

          <div>
            <h3 className="text-xl font-semibold">海風が運ぶミネラル</h3>
            <p className="text-gray-600 mt-3 leading-relaxed">
              海に近い地域ならではのミネラルが葉に付き、みかんの香りと甘さを引き出します。
            </p>

            <h3 className="text-xl font-semibold mt-8">日当たりの良い南向きの畑</h3>
            <p className="text-gray-600 mt-3 leading-relaxed">
              しっかり光を浴びることで、果肉の甘さとコクが育まれます。
            </p>

            <h3 className="text-xl font-semibold mt-8">水はけの良い傾斜地</h3>
            <p className="text-gray-600 mt-3 leading-relaxed">
              傾斜によって余分な水分が残らず、濃厚な甘味を持つみかんに育ちます。
            </p>
          </div>
        </div>
      </section>

      {/* ============================= */}
      {/* ③ 手作業の丁寧さ */}
      {/* ============================= */}
      <section className="max-w-5xl mx-auto px-6 py-20 bg-[#fafafa] rounded-xl">
        <h2 className="text-3xl font-bold text-center">ひとつひとつ、丁寧な手作業</h2>

        <p className="text-center text-gray-600 mt-4 leading-relaxed">
          みかんは生き物。木の状態・日差し・熟度を見ながら、
          手作業で最適なタイミングを見極めています。
        </p>

        <div className="grid md:grid-cols-2 gap-10 mt-14 items-center">
          <div>
            <h3 className="text-xl font-semibold">熟度の見極め</h3>
            <p className="text-gray-600 mt-3 leading-relaxed">
              熟しすぎる前に、甘味が最も乗ったタイミングで収穫します。
            </p>

            <h3 className="text-xl font-semibold mt-8">丁寧にハサミで収穫</h3>
            <p className="text-gray-600 mt-3 leading-relaxed">
              実を傷つけないよう、ハサミで一つひとつ収穫しています。
            </p>
          </div>

          <div className="relative w-full h-72 rounded-xl overflow-hidden shadow-lg">
            <Image
              src="/mikan/hand.png"
              alt="手作業の収穫"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ============================= */}
      {/* ④ 訳あり100円みかんの想い */}
      {/* ============================= */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center">訳あり100円みかんについて</h2>

        <p className="text-center text-gray-600 mt-4 leading-relaxed">
          傷があっても味はそのまま。
          「山川みかんを気軽に楽しんでほしい」という想いから生まれた取り組みです。
        </p>

        <div className="relative w-full h-72 md:h-96 mt-12 rounded-xl overflow-hidden shadow-lg mx-auto">
          <Image
            src="/mikan/defect.png"
            alt="訳ありみかん"
            fill
            className="object-cover"
          />
        </div>
      </section>
    </main>
  );
}
