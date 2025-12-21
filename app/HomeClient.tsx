"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";

// ==== フェードインアニメ ====
function useFadeIn() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("opacity-100", "translate-y-0");
          }
        });
      },
      { threshold: 0.2 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return ref;
}

export default function HomeClient() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY * 0.4);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="text-[#333]">
      {/* ============================================ */}
      {/* ① ヒーロー（hiro.png） */}
      {/* ============================================ */}
      <section className="relative h-[80vh] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            transform: `translateY(${offset * 0.15}px)`,
            transition: "transform 0.1s linear",
          }}
        >
          <Image
            src="/mikan/hiro.png"
            alt="山川みかん農園"
            fill
            priority
            className="object-cover brightness-[0.85]"
          />
        </div>

        <div className="absolute inset-0 bg-black/25" />

        <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-6 drop-shadow-xl">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            山川みかん農園
          </h1>
          <h2 className="text-xl md:text-3xl mt-4 opacity-90">
            北原早生・山川ブランド — 旬の甘さそのままに
          </h2>

          <a
            href="/products"
            className="mt-10 bg-orange-500 hover:bg-orange-600 text-white px-10 py-3 rounded-full text-lg shadow-lg transition flex items-center gap-2"
          >
            🧺 みかんを購入する
          </a>
        </div>
      </section>

      {/* ============================================ */}
      {/* ② POPバナー（キャンペーン3枚） */}
      {/* ============================================ */}
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-10">
        <img src="/mikan/bnr_shipping_campaign.png" className="rounded-xl shadow-lg w-full" />
        <img src="/mikan/bnr_open_special.png" className="rounded-xl shadow-lg w-full" />
        <img src="/mikan/bnr_oseibo.png" className="rounded-xl shadow-lg w-full" />
      </section>

      {/* ============================================ */}
      {/* ③ ギャラリー（修正版） */}
      {/* ============================================ */}
      <section className="max-w-6xl mx-auto px-6 pb-32 pt-12">
        <h2 className="text-3xl font-bold text-center mb-12">山川みかんギャラリー</h2>

        <div className="grid md:grid-cols-3 gap-10">

          <GalleryItem
            src="/mikan/defect.png"
            title="訳ありみかん"
            text="見た目に傷がありますが甘さは本物。一袋100円、当サイト人気No.1。"
          />

          <GalleryItem
            src="/mikan/premium.png"
            title="選別された正規品"
            text="プロが厳選した美しいみかん。1kg600円。直買でよりお得に。"
          />

          <GalleryItem
            src="/mikan/hand.png"
            title="手作業で丁寧に収穫"
            text="一つひとつ状態を確認しながら、最適なタイミングで収穫。"
          />

          <GalleryItem
            src="/mikan/farm.png"
            title="自然に囲まれた農園"
            text="海風と日当たりの良い山川の土壌で育つ、こだわりのみかん。"
          />

          <GalleryItem
            src="/mikan/shelf.png"
            title="無人販売所"
            text="1袋100円の地域文化。地元でも大人気の販売方法。"
          />

          <GalleryItem
            src="/mikan/top.png"
            title="袋いっぱいのみかん"
            text="1袋に4〜6個入り（大きさによる）。家庭用・贈り物に最適。"
          />
        </div>
      </section>
    </main>
  );
}

/* ギャラリーコンポーネント */
function GalleryItem({ src, title, text }: { src: string; title: string; text: string }) {
  const fade = useFadeIn();
  return (
    <div ref={fade} className="opacity-0 translate-y-6 transition-all duration-700">
      <div className="relative w-full h-56 rounded-xl overflow-hidden shadow-md">
        <Image src={src} alt={title} fill className="object-cover" />
      </div>
      <h3 className="text-lg font-semibold mt-4">{title}</h3>
      <p className="text-gray-600 text-sm mt-1">{text}</p>
    </div>
  );
}
