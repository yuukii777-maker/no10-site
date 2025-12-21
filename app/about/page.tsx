/* ===========================
   SEO
=========================== */
export const metadata = {
  title: "山川みかん農園｜農園について",
  description:
    "福岡県みやま市山川町の自然豊かな農園。海風・日当たりの良い土壌で育つ山川みかんの魅力をご紹介します。",
};

import Image from "next/image";

export default function Page() {
  return (
    <main className="text-[#333]">

      {/* ============================= */}
      {/* ヒーロー */}
      {/* ============================= */}
      <section className="relative h-[70vh] overflow-hidden">
        <Image
          src="/mikan/farm.png"
          fill
          alt="農園の様子"
          className="object-cover brightness-90"
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-6">
          <h1 className="text-4xl md:text-5xl font-bold">山川みかん農園について</h1>

          <div className="
            mt-6 max-w-3xl
            bg-white/20 backdrop-blur-sm rounded-2xl shadow-md
            p-6 md:p-8 text-white/90
          ">
            海風・日当たり・水はけの良い山川の大地で育つ高品質みかん。
            こだわりの手作業と自然の恵みをご紹介します。
          </div>
        </div>
      </section>

      {/* ======= 農園紹介文（カード追加） ======= */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div
          className="
            bg-white/60 backdrop-blur-sm rounded-2xl shadow-md
            p-6 md:p-8 leading-relaxed text-gray-700
          "
        >
          福岡県みやま市山川町は、みかん栽培に最適な自然環境が整う地域。
          海風の通り道となる地形と、日当たりが良く水はけのよい土壌が、
          甘味・香りの強い山川みかんを育てています。
        </div>
      </section>

      {/* ======= カード3枚 ======= */}
      <section className="max-w-6xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-10">

        {[
          {
            src: "/mikan/premium.png",
            title: "甘味と香りのあるみかん",
            text: "海風と日照の恩恵を受け、味のバランスが良く香り豊か。",
          },
          {
            src: "/mikan/hand.png",
            title: "ひとつひとつ丁寧に収穫",
            text: "熟度を見ながら最適なタイミングで手作業で摘み取っています。",
          },
          {
            src: "/mikan/shelf.png",
            title: "無人販売による地域文化",
            text: "新鮮なみかんが家庭にすぐ届く、信頼のある販売方法です。",
          },
        ].map((item, i) => (
          <div key={i} className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 text-center">
            <Image src={item.src} alt={item.title} width={400} height={250} className="rounded-lg mx-auto" />
            <h3 className="text-lg font-semibold mt-4">{item.title}</h3>
            <p className="text-gray-600 text-sm mt-2">{item.text}</p>
          </div>
        ))}

      </section>
    </main>
  );
}
