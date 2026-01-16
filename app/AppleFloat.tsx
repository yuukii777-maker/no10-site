"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/** みかん特大 + 自然なボリューメトリック光（確実に表示される構成） */
export default function AppleFloat() {
  const ref = useRef<HTMLDivElement>(null);
  const cur = useRef(0), tgt = useRef(0), s = useRef(0);

  // 浮遊（スクロール追従 + 微小ゆれ）
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
      {/* === 1) Volumetric spotlight（右上→左下）：mix-blend-screen で必ず見える === */}
      <VolumetricLight />

      {/* === 2) 背後ハロ（にじみ） === */}
      <div
        className="absolute top-[60%] left-[70%] -translate-x-1/2 -translate-y-1/2
                   z-[19] mix-blend-screen"
        style={{
          width: "clamp(520px, 60vw, 1200px)",
          height:"clamp(520px, 60vw, 1200px)",
          background:
            "radial-gradient(circle at 52% 50%, rgba(255,235,180,0.62) 0%, rgba(255,205,130,0.32) 36%, rgba(255,180,100,0.12) 56%, rgba(255,180,100,0.0) 76%)",
          filter: "blur(14px)"
        }}
      />

      {/* === 3) みかん本体（さらに大きく） === */}
      <div
        ref={ref}
        className="absolute top-[60%] left-[70%] z-[20] transform-gpu will-change-transform"
        style={{
          width: "clamp(520px, 60vw, 1200px)", // ← “二枚目”級まで拡大
          filter:
            "drop-shadow(0 40px 70px rgba(120,70,20,0.28)) drop-shadow(0 120px 180px rgba(0,0,0,0.22))",
        }}
      >
        <Image
          src="/mikan/hero/hero_orange_float.png?v=pro2"
          alt="浮遊するみかん"
          width={1900}
          height={1900}
          priority
          className="w-full h-auto brightness-[0.99] saturate-[0.96] select-none"
          sizes="(max-width: 640px) 95vw, 60vw"
        />
      </div>

      {/* === 4) オクルージョン：縁の回り込みを出す === */}
      <div
        className="absolute top-[62%] left-[66%] -translate-x-1/2 -translate-y-1/2
                   z-[21] mix-blend-multiply"
        style={{
          width: "clamp(320px, 38vw, 900px)",
          height:"clamp(220px, 28vw, 640px)",
          background: "radial-gradient(80% 60% at 60% 40%, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(10px)",
          opacity: .45
        }}
      />
    </div>
  );
}

/** 自然なボリューメトリック光（SVG + ノイズ）。z-index:18 前面に出すため mix-blend-screen */
function VolumetricLight() {
  return (
    <svg
      className="absolute -top-[18%] -right-[8%] h-[190%] w-[85%] z-[18]
                 rotate-[-22deg] origin-top-right"
      viewBox="0 0 100 100" preserveAspectRatio="none"
      aria-hidden
      style={{ mixBlendMode: "screen", filter: "blur(10px)" }}
    >
      <defs>
        <filter id="noise" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7"/>
          <feGaussianBlur stdDeviation="0.6"/>
          <feColorMatrix type="saturate" values="0.4"/>
        </filter>
        <linearGradient id="falloff" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0.18" stopColor="rgba(255,245,210,0)" />
          <stop offset="0.23" stopColor="rgba(255,242,180,0.96)" />
          <stop offset="0.28" stopColor="rgba(255,230,140,0.90)" />
          <stop offset="0.42" stopColor="rgba(255,200,120,0)" />
        </linearGradient>
        <mask id="cone">
          <polygon points="100,0 72,0 0,100 36,100" fill="url(#falloff)"/>
        </mask>
      </defs>

      <g mask="url(#cone)" filter="url(#noise)">
        <rect x="0" y="0" width="100" height="100" fill="url(#falloff)">
          <animate attributeName="x" from="0" to="-2" dur="22s" repeatCount="indefinite" />
          <animate attributeName="y" from="0" to=" 1" dur="22s" repeatCount="indefinite" />
        </rect>
      </g>
      <g mask="url(#cone)">
        <rect x="0" y="0" width="100" height="100" fill="rgba(255,200,120,0.16)">
          <animate attributeName="opacity" values="0.16;0.26;0.16" dur="24s" repeatCount="indefinite"/>
        </rect>
      </g>
    </svg>
  );
}
