"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import AboutTeaser from "../components/AboutTeaser";
import SubFlash from "../components/SubFlash";

// ✅ Hydration対策：OpeningIntro はSSRしない（クライアントのみ）
import nextDynamic from "next/dynamic";
const OpeningIntro = nextDynamic(() => import("../components/OpeningIntro"), {
  ssr: false,
  loading: () => null,
});

/* ★ 追加：ホームを毎回最新で配信（どちらか1つでOK。ここでは force-dynamic を採用） */
export const dynamic = "force-dynamic";
// export const revalidate = 0;

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

  // ✅ Hydration完全対策：初回レンダーをSSRと一致させる
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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

  /* ===========================
     ★追加：① 超微細パララックス（マウス＋スマホ傾き）
     ※既存コードは変更せず、CSS変数を流し込むだけ
  ============================ */
  const heroRootRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = heroRootRef.current;
    if (!el) return;

    const clamp = (v: number, min: number, max: number) =>
      Math.min(max, Math.max(min, v));

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf: number | null = null;
    let running = true;

    const apply = () => {
      if (!running) return;

      // タブ非表示の時は止める（Firefoxの警告対策の要）
      if (document.hidden) {
        raf = null;
        return;
      }

      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      el.style.setProperty("--px", String(cx));
      el.style.setProperty("--py", String(cy));

      raf = requestAnimationFrame(apply);
    };

    const start = () => {
      if (raf != null) return;
      running = true;
      raf = requestAnimationFrame(apply);
    };

    const stop = () => {
      running = false;
      if (raf != null) cancelAnimationFrame(raf);
      raf = null;
    };

    const onVis = () => {
      if (document.hidden) stop();
      else start();
    };

    const onMouse = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      tx = clamp(nx, -1, 1);
      ty = clamp(ny, -1, 1);
    };

    const onOri = (e: DeviceOrientationEvent) => {
      if (typeof e.gamma !== "number" || typeof e.beta !== "number") return;
      tx = clamp(e.gamma / 25, -1, 1);
      ty = clamp(e.beta / 35, -1, 1);
    };

    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("deviceorientation", onOri);
    document.addEventListener("visibilitychange", onVis);

    // 初回起動
    start();

    return () => {
      stop();
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("deviceorientation", onOri);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <main
      className={`text-[#333] transition-opacity duration-300 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* ✅ [ADDED] オープニング（1回だけ再生 / Skipあり） */}
      {mounted ? <OpeningIntro /> : null}

      {/* ===========================
          ① ヒーロー（Z2〜Z4の画像レイヤー廃止版）
          背景はCSSのみ（グラデ＋微粒子）、主役は AppleFloat
      ============================ */}
      <section
        ref={heroRootRef as any}
        className="hero-root relative h-[80svh] sm:h-[85svh] overflow-hidden z-20"
      >
        {/* ★追加：② 光粒子（超控えめ） */}
        <div className="absolute inset-0 hero-particles pointer-events-none" />

        {/* ★追加：③ 朝もや・空気感（薄いハイライト） */}
        <div className="absolute inset-0 hero-atmosphere pointer-events-none" />

        {/* 背景（固定） */}
        <div className="absolute inset-0 hero-fixed-bg">
          <Image
            src="/mikan/hero_bg_base_lightgreen.png"
            alt="背景"
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* 枝＋花（同じ強さで揺らす）
            ★修正：PNGを<Image fill>で置かず、CSS背景＋マスクで“貼ってる感”を消す */}
        <div className="absolute inset-0 hero-sway pointer-events-none">
          <div className="hero-branch-topLayer" />
          <div className="hero-branch-bottomLayer" />
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
          <div className="absolute left-1/2 -translate-x-1/2 top-[33%] sm:top-[31%] md:top-[29%] text-center">
            <div className="hero-brand-text">山口農園</div>
          </div>
        </div>

        {/* 購入ボタン（既存の導線を維持） */}
        <div className="absolute inset-0 z-[999] flex flex-col justify-center items-center text-white text-center px-6 drop-shadow-xl">
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
        <style suppressHydrationWarning>{`
          .hero-fixed-bg {
            position: absolute;
            inset: 0;
            transform: translateZ(0);
          }

          .hero-fixed-bg :global(img) {
            transform: translateZ(0);
          }

          /* ★追加：iPhoneのsvh変動でも高さが足りなくならない保険 */
          .hero-root {
            min-height: 80vh;
            --px: 0;
            --py: 0;
          }

          /* ★追加：レイヤー順を固定（iPhone Safari合成バグ対策） */
          .hero-fixed-bg { z-index: 1; }
          .hero-atmosphere { z-index: 2; }
          .hero-particles { z-index: 3; }
          .hero-sway { z-index: 10; }
          .hero-kids-float { z-index: 12; }
          .hero-medal-float { z-index: 13; }
          .hero-brand-text { z-index: 13; }

          /* ★追加：① 超微細パララックス（背景だけ） */
          .hero-fixed-bg :global(img) {
            transform: translate3d(calc(var(--px) * -3px), calc(var(--py) * -2px), 0);
          }

          /* ★追加：② 光粒子（微粒・ゆっくり） */
          .hero-particles {
            opacity: 0.55;
            background:
              radial-gradient(circle at 18% 22%, rgba(255,255,255,0.55) 0 1px, rgba(255,255,255,0) 2px),
              radial-gradient(circle at 72% 28%, rgba(255,255,255,0.45) 0 1px, rgba(255,255,255,0) 2px),
              radial-gradient(circle at 34% 64%, rgba(255,255,255,0.40) 0 1px, rgba(255,255,255,0) 2px),
              radial-gradient(circle at 82% 62%, rgba(255,255,255,0.35) 0 1px, rgba(255,255,255,0) 2px),
              radial-gradient(circle at 52% 44%, rgba(255,255,255,0.35) 0 1px, rgba(255,255,255,0) 2px);
            filter: blur(0.15px);
            animation: particlesDrift 10.5s ease-in-out infinite;
            transform: translate3d(0,0,0);
          }
          @keyframes particlesDrift {
            0%   { transform: translate3d(calc(var(--px) * 2px), calc(var(--py) * 2px), 0); opacity: 0.45; }
            50%  { transform: translate3d(calc(var(--px) * -2px), calc(var(--py) * -3px), 0); opacity: 0.65; }
            100% { transform: translate3d(calc(var(--px) * 2px), calc(var(--py) * 2px), 0); opacity: 0.45; }
          }

          /* ★追加：③ 空気感（薄い朝もや・光の筋） */
          .hero-atmosphere {
            mix-blend-mode: screen;
            opacity: 0.35;
            background:
              radial-gradient(1200px 700px at 50% 18%, rgba(255,255,255,0.28), rgba(255,255,255,0) 60%),
              linear-gradient(120deg, rgba(255,236,190,0.0) 0%, rgba(255,236,190,0.22) 35%, rgba(255,236,190,0.0) 70%);
            animation: hazeMove 9.5s ease-in-out infinite;
            transform: translate3d(0,0,0);
          }
          @keyframes hazeMove {
            0%   { transform: translate3d(calc(var(--px) * 3px), calc(var(--py) * 2px), 0); opacity: 0.30; }
            50%  { transform: translate3d(calc(var(--px) * -3px), calc(var(--py) * -2px), 0); opacity: 0.42; }
            100% { transform: translate3d(calc(var(--px) * 3px), calc(var(--py) * 2px), 0); opacity: 0.30; }
          }

          .hero-sway {
            will-change: auto;
            backface-visibility: hidden;
          }

          .hero-branch-topLayer,
          .hero-branch-bottomLayer {
            position: absolute;
            left: -6%;
            right: -6%;
            pointer-events: none;
            background-repeat: no-repeat;
            background-size: cover;
            will-change: transform;
            transform: translateZ(0);
            backface-visibility: hidden;
            transform-origin: top center;
          }

          @keyframes heroSwayTop {
            0%   { transform: translate3d(calc(var(--px) * 1.5px), calc(var(--py) * 1px), 0) rotate(-1.4deg) translateY(0px); }
            50%  { transform: translate3d(calc(var(--px) * 1.5px), calc(var(--py) * 1px), 0) rotate(1.4deg) translateY(-2px); }
            100% { transform: translate3d(calc(var(--px) * 1.5px), calc(var(--py) * 1px), 0) rotate(-1.4deg) translateY(0px); }
          }
          @keyframes heroSwayBottom {
            0%   { transform: translate3d(calc(var(--px) * 1.2px), calc(var(--py) * 0.8px), 0) rotate(-1.4deg) translateY(0px); }
            50%  { transform: translate3d(calc(var(--px) * 1.2px), calc(var(--py) * 0.8px), 0) rotate(1.4deg) translateY(-2px); }
            100% { transform: translate3d(calc(var(--px) * 1.2px), calc(var(--py) * 0.8px), 0) rotate(-1.4deg) translateY(0px); }
          }

          .hero-branch-topLayer {
            top: -6%;
            height: 56%;
            background-image: url("/mikan/hero_branch_top_only.png?v=20260225a");
            background-position: center top;

            animation: heroSwayTop 6s ease-in-out infinite;

            -webkit-mask-image: linear-gradient(
              to bottom,
              rgba(0, 0, 0, 1) 0%,
              rgba(0, 0, 0, 1) 72%,
              rgba(0, 0, 0, 0) 100%
            );
            mask-image: linear-gradient(
              to bottom,
              rgba(0, 0, 0, 1) 0%,
              rgba(0, 0, 0, 1) 72%,
              rgba(0, 0, 0, 0) 100%
            );
          }

          .hero-branch-bottomLayer {
            bottom: -6%;
            height: 56%;
            background-image: url("/mikan/hero_branch_bottom_only.png?v=20260225a");
            background-position: center bottom;

            animation: heroSwayBottom 6s ease-in-out infinite;

            -webkit-mask-image: linear-gradient(
              to top,
              rgba(0, 0, 0, 1) 0%,
              rgba(0, 0, 0, 1) 72%,
              rgba(0, 0, 0, 0) 100%
            );
            mask-image: linear-gradient(
              to top,
              rgba(0, 0, 0, 1) 0%,
              rgba(0, 0, 0, 1) 72%,
              rgba(0,  0,  0,  0) 100%
            );
          }

          @media (max-width: 430px) {
            .hero-atmosphere,
            .hero-particles {
              display: none;
            }

            @keyframes heroSwayTopSP {
              0%   { transform: translate3d(calc(var(--px) * 1.2px), calc(var(--py) * 0.8px), 0) rotate(-0.8deg) translateY(2px); }
              50%  { transform: translate3d(calc(var(--px) * 1.2px), calc(var(--py) * 0.8px), 0) rotate(0.8deg) translateY(-1px); }
              100% { transform: translate3d(calc(var(--px) * 1.2px), calc(var(--py) * 0.8px), 0) rotate(-0.8deg) translateY(2px); }
            }
            @keyframes heroSwayBottomSP {
              0%   { transform: translate3d(calc(var(--px) * 1.0px), calc(var(--py) * 0.7px), 0) rotate(-0.8deg) translateY(2px); }
              50%  { transform: translate3d(calc(var(--px) * 1.0px), calc(var(--py) * 0.7px), 0) rotate(0.8deg) translateY(-1px); }
              100% { transform: translate3d(calc(var(--px) * 1.0px), calc(var(--py) * 0.7px), 0) rotate(-0.8deg) translateY(2px); }
            }

            .hero-branch-topLayer,
            .hero-branch-bottomLayer {
              left: -22%;
              right: -22%;
              background-size: 155% auto;
              -webkit-mask-image: none;
              mask-image: none;
            }

            .hero-branch-topLayer {
              top: 6%;
              height: 68%;
              background-position: center 30%;
              animation: heroSwayTopSP 6s ease-in-out infinite;
            }

            .hero-branch-bottomLayer {
              bottom: 0%;
              height: 60%;
              background-position: center bottom;
              animation: heroSwayBottomSP 6s ease-in-out infinite;
            }
          }

          @keyframes kidsFloat {
            0%   { transform: translate3d(calc(var(--px) * 2px), calc(var(--py) * 1.4px + 0px), 0); }
            50%  { transform: translate3d(calc(var(--px) * 2px), calc(var(--py) * 1.4px + -10px), 0); }
            100% { transform: translate3d(calc(var(--px) * 2px), calc(var(--py) * 1.4px + 0px), 0); }
          }
          .hero-kids-float {
            animation: kidsFloat 4.2s ease-in-out infinite;
            will-change: transform;
          }

          @keyframes medalFloat {
            0%   { transform: translate3d(calc(var(--px) * 1.6px), calc(var(--py) * 1.2px + 0px), 0); }
            50%  { transform: translate3d(calc(var(--px) * 1.6px), calc(var(--py) * 1.2px + -8px), 0); }
            100% { transform: translate3d(calc(var(--px) * 1.6px), calc(var(--py) * 1.2px + 0px), 0); }
          }
          .hero-medal-float {
            animation: medalFloat 3.6s ease-in-out infinite;
            will-change: transform;
          }

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

          @keyframes brandFloat {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
            100% { transform: translateY(0px); }
          }
          .hero-brand-text {
            font-weight: 900;
            letter-spacing: 0.14em;
            font-size: clamp(34px, 6vw, 68px);
            color: #ffffff;
            text-shadow: 0 3px 10px rgba(0, 0, 0, 0.22),
              0 0 6px rgba(255, 255, 255, 0.65);
            -webkit-text-stroke: 2px rgba(212, 175, 55, 0.55);
            font-family: ui-rounded, "Hiragino Maru Gothic ProN",
              "Hiragino Maru Gothic Pro", "Yu Gothic", system-ui, sans-serif;
            border-radius: 9999px;
            animation: brandFloat 4s ease-in-out infinite;
            will-change: transform;
          }
        `}</style>
      </section>

      <AboutTeaser />
      <SubFlash />

      <section className="max-w-6xl mx-auto px-6 py-8 md:py-16 relative z-10">
        <div className="relative w-full overflow-hidden rounded-xl shadow-xl slider-container">
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

      <section className="max-w-6xl mx-auto px-6 py-12 md:py-24">
        <h2 className="text-3xl font-bold text-center">100円みかんの理由</h2>
        <div className="max-w-3xl mx-auto mt-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 text-center text-gray-700">
          傷があっても味は抜群。安くて気軽に楽しんでほしい想いをそのまま箱に詰めました。
        </div>

        <div className="max-w-5xl mx-auto mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="relative w-full h-60 sm:h-72 md:h-80 rounded-xl overflow-hidden shadow-md">
              <Image
                src="/mikan/reason_shop_1.jpg?v=20260226a"
                alt="山川みかん 無人販売所の様子（全景）"
                fill
                className="object-contain"
                sizes="(min-width: 640px) 50vw, 100vw"
                priority
              />
            </div>
            <div className="relative w-full h-60 sm:h-72 md:h-80 rounded-xl overflow-hidden shadow-md">
              <Image
                src="/mikan/reason_shop_2.jpg?v=20260226a"
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
      </section>

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
            src="/mikan/hand.png?v=20260226a"
            title="手作業収穫"
            text="一つずつ丁寧に。"
          />
        </div>
      </section>

      <style suppressHydrationWarning>{`
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
          display: block;
          pointer-events: none;
          user-select: none;
          -webkit-user-drag: none;
          backface-visibility: hidden;
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
          sizes="(min-width: 768px) 33vw, 100vw"
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