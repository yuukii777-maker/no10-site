"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export default function AppleFloat() {
  const appleRef = useRef<HTMLDivElement>(null);

  const current = useRef({
    y: 0,
    rotateX: 0,
    rotateY: 0,
    z: 0,
    float: 0,
  });

  const target = useRef({
    y: 0,
    rotateX: 0,
    rotateY: 0,
    z: 0,
  });

  useEffect(() => {
    let rafId: number;
    let t = 0;

    const onScroll = () => {
      const scrollY = window.scrollY;
      const heroRange = window.innerHeight * 0.9;
      const progress = Math.min(scrollY / heroRange, 1);

      // melaenvy 的パラメータ（抑制・品）
      target.current.y = progress * 40;
      target.current.rotateY = progress * 320;
      target.current.rotateX = progress * 35; // ★ 潰れ防止
      target.current.z = progress * 180;
    };

    const animate = () => {
      t += 0.016;

      // 微自律浮遊（神秘感の核）
      const floatY = Math.sin(t * 1.2) * 6;
      const floatRot = Math.sin(t * 0.8) * 3;

      // 慣性補間
      current.current.y += (target.current.y - current.current.y) * 0.06;
      current.current.rotateY +=
        (target.current.rotateY - current.current.rotateY) * 0.06;
      current.current.rotateX +=
        (target.current.rotateX - current.current.rotateX) * 0.06;
      current.current.z += (target.current.z - current.current.z) * 0.06;

      // Z連動演出
      const scale = 1 + current.current.z / 1400;
      const blur = Math.min(current.current.z / 160, 2.5);

      if (appleRef.current) {
        appleRef.current.style.transform = `
          translate(-50%, -50%)
          translateY(${current.current.y + floatY}px)
          translateZ(${current.current.z}px)
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
  }, []);

  return (
    <div
      className="
        pointer-events-none
        absolute inset-0
        z-[9]
        perspective-[1600px]
      "
    >
      <div
        ref={appleRef}
        className="
          absolute top-1/2 left-1/2
          transform-gpu
          will-change-transform
          drop-shadow-[0_40px_70px_rgba(120,70,20,0.35)]
        "
      >
        <Image
          src="/mikan/hero/hero_orange_float.png"
          alt="浮遊するみかん"
          width={520}
          height={520}
          priority
          className="brightness-[0.98] saturate-[0.95]"
        />
      </div>
    </div>
  );
}
