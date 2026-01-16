"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/** みかん大きめ + 自然なボリューメトリック光（SVG） */
export default function AppleFloat() {
  const ref = useRef<HTMLDivElement>(null);
  const cur = useRef(0), tgt = useRef(0), s = useRef(0);

  // 浮遊（スクロール追従＋微小ゆれ）
  useEffect(() => {
    let id = 0, t = 0;
    const ease = (x:number)=>1-Math.pow(1-x,3);
    const onScroll = () => {
      const raw = Math.min(window.scrollY / Math.max(300, window.innerHeight*0.9), 1);
      s.current += (raw - s.current) * 0.06;
      tgt.current = ease(s.current) * 28;
    };
    const loop = () => {
      t += 0.016;
      cur.current += (tgt.current - cur.current) * 0.1;
      const float = Math.sin(t*0.7)*4;
      if(ref.current){
        ref.current.style.transform =
          `translate(-50%,-50%) translateY(${cur.current+float}px) rotateZ(-8deg) rotateX(6deg)`;
      }
      id = requestAnimationFrame(loop);
    };
    window.addEventListener("scroll", onScroll, { passive:true });
    onScroll(); loop();
    return ()=>{ window.removeEventListener("scroll", onScroll); cancelAnimationFrame(id); };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 h-[80svh] sm:h-[85svh] z-[20] isolate">
      {/* Volumetric spotlight（右上→左下） */}
      <VolumetricLight />

      {/* 背後ハロ（にじみ） */}
      <div
        className="absolute top-[60%] left-[70%] -translate-x-1/2 -translate-y-1/2 z-[13] mix-blend-screen"
        style={{
          width: "clamp(420px, 50vw, 1100px)",
          height:"clamp(420px, 50vw, 1100px)",
          background:
            "radial-gradient(circle at 52% 50%, rgba(255,235,180,0.60) 0%, rgba(255,205,130,0.30) 36%, rgba(255,180,100,0.12) 56%, rgba(255,180,100,0.0) 76%)",
          filter: "blur(14px)"
        }}
      />

      {/* みかん本体（大きめ） */}
      <div
        ref={ref}
        className="absolute top-[60%] left-[70%] z-[14] transform-gpu will-change-transform"
        style={{
          width: "clamp(420px, 50vw, 1000px)", // ← ここで“2枚目”級の大きさ
          filter:
            "drop-shadow(0 40px 70px rgba(120,70,20,0.28)) drop-shadow(0 120px 180px rgba(0,0,0,0.22))",
        }}
      >
        <Image
          src="/mikan/hero/hero_orange_float.png?v=pro1"
          alt="浮遊するみかん"
          width={1700}
          height={1700}
          priority
          className="w-full h-auto brightness-[0.99] saturate-[0.96] select-none"
          sizes="(max-width: 640px) 95vw, 50vw"
        />
      </div>

      {/* みかんの手前で光を少し落とす（回り込み演出） */}
      <div
        className="absolute top-[62%] left-[66%] -translate-x-1/2 -translate-y-1/2 z-[15] mix-blend-multiply"
        style={{
          width: "clamp(260px, 32vw, 760px)",
          height:"clamp(180px, 24vw, 520px)",
          background: "radial-gradient(80% 60% at 60% 40%, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(10px)",
          opacity: .45
        }}
      />

      {/* 微粒子（最小限） */}
      <div
        className="absolute inset-0 z-[12] opacity-45 mix-blend-screen will-change-transform
                   animate-[motes_36s_linear_infinite]"
        style={{
          backgroundImage:
            "radial-gradient(2px 2px at 12% 28%, rgba(255,255,255,0.9) 40%, transparent 41%), radial-gradient(2px 2px at 36% 62%, rgba(255,255,255,0.75) 40%, transparent 41%), radial-gradient(2px 2px at 72% 24%, rgba(255,255,255,0.8) 40%, transparent 41%), radial-gradient(2px 2px at 86% 72%, rgba(255,255,255,0.8) 40%, transparent 41%)",
          backgroundRepeat: "repeat",
          backgroundSize: "420px 320px",
          filter: "blur(0.4px)"
        }}
      />

      <style jsx global>{`
        @keyframes motes { 0%{transform:translate3d(0,0,0)} 50%{transform:translate3d(-1.2%,0.8%,0)} 100%{transform:translate3d(0,0,0)} }
        @media (prefers-reduced-motion: reduce) { .animate-[motes_36s_linear_infinite]{ animation: none !important; } }
      `}</style>
    </div>
  );
}

/** 自然なボリューメトリック光（SVG + ノイズ） */
function VolumetricLight() {
  return (
    <svg
      className="absolute -top-[18%] -right-[8%] h-[190%] w-[85%] z-[12] rotate-[-22deg] origin-top-right"
      viewBox="0 0 100 100" preserveAspectRatio="none"
      aria-hidden
      style={{ mixBlendMode: "screen" }}
    >
      <defs>
        {/* ノイズで密度ムラ */}
        <filter id="noise" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="turb"/>
          <feGaussianBlur stdDeviation="0.6"/>
          <feColorMatrix type="saturate" values="0.4"/>
        </filter>
        {/* ウェッジ形 + 減衰 */}
        <linearGradient id="falloff" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0.18" stopColor="rgba(255,245,210,0)" />
          <stop offset="0.23" stopColor="rgba(255,242,180,0.95)" />
          <stop offset="0.28" stopColor="rgba(255,230,140,0.88)" />
          <stop offset="0.40" stopColor="rgba(255,200,120,0)" />
        </linearGradient>
        <mask id="cone">
          {/* ウェッジ（縫い目無し） */}
          <polygon points="100,0 72,0 0,100 36,100" fill="url(#falloff)"/>
        </mask>
      </defs>

      {/* ビーム本体：ノイズでムラ→ゆっくり流す */}
      <g mask="url(#cone)" filter="url(#noise)">
        <rect x="0" y="0" width="100" height="100" fill="url(#falloff)">
          <animate attributeName="x" from="0" to="-2" dur="22s" repeatCount="indefinite" />
          <animate attributeName="y" from="0" to=" 1" dur="22s" repeatCount="indefinite" />
        </rect>
      </g>

      {/* ふわっとした外側フェザー */}
      <g mask="url(#cone)">
        <rect x="0" y="0" width="100" height="100" fill="rgba(255,200,120,0.18)">
          <animate attributeName="opacity" values="0.18;0.28;0.18" dur="24s" repeatCount="indefinite"/>
        </rect>
      </g>
    </svg>
  );
}
