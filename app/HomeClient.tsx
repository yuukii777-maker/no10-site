"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import AboutTeaser from "../components/AboutTeaser"; // ★修正：相対パスを app/ からの一段上に
import SubFlash from "../components/SubFlash"; // ★追加：中央モーダル

/* ★ 追加：ホームを毎回最新で配信（どちらか1つでOK。ここでは force-dynamic を採用） */
export const dynamic = "force-dynamic";
// export const revalidate = 0; // ←こちらでも同等（どちらか片方のみでOK）

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
    {
      src: "/mikan/bnr_shipping_campaign.png?v=20260120a",
      caption: "山川の100円みかんを箱に詰めました。",
    },
    {
      src: "/mikan/bnr_open_special.png?v=20260120a",
      caption: "みかん購入で豪華なおまけ付き!!",
    },
    { src: "/mikan/bnr_oseibo.png?v=20260120a", caption: "二種の支払い方法" },
  ];
  const [index, setIndex] = useState(0);

  // ーーー 修正①: タイマー多重起動ガード（既存） ーーー
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
        {/* 背景（固定） */}
        <div className="absolute inset-0 hero-fixed-bg">
          <Image
            src="/mikan/hero_bg_base_lightgreen.png"
            alt="背景"
            fill
            priority
            className="object-contain"
          />
        </div>

        {/* 枝＋花（同じ強さで揺らす）
            ★修正：iPhoneで切れないよう「object-contain + 上下固定」& 透明PNGを使用 */}
        <div className="absolute inset-0 hero-sway pointer-events-none">
          {/* 上：枝＋みかん（透明PNG前提） */}
          <div className="hero-branch-slice hero-branch-top">
            <Image
              src="/mikan/hero_branch_top_only.png?v=20260225a"
              alt="枝とみかん（上）"
              fill
              priority
              sizes="100vw"
              className="object-contain object-top"
            />
          </div>

          {/* 下:花（透明PNG） */}
          <div className="hero-branch-slice hero-branch-bottom">
            <Image
              src="/mikan/hero_branch_bottom_only.png?v=20260225a"
              alt="花（下）"
              fill
              priority
              sizes="100vw"
              className="object-contain object-bottom"
            />
          </div>
        </div>

        {/* 子供（浮遊） */}
        <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
          <div className="relative hero-kids-float w-[92%] sm:w-[78%] md:w-[62%] max-w-[900px] mb-[6vh] md:mb-[7vh]">
            <Image
              src="/mikan/hero_kids_float.png"
              alt="子供たち"
              width={1200}
              height={800}
              priority
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* 太陽（静止＋周りだけ光が発行して消える） */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 -translate-x-1/2 top-[10%] sm:top-[9%] md:top-[8%] hero-medal-float">
            <div className="hero-sun-wrap">
              <div className="hero-sun-glow" />
              <Image
                src="/mikan/hero_sun.png"
                alt="太陽"
                width={520}
                height={520}
                priority
                className="w-[220px] sm:w-[270px] md:w-[340px] h-auto drop-shadow-[0_18px_35px_rgba(0,0,0,0.22)]"
              />
            </div>
          </div>
        </div>

        {/* メダル下：山口農園（太く・丸く） */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 -translate-x-1/2 top-[36%] sm:top-[34%] md:top-[32%] text-center">
            <div className="hero-brand-text">山口農園</div>
          </div>
        </div>

        {/* 購入ボタン（既存の導線を維持） */}
        <div className="absolute inset-0 z-[30] flex flex-col justify-center items-center text-white text-center px-6 drop-shadow-xl">
          <div className="relative mt-10 group -translate-y-8 sm:-translate-y-7 md:-translate-y-6">
            <button
              onClick={goProducts}
              className="bg-orange-500/70 hover:bg-orange-500/90 backdrop-blur-sm text-white px-10 py-3 rounded-full text-base sm:text-lg shadow-lg transition-all duration-200 active:scale-95"
            >
              🧺 みかんを購入する
            </button>
          </div>
        </div>

        {/* アニメCSS（このヒーロー内だけに適用） */}
        <style>{`
          .hero-fixed-bg {
            position: absolute;
            inset: 0;
            transform: translateZ(0);
          }

          .hero-fixed-bg :global(img) {
            transform: translateZ(0);
          }

          @keyframes heroSway {
            0% {
              transform: rotate(-1.4deg) translateY(0px);
            }
            50% {
              transform: rotate(1.4deg) translateY(-2px);
            }
            100% {
              transform: rotate(-1.4deg) translateY(0px);
            }
          }
          .hero-sway {
            transform-origin: top center;
            animation: heroSway 6s ease-in-out infinite;
            will-change: transform;
          }

          /* ★修正：上下2枚表示（containで絶対に切れない） */
          .hero-branch-slice {
            position: absolute;
            left: 0;
            right: 0;
            overflow: hidden;
            pointer-events: none;
          }
          .hero-branch-top {
            top: 0;
            height: 44%;
          }
          .hero-branch-bottom {
            bottom: 0;
            height: 44%;
          }

          /* ★修正：1pxの隙間対策（iPhoneで稀に出る） */
          .hero-branch-slice :global(img) {
            transform: scale(1.02);
            transform-origin: center;
          }

          @keyframes kidsFloat {
            0% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
            100% {
              transform: translateY(0px);
            }
          }
          .hero-kids-float {
            animation: kidsFloat 4.2s ease-in-out infinite;
            will-change: transform;
          }

          @keyframes medalFloat {
            0% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-8px);
            }
            100% {
              transform: translateY(0px);
            }
          }
          .hero-medal-float {
            animation: medalFloat 3.6s ease-in-out infinite;
            will-change: transform;
          }

          /* ★追加：太陽の周囲だけ“発光→消える”を繰り返す */
          .hero-sun-wrap {
            position: relative;
            display: inline-block;
          }
          @keyframes sunGlowPulse {
            0% {
              opacity: 0.18;
              transform: translate(-50%, -50%) scale(0.92);
              filter: blur(8px);
            }
            50% {
              opacity: 0.55;
              transform: translate(-50%, -50%) scale(1.03);
              filter: blur(14px);
            }
            100% {
              opacity: 0.18;
              transform: translate(-50%, -50%) scale(0.92);
              filter: blur(8px);
            }
          }
          .hero-sun-glow {
            position: absolute;
            left: 50%;
            top: 50%;
            width: 150%;
            height: 150%;
            transform: translate(-50%, -50%);
            border-radius: 9999px;
            background: radial-gradient(
              circle,
              rgba(255, 214, 90, 0.55) 0%,
              rgba(255, 214, 90, 0.22) 38%,
              rgba(255, 214, 90, 0) 70%
            );
            animation: sunGlowPulse 2.8s ease-in-out infinite;
            pointer-events: none;
          }

          /* ★追加：ブランド文字（白ベース＋ほんのり金縁＋太め＋丸み） */
          @keyframes brandFloat {
            0% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-6px);
            }
            100% {
              transform: translateY(0px);
            }
          }
          .hero-brand-text {
            font-weight: 900;
            letter-spacing: 0.18em;
            font-size: clamp(34px, 6vw, 68px);
            color: #ffffff;
            text-shadow: 0 3px 10px rgba(0, 0, 0, 0.22),
              0 0 6px rgba(255, 255, 255, 0.65);
            -webkit-text-stroke: 2px rgba(212, 175, 55, 0.55);
            font-family: ui-rounded, "Hiragino Maru Gothic ProN",
              "Hiragino Maru Gothic Pro", "Yu Gothic", system-ui, sans-serif;
            animation: brandFloat 4s ease-in-out infinite;
            will-change: transform;
          }
        `}</style>
      </section>

      {/* ▼▼▼ ここに購入ボタン直下の自己紹介＋メルマガを差し込む ▼▼▼ */}
      <AboutTeaser />
      <SubFlash /> {/* ★追加：?sub=ok/err/unsub に反応して中央にモーダル表示 */}
      {/* ▲▲▲ 差し込みここまで ▲▲▲ */}

      {/* ② スライダー（内容変更なし） */}
      <section className="max-w-6xl mx-auto px-6 py-8 md:py-16 relative z-10">
        <div className="relative w-full overflow-hidden rounded-xl shadow-xl slider-container">
          {/* ーーー 修正②: 余計な contain/GPU 指定を削除 ーーー */}
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
                  className="object-contain"
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
          傷があっても味は抜群。安くて気軽に楽しんでほしい想いをそのまま箱に詰めました。
        </div>

        {/* ▼▼▼ ここから追加 ▼▼▼ */}
        <div className="max-w-5xl mx-auto mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="relative w-full h-60 sm:h-72 md:h-80 rounded-xl overflow-hidden shadow-md">
              <Image
                src="/mikan/reason_shop_1.jpg"
                alt="山川みかん 無人販売所の様子（全景）"
                fill
                className="object-contain"
                sizes="(min-width: 640px) 50vw, 100vw"
                priority
              />
            </div>
            <div className="relative w-full h-60 sm:h-72 md:h-80 rounded-xl overflow-hidden shadow-md">
              <Image
                src="/mikan/reason_shop_2.jpg"
                alt="山川みかん 無人販売所の様子（看板と棚）"
                fill
                className="object-contain"
                sizes="(min-width: 640px) 50vw, 100vw"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-black/5 text-center">
            <p className="mb-3 text-[15px] leading-relaxed sm:text-base">
              直売所の住所はこちらにお問合せください。
            </p>
            <a
              href="mailto:kakuda.040611@gmail.com?subject=%E7%9B%B4%E5%A3%B2%E6%89%80%E3%81%AE%E4%BD%8F%E6%89%80%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6%E5%95%8F%E3%81%84%E5%90%88%E3%82%8F%E3%81%9B&body=%E3%81%8A%E5%90%8D%E5%89%8D%EF%BC%9A%0A%E3%81%94%E7%94%A8%E4%BB%B6%EF%BC%9A%0A"
              className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-white shadow-sm transition hover:opacity-90 bg-orange-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            >
              お問い合わせ（メールを開く）
            </a>
          </div>
        </div>
        {/* ▲▲▲ 追加ここまで ▲▲▲ */}
      </section>

      {/* ★ みかんのメリット（内容変更なし） */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <details className="group bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6">
          <summary className="cursor-pointer list-none text-center">
            <span className="text-lg font-semibold">
              🍊 みかんのメリット＆デメリット
            </span>
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
          <GalleryItem
            src="/mikan/defect.png"
            title="訳ありみかん"
            text="甘さは本物。人気No.1。"
          />
          <GalleryItem
            src="/mikan/premium.png"
            title="正規品"
            text="贈答にも選ばれる品質。"
          />
          <GalleryItem
            src="/mikan/hand.png"
            title="手作業収穫"
            text="一つずつ丁寧に。"
          />
        </div>
      </section>

      {/* ーーー 修正③: スライダー CSS 最小限（img に transform 禁止） ーーー */}
      <style>{`
        .slider-container {
          position: relative;
          overflow: hidden;
        }
        .slider-track {
          display: flex;
          width: 100%;
          will-change: transform;
          transition: transform 700ms cubic-bezier(0.22, 0.61, 0.36, 1);
          backface-visibility: hidden;
          transform: translate3d(0, 0, 0);
        }
        .slider-item {
          flex: 0 0 100%;
          position: relative;
        }
        .slider-item img {
          display: block; /* Safari 安定 */
          pointer-events: none;
          user-select: none;
          -webkit-user-drag: none;
          backface-visibility: hidden;
          /* transform 付与しないこと！ */
        }
        .slider-caption {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0.75rem;
          text-align: center;
          color: #fff;
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
          font-weight: 600;
        }
        @media (prefers-reduced-motion: reduce) {
          .slider-track {
            transition: none !important;
          }
        }
      `}</style>
    </main>
  );
}

/* ===========================
   ギャラリー（既存）
=========================== */
function GalleryItem({
  src,
  title,
  text,
}: {
  src: string;
  title: string;
  text: string;
}) {
  const fade = useFadeIn();
  return (
    <div ref={fade} className="opacity-0 translate-y-6 transition-all duration-700">
      <div className="relative w-full h-56 rounded-xl overflow-hidden shadow-md">
        <Image
          src={src}
          alt={title}
          fill
          sizes="(min-width: 768px) 33vw, 100vw" /* 明示して安定 */
          className="object-contain"
        />
      </div>
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 mt-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-gray-600 text-sm mt-1">{text}</p>
      </div>
    </div>
  );
}