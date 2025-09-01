/* app/portal/PortalClient.tsx */
/* eslint-disable @next/next/no-img-element */
"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";

// ===== cache-busting =====
const SHA = (process.env.NEXT_PUBLIC_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || "")
  .toString()
  .slice(0, 8);
const Q = SHA ? `?v=${SHA}` : "";

// ===== assets =====
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
} as const;

// ===== copy（必要ならここを書き換え）=====
const MESSAGES = [
  { id: "m1", title: "VOLCE", body: "雲を抜け、はじまりへ。" },
  { id: "m2", title: "Gathering", body: "仲間と、想いと、景色をひとつに。" },
  { id: "m3", title: "Into the Sky", body: "ここから上へ——物語のつづきへ。" },
];

// ===== config =====
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
  tiltMaxX: 6, // 横ゆれは控えめ
} as const;

// ===== local hooks =====
function usePrefersReducedMotion() {
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

// ===== 3D（client only）=====
const ThreeHeroLazy = dynamic(() => import("./ThreeHero").then(m => ({ default: m.default })), {
  ssr: false,
  loading: () => null,
});

// ===== 2 枚ラップのためのユーティリティ =====
type WrapLayerRefs = { a: HTMLImageElement | null; b: HTMLImageElement | null; h: number };
function useWrapLayer() {
  const refs = useRef<WrapLayerRefs>({ a: null, b: null, h: 0 });
  const setH = (h: number) => (refs.current.h = h);
  const setPos = (y: number) => {
    const { a, b, h } = refs.current;
    if (!a || !b || !h) return;
    const yk = ((y % h) + h) % h;
    a.style.transform = `translate3d(0, ${yk}px, 0)`;
    b.style.transform = `translate3d(0, ${yk - h}px, 0)`;
  };
  return { refs, setH, setPos };
}

export default function PortalClient() {
  const reduced = usePrefersReducedMotion();
  const isMobile = useIsMobile();

  const [webglOk, setWebglOk] = useState(false);
  const [threeHardError, setThreeHardError] = useState(false);
  const [skyUrl, setSkyUrl] = useState<string | undefined>();

  const heroRef = useRef<HTMLElement | null>(null);
  const rays = useWrapLayer();
  const far = useWrapLayer();
  const mid = useWrapLayer();
  const mid2 = useWrapLayer();
  const near = useWrapLayer();
  const flareWide = useWrapLayer();
  const flareCore = useWrapLayer();

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    pickFirstReachable(ASSETS.sky).then(setSkyUrl);
    setWebglOk(canUseWebGL());
  }, []);

  // スクロール＆傾き
  useEffect(() => {
    if (!heroRef.current) return;
    const heroH = heroRef.current.clientHeight;
    [rays, far, mid, mid2, near, flareWide, flareCore].forEach((w) => w.setH(heroH * 1.04));

    const motionScale = reduced ? 0.15 : 1;

    let mx = 0, tmx = 0;
    const lerp = (a: number, b: number, n: number) => a + (b - a) * n;

    const tick = () => {
      const y = window.scrollY || 0;
      setScrollY(y);

      // 縦パララックス（ラップ）
      rays.setPos(y * CFG.speed.rays * motionScale);
      far.setPos(y * CFG.speed.far * motionScale);
      mid.setPos(y * CFG.speed.mid * motionScale);
      mid2.setPos(y * CFG.speed.mid2 * motionScale);
      near.setPos(y * CFG.speed.near * motionScale);
      flareWide.setPos(y * CFG.speed.flareWide * motionScale);
      flareCore.setPos(y * CFG.speed.flareCore * motionScale);

      // 横は控えめ
      tmx = lerp(tmx, mx, 0.08);
      const setX = (el: HTMLElement | null, kx: number) => {
        if (!el) return;
        const ty = /translate3d\(0, ([^,]+), 0\)/.exec(el.style.transform)?.[1] ?? "0px";
        el.style.transform = `translate3d(${kx}px, ${ty}, 0)`;
      };
      const fx = (k: number) => (CFG.tiltMaxX * k) / 100;
      [rays, far, mid, mid2, near, flareWide, flareCore].forEach((w, i) => {
        setX(w.refs.current.a, tmx * fx(-20 - i * 10));
        setX(w.refs.current.b, tmx * fx(-20 - i * 10));
      });

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

    const id = requestAnimationFrame(tick);
    if (!reduced) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("deviceorientation", onOrient as any, { passive: true });
    }
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("deviceorientation", onOrient as any);
    };
  }, [reduced]);

  const use2D = reduced || !webglOk || threeHardError;
  const heroHeight = isMobile ? CFG.heroH.mobile : CFG.heroH.desktop;

  // メッセージのフェードイン進捗
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
      {/* ===== HERO ===== */}
      <section
        ref={heroRef}
        className="relative overflow-hidden"
        style={{
          height: heroHeight,
          backgroundImage: skyUrl ? `url("${skyUrl + Q}")` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          isolation: "isolate",
        }}
      >
        {/* 光・フレア */}
        <WrapImg z={3} style={{ mixBlendMode: "screen", opacity: 0.5 }} src={ASSETS.flareWide + Q} layer={flareWide} />
        <WrapImg z={4} style={{ mixBlendMode: "screen", opacity: 0.65 }} src={ASSETS.flareCore + Q} layer={flareCore} />
        <WrapImg z={2} style={{ opacity: 0.9 }} src={ASSETS.rays + Q} layer={rays} />

        {/* 雲 */}
        <WrapImg z={5} style={{ opacity: 0.92 }} src={ASSETS.far + Q} layer={far} />
        <WrapImg z={6} src={ASSETS.mid + Q} layer={mid} />
        <WrapImg z={7} src={ASSETS.mid2 + Q} layer={mid2} />
        <WrapImg z={8} src={ASSETS.near + Q} layer={near} />

        {/* 粒子ベール（うっすら） */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 9,
            pointerEvents: "none",
            opacity: 0.22,
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,.06) 0 1px, transparent 1px), radial-gradient(circle at 80% 70%, rgba(255,255,255,.05) 0 1px, transparent 1px)",
            backgroundSize: "3px 3px, 3px 3px",
            mixBlendMode: "screen",
          }}
        />

        {/* 3D or 2D ロゴ（常にど真ん中） */}
        {!use2D ? (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <ThreeHeroLazy
              // @ts-ignore
              deviceIsMobile={isMobile}
              scrollY={scrollY}
              onContextLost={() => setThreeHardError(true)}
              data-r3f="1"
            />
          </div>
        ) : (
          <img
            src={ASSETS.logo + Q}
            alt="VOLCE Logo"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
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

        {/* 上下の締めグラデーション */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 12,
            pointerEvents: "none",
            background:
              "linear-gradient(to bottom, rgba(5,8,15,.55) 0%, rgba(5,8,15,0) 28%, rgba(5,8,15,0) 72%, rgba(5,8,15,.35) 100%)",
          }}
        />
      </section>

      {/* ===== COPY ===== */}
      <section
        ref={msgRef}
        className="relative"
        style={{
          minHeight: "220vh",
          background:
            "linear-gradient(to bottom, rgba(6,10,18,1) 0, rgba(6,10,18,0) 35%, rgba(6,10,18,0) 65%, rgba(6,10,18,1) 100%)",
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
            const y = (1 - p) * 32;
            return (
              <div
                key={m.id}
                style={{
                  position: "absolute",
                  transform: `translate3d(0, ${y}px, 0)`,
                  opacity: p,
                  transition: "opacity .25s linear, transform .25s linear",
                }}
              >
                <div style={{ fontSize: "clamp(24px, 5vw, 60px)", fontWeight: 800, letterSpacing: ".04em" }}>
                  {m.title}
                </div>
                <div style={{ opacity: 0.85, marginTop: 10, fontSize: "clamp(14px, 2.6vw, 20px)" }}>{m.body}</div>
              </div>
            );
          })}
        </div>
      </section>

      <style jsx>{`
        section img {
          user-select: none;
          -webkit-user-drag: none;
          will-change: transform, opacity;
        }
      `}</style>
    </main>
  );
}

function WrapImg({
  z,
  src,
  layer,
  style,
}: {
  z: number;
  src: string;
  layer: ReturnType<typeof useWrapLayer>;
  style?: React.CSSProperties;
}) {
  const common: React.CSSProperties = {
    position: "absolute",
    inset: "-6% -4% -2% -4%",
    width: "108%",
    height: "104%",
    objectFit: "cover",
    zIndex: z,
    pointerEvents: "none",
    transform: "translate3d(0,0,0)",
    ...style,
  };
  return (
    <>
      <img ref={(el) => (layer.refs.current.a = el)} src={src} alt="" style={common} />
      <img ref={(el) => (layer.refs.current.b = el)} src={src} alt="" style={common} />
    </>
  );
}
