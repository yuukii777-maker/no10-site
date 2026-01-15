"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/* ===========================
   melaenvy / luxury LP 完全版
   iOS対応・完成形
=========================== */

export default function AppleFloat() {
  const appleRef = useRef<HTMLDivElement>(null);
  const [isSP, setIsSP] = useState(false);

  // SP判定（iOS含む）
  useEffect(() => {
    const check = () => setIsSP(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

      // スクロールを一度溜める（慣性）
      scrollSmooth.current +=
        (rawProgress - scrollSmooth.current) * 0.04;

      const eased = easeOutCubic(scrollSmooth.current);

      // 上品な最大量
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

      // 微細自律浮遊（生命感）
      const floatY = Math.sin(t * 0.7) * 3;
      const floatZ = Math.sin(t * 0.5) * 2;
      const floatRot = Math.sin(t * 0.6) * 1.6;

      // 慣性補間（重さ）
      const inertia = 0.045;

      current.current.y +=
        (target.current.y - current.current.y) * inertia;
      current.current.z +=
        (target.current.z - current.current.z) * inertia;
      current.current.rotateY +=
        (target.current.rotateY - current.current.rotateY) * inertia;
      current.current.rotateX +=
        (target.current.rotateX - current.current.rotateX) * inertia;

      // Z連動の視覚補正
      const scale = 1 + current.current.z / (isSP ? 1100 : 1600);
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

        appleRef.current.style.filter = `blur(${blur}px)`;
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

  /* ===========================
     View（iOS安全構成）
  =========================== */
  return (
    <div
      className="
        pointer-events-none
        absolute top-0 left-0
        w-full
        h-[80vh]
        z-[1]
        perspective-[1800px]
      "
    >
      <div
        ref={appleRef}
        className="
          absolute
          top-[58%]        /* ★ 微調整：文字より下 */
          left-[66%]       /* ★ 微調整：文字・CTA完全回避 */
          transform-gpu
          will-change-transform
        "
        style={{
          filter:
            "drop-shadow(0 22px 40px rgba(120,70,20,0.35)) drop-shadow(0 70px 110px rgba(0,0,0,0.25))",
        }}
      >
        <Image
          src="/mikan/hero/hero_orange_float.png"
          alt="浮遊するみかん"
          width={isSP ? 320 : 520}   /* ★ SPで主役サイズ */
          height={isSP ? 320 : 520}
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
