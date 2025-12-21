"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

/* ===========================
   フェードアニメ用フック
=========================== */
function useFadeIn() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShow(true);
      },
      { threshold: 0.15 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return { ref, show };
}

/* ===========================
   スライダー（超軽量）
=========================== */
function Slider() {
  return (
    <div className="overflow-x-auto flex gap-5 snap-x snap-mandatory py-4">
      {["defect.png", "premium.png", "hand.png", "shelf.png"].map((img) => (
        <div
          key={img}
          className="snap-center shrink-0 w-64 h-40 relative rounded-xl overflow-hidden shadow-md"
        >
          <Image
            src={`/mikan/${img}`}
            alt="ギャラリー"
            fill
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

/* ===========================
   メイン
=========================== */
export default function HomeClient() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY * 0.18);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fade1 = useFadeIn();
  const fade2 = useFadeIn();

  return (
    <main className="text-[#333]">

      {/* ============================= */}
      {/* ① ヒーロー（hiro.png）       */}
      {/* ============================= */}
      <section className="relative h-[75vh] md:h-[85vh] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            transform: `translateY(${offset * 0.25}px)`,
            transition: "transform 0.1s linear",
          }}
        >
          <Image
            src="/mikan/hiro.png"
            alt="山川みかん農園 hiro"
            fill
            priority
            className="object-cover"
          />
        </div>

        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-6 drop-shadow-xl">
          <h1 className="text-4xl md:text-5xl font-bold">
            山川みかん農園
          </h1>
          <p className="mt-4 text-lg md:text-xl">
            北原早生・山川ブランド — 旬の甘さそのまま
          </p>

          <a
            href="/products"
            className="mt-8 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full text-lg shadow-lg transition"
          >
            🧺 みかんを見る
          </a>
        </div>
      </section>

      {/* ============================= */}
      {/* ② 100円みかんの理由           */}
      {/* ============================= */}
      <section
        ref={fade1.ref}
        className={`max-w-6xl mx-auto px-6 py-20 transition-all duration-700 ${
          fade1.show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <h2 className="text-3xl font-bold text-center">100円みかんの理由</h2>
        <p className="text-center text-gray-600 mt-4 leading-relaxed">
          傷があっても味は抜群。  
          山川みかんを気軽に味わってほしいという想いから、訳あり価格で販売しています。
        </p>

        <div className="grid md:grid-cols-2 gap-10 mt-14">
          <div className="bg-white rounded-xl shadow-md p-6 border">
            <Image
              src="/mikan/defect.png"
              alt="訳あり"
              width={600}
              height={400}
              className="rounded-lg mx-auto"
            />
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border flex flex-col justify-center">
            <h3 className="text-xl font-semibold text-center md:text-left">
              見た目の傷だけ。味はそのまま
            </h3>
            <p className="text-gray-600 mt-3 leading-relaxed text-center md:text-left">
              味・香り・鮮度は通常品と同じ。  
              農家直売だからこそ実現できる価格です。
            </p>
          </div>
        </div>
      </section>

      {/* ============================= */}
      {/* ③ みかんギャラリー（スライダー） */}
      {/* ============================= */}
      <section
        ref={fade2.ref}
        className={`max-w-6xl mx-auto px-6 py-10 transition-all duration-700 ${
          fade2.show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          山川みかんギャラリー
        </h2>

        <Slider />
      </section>

    </main>
  );
}
