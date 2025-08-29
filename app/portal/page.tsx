// ==========================
// VOLCE Portal 完全版（最終）
// 2Dパララックス + 3Dロゴ（R3F）
// - 3Dはクライアントのみで実行（SSR/SSGで落ちない）
// - 画像は /public/portal/*.webp
// ==========================

// ===== FILE: app/portal/page.tsx =====
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// ★ 重要：/portal の静的プリレンダー無効化（保険）
export const dynamic = "force-dynamic"; // あるいは: export const revalidate = 0;

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
  style?: React.CSSProperties;
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
    glow: "drop-shadow(0 0 22px rgba(255,255,255,0.34)) drop-shadow(0 6px 26px rgba(0,0,0,0.65))",
  },
  clouds: {
    sky:  ["/portal/background2.webp" + Q, "/portal/1.webp" + Q, "/background2.webp" + Q],
    rays: ["/portal/rays.webp" + Q, "/rays.webp" + Q],
    far:  ["/portal/cloud_far.webp" + Q, "/cloud_far.webp" + Q],
    mid:  ["/portal/cloud_mid.webp" + Q, "/portal/cloud_mid2.webp" + Q, "/cloud_mid.webp" + Q],
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
  const farRef  = useRef<HTMLDivElement | null>(null);
  const midRef  = useRef<HTMLDivElement | null>(null);
  const nearRef = useRef<HTMLDivElement | null>(null);

  const [bgUrl, setBgUrl] = useState<string | undefined>(undefined);
  useEffect(() => { pickFirstReachable(CFG.clouds.sky).then(setBgUrl); }, []);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const onScroll = () => {
      raf = requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        if (raysRef.current) raysRef.current.style.transform = `translate3d(0, ${y * CFG.clouds.speed.rays}px, 0)`;
        if (farRef.current)  farRef.current .style.transform = `translate3d(0, ${y * CFG.clouds.speed.far }px, 0)`;
        if (midRef.current)  midRef.current .style.transform = `translate3d(0, ${y * CFG.clouds.speed.mid }px, 0)`;
        if (nearRef.current) nearRef.current.style.transform = `translate3d(0, ${y * CFG.clouds.speed.near}px, 0)`;
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
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#0a0f16] to-[#0b0f18]" aria-hidden />

      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0" style={{ opacity: CFG.clouds.opacity.sky }}>
          <ImgFallback sources={CFG.clouds.sky} alt="" />
        </div>
        <div ref={raysRef} className="absolute inset-0" style={{ opacity: CFG.clouds.opacity.rays as number, mixBlendMode: "screen" as any }}>
          <ImgFallback sources={CFG.clouds.rays} alt="" />
        </div>
        <div ref={farRef} className="absolute inset-0" style={{ opacity: CFG.clouds.opacity.far }}>
          <ImgFallback sources={CFG.clouds.far} alt="" />
        </div>
        <div ref={midRef} className="absolute inset-0" style={{ opacity: CFG.clouds.opacity.mid }}>
          <ImgFallback sources={CFG.clouds.mid} alt="" />
        </div>
        <div ref={nearRef} className="absolute inset-0" style={{ opacity: CFG.clouds.opacity.near }}>
          <ImgFallback sources={CFG.clouds.near} alt="" />
        </div>
      </div>

      {/* 3Dロゴ（WebGL & 非reduced の時だけ） */}
      {enable3D && !reduced && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <ThreeHeroLazy />
        </div>
      )}

      {/* 2Dフォールバック（省電力や非対応端末） */}
      {(!enable3D || reduced) && (
        <div
          className="absolute z-10 select-none"
          style={{
            left: CFG.logo.center.x,
            top:  CFG.logo.center.y,
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
              const next = CFG.logo.sources[Math.min(idx + 1, CFG.logo.sources.length - 1)];
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
        <div className="mx-auto max-w-3xl px-6 text-center transition-all duration-700 will-change-transform" style={{ opacity: 1, transform: "translateY(0)" }}>
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
    return !!(c.getContext("webgl") || c.getContext("experimental-webgl" as any));
  } catch {
    return false;
  }
}

/** 本文 */
export default function PortalPage() {
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


// ===== FILE: app/portal/ThreeHero.tsx =====
/* eslint-disable @next/next/no-img-element */
"use client";

import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { useMemo, useRef } from "react";

const SHA2 = (process.env.NEXT_PUBLIC_COMMIT_SHA || "").toString().slice(0, 8);
const Q2 = SHA2 ? `?v=${SHA2}` : "";

const CFG3 = { floatAmp: 0.28, floatSpd: 1.1, tiltAmp: { x: 0.18, y: 0.22 } } as const;

function ThreeLogo() {
  const group = useRef<THREE.Group>(null);
  const raysRef = useRef<THREE.Mesh>(null);

  const plane = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const makeMat = (url: string, transparent = true, blending?: THREE.Blending) => {
    const tex = new THREE.TextureLoader().load(url + Q2);
    tex.anisotropy = 8;
    return new THREE.MeshBasicMaterial({ map: tex, transparent, depthWrite: false, blending });
  };

  const logoMat = useMemo(() => makeMat("/portal/logo.webp", true), []);
  const raysMat = useMemo(() => makeMat("/portal/rays.webp", true, THREE.AdditiveBlending), []);

  useFrame(({ clock, mouse }) => {
    const t = clock.getElapsedTime();
    if (group.current) {
      group.current.position.y = Math.sin(t * CFG3.floatSpd) * CFG3.floatAmp;
      const tx = (mouse.y || 0) * CFG3.tiltAmp.x;
      const ty = (mouse.x || 0) * CFG3.tiltAmp.y;
      group.current.rotation.x += (tx - group.current.rotation.x) * 0.08;
      group.current.rotation.y += (-ty - group.current.rotation.y) * 0.08;
    }
    if (raysRef.current) {
      const mat = raysRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.45 + Math.sin(t * 1.2) * 0.08;
      raysRef.current.rotation.z = Math.sin(t * 0.3) * 0.05;
    }
  });

  return (
    <group ref={group} position={[0, 0.15, 0]}>
      <mesh ref={raysRef} position={[0, 0.25, 0]} scale={[3.2, 1.7, 1]} geometry={plane} material={raysMat} />
      <mesh position={[0, 0, 0.05]} scale={[2.4, 1.0, 1]} geometry={plane} material={logoMat} />
    </group>
  );
}

export default function ThreeHero() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 8.5], fov: 45 }}
      gl={{ alpha: true, antialias: true }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[2, 3, 4]} intensity={1.3} />
      <Environment preset="sunset" />
      <ThreeLogo />
    </Canvas>
  );
}

// ===== セットアップ・メモ =====
// 1) 依存（dependencies）に three / @react-three/fiber / @react-three/drei を追加
// 2) 画像は /public/portal/*.webp に配置（background2, cloud_far, cloud_mid, cloud_mid2, cloud_near, rays, logo）
// 3) Vercel で Redeploy > Clear build cache を有効にして再デプロイ
// 4) さらに軽くしたい場合は、ThreeHero の dpr を [1] に、あるいは rays のスケールを少し下げると良い