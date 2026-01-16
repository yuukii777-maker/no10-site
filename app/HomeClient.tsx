"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import AppleFloat from "./AppleFloat"; // 既存そのまま

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
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % sliderImages.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  /* ===========================
     パララックス（既存）
  ============================ */
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY * 0.4);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
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
          ① ヒーロー（3レイヤーパララックス + CSS放射光）
      ============================ */}
      <section className="hero-root relative h-[80svh] sm:h-[85svh] overflow-hidden z-20">
        {/* 背景Z3（山・空） */}
        <div
          className="absolute inset-0 z-[0]"
          style={{ transform: `translateY(${offset * 0.08}px)` }}
        >
          <Image
            src="/mikan/hero/hero_z3_mountain_mist.jpg?v=20260116d"
            alt="山の背景"
            fill
            priority
            className="object-cover brightness-[0.9]"
            sizes="100vw"
          />
        </div>

        {/* 背景Z2（木箱） */}
        <div
          className="absolute inset-0 z-[5]"
          style={{ transform: `translateY(${offset * 0.15}px)` }}
        >
          <Image
            src="/mikan/hero/hero_z2_wooden_crate.jpg?v=20260116d"
            alt="木箱のみかん"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>

        {/* 背景Z1（寄り） */}
        <div
          className="absolute inset-0 z-[8]"
          style={{ transform: `translateY(${offset * 0.25}px)` }}
        >
          <Image
            src="/mikan/hero/hero_z1_orange_closeup.jpg?v=20260116d"
            alt="みかんの寄り"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>

        {/* 放射光（縫い目なし / 右上→左下） */}
        <div
          className="
            pointer-events-none absolute -top-[18%] -right-[10%]
            h-[180%] w-[80%] z-[12]
            origin-top-right rotate-[-22deg]
            will-change-transform animate-[beamDrift_26s_linear_infinite]
            mix-blend-screen
          "
          style={{
            background: `
              linear-gradient(210deg,
                rgba(255,248,220,0.00) 20%,
                rgba(255,242,180,0.92) 23%,
                rgba(255,230,140,0.88) 28%,
                rgba(255,200,120,0.00) 38%
              ),
              linear-gradient(210deg,
                rgba(255,200,120,0.00) 16%,
                rgba(255,200,120,0.22) 30%,
                rgba(255,200,120,0.00) 50%
              )
            `,
            clipPath: "polygon(100% 0%, 70% 0%, 0% 100%, 35% 100%)",
            filter: "blur(18px)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
          }}
        />

        {/* もや＋微粒子（ムラ付け） */}
        <div
          className="pointer-events-none absolute inset-0 z-[11]
                     will-change-transform animate-[haze_40s_linear_infinite]
                     mix-blend-screen"
          style={{
            background:
              "radial-gradient(60% 40% at 18% 88%, rgba(255,170,60,0.12) 0%, rgba(255,170,60,0) 60%), radial-gradient(45% 30% at 70% 18%, rgba(255,240,170,0.10) 0%, rgba(255,240,170,0) 60%)",
            filter: "blur(10px)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 z-[11] opacity-45
                     will-change-transform animate-[gobo_40s_linear_infinite]
                     mix-blend-screen"
          style={{
            background:
              "repeating-radial-gradient(circle at 70% 20%, rgba(255,255,255,0.18) 0 1px, transparent 1px 8px), repeating-linear-gradient(125deg, rgba(255,255,255,0.10) 0 2px, transparent 2px 14px)",
            filter: "blur(6px)",
          }}
        />

        {/* 和紙影（既存クラス） */}
        <div className="absolute inset-0 z-[15] hero-overlay" />

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

        {/* キーフレーム（グローバル定義） */}
        <style jsx global>{`
          @keyframes beamDrift {
            0%   { transform: translate3d(0,0,0) rotate(-22deg) scale(1); opacity:.95; }
            50%  { transform: translate3d(-1.4%,1.2%,0) rotate(-20deg) scale(1.04); opacity:1; }
            100% { transform: translate3d(0,0,0) rotate(-22deg) scale(1); opacity:.95; }
          }
          @keyframes haze {
            0%   { transform: translate3d(0,0,0) scale(1); }
            50%  { transform: translate3d(-2%,1%,0) scale(1.03); }
            100% { transform: translate3d(0,0,0) scale(1); }
          }
          @keyframes gobo {
            0%   { transform: translate3d(0,0,0) }
            50%  { transform: translate3d(-1.2%,0.8%,0) }
            100% { transform: translate3d(0,0,0) }
          }
          @media (prefers-reduced-motion: reduce) {
            .animate-[beamDrift_26s_linear_infinite],
            .animate-[haze_40s_linear_infinite],
            .animate-[gobo_40s_linear_infinite] { animation: none !important; }
          }
        `}</style>
      </section>

      {/* ② スライダー（内容変更なし） */}
      <section className="max-w-6xl mx-auto px-6 py-8 md:py-16 relative z-10">
        <div className="relative w-full overflow-hidden rounded-xl shadow-xl slider-container">
          <div
            className="slider-track"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {sliderImages.map((item, i) => (
              <div key={i} className="slider-item relative h-[360px] sm:h-[850px]">
                <Image src={item.src} alt={item.caption} fill className="object-cover" />
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
    </main>
  );
}

/* ===========================
   ギャラリー（内容変更なし）
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
