"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import AppleFloat from "./AppleFloat"; // 既存そのまま

/* ===========================
   フェードインアニメ（既存）
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

/* ===========================
   メインコンポーネント
=========================== */
export default function Home() {
  const router = useRouter();

  /* ===========================
     スライダー制御（内容変更なし）
  ============================ */
  const sliderImages = [
    { src: "/mikan/bnr_shipping_campaign.png", caption: "山川の100円みかんを箱に詰めました。" },
    { src: "/mikan/bnr_open_special.png", caption: "みかん購入で豪華なおまけ付き!!" },
    { src: "/mikan/bnr_oseibo.png", caption: "二種の支払い方法" },
  ];
  const [index, setIndex] = useState(0);

  // ーーー 修正点①: バックグラウンドでsetIntervalが溜まらないよう制御 ーーー
  const sliderTimerRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    const start = () => {
      if (sliderTimerRef.current) return;
      sliderTimerRef.current = window.setInterval(() => {
        setIndex((prev) => (prev + 1) % sliderImages.length);
      }, 4000);
    };
    const stop = () => {
      if (sliderTimerRef.current) {
        clearInterval(sliderTimerRef.current);
        sliderTimerRef.current = undefined;
      }
    };
    const onVis = () => (document.hidden ? stop() : start());

    const onPageShow = () => start();
    const onPageHide = () => stop();

    start();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [sliderImages.length]);

  /* ===========================
     遷移フェード（既存）
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
          ① ヒーロー（Z2〜Z4の画像レイヤー廃止版）
          背景はCSSのみ（グラデ＋微粒子）、主役は AppleFloat
      ============================ */}
      <section className="hero-root relative h-[80svh] sm:h-[85svh] overflow-hidden z-20">
        {/* 背景：みかん色グラデ（放射＋周辺減光） */}
        <div
          className="absolute inset-0 z-[0]"
          style={{
            background: `
              radial-gradient(140% 90% at 10% 95%, rgba(255,160,60,0.22) 0%, rgba(255,160,60,0) 55%),
              radial-gradient(160% 120% at 70% -10%, rgba(255,235,190,0.30) 0%, rgba(255,235,190,0) 60%),
              linear-gradient(180deg, #9a4d1f 0%, #b75b24 24%, #d8742d 50%, #e78a3b 72%, #eea45a 100%)
            `,
          }}
        />

        {/* きめ細かい“星屑”粒子（ごく控えめ） */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] opacity-[.35] mix-blend-screen"
          style={{
            background:
              "repeating-radial-gradient(circle at 30% 20%, rgba(255,255,255,0.14) 0 1px, transparent 1px 8px), repeating-radial-gradient(circle at 70% 65%, rgba(255,240,180,0.12) 0 1px, transparent 1px 10px)",
            filter: "blur(0.6px)",
          }}
        />

        {/* ほんのり“もや” */}
        <div
          className="pointer-events-none absolute inset-0 z-[2] mix-blend-screen"
          style={{
            background:
              "radial-gradient(60% 40% at 18% 88%, rgba(255,170,60,0.12) 0%, rgba(255,170,60,0) 60%), radial-gradient(45% 30% at 70% 18%, rgba(255,240,170,0.10) 0%, rgba(255,240,170,0) 60%)",
            filter: "blur(10px)",
          }}
        />

        {/* 和紙影（既存クラス） */}
        <div className="absolute inset-0 z-[5] hero-overlay" />

        {/* みかん（AppleFloat：主役） */}
        <div className="absolute inset-0 z-[20]">
          <AppleFloat />
        </div>

        {/* テキスト（最前面） */}
        <div className="absolute inset-0 z-[30] flex flex-col justify-center items-center text-white text-center px-6 drop-shadow-xl">
          <h1 className="text-4xl md:text-6xl font-bold">山口みかん農園</h1>
          <h2 className="text-xl md:text-3xl mt-4 opacity-90">
            — 自然の旬の甘さそのままに —
          </h2>
          <div className="relative mt-10 group">
            <button
              onClick={goProducts}
              className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-3 rounded-full text-lg shadow-lg transition-all duration-200 active:scale-95"
            >
              🧺 みかんを購入する
            </button>
          </div>
        </div>
      </section>

      {/* ② スライダー（内容変更なし） */}
      <section className="max-w-6xl mx-auto px-6 py-8 md:py-16 relative z-10">
        <div className="relative w-full overflow-hidden rounded-xl shadow-xl slider-container">
          {/* ーーー 修正点②: レイアウト固定・GPU合成（imgにtransformを当てない） ーーー */}
          <div
            className="slider-track"
            style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
          >
            {sliderImages.map((item, i) => (
              <div key={i} className="slider-item relative h-[360px] sm:h-[850px]">
                <Image
                  src={item.src}
                  alt={item.caption}
                  fill
                  sizes="100vw"
                  priority={i === 0}
                  className="object-cover"
                />
                <div className="slider-caption">{item.caption}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ③ 100円みかんの理由（内容変更なし） */}
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-24">
        <h2 className="text-3xl font-bold text-center">100円みかんの理由</h2>
        <div className="max-w-3xl mx-auto mt-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 text-center text-gray-700">
          傷があっても味は抜群。気軽に楽しんでほしい想いから生まれました。
        </div>
      </section>

      {/* ★ みかんのメリット（内容変更なし） */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <details className="group bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6">
          <summary className="cursor-pointer list-none text-center">
            <span className="text-lg font-semibold">🍊 みかんのメリット＆デメリット</span>
            <span className="block text-sm text-gray-500 mt-1 group-open:hidden">
              タップして読む →
            </span>
          </summary>
          <div className="mt-4 space-y-2 text-sm text-gray-700 leading-relaxed">
            <p>・手軽に食べれて、皮をお風呂に入れてリラックスできる。</p>
            <p>・朝一番と深夜のエネルギー、水分不足を一個で解決。</p>
            <p>・βカロテンで美肌効果あり。</p>
            <p>・ビタミンとクエン酸で体の回復をサポート。</p>
            <p className="text-xs text-gray-500">
              ※ みかんは1日1〜2個を目安にお楽しみください。
              ４つ以上はお腹がゆるくなることがあります。
            </p>
          </div>
        </details>
      </section>

      {/* ④ ギャラリー（内容変更なし） */}
      <section className="max-w-6xl mx-auto px-6 pb-32 pt-12">
        <h2 className="text-3xl font-bold text-center mb-12">
          山口みかんギャラリー
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          <GalleryItem src="/mikan/defect.png" title="訳ありみかん" text="甘さは本物。人気No.1。" />
          <GalleryItem src="/mikan/premium.png" title="正規品" text="贈答にも選ばれる品質。" />
          <GalleryItem src="/mikan/hand.png" title="手作業収穫" text="一つずつ丁寧に。" />
        </div>
      </section>

      {/* ーーー 修正点③: スライダーのグローバルCSS（imgへtransformを当てない） ーーー */}
      <style jsx global>{`
        .slider-container { position: relative; overflow: hidden; }
        .slider-track {
          display: flex;
          width: 100%;
          will-change: transform;
          transition: transform 700ms cubic-bezier(.22,.61,.36,1);
          backface-visibility: hidden;
          transform: translate3d(0,0,0);
          contain: paint;
        }
        .slider-item { flex: 0 0 100%; position: relative; }
        /* Next/Image の wrapper(span[data-nimg])側をGPU合成 */
        .slider-item :global(span[data-nimg]) {
          transform: translateZ(0);
          will-change: transform;
        }
        /* img には transform を当てない（Safari描画飛び対策） */
        .slider-item img {
          pointer-events: none;
          user-select: none;
          -webkit-user-drag: none;
          backface-visibility: hidden;
        }
        .slider-caption {
          position: absolute; left: 0; right: 0; bottom: 0.75rem;
          text-align: center; color: #fff;
          text-shadow: 0 2px 6px rgba(0,0,0,.35);
          font-weight: 600;
        }
        @media (prefers-reduced-motion: reduce) {
          .slider-track { transition: none !important; }
        }
      `}</style>
    </main>
  );
}

/* ===========================
   ギャラリー（既存）
=========================== */
function GalleryItem({ src, title, text }: { src: string; title: string; text: string }) {
  const fade = useFadeIn();
  return (
    <div ref={fade} className="opacity-0 translate-y-6 transition-all duration-700">
      <div className="relative w-full h-56 rounded-xl overflow-hidden shadow-md">
        <Image src={src} alt={title} fill className="object-cover" />
      </div>
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 mt-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-gray-600 text-sm mt-1">{text}</p>
      </div>
    </div>
  );
}
