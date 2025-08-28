"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * ─────────────────────────────────────────────────────────────────────
 *  VOLCE Portal – 超軽量版
 *  ・Canvas 粒子のみ（Three.js 不使用）
 *  ・ロゴ位置は数値（px/%）で調整可能
 *  ・PC でスクロール時に紹介文がふわっと出現
 *  ・Team/注意事項の画像は撤廃（テキストのみ）
 *  ・レイアウトは Tailwind。重い画像や外部フォントは使わない前提
 *  ・アニメは rAF + 省電力（タブ非表示/低FPS）
 *  ・`prefers-reduced-motion` で自動的にアニメを弱める
 *
 *  使い方：このファイルを `app/portal/page.tsx` にそのまま保存
 *  必要なら /public にロゴ画像 `portal/logo.png` を配置してください。
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * ===== 調整用パラメータ（ここだけ数字を変えれば OK） =====
 */
const CFG = {
  // ロゴ画像パス（/public 直下なら先頭はスラッシュから）
  logoSrc: "/portal/logo.png", // 例: /portal/logo.png

  // ロゴの基準サイズ（幅 px）
  logoWidth: 360,

  // 表示位置（画面左上を (0,0) として）
  // 単位: px または % を文字列で（例: "12%" や 40）
  logoOffsetX: "6%", // 左からの距離
  logoOffsetY: 48,    // 上からの距離

  // スクロール出現のトリガー（要素が何割見えたら表示するか）
  revealThreshold: 0.2,

  // 粒子の設定（軽量）
  particles: {
    count: 90,          // 個数（PC）
    countMobile: 55,    // 個数（モバイル）
    maxSpeed: 0.25,     // px/frame
    size: [1, 2.4],     // [min, max] px
    color: "rgba(255,255,255,0.6)",
    linkDist: 110,      // 近い粒子同士を薄い線でつなぐ距離
    linkAlpha: 0.12,
    fpsCap: 42,         // 上限 FPS（省電力）
  },
};

/**
 * 省モーションの OS 設定を尊重
 */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

/** 粒子アニメーション（軽量 Canvas 实装） */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    let dpr = Math.max(1, window.devicePixelRatio || 1);
    const resize = () => {
      const { innerWidth: w, innerHeight: h } = window;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // 粒子生成
    const isMobile = () => window.matchMedia("(max-width: 768px)").matches;
    const N = isMobile() ? CFG.particles.countMobile : CFG.particles.count;
    const parts = Array.from({ length: N }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * CFG.particles.maxSpeed * 2,
      vy: (Math.random() - 0.5) * CFG.particles.maxSpeed * 2,
      r: CFG.particles.size[0] + Math.random() * (CFG.particles.size[1] - CFG.particles.size[0]),
    }));

    let raf = 0;
    let last = performance.now();
    const interval = 1000 / CFG.particles.fpsCap; // fps 制限

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      if (now - last < interval) return; // fps 上限
      last = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 線（近い粒子を接続）
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(255,255,255,${CFG.particles.linkAlpha})`;
      for (let i = 0; i < parts.length; i++) {
        for (let j = i + 1; j < parts.length; j++) {
          const a = parts[i];
          const b = parts[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < CFG.particles.linkDist * CFG.particles.linkDist) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // 粒子を更新＋描画
      ctx.fillStyle = CFG.particles.color;
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        // 端でバウンド
        if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
        if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    if (!reduced) raf = requestAnimationFrame(tick);

    // タブ非表示で停止 → 復帰で再開
    const onVis = () => {
      if (document.hidden || reduced) {
        cancelAnimationFrame(raf);
      } else {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", resize);
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 w-full h-full bg-gradient-to-b from-[#05070b] to-[#0a0f1a]"
      aria-hidden
    />
  );
}

/** スクロールでふわっと表示するユーティリティ */
function useReveal(threshold = 0.2) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (ents) => {
        ents.forEach((e) => e.isIntersecting && setShow(true));
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, show } as const;
}

export default function PortalPage() {
  // スクロール出現（クラン紹介）
  const intro = useReveal(CFG.revealThreshold);

  return (
    <main className="relative min-h-screen text-neutral-200">
      {/* 粒子BG */}
      <ParticleCanvas />

      {/* ヘッダー（軽量） */}
      <header className="sticky top-0 z-20 bg-transparent backdrop-blur-sm supports-[backdrop-filter]:bg-black/10">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-widest text-white/80">VOLCE PORTAL</span>
          <nav className="hidden md:flex gap-6 text-sm text-white/70">
            <a href="#intro" className="hover:text-white">紹介</a>
            <a href="#team" className="hover:text-white">チーム</a>
            <a href="#notice" className="hover:text-white">注意事項</a>
          </nav>
        </div>
      </header>

      {/* ヒーロー（ロゴのみ / 数字で位置調整） */}
      <section className="relative h-[86vh] md:h-[92vh]">
        <div
          className="absolute"
          style={{
            left: typeof CFG.logoOffsetX === "number" ? `${CFG.logoOffsetX}px` : CFG.logoOffsetX,
            top: typeof CFG.logoOffsetY === "number" ? `${CFG.logoOffsetY}px` : CFG.logoOffsetY,
          }}
        >
          <Image
            src={CFG.logoSrc}
            width={CFG.logoWidth}
            height={Math.round(CFG.logoWidth * 0.35)}
            alt="VOLCE Logo"
            priority
            className="drop-shadow-[0_0_24px_rgba(255,255,255,0.25)] select-none"
          />
        </div>

        {/* ヒーロー下部の軽いグラデ影 */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-black/40" />
      </section>

      {/* 紹介（PC スクロールで出現） */}
      <section id="intro" className="mx-auto max-w-4xl px-5 py-16 md:py-24">
        <div
          ref={intro.ref}
          className={`transition-all duration-700 will-change-transform ${
            intro.show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2 className="text-2xl md:text-3xl font-bold tracking-wide mb-4">VOLCE クラン紹介</h2>
          <p className="leading-relaxed text-white/85">
            VOLCE は、火力枠・エンジョイ枠・クリエイター/ライバー枠など、
            それぞれの強みを活かして成長していくクランです。イベント運営や配信連携も含め、
            誰もが参加しやすく、かつ本気で戦える環境を整えています。
          </p>
        </div>
      </section>

      {/* チーム（画像撤廃、粒子 BG のみ、簡素テキスト） */}
      <section id="team" className="mx-auto max-w-6xl px-5 py-14 md:py-20">
        <h3 className="text-xl md:text-2xl font-semibold mb-4">Team</h3>
        <p className="text-white/80 max-w-3xl">
          主要メンバーのビジュアル画像は表示を停止しています。現在は軽量化のため、背景の粒子のみを残したモードで運用中です。
        </p>
      </section>

      {/* 注意事項（画像廃止） */}
      <section id="notice" className="mx-auto max-w-5xl px-5 pb-24">
        <h3 className="text-xl md:text-2xl font-semibold mb-4">注意事項</h3>
        <ul className="list-disc pl-6 space-y-2 text-white/85">
          <li>参加規約・禁止事項を遵守してください。</li>
          <li>個人情報やアカウント共有に関するトラブルは当クランでは責任を負いかねます。</li>
          <li>イベントのルールは告知ページの最新情報を参照してください。</li>
        </ul>
      </section>

      {/* フッター */}
      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/60">
        © {new Date().getFullYear()} VOLCE
      </footer>
    </main>
  );
}
