/* eslint-disable @next/next/no-img-element */
"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";

// cache-busting
const SHA = (process.env.NEXT_PUBLIC_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || "")
  .toString()
  .slice(0, 8);
const Q = SHA ? `?v=${SHA}` : "";

// assets
const ASSETS = {
  sky: ["/portal/background2.webp"],
  rays: "/portal/rays.webp",
  flareWide: "/portal/flare_wide.webp",
  flareCore: "/portal/flare_core.webp",
  far: "/portal/cloud_far.webp",
  mid: "/portal/cloud_mid.webp",
  mid2: "/portal/cloud_mid2.webp",
  near: "/portal/cloud_near.webp",
  logo: "/portal/logo.webp",
};

// config
const CFG = {
  heroH: { desktop: 760, mobile: 560 },
  speed: {
    rays: 0.12,
    far: 0.18,
    mid: 0.32,
    mid2: 0.45,
    near: 0.7,
    flareWide: 0.5,
    flareCore: 0.62,
    logo2D: 0.35,
  },
};

// ===== local hooks（このファイルだけで完結）=====
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
    return !!(c.getContext("webgl") || (c as any).getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

// 3Dはクライアント限定で読み込み
const ThreeHeroLazy = dynamic(() => import("./ThreeHero"), { ssr: false, loading: () => null });

// ローカル境界（3Dエラー→2D退避）
class LocalBoundary extends React.Component<
  { onFail: () => void; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(p: any) {
    super(p);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children as any;
  }
}

const layerStyle = (z: number, more?: React.CSSProperties): React.CSSProperties => ({
  position: "absolute",
  inset: "-6% -4% -2% -4%",
  width: "108%",
  height: "104%",
  objectFit: "cover",
  zIndex: z,
  pointerEvents: "none",
  transform: "translate3d(0,0,0)",
  ...more,
});

// ===== Main =====
export default function PortalClient() {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();

  const [webglOk, setWebglOk] = useState(false);
  const [threeHardError, setThreeHardError] = useState(false);
  const [skyUrl, setSkyUrl] = useState<string | undefined>();

  // refs
  const raysRef = useRef<HTMLImageElement | null>(null);
  const farRef = useRef<HTMLImageElement | null>(null);
  const midRef = useRef<HTMLImageElement | null>(null);
  const mid2Ref = useRef<HTMLImageElement | null>(null);
  const nearRef = useRef<HTMLImageElement | null>(null);
  const flareWideRef = useRef<HTMLImageElement | null>(null);
  const flareCoreRef = useRef<HTMLImageElement | null>(null);
  const cssLogoRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    pickFirstReachable(ASSETS.sky).then(setSkyUrl);
    setWebglOk(canUseWebGL());
  }, []);

  // スクロール＋傾きパララックス
  useEffect(() => {
    const motionScale = reduced ? 0.15 : 1;

    let raf = 0;
    const setY = (el: HTMLElement | null, k: number, y: number) => {
      if (!el) return;
      const base = el.style.transform.replace(/translate3d\([^)]*\)/, "");
      el.style.transform = `translate3d(0, ${y * k * motionScale}px, 0)${base}`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        setY(raysRef.current,  CFG.speed.rays,      y);
        setY(farRef.current,   CFG.speed.far,       y);
        setY(midRef.current,   CFG.speed.mid,       y);
        setY(mid2Ref.current,  CFG.speed.mid2,      y);
        setY(nearRef.current,  CFG.speed.near,      y);
        setY(flareWideRef.current, CFG.speed.flareWide, y);
        setY(flareCoreRef.current, CFG.speed.flareCore, y);
        setY(cssLogoRef.current,   CFG.speed.logo2D,   y);
      });
    };

    let mx = 0, tmx = 0;
    const lerp = (a: number, b: number, n: number) => a + (b - a) * n;
    const applyTilt = () => {
      tmx = lerp(tmx, mx, 0.08);
      const setX = (el: HTMLElement | null, kx: number) => {
        if (!el) return;
        const ty = /translate3d\(0, ([^,]+), 0\)/.exec(el.style.transform)?.[1] ?? "0px";
        el.style.transform = `translate3d(${tmx * kx * motionScale}px, ${ty}, 0)`;
      };
      setX(raysRef.current, -8);
      setX(farRef.current, -10);
      setX(midRef.current, -14);
      setX(mid2Ref.current, -18);
      setX(nearRef.current, -24);
      setX(flareWideRef.current, -16);
      setX(flareCoreRef.current, -22);
      setX(cssLogoRef.current, -14);
      requestAnimationFrame(applyTilt);
    };

    const onPointer = (e: PointerEvent) => {
      const { innerWidth: w } = window;
      mx = ((e.clientX - w / 2) / w) * 40;
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null) return;
      mx = (e.gamma / 45) * 30;
    };

    if (!reduced) {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("deviceorientation", onOrient as any, { passive: true });
      onScroll();
      applyTilt();
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("deviceorientation", onOrient as any);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const use2D = reduced || !webglOk || threeHardError;

  return (
    <main className="relative min-h-screen text-neutral-200">
      <section
        id="portal-hero"
        className="relative overflow-hidden"
        style={{
          height: isMobile ? CFG.heroH.mobile : CFG.heroH.desktop,
          backgroundImage: skyUrl ? `url("${skyUrl + Q}")` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          isolation: "isolate",
        }}
      >
        {/* 光／フレア */}
        <img src={ASSETS.rays + Q}  alt="" ref={raysRef}  style={layerStyle(2, { opacity: 0.9 })} />
        <img src={ASSETS.flareWide + Q} alt="" ref={flareWideRef} style={layerStyle(3, { mixBlendMode: "screen", opacity: 0.5 })} />
        <img src={ASSETS.flareCore + Q} alt="" ref={flareCoreRef} style={layerStyle(4, { mixBlendMode: "screen", opacity: 0.65 })} />

        {/* 雲 */}
        <img src={ASSETS.far + Q}  alt="" ref={farRef}  style={layerStyle(5, { opacity: 0.9 })} />
        <img src={ASSETS.mid + Q}  alt="" ref={midRef}  style={layerStyle(6)} />
        <img src={ASSETS.mid2 + Q} alt="" ref={mid2Ref} style={layerStyle(7)} />
        <img src={ASSETS.near + Q} alt="" ref={nearRef} style={layerStyle(8)} />

        {/* 粒子のベール */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, zIndex: 9, pointerEvents: "none", opacity: 0.22,
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,.06) 0 1px, transparent 1px), radial-gradient(circle at 80% 70%, rgba(255,255,255,.05) 0 1px, transparent 1px)",
          backgroundSize: "3px 3px, 3px 3px", mixBlendMode: "screen",
        }} />

        {/* 3D or 2D ロゴ */}
        {!use2D ? (
          <LocalBoundary onFail={() => setThreeHardError(true)}>
            <div className="absolute inset-0 z-10 pointer-events-none">
              <ThreeHeroLazy
                // @ts-ignore
                deviceIsMobile={isMobile}
                onContextLost={() => setThreeHardError(true)}
                data-r3f="1"
              />
            </div>
          </LocalBoundary>
        ) : (
          <img
            ref={cssLogoRef}
            src={ASSETS.logo + Q}
            alt="VOLCE Logo"
            style={{
              position: "absolute",
              left: "50%",
              top: "48%",
              transform: "translate(-50%, -50%)",
              width: isMobile ? 220 : 320,
              height: "auto",
              zIndex: 10,
              pointerEvents: "none",
              filter: "drop-shadow(0 10px 24px rgba(0,0,0,.45))",
              opacity: 0.98,
            }}
          />
        )}

        {/* グラデーションで締める */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, zIndex: 12, pointerEvents: "none",
          background:
            "linear-gradient(to bottom, rgba(5,8,15,.55) 0%, rgba(5,8,15,0) 28%, rgba(5,8,15,0) 72%, rgba(5,8,15,.35) 100%)",
        }} />
      </section>

      <style jsx>{`
        #portal-hero img {
          user-select: none;
          -webkit-user-drag: none;
          will-change: transform, opacity;
        }
      `}</style>
    </main>
  );
}
