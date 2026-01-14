"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

/* ===========================
   フェードインアニメ
=========================== */
function useFadeIn() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("opacity-100", "translate-y-0");
          }
        });
      },
      { threshold: 0.2 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return ref;
}

export default function Home() {
  const router = useRouter();

  /* ===========================
     スライダー制御（復活）
  ============================ */
  const sliderImages = [
    { src: "/mikan/bnr_shipping_campaign.png", caption: "山川の100円みかんを箱に詰めました。" },
    { src: "/mikan/bnr_open_special.png", caption: "みかん購入で豪華なおまけ付き!!" },
    { src: "/mikan/bnr_oseibo.png", caption: "二種の支払い方法" },
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % sliderImages.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  /* ===========================
     パララックス制御（安全版）
  ============================ */
  const [scrollY, setScrollY] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMouse({ x, y });
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  /* ===========================
     遷移フェード
  ============================ */
  const FADE_DURATION = 250;
  const [leaving, setLeaving] = useState(false);

  const goProducts = () => {
    setLeaving(true);
    setTimeout(() => {
      router.push("/products");
    }, FADE_DURATION);
  };

  return (
    <main
      className={`text-[#333] transition-opacity duration-300 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* ===========================
          HERO：安定パララックス
      ============================ */}
      <section className="hero-root relative h-[80vh] overflow-hidden z-20">
        {/* Z-3 背景（山・霧） */}
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            transform: `
              translateY(${scrollY * 0.08}px)
              translateX(${mouse.x * 6}px)
              scale(1.02)
            `,
          }}
        >
          <Image
            src="/mikan/hero/hero_z3_mountain_mist.jpg"
            alt="山と霧"
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Z-2 中景（木箱） */}
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            transform: `
              translateY(${scrollY * 0.15}px)
              translateX(${mouse.x * 10}px)
              scale(1.04)
            `,
          }}
        >
          <Image
            src="/mikan/hero/hero_z2_wooden_crate.jpg"
            alt="木箱のみかん"
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Z-1 前景（みかん寄り） */}
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            transform: `
              translateY(${scrollY * 0.25}px)
              translateX(${mouse.x * 16}px)
              scale(1.08)
            `,
          }}
        >
          <Image
            src="/mikan/hero/hero_z1_orange_closeup.jpg"
            alt="みかんの寄り"
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* 和紙影 */}
        <div className="absolute inset-0 hero-overlay z-[5]" />

        {/* テキスト */}
        <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center px-6 text-white drop-shadow-xl">
          <h1 className="text-4xl md:text-6xl font-bold">山口みかん農園</h1>
          <h2 className="text-xl md:text-3xl mt-4 opacity-90">
            — 自然の旬の甘さそのままに —
          </h2>

          <button
            onClick={goProducts}
            className="mt-10 bg-orange-500 hover:bg-orange-600 text-white px-10 py-3 rounded-full text-lg shadow-lg transition-all duration-200 active:scale-95"
          >
            🧺 みかんを購入する
          </button>
        </div>
      </section>

      {/* 以下は既存コードそのまま */}
      {/* ② スライダー */}
      {/* ③ 理由 */}
      {/* ④ ギャラリー */}
    </main>
  );
}
