/* eslint-disable @next/next/no-img-element */
"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";

/* === cache-busting === */
const SHA = (process.env.NEXT_PUBLIC_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || "")
  .toString()
  .slice(0, 8);
const Q = SHA ? `?v=${SHA}` : "";

/* === assets === */
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

/* === copy === */
const MESSAGES = [
  { id: "m1", title: "VOLCE",        body: "雲を抜け、はじまりへ。" },
  { id: "m2", title: "Gathering",    body: "仲間と、想いと、景色をひとつに。" },
  { id: "m3", title: "Into the Sky", body: "ここから上へ——物語のつづきへ。" },
] as const;

/* === params === */
const CFG = {
  stageHeightVH: 220, // スクロール尺はコピーの演出分だけでOK（stickyで見せる）
  speedY: { sky: 0.06, rays: 0.12, far: 0.18, mid: 0.32, near: 0.70, flareWide: 0.50, flareCore: 0.62 },
  driftX: {  // sky の横ドリフトは 0（継ぎ目防止）
    sky: 0, rays: 0.006, far: 0.009, mid: 0.015, near: 0.028, flareWide: 0.010, flareCore: 0.016,
  },
  tiltMaxX: 6,
  heroH: { desktop: 760, mobile: 560 },
} as const;

/* === utils === */
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

/* === wrap (2px overlap で継ぎ目ゼロ) === */
type WrapRefs = { a: HTMLImageElement | null; b: HTMLImageElement | null; h: number; overlap: number };
function useWrap() {
  const refs = useRef<WrapRefs>({ a: null, b: null, h: 0, overlap: 2 });
  const setH = (h: number) => (refs.current.h = h);
  const setPos = (y: number, x: number) => {
    const { a, b, h, overlap } = refs.current;
    if (!a || !b || !h) return;
    const span = h - overlap;
    const yk = ((y % span) + span) % span;
    const tx = Math.round(x * 100) / 100;
    a.style.transform = `translate3d(${tx}px, ${yk}px, 0)`;
    b.style.transform = `translate3d(${tx}px, ${yk - span}px, 0)`;
  };
  return { refs, setH, setPos };
}

/* === 3D logo === */
const ThreeHeroLazy = dynamic(() => import("./ThreeHero"), { ssr: false, loading: () => null });

export default function PortalClient() {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();

  const [webglOk, setWebglOk] = useState(false);
  const [threeHardError, setThreeHardError] = useState(false);

  const sky = useWrap(); const rays = useWrap(); const far = useWrap();
  const mid = useWrap(); const near = useWrap(); const flareWide = useWrap(); const flareCore = useWrap();

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      // @ts-ignore
      setWebglOk(!!(c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch { setWebglOk(false); }
  }, []);

  useEffect(() => {
    const setAllHeights = () => {
      const h = window.innerHeight || 800;
      [sky, rays, far, mid, near, flareWide, flareCore].forEach((w) => w.setH(h * 1.04));
    };
    setAllHeights(); addEventListener("resize", setAllHeights);
    return () => removeEventListener("resize", setAllHeights);
  }, []);

  useEffect(() => {
    let mx = 0, tmx = 0;
    const lerp = (a: number, b: number, n: number) => a + (b - a) * n;

    const tick = (tNow: number) => {
      const y = window.scrollY || 0;
      setScrollY(y);
      const drift = (k: number) => (k * (tNow * 0.06)) % 1600;
      tmx = lerp(tmx, mx, 0.08);
      const scale = reduced ? 0.15 : 1;
      const apply = (hook: ReturnType<typeof useWrap>, ky: number, kx: number) =>
        hook.setPos(y * ky * scale, drift(kx) + tmx);

      apply(sky, CFG.speedY.sky, CFG.driftX.sky);
      apply(rays, CFG.speedY.rays, CFG.driftX.rays);
      apply(far, CFG.speedY.far, CFG.driftX.far);
      apply(mid, CFG.speedY.mid, CFG.driftX.mid);
      apply(near, CFG.speedY.near, CFG.driftX.near);
      apply(flareWide, CFG.speedY.flareWide, CFG.driftX.flareWide);
      apply(flareCore, CFG.speedY.flareCore, CFG.driftX.flareCore);

      requestAnimationFrame(tick);
    };

    const onPointer = (e: PointerEvent) => {
      const w = innerWidth || 1; const t = ((e.clientX - w / 2) / w) * CFG.tiltMaxX;
      mx = t;
    };
    const onOrient = (e: DeviceOrientationEvent) => { if (e.gamma != null) mx = (e.gamma / 45) * (CFG.tiltMaxX * 0.8); };

    const id = requestAnimationFrame(tick);
    if (!reduced) {
      addEventListener("pointermove", onPointer, { passive: true });
      addEventListener("deviceorientation", onOrient as any, { passive: true });
    }
    return () => { cancelAnimationFrame(id); removeEventListener("pointermove", onPointer); removeEventListener("deviceorientation", onOrient as any); };
  }, [reduced]);

  const use2D = reduced || !webglOk || threeHardError;

  return (
    <main className="relative" style={{ minHeight: `${CFG.stageHeightVH}vh`, color: "#e5e7eb" }}>
      {/* === sticky stage === */}
      <div style={{ position:"sticky", top:0, height:"100vh", overflow:"hidden", zIndex:15, background:"black", isolation:"isolate", pointerEvents:"none" }}>
        {/* sky */}
        <img ref={(el)=> (sky.refs.current.a=el)}  src={ASSETS.sky + Q}  alt="" style={wrapStyle(0, { opacity: .98 })}/>
        <img ref={(el)=> (sky.refs.current.b=el)}  src={ASSETS.sky + Q}  alt="" style={wrapStyle(0, { opacity: .98 })}/>
        {/* flares/rays */}
        <img ref={(el)=> (flareWide.refs.current.a=el)} src={ASSETS.flareWide + Q} alt="" style={wrapStyle(3, { mixBlendMode:"screen", opacity:.5 })}/>
        <img ref={(el)=> (flareWide.refs.current.b=el)} src={ASSETS.flareWide + Q} alt="" style={wrapStyle(3, { mixBlendMode:"screen", opacity:.5 })}/>
        <img ref={(el)=> (flareCore.refs.current.a=el)} src={ASSETS.flareCore + Q} alt="" style={wrapStyle(4, { mixBlendMode:"screen", opacity:.65 })}/>
        <img ref={(el)=> (flareCore.refs.current.b=el)} src={ASSETS.flareCore + Q} alt="" style={wrapStyle(4, { mixBlendMode:"screen", opacity:.65 })}/>
        <img ref={(el)=> (rays.refs.current.a=el)}      src={ASSETS.rays + Q}      alt="" style={wrapStyle(2, { opacity:.9 })}/>
        <img ref={(el)=> (rays.refs.current.b=el)}      src={ASSETS.rays + Q}      alt="" style={wrapStyle(2, { opacity:.9 })}/>
        {/* clouds */}
        <img ref={(el)=> (far.refs.current.a=el)}  src={ASSETS.far + Q}  alt="" style={wrapStyle(5, { opacity:.92 })}/>
        <img ref={(el)=> (far.refs.current.b=el)}  src={ASSETS.far + Q}  alt="" style={wrapStyle(5, { opacity:.92 })}/>
        <img ref={(el)=> (mid.refs.current.a=el)}  src={ASSETS.mid + Q}  alt="" style={wrapStyle(6)}/>
        <img ref={(el)=> (mid.refs.current.b=el)}  src={ASSETS.mid + Q}  alt="" style={wrapStyle(6)}/>
        <img ref={(el)=> (near.refs.current.a=el)} src={ASSETS.near + Q} alt="" style={wrapStyle(8)}/>
        <img ref={(el)=> (near.refs.current.b=el)} src={ASSETS.near + Q} alt="" style={wrapStyle(8)}/>

        {/* 3D/2D logo */}
        {!use2D ? (
          <div style={{ position:"absolute", inset:0, zIndex:30 }}>
            <ThreeHeroLazy deviceIsMobile={isMobile} scrollY={scrollY} onContextLost={() => setThreeHardError(true)} />
          </div>
        ) : (
          <img src={ASSETS.logo + Q} alt="VOLCE Logo"
               style={{ position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)", width: isMobile ? 220 : 320, height:"auto", zIndex:30, filter:"drop-shadow(0 10px 24px rgba(0,0,0,.45))", opacity:.98 }}/>
        )}

        {/* ★ コピーはステージの手前・固定オーバーレイに */}
        <CopyOverlay />

        {/* 上下を締めるグラデ */}
        <div aria-hidden style={{
          position:"absolute", inset:0, zIndex:12, pointerEvents:"none",
          background:"linear-gradient(to bottom, rgba(5,8,15,.40) 0%, rgba(5,8,15,0) 28%, rgba(5,8,15,0) 72%, rgba(5,8,15,.28) 100%)",
        }}/>
      </div>

      {/* スクロール余白：コピー演出のため */}
      <div style={{ height: "120vh" }} />
    </main>
  );
}

/* === コピー（ステージ前面オーバーレイ） === */
function CopyOverlay() {
  const [p, setP] = useState(0); // 0〜2.2 くらい
  useEffect(() => {
    const on = () => setP(Math.max(0, Math.min(2.2, (scrollY || 0) / (innerHeight || 1))));
    on(); addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);
  return (
    <div style={{ position:"absolute", inset:0, zIndex:32, display:"grid", placeItems:"center", pointerEvents:"none" }}>
      {MESSAGES.map((m, i) => {
        const ip = Math.max(0, Math.min(1, (p - i * 0.55) / 0.9)); // 連続フェード
        const y = (1 - ip) * 28;
        return (
          <div key={m.id}
               style={{ position:"absolute", transform:`translate3d(0, ${y}px, 0)`, opacity: ip,
                        textAlign:"center", textShadow:"0 2px 10px rgba(0,0,0,.35)", filter:"drop-shadow(0 4px 16px rgba(0,0,0,.25))",
                        transition:"opacity .25s linear, transform .25s linear" }}>
            <div style={{ fontSize:"clamp(26px,5vw,58px)", fontWeight:900, letterSpacing:".04em" }}>{m.title}</div>
            <div style={{ opacity:.9, marginTop:10, fontSize:"clamp(14px,2.6vw,20px)" }}>{m.body}</div>
          </div>
        );
      })}
    </div>
  );
}

/* === wrap style === */
function wrapStyle(z: number, more?: React.CSSProperties): React.CSSProperties {
  const mask = "linear-gradient(to bottom, transparent 0, black 3%, black 97%, transparent 100%)";
  return {
    position: "absolute",
    inset: "-8% -4% -4% -4%",
    width: "108%", height: "108%", objectFit: "cover",
    zIndex: z, pointerEvents: "none",
    WebkitMaskImage: mask, maskImage: mask,
    transform: "translate3d(0,0,0)",
    ...more,
  };
}
