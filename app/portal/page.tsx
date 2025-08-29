"use client";

import { useEffect, useRef, useState } from "react";

/** ==== 強キャッシュ回避（コミットSHA） ==== */
const SHA = (process.env.NEXT_PUBLIC_COMMIT_SHA || "").toString().slice(0, 8);
const Q = SHA ? `?v=${SHA}` : "";

/** <img> フォールバック（最初が404なら次へ） */
function ImgFallback({
  sources,
  className = "",
  alt = "",
  style,
  onLoad,
}: {
  sources: string[];
  className?: string;
  alt?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
}) {
  const [i, setI] = useState(0);
  const src = sources[Math.min(i, sources.length - 1)];
  return (
    <img
      src={src}
      onError={() => {
        // ログっておく：画像が来てないときの特定に役立つ
        console.warn("[ImgFallback] failed:", src);
        setI((v) => Math.min(v + 1, sources.length - 1));
      }}
      onLoad={onLoad}
      alt={alt}
      draggable={false}
      className={`absolute inset-0 w-full h-full object-cover select-none ${className}`}
      style={style}
    />
  );
}

/** 設定（最小で効くものだけ） */
const CFG = {
  heroH: "92vh", // ヒーロー高さ
  logo: {
    // ロゴは /portal -> /loading -> / の順で探す
    sources: ["/portal/logo.png" + Q, "/loading/logo.png" + Q, "/logo.png" + Q],
    width: 380,
    // ★ 中央に“浮かせる”
    center: { x: "50%", y: "18vh" }, // 位置はお好みで（yはvh指定が扱いやすい）
    // もし手動で置きたいなら下2行を使う（center を無視）
    x: "6%" as string | number,
    y: 48 as string | number,
    glow: "drop-shadow(0 0 24px rgba(255,255,255,0.35)) drop-shadow(0 4px 24px rgba(0,0,0,0.6))",
  },
  revealThreshold: 0.2,
  clouds: {
    // 透明PNGレイヤー（/portal と / の両方対応）
    sky:  ["/portal/background2.png" + Q, "/portal/sky.jpg" + Q, "/background2.png" + Q],
    rays: ["/portal/rays.png" + Q, "/rays.png" + Q],
    far:  ["/portal/cloud_far.png" + Q, "/cloud_far.png" + Q],
    mid:  ["/portal/cloud_mid.png" + Q, "/portal/cloud_mid2.png" + Q, "/cloud_mid.png" + Q, "/cloud_mid2.png" + Q],
    near: ["/portal/cloud_near.png" + Q, "/cloud_near.png" + Q],
    // パララックス係数（下へ行くほど大きく＝近い雲が速く動く）
    speed: { rays: 0.02, far: 0.05, mid: 0.10, near: 0.18 },
    // 可視性を上げるための不透明度（素材が薄い環境でも見える）
    opacity: { rays: 0.7, far: 0.45, mid: 0.6, near: 0.9 },
  },
};

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const on = (e: MediaQueryListEvent) => setReduced(e.matches);
    m.addEventListener?.("change", on);
    return () => m.removeEventListener?.("change", on);
  }, []);
  return reduced;
}

function useReveal(threshold = 0.2) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (ents) => ents.forEach((e) => e.isIntersecting && setShow(true)),
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, show } as const;
}

/** “最初に到達できた”URLを拾ってCSS背景に当てる（表示の保険） */
function pickFirstReachable(urls: string[]): Promise<string | undefined> {
  return new Promise((resolve) => {
    let i = 0;
    const next = () => {
      if (i >= urls.length) return resolve(undefined);
      const url = urls[i++];
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => next();
      img.src = url;
    };
    next();
  });
}

/** ヒーロー（雲パララックス＋中央ロゴ） */
function CloudHero() {
  const reduced = useReducedMotion();
  const raysRef = useRef<HTMLDivElement | null>(null);
  const farRef  = useRef<HTMLDivElement | null>(null);
  const midRef  = useRef<HTMLDivElement | null>(null);
  const nearRef = useRef<HTMLDivElement | null>(null);
  const intro   = useReveal(CFG.revealThreshold);

  // CSS背景の保険
  const [bgUrl, setBgUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    pickFirstReachable(CFG.clouds.sky).then(setBgUrl);
  }, []);

  // パララックス
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const onScroll = () => {
      raf = requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        if (raysRef.current) raysRef.current.style.transform = `translate3d(0, ${y * CFG.clouds.speed.rays}px, 0)`;
        if (farRef.current)  farRef.current .style.transform = `translate3d(0, ${y * CFG.clouds.speed.far }px, 0)`;
        if (midRef.current)  midRef.current .style.transform = `translate3d(0, ${y * CFG.clouds.speed.mid }px, 0)`;
        if (nearRef.current) nearRef.current.style.transform = `translate3d(0, ${y * CFG.clouds.speed.near}px, 0)`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduced]);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        height: CFG.heroH,
        // CSS背景（最背面）。画像が来なくても下のグラデで黒つぶれ回避
        backgroundImage: bgUrl ? `url("${bgUrl}")` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* 最背面グラデ（黒つぶれ防止） */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#090d12] to-[#0a0f1a]" aria-hidden />

      {/* 雲レイヤー：透明PNGを重ねる（素材が薄い環境のために opacity を明示） */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden>
        {/* sky は CSS 背景でも出るが、ここでも重ねておくと発色が安定 */}
        <div className="absolute inset-0">
          <ImgFallback sources={CFG.clouds.sky} alt="" className="opacity-90" />
        </div>

        <div ref={raysRef} className="absolute inset-0" style={{ opacity: CFG.clouds.opacity.rays, mixBlendMode: "screen" as any }}>
          <ImgFallback sources={CFG.clouds.rays} alt="" />
        </div>

        <div ref={farRef} className="absolute inset-0" style={{ opacity: CFG.clouds.opacity.far }}>
          <ImgFallback sources={CFG.clouds.far} alt="" />
        </div>

        <div ref={midRef} className="absolute inset-0" style={{ opacity: CFG.clouds.opacity.mid }}>
          <ImgFallback sources={CFG.clouds.mid} alt="" />
        </div>

        <div ref={nearRef} className="absolute inset-0" style={{ opacity: CFG.clouds.opacity.near }}>
          <ImgFallback sources={CFG.clouds.near} alt="" />
        </div>
      </div>

      {/* ロゴ（中央に“浮かせる”） */}
      <div
        className="absolute z-10 select-none"
        style={
          CFG.logo.center
            ? {
                left: CFG.logo.center.x,
                top:  CFG.logo.center.y,
                transform: "translate(-50%, -50%)", // 中央基準
                filter: CFG.logo.glow,
              }
            : {
                left: typeof CFG.logo.x === "number" ? `${CFG.logo.x}px` : CFG.logo.x,
                top:  typeof CFG.logo.y === "number" ? `${CFG.logo.y}px` : CFG.logo.y,
                filter: CFG.logo.glow,
              }
        }
      >
        <img
          src={CFG.logo.sources[0]}
          onError={(e) => {
            const el = e.currentTarget;
            const current = el.src.replace(location.origin, "");
            const idx = CFG.logo.sources.findIndex((s) => s === current);
            const next = CFG.logo.sources[Math.min(idx + 1, CFG.logo.sources.length - 1)];
            if (next && next !== current) el.src = next;
          }}
          alt="VOLCE Logo"
          width={CFG.logo.width}
          height={Math.round(CFG.logo.width * 0.35)}
          draggable={false}
          style={{ userSelect: "none" }}
        />
      </div>

      {/* 白コピー */}
      <div className="absolute inset-x-0 bottom-10 md:bottom-16 z-10">
        <div
          className="mx-auto max-w-3xl px-6 text-center transition-all duration-700 will-change-transform"
          style={{ opacity: 1, transform: "translateY(0)" }}
        >
          <p className="text-white/90 text-base md:text-lg leading-relaxed">
            雲の上で集う、VOLCE。スクロールして、私たちの世界へ。
          </p>
        </div>
      </div>

      {/* 下端グラデ（本文へのつなぎ） */}
      <div className="absolute inset-x-0 bottom-0 h-32 z-10 bg-gradient-to-b from-transparent to-black/60" />
    </section>
  );
}

/** 本文 */
export default function PortalPage() {
  return (
    <main className="relative min-h-screen text-neutral-200">
      <CloudHero />

      <section id="intro" className="mx-auto max-w-4xl px-5 py-16 md:py-24 scroll-mt-24">
        <h2 className="text-2xl md:text-3xl font-bold tracking-wide mb-4">VOLCE クラン紹介</h2>
        <p className="leading-relaxed text-white/85">
          VOLCE は、火力枠・エンジョイ枠・クリエイター/ライバー枠など、
          それぞれの強みを活かして成長していくクランです。イベント運営や配信連携も含め、
          誰もが参加しやすく、かつ本気で戦える環境を整えています。
        </p>
      </section>

      <section id="team" className="mx-auto max-w-6xl px-5 py-14 md:py-20 scroll-mt-24">
        <h3 className="text-xl md:text-2xl font-semibold mb-4">Team</h3>
        <p className="text-white/80 max-w-3xl">
          主要メンバーのビジュアル画像は表示を停止しています。現在は軽量化のため、背景の雲レイヤーのみを残したモードで運用中です。
        </p>
      </section>

      <section id="notice" className="mx-auto max-w-5xl px-5 pb-24 scroll-mt-24">
        <h3 className="text-xl md:text-2xl font-semibold mb-4">注意事項</h3>
        <ul className="list-disc pl-6 space-y-2 text-white/85">
          <li>参加規約・禁止事項を遵守してください。</li>
          <li>個人情報やアカウント共有に関するトラブルは当クランでは責任を負いかねます。</li>
          <li>イベントのルールは告知ページの最新情報を参照してください。</li>
        </ul>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/60">
        © {new Date().getFullYear()} VOLCE
      </footer>
    </main>
  );
}
