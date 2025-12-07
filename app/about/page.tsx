import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="pt-20 text-[#333]">

      {/* ============================= */}
      {/* メインビジュアル */}
      {/* ============================= */}
      <section className="relative w-full h-[70vh]">
        <Image
          src="/mikan/farm.png"
          alt="山川みかん農園"
          fill
          priority
          className="object-cover brightness-95"
        />

        <div className="absolute inset-0 bg-black/30" />

        <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-6">
          <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
            山と海に囲まれた、みかんの名産地
          </h1>
          <p className="mt-4 text-lg md:text-xl font-light drop-shadow">
            福岡県みやま市山川町 — 自然が育む、特別なみかん
          </p>
        </div>
      </section>

      {/* ============================= */}
      {/* 農園の特徴 */}
      {/* ============================= */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center">山川みかん農園の特徴</h2>

        <p className="text-center text-gray-600 mt-4 leading-relaxed">
          山川町は古くからみかん作りが盛んな地域。<br />
          日当たり・海風・水はけの良い土壌がそろい、柑橘栽培に最適な環境です。
        </p>

        <div className="grid md:grid-cols-3 gap-10 mt-14">

          {/* カード1 */}
          <div className="bg-white rounded-xl shadow-md p-8 text-center border">
            <Image
              src="/mikan/premium.png"
              alt="品質"
              width={180}
              height={180}
              className="mx-auto rounded-lg"
            />
            <h3 className="text-xl font-semibold mt-6">香りと甘みのバランス</h3>
            <p className="text-gray-600 mt-3 leading-relaxed">
              海風によって育つ山川みかんは、甘味と酸味のバランスが良く、
              さわやかな香りが特徴です。
            </p>
          </div>

          {/* カード2 */}
          <div className="bg-white rounded-xl shadow-md p-8 text-center border">
            <Image
              src="/mikan/hand.png"
              alt="収穫"
              width={180}
              height={180}
              className="mx-auto rounded-lg"
            />
            <h3 className="text-xl font-semibold mt-6">ひとつひとつ丁寧に収穫</h3>
            <p className="text-gray-600 mt-3 leading-relaxed">
              収穫はすべて手作業。熟度を見ながら最適なタイミングで収穫しています。
            </p>
          </div>

          {/* カード3 */}
          <div className="bg-white rounded-xl shadow-md p-8 text-center border">
            <Image
              src="/mikan/defect.png"
              alt="訳あり"
              width={180}
              height={180}
              className="mx-auto rounded-lg"
            />
            <h3 className="text-xl font-semibold mt-6">訳あり100円の理由</h3>
            <p className="text-gray-600 mt-3 leading-relaxed">
              見た目に傷があっても味は変わりません。
              “山川みかんを身近に楽しんでほしい”という想いから100円販売を行っています。
            </p>
          </div>

        </div>
      </section>

      {/* ============================= */}
      {/* ストーリー（農園の想い） */}
      {/* ============================= */}
      <section className="bg-[#fafafa] py-20 border-t">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold">私たちの想い</h2>

          <p className="text-gray-700 leading-relaxed text-lg mt-6">
            山川みかん農園では、ただみかんを作るだけではなく、
            「また食べたい」と思っていただける味作りを大切にしています。<br /><br />
            土づくり、木の管理、収穫、選別。  
            そのすべてに心を込め、地域の恵みをそのままお届けします。
          </p>

          <p className="text-gray-600 leading-relaxed mt-6">
            そして、訳あり100円みかんは  
            “気軽に山川のみかんを楽しんでほしい”という気持ちから生まれた取り組みです。
            <br />
            傷があっても、みかんの味は嘘をつきません。
          </p>
        </div>
      </section>

    </main>
  );
}
