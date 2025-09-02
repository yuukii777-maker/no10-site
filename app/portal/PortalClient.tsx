/* eslint-disable @next/next/no-img-element */
"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";

/** ===== 調整値 ===== */
const CFG = {
  stageHeightVH: 900,
  // 縦パララックス速度（横ドリフトは完全に0へ）
  speedY: { sky: 0.06, rays: 0.12, far: 0.18, mid: 0.32, near: 0.70, flareWide: 0.50, flareCore: 0.62 },
  tiltMaxX: 0,                     // 横ブレ無し
  HERO_DESKTOP: 760,
  HERO_MOBILE: 560,
  COPY_FONT_SCALE: 0.92,           // ← 文字サイズの全体倍率（重なり時は下げる）
};

const SHA = (process.env.NEXT_PUBLIC_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || "")
  .toString()
  .slice(0, 8);
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

/** ===== 文章（ここを書き換えればOK） ===== */
const COPY: { title?: string; body: string }[] = [
  {
    title: "Volceクラン公式ホームページへようこそ。",
    body:
      "私たちは、メンバー全員の個性を生かし、知名度拡大のため活動しています。",
  },
  {
    body:
      "得意分野に振り分け、ゲリラ・大会への参加、SNS活動、イベントの開催等、活動を行っています。",
  },
  {
    body:
      "人との輪を大切に、荒野行動を楽しみ、広めてユーザーを増やす。をモットーにしています。",
  },
  {
    body:
      "プレイの実力が無くても、他の強みを生かして活躍することも可能です。",
  },
  {
    body:
      "興味のある方は X(旧ツイッター) の ID @Char_god1 まで「入隊希望」とご連絡ください。",
  },
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

/* ===== wrap utility (縦だけループ) ===== */
type WrapRefs = { a: HTMLImageElement | null; b: HTMLImageElement | null; h: number };
function useWrap() {
  const refs = useRef<WrapRefs>({ a: null, b: null, h: 0 });
  const setH = (h: number) => (refs.current.h = h);
  const setY = (y: number) => {
    const { a, b, h } = refs.current;
    if (!a || !b || !h) return;
    const yk = ((y % h) + h) % h;
    a.style.transform = `translate3d(0px, ${yk}px, 0)`;
    b.style.transform = `translate3d(0px, ${yk - h}px, 0)`;
  };
  return { refs, setH, setY };
}

/** 3D ロゴ（必要なら） */
const ThreeHeroLazy = dynamic(() => import("./ThreeHero"), { ssr: false, loading: () => null });

export default function PortalClient() {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const [webglOk, setWebglOk] = useState(false);
  const [threeHardError, setThreeHardError] = useState(false);

  const stageRef = useRef<HTMLDivElement | null>(null);

  const sky = useWrap();
  const rays = useWrap();
  const far = useWrap();
  const mid = useWrap();
  const near = useWrap();
  const flareWide = useWrap();
  const flareCore = useWrap();

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      // @ts-ignore
      setWebglOk(!!(c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch {
      setWebglOk(false);
    }
  }, []);

  // 初期高さ
  useEffect(() => {
    const setAllHeights = () => {
      const h = window.innerHeight || 800;
      [sky, rays, far, mid, near, flareWide, flareCore].forEach((w) => w.setH(h * 1.04));
    };
    setAllHeights();
    addEventListener("resize", setAllHeights);
    return () => removeEventListener("resize", setAllHeights);
  }, []);

  // 縦パララックスのみ
  useEffect(() => {
    const tick = () => {
      const y = window.scrollY || 0;
      setScrollY(y);
      const scale = reduced ? 0.2 : 1;
      const apply = (hook: ReturnType<typeof useWrap>, ky: number) => hook.setY(y * ky * scale);

      apply(sky, CFG.speedY.sky);
      apply(rays, CFG.speedY.rays);
      apply(far, CFG.speedY.far);
      apply(mid, CFG.speedY.mid);
      apply(near, CFG.speedY.near);
      apply(flareWide, CFG.speedY.flareWide);
      apply(flareCore, CFG.speedY.flareCore);

      requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [reduced]);

  const use2D = reduced || !webglOk || threeHardError;
  const heroHeight = isMobile ? CFG.HERO_MOBILE : CFG.HERO_DESKTOP;

  return (
    <main className="portal" style={{ minHeight: `${CFG.stageHeightVH}vh` }}>
      {/* === sticky sky stage === */}
      <div
        ref={stageRef}
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          zIndex: 40,
          isolation: "isolate",
          pointerEvents: "none",
          background: "black",
        }}
      >
        {/* 背景（縦ラップ） */}
        <img ref={(el) => (sky.refs.current.a = el)}  src={ASSETS.sky + Q}  alt="" style={wrapStyle(0, { opacity: 0.98 })} />
        <img ref={(el) => (sky.refs.current.b = el)}  src={ASSETS.sky + Q}  alt="" style={wrapStyle(0, { opacity: 0.98 })} />

        {/* 光 */}
        <img ref={(el) => (flareWide.refs.current.a = el)}  src={ASSETS.flareWide + Q} alt="" style={wrapStyle(3, { mixBlendMode: "screen", opacity: 0.5 })}/>
        <img ref={(el) => (flareWide.refs.current.b = el)}  src={ASSETS.flareWide + Q} alt="" style={wrapStyle(3, { mixBlendMode: "screen", opacity: 0.5 })}/>
        <img ref={(el) => (flareCore.refs.current.a = el)}  src={ASSETS.flareCore + Q} alt="" style={wrapStyle(4, { mixBlendMode: "screen", opacity: 0.65 })}/>
        <img ref={(el) => (flareCore.refs.current.b = el)}  src={ASSETS.flareCore + Q} alt="" style={wrapStyle(4, { mixBlendMode: "screen", opacity: 0.65 })}/>
        <img ref={(el) => (rays.refs.current.a = el)}       src={ASSETS.rays + Q}      alt="" style={wrapStyle(2, { opacity: 0.9 })}/>
        <img ref={(el) => (rays.refs.current.b = el)}       src={ASSETS.rays + Q}      alt="" style={wrapStyle(2, { opacity: 0.9 })}/>

        {/* 雲 */}
        <img ref={(el) => (far.refs.current.a  = el)} src={ASSETS.far + Q}  alt="" style={wrapStyle(5, { opacity: 0.92 })}/>
        <img ref={(el) => (far.refs.current.b  = el)} src={ASSETS.far + Q}  alt="" style={wrapStyle(5, { opacity: 0.92 })}/>
        <img ref={(el) => (mid.refs.current.a  = el)} src={ASSETS.mid + Q}  alt="" style={wrapStyle(6)}/>
        <img ref={(el) => (mid.refs.current.b  = el)} src={ASSETS.mid + Q}  alt="" style={wrapStyle(6)}/>
        <img ref={(el) => (near.refs.current.a = el)} src={ASSETS.near + Q} alt="" style={wrapStyle(8)}/>
        <img ref={(el) => (near.refs.current.b = el)} src={ASSETS.near + Q} alt="" style={wrapStyle(8)}/>

        {/* 中央ロゴ */}
        {!use2D ? (
          <div style={{ position: "absolute", inset: 0, zIndex: 30, pointerEvents: "none" }}>
            <ThreeHeroLazy
              deviceIsMobile={isMobile}
              scrollY={scrollY}
              onContextLost={() => setThreeHardError(true)}
            />
          </div>
        ) : (
          <img
            src={ASSETS.logo + Q}
            alt="VOLCE Logo"
            style={{
              position: "absolute", left: "50%", top: "50%",
              transform: "translate(-50%, -50%)",
              width: isMobile ? 220 : 320,
              height: "auto", zIndex: 30, pointerEvents: "none",
              filter: "drop-shadow(0 10px 24px rgba(0,0,0,.45))", opacity: 0.98,
            }}
          />
        )}

        {/* 上下グラデーション */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, zIndex: 12, pointerEvents: "none",
          background: "linear-gradient(to bottom, rgba(5,8,15,.40) 0%, rgba(5,8,15,0) 28%, rgba(5,8,15,0) 72%, rgba(5,8,15,.28) 100%)",
        }}/>
      </div>

      {/* ==== コピー ==== */}
      <section className="copyWrap">
        <div className="copySticky">
          {COPY.map((c, i) => (
            <article className="copy" style={{ ["--i" as any]: i } as React.CSSProperties} key={i}>
              {!!c.title && <h2>{c.title}</h2>}
              <p>{c.body}</p>
            </article>
          ))}
        </div>
      </section>

      <style jsx>{`
        .portal :global(img){ user-select:none; -webkit-user-drag:none; will-change:transform,opacity; }
        .copyWrap{
          min-height: 220vh;
          background: linear-gradient(to bottom, rgba(6,10,18,1) 0, rgba(6,10,18,0) 35%, rgba(6,10,18,0) 65%, rgba(6,10,18,1) 100%);
          z-index:10; position:relative;
        }
        .copySticky{
          position: sticky; top: 16vh; height: 68vh;
          display:grid; place-items:center; text-align:center; pointer-events:none;
          font-size: calc(1rem * ${CFG.COPY_FONT_SCALE});
        }
        .copy{
          position:absolute; width:min(820px, 86vw); margin:0 auto;
          opacity:0; transform: translate3d(0, 26px, 0);
          transition: opacity .35s ease, transform .35s ease;
          /* 出現タイミングをずらす：各段落ごとに閾値を変える */
          animation: reveal 1ms linear both;
          animation-delay: calc(var(--i,0) * 220ms);
        }
        @keyframes reveal { to { opacity:1; transform: translate3d(0,0,0); } }
        .copy + .copy{ filter:none }
        .copy h2{
          margin:0 0 10px; font-size:clamp(20px, 4.6vw, 40px); font-weight:900; letter-spacing:.04em;
        }
        .copy p{
          margin:0; color:#d9e1ee; font-size:clamp(14px, 2.2vw, 18px); line-height:1.9;
          text-shadow: 0 1px 0 rgba(0,0,0,.45);
        }
      `}</style>
    </main>
  );
}

/** 縦ラップ用スタイル */
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
