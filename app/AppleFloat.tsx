"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/* ===========================
   melaenvy / luxury LP 完全版
=========================== */

export default function AppleFloat() {
  const appleRef = useRef<HTMLDivElement>(null);

  // 現在値（物体）
  const current = useRef({
    y: 0,
    rotateX: 0,
    rotateY: 0,
    z: 0,
  });

  // 目標値（世界）
  const target = useRef({
    y: 0,
    rotateX: 0,
    rotateY: 0,
    z: 0,
  });

  // スクロールの“慣性核”
  const scrollSmooth = useRef(0);

  useEffect(() => {
    let rafId: number;
    let t = 0;

    /* ===========================
       イージング（非線形）
    =========================== */
    const easeOutCubic = (x: number) =>
      1 - Math.pow(1 - x, 3);

    /* ===========================
       Scroll → 世界値
    =========================== */
    const onScroll = () => {
      const scrollY = window.scrollY;
      const heroRange = window.innerHeight * 0.9;

      const rawProgress = Math.min(scrollY / heroRange, 1);

      // ★ スクロールを一度“溜める”
      scrollSmooth.current +=
        (rawProgress - scrollSmooth.current) * 0.04;

      const eased = easeOutCubic(scrollSmooth.current);

      // 品のある最大量（過剰禁止）
      target.current.y = eased * 42;
      target.current.z = eased * 160;
      target.current.rotateY = eased * 260;
      target.current.rotateX = eased * 22;
    };

    /* ===========================
       Animation Loop
    =========================== */
    const animate = () => {
      t += 0.016;

      /* --- 微細自律浮遊（背景ノイズ） --- */
      const floatY = Math.sin(t * 0.7) * 3;
      const floatZ = Math.sin(t * 0.5) * 2;
      const floatRot = Math.sin(t * 0.6) * 1.6;

      /* --- 慣性補間（重さ） --- */
      const inertia = 0.045;

      current.current.y +=
        (target.current.y - current.current.y) * inertia;
      current.current.z +=
        (target.current.z - current.current.z) * inertia;
      current.current.rotateY +=
        (target.current.rotateY - current.current.rotateY) * inertia;
      current.current.rotateX +=
        (target.current.rotateX - current.current.rotateX) * inertia;

      /* --- Z連動の視覚補正 --- */
      const scale = 1 + current.current.z / 1600;
      const blur = Math.min(current.current.z / 220, 1.6);

      if (appleRef.current) {
        appleRef.current.style.transform = `
          translate(-50%, -50%)
          translateY(${current.current.y + floatY}px)
          translateZ(${current.current.z + floatZ}px)
          rotateX(${current.current.rotateX + floatRot}deg)
          rotateY(${current.current.rotateY + floatRot}deg)
          scale(${scale})
        `;

        appleRef.current.style.filter = `
          blur(${blur}px)
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
  }, []);

  /* ===========================
     View
  =========================== */
  return (
    <div
      className="
        pointer-events-none
        absolute inset-0
        z-[9]
        perspective-[1800px]
      "
    >
      <div
        ref={appleRef}
        className="
          absolute
          top-1/2
          left-[62%]   /* ★ 修正：中央 → 右寄せ（文字・CTA保護） */
          transform-gpu
          will-change-transform
          drop-shadow-[0_40px_80px_rgba(120,70,20,0.35)]
        "
      >
        <Image
          src="/mikan/hero/hero_orange_float.png"
          alt="浮遊するみかん"
          width={520}
          height={520}
          priority
          className="
            brightness-[0.98]
            saturate-[0.96]
          "
        />
      </div>
    </div>
  );
}
