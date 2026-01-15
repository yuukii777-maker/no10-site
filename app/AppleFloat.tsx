"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/* ===========================
   melaenvy / luxury LP
   浮遊特化・斜め固定・溶け込み版
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

  const currentY = useRef(0);
  const targetY = useRef(0);
  const scrollSmooth = useRef(0);

  useEffect(() => {
    let rafId: number;
    let t = 0;

    const easeOutCubic = (x: number) =>
      1 - Math.pow(1 - x, 3);

    const onScroll = () => {
      const scrollY = window.scrollY;
      const heroRange = window.innerHeight * 0.9;
      const raw = Math.min(scrollY / heroRange, 1);

      scrollSmooth.current += (raw - scrollSmooth.current) * 0.05;
      const eased = easeOutCubic(scrollSmooth.current);

      targetY.current = eased * 26; // 控えめ
    };

    const animate = () => {
      t += 0.016;

      // 自律浮遊（ごく静か）
      const float = Math.sin(t * 0.7) * (isSP ? 3 : 4);

      currentY.current +=
        (targetY.current - currentY.current) * 0.08;

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
      pointer-events-none
      absolute top-0 left-0
      w-full h-[80vh]
      z-[20]              /* ★ 背景より前・文字より後 */
    "
  >
    {/* ===== 光（みかんの背後） ===== */}
    <div
      className="
        absolute
        top-[64%]
        left-[70%]
        -translate-x-1/2 -translate-y-1/2
        z-[10]            /* ★ みかんより後ろ */
        opacity-70
      "
      style={{
        width: isSP ? 520 : 760,
        height: isSP ? 520 : 760,
        filter: "blur(10px)",
      }}
    >
      <div
        className="w-full h-full rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(255,200,120,0.55) 0%, rgba(255,200,120,0.28) 35%, rgba(255,200,120,0.12) 55%, rgba(255,200,120,0.0) 72%)",
        }}
      />
    </div>

    {/* ===== みかん本体 ===== */}
    <div
      ref={appleRef}
      className="
        absolute
        top-[64%]
        left-[70%]
        transform-gpu
        will-change-transform
        z-[20]            /* ★ 主役 */
      "
      style={{
        filter:
          "drop-shadow(0 40px 70px rgba(120,70,20,0.28)) drop-shadow(0 120px 180px rgba(0,0,0,0.22))",
      }}
    >
      <Image
        src="/mikan/hero/hero_orange_float.png"
        alt="浮遊するみかん"
        width={isSP ? 420 : 620}
        height={isSP ? 420 : 620}
        priority
        className="brightness-[0.96] saturate-[0.92]"
      />
    </div>
  </div>
);
}
