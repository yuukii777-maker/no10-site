"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/* ===========================
   SEO
=========================== */
export const metadata = {
  title: "山川みかん農園｜こだわり・100円みかんの理由",
  description:
    "福岡県みやま市山川町で丁寧に育てた山川みかん。甘味・香り・食感にこだわり、無人販売で気軽に楽しめる100円みかんを提供しています。",
};

/* ===========================
   フェードイン用クラス
=========================== */
function useFadeIn() {
  useEffect(() => {
    const targets = document.querySelectorAll(".fade-in");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("show");
        });
      },
      { threshold: 0.15 }
    );

    targets.forEach((el) => observer.observe(el));
  }, []);
}

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  // 軽量パララックス
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const y = window.scrollY * 0.25;
      heroRef.current.style.transform = `translateY(${y}px)`;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // フェードイン発火
  useFadeIn();

  return (
    <main className="pt-20 text-[#333]">

      {/* ============================= */}
      {/* 🔶 ヒーロー */}
      {/* ============================= */}
      <section className="relative w-full h-[70vh] overflow-hidden bg-black">
        <div ref={heroRef} className="absolute inset-0 will-change-transform">
          <Image
            src="/mikan/hiro.png"
            alt="山川みかん農園"
            fill
            priority
            className="object-cover scale-105"
          />
        </div>

        <div className="absolute inset-0 bg-black/35" />

        <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-6 fade-in">
          <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg tracking-wide">
            丁寧に育て、丁寧に収穫する。
          </h1>
          <p className="mt-4 text-lg md:text-xl font-light drop-shadow">
            山川みかん農園 — 心を込めた柑橘づくり
          </p>
        </div>
      </section>

      {/* ============================= */}
      {/* 🔶 農園について */}
      {/* ============================= */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-16 fade-in">
        <h2 className="text-3xl md:text-3xl font-bold text-center">
          山川みかん農園について
        </h2>

        <p className="text-center text-gray-600 mt-4 leading-relaxed text-[15px] md:text-base">
          福岡県みやま市山川町は、みかん栽培に最適な環境が揃う地域。<br className="hidden md:block" />
          海風・日当たり・水はけの良い土壌が、美味しいみかんを育てています。
        </p>

        {/* 🔸 軽量スライダー（CSS Only） */}
        <div className="mt-10 overflow-hidden rounded-xl shadow-lg slider">
          <div className="slide-track">
            <Image
              src="/mikan/farm.png"
              width={1600}
              height={900}
              alt="農園"
              className="slide-img"
            />
            <Image
              src="/mikan/hand.png"
              width={1600}
              height={900}
              alt="収穫"
              className="slide-img"
            />
            <Image
              src="/mikan/premium.png"
              width={1600}
              height={900}
              alt="品質"
              className="slide-img"
            />
          </div>
        </div>
      </section>

      {/* ============================= */}
      {/* 🔶 こだわりカード */}
      {/* ============================= */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-12 fade-in">
        <h2 className="text-3xl font-bold text-center">こだわり</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 mt-12">
          {/* カード1 */}
          <div className="bg-white rounded-xl shadow-md p-6 text-center border hover:shadow-xl transition fade-in">
            <Image
              src="/mikan/premium.png"
              alt="品質"
              width={180}
              height={180}
              className="mx-auto rounded-lg"
            />
            <h3 className="text-lg md:text-xl font-semibold mt-6">
              甘み・香りのバランス
            </h3>
            <p className="text-gray-600 mt-3 leading-relaxed text-sm md:text-base">
              海風で育つ山川みかんは、香りが強く甘味と酸味の調和が魅力です。
            </p>
          </div>

          {/* カード2 */}
          <div className="bg-white rounded-xl shadow-md p-6 text-center border hover:shadow-xl transition fade-in">
            <Image
              src="/mikan/hand.png"
              alt="収穫"
              width={180}
              height={180}
              className="mx-auto rounded-lg"
            />
            <h3 className="text-lg md:text-xl font-semibold mt-6">
              ひとつひとつ手作業
            </h3>
            <p className="text-gray-600 mt-3 leading-relaxed text-sm md:text-base">
              熟度を見極め、ベストなタイミングで丁寧に収穫しています。
            </p>
          </div>

          {/* カード3 */}
          <div className="bg-white rounded-xl shadow-md p-6 text-center border hover:shadow-xl transition fade-in">
            <Image
              src="/mikan/defect.png"
              alt="訳あり"
              width={180}
              height={180}
              className="mx-auto rounded-lg"
            />
            <h3 className="text-lg md:text-xl font-semibold mt-6">
              訳あり100円の理由
            </h3>
            <p className="text-gray-600 mt-3 leading-relaxed text-sm md:text-base">
              傷があっても味は変わりません。地域の味を気軽に楽しんでほしいという想いです。
            </p>
          </div>
        </div>
      </section>

      {/* ============================= */}
      {/* 🔶 ストーリー */}
      {/* ============================= */}
      <section className="bg-[#fafafa] py-20 border-t fade-in">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold">私たちの想い</h2>

          <p className="text-gray-700 leading-relaxed text-lg mt-6">
            私たちは、地域の自然を尊重しながら「食べた人が笑顔になるみかん」を目指しています。
            土づくりから収穫まで心を込めて育てています。
          </p>

          <p className="text-gray-600 leading-relaxed mt-6">
            訳あり100円みかんは、山川のみかんをもっと知って欲しいという願いから始めた取り組みです。
            傷があっても、みかんの味は嘘をつきません。
          </p>
        </div>
      </section>
    </main>
  );
}

/* ======================================= */
/* 🔧 CSS（Tailwindと併用。必要なら globals.css に追記） */
/* ======================================= */

