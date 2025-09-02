/* eslint-disable @next/next/no-img-element */
"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";

/** cache-busting */
const SHA = (process.env.NEXT_PUBLIC_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || "")
  .toString()
  .slice(0, 8);
const Q = SHA ? `?v=${SHA}` : "";

/** assets（拡張子は .webp のままでOK） */
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

/** パラメータ（横移動は全停止） */
const CFG = {
  stageHeightVH: 900, // 長い空のステージ
  speedY: {           // 縦だけ動く
    sky: 0.06, rays: 0.12, far: 0.18, mid: 0.32, near: 0.70, flareWide: 0.50, flareCore: 0.62,
  },
  heroH: { desktop: 760, mobile: 560 },
} as const;

/* ===== util hooks ===== */
function useReducedMotion() {
  const [reduced, set] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => set(mq.matches); on();
    mq.addEventListener?.("change", on); return () => mq.removeEventListener?.("change", on);
  }, []);
  return reduced;
}
function useIsMobile() {
  const [m, set] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(max-width: 640px)");
    const on = () => set(mq.matches); on();
    mq.addEventListener?.("change", on); return () => mq.removeEventListener?.("change", on);
  }, []);
  return m;
}

/* ===== 2枚ラップ（縦ループ専用） ===== */
type WrapRefs = { a: HTMLImageElement | null; b: HTMLImageElement | null; h: number };
function useWrap() {
  const refs = useRef<WrapRefs>({ a: null, b: null, h: 0 });
  const setH = (h: number) => (refs.current.h = h);
  const setPos = (y: number) => {
    const { a, b, h } = refs.current;
    if (!a || !b || !h) return;
    const yk = ((y % h) + h) % h; // 0..h
    a.style.transform = `translate3d(0px, ${yk}px, 0)`;
    b.style.transform = `translate3d(0px, ${yk - h}px, 0)`;
  };
  return { refs, setH, setPos };
}

/** 3Dロゴ（クライアント専用） */
const ThreeHeroLazy = dynamic(() => import("./ThreeHero"), { ssr: false, loading: () => null });

/* ===================== Main ===================== */
export default function PortalClient() {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const [webglOk, setWebglOk] = useState(false);
  const [threeHardError, setThreeHardError] = useState(false);

  // sticky ステージ
  const stageRef = useRef<HTMLDivElement | null>(null);

  // 縦ラップ用レイヤ
  const sky = useWrap();  const rays = useWrap();
  const far = useWrap();  const mid  = useWrap();  const near = useWrap();
  const flareWide = useWrap(); const flareCore = useWrap();

  // 3Dロゴ用のスクロール量
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      // @ts-ignore
      setWebglOk(!!(c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch { setWebglOk(false); }
  }, []);

  // 初期高さ
  useEffect(() => {
    const setAllHeights = () => {
      const h = window.innerHeight || 800;
      [sky, rays, far, mid, near, flareWide, flareCore].forEach((w) => w.setH(h * 1.04));
    };
    setAllHeights();
    window.addEventListener("resize", setAllHeights);
    return () => window.removeEventListener("resize", setAllHeights);
  }, []);

  // 縦パララックスのみ（横ドリフト完全停止）
  useEffect(() => {
    const tick = () => {
      const y = window.scrollY || 0; setScrollY(y);
      const scale = reduced ? 0.2 : 1;
      const apply = (hook: ReturnType<typeof useWrap>, ky: number) => hook.setPos(y * ky * scale);
      apply(sky, CFG.speedY.sky);
      apply(rays, CFG.speedY.rays);
      apply(far,  CFG.speedY.far);
      apply(mid,  CFG.speedY.mid);
      apply(near, CFG.speedY.near);
      apply(flareWide, CFG.speedY.flareWide);
      apply(flareCore, CFG.speedY.flareCore);
      requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [reduced]);

  const use2D = reduced || !webglOk || threeHardError;
  const heroHeight = (isMobile ? CFG.heroH.mobile : CFG.heroH.desktop);

  return (
    <main className="relative" style={{ minHeight: `${CFG.stageHeightVH}vh`, color: "#e5e7eb" }}>
      {/* ===== sticky sky stage ===== */}
      <div
        ref={stageRef}
        style={{
          position: "sticky", top: 0, height: "100vh", overflow: "hidden",
          zIndex: 40, isolation: "isolate", pointerEvents: "none", background: "black",
        }}
      >
        {/* 背景（空） */}
        <img ref={(el) => (sky.refs.current.a = el)}  src={ASSETS.sky + Q}  alt="" style={wrapStyle(0, { opacity: 0.98 })} />
        <img ref={(el) => (sky.refs.current.b = el)}  src={ASSETS.sky + Q}  alt="" style={wrapStyle(0, { opacity: 0.98 })} />

        {/* 光／フレア（縦のみ） */}
        <img ref={(el) => (flareWide.refs.current.a = el)}  src={ASSETS.flareWide + Q} alt="" style={wrapStyle(3, { mixBlendMode: "screen", opacity: 0.5 })}/>
        <img ref={(el) => (flareWide.refs.current.b = el)}  src={ASSETS.flareWide + Q} alt="" style={wrapStyle(3, { mixBlendMode: "screen", opacity: 0.5 })}/>
        <img ref={(el) => (flareCore.refs.current.a = el)}  src={ASSETS.flareCore + Q} alt="" style={wrapStyle(4, { mixBlendMode: "screen", opacity: 0.65 })}/>
        <img ref={(el) => (flareCore.refs.current.b = el)}  src={ASSETS.flareCore + Q} alt="" style={wrapStyle(4, { mixBlendMode: "screen", opacity: 0.65 })}/>
        <img ref={(el) => (rays.refs.current.a = el)}       src={ASSETS.rays + Q}      alt="" style={wrapStyle(2, { opacity: 0.9 })}/>
        <img ref={(el) => (rays.refs.current.b = el)}       src={ASSETS.rays + Q}      alt="" style={wrapStyle(2, { opacity: 0.9 })}/>

        {/* 雲（縦のみ／横は動かさない） */}
        <img ref={(el) => (far.refs.current.a  = el)} src={ASSETS.far + Q}  alt="" style={wrapStyle(5, { opacity: 0.92 })}/>
        <img ref={(el) => (far.refs.current.b  = el)} src={ASSETS.far + Q}  alt="" style={wrapStyle(5, { opacity: 0.92 })}/>
        <img ref={(el) => (mid.refs.current.a  = el)} src={ASSETS.mid + Q}  alt="" style={wrapStyle(6)}/>
        <img ref={(el) => (mid.refs.current.b  = el)} src={ASSETS.mid + Q}  alt="" style={wrapStyle(6)}/>
        <img ref={(el) => (near.refs.current.a = el)} src={ASSETS.near + Q} alt="" style={wrapStyle(8)}/>
        <img ref={(el) => (near.refs.current.b = el)} src={ASSETS.near + Q} alt="" style={wrapStyle(8)}/>

        {/* ロゴ（中央固定） */}
        {!use2D ? (
          <div style={{ position: "absolute", inset: 0, zIndex: 30, pointerEvents: "none" }}>
            <ThreeHeroLazy deviceIsMobile={isMobile} scrollY={scrollY} onContextLost={() => setThreeHardError(true)} />
          </div>
        ) : (
          <img
            src={ASSETS.logo + Q}
            alt="VOLCE Logo"
            style={{
              position: "absolute", left: "50%", top: "50%",
              transform: "translate(-50%, -50%)",
              width: isMobile ? 220 : 320, height: "auto", zIndex: 30, pointerEvents: "none",
              filter: "drop-shadow(0 10px 24px rgba(0,0,0,.45))", opacity: 0.98,
            }}
          />
        )}

        {/* 上下のトーン帯 */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, zIndex: 12, pointerEvents: "none",
          background: "linear-gradient(to bottom, rgba(5,8,15,.40) 0%, rgba(5,8,15,0) 28%, rgba(5,8,15,0) 72%, rgba(5,8,15,.28) 100%)",
        }}/>
      </div>

      {/* ===== 読み物セクション（重ならない） ===== */}
      <WelcomeCopy />

      <style jsx>{`
        img { user-select: none; -webkit-user-drag: none; will-change: transform, opacity; }
      `}</style>
    </main>
  );
}

/** 読み物（依頼文を添削の上で掲載） */
function WelcomeCopy() {
  return (
    <section
      className="relative"
      style={{
        background: "linear-gradient(to bottom, rgba(6,10,18,1) 0, rgba(6,10,18,0) 40%, rgba(6,10,18,1) 100%)",
        zIndex: 10, padding: "56px 0 96px",
      }}
    >
      <div style={{
        width: "min(1020px, 92vw)", margin: "0 auto",
        background: "rgba(12,16,24,.55)", border: "1px solid rgba(255,255,255,.10)",
        borderRadius: 18, padding: "28px 24px", backdropFilter: "blur(6px)",
        boxShadow: "0 16px 40px rgba(0,0,0,.35)",
      }}>
        <h2 style={{
          margin: 0, fontSize: "clamp(20px,3.6vw,28px)", fontWeight: 900, letterSpacing: ".08em",
          background: "linear-gradient(90deg,#fff6cc,#ffe39c 45%,#caa45a 100%)",
          WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
        }}>
          Volceクラン 公式ホームページへようこそ。
        </h2>

        <div style={{ marginTop: 14, lineHeight: 1.9, opacity: .95 }}>
          <p>私たちは、メンバー全員の個性を生かし、<strong>知名度の拡大</strong>に向けて活動しています。</p>
          <p>メンバーの<strong>得意分野に応じて役割を分担</strong>し、ゲリラ・大会への参加、SNSでの発信、イベントの企画・運営など、幅広く取り組んでいます。</p>
          <p>「<strong>人との輪を大切に、荒野行動を楽しみ、その魅力を広めて仲間を増やす</strong>」——これが私たちのモットーです。</p>
          <p>プレイスキルだけが活躍の条件ではありません。<strong>それぞれの強み</strong>を生かして活躍できます。</p>
          <p>興味のある方は <strong>X（旧Twitter）@Char_god1</strong> まで「入隊希望」とご連絡ください。</p>
        </div>
      </div>
    </section>
  );
}

/** ラップ画像の共通スタイル（大きめにはみ出させて継ぎ目防止） */
function wrapStyle(z: number, more?: React.CSSProperties): React.CSSProperties {
  return {
    position: "absolute",
    inset: "-10% -6% -8% -6%", // 以前より広め
    width: "112%",
    height: "112%",
    objectFit: "cover",
    zIndex: z,
    pointerEvents: "none",
    transform: "translate3d(0,0,0)",
    ...more,
  };
}
