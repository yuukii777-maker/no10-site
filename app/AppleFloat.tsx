// components/AppleFloat.tsx
"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/** みかん特大 + 浮遊 + 粒子パララックス + 自然なボリューメトリック光 */
export default function AppleFloat() {
  const orangeRef = useRef<HTMLDivElement>(null);
  const p1Ref = useRef<HTMLDivElement>(null);
  const p2Ref = useRef<HTMLDivElement>(null);

  // === 上下フロート（スクロールで速度レンジがじわっと変わる） ===
  const cur = useRef(0), tgt = useRef(0), s = useRef(0);
  useEffect(() => {
    let raf = 0, t = 0;
    const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

    const onScroll = () => {
      const raw = Math.min(
        window.scrollY / Math.max(320, window.innerHeight * 0.9),
        1
      );
      s.current += (raw - s.current) * 0.07;          // スクロール追従の滑らかさ
      tgt.current = easeOutCubic(s.current) * 28;     // 浮遊距離レンジ
      // 粒子パララックス（2層、速度差）
      const y1 = window.scrollY * 0.10;               // 遠景
      const y2 = window.scrollY * 0.18;               // 近景
      if (p1Ref.current) p1Ref.current.style.transform = `translate3d(0, ${y1}px, 0)`;
      if (p2Ref.current) p2Ref.current.style.transform = `translate3d(0, ${y2}px, 0)`;
    };

    const loop = () => {
      t += 0.016;
      cur.current += (tgt.current - cur.current) * 0.1;
      const float = Math.sin(t * 0.7) * 4;            // 自律のやわらかい上下
      if (orangeRef.current) {
        orangeRef.current.style.transform =
          `translate(-50%, -50%) translateY(${cur.current + float}px) rotateZ(-8deg) rotateX(6deg)`;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // 初期
    loop();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 h-[80svh] sm:h-[85svh] z-[20] isolate">
      {/* ==== 粒子（遠景）: 微小・遅い ==== */}
      <div
        ref={p1Ref}
        className="absolute inset-0 z-[9] opacity-30 mix-blend-screen animate-particlesDriftSlow"
        style={{
          background:
            "repeating-radial-gradient(circle at 30% 20%, rgba(255,255,255,0.14) 0 1px, transparent 1px 8px), repeating-radial-gradient(circle at 70% 65%, rgba(255,240,180,0.12) 0 1px, transparent 1px 10px)",
          filter: "blur(0.6px)",
        }}
      />

      {/* ==== 粒子（近景）: やや大きめ・速い ==== */}
      <div
        ref={p2Ref}
        className="absolute inset-0 z-[10] opacity-40 mix-blend-screen animate-particlesDriftFast"
        style={{
          background:
            "repeating-radial-gradient(circle at 60% 30%, rgba(255,255,255,0.20) 0 1.2px, transparent 1.2px 10px), repeating-radial-gradient(circle at 20% 80%, rgba(255,220,150,0.16) 0 1.2px, transparent 1.2px 12px)",
          filter: "blur(0.4px)",
        }}
      />

      {/* ==== ボリューメトリック光（右上→左下のコーン） ==== */}
      <VolumetricLight />

      {/* ==== 背後ハロ（にじみ） ==== */}
      <div
        className="absolute top-[60%] left-[62%] sm:left-[70%] -translate-x-1/2 -translate-y-1/2 z-[19] mix-blend-screen"
        style={{
          width: "clamp(520px, 60vw, 1200px)",
          height: "clamp(520px, 60vw, 1200px)",
          background:
            "radial-gradient(circle at 52% 50%, rgba(255,235,180,0.62) 0%, rgba(255,205,130,0.32) 36%, rgba(255,180,100,0.12) 56%, rgba(255,180,100,0.0) 76%)",
          filter: "blur(14px)",
        }}
      />

      {/* ==== みかん本体（左寄せ 済） ==== */}
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

      {/* ==== オクルージョン（縁の回り込み・みかんの立体感） ==== */}
      <div
        className="absolute top-[62%] left-[58%] sm:left-[66%] -translate-x-1/2 -translate-y-1/2 z-[21] mix-blend-multiply"
        style={{
          width: "clamp(320px, 38vw, 900px)",
          height: "clamp(220px, 28vw, 640px)",
          background:
            "radial-gradient(80% 60% at 60% 40%, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(10px)",
          opacity: 0.45,
        }}
      />

      {/* ==== keyframes（全体） ==== */}
      <style jsx global>{`
        /* 粒子のゆらぎ（自走） */
        @keyframes driftSlow {
          0%   { transform: translate3d(0,0,0) }
          50%  { transform: translate3d(-1.2%, 0.8%, 0) }
          100% { transform: translate3d(0,0,0) }
        }
        @keyframes driftFast {
          0%   { transform: translate3d(0,0,0) }
          50%  { transform: translate3d(-2.0%, 1.4%, 0) }
          100% { transform: translate3d(0,0,0) }
        }
        .animate-particlesDriftSlow { animation: driftSlow 38s linear infinite; }
        .animate-particlesDriftFast { animation: driftFast 28s linear infinite; }

        /* 省エネ設定のときは停止 */
        @media (prefers-reduced-motion: reduce) {
          .animate-particlesDriftSlow,
          .animate-particlesDriftFast { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

/** 自然なボリューメトリック光（SVG + ノイズ）。mix-blend-screen で背景に溶け込む */
function VolumetricLight() {
  return (
    <svg
      className="absolute -top-[18%] -right-[8%] h-[190%] w-[85%] z-[18] rotate-[-22deg] origin-top-right"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
      style={{ mixBlendMode: "screen", filter: "blur(10px)" }}
    >
      <defs>
        <filter id="noise" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
          <feGaussianBlur stdDeviation="0.6" />
          <feColorMatrix type="saturate" values="0.4" />
        </filter>
        <linearGradient id="falloff" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0.18" stopColor="rgba(255,245,210,0)" />
          <stop offset="0.23" stopColor="rgba(255,242,180,0.96)" />
          <stop offset="0.28" stopColor="rgba(255,230,140,0.90)" />
          <stop offset="0.42" stopColor="rgba(255,200,120,0)" />
        </linearGradient>
        <mask id="cone">
          <polygon points="100,0 72,0 0,100 36,100" fill="url(#falloff)" />
        </mask>
      </defs>

      {/* ノイズで体積感、ゆっくりドリフト */}
      <g mask="url(#cone)" filter="url(#noise)">
        <rect x="0" y="0" width="100" height="100" fill="url(#falloff)">
          <animate attributeName="x" from="0" to="-2" dur="22s" repeatCount="indefinite" />
          <animate attributeName="y" from="0" to="1" dur="22s" repeatCount="indefinite" />
        </rect>
      </g>
      {/* 全体の明滅（ほんのり） */}
      <g mask="url(#cone)">
        <rect x="0" y="0" width="100" height="100" fill="rgba(255,200,120,0.16)">
          <animate attributeName="opacity" values="0.16;0.26;0.16" dur="24s" repeatCount="indefinite" />
        </rect>
      </g>
    </svg>
  );
}
