"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/* ===========================
   melaenvy / luxury LP
   浮遊特化・回転完全廃止版
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

      // 浮遊量だけを制御（Yのみ）
      targetY.current = eased * 28;
    };

    const animate = () => {
      t += 0.016;

      // 自律浮遊（命）
      const float = Math.sin(t * 0.8) * (isSP ? 4 : 6);

      // 慣性
      currentY.current +=
        (targetY.current - currentY.current) * 0.08;

      if (appleRef.current) {
        appleRef.current.style.transform = `
          translate(-50%, -50%)
          translateY(${currentY.current + float}px)
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
        z-[1]
      "
    >
      <div
        ref={appleRef}
        className="
          absolute
          top-[62%]
          left-[68%]
          transform-gpu
          will-change-transform
        "
        style={{
          filter:
            "drop-shadow(0 30px 50px rgba(120,70,20,0.35)) drop-shadow(0 90px 140px rgba(0,0,0,0.28))",
        }}
      >
        <Image
          src="/mikan/hero/hero_orange_float.png"
          alt="浮遊するみかん"
          width={isSP ? 380 : 560}
          height={isSP ? 380 : 560}
          priority
          className="brightness-[1.02] saturate-[1]"
        />
      </div>
    </div>
  );
}
