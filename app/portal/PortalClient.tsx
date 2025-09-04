/* eslint-disable @next/next/no-img-element */
"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

/** ===== 調整値 ===== */
const CFG = {
  stageHeightVH: 900,
  speedY: { sky: 0.06, rays: 0.12, far: 0.18, mid: 0.32, near: 0.70, flareWide: 0.50, flareCore: 0.62 },

  COPY_FONT_SCALE: 1.20,
  COPY_GAP_VH: 120,
  COPY_TOP_VH: 22,

  LOGO_BASE_Z_DESKTOP: 8.2,
  LOGO_BASE_Z_MOBILE: 10.0,
  LOGO_DEPTH_TUNE: 1.4,
  LOGO_DEPTH_TUNE_MOBILE: 1.1,
  LOGO_SCALE: 0.98,
  LOGO_SCALE_MOBILE: 0.88,
};

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

/** ===== COPY ===== */
const COPY: { title?: string; body: string }[] = [
  { title: "Volceクラン公式ホームページへようこそ。", body: "私たちは、メンバー全員の個性を生かし、知名度拡大のため活動しています。" },
  { body: "得意分野に振り分け、ゲリラ・大会への参加、SNS活動、イベントの開催等、活動を行っています。" },
  { body: "人との輪を大切に、荒野行動を楽しみ、広めてユーザーを増やす。をモットーにしています。" },
  { body: "プレイの実力が無くても、他の強みを生かして活躍することも可能です。" },
  { body: "興味のある方は X(旧ツイッター) の ID @Char_god1 まで「入隊希望」とご連絡ください。" },
];

/* ===== hooks ===== */
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

/* ===== パララックスの縦ラップ (DIVにtransformを当てる) ===== */
type WrapRefs = { a: HTMLDivElement | null; b: HTMLDivElement | null; h: number };
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

/** 3D ロゴ（遅延マウント） */
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
    } catch { setWebglOk(false); }
  }, []);

  // 高さ
  useEffect(() => {
    const setAllHeights = () => {
      const h = window.innerHeight || 800;
      [sky, rays, far, mid, near, flareWide, flareCore].forEach((w) => w.setH(h * 1.04));
    };
    setAllHeights();
    addEventListener("resize", setAllHeights);
    return () => removeEventListener("resize", setAllHeights);
  }, []);

  // スクロールでtransformをrAF集約
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
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => removeEventListener("scroll", onScroll);
  }, [reduced]);

  // Threeへの反映は約15fpsに間引き
  useEffect(() => {
    let id = 0 as unknown as number;
    const tick = () => { setScrollY(scrollYRef.current); id = window.setTimeout(tick, 66); };
    tick();
    return () => clearTimeout(id);
  }, []);

  // 3Dは画面に入ったら＋アイドル時に読込
  useEffect(() => {
    const target = document.getElementById("three-mount-io");
    if (!target) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      (window as any).requestIdleCallback
        ? (window as any).requestIdleCallback(() => setMountThree(true), { timeout: 1000 })
        : setTimeout(() => setMountThree(true), 600);
      io.disconnect();
    }, { rootMargin: "200px" });
    io.observe(target);
    return () => io.disconnect();
  }, []);

  const use2D = reduced || !webglOk || threeHardError;
  const cameraZ = isMobile ? (CFG.LOGO_BASE_Z_MOBILE + CFG.LOGO_DEPTH_TUNE_MOBILE)
                           : (CFG.LOGO_BASE_Z_DESKTOP + CFG.LOGO_DEPTH_TUNE);
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
          contain: "layout paint size",
        }}
      >
        {/* 背景（縦ラップ）— Next/Image を “DIVラッパ”でtransform */}
        <div ref={(el) => (sky.refs.current.a = el)} style={wrapStyle(0, { opacity: 0.98 })}>
          <Image src={ASSETS.sky} alt="" fill sizes="100vw" priority quality={70} />
        </div>
        <div ref={(el) => (sky.refs.current.b = el)} style={wrapStyle(0, { opacity: 0.98 })}>
          <Image src={ASSETS.sky} alt="" fill sizes="100vw" quality={70} />
        </div>

        {/* 光 */}
        <div ref={(el) => (flareWide.refs.current.a = el)} style={wrapStyle(3, { mixBlendMode: "screen", opacity: 0.5 })}>
          <Image src={ASSETS.flareWide} alt="" fill sizes="100vw" quality={60} />
        </div>
        <div ref={(el) => (flareWide.refs.current.b = el)} style={wrapStyle(3, { mixBlendMode: "screen", opacity: 0.5 })}>
          <Image src={ASSETS.flareWide} alt="" fill sizes="100vw" quality={60} />
        </div>
        <div ref={(el) => (flareCore.refs.current.a = el)} style={wrapStyle(4, { mixBlendMode: "screen", opacity: 0.65 })}>
          <Image src={ASSETS.flareCore} alt="" fill sizes="100vw" quality={60} />
        </div>
        <div ref={(el) => (flareCore.refs.current.b = el)} style={wrapStyle(4, { mixBlendMode: "screen", opacity: 0.65 })}>
          <Image src={ASSETS.flareCore} alt="" fill sizes="100vw" quality={60} />
        </div>
        <div ref={(el) => (rays.refs.current.a = el)} style={wrapStyle(2, { opacity: 0.9 })}>
          <Image src={ASSETS.rays} alt="" fill sizes="100vw" quality={60} />
        </div>
        <div ref={(el) => (rays.refs.current.b = el)} style={wrapStyle(2, { opacity: 0.9 })}>
          <Image src={ASSETS.rays} alt="" fill sizes="100vw" quality={60} />
        </div>

        {/* 雲 */}
        <div ref={(el) => (far.refs.current.a = el)} style={wrapStyle(5, { opacity: 0.92 })}>
          <Image src={ASSETS.far} alt="" fill sizes="100vw" quality={60} />
        </div>
        <div ref={(el) => (far.refs.current.b = el)} style={wrapStyle(5, { opacity: 0.92 })}>
          <Image src={ASSETS.far} alt="" fill sizes="100vw" quality={60} />
        </div>
        <div ref={(el) => (mid.refs.current.a = el)} style={wrapStyle(6)}>
          <Image src={ASSETS.mid} alt="" fill sizes="100vw" quality={60} />
        </div>
        <div ref={(el) => (mid.refs.current.b = el)} style={wrapStyle(6)}>
          <Image src={ASSETS.mid} alt="" fill sizes="100vw" quality={60} />
        </div>
        <div ref={(el) => (near.refs.current.a = el)} style={wrapStyle(8)}>
          <Image src={ASSETS.near} alt="" fill sizes="100vw" quality={60} />
        </div>
        <div ref={(el) => (near.refs.current.b = el)} style={wrapStyle(8)}>
          <Image src={ASSETS.near} alt="" fill sizes="100vw" quality={60} />
        </div>

        {/* 3Dマウントの目印 */}
        <div id="three-mount-io" style={{ position: "absolute", inset: 0, zIndex: 29 }} />

        {/* 中央ロゴ */}
        {mountThree && !(reduced || !webglOk || threeHardError) ? (
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
          <div style={{ position: "absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)", zIndex:30, pointerEvents:"none" }}>
            <Image
              src={ASSETS.logo}
              alt="VOLCE Logo"
              width={(isMobile ? 220 : 320) * logoScale}
              height={(isMobile ? 220 : 320) * logoScale}
              priority
              quality={85}
              style={{ filter:"drop-shadow(0 10px 24px rgba(0,0,0,.45))", opacity:.98 }}
            />
          </div>
        )}
      </div>

      {/* ==== COPY ==== */}
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
        /* will-change の常時付与は禁止（Firefox警告の原因）。translate3dで合成へ */
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
          content-visibility: auto;
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
          margin: 0 0 12px; color: #fff;
          font-size: calc(clamp(22px, 4.8vw, 42px) * var(--copyScale));
          font-weight: 900; letter-spacing: .04em; line-height: 1.25;
        }
        .copyItem p{
          margin: 0; color: #d9e1ee;
          font-size: calc(clamp(14px, 2.2vw, 18px) * var(--copyScale));
          line-height: 1.9; text-shadow: 0 1px 0 rgba(0,0,0,.35);
          word-break: break-word;
        }
      `}</style>
    </main>
  );
}

/** 画像レイヤー用の共通スタイル（親DIVにtransformを当てる） */
function wrapStyle(z: number, more?: React.CSSProperties): React.CSSProperties {
  return {
    position: "absolute",
    inset: "-6% -4% -2% -4%",
    width: "108%",
    height: "104%",
    zIndex: z,
    pointerEvents: "none",
    transform: "translate3d(0,0,0)",
    ...more,
  };
}
