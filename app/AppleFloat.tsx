// components/AppleFloat.tsx
"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/* ===========================
   melaenvy / luxury LP
   浮遊特化（CSSビーム＋もや＋粒子内蔵）
   ・SP/PCでみかんを大きめに可変
   ・画像なしで放射光が“もや〜”と自動ドリフト
=========================== */

export default function AppleFloat() {
  const appleRef = useRef<HTMLDivElement>(null);
  const [isSP, setIsSP] = useState(false);

  // SP判定
  useEffect(() => {
    const check = () => setIsSP(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // 浮遊 & スクロール追従（控えめ）
  const currentY = useRef(0);
  const targetY = useRef(0);
  const scrollSmooth = useRef(0);

  useEffect(() => {
    let rafId = 0;
    let t = 0;
    const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

    const onScroll = () => {
      const heroRange = Math.max(300, window.innerHeight * 0.9);
      const raw = Math.min(window.scrollY / heroRange, 1);
      scrollSmooth.current += (raw - scrollSmooth.current) * 0.05;
      targetY.current = easeOutCubic(scrollSmooth.current) * 26;
    };

    const animate = () => {
      t += 0.016;
      const float = Math.sin(t * 0.7) * (isSP ? 3 : 4);
      currentY.current += (targetY.current - currentY.current) * 0.08;

      if (appleRef.current) {
        appleRef.current.style.transform = `
          translate(-50%, -50%)
          translateY(${currentY.current + float}px)
          rotateZ(-8deg)
          rotateX(6deg)
        `;
      }
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    animate();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [isSP]);

  return (
    <div
      className="
        pointer-events-none absolute inset-0
        h-[80svh] sm:h-[85svh] z-[20] isolate
      "
    >
      {/* ===== CSSだけの放射ビーム（右上から） ===== */}
      <div
        className="
          absolute right-[6%] top-[-12%]
          h-[140%] w-[38%] opacity-80
          will-change-transform
          animate-[beamMove_22s_linear_infinite]
          z-[12]
        "
        style={{
          background:
            "conic-gradient(from 195deg at 85% 0%, rgba(255,240,170,0) 0deg, rgba(255,230,140,0.55) 26deg, rgba(255,230,140,0.07) 42deg, rgba(255,240,170,0) 60deg)",
          filter: "blur(14px)",
          mixBlendMode: "screen",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 16%, black 84%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 16%, black 84%, transparent 100%)",
        }}
      />

      {/* ===== ふわっと“もや”＋粒子（自動ドリフト） ===== */}
      <div
        className="
          absolute inset-0
          will-change-transform
          animate-[hazeDrift_40s_linear_infinite]
          z-[11]
        "
        style={{
          background:
            "radial-gradient(60% 40% at 15% 85%, rgba(255,170,60,0.12) 0%, rgba(255,170,60,0) 60%), radial-gradient(45% 30% at 70% 20%, rgba(255,240,170,0.10) 0%, rgba(255,240,170,0) 60%)",
          mixBlendMode: "screen",
          filter: "blur(10px)",
        }}
      />
      <div
        className="
          absolute inset-0 opacity-60
          will-change-transform
          animate-[starsFloat_35s_linear_infinite]
          z-[11]
        "
        style={{
          backgroundImage:
            "radial-gradient(2px 2px at 10% 30%, rgba(255,255,255,0.9) 40%, transparent 41%), radial-gradient(2px 2px at 30% 60%, rgba(255,255,255,0.7) 40%, transparent 41%), radial-gradient(2px 2px at 70% 20%, rgba(255,255,255,0.8) 40%, transparent 41%), radial-gradient(2px 2px at 85% 70%, rgba(255,255,255,0.8) 40%, transparent 41%)",
          backgroundRepeat: "repeat",
          backgroundSize: "420px 320px",
          mixBlendMode: "screen",
        }}
      />

      {/* ===== 背後の円グロー（みかんに溶け込む） ===== */}
      <div
        className="
          absolute top-[62%] left-[70%]
          -translate-x-1/2 -translate-y-1/2
          z-[13] opacity-70
        "
        style={{
          width: "clamp(260px, 34vw, 820px)",
          height: "clamp(260px, 34vw, 820px)",
          filter: "blur(10px)",
          background:
            "radial-gradient(circle at center, rgba(255,200,120,0.55) 0%, rgba(255,200,120,0.28) 35%, rgba(255,200,120,0.12) 55%, rgba(255,200,120,0) 72%)",
          mixBlendMode: "screen",
        }}
      />

      {/* ===== みかん本体（大きめ） ===== */}
      <div
        ref={appleRef}
        className="
          absolute top-[62%] left-[70%]
          transform-gpu will-change-transform
          z-[14]
        "
        style={{
          width: "clamp(240px, 30vw, 720px)",
          filter:
            "drop-shadow(0 40px 70px rgba(120,70,20,0.28)) drop-shadow(0 120px 180px rgba(0,0,0,0.22))",
        }}
      >
        <Image
          src="/mikan/hero/hero_orange_float.png?v=20260116a"
          alt="浮遊するみかん"
          width={1200}
          height={1200}
          priority
          className="w-full h-auto brightness-[0.96] saturate-[0.92] select-none"
          sizes="(max-width: 640px) 80vw, 30vw"
        />
      </div>

      {/* ===== keyframes（CSSアニメ） ===== */}
      <style jsx global>{`
        @keyframes beamMove {
          0%   { transform: translate3d(0,0,0) rotate(0.8deg) scale(1.02); }
          50%  { transform: translate3d(-1.5%,1.2%,0) rotate(0deg)   scale(1.05); }
          100% { transform: translate3d(0,0,0) rotate(0.8deg) scale(1.02); }
        }
        @keyframes hazeDrift {
          0%   { transform: translate3d(0,0,0) scale(1); }
          50%  { transform: translate3d(-2%,1%,0) scale(1.03); }
          100% { transform: translate3d(0,0,0) scale(1); }
        }
        @keyframes starsFloat {
          0%   { transform: translate3d(0,0,0); filter: brightness(1); }
          50%  { transform: translate3d(-1%,0.5%,0); filter: brightness(1.1); }
          100% { transform: translate3d(0,0,0); filter: brightness(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-[beamMove_22s_linear_infinite],
          .animate-[hazeDrift_40s_linear_infinite],
          .animate-[starsFloat_35s_linear_infinite] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
