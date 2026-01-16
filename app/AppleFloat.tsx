// components/AppleFloat.tsx
"use client";

import Image from "next/image";

/** 超軽量版：浮遊アニメOFF（静止表示）- iPhone安定パッチ */
export default function AppleFloat() {
  return (
    <div className="pointer-events-none absolute inset-0 h-[80svh] sm:h-[85svh] z-[20]">
      {/* みかん本体（SPは少し左寄せ） */}
      <div
        className="absolute top-[60%] left-[54%] sm:left-[68%] z-[20]"
        style={{
          width: "clamp(520px, 60vw, 1200px)",
          // Safari で filter + 3D が抜けることがあるので translate3d で GPU 合成を強制
          transform:
            "translate3d(-50%, -50%, 0) rotateZ(-8deg) rotateX(6deg)",
          WebkitTransform:
            "translate3d(-50%, -50%, 0) rotateZ(-8deg) rotateX(6deg)",
          willChange: "transform",
          // filter はそのままでも OK。もしまだ出ない場合は一旦消して挙動確認して。
          filter:
            "drop-shadow(0 40px 70px rgba(120,70,20,0.28)) drop-shadow(0 120px 180px rgba(0,0,0,0.22))",
        }}
      >
        <Image
          src="/mikan/hero/hero_orange_float.png?v=pro3" // ← キャッシュ破り（iOSで握られた404対策）
          alt="浮遊するみかん"
          width={1600}
          height={1600}
          priority
          loading="eager"
          fetchPriority="high"
          sizes="(max-width: 640px) 95vw, 60vw"
          className="w-full h-auto brightness-[0.99] saturate-[0.96] select-none"
          // 画像要素側にも合成ヒント
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "translateZ(0)",
            WebkitTransform: "translateZ(0)",
          }}
        />
      </div>
    </div>
  );
}
