"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";

/* ===========================
   フェードインアニメ
=========================== */
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
  /* ===========================
     スライダー制御
  ============================ */
  const sliderImages = [
    {
      src: "/mikan/bnr_shipping_campaign.png",
      caption: "九州 送料無料キャンペーン",
    },
    {
      src: "/mikan/bnr_open_special.png",
      caption: "新設サイト記念 ＋1kg",
    },
    {
      src: "/mikan/bnr_oseibo.png",
      caption: "冬ギフト受付中",
    },
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % sliderImages.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  /* パララックス */
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY * 0.4);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="text-[#333]">

      {/* ============================================ */}
      {/* ① ヒーロー */}
      {/* ============================================ */}
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ transform: `translateY(${offset * 0.15}px)` }}
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

        <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-6">
          <h1 className="text-3xl md:text-6xl font-bold drop-shadow-lg">
            山川みかん農園
          </h1>
          <h2 className="text-lg md:text-3xl mt-4 opacity-90">
            北原早生・山川ブランド — 旬の甘さそのままに
          </h2>

          <a
            href="/products"
            className="mt-10 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full text-lg shadow-lg transition"
          >
            🧺 みかんを購入する
          </a>
        </div>
      </section>

      {/* ============================================ */}
      {/* ② スライダー（完全レスポンシブ） */}
      {/* ============================================ */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-16">
        <div
          className="
            relative w-full rounded-xl overflow-hidden shadow-xl cursor-pointer
            h-[180px] sm:h-[220px] md:h-[300px] lg:h-[380px]
          "
          onClick={() =>
            document
              .getElementById("campaign-banners")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <Image
            src={sliderImages[index].src}
            alt={sliderImages[index].caption}
            fill
            className="object-cover transition-all duration-500"
          />

          <div className="absolute bottom-0 w-full bg-black/40 py-3 text-center">
            <p className="text-white text-base sm:text-lg md:text-xl font-semibold tracking-wide">
              {sliderImages[index].caption}
            </p>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* ③ 100円みかん POP */}
      {/* ============================================ */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-24">
        <h2 className="text-3xl font-bold text-center">100円みかんの理由</h2>

        <p className="text-center text-gray-600 mt-4 leading-relaxed">
          傷があっても味は抜群。
          “山川みかんを気軽に味わってほしい”
          という想いから訳あり品を特別価格で提供しています。
        </p>

        <div className="mt-10 flex justify-center">
          <Image
            src="/mikan/pop-100yen.jpg"
            alt="100円みかんPOP"
            width={900}
            height={700}
            className="rounded-xl shadow-xl w-full max-w-3xl object-cover"
          />
        </div>
      </section>

      {/* ============================================ */}
      {/* ④ ギャラリー */}
      {/* ============================================ */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-32 pt-12">
        <h2 className="text-3xl font-bold text-center mb-12">
          山川みかんギャラリー
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
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
            text="一つひとつ状態を確認しながら収穫します。"
          />
          <GalleryItem
            src="/mikan/farm.png"
            title="自然に囲まれた農園"
            text="海風と日当たりの良い山川の土壌で育つみかん。"
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

/* ===========================
   ギャラリーアイテム
=========================== */
function GalleryItem({
  src,
  title,
  text,
}: {
  src: string;
  title: string;
  text: string;
}) {
  const fade = useFadeIn();
  return (
    <div
      ref={fade}
      className="opacity-0 translate-y-6 transition-all duration-700"
    >
      <div className="relative w-full h-[140px] sm:h-[160px] md:h-[180px] lg:h-[200px] rounded-xl overflow-hidden shadow-md">
        <Image src={src} alt={title} fill className="object-cover" />
      </div>
      <h3 className="text-base md:text-lg font-semibold mt-3">{title}</h3>
      <p className="text-gray-600 text-xs md:text-sm mt-1 leading-relaxed">
        {text}
      </p>
    </div>
  );
}
