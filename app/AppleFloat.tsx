// components/AppleFloat.tsx
"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/* 神々しい放射光（縫い目なし）+ もや + 粒子 + 大きめみかん */
export default function AppleFloat() {
  const ref = useRef<HTMLDivElement>(null);
  const cur = useRef(0);
  const tgt = useRef(0);
  const s   = useRef(0);

  // 浮遊：スクロールでわずかに追従 + 自律揺れ
  useEffect(() => {
    let id = 0;
    let t = 0;
    const ease = (x: number) => 1 - Math.pow(1 - x, 3);

    const onScroll = () => {
      const heroRange = Math.max(300, window.innerHeight * 0.9);
      const raw = Math.min(window.scrollY / heroRange, 1);
      s.current += (raw - s.current) * 0.06;
      tgt.current = ease(s.current) * 28;
    };

    const loop = () => {
      t += 0.016;
      const float = Math.sin(t * 0.7) * 4;
      cur.current += (tgt.current - cur.current) * 0.1;

      if (ref.current) {
        ref.current.style.transform =
          `translate(-50%, -50%) translateY(${cur.current + float}px) rotateZ(-8deg) rotateX(6deg)`;
      }
      id = requestAnimationFrame(loop);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); loop();
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(id); };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 h-[80svh] sm:h-[85svh] z-[20] isolate">

      {/* === 放射ビーム（右上 => 左下） : 線が出ない版 === */}
      <div
        className="
          absolute -top-[10%] -right-[8%] z-[12]
          h-[160%] w-[60%] will-change-transform
          animate-[beamDrift_24s_linear_infinite]
          origin-top-right
          rotate-[-18deg]
          mix-blend-screen
        "
        style={{
          // 中芯（細く明るい）
          background:
            `
            linear-gradient(210deg,
              rgba(255,255,220,0.00) 18%,
              rgba(255,240,170,0.90) 22%,
              rgba(255,230,140,0.85) 26%,
              rgba(255,200,120,0.00) 35%
            ),
            /* 外側の柔らかい裾 */
            linear-gradient(210deg,
              rgba(255,200,120,0.00) 12%,
              rgba(255,200,120,0.20) 28%,
              rgba(255,200,120,0.00) 48%
            )
            `,
          filter: "blur(10px)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
        }}
      />

      {/* もや（全体になじませる） */}
      <div
        className="absolute inset-0 z-[11] will-change-transform animate-[haze_40s_linear_infinite]"
        style={{
          background:
            "radial-gradient(60% 40% at 18% 88%, rgba(255,170,60,0.12) 0%, rgba(255,170,60,0) 60%), radial-gradient(45% 30% at 70% 18%, rgba(255,240,170,0.10) 0%, rgba(255,240,170,0) 60%)",
          filter: "blur(10px)",
          mixBlendMode: "screen",
        }}
      />

      {/* 微粒子（控えめ） */}
      <div
        className="absolute inset-0 z-[11] opacity-55 will-change-transform animate-[stars_32s_linear_infinite]"
        style={{
          backgroundImage:
            "radial-gradient(2px 2px at 12% 28%, rgba(255,255,255,0.9) 40%, transparent 41%), radial-gradient(2px 2px at 36% 62%, rgba(255,255,255,0.75) 40%, transparent 41%), radial-gradient(2px 2px at 72% 24%, rgba(255,255,255,0.8) 40%, transparent 41%), radial-gradient(2px 2px at 86% 72%, rgba(255,255,255,0.8) 40%, transparent 41%)",
          backgroundRepeat: "repeat",
          backgroundSize: "420px 320px",
          mixBlendMode: "screen",
        }}
      />

      {/* 背後の円グロー（みかんの後ろ） */}
      <div
        className="
          absolute top-[60%] left-[70%] -translate-x-1/2 -translate-y-1/2 z-[13] opacity-75
        "
        style={{
          width: "clamp(300px, 40vw, 980px)",
          height: "clamp(300px, 40vw, 980px)",
          background:
            "radial-gradient(circle at center, rgba(255,200,120,0.60) 0%, rgba(255,200,120,0.28) 38%, rgba(255,200,120,0.10) 58%, rgba(255,200,120,0.0) 75%)",
          filter: "blur(12px)",
          mixBlendMode: "screen",
        }}
      />

      {/* みかん本体（さらに大きく） */}
      <div
        ref={ref}
        className="absolute top-[60%] left-[70%] z-[14] transform-gpu will-change-transform"
        style={{
          width: "clamp(300px, 36vw, 860px)",   // ← ここでサイズ調整（以前より拡大）
          filter:
            "drop-shadow(0 40px 70px rgba(120,70,20,0.28)) drop-shadow(0 120px 180px rgba(0,0,0,0.22))",
        }}
      >
        <Image
          src="/mikan/hero/hero_orange_float.png?v=20260116b"
          alt="浮遊するみかん"
          width={1400}
          height={1400}
          priority
          className="w-full h-auto brightness-[0.98] saturate-[0.96] select-none"
          sizes="(max-width: 640px) 90vw, 36vw"
        />
      </div>

      {/* keyframes */}
      <style jsx global>{`
        @keyframes beamDrift {
          0%   { transform: translate3d(0,0,0) rotate(-18deg) scale(1);   opacity:.95; }
          50%  { transform: translate3d(-1.5%,1.2%,0) rotate(-16deg) scale(1.05); opacity:1; }
          100% { transform: translate3d(0,0,0) rotate(-18deg) scale(1);   opacity:.95; }
        }
        @keyframes haze {
          0%   { transform: translate3d(0,0,0) scale(1); }
          50%  { transform: translate3d(-2%,1%,0) scale(1.03); }
          100% { transform: translate3d(0,0,0) scale(1); }
        }
        @keyframes stars {
          0%   { transform: translate3d(0,0,0); }
          50%  { transform: translate3d(-1%,0.5%,0); }
          100% { transform: translate3d(0,0,0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-[beamDrift_24s_linear_infinite],
          .animate-[haze_40s_linear_infinite],
          .animate-[stars_32s_linear_infinite] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
