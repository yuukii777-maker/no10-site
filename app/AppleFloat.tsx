// components/AppleFloat.tsx
"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/* 浮遊みかん + パルス発光（GOGO風） */
export default function AppleFloat() {
  const orangeRef = useRef<HTMLDivElement>(null);
  const [isSP, setIsSP] = useState(false);

  // SP判定
  useEffect(() => {
    const on = () => setIsSP(window.innerWidth < 640);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);

  // スクロール追従 + 自律揺れ（控えめ）
  const curY = useRef(0);
  const tgtY = useRef(0);
  const smooth = useRef(0);

  useEffect(() => {
    let raf = 0;
    let t = 0;
    const ease = (x: number) => 1 - Math.pow(1 - x, 3);

    const onScroll = () => {
      const range = Math.max(300, window.innerHeight * 0.9);
      const raw = Math.min(window.scrollY / range, 1);
      smooth.current += (raw - smooth.current) * 0.06;
      tgtY.current = ease(smooth.current) * 28;
    };

    const loop = () => {
      t += 0.016;
      const float = Math.sin(t * 0.7) * (isSP ? 3 : 4);
      curY.current += (tgtY.current - curY.current) * 0.1;

      if (orangeRef.current) {
        orangeRef.current.style.transform =
          `translate(-50%, -50%) translateY(${curY.current + float}px) rotateZ(-8deg) rotateX(6deg)`;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    loop();
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, [isSP]);

  return (
    <div className="pointer-events-none absolute inset-0 h-[80svh] sm:h-[85svh] z-[20] isolate">
      {/* 1) パルス発光（GOGO風） */}
      <div
        className="
          absolute top-[60%] left-[70%] -translate-x-1/2 -translate-y-1/2
          z-[13] mix-blend-screen will-change-transform
        "
        // 発光のベース（暖色の丸グロー）
        style={{
          width: "clamp(360px, 44vw, 1080px)",
          height: "clamp(360px, 44vw, 1080px)",
          background:
            "radial-gradient(circle at 50% 48%, rgba(255,230,160,0.65) 0%, rgba(255,200,120,0.28) 38%, rgba(255,170,80,0.14) 58%, rgba(255,170,80,0.0) 78%)",
          filter: "blur(14px)",
          animation: "pulseGlow 1.85s ease-in-out infinite",
        }}
      />
      {/* 細いリングがふわっと膨張して消える（2本を時間差で） */}
      <div
        className="absolute top-[60%] left-[70%] -translate-x-1/2 -translate-y-1/2 z-[13] mix-blend-screen"
        style={{
          width: "clamp(220px, 26vw, 620px)",
          height: "clamp(220px, 26vw, 620px)",
          WebkitMaskImage:
            "radial-gradient(circle, transparent 52%, black 55%, black 65%, transparent 70%)",
          maskImage:
            "radial-gradient(circle, transparent 52%, black 55%, black 65%, transparent 70%)",
          background:
            "radial-gradient(circle, rgba(255,240,200,0.9), rgba(255,200,120,0.2))",
          filter: "blur(6px)",
          animation: "ringPulse 1.85s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-[60%] left-[70%] -translate-x-1/2 -translate-y-1/2 z-[13] mix-blend-screen"
        style={{
          width: "clamp(220px, 26vw, 620px)",
          height: "clamp(220px, 26vw, 620px)",
          WebkitMaskImage:
            "radial-gradient(circle, transparent 52%, black 55%, black 65%, transparent 70%)",
          maskImage:
            "radial-gradient(circle, transparent 52%, black 55%, black 65%, transparent 70%)",
          background:
            "radial-gradient(circle, rgba(255,240,200,0.9), rgba(255,200,120,0.2))",
          filter: "blur(6px)",
          animation: "ringPulse 1.85s ease-in-out infinite",
          animationDelay: "0.92s",
          opacity: 0.8,
        }}
      />

      {/* 2) みかん本体（サイズ大きめを維持） */}
      <div
        ref={orangeRef}
        className="absolute top-[60%] left-[70%] z-[14] transform-gpu will-change-transform"
        style={{
          width: "clamp(340px, 40vw, 900px)",
          filter:
            "drop-shadow(0 40px 70px rgba(120,70,20,0.28)) drop-shadow(0 120px 180px rgba(0,0,0,0.22))",
        }}
      >
        <Image
          src="/mikan/hero/hero_orange_float.png?v=20260116g"
          alt="浮遊するみかん"
          width={1600}
          height={1600}
          priority
          className="w-full h-auto brightness-[0.985] saturate-[0.95] select-none"
          sizes="(max-width: 640px) 90vw, 40vw"
        />
      </div>

      {/* キーフレーム */}
      <style jsx global>{`
        @keyframes pulseGlow {
          0%   { transform: scale(0.92); opacity: .55; }
          50%  { transform: scale(1.06); opacity: .78; }
          100% { transform: scale(0.92); opacity: .55; }
        }
        @keyframes ringPulse {
          0%   { transform: scale(0.86); opacity: .45; }
          60%  { transform: scale(1.18); opacity: .15; }
          100% { transform: scale(1.24); opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .mix-blend-screen { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
