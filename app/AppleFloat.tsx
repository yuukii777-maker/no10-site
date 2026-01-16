// components/AppleFloat.tsx
"use client";

import Image from "next/image";

/** 超軽量版：浮遊アニメOFF（静止表示） */
export default function AppleFloat() {
  return (
    <div className="pointer-events-none absolute inset-0 h-[80svh] sm:h-[85svh] z-[20]">
      {/* みかん本体（SPは少し左寄せ） */}
      <div
        className="absolute top-[60%] left-[54%] sm:left-[68%] z-[20]"
        style={{
          width: "clamp(520px, 60vw, 1200px)",
          filter:
            "drop-shadow(0 40px 70px rgba(120,70,20,0.28)) drop-shadow(0 120px 180px rgba(0,0,0,0.22))",
          transform: "translate(-50%, -50%) rotateZ(-8deg) rotateX(6deg)", // 角度だけ維持
          willChange: "auto",
        }}
      >
        <Image
          src="/mikan/hero/hero_orange_float.png?v=pro2"
          alt="浮遊するみかん"
          width={1600}            // 表示に十分な上限で軽量化
          height={1600}
          priority
          fetchPriority="high"    // iOS Safari にも効く優先度ヒント
          sizes="(max-width: 640px) 95vw, 60vw"
          className="w-full h-auto brightness-[0.99] saturate-[0.96] select-none"
        />
      </div>
    </div>
  );
}
