/* eslint-disable @next/next/no-img-element */
"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";

/** ===== 調整値 ===== */
const CFG = {
  stageHeightVH: 900,
  // パララックス（縦のみ・横ドリフト0）
  speedY: { sky: 0.06, rays: 0.12, far: 0.18, mid: 0.32, near: 0.70, flareWide: 0.50, flareCore: 0.62 },

  HERO_DESKTOP: 760,
  HERO_MOBILE: 560,

  // 文章の見た目
  COPY_FONT_SCALE: 1.20,
  COPY_GAP_VH: 120,
  COPY_TOP_VH: 22,

  // ロゴ（遠近と倍率）
  LOGO_BASE_Z_DESKTOP: 8.2,
  LOGO_BASE_Z_MOBILE: 10.0,
  LOGO_DEPTH_TUNE: 1.4,
  LOGO_DEPTH_TUNE_MOBILE: 1.1,
  LOGO_SCALE: 0.98,
  LOGO_SCALE_MOBILE: 0.88,
};

const SHA =
  (process.env.NEXT_PUBLIC_COMMIT_SHA ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_BUILD_TIME ||
    ""
  ).toString().slice(0, 8);
const Q = SHA ? `?v=${SHA}` : "";

/** assets */
const ASSETS = {
  sky: "/portal/background2.webp",
  rays: "/portal/rays.webp",
  flareWide: "/portal/flare_wide.webp",
  flareCore: "/portal/flare_core.webp",
  far: "/portal/cloud_far.webp",
  mid: "/portal/cloud_mid.webp",
  near: "/portal/cloud_near.webp",
  logo: "/portal/logo.webp",
} as const;

/** ===== 文面 ===== */
const COPY: { title?: string; body: string }[] = [
  { title: "Volceクラン公式ホームページへようこそ。", body: "私たちは、メンバー全員の個性を生かし、知名度拡大のため活動しています。" },
  { body: "得意分野に振り分け、ゲリラ・大会への参加、SNS活動、イベントの開催等、活動を行っています。" },
  { body: "人との輪を大切に、荒野行動を楽しみ、広めてユーザーを増やす。をモットーにしています。" },
  { body: "プレイの実力が無くても、他の強みを生かして活躍することも可能です。" },
  { body: "興味のある方は X(旧ツイッター) の ID @Char_god1 まで「入隊希望」とご連絡ください。" },
];

/* ===== small hooks ===== */
function useReducedMotion() {
  const [reduced, set] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => set(mq.matches);
    on(); mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return reduced;
}
function useIsMobile() {
  const [m, set] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(max-width: 640px)");
    const on = () => set(mq.matches);
    on(); mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return m;
}

/* ===== wrap utility（縦だけシームレスにループ） ===== */
type WrapRefs = { a: HTMLImageElement | null; b: HTMLImageElement | null; h: number };
function useWrap() {
  const refs = useRef<WrapRefs>({ a: null, b: null, h: 0 });
  const setH = (h: number) => (refs.current.h = h);
  const setY = (y: number) => {
    const { a, b, h } = refs.current;
    if (!a || !b || !h) return;
    const yk = ((y % h) + h) % h;
    // will-change は “常時” 付けない（Firefoxの予約メモリ警告回避）
    a.style.transform = `translate3d(0px, ${yk}px, 0)`;
    b.style.transform = `translate3d(0px, ${yk - h}px, 0)`;
  };
  return { refs, setH, setY };
}

/** 3D ロゴ（遅延マウントで初期描画を軽く） */
const ThreeHeroLazy = dynamic(() => import("./ThreeHero"), { ssr: false, loading: () => null });

export default function PortalClient() {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const [webglOk, setWebglOk] = useState(false);
  const [threeHardError, setThreeHardError] = useState(false);
  const [mountThree, setMountThree] = useState(false);

  const sky = useWrap();
  const rays = useWrap();
  const far = useWrap();
  const mid = useWrap();
  const near = useWrap();
  const flareWide = useWrap();
  const flareCore = useWrap();

  const [scrollY, setScrollY] = useState(0);
  const scrollYRef = useRef(0);

  // WebGL可否
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      // @ts-ignore
      setWebglOk(!!(c.getContext("webgl2") || c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch {
      setWebglOk(false);
    }
  }, []);

  // 高さ更新
  useEffect(() => {
    const setAllHeights = () => {
      const h = window.innerHeight || 800;
      [sky, rays, far, mid, near, flareWide, flareCore].forEach((w) => w.setH(h * 1.04));
    };
    setAllHeights();
    addEventListener("resize", setAllHeights);
    return () => removeEventListener("resize", setAllHeights);
  }, []);

  /** スクロール時だけDOM更新（rAFで集約） */
  useEffect(() => {
    const scale = reduced ? 0.2 : 1;
    const applyAll = (y: number) => {
      sky.setY(y * CFG.speedY.sky * scale);
      rays.setY(y * CFG.speedY.rays * scale);
      far.setY(y * CFG.speedY.far * scale);
      mid.setY(y * CFG.speedY.mid * scale);
      near.setY(y * CFG.speedY.near * scale);
      flareWide.setY(y * CFG.speedY.flareWide * scale);
      flareCore.setY(y * CFG.speedY.flareCore * scale);
    };

    const onScroll = () => {
      scrollYRef.current = window.scrollY || 0;
      requestAnimationFrame(() => applyAll(scrollYRef.current));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // 初期適用
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced]);

  // Three へは低頻度で反映（再レンダー負荷を下げる）
  useEffect(() => {
    let id = 0 as unknown as number;
    const tick = () => {
      setScrollY(scrollYRef.current);
      id = window.setTimeout(tick, 66); // 約15fps
    };
    tick();
    return () => clearTimeout(id);
  }, []);

  // 3Dは“画面内に入ったら＋アイドル時”にマウント
  useEffect(() => {
    const target = document.getElementById("three-mount-io");
    if (!target) {
      // fallback: idle only
      const w = window as any;
      const handle = w.requestIdleCallback
        ? w.requestIdleCallback(() => setMountThree(true), { timeout: 1200 })
        : window.setTimeout(() => setMountThree(true), 800);
      return () => { if (w.cancelIdleCallback) w.cancelIdleCallback(handle); else clearTimeout(handle); };
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const w = window as any;
        setTimeout(() => {
          w.requestIdleCallback
            ? w.requestIdleCallback(() => setMountThree(true), { timeout: 800 })
            : setMountThree(true);
        }, 0);
        io.disconnect();
      }
    }, { rootMargin: "200px" });
    io.observe(target);
    return () => io.disconnect();
  }, []);

  const use2D = reduced || !webglOk || threeHardError;

  const cameraZ =
    isMobile
      ? CFG.LOGO_BASE_Z_MOBILE + CFG.LOGO_DEPTH_TUNE_MOBILE
      : CFG.LOGO_BASE_Z_DESKTOP + CFG.LOGO_DEPTH_TUNE;

  const logoScale = isMobile ? CFG.LOGO_SCALE_MOBILE : CFG.LOGO_SCALE;

  return (
    <main className="portal" style={{ minHeight: `${CFG.stageHeightVH}vh` }}>
      {/* === sticky sky stage === */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          zIndex: 40,
          isolation: "isolate",
          pointerEvents: "none",
          background: "black",
          contain: "layout paint size", // ペイント範囲を閉じる
        }}
      >
        {/* 背景（縦ラップ、最初の1枚のみfetch優先） */}
        <img
          ref={(el) => (sky.refs.current.a = el)}
          src={ASSETS.sky + Q}
          alt=""
          style={wrapStyle(0, { opacity: 0.98 })}
          fetchPriority="high"
          decoding="async"
          loading="eager"
        />
        <img
          ref={(el) => (sky.refs.current.b = el)}
          src={ASSETS.sky + Q}
          alt=""
          style={wrapStyle(0, { opacity: 0.98 })}
          decoding="async"
          loading="lazy"
        />

        {/* 光 */}
        <img ref={(el) => (flareWide.refs.current.a = el)}  src={ASSETS.flareWide + Q} alt="" style={wrapStyle(3, { mixBlendMode: "screen", opacity: 0.5 })} decoding="async" loading="lazy" />
        <img ref={(el) => (flareWide.refs.current.b = el)}  src={ASSETS.flareWide + Q} alt="" style={wrapStyle(3, { mixBlendMode: "screen", opacity: 0.5 })} decoding="async" loading="lazy" />
        <img ref={(el) => (flareCore.refs.current.a = el)}  src={ASSETS.flareCore + Q} alt="" style={wrapStyle(4, { mixBlendMode: "screen", opacity: 0.65 })} decoding="async" loading="lazy" />
        <img ref={(el) => (flareCore.refs.current.b = el)}  src={ASSETS.flareCore + Q} alt="" style={wrapStyle(4, { mixBlendMode: "screen", opacity: 0.65 })} decoding="async" loading="lazy" />
        <img ref={(el) => (rays.refs.current.a = el)}       src={ASSETS.rays + Q}      alt="" style={wrapStyle(2, { opacity: 0.9 })} decoding="async" loading="lazy" />
        <img ref={(el) => (rays.refs.current.b = el)}       src={ASSETS.rays + Q}      alt="" style={wrapStyle(2, { opacity: 0.9 })} decoding="async" loading="lazy" />

        {/* 雲 */}
        <img ref={(el) => (far.refs.current.a  = el)} src={ASSETS.far + Q}  alt="" style={wrapStyle(5, { opacity: 0.92 })} decoding="async" loading="lazy" />
        <img ref={(el) => (far.refs.current.b  = el)} src={ASSETS.far + Q}  alt="" style={wrapStyle(5, { opacity: 0.92 })} decoding="async" loading="lazy" />
        <img ref={(el) => (mid.refs.current.a  = el)} src={ASSETS.mid + Q}  alt="" style={wrapStyle(6)} decoding="async" loading="lazy" />
        <img ref={(el) => (mid.refs.current.b  = el)} src={ASSETS.mid + Q}  alt="" style={wrapStyle(6)} decoding="async" loading="lazy" />
        <img ref={(el) => (near.refs.current.a = el)} src={ASSETS.near + Q} alt="" style={wrapStyle(8)} decoding="async" loading="lazy" />
        <img ref={(el) => (near.refs.current.b = el)} src={ASSETS.near + Q} alt="" style={wrapStyle(8)} decoding="async" loading="lazy" />

        {/* 中央ロゴ（マウントIOの目印） */}
        <div id="three-mount-io" style={{ position: "absolute", inset: 0, zIndex: 29 }} />

        {mountThree && !use2D ? (
          <React.Suspense fallback={null}>
            <div style={{ position: "absolute", inset: 0, zIndex: 30, pointerEvents: "none" }}>
              <ThreeHeroLazy
                deviceIsMobile={isMobile}
                scrollY={scrollY}
                onContextLost={() => setThreeHardError(true)}
                cameraZ={cameraZ}
                logoScale={logoScale}
              />
            </div>
          </React.Suspense>
        ) : (
          // 初期は軽い2Dロゴ（3Dは遅延マウント）
          <img
            src={ASSETS.logo + Q}
            alt="VOLCE Logo"
            style={{
              position: "absolute", left: "50%", top: "50%",
              transform: "translate(-50%, -50%)",
              width: (isMobile ? 220 : 320) * logoScale,
              height: "auto", zIndex: 30, pointerEvents: "none",
              filter: "drop-shadow(0 10px 24px rgba(0,0,0,.45))", opacity: 0.98,
            }}
            decoding="async"
            loading="eager"
          />
        )}
      </div>

      {/* ==== コピー（1段＝1スクロールセクション） ==== */}
      <section className="copyWrap">
        {COPY.map((c, i) => (
          <section className="copyBlock" key={i}>
            <div className="copyItem">
              {!!c.title && <h2>{c.title}</h2>}
              <p>{c.body}</p>
            </div>
          </section>
        ))}
      </section>

      <style jsx>{`
        /* 重要：全体will-changeの禁止（Firefoxの警告＆メモリ肥大を回避） */
        .portal :global(img){
          user-select:none;
          -webkit-user-drag:none;
          /* will-change は付けない。translate3dでGPU合成に乗る */
        }

        .copyWrap{
          margin-top: -100vh;
          padding-top: 100vh;
          position: relative;
          z-index: 60;
          background: transparent;
          --copyScale: ${CFG.COPY_FONT_SCALE};
        }

        .copyBlock{
          position: relative;
          height: ${CFG.COPY_GAP_VH}vh;
          content-visibility: auto; /* 画面外を描かない */
          contain: paint style layout;
        }

        .copyItem{
          position: sticky;
          top: ${CFG.COPY_TOP_VH}vh;
          display: grid;
          place-items: center;
          text-align: center;
          width: min(900px, 86vw);
          margin: 0 auto;
          pointer-events: auto;
          opacity: 0.98;
        }

        .copyItem h2{
          margin: 0 0 12px;
          color: #fff;
          font-size: calc(clamp(22px, 4.8vw, 42px) * var(--copyScale));
          font-weight: 900;
          letter-spacing: .04em;
          line-height: 1.25;
        }
        .copyItem p{
          margin: 0;
          color: #d9e1ee;
          font-size: calc(clamp(14px, 2.2vw, 18px) * var(--copyScale));
          line-height: 1.9;
          text-shadow: 0 1px 0 rgba(0,0,0,.35);
          word-break: break-word;
        }
      `}</style>
    </main>
  );
}

/** 縦ラップ用スタイル（translate3dでGPU合成） */
function wrapStyle(z: number, more?: React.CSSProperties): React.CSSProperties {
  return {
    position: "absolute",
    inset: "-6% -4% -2% -4%",
    width: "108%",
    height: "104%",
    objectFit: "cover",
    zIndex: z,
    pointerEvents: "none",
    transform: "translate3d(0,0,0)",
    ...more,
  };
}
