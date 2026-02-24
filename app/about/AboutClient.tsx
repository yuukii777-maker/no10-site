"use client";

import Image from "next/image";
import SubFlash from "../../components/SubFlash"; // ★修正：正しい相対パス（二階層上）

export default function AboutClient() {
  return (
    <main className="text-[#333]">
      {/* ============================= */}
      {/* ヒーロー */}
      {/* ============================= */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <Image
          src="/mikan/farm.png"
          alt="農園の風景"
          fill
          priority
          className="object-cover brightness-[0.85]"
        />
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />

        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-6">
          <h1 className="text-4xl md:text-6xl font-bold drop-shadow-xl">
            農園について
          </h1>
          <p className="mt-4 text-lg md:text-xl drop-shadow">
            山川の自然が育てる、甘くて香り高いみかん
          </p>
        </div>
      </section>

      {/* ============================= */}
      {/* ごあいさつ（追加） */}
      {/* ============================= */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center">ごあいさつ</h2>
        <div className="prose prose-neutral max-w-none text-[15px] sm:text-base leading-relaxed mt-6">
          <p>お問い合わせありがとうございます。</p>
          <p>
            私たち夫婦は2023年3月で脱サラし、同年4月よりみかん農家として新規就農しました。
            現在の第1次産業において最大の課題は<strong>地球温暖化</strong>です。わがみかん農園でも、
            樹の仕立て・樹勢強化・土づくりを中心に、気候の振れ幅に負けない畑づくりに取り組んでいます。
          </p>
          <p>
            「毎年あたりまえに“おいしい”と言っていただけるみかんを届ける」——そのあたりまえを守るために、
            夫婦で力を合わせて小さな改善を積み重ねています。当サイトでは、
            <strong>贈答品（正規品）</strong>と<strong>訳あり品（小玉・キズあり）</strong>を中心に販売しています。
            詳細は販売ページにてご確認ください。
          </p>
          <p>
            畑の様子や収穫期のお知らせは、下のフォームからご登録いただける
            <strong>メルマガ</strong>でもお届けします。ぜひ季節の便りをお受け取りください。
          </p>
        </div>

        {/* メルマガ登録フォーム（追加） */}
        <form
          action="/api/subscribe"
          method="POST"
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <input
            name="email"
            type="email"
            required
            placeholder="メールアドレス"
            className="w-full rounded-xl border px-3 py-2"
          />
          <input type="hidden" name="source" value="about_page" />
          <button className="rounded-xl border px-4 py-2 font-semibold hover:opacity-90">
            メルマガ登録
          </button>
        </form>
        <p className="mt-2 text-xs text-gray-600">
          登録は無料・いつでも解除できます（配信メール末尾のリンクから1クリック停止）。
        </p>
      </section>

      {/* ============================= */}
      {/* 山川の環境 */}
      {/* ============================= */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3次 font-bold text-center">
          山川がみかんに向く理由
        </h2>

        <p className="text-center text-gray-600 mt-4 leading-relaxed">
          山川町は海風・日当たり・水はけの良い傾斜がそろった、
          みかん栽培に最適な地域です。
        </p>

        <div className="grid md:grid-cols-2 gap-10 mt-14 items-center">
          <div className="relative w-full h-72 rounded-xl overflow-hidden shadow-lg">
            <Image
              src="/mikan/farm.png"
              alt="山川の環境"
              fill
              className="object-cover"
            />
          </div>

          <div>
            <h3 className="text-xl font-semibold">海風が運ぶミネラル</h3>
            <p className="text-gray-600 mt-3 leading-relaxed">
              海に近い地域ならではのミネラルが葉に付き、
              みかんの香りと甘さを引き出します。
            </p>

            <h3 className="text-xl font-semibold mt-8">
              日当たりの良い南向きの畑
            </h3>
            <p className="text-gray-600 mt-3 leading-relaxed">
              しっかり光を浴びることで、果肉の甘さとコクが育まれます。
            </p>

            <h3 className="text-xl font-semibold mt-8">
              水はけの良い傾斜地
            </h3>
            <p className="text-gray-600 mt-3 leading-relaxed">
              傾斜によって余分な水分が残らず、
              濃厚な甘味を持つみかんに育ちます。
            </p>
          </div>
        </div>
      </section>

      {/* ============================= */}
      {/* 手作業 */}
      {/* ============================= */}
      <section className="max-w-5xl mx-auto px-6 py-20 section-soft">
        <h2 className="text-3xl font-bold text-center">
          ひとつひとつ、丁寧な手作業
        </h2>

        <p className="text-center text-gray-600 mt-4 leading-relaxed">
          みかんは生き物。木の状態・日差し・熟度を見ながら、
          手作業で最適なタイミングを見極めています。
        </p>

        <div className="grid md:grid-cols-2 gap-10 mt-14 items-center">
          <div>
            <h3 className="text-xl font-semibold">熟度の見極め</h3>
            <p className="text-gray-600 mt-3 leading-relaxed">
              熟しすぎる前に、甘味が最も乗ったタイミングで収穫します。
            </p>

            <h3 className="text-xl font-semibold mt-8">
              丁寧にハサミで収穫
            </h3>
            <p className="text-gray-600 mt-3 leading-relaxed">
              実を傷つけないよう、
              ハサミで一つひとつ収穫しています。
            </p>
          </div>

          <div className="relative w-full h-72 rounded-xl overflow-hidden shadow-lg">
            <Image
              src="/mikan/hand.png"
              alt="手作業の収穫"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ============================= */}
      {/* 訳ありみかん */}
      {/* ============================= */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center">
          訳あり100円みかんについて
        </h2>

        <p className="text-center text-gray-600 mt-4 leading-relaxed">
          傷があっても味はそのまま。
          「山川みかんを気軽に楽しんでほしい」
          という想いから生まれた取り組みです。
        </p>

        <div className="relative w-full h-72 md:h-96 mt-12 rounded-xl overflow-hidden shadow-lg">
          <Image
            src="/mikan/defect.png"
            alt="訳ありみかん"
            fill
            className="object-cover"
          />
        </div>
      </section>

      <SubFlash /> {/* ★追加：?sub=ok/err/unsub に反応して中央表示 */}
    </main>
  );
}
