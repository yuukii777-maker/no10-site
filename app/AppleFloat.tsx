// components/AppleFloat.tsx
"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";

export default function AppleFloat() {
  const ref = useRef<HTMLDivElement>(null);
  const cur = useRef(0), tgt = useRef(0), s = useRef(0);

  useEffect(() => {
    let id = 0, t = 0;
    const ease = (x: number) => 1 - Math.pow(1 - x, 3);
    const onScroll = () => {
      const raw = Math.min(window.scrollY / Math.max(300, window.innerHeight * 0.9), 1);
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
      {/* ===== Volumetric beam（自然な放射、縫い目なし） ===== */}
      <div
        className="absolute -top-[18%] -right-[10%] h-[180%] w-[80%] z-[12]
                   origin-top-right rotate-[-22deg]
                   will-change-transform animate-[beamDrift_26s_linear_infinite]
                   mix-blend-screen"
        style={{
          // 中芯＋外側ぼかしを2層で
          background: `
            linear-gradient(210deg,
              rgba(255,248,220,0.00) 20%,
              rgba(255,242,180,0.92) 23%,
              rgba(255,230,140,0.88) 28%,
              rgba(255,200,120,0.00) 38%
            ),
            linear-gradient(210deg,
              rgba(255,200,120,0.00) 16%,
              rgba(255,200,120,0.22) 30%,
              rgba(255,200,120,0.00) 50%
            )
          `,
          // “三角の切れ目”を作らないよう幅広ウェッジをクリップして大きめにブラー
          clipPath: "polygon(100% 0%, 70% 0%, 0% 100%, 35% 100%)",
          filter: "blur(18px)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}
      />

      {/* ゴボ（ムラ） */}
      <div
        className="absolute inset-0 z-[12] opacity-35
                   will-change-transform animate-[gobo_40s_linear_infinite]
                   mix-blend-screen"
        style={{
          background:
            "repeating-radial-gradient(circle at 70% 20%, rgba(255,255,255,0.18) 0 1px, transparent 1px 8px), repeating-linear-gradient(125deg, rgba(255,255,255,0.10) 0 2px, transparent 2px 14px)",
          filter: "blur(6px)",
        }}
      />

      {/* もや（全体を馴染ませる） */}
      <div
        className="absolute inset-0 z-[11] will-change-transform animate-[haze_40s_linear_infinite]"
        style={{
          background:
            "radial-gradient(60% 40% at 18% 88%, rgba(255,170,60,0.12) 0%, rgba(255,170,60,0) 60%), radial-gradient(45% 30% at 70% 18%, rgba(255,240,170,0.10) 0%, rgba(255,240,170,0) 60%)",
          filter: "blur(10px)",
          mixBlendMode: "screen",
        }}
      />

      {/* みかん後ろの円グロー */}
      <div
        className="absolute top-[60%] left-[70%] -translate-x-1/2 -translate-y-1/2 z-[13] opacity-70"
        style={{
          width: "clamp(320px, 42vw, 980px)",
          height: "clamp(320px, 42vw, 980px)",
          background:
            "radial-gradient(circle at center, rgba(255,205,130,0.62) 0%, rgba(255,200,120,0.30) 36%, rgba(255,200,120,0.12) 56%, rgba(255,200,120,0.0) 76%)",
          filter: "blur(12px)",
          mixBlendMode: "screen",
        }}
      />

      {/* オクルージョン（みかん近辺でビームを少し落とす） */}
      <div
        className="absolute top-[62%] left-[66%] -translate-x-1/2 -translate-y-1/2 z-[13]"
        style={{
          width: "clamp(240px, 32vw, 760px)",
          height: "clamp(160px, 22vw, 520px)",
          background:
            "radial-gradient(80% 60% at 60% 40%, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.0) 70%)",
          filter: "blur(10px)",
          mixBlendMode: "multiply",
          opacity: 0.45,
        }}
      />

      {/* みかん（大きめ） */}
      <div
        ref={ref}
        className="absolute top-[60%] left-[70%] z-[14] transform-gpu will-change-transform"
        style={{
          width: "clamp(340px, 40vw, 900px)",
          filter:
            "drop-shadow(0 40px 70px rgba(120,70,20,0.28)) drop-shadow(0 120px 180px rgba(0,0,0,0.22))",
        }}
      >
        <Image
          src="/mikan/hero/hero_orange_float.png?v=20260116c"
          alt="浮遊するみかん"
          width={1600}
          height={1600}
          priority
          className="w-full h-auto brightness-[0.985] saturate-[0.95] select-none"
          sizes="(max-width: 640px) 90vw, 40vw"
        />
      </div>

      {/* keyframes */}
      <style jsx global>{`
        @keyframes beamDrift {
          0%   { transform: translate3d(0,0,0) rotate(-22deg) scale(1); opacity:.95; }
          50%  { transform: translate3d(-1.4%,1.2%,0) rotate(-20deg) scale(1.04); opacity:1; }
          100% { transform: translate3d(0,0,0) rotate(-22deg) scale(1); opacity:.95; }
        }
        @keyframes haze {
          0%   { transform: translate3d(0,0,0) scale(1); }
          50%  { transform: translate3d(-2%,1%,0) scale(1.03); }
          100% { transform: translate3d(0,0,0) scale(1); }
        }
        @keyframes gobo {
          0%   { transform: translate3d(0,0,0) }
          50%  { transform: translate3d(-1.2%,0.8%,0) }
          100% { transform: translate3d(0,0,0) }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-[beamDrift_26s_linear_infinite],
          .animate-[haze_40s_linear_infinite],
          .animate-[gobo_40s_linear_infinite] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
