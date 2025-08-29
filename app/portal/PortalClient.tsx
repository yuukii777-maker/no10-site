/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";

// ……（省略：ImgFallback, CFG, useReducedMotion, pickFirstReachable などはそのままでOK）……

/** 3Dロゴはクライアントだけで読ませる（失敗はログに出す） */
const ThreeHeroLazy = dynamic(() => import("./ThreeHero"), {
  ssr: false,
  // 読み込み中は何も出さない（お好みでスケルトンにしてOK）
  loading: () => null,
});

function CloudHero({ enable3D }: { enable3D: boolean }) {
  const reduced = useReducedMotion();
  const raysRef = useRef<HTMLDivElement | null>(null);
  const farRef = useRef<HTMLDivElement | null>(null);
  const midRef = useRef<HTMLDivElement | null>(null);
  const nearRef = useRef<HTMLDivElement | null>(null);

  const [bgUrl, setBgUrl] = useState<string | undefined>(undefined);
  useEffect(() => { pickFirstReachable(CFG.clouds.sky).then(setBgUrl); }, []);

  // デバッグログ（フラグがどうなってるか）
  useEffect(() => {
    console.log("[portal] flags", { enable3D, reduced });
  }, [enable3D, reduced]);

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
      {/* …雲レイヤーの画像は現状のままでOK… */}

      {/* 3Dロゴ（WebGL & 非reduced の時だけ） */}
      {enable3D && !reduced && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <ThreeHeroLazy />
        </div>
      )}

      {/* 2Dフォールバック（省略） */}
      {/* ……省略…… */}
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
  useEffect(() => {
    const ok = canUseWebGL();
    console.log("[portal] webgl?", ok);
    setWebgl(ok);
  }, []);
  return (
    <main className="relative min-h-screen text-neutral-200">
      <CloudHero enable3D={webgl} />
      {/* ……以下、本文そのままでOK…… */}
    </main>
  );
}
