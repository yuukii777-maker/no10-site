"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";

// フェードインアニメ
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

export default function Home() {
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
      {/* ② 100円みかん（理由） */}
      {/* ============================================ */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center">100円みかんの理由</h2>

        <p className="text-center text-gray-600 mt-4 leading-relaxed">
          傷があっても味は抜群。  
          “山川みかんを気軽に味わってほしい”という想いから、訳あり品を特別価格で販売しています。
        </p>

        <div className="grid md:grid-cols-2 gap-10 mt-14">

          {/* 左カード */}
          <div className="bg-white rounded-xl shadow-md p-6 border">
            <Image
              src="/mikan/defect.png"
              alt="訳あり"
              width={600}
              height={400}
              className="rounded-lg mx-auto"
            />
            <h3 className="text-xl font-semibold mt-6 text-center">
              見た目の傷だけ。味はそのまま
            </h3>
            <p className="text-gray-600 mt-3 text-center">
              味・香り・鮮度は通常品と同じ。農家直売だからこそ実現できる価格です。
            </p>
          </div>

          {/* 右カード */}
          <div className="bg-white rounded-xl shadow-md p-6 border">
            <Image
              src="/mikan/shelf.png"
              alt="直売所"
              width={600}
              height={400}
              className="rounded-lg mx-auto"
            />
            <h3 className="text-xl font-semibold mt-6 text-center">
              無人販売でお得に還元
            </h3>
            <p className="text-gray-600 mt-3 text-center">
              手間を省き、その分お客様に還元しています。
            </p>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* ③ POPバナー（あなたの画像） */}
      {/* ============================================ */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <div className="rounded-xl overflow-hidden shadow-lg border">
          <Image
            src="/mikan/pop-100yen.jpg"
            alt="100円みかんポップ"
            width={1200}
            height={800}
            className="w-full object-cover"
          />
        </div>
      </section>

      {/* ============================================ */}
      {/* ④ ギャラリー（説明付き） */}
      {/* ============================================ */}
      <section className="max-w-6xl mx-auto px-6 pb-32 pt-12">
        <h2 className="text-3xl font-bold text-center mb-12">山川みかんギャラリー</h2>

        <div className="grid md:grid-cols-3 gap-10">

          {/* defect */}
          <GalleryItem
            src="/mikan/defect.png"
            title="訳ありみかん"
            text="見た目に傷がありますが、甘さは本物。人気No.1。"
          />

          {/* premium */}
          <GalleryItem
            src="/mikan/premium.png"
            title="選別された正規品"
            text="プロが厳選した見た目も味も優れたみかん。"
          />

          {/* hand */}
          <GalleryItem
            src="/mikan/hand.png"
            title="手作業で丁寧に収穫"
            text="一つ一つ状態を確認しながら、最適なタイミングで収穫します。"
          />

          {/* farm */}
          <GalleryItem
            src="/mikan/farm.png"
            title="自然に囲まれた農園"
            text="海風・日当たりがそろう山川の大地で育った安心安全のみかん。"
          />

          {/* shelf */}
          <GalleryItem
            src="/mikan/shelf.png"
            title="無人販売所"
            text="1袋100円で買える、地域に根付いた山川の文化。"
          />

          {/* top */}
          <GalleryItem
            src="/mikan/top.png"
            title="袋いっぱいのみかん"
            text="2袋分ほどの量で、家庭用にぴったり。"
          />
        </div>
      </section>
    </main>
  );
}

/* ギャラリーコンポーネント */
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
      <div className="relative w-full h-56 rounded-xl overflow-hidden shadow-md">
        <Image src={src} alt={title} fill className="object-cover" />
      </div>
      <h3 className="text-lg font-semibold mt-4">{title}</h3>
      <p className="text-gray-600 text-sm mt-1">{text}</p>
    </div>
  );
}
