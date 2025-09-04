/* eslint-disable @next/next/no-img-element */
"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";

/** ===== 調整値 ===== */
const CFG = {
  stageHeightVH: 900,
  speedY: { sky: 0.06, rays: 0.12, far: 0.18, mid: 0.32, near: 0.70, flareWide: 0.50, flareCore: 0.62 },
  COPY_FONT_SCALE: 1.20, COPY_GAP_VH: 120, COPY_TOP_VH: 22,
  LOGO_BASE_Z_DESKTOP: 8.2, LOGO_BASE_Z_MOBILE: 10.0,
  LOGO_DEPTH_TUNE: 1.4, LOGO_DEPTH_TUNE_MOBILE: 1.1,
  LOGO_SCALE: 0.98, LOGO_SCALE_MOBILE: 0.88,
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

/* FPSを1秒だけ計測してLite切替 */
function useLiteMode() {
  const [lite, setLite] = useState(false);
  useEffect(() => {
    const weak = ((navigator as any).deviceMemory || 8) <= 4 || (navigator.hardwareConcurrency || 8) <= 4;
    let frames = 0, slow = 0, last = performance.now(), id = 0 as unknown as number;
    const tick = (t: number) => {
      const dt = t - last; last = t; frames++; if (dt > 24) slow++;  // 60fps 予算からの余裕
      if (frames >= 60) { if (weak || slow > 10) setLite(true); return; }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);
  return lite;
}

/* ===== パララックス（DIVを translate3d） ===== */
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
  const lite = useLiteMode();

  const [webglOk, setWebglOk] = useState(false);
  const [threeHardError, setThreeHardError] = useState(false);
  const [mountThree, setMountThree] = useState(false);

  // 背景層
  const sky = useWrap(), rays = useWrap(), far = useWrap(), mid = useWrap(), near = useWrap(), flareWide = useWrap(), flareCore = useWrap();

  // 一時的 will-change（スクロール中だけ付与）
  const wrappers = [sky, rays, far, mid, near, flareWide, flareCore];
  const wcTimer = useRef<number | null>(null);
  const addWillChange = () => {
    wrappers.forEach(w => {
      w.refs.current.a && (w.refs.current.a.style.willChange = "transform");
      w.refs.current.b && (w.refs.current.b.style.willChange = "transform");
    });
    if (wcTimer.current) clearTimeout(wcTimer.current);
    wcTimer.current = window.setTimeout(() => {
      wrappers.forEach(w => {
        w.refs.current.a && (w.refs.current.a.style.willChange = "");
        w.refs.current.b && (w.refs.current.b.style.willChange = "");
      });
    }, 180); // 停止後すぐ外す（Firefox警告対策）
  };

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
      wrappers.forEach((w) => w.setH(h * 1.04));
    };
    setAllHeights();
    addEventListener("resize", setAllHeights);
    return () => removeEventListener("resize", setAllHeights);
  }, []);

  // スクロールでtransformをrAF集約
  useEffect(() => {
    const scale = (lite ? 0.7 : 1) * (reduced ? 0.2 : 1);
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
      addWillChange();
      scrollYRef.current = window.scrollY || 0;
      requestAnimationFrame(() => applyAll(scrollYRef.current));
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => removeEventListener("scroll", onScroll);
  }, [reduced, lite]);

  // Threeへの反映は約15fpsに間引き
  useEffect(() => {
    let id = 0 as unknown as number;
    const tick = () => { setScrollY(scrollYRef.current); id = window.setTimeout(tick, 66); };
    tick();
    return () => clearTimeout(id);
  }, []);

  // 3Dは画面に入ったら＋アイドル時に読込（ただし lite は切る）
  useEffect(() => {
    if (lite) return; // 軽量時は3Dを使わない
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
  }, [lite]);

  // 段階読み込みレベル（0=skyのみ → 1=rays/flare → 2=far/mid → 3=near）
  const [lvl, setLvl] = useState(0);
  useEffect(() => {
    let t1: number, t2: number, t3: number;
    const idle = (cb: () => void, ms: number) => {
      const w = window as any;
      if (w.requestIdleCallback) return w.requestIdleCallback(cb, { timeout: ms });
      return window.setTimeout(cb, ms);
    };
    t1 = idle(() => setLvl(1), 600);
    if (!lite) t2 = idle(() => setLvl(2), 1000);
    if (!lite) t3 = idle(() => setLvl(3), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [lite]);

  const use2D = reduced || lite || !webglOk || threeHardError;
  const cameraZ = isMobile ? (CFG.LOGO_BASE_Z_MOBILE + CFG.LOGO_DEPTH_TUNE_MOBILE)
                           : (CFG.LOGO_BASE_Z_DESKTOP + CFG.LOGO_DEPTH_TUNE);
  const logoScale = isMobile ? CFG.LOGO_SCALE_MOBILE : CFG.LOGO_SCALE;

  return (
    <main className="portal" style={{ minHeight: `${CFG.stageHeightVH}vh` }}>
      {/* === 背景ステージ（クリック透過 & 最背面） === */}
      <div
        style={{
          position: "sticky", top: 0, height: "100vh", overflow: "hidden",
          zIndex: 0, isolation: "isolate", pointerEvents: "none", background: "black",
          contain: "layout paint size",
        }}
      >
        {/* sky（LCP） */}
        <div ref={(el) => (sky.refs.current.a = el)} style={wrapStyle(0, { opacity: 0.98 })}>
          <Image src={ASSETS.sky} alt="" fill sizes="100vw" priority quality={60} />
        </div>
        <div ref={(el) => (sky.refs.current.b = el)} style={wrapStyle(0, { opacity: 0.98 })}>
          <Image src={ASSETS.sky} alt="" fill sizes="100vw" quality={60} />
        </div>

        {/* level 1: flare / rays */}
        {lvl >= 1 && (
          <>
            <div ref={(el) => (flareWide.refs.current.a = el)} style={wrapStyle(3, { mixBlendMode: "screen", opacity: 0.5 })}>
              <Image src={ASSETS.flareWide} alt="" fill sizes="100vw" loading="lazy" quality={50} />
            </div>
            <div ref={(el) => (flareWide.refs.current.b = el)} style={wrapStyle(3, { mixBlendMode: "screen", opacity: 0.5 })}>
              <Image src={ASSETS.flareWide} alt="" fill sizes="100vw" loading="lazy" quality={50} />
            </div>
            <div ref={(el) => (flareCore.refs.current.a = el)} style={wrapStyle(4, { mixBlendMode: "screen", opacity: 0.6 })}>
              <Image src={ASSETS.flareCore} alt="" fill sizes="100vw" loading="lazy" quality={50} />
            </div>
            <div ref={(el) => (flareCore.refs.current.b = el)} style={wrapStyle(4, { mixBlendMode: "screen", opacity: 0.6 })}>
              <Image src={ASSETS.flareCore} alt="" fill sizes="100vw" loading="lazy" quality={50} />
            </div>
            <div ref={(el) => (rays.refs.current.a = el)} style={wrapStyle(2, { opacity: 0.88 })}>
              <Image src={ASSETS.rays} alt="" fill sizes="100vw" loading="lazy" quality={50} />
            </div>
            <div ref={(el) => (rays.refs.current.b = el)} style={wrapStyle(2, { opacity: 0.88 })}>
              <Image src={ASSETS.rays} alt="" fill sizes="100vw" loading="lazy" quality={50} />
            </div>
          </>
        )}

        {/* level 2: far / mid */}
        {lvl >= 2 && (
          <>
            <div ref={(el) => (far.refs.current.a = el)} style={wrapStyle(5, { opacity: 0.92 })}>
              <Image src={ASSETS.far} alt="" fill sizes="100vw" loading="lazy" quality={48} />
            </div>
            <div ref={(el) => (far.refs.current.b = el)} style={wrapStyle(5, { opacity: 0.92 })}>
              <Image src={ASSETS.far} alt="" fill sizes="100vw" loading="lazy" quality={48} />
            </div>
            <div ref={(el) => (mid.refs.current.a = el)} style={wrapStyle(6)}>
              <Image src={ASSETS.mid} alt="" fill sizes="100vw" loading="lazy" quality={48} />
            </div>
            <div ref={(el) => (mid.refs.current.b = el)} style={wrapStyle(6)}>
              <Image src={ASSETS.mid} alt="" fill sizes="100vw" loading="lazy" quality={48} />
            </div>
          </>
        )}

        {/* level 3: near（最も重いので最後） */}
        {lvl >= 3 && (
          <>
            <div ref={(el) => (near.refs.current.a = el)} style={wrapStyle(8)}>
              <Image src={ASSETS.near} alt="" fill sizes="100vw" loading="lazy" quality={46} />
            </div>
            <div ref={(el) => (near.refs.current.b = el)} style={wrapStyle(8)}>
              <Image src={ASSETS.near} alt="" fill sizes="100vw" loading="lazy" quality={46} />
            </div>
          </>
        )}

        {/* クリックを奪わない透明層 */}
        <div id="three-mount-io" style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }} />

        {/* 中央ロゴ */}
        {mountThree && !use2D ? (
          <React.Suspense fallback={null}>
            <div style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" }}>
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
          <div style={{ position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)", zIndex:3, pointerEvents:"none" }}>
            <Image
              src={ASSETS.logo}
              alt="VOLCE Logo"
              width={(isMobile ? 220 : 320) * logoScale}
              height={(isMobile ? 220 : 320) * logoScale}
              priority quality={82}
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
        .copyWrap{
          margin-top: -100vh; padding-top: 100vh;
          position: relative; z-index: 10;  /* ヘッダー(z>=100)よりは下に */
          --copyScale: ${CFG.COPY_FONT_SCALE};
        }
        .copyBlock{ position: relative; height: ${CFG.COPY_GAP_VH}vh; content-visibility:auto; contain:paint style layout; }
        .copyItem{
          position: sticky; top: ${CFG.COPY_TOP_VH}vh;
          display: grid; place-items: center; text-align: center;
          width: min(900px, 86vw); margin: 0 auto; pointer-events: auto; opacity: .98;
        }
        .copyItem h2{
          margin: 0 0 12px; color: #fff;
          font-size: calc(clamp(22px, 4.8vw, 42px) * var(--copyScale));
          font-weight: 900; letter-spacing: .04em; line-height: 1.25;
        }
        .copyItem p{
          margin: 0; color: #d9e1ee;
          font-size: calc(clamp(14px, 2.2vw, 18px) * var(--copyScale));
          line-height: 1.9; text-shadow: 0 1px 0 rgba(0,0,0,.35); word-break: break-word;
        }
      `}</style>
    </main>
  );
}

/** 画像レイヤー用スタイル（親DIVにtransformを当てる） */
function wrapStyle(z: number, more?: React.CSSProperties): React.CSSProperties {
  return {
    position: "absolute",
    inset: "-6% -4% -2% -4%",
    width: "108%",
    height: "104%",
    zIndex: z,
    pointerEvents: "none",     // 念のため各レイヤーでも無効化
    transform: "translate3d(0,0,0)",
    ...more,
  };
}
