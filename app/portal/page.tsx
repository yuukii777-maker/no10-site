"use client";

import { useEffect, useRef, useState, ComponentProps } from "react";
import Image from "next/image";

/** 任意の複数パスを順に試すフォールバック画像 */
type ImgProps = Omit<ComponentProps<typeof Image>, "src"> & { srcs: string[] };
function FallbackImage({ srcs, ...rest }: ImgProps) {
  const [i, setI] = useState(0);
  return (
    <Image
      src={srcs[Math.min(i, srcs.length - 1)]}
      onError={() => setI((v) => v + 1)}
      {...rest}
    />
  );
}

/** 設定（ロゴ位置や雲の動き） */
const CFG = {
  logo: {
    // ロゴは /public/portal/logo.png /public/loading/logo.png /public/logo.png の順に探す
    srcs: ["/portal/logo.png", "/loading/logo.png", "/logo.png"],
    width: 360,
    x: "6%" as string | number, // left
    y: 48 as string | number,   // top
  },
  revealThreshold: 0.2,
  clouds: {
    // それぞれ /portal/* → / 直下の順で探す
    sky:  ["/portal/sky.jpg", "/portal/background2.png", "/background2.png"],
    rays: ["/portal/rays.png", "/rays.png"],
    far:  ["/portal/cloud_far.png", "/cloud_far.png"],
    mid:  ["/portal/cloud_mid.png", "/portal/cloud_mid2.png", "/cloud_mid.png", "/cloud_mid2.png"],
    near: ["/portal/cloud_near.png", "/cloud_near.png"],
    speed: { rays: 0.02, far: 0.05, mid: 0.10, near: 0.18 },
  },
};

/** 省モーション尊重 */
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

/** スクロールでふわっと表示 */
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

/** 雲パララックス（粒子なし） */
function CloudHero() {
  const reduced = useReducedMotion();
  const raysRef = useRef<HTMLDivElement | null>(null);
  const farRef  = useRef<HTMLDivElement | null>(null);
  const midRef  = useRef<HTMLDivElement | null>(null);
  const nearRef = useRef<HTMLDivElement | null>(null);
  const intro   = useReveal(CFG.revealThreshold);

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
    <section className="relative h-[86vh] md:h-[92vh] overflow-hidden">
      {/* 背景の保険グラデ（最背面） */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#05070b] to-[#0a0f1a]" aria-hidden />

      {/* 雲レイヤー（z-0：親背景の上） */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0">
          <FallbackImage
            srcs={CFG.clouds.sky}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover select-none"
            draggable={false}
          />
        </div>
        <div ref={raysRef} className="absolute inset-0 opacity-70">
          <FallbackImage
            srcs={CFG.clouds.rays}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover select-none"
            draggable={false}
          />
        </div>
        <div ref={farRef} className="absolute inset-0">
          <FallbackImage
            srcs={CFG.clouds.far}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover select-none"
            draggable={false}
          />
        </div>
        <div ref={midRef} className="absolute inset-0">
          <FallbackImage
            srcs={CFG.clouds.mid}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover select-none"
            draggable={false}
          />
        </div>
        <div ref={nearRef} className="absolute inset-0">
          <FallbackImage
            srcs={CFG.clouds.near}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover select-none"
            draggable={false}
          />
        </div>
      </div>

      {/* ロゴ（前景） */}
      <div
        className="absolute z-10 select-none drop-shadow-[0_0_24px_rgba(255,255,255,0.25)]"
        style={{
          left: typeof CFG.logo.x === "number" ? `${CFG.logo.x}px` : CFG.logo.x,
          top:  typeof CFG.logo.y === "number" ? `${CFG.logo.y}px` : CFG.logo.y,
        }}
      >
        <FallbackImage
          srcs={CFG.logo.srcs}
          width={CFG.logo.width}
          height={Math.round(CFG.logo.width * 0.35)}
          alt="VOLCE Logo"
          priority
          draggable={false}
        />
      </div>

      {/* 白コピー（前景） */}
      <div className="absolute inset-x-0 bottom-10 md:bottom-16 z-10">
        <div
          ref={intro.ref}
          className={`mx-auto max-w-3xl px-6 text-center transition-all duration-700 will-change-transform ${
            intro.show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <p className="text-white/90 text-base md:text-lg leading-relaxed">
            雲の上で集う、VOLCE。スクロールして、私たちの世界へ。
          </p>
        </div>
      </div>

      {/* 切り返しグラデ */}
      <div className="absolute inset-x-0 bottom-0 h-32 z-10 bg-gradient-to-b from-transparent to-black/60" />
    </section>
  );
}

/** ページ本体（ページ内ヘッダーは出さない。Nav は layout.tsx 側） */
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
