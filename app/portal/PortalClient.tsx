/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";

/** ==== 強キャッシュ回避（コミットSHA） ==== */
const SHA = (process.env.NEXT_PUBLIC_COMMIT_SHA || "").toString().slice(0, 8);
const Q = SHA ? `?v=${SHA}` : "";

/** 画像フォールバック */
function ImgFallback({
  sources,
  className = "",
  alt = "",
  style,
  onLoad,
}: {
  sources: string[];
  className?: string;
  alt?: string;
  style?: CSSProperties;
  onLoad?: () => void;
}) {
  const [i, setI] = useState(0);
  const src = sources[Math.min(i, sources.length - 1)];
  return (
    <img
      src={src}
      loading="eager"
      decoding="async"
      onError={() => {
        console.warn("[ImgFallback] failed:", src);
        setI((v) => Math.min(v + 1, sources.length - 1));
      }}
      onLoad={onLoad}
      alt={alt}
      draggable={false}
      className={`absolute inset-0 w-full h-full object-cover select-none ${className}`}
      style={style}
    />
  );
}

/** 設定 */
const CFG = {
  heroH: "94vh",
  revealThreshold: 0.2,
  logo: {
    sources: ["/portal/logo.webp" + Q, "/portal/logo.png" + Q, "/logo.webp" + Q],
    width: 380,
    center: { x: "50%", y: "22vh" } as const,
    glow:
      "drop-shadow(0 0 22px rgba(255,255,255,0.34)) drop-shadow(0 6px 26px rgba(0,0,0,0.65))",
  },
  clouds: {
    sky: ["/portal/background2.webp" + Q, "/portal/1.webp" + Q, "/background2.webp" + Q],
    rays: ["/portal/rays.webp" + Q, "/rays.webp" + Q],
    far: ["/portal/cloud_far.webp" + Q, "/cloud_far.webp" + Q],
    mid: ["/portal/cloud_mid.webp" + Q, "/portal/cloud_mid2.webp" + Q, "/cloud_mid.webp" + Q],
    near: ["/portal/cloud_near.webp" + Q, "/cloud_near.webp" + Q],
    speed: { rays: 0.02, far: 0.05, mid: 0.1, near: 0.18 },
    opacity: { sky: 0.95, rays: 0.72, far: 0.45, mid: 0.62, near: 0.9 },
  },
} as const;

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const on = (e: MediaQueryListEvent) => setReduced(e.matches);
    m.addEventListener?.("change", on);
    return () => m.removeEventListener?.("change", on);
  }, []);
  return reduced;
}

function pickFirstReachable(urls: string[]): Promise<string | undefined> {
  return new Promise((resolve) => {
    let i = 0;
    const next = () => {
      if (i >= urls.length) return resolve(undefined);
      const url = urls[i++];
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => next();
      img.src = url;
    };
    next();
  });
}

/** 3Dロゴはクライアントだけで読ませる */
const ThreeHeroLazy = dynamic(() => import("./ThreeHero"), { ssr: false });

function CloudHero({ enable3D }: { enable3D: boolean }) {
  const reduced = useReducedMotion();
  const raysRef = useRef<HTMLDivElement | null>(null);
  const farRef = useRef<HTMLDivElement | null>(null);
  const midRef = useRef<HTMLDivElement | null>(null);
  const nearRef = useRef<HTMLDivElement | null>(null);

  const [bgUrl, setBgUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    pickFirstReachable(CFG.clouds.sky).then(setBgUrl);
  }, []);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const onScroll = () => {
      raf = requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        if (raysRef.current)
          raysRef.current.style.transform = `translate3d(0, ${y * CFG.clouds.speed.rays}px, 0)`;
        if (farRef.current)
          farRef.current.style.transform = `translate3d(0, ${y * CFG.clouds.speed.far}px, 0)`;
        if (midRef.current)
          midRef.current.style.transform = `translate3d(0, ${y * CFG.clouds.speed.mid}px, 0)`;
        if (nearRef.current)
          nearRef.current.style.transform = `translate3d(0, ${y * CFG.clouds.speed.near}px, 0)`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduced]);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        height: CFG.heroH,
        backgroundImage: bgUrl ? `url("${bgUrl}")` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#0a0f16] to-[#0b0f18]"
        aria-hidden
      />

      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0" style={{ opacity: CFG.clouds.opacity.sky }}>
          <ImgFallback sources={CFG.clouds.sky} alt="" />
        </div>
        <div
          ref={raysRef}
          className="absolute inset-0"
          style={{ opacity: CFG.clouds.opacity.rays as number, mixBlendMode: "screen" as any }}
        >
          <ImgFallback sources={CFG.clouds.rays} alt="" />
        </div>
        <div ref={farRef} className="absolute inset-0" style={{ opacity: CFG.clouds.opacity.far }}>
          <ImgFallback sources={CFG.clouds.far} alt="" />
        </div>
        <div ref={midRef} className="absolute inset-0" style={{ opacity: CFG.clouds.opacity.mid }}>
          <ImgFallback sources={CFG.clouds.mid} alt="" />
        </div>
        <div
          ref={nearRef}
          className="absolute inset-0"
          style={{ opacity: CFG.clouds.opacity.near }}
        >
          <ImgFallback sources={CFG.clouds.near} alt="" />
        </div>
      </div>

      {/* 3Dロゴ（WebGL & 非reduced の時だけ） */}
      {enable3D && !reduced && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <ThreeHeroLazy />
        </div>
      )}

      {/* 2Dフォールバック */}
      {(!enable3D || reduced) && (
        <div
          className="absolute z-10 select-none"
          style={{
            left: CFG.logo.center.x,
            top: CFG.logo.center.y,
            transform: "translate(-50%, -50%)",
            filter: CFG.logo.glow,
          }}
        >
          <img
            src={CFG.logo.sources[0]}
            onError={(e) => {
              const el = e.currentTarget;
              const rel = el.src.replace(location.origin, "");
              const idx = CFG.logo.sources.findIndex((s) => s === rel);
              const next =
                CFG.logo.sources[Math.min(idx + 1, CFG.logo.sources.length - 1)];
              if (next && next !== rel) el.src = next;
            }}
            alt="VOLCE Logo"
            width={CFG.logo.width}
            height={Math.round(CFG.logo.width * 0.35)}
            draggable={false}
            style={{ userSelect: "none" }}
          />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-10 md:bottom-16 z-10">
        <div
          className="mx-auto max-w-3xl px-6 text-center transition-all duration-700 will-change-transform"
          style={{ opacity: 1, transform: "translateY(0)" }}
        >
          <p className="text-white/90 text-base md:text-lg leading-relaxed">
            雲の上で集う、VOLCE。スクロールして、私たちの世界へ。
          </p>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-32 z-10 bg-gradient-to-b from-transparent to-black/60" />
    </section>
  );
}

function canUseWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl") || (c as any).getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

/** 本文 */
export default function PortalClient() {
  const [webgl, setWebgl] = useState(false);
  useEffect(() => setWebgl(canUseWebGL()), []);
  return (
    <main className="relative min-h-screen text-neutral-200">
      <CloudHero enable3D={webgl} />

      <section id="intro" className="mx-auto max-w-4xl px-5 py-16 md:py-24 scroll-mt-24">
        <h2 className="text-2xl md:text-3xl font-bold tracking-wide mb-4">VOLCE クラン紹介</h2>
        <p className="leading-relaxed text-white/85">
          VOLCE は、火力枠・エンジョイ枠・クリエイター/ライバー枠など、
          それぞれの強みを活かして成長していくクランです。イベント運営や配信連携も含め、
          誰もが参加しやすく、かつ本気で戦える環境を整えています。
        </p>
      </section>

      <section id="team" className="mx-auto max-w-6xl px-5 py-14 md:py-20 scroll-mt-24">
        <h3 className="text-xl md:text-2xl font-semibold mb-4">Team</h3>
        <p className="text-white/80 max-w-3xl">
          主要メンバーのビジュアル画像は現在オフライン。軽量化のため、背景の雲レイヤーのみを残したモードで運用中です。
        </p>
      </section>

      <section id="notice" className="mx-auto max-w-5xl px-5 pb-24 scroll-mt-24">
        <h3 className="text-xl md:text-2xl font-semibold mb-4">注意事項</h3>
        <ul className="list-disc pl-6 space-y-2 text-white/85">
          <li>参加規約・禁止事項を遵守してください。</li>
          <li>個人情報やアカウント共有に関するトラブルは当クランでは責任を負いかねます。</li>
          <li>イベントのルールは告知ページの最新情報を参照してください。</li>
        </ul>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/60">
        © {new Date().getFullYear()} VOLCE
      </footer>
    </main>
  );
}
