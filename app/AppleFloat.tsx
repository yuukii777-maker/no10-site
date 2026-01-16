// components/AppleFloat.tsx
"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/** みかんだけを上下フロート（軽量・iPhone安定） */
export default function AppleFloat() {
  const orangeRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  // rAF は画面内の時だけ回す
  useEffect(() => {
    let rafId = 0;
    let running = false;
    let cur = 0, tgt = 0, s = 0;

    const loop = () => {
      const t = performance.now() * 0.001;
      s += (0 - s) * 0.03;          // スクロール連動は切って静かな浮遊のみ
      tgt = 0;
      cur += (tgt - cur) * 0.1;
      const float = Math.sin(t * 0.7) * 4; // 上下フロート

      if (orangeRef.current) {
        // iOS/Safari 対策: translate3d で GPU 合成を強制
        orangeRef.current.style.transform =
          `translate3d(-50%,-50%,0) translate3d(0,${(cur + float).toFixed(2)}px,0) rotateZ(-8deg) rotateX(6deg)`;
      }
      if (running) rafId = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(rafId);
    };

    // ヒーローが見えている時だけ稼働
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? start() : stop()),
      { threshold: 0.05 }
    );
    if (hostRef.current) io.observe(hostRef.current);

    return () => { stop(); io.disconnect(); };
  }, []);

  // 即表示用の極小シマー（1KB未満）
  const blurDataURL = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
       <defs><linearGradient id='g'>
         <stop stop-color='#f3e0c6' offset='0'/>
         <stop stop-color='#fff3e0' offset='0.5'/>
         <stop stop-color='#f3e0c6' offset='1'/>
       </linearGradient></defs>
       <rect width='64' height='64' fill='#f3e0c6'/>
       <rect id='r' width='64' height='64' fill='url(#g)' opacity='0.6'/>
       <animate xlink:href='#r' attributeName='x' from='-64' to='64' dur='1s' repeatCount='indefinite'/>
     </svg>`
  )}`;

  return (
    <div ref={hostRef} className="pointer-events-none absolute inset-0 h-[80svh] sm:h-[85svh] z-[20]">
      {/* みかん本体（SPは少し左寄せ） */}
      <div
        ref={orangeRef}
        className="absolute top-[60%] left-[54%] sm:left-[68%] z-[20] transform-gpu will-change-transform"
        style={{
          width: "clamp(520px, 60vw, 1200px)",
          filter:
            "drop-shadow(0 40px 70px rgba(120,70,20,0.28)) drop-shadow(0 120px 180px rgba(0,0,0,0.22))",
        }}
      >
        <Image
          src="/mikan/hero/hero_orange_float.png?v=pro2"
          alt="浮遊するみかん"
          width={1600}               // 実表示に十分な上限で軽量化
          height={1600}
          priority                   // LCP対象を最優先
          fetchPriority="high"       // iOS Safariでも優先度を上げる
          placeholder="blur"         // すぐに輪郭を表示
          blurDataURL={blurDataURL}
          sizes="(max-width: 640px) 95vw, 60vw"
          className="w-full h-auto brightness-[0.99] saturate-[0.96] select-none"
        />
      </div>
    </div>
  );
}
