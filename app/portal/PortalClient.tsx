/* eslint-disable @next/next/no-img-element */
"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";

/** cache-busting */
const SHA = (process.env.NEXT_PUBLIC_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || "")
  .toString()
  .slice(0, 8);
const Q = SHA ? `?v=${SHA}` : "";

/** assets */
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

/** copy（必要なら好きに編集OK） */
const MESSAGES = [
  { id: "m1", title: "VOLCE",       body: "雲を抜け、はじまりへ。" },
  { id: "m2", title: "Gathering",   body: "仲間と、想いと、景色をひとつに。" },
  { id: "m3", title: "Into the Sky",body: "ここから上へ——物語のつづきへ。" },
] as const;

/** パラメータ */
const CFG = {
  heroH: { desktop: 760, mobile: 560 },
  // 縦主体：大きいほど速く流れる
  speed: {
    rays: 0.12,
    far: 0.18,
    mid: 0.32,
    mid2: 0.45,
    near: 0.70,
    flareWide: 0.50,
    flareCore: 0.62,
  },
  // 横ブレは最小限（px）
  tiltMaxX: 6,
} as const;

/* ===== hooks（ローカル完結） ===== */
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

/** 3Dロゴはクライアント限定 */
const ThreeHeroLazy = dynamic(() => import("./ThreeHero"), {
  ssr: false,
  loading: () => null,
});

/* ===== 2枚でラップ表示（無限スクロール風） ===== */
type WrapRefs = { a: HTMLImageElement | null; b: HTMLImageElement | null; h: number };
function useWrap() {
  const refs = useRef<WrapRefs>({ a: null, b: null, h: 0 });
  const setH = (h: number) => (refs.current.h = h);
  const setPos = (y: number) => {
    const { a, b, h } = refs.current;
    if (!a || !b || !h) return;
    const yk = ((y % h) + h) % h; // 0..h
    a.style.transform = `translate3d(0, ${yk}px, 0)`;
    b.style.transform = `translate3d(0, ${yk - h}px, 0)`;
  };
  return { refs, setH, setPos };
}

/* ===================== Main ===================== */
export default function PortalClient() {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();

  const [webglOk, setWebglOk] = useState(false);
  const [threeHardError, setThreeHardError] = useState(false);
  const [skyUrl, setSkyUrl] = useState<string | undefined>();

  // hero 高さ（ラップ高さに使う）
  const heroRef = useRef<HTMLElement | null>(null);

  // 各レイヤ（2枚でラップ）
  const rays = useWrap();
  const far = useWrap();
  const mid = useWrap();
  const mid2 = useWrap();
  const near = useWrap();
  const flareWide = useWrap();
  const flareCore = useWrap();

  // 3Dロゴ用のスクロール量
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    pickFirstReachable(ASSETS.sky).then(setSkyUrl);
    setWebglOk(canUseWebGL());
  }, []);

  // 縦主体パララックス & 横は控えめ
  useEffect(() => {
    if (!heroRef.current) return;
    const h = heroRef.current.clientHeight;
    [rays, far, mid, mid2, near, flareWide, flareCore].forEach((w) => w.setH(h * 1.04));

    const motionScale = reduced ? 0.15 : 1;

    let mx = 0;
    let tmx = 0;
    const lerp = (a: number, b: number, n: number) => a + (b - a) * n;

    const tick = () => {
      const y = window.scrollY || 0;
      setScrollY(y);

      // 縦：無限ラップ
      rays.setPos(y * CFG.speed.rays * motionScale);
      far.setPos(y * CFG.speed.far * motionScale);
      mid.setPos(y * CFG.speed.mid * motionScale);
      mid2.setPos(y * CFG.speed.mid2 * motionScale);
      near.setPos(y * CFG.speed.near * motionScale);
      flareWide.setPos(y * CFG.speed.flareWide * motionScale);
      flareCore.setPos(y * CFG.speed.flareCore * motionScale);

      // 横：控えめ（全レイヤ一律）
      tmx = lerp(tmx, mx, 0.08);
      const setX = (el: HTMLElement | null) => {
        if (!el) return;
        const ty = /translate3d\(0, ([^,]+), 0\)/.exec(el.style.transform)?.[1] ?? "0px";
        el.style.transform = `translate3d(${tmx}px, ${ty}, 0)`;
      };
      [rays, far, mid, mid2, near, flareWide, flareCore].forEach(({ refs }) => {
        setX(refs.current.a);
        setX(refs.current.b);
      });

      requestAnimationFrame(tick);
    };

    const onPointer = (e: PointerEvent) => {
      const w = window.innerWidth || 1;
      mx = ((e.clientX - w / 2) / w) * CFG.tiltMaxX; // 最大 6px
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

  // ===== コピーのフェードイン進行度 =====
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
      {/* ====== HERO（雲＆ロゴ） ====== */}
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
        {/* フレア／光（wrap） */}
        <img ref={(el) => (flareWide.refs.current.a = el)} src={ASSETS.flareWide + Q} alt="" style={wrapStyle(3, { mixBlendMode: "screen", opacity: 0.5 })} />
        <img ref={(el) => (flareWide.refs.current.b = el)} src={ASSETS.flareWide + Q} alt="" style={wrapStyle(3, { mixBlendMode: "screen", opacity: 0.5 })} />
        <img ref={(el) => (flareCore.refs.current.a = el)} src={ASSETS.flareCore + Q} alt="" style={wrapStyle(4, { mixBlendMode: "screen", opacity: 0.65 })} />
        <img ref={(el) => (flareCore.refs.current.b = el)} src={ASSETS.flareCore + Q} alt="" style={wrapStyle(4, { mixBlendMode: "screen", opacity: 0.65 })} />
        <img ref={(el) => (rays.refs.current.a = el)} src={ASSETS.rays + Q} alt="" style={wrapStyle(2, { opacity: 0.9 })} />
        <img ref={(el) => (rays.refs.current.b = el)} src={ASSETS.rays + Q} alt="" style={wrapStyle(2, { opacity: 0.9 })} />

        {/* 雲（wrap） */}
        <img ref={(el) => (far.refs.current.a = el)}  src={ASSETS.far + Q}  alt="" style={wrapStyle(5, { opacity: 0.92 })} />
        <img ref={(el) => (far.refs.current.b = el)}  src={ASSETS.far + Q}  alt="" style={wrapStyle(5, { opacity: 0.92 })} />
        <img ref={(el) => (mid.refs.current.a = el)}  src={ASSETS.mid + Q}  alt="" style={wrapStyle(6)} />
        <img ref={(el) => (mid.refs.current.b = el)}  src={ASSETS.mid + Q}  alt="" style={wrapStyle(6)} />
        <img ref={(el) => (mid2.refs.current.a = el)} src={ASSETS.mid2 + Q} alt="" style={wrapStyle(7)} />
        <img ref={(el) => (mid2.refs.current.b = el)} src={ASSETS.mid2 + Q} alt="" style={wrapStyle(7)} />
        <img ref={(el) => (near.refs.current.a = el)} src={ASSETS.near + Q} alt="" style={wrapStyle(8)} />
        <img ref={(el) => (near.refs.current.b = el)} src={ASSETS.near + Q} alt="" style={wrapStyle(8)} />

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

        {/* ロゴ：3D or 2D（ど真ん中固定） */}
        {!use2D ? (
          <div className="absolute inset-0 z-10 pointer-events-none">
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

        {/* 上下を締めるグラデ */}
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

      {/* ===== コピー（雲の上に浮かび上がる） ===== */}
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
                <div style={{ opacity: 0.85, marginTop: 10, fontSize: "clamp(14px, 2.6vw, 20px)" }}>
                  {m.body}
                </div>
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

/** 共通：2枚重ねラップ用スタイル */
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
