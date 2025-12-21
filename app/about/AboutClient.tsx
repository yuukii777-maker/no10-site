"use client";

import Image from "next/image";
import { useRef, useEffect } from "react";

/* ---- フェードイン Hook ---- */
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("opacity-100", "translate-y-0");
          }
        }),
      { threshold: 0.2 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return ref;
}

export default function AboutClient() {
  return (
    <main className="text-[#333]">

      {/* ============================= */}
      {/* Hero（farm.png） */}
      {/* ============================= */}
      <section className="relative h-[70vh] overflow-hidden">
        <Image
          src="/mikan/farm.png"
          alt="山川みかん農園"
          fill
          priority
          className="object-cover brightness-90"
        />
        <div className="absolute inset-0 bg-black/30"></div>

        <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-6">
          <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
            自然に囲まれた山川の農園
          </h1>
          <p className="mt-4 text-lg md:text-xl drop-shadow">
            日当たり・海風・水はけの良さが揃う最高の土地
          </p>
        </div>
      </section>

      {/* ============================= */}
      {/* 農園の特徴 */}
      {/* ============================= */}
      <section className="max-w-6xl mx-auto px-6 py-20">

        <h2 className="text-3xl font-bold text-center">山川みかん農園の特徴</h2>

        <p className="text-center text-gray-600 mt-4 leading-relaxed">
          山川町は古くからみかん作りが盛んな地域。  
          海風と太陽、そして肥えた大地が、香り高いみかんを育てます。
        </p>

        <div className="grid md:grid-cols-3 gap-10 mt-14">

          <Feature
            img="/mikan/premium.png"
            title="甘味と香りのあるみかん"
            text="海風と日照の恩恵を受け、味のバランスが良く香り豊か。"
          />

          <Feature
            img="/mikan/hand.png"
            title="ひとつひとつ丁寧に収穫"
            text="熟度を見ながら最適なタイミングで手摘みしています。"
          />

          <Feature
            img="/mikan/shelf.png"
            title="無人販売による地域の文化"
            text="新鮮なみかんが家庭にすぐ届く、信頼のある販売方法です。"
          />
        </div>
      </section>

      {/* ============================= */}
      {/* ストーリー */}
      {/* ============================= */}
      <section className="bg-[#fafafa] py-20 border-t">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold">農園の想い</h2>

          <p className="text-gray-700 leading-relaxed text-lg mt-6">
            山川みかん農園では「また食べたい」と思っていただける  
            みかん作りを目指しています。
            <br /><br />
            土づくりから収穫、選別まで心を込めて行い、  
            地域の恵みをそのままお届けします。
          </p>
        </div>
      </section>
    </main>
  );
}

/* ---- Feature Component ---- */
function Feature({
  img,
  title,
  text,
}: {
  img: string;
  title: string;
  text: string;
}) {
  const fade = useFadeIn();
  return (
    <div
      ref={fade}
      className="opacity-0 translate-y-6 transition-all duration-700 text-center bg-white rounded-xl shadow-md p-8 border"
    >
      <Image
        src={img}
        alt={title}
        width={180}
        height={180}
        className="mx-auto rounded-lg"
      />
      <h3 className="text-xl font-semibold mt-6">{title}</h3>
      <p className="text-gray-600 mt-3 leading-relaxed">{text}</p>
    </div>
  );
}
