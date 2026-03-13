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

  const INSTAGRAM_URL = "https://www.instagram.com/y_m.farm";

  /* ===========================
     ★追加：ロゴ/ボタン位置とサイズ
     ここだけ数字を変えれば高さ調整できる
  ============================ */
   const HERO_POS = {
    LOGO_TOP_SP: "30%",
    LOGO_TOP_SM: "31%",
    LOGO_TOP_MD: "29.5%",

    BUTTON_TOP_SP: "50%",
    BUTTON_TOP_SM: "71.5%",
    BUTTON_TOP_MD: "45.5%",
  } as const;

  const HERO_SIZE = {
    LOGO_SP: "w-[320px]",
    LOGO_SM: "sm:w-[430px]",
    LOGO_MD: "md:w-[590px]",

    BUTTON_SP: "w-[260px]",
    BUTTON_SM: "sm:w-[360px]",
    BUTTON_MD: "md:w-[470px]",
  } as const;

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
  const POP_DURATION = 520;
  const [leaving, setLeaving] = useState(false);
  const [popping, setPopping] = useState(false);

  const goProducts = () => {
    if (popping) return;
    setPopping(true);

    window.setTimeout(() => {
      setLeaving(true);
      window.setTimeout(() => {
        router.push("/products");
      }, FADE_DURATION);
    }, POP_DURATION);
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
        className="hero-root relative h-[100svh] sm:h-[85svh] overflow-hidden z-20"
      >
        {/* ★追加：② 光粒子（超控えめ） */}
        <div className="absolute inset-0 hero-particles pointer-events-none" />

        {/* ★追加：③ 朝もや・空気感（薄いハイライト） */}
        <div className="absolute inset-0 hero-atmosphere pointer-events-none" />

        {/* 背景（固定） */}
        <div className="absolute inset-0 hero-fixed-bg">
          <Image
            src="/mikan/hero_bg_base_lightgreen.png?v=20260313d"
            alt="背景"
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* 枝＋花（同じ強さで揺らす）
            ★修正：CSS背景ではなくImageで強制表示 */}
        <div className="absolute inset-0 hero-sway pointer-events-none">
          <div className="hero-branch-topLayer">
            <Image
              src="/mikan/hero_branch_top_only.png?v=20260313f"
              alt=""
              fill
              priority
              className="hero-branch-img-top"
            />
          </div>

          <div className="hero-branch-bottomLayer">
            <Image
              src="/mikan/hero_branch_bottom_only.png?v=20260313f"
              alt=""
              fill
              priority
              className="hero-branch-img-bottom"
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
          <div className="absolute left-1/2 -translate-x-1/2 top-[7%] sm:top-[6.5%] md:top-[6%] hero-medal-float">
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

        {/* ★変更：山口農園ロゴ素材を少し揺らす */}
        <div className="absolute inset-0 z-[120] pointer-events-none">
          <div
            className="absolute left-1/2 -translate-x-1/2 text-center"
            style={{
              top: HERO_POS.LOGO_TOP_SP,
            }}
          >
            <div
              className="hero-brand-logo sm:hidden"
              style={{ top: HERO_POS.LOGO_TOP_SP }}
            >
              <Image
                src="/mikan/logo_yamaguchi_farm.png"
                alt="山口農園"
                width={1200}
                height={420}
                priority
                className={`hero-brand-image ${HERO_SIZE.LOGO_SP} h-auto`}
              />
            </div>

            <div
              className="hero-brand-logo hidden sm:block md:hidden"
              style={{ top: HERO_POS.LOGO_TOP_SM }}
            >
              <Image
                src="/mikan/logo_yamaguchi_farm.png"
                alt="山口農園"
                width={1200}
                height={420}
                priority
                className={`hero-brand-image ${HERO_SIZE.LOGO_SM} h-auto`}
              />
            </div>

            <div
              className="hero-brand-logo hidden md:block"
              style={{ top: HERO_POS.LOGO_TOP_MD }}
            >
              <Image
                src="/mikan/logo_yamaguchi_farm.png"
                alt="山口農園"
                width={1200}
                height={420}
                priority
                className={`hero-brand-image ${HERO_SIZE.LOGO_MD} h-auto`}
              />
            </div>
          </div>
        </div>

        {/* ★変更：購入ボタン画像を子供たちが持っているように配置 + パン！演出 */}
        <div className="absolute inset-0 z-[999] flex items-end justify-center text-center px-6 pointer-events-none">
          <div className="relative w-full h-full">
            <div
              className="absolute left-1/2 -translate-x-1/2 z-[999] pointer-events-auto sm:hidden"
              style={{ top: HERO_POS.BUTTON_TOP_SP }}
            >
              <button
                onClick={goProducts}
                aria-label="みかんを買う"
                className={`hero-buy-button relative block active:scale-[0.98] transition-transform duration-150 ${
                  popping ? "is-popping" : ""
                }`}
              >
                <span className="hero-buy-shadow" />
                <span className="hero-buy-burst hero-buy-burst-1" />
                <span className="hero-buy-burst hero-buy-burst-2" />
                <span className="hero-buy-burst hero-buy-burst-3" />
                <span className="hero-buy-burst hero-buy-burst-4" />
                <span className="hero-buy-burst hero-buy-burst-5" />
                <span className="hero-buy-burst hero-buy-burst-6" />
                <span className="hero-buy-burst hero-buy-burst-7" />
                <span className="hero-buy-burst hero-buy-burst-8" />

                <Image
                  src="/mikan/btn_buy_mikan.png"
                  alt="みかんを買うボタン"
                  width={1280}
                  height={520}
                  priority
                  className={`hero-buy-image ${HERO_SIZE.BUTTON_SP} h-auto`}
                />
              </button>
            </div>

            <div
              className="absolute left-1/2 -translate-x-1/2 z-[999] pointer-events-auto hidden sm:block md:hidden"
              style={{ top: HERO_POS.BUTTON_TOP_SM }}
            >
              <button
                onClick={goProducts}
                aria-label="みかんを買う"
                className={`hero-buy-button relative block active:scale-[0.98] transition-transform duration-150 ${
                  popping ? "is-popping" : ""
                }`}
              >
                <span className="hero-buy-shadow" />
                <span className="hero-buy-burst hero-buy-burst-1" />
                <span className="hero-buy-burst hero-buy-burst-2" />
                <span className="hero-buy-burst hero-buy-burst-3" />
                <span className="hero-buy-burst hero-buy-burst-4" />
                <span className="hero-buy-burst hero-buy-burst-5" />
                <span className="hero-buy-burst hero-buy-burst-6" />
                <span className="hero-buy-burst hero-buy-burst-7" />
                <span className="hero-buy-burst hero-buy-burst-8" />

                <Image
                  src="/mikan/btn_buy_mikan.png"
                  alt="みかんを買うボタン"
                  width={1280}
                  height={520}
                  priority
                  className={`hero-buy-image ${HERO_SIZE.BUTTON_SM} h-auto`}
                />
              </button>
            </div>

            <div
              className="absolute left-1/2 -translate-x-1/2 z-[999] pointer-events-auto hidden md:block"
              style={{ top: HERO_POS.BUTTON_TOP_MD }}
            >
              <button
                onClick={goProducts}
                aria-label="みかんを買う"
                className={`hero-buy-button relative block active:scale-[0.98] transition-transform duration-150 ${
                  popping ? "is-popping" : ""
                }`}
              >
                <span className="hero-buy-shadow" />
                <span className="hero-buy-burst hero-buy-burst-1" />
                <span className="hero-buy-burst hero-buy-burst-2" />
                <span className="hero-buy-burst hero-buy-burst-3" />
                <span className="hero-buy-burst hero-buy-burst-4" />
                <span className="hero-buy-burst hero-buy-burst-5" />
                <span className="hero-buy-burst hero-buy-burst-6" />
                <span className="hero-buy-burst hero-buy-burst-7" />
                <span className="hero-buy-burst hero-buy-burst-8" />

                <Image
                  src="/mikan/btn_buy_mikan.png"
                  alt="みかんを買うボタン"
                  width={1280}
                  height={520}
                  priority
                  className={`hero-buy-image ${HERO_SIZE.BUTTON_MD} h-auto`}
                />
              </button>
            </div>
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
            min-height: 100svh;
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
          .hero-brand-logo { z-index: 13; }

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
            left: -2%;
            right: -2%;
            pointer-events: none;
            will-change: transform;
            transform: translateZ(0);
            backface-visibility: hidden;
            overflow: hidden;
          }

          .hero-branch-topLayer {
            transform-origin: center top;
          }

          .hero-branch-bottomLayer {
            transform-origin: center bottom;
          }

          .hero-branch-img-top,
          .hero-branch-img-bottom {
            pointer-events: none;
            user-select: none;
            -webkit-user-drag: none;
          }

          .hero-branch-img-top {
            object-fit: cover;
            object-position: center top;
          }

          .hero-branch-img-bottom {
            object-fit: cover;
            object-position: center bottom;
          }

          @keyframes heroSwayTop {
            0%   { transform: translate3d(calc(var(--px) * 1px), calc(var(--py) * 0.7px), 0) rotate(-1.6deg) translateY(0px); }
            50%  { transform: translate3d(calc(var(--px) * 1px), calc(var(--py) * 0.7px), 0) rotate(1.6deg) translateY(-1px); }
            100% { transform: translate3d(calc(var(--px) * 1px), calc(var(--py) * 0.7px), 0) rotate(-1.6deg) translateY(0px); }
          }
          @keyframes heroSwayBottom {
            0%   { transform: translate3d(calc(var(--px) * 0.8px), calc(var(--py) * 0.55px), 0) rotate(-1.6deg) translateY(0px); }
            50%  { transform: translate3d(calc(var(--px) * 0.8px), calc(var(--py) * 0.55px), 0) rotate(-1.6deg) translateY(-1px); }
            100% { transform: translate3d(calc(var(--px) * 0.8px), calc(var(--py) * 0.55px), 0) rotate(-1.6deg) translateY(0px); }
          }

          .hero-branch-topLayer {
            top: -1%;
            height: 38%;
            animation: heroSwayTop 5.6s ease-in-out infinite;
            -webkit-mask-image: linear-gradient(
              to bottom,
              rgba(0,0,0,1) 0%,
              rgba(0,0,0,1) 62%,
              rgba(0,0,0,0.72) 78%,
              rgba(0,0,0,0) 100%
            );
            mask-image: linear-gradient(
              to bottom,
              rgba(0,0,0,1) 0%,
              rgba(0,0,0,1) 62%,
              rgba(0,0,0,0.72) 78%,
              rgba(0,0,0,0) 100%
            );
          }

          .hero-branch-bottomLayer {
            bottom: -1%;
            height: 24%;
            animation: heroSwayBottom 6.4s ease-in-out infinite;
            -webkit-mask-image: linear-gradient(
              to top,
              rgba(0,0,0,1) 0%,
              rgba(0,0,0,1) 58%,
              rgba(0,0,0,0.72) 76%,
              rgba(0,0,0,0) 100%
            );
            mask-image: linear-gradient(
              to top,
              rgba(0,0,0,1) 0%,
              rgba(0,0,0,1) 58%,
              rgba(0,0,0,0.72) 76%,
              rgba(0,0,0,0) 100%
            );
          }

          @media (max-width: 430px) {
            .hero-root {
              height: 100svh;
              min-height: 100svh;
            }

            .hero-atmosphere,
            .hero-particles {
              display: none;
            }

            .hero-fixed-bg :global(img) {
              object-fit: cover !important;
              object-position: center center !important;
              transform: translate3d(0, 0, 0) !important;
            }

           @keyframes heroSwayTopSP {
  0%   { transform: translate3d(calc(var(--px) * 1.2px - 2px), calc(var(--py) * 0.8px), 0) rotate(-1.6deg) translateY(0px); }
  50%  { transform: translate3d(calc(var(--px) * 1.2px + 2px), calc(var(--py) * 0.8px), 0) rotate(1.6deg) translateY(-2px); }
  100% { transform: translate3d(calc(var(--px) * 1.2px - 2px), calc(var(--py) * 0.8px), 0) rotate(-1.6deg) translateY(0px); }
}

@keyframes heroSwayBottomSP {
  0%   { transform: translate3d(calc(var(--px) * 1px - 2px), calc(var(--py) * 0.7px), 0) rotate(-1.35deg) translateY(0px); }
  50%  { transform: translate3d(calc(var(--px) * 1px + 2px), calc(var(--py) * 0.7px), 0) rotate(1.35deg) translateY(-2px); }
  100% { transform: translate3d(calc(var(--px) * 1px - 2px), calc(var(--py) * 0.7px), 0) rotate(-1.35deg) translateY(0px); }
}

.hero-branch-topLayer {
  top: -1%;
  height: 34%;
  animation: heroSwayTopSP 5.0s ease-in-out infinite;
  -webkit-mask-image: linear-gradient(
    to bottom,
    rgba(0,0,0,1) 0%,
    rgba(0,0,0,1) 64%,
    rgba(0,0,0,0.72) 82%,
    rgba(0,0,0,0) 100%
  );
  mask-image: linear-gradient(
    to bottom,
    rgba(0,0,0,1) 0%,
    rgba(0,0,0,1) 64%,
    rgba(0,0,0,0.72) 82%,
    rgba(0,0,0,0) 100%
  );
}

.hero-branch-bottomLayer {
  bottom: -1%;
  height: 21%;
  animation: heroSwayBottomSP 4.8s ease-in-out infinite;
  -webkit-mask-image: linear-gradient(
    to top,
    rgba(0,0,0,1) 0%,
    rgba(0,0,0,1) 60%,
    rgba(0,0,0,0.72) 80%,
    rgba(0,0,0,0) 100%
  );
  mask-image: linear-gradient(
    to top,
    rgba(0,0,0,1) 0%,
    rgba(0,0,0,1) 60%,
    rgba(0,0,0,0.72) 80%,
    rgba(0,0,0,0) 100%
  );
}

            .hero-branch-bottomLayer {
              bottom: -1%;
              height: 21%;
              animation: heroSwayBottomSP 6.1s ease-in-out infinite;
              -webkit-mask-image: linear-gradient(
                to top,
                rgba(0,0,0,1) 0%,
                rgba(0,0,0,1) 60%,
                rgba(0,0,0,0.72) 80%,
                rgba(0,0,0,0) 100%
              );
              mask-image: linear-gradient(
                to top,
                rgba(0,0,0,1) 0%,
                rgba(0,0,0,1) 60%,
                rgba(0,0,0,0.72) 80%,
                rgba(0,0,0,0) 100%
              );
            }

            .hero-kids-float {
              width: 94%;
              max-width: none;
              margin-bottom: 7.2vh;
            }

            .hero-brand-image {
              width: 320px !important;
            }

            .hero-buy-image {
              width: 260px !important;
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

          /* ★追加：ロゴは全体の揺れに合わせて少しだけ揺らす */
          @keyframes brandLogoFloat {
            0% {
              transform: translate3d(calc(var(--px) * 1px), calc(var(--py) * 0.7px + 0px), 0) rotate(-0.28deg);
            }
            50% {
              transform: translate3d(calc(var(--px) * 1px), calc(var(--py) * 0.7px + -4px), 0) rotate(0.28deg);
            }
            100% {
              transform: translate3d(calc(var(--px) * 1px), calc(var(--py) * 0.7px + 0px), 0) rotate(-0.28deg);
            }
          }
          .hero-brand-logo {
            animation: brandLogoFloat 4.8s ease-in-out infinite;
            will-change: transform;
          }
          .hero-brand-image {
            display: block;
            filter:
              drop-shadow(0 8px 20px rgba(0, 0, 0, 0.18))
              drop-shadow(0 0 10px rgba(255, 230, 140, 0.22));
          }

          /* ★追加：シャボン玉ボタン */
          .hero-buy-button {
            appearance: none;
            border: 0;
            background: transparent;
            padding: 0;
            margin: 0;
            cursor: pointer;
            position: relative;
            transform-origin: center center;
            animation: buyButtonFloat 4.2s ease-in-out infinite;
            will-change: transform, opacity, filter;
            isolation: isolate;
          }

          .hero-buy-shadow {
            position: absolute;
            left: 50%;
            bottom: 5%;
            width: 76%;
            height: 18%;
            transform: translateX(-50%);
            border-radius: 9999px;
            background: radial-gradient(circle, rgba(239, 157, 20, 0.30) 0%, rgba(239, 157, 20, 0.12) 48%, rgba(239, 157, 20, 0) 78%);
            filter: blur(10px);
            z-index: 0;
            pointer-events: none;
            transition: opacity 200ms ease;
          }

          .hero-buy-image {
            position: relative;
            z-index: 2;
            display: block;
            filter: drop-shadow(0 16px 28px rgba(255, 170, 30, 0.18));
            transition: transform 220ms ease, filter 220ms ease;
            user-select: none;
            -webkit-user-drag: none;
          }

          .hero-buy-button:hover .hero-buy-image {
            transform: scale(1.035);
            filter: drop-shadow(0 18px 30px rgba(255, 170, 30, 0.26));
          }

          @keyframes buyButtonFloat {
            0% {
              transform: translate3d(calc(var(--px) * 1.8px), calc(var(--py) * 1.2px + 0px), 0) rotate(-0.3deg);
            }
            50% {
              transform: translate3d(calc(var(--px) * 1.8px), calc(var(--py) * 1.2px + -7px), 0) rotate(0.3deg);
            }
            100% {
              transform: translate3d(calc(var(--px) * 1.8px), calc(var(--py) * 1.2px + 0px), 0) rotate(-0.3deg);
            }
          }

          .hero-buy-burst {
            position: absolute;
            left: 50%;
            top: 50%;
            width: 14px;
            height: 14px;
            margin-left: -7px;
            margin-top: -7px;
            border-radius: 9999px;
            opacity: 0;
            pointer-events: none;
            z-index: 3;
            background:
              radial-gradient(circle at 35% 35%, rgba(255,255,255,0.95) 0 28%, rgba(255,230,170,0.9) 29% 55%, rgba(255,194,68,0.55) 56% 72%, rgba(255,194,68,0) 73% 100%);
            box-shadow:
              0 0 0 1px rgba(255,255,255,0.4) inset,
              0 0 18px rgba(255,196,76,0.28);
          }

          .hero-buy-button.is-popping {
            animation: none;
          }

          .hero-buy-button.is-popping .hero-buy-shadow {
            opacity: 0;
          }

          .hero-buy-button.is-popping .hero-buy-image {
            animation: bubblePopMain 520ms cubic-bezier(0.2, 0.9, 0.2, 1) forwards;
          }

          .hero-buy-button.is-popping .hero-buy-burst-1 { animation: burst1 520ms ease-out forwards; }
          .hero-buy-button.is-popping .hero-buy-burst-2 { animation: burst2 520ms ease-out forwards; }
          .hero-buy-button.is-popping .hero-buy-burst-3 { animation: burst3 520ms ease-out forwards; }
          .hero-buy-button.is-popping .hero-buy-burst-4 { animation: burst4 520ms ease-out forwards; }
          .hero-buy-button.is-popping .hero-buy-burst-5 { animation: burst5 520ms ease-out forwards; }
          .hero-buy-button.is-popping .hero-buy-burst-6 { animation: burst6 520ms ease-out forwards; }
          .hero-buy-button.is-popping .hero-buy-burst-7 { animation: burst7 520ms ease-out forwards; }
          .hero-buy-button.is-popping .hero-buy-burst-8 { animation: burst8 520ms ease-out forwards; }

          @keyframes bubblePopMain {
            0% {
              opacity: 1;
              transform: scale(1);
              filter: drop-shadow(0 18px 30px rgba(255, 170, 30, 0.26));
            }
            22% {
              opacity: 1;
              transform: scale(1.08);
              filter: drop-shadow(0 24px 36px rgba(255, 185, 60, 0.30));
            }
            58% {
              opacity: 0.92;
              transform: scale(0.78);
              filter: brightness(1.08) saturate(1.08) blur(0.6px);
            }
            100% {
              opacity: 0;
              transform: scale(0.22);
              filter: brightness(1.12) saturate(1.12) blur(2.2px);
            }
          }

          @keyframes burst1 {
            0%   { opacity: 0; transform: translate3d(0,0,0) scale(0.3); }
            18%  { opacity: 1; }
            100% { opacity: 0; transform: translate3d(-120px,-62px,0) scale(1.2); }
          }
          @keyframes burst2 {
            0%   { opacity: 0; transform: translate3d(0,0,0) scale(0.3); }
            18%  { opacity: 1; }
            100% { opacity: 0; transform: translate3d(126px,-54px,0) scale(1.35); }
          }
          @keyframes burst3 {
            0%   { opacity: 0; transform: translate3d(0,0,0) scale(0.3); }
            18%  { opacity: 1; }
            100% { opacity: 0; transform: translate3d(-148px,8px,0) scale(1.05); }
          }
          @keyframes burst4 {
            0%   { opacity: 0; transform: translate3d(0,0,0) scale(0.3); }
            18%  { opacity: 1; }
            100% { opacity: 0; transform: translate3d(156px,18px,0) scale(1.1); }
          }
          @keyframes burst5 {
            0%   { opacity: 0; transform: translate3d(0,0,0) scale(0.3); }
            18%  { opacity: 1; }
            100% { opacity: 0; transform: translate3d(-86px,82px,0) scale(1.15); }
          }
          @keyframes burst6 {
            0%   { opacity: 0; transform: translate3d(0,0,0) scale(0.3); }
            18%  { opacity: 1; }
            100% { opacity: 0; transform: translate3d(92px,78px,0) scale(1.22); }
          }
          @keyframes burst7 {
            0%   { opacity: 0; transform: translate3d(0,0,0) scale(0.3); }
            18%  { opacity: 1; }
            100% { opacity: 0; transform: translate3d(0px,-110px,0) scale(1.3); }
          }
          @keyframes burst8 {
            0%   { opacity: 0; transform: translate3d(0,0,0) scale(0.3); }
            18%  { opacity: 1; }
            100% { opacity: 0; transform: translate3d(0px,102px,0) scale(1.05); }
          }

          @media (max-width: 640px) {
            @keyframes burst1 {
              0%   { opacity: 0; transform: translate3d(0,0,0) scale(0.3); }
              18%  { opacity: 1; }
              100% { opacity: 0; transform: translate3d(-82px,-44px,0) scale(1.05); }
            }
            @keyframes burst2 {
              0%   { opacity: 0; transform: translate3d(0,0,0) scale(0.3); }
              18%  { opacity: 1; }
              100% { opacity: 0; transform: translate3d(86px,-38px,0) scale(1.12); }
            }
            @keyframes burst3 {
              0%   { opacity: 0; transform: translate3d(0,0,0) scale(0.3); }
              18%  { opacity: 1; }
              100% { opacity: 0; transform: translate3d(-98px,4px,0) scale(0.96); }
            }
            @keyframes burst4 {
              0%   { opacity: 0; transform: translate3d(0,0,0) scale(0.3); }
              18%  { opacity: 1; }
              100% { opacity: 0; transform: translate3d(104px,12px,0) scale(1.0); }
            }
            @keyframes burst5 {
              0%   { opacity: 0; transform: translate3d(0,0,0) scale(0.3); }
              18%  { opacity: 1; }
              100% { opacity: 0; transform: translate3d(-60px,58px,0) scale(1.0); }
            }
            @keyframes burst6 {
              0%   { opacity: 0; transform: translate3d(0,0,0) scale(0.3); }
              18%  { opacity: 1; }
              100% { opacity: 0; transform: translate3d(66px,54px,0) scale(1.06); }
            }
            @keyframes burst7 {
              0%   { opacity: 0; transform: translate3d(0,0,0) scale(0.3); }
              18%  { opacity: 1; }
              100% { opacity: 0; transform: translate3d(0px,-74px,0) scale(1.14); }
            }
            @keyframes burst8 {
              0%   { opacity: 0; transform: translate3d(0,0,0) scale(0.3); }
              18%  { opacity: 1; }
              100% { opacity: 0; transform: translate3d(0px,68px,0) scale(0.96); }
            }
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

          <details className="group rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-black/5">
            <summary className="cursor-pointer list-none text-center">
              <span className="inline-flex items-center justify-center gap-2 text-[15px] font-semibold sm:text-base">
                🍊 直売所の商品案内を見る
              </span>
              <span className="block text-xs text-gray-500 mt-1 group-open:hidden">
                タップして開く
              </span>
              <span className="hidden group-open:block text-xs text-gray-500 mt-1">
                もう一度タップで閉じる
              </span>
            </summary>

            <div className="mt-4 rounded-xl bg-white/80 p-4 sm:p-5 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {`現在直売所にて
ご用意している商品はこちらです。

━━━━━━━━━━━━━━━
🍊 みかん　南津海　100円
🍊 みかん　南津海大容量　300円
🍊 文旦（ぶんたん）　100円

━━━━━━━━━━━━━━━

南津海について
寒波から果実を守るため、11月頃に一つ一つ“サンテ（布）”を掛けて育てた手間ひま品。酸味×糖度のバランスが良い品種で、この時期にみかんを食べられるのも希少です。
※種がある場合があります。


よろしくお願いします🍊

🍊山口みかん農園🍊`}
            </div>

            <div className="mt-4 text-center">
              <a
                href="mailto:yamaguchinouen0915@gmail.com?subject=%E7%9B%B4%E5%A3%B2%E6%89%80%E3%81%AE%E4%BD%8F%E6%89%80%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6%E5%95%8F%E3%81%84%E5%90%88%E3%82%8F%E3%81%9B&body=%E3%81%8A%E5%90%8D%E5%89%8D%EF%BC%9A%0A%E3%81%94%E7%94%A8%E4%BB%B6%EF%BC%9A%0A"
                className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-white shadow-sm transition hover:opacity-90 bg-orange-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
              >
                お問い合わせ（メールを開く）
              </a>
            </div>
          </details>

          <div className="rounded-2xl bg-white/70 p-5 shadow-sm ring-1 ring-black/5 text-center">
            <p className="text-lg font-semibold text-[#333]">📸 農園の日常をInstagramで発信中</p>
            <p className="mt-2 text-sm text-gray-600">
              収穫の様子や畑の風景など、山口みかん農園のリアルな日常を公開しています。
            </p>
            <p className="mt-1 text-sm font-medium text-orange-600">@y_m.farm</p>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-white shadow-sm transition hover:opacity-90 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
            >
              Instagramを見る
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