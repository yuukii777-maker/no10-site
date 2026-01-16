// components/AppleFloat.tsx
"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * AppleFloat
 * - 背景：オレンジ基調のグラデ + 渦(同心円)を超ゆっくり回転
 * - 粒子：2層の自走ドリフト + スクロール連動パララックス
 * - 光　：SVGによるボリューメトリックライト(右上→左下)
 * - みかん：上下フロート + スクロールでレンジ変化、やや左寄せ
 *
 * 画像は /mikan/hero/hero_orange_float.png を想定（透過推奨）
 */
export default function AppleFloat() {
  const orangeRef = useRef<HTMLDivElement>(null);
  const p1Ref = useRef<HTMLDivElement>(null);
  const p2Ref = useRef<HTMLDivElement>(null);

  // みかんの上下フロート + 粒子パララックス
  const cur = useRef(0), tgt = useRef(0), s = useRef(0);
  useEffect(() => {
    let raf = 0, t = 0;
    const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

    const onScroll = () => {
      const raw = Math.min(
        window.scrollY / Math.max(320, window.innerHeight * 0.9),
        1
      );
      s.current += (raw - s.current) * 0.07;
      tgt.current = easeOutCubic(s.current) * 28;

      // 粒子パララックス（遠景/近景）
      const y1 = window.scrollY * 0.10;
      const y2 = window.scrollY * 0.18;
      if (p1Ref.current) p1Ref.current.style.transform = `translate3d(0, ${y1}px, 0)`;
      if (p2Ref.current) p2Ref.current.style.transform = `translate3d(0, ${y2}px, 0)`;
    };

    const loop = () => {
      t += 0.016;
      cur.current += (tgt.current - cur.current) * 0.1;
      const float = Math.sin(t * 0.7) * 4;
      if (orangeRef.current) {
        orangeRef.current.style.transform =
          `translate(-50%,-50%) translateY(${cur.current + float}px) rotateZ(-8deg) rotateX(6deg)`;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    loop();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 h-[80svh] sm:h-[85svh] z-[20] isolate">
      {/* ベースのオレンジ背景 */}
      <div
        className="absolute inset-0 z-[0]"
        style={{
          background: `
            radial-gradient(140% 90% at 10% 95%, rgba(255,160,60,0.22) 0%, rgba(255,160,60,0) 55%),
            radial-gradient(160% 120% at 70% -10%, rgba(255,235,190,0.30) 0%, rgba(255,235,190,0) 60%),
            linear-gradient(180deg, #9a4d1f 0%, #b75b24 24%, #d8742d 50%, #e78a3b 72%, #eea45a 100%)
          `,
        }}
      />

      {/* 渦(同心円)を超ゆっくり回転 */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none animate-[af_spiral_80s_linear_infinite]"
        style={{
          background: `
            repeating-radial-gradient(
              circle at 72% 42%,
              rgba(255,255,255,0.05) 0px,
              rgba(255,255,255,0.05) 1px,
              transparent 1px,
              transparent 9px
            )
          `,
          filter: "contrast(110%) saturate(105%)",
        }}
      />

      {/* 粒子レイヤー（遠景） */}
      <div
        ref={p1Ref}
        className="absolute inset-0 z-[9] opacity-30 mix-blend-screen animate-[af_driftSlow_38s_linear_infinite]"
        style={{
          background:
            "repeating-radial-gradient(circle at 30% 20%, rgba(255,255,255,0.14) 0 1px, transparent 1px 8px), repeating-radial-gradient(circle at 70% 65%, rgba(255,240,180,0.12) 0 1px, transparent 1px 10px)",
          filter: "blur(0.6px)",
        }}
      />

      {/* 粒子レイヤー（近景） */}
      <div
        ref={p2Ref}
        className="absolute inset-0 z-[10] opacity-40 mix-blend-screen animate-[af_driftFast_28s_linear_infinite]"
        style={{
          background:
            "repeating-radial-gradient(circle at 60% 30%, rgba(255,255,255,0.20) 0 1.2px, transparent 1.2px 10px), repeating-radial-gradient(circle at 20% 80%, rgba(255,220,150,0.16) 0 1.2px, transparent 1.2px 12px)",
          filter: "blur(0.4px)",
        }}
      />

      {/* ボリューメトリック光（SVG） */}
      <VolumetricLight />

      {/* みかん背後のハロ */}
      <div
        className="absolute top-[60%] left-[62%] sm:left-[70%] -translate-x-1/2 -translate-y-1/2 z-[19] mix-blend-screen"
        style={{
          width: "clamp(520px, 60vw, 1200px)",
          height:"clamp(520px, 60vw, 1200px)",
          background:
            "radial-gradient(circle at 52% 50%, rgba(255,235,180,0.62) 0%, rgba(255,205,130,0.32) 36%, rgba(255,180,100,0.12) 56%, rgba(255,180,100,0.0) 76%)",
          filter: "blur(14px)",
        }}
      />

      {/* みかん本体（SPはやや左寄せ） */}
      <div
        ref={orangeRef}
        className="absolute top-[60%] left-[62%] sm:left-[70%] z-[20] transform-gpu will-change-transform"
        style={{
          width: "clamp(520px, 60vw, 1200px)",
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

      {/* みかんの縁の回り込み（立体感） */}
      <div
        className="absolute top-[62%] left-[58%] sm:left-[66%] -translate-x-1/2 -translate-y-1/2 z-[21] mix-blend-multiply"
        style={{
          width: "clamp(320px, 38vw, 900px)",
          height:"clamp(220px, 28vw, 640px)",
          background: "radial-gradient(80% 60% at 60% 40%, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(10px)",
          opacity: .45,
        }}
      />

      {/* 省エネ設定対応含む keyframes（このファイルに内包） */}
      <style jsx global>{`
        @keyframes af_spiral {
          0%   { transform: rotate(0deg) scale(1);   opacity:.95; }
          50%  { transform: rotate(180deg) scale(1.02); opacity:1; }
          100% { transform: rotate(360deg) scale(1);  opacity:.95; }
        }
        @keyframes af_driftSlow {
          0%   { transform: translate3d(0,0,0) }
          50%  { transform: translate3d(-1.2%, 0.8%, 0) }
          100% { transform: translate3d(0,0,0) }
        }
        @keyframes af_driftFast {
          0%   { transform: translate3d(0,0,0) }
          50%  { transform: translate3d(-2.0%, 1.4%, 0) }
          100% { transform: translate3d(0,0,0) }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-[af_spiral_80s_linear_infinite],
          .animate-[af_driftSlow_38s_linear_infinite],
          .animate-[af_driftFast_28s_linear_infinite] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

/* 体積光（SVG + ノイズ）*/
function VolumetricLight() {
  return (
    <svg
      className="absolute -top-[18%] -right-[8%] h-[190%] w-[85%] z-[18] rotate-[-22deg] origin-top-right"
      viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden
      style={{ mixBlendMode: "screen", filter: "blur(10px)" }}
    >
      <defs>
        <filter id="af_noise" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7"/>
          <feGaussianBlur stdDeviation="0.6"/>
          <feColorMatrix type="saturate" values="0.4"/>
        </filter>
        <linearGradient id="af_falloff" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0.18" stopColor="rgba(255,245,210,0)"/>
          <stop offset="0.23" stopColor="rgba(255,242,180,0.96)"/>
          <stop offset="0.28" stopColor="rgba(255,230,140,0.90)"/>
          <stop offset="0.42" stopColor="rgba(255,200,120,0)"/>
        </linearGradient>
        <mask id="af_cone">
          <polygon points="100,0 72,0 0,100 36,100" fill="url(#af_falloff)"/>
        </mask>
      </defs>

      <g mask="url(#af_cone)" filter="url(#af_noise)">
        <rect x="0" y="0" width="100" height="100" fill="url(#af_falloff)">
          <animate attributeName="x" from="0" to="-2" dur="22s" repeatCount="indefinite"/>
          <animate attributeName="y" from="0" to="1"  dur="22s" repeatCount="indefinite"/>
        </rect>
      </g>
      <g mask="url(#af_cone)">
        <rect x="0" y="0" width="100" height="100" fill="rgba(255,200,120,0.16)">
          <animate attributeName="opacity" values="0.16;0.26;0.16" dur="24s" repeatCount="indefinite"/>
        </rect>
      </g>
    </svg>
  );
}
