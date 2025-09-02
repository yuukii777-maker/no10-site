/* eslint-disable @next/next/no-img-element */
"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";

/** ===== cache-busting ===== */
const SHA = (process.env.NEXT_PUBLIC_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || "")
  .toString()
  .slice(0, 8);
const Q = SHA ? `?v=${SHA}` : "";

/** ===== assets ===== */
const ASSETS = {
  sky: ["/portal/background2.webp"],
  rays: "/portal/rays.webp",
  flareWide: "/portal/flare_wide.webp",
  flareCore: "/portal/flare_core.webp",
  far: "/portal/cloud_far.webp",
  mid: "/portal/cloud_mid.webp",
  // mid2 は外す
  near: "/portal/cloud_near.webp",
  logo: "/portal/logo.webp",
} as const;

/** ===== copy ===== */
const MESSAGES = [
  { id: "m1", title: "VOLCE",        body: "雲を抜け、はじまりへ。" },
  { id: "m2", title: "Gathering",    body: "仲間と、想いと、景色をひとつに。" },
  { id: "m3", title: "Into the Sky", body: "ここから上へ——物語のつづきへ。" },
] as const;

/** ===== config ===== */
const CFG = {
  heroH: { desktop: 760, mobile: 560 },

  // 縦パララックス係数（下ほど大きい）
  speedY: {
    rays: 0.12,
    far: 0.18,
    mid: 0.34,
    near: 0.68,
    flareWide: 0.50,
    flareCore: 0.62,
  },

  // 水平ドリフト（“個々の雲が生きてる”感じ）
  drift: {
    far:  { amp: 6,  freq: 0.10 },
    mid:  { amp: 10, freq: 0.14 },
    near: { amp: 16, freq: 0.18 },
  },

  // マウス/傾きによる水平シフト（ロゴより控えめ）
  tiltMaxX: 6,
} as const;

/** ===== z-index（NavBar > Logo > 雲前景 > 背景） ===== */
const Z = {
  NAV: 60,
  LOGO: 50,
  FRONT: 40,
  BACK: 1,
} as const;

/** ===== local hooks ===== */
function useReducedMotion() {
  const [reduced, set] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => set(mq.matches);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return reduced;
}
function useIsMobile() {
  const [m, set] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(max-width: 640px)");
    const on = () => set(mq.matches);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return m;
}
async function pickFirstReachable(candidates: string[]) {
  for (const url of candidates) {
    try {
      const r = await fetch(url, { method: "HEAD", cache: "no-store" });
      if (r.ok) return url;
    } catch {}
  }
  return candidates[0];
}
function canUseWebGL() {
  try {
    const c = document.createElement("canvas");
    // @ts-ignore
    return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

/** Three.js はクライアント限定 */
const ThreeHeroLazy = dynamic(() => import("./ThreeHero"), {
  ssr: false,
  loading: () => null,
});

/** 2枚のイメージで無限ラップ表示（translateY） */
type WrapRefs = { a: HTMLImageElement | null; b: HTMLImageElement | null; h: number };
function useWrap() {
  const refs = useRef<WrapRefs>({ a: null, b: null, h: 0 });
  const setH = (h: number) => (refs.current.h = h);
  const set = (y: number, dx: number) => {
    const { a, b, h } = refs.current;
    if (!a || !b || !h) return;
    const yk = ((y % h) + h) % h; // 0..h
    a.style.transform = `translate3d(${dx}px, ${yk}px, 0)`;
    b.style.transform = `translate3d(${dx}px, ${yk - h}px, 0)`;
  };
  return { refs, setH, set };
}

/** 共通スタイル（前景レイヤ用） */
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

/* ===================== Main ===================== */
export default function PortalClient() {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();

  const [webglOk, setWebglOk] = useState(false);
  const [threeHardError, setThreeHardError] = useState(false);
  const [skyUrl, setSkyUrl] = useState<string | undefined>();

  const heroRef = useRef<HTMLElement | null>(null);

  // 前景：各ラップ
  const rays = useWrap();
  const far = useWrap();
  const mid = useWrap();
  const near = useWrap();
  const flareWide = useWrap();
  const flareCore = useWrap();

  // 3D ロゴ用
  const [scrollY, setScrollY] = useState(0);

  // ヒーローの top/可視判定（前景/ロゴは fixed で追従）
  const [heroTop, setHeroTop] = useState(0);
  const [heroOnScreen, setHeroOnScreen] = useState(true);

  useEffect(() => {
    pickFirstReachable(ASSETS.sky).then(setSkyUrl);
    setWebglOk(canUseWebGL());
  }, []);

  useEffect(() => {
    if (!heroRef.current) return;

    const motionScale = reduced ? 0.15 : 1;
    const driftPhase = Math.random() * Math.PI * 2;

    const updateRect = () => {
      const r = heroRef.current!.getBoundingClientRect();
      setHeroTop(Math.max(0, r.top));
      setHeroOnScreen(r.bottom > 0 && r.top < window.innerHeight);
      const h = heroRef.current!.clientHeight;
      [rays, far, mid, near, flareWide, flareCore].forEach((w) => w.setH(h * 1.04));
    };

    let mx = 0, tmx = 0;
    const lerp = (a: number, b: number, n: number) => a + (b - a) * n;

    let lastT = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(1 / 30, (now - lastT) / 1000);
      lastT = now;

      const y = window.scrollY || 0;
      setScrollY(y);

      // 縦パララックス
      rays.set(y * CFG.speedY.rays * motionScale, 0);
      far.set(y * CFG.speedY.far * motionScale, 0);
      mid.set(y * CFG.speedY.mid * motionScale, 0);
      near.set(y * CFG.speedY.near * motionScale, 0);
      flareWide.set(y * CFG.speedY.flareWide * motionScale, 0);
      flareCore.set(y * CFG.speedY.flareCore * motionScale, 0);

      // 水平ドリフト（生っぽさ）
      const t = now / 1000;
      const driftFar  = Math.sin(t * CFG.drift.far.freq  + driftPhase) * CFG.drift.far.amp;
      const driftMid  = Math.sin(t * CFG.drift.mid.freq  + driftPhase * 1.3) * CFG.drift.mid.amp;
      const driftNear = Math.sin(t * CFG.drift.near.freq + driftPhase * 1.7) * CFG.drift.near.amp;

      // マウス/ジャイロの水平
      tmx = lerp(tmx, mx, 1 - Math.pow(0.001, dt * 60)); // dt 補正した滑らかさ

      // 合成
      rays.set(y * CFG.speedY.rays * motionScale, tmx * 0.3);
      far.set(y * CFG.speedY.far * motionScale,  tmx * 0.5 + driftFar);
      mid.set(y * CFG.speedY.mid * motionScale,  tmx * 0.7 + driftMid);
      near.set(y * CFG.speedY.near * motionScale, tmx * 1.0 + driftNear);
      flareWide.set(y * CFG.speedY.flareWide * motionScale, tmx * 0.4);
      flareCore.set(y * CFG.speedY.flareCore * motionScale, tmx * 0.6);

      requestAnimationFrame(tick);
    };

    const onPointer = (e: PointerEvent) => {
      const w = window.innerWidth || 1;
      mx = ((e.clientX - w / 2) / w) * CFG.tiltMaxX;
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null) return;
      mx = (e.gamma / 45) * (CFG.tiltMaxX * 0.8);
    };

    updateRect();
    const id = requestAnimationFrame(tick);
    window.addEventListener("scroll", updateRect, { passive: true });
    window.addEventListener("resize", updateRect);
    if (!reduced) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("deviceorientation", onOrient as any, { passive: true });
    }
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", updateRect);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("deviceorientation", onOrient as any);
    };
  }, [reduced]);

  const use2D = reduced || !webglOk || threeHardError;
  const heroHeight = isMobile ? CFG.heroH.mobile : CFG.heroH.desktop;

  // ===== コピーのフェードイン（雲っぽい描画） =====
  const [msgProgress, setMsgProgress] = useState(0);
  const msgRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onScroll = () => {
      if (!msgRef.current) return;
      const r = msgRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = 1 - Math.min(1, Math.max(0, (r.top - vh * 0.2) / (vh * 0.8)));
      setMsgProgress(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="relative min-h-[300vh] text-neutral-200">
      {/* ===== 背景（空）だけを置く土台 ===== */}
      <section
        ref={heroRef}
        className="relative overflow-hidden"
        style={{
          height: heroHeight,
          backgroundImage: skyUrl ? `url("${skyUrl + Q}")` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: Z.BACK,
          isolation: "isolate",
        }}
      />

      {/* ===== 前景：雲・光（ロゴより下） ===== */}
      {heroOnScreen && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            left: 0,
            top: heroTop,
            width: "100%",
            height: heroHeight,
            zIndex: Z.FRONT,
            pointerEvents: "none",
          }}
        >
          {/* 光 */}
          <img ref={(el) => (flareWide.refs.current.a = el)} src={ASSETS.flareWide + Q} alt="" style={wrapStyle(3, { mixBlendMode: "screen", opacity: 0.5 })} />
          <img ref={(el) => (flareWide.refs.current.b = el)} src={ASSETS.flareWide + Q} alt="" style={wrapStyle(3, { mixBlendMode: "screen", opacity: 0.5 })} />
          <img ref={(el) => (flareCore.refs.current.a = el)} src={ASSETS.flareCore + Q} alt="" style={wrapStyle(4, { mixBlendMode: "screen", opacity: 0.65 })} />
          <img ref={(el) => (flareCore.refs.current.b = el)} src={ASSETS.flareCore + Q} alt="" style={wrapStyle(4, { mixBlendMode: "screen", opacity: 0.65 })} />
          <img ref={(el) => (rays.refs.current.a = el)} src={ASSETS.rays + Q} alt="" style={wrapStyle(2, { opacity: 0.9 })} />
          <img ref={(el) => (rays.refs.current.b = el)} src={ASSETS.rays + Q} alt="" style={wrapStyle(2, { opacity: 0.9 })} />

          {/* 雲（遠→近） */}
          <img ref={(el) => (far.refs.current.a = el)}  src={ASSETS.far + Q}  alt="" style={wrapStyle(5, { opacity: 0.95 })} />
          <img ref={(el) => (far.refs.current.b = el)}  src={ASSETS.far + Q}  alt="" style={wrapStyle(5, { opacity: 0.95 })} />

          <img ref={(el) => (mid.refs.current.a = el)}  src={ASSETS.mid + Q}  alt="" style={wrapStyle(6, { opacity: 0.98 })} />
          <img ref={(el) => (mid.refs.current.b = el)}  src={ASSETS.mid + Q}  alt="" style={wrapStyle(6, { opacity: 0.98 })} />

          <img ref={(el) => (near.refs.current.a = el)} src={ASSETS.near + Q} alt="" style={wrapStyle(8)} />
          <img ref={(el) => (near.refs.current.b = el)} src={ASSETS.near + Q} alt="" style={wrapStyle(8)} />

          {/* 粒子ベール（控えめ） */}
          <div style={{
            position: "absolute",
            inset: 0,
            zIndex: 9,
            pointerEvents: "none",
            opacity: 0.18,
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,.06) 0 1px, transparent 1px), radial-gradient(circle at 80% 70%, rgba(255,255,255,.05) 0 1px, transparent 1px)",
            backgroundSize: "3px 3px, 3px 3px",
            mixBlendMode: "screen",
          }} />
        </div>
      )}

      {/* ===== 3D / 2D ロゴ（最前面） ===== */}
      {heroOnScreen && (!use2D ? (
        <div
          style={{ position: "fixed", left: 0, top: heroTop, width: "100%", height: heroHeight, zIndex: Z.LOGO, pointerEvents: "none" }}
          aria-hidden
        >
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
            position: "fixed",
            left: "50%",
            top: heroTop + heroHeight / 2,
            transform: "translate(-50%, -50%)",
            width: isMobile ? 220 : 340,
            height: "auto",
            zIndex: Z.LOGO,
            pointerEvents: "none",
            filter: "drop-shadow(0 10px 24px rgba(0,0,0,.45))",
            opacity: 0.98,
          }}
        />
      ))}

      {/* ===== COPY（雲みたいに浮く） ===== */}
      <section
        ref={msgRef}
        className="relative"
        style={{
          minHeight: "220vh",
          background:
            "linear-gradient(to bottom, rgba(6,10,18,1) 0, rgba(6,10,18,0) 35%, rgba(6,10,18,0) 65%, rgba(6,10,18,1) 100%)",
          zIndex: Z.BACK + 1,
        }}
      >
        <div
          className="sticky"
          style={{
            top: "18vh",
            height: "64vh",
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          {MESSAGES.map((m, i) => {
            const p = Math.min(1, Math.max(0, msgProgress * 1.3 - i * 0.42));
            const y = (1 - p) * 36;
            const blur = 8 * (1 - p);
            return (
              <div
                key={m.id}
                style={{
                  position: "absolute",
                  transform: `translate3d(0, ${y}px, 0)`,
                  opacity: 0.15 + p * 0.85,
                  transition: "opacity .25s linear, transform .25s linear",
                  filter: `drop-shadow(0 12px 20px rgba(0,0,0,.35)) blur(${blur}px)`,
                  mixBlendMode: "screen",
                }}
              >
                <div style={{
                  fontSize: "clamp(24px, 5vw, 62px)",
                  fontWeight: 800,
                  letterSpacing: ".04em",
                  textShadow: "0 0 24px rgba(255,255,255,.45), 0 0 48px rgba(255,255,255,.25)",
                }}>
                  {m.title}
                </div>
                <div style={{
                  opacity: .9,
                  marginTop: 12,
                  fontSize: "clamp(13px, 2.4vw, 18px)", // iPhone 小さめ
                  textShadow: "0 0 20px rgba(255,255,255,.4)",
                }}>
                  {m.body}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
