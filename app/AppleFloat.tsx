"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export default function AppleFloat() {
  const appleRef = useRef<HTMLDivElement>(null);

  // 内部状態（惰性用）
  const current = useRef({
    y: 0,
    rotateX: 0,
    rotateY: 0,
    z: 0,
  });

  const target = useRef({
    y: 0,
    rotateX: 0,
    rotateY: 0,
    z: 0,
  });

  useEffect(() => {
    let rafId: number;

    const onScroll = () => {
      const scrollY = window.scrollY;
      const heroRange = window.innerHeight * 0.9;

      const progress = Math.min(scrollY / heroRange, 1);

      // === melaenvy 的パラメータ ===
      target.current.y = progress * 60;              // 上下移動
      target.current.rotateY = progress * 420;       // 横回転（主役）
      target.current.rotateX = progress * 160;       // 縦回転
      target.current.z = progress * 220;              // 奥行き（超重要）
    };

    const animate = () => {
      // 惰性（lerp）
      current.current.y += (target.current.y - current.current.y) * 0.08;
      current.current.rotateY +=
        (target.current.rotateY - current.current.rotateY) * 0.08;
      current.current.rotateX +=
        (target.current.rotateX - current.current.rotateX) * 0.08;
      current.current.z += (target.current.z - current.current.z) * 0.08;

      if (appleRef.current) {
        appleRef.current.style.transform = `
          translate(-50%, -50%)
          translateY(${current.current.y}px)
          translateZ(${current.current.z}px)
          rotateX(${current.current.rotateX}deg)
          rotateY(${current.current.rotateY}deg)
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

  return (
    <div
      className="
        pointer-events-none
        fixed inset-0
        z-[9]
        perspective-[1400px]
      "
    >
      <div
        ref={appleRef}
        className="
          absolute top-1/2 left-1/2
          transform-gpu
          will-change-transform
          drop-shadow-[0_40px_80px_rgba(0,0,0,0.35)]
        "
      >
        <Image
          src="/mikan/hero/hero_orange_float.png"
          alt="浮遊するみかん"
          width={520}
          height={520}
          priority
        />
      </div>
    </div>
  );
}
