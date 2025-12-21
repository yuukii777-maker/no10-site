"use client";

import Link from "next/link";

export default function ContactPage() {
  const faqs = [
    {
      q: "傷や形に訳があるから安いようですが、傷みやすかったり、味にばらつきが多かったりしますか？",
      a: "傷みやすいことはありませんが、自然物のため稀に傷みが早い個体がある場合があります。購入後は冷暗所で保管し、できるだけ早めにお召し上がりください。また、味のばらつきは個体差がありますので予めご了承ください。",
    },
    {
      q: "状態が悪いものは返品可能ですか？",
      a: "自然物を手作業で選別しているため、1〜2個程度の傷みについては返品が難しい場合があります。ただし、複数個が腐敗していたり、全体的に状態が悪い場合は返金対応いたします。",
    },
    {
      q: "送料はいくらですか？",
      a: "イベント期間中は、九州のお客様は 送料無料。その他の地域は 300円引き、北海道・沖縄など一部地域は 100円引きとなります。（詳細は商品ページをご確認ください）",
    },
    {
      q: "100円みかんはどれくらい入っていますか？",
      a: "大きさにより変動しますが、1袋に4〜6個前後入っています。収穫時期や品種により多少変動があります。",
    },
    {
      q: "どれくらい日持ちしますか？",
      a: "冬場は1〜2週間、暖かい時期は5〜7日が日持ちの目安です。風通しの良い冷暗所での保管をおすすめします。",
    },
    {
      q: "発送はどれくらいで届きますか？",
      a: "新鮮な状態でお届けするため、ご注文から1〜3日以内に発送いたします。（天候・収穫状況により前後あり）",
    },
    {
      q: "ギフト用はありますか？",
      a: "はい。冬ギフトとして綺麗な正規品のみを詰めたギフトみかんをご用意しています。",
    },
  ];

  return (
    <main className="max-w-4xl mx-auto px-6 py-20 text-[#333]">
      <h1 className="text-4xl font-bold text-center mb-10">よくある質問</h1>

      <div className="space-y-8">
        {faqs.map((item, idx) => (
          <div
            key={idx}
            className="bg-white shadow-md rounded-xl p-6 border border-gray-100"
          >
            <h2 className="text-lg font-semibold mb-2">{item.q}</h2>
            <p className="text-gray-700 leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>

      {/* お問い合わせボタン */}
      <div className="text-center mt-16">
        <Link
          href="mailto:example@example.com" // あなたのメールに変える
          className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-full text-lg font-semibold shadow-lg transition inline-block"
        >
          お問い合わせはこちら
        </Link>
      </div>
    </main>
  );
}
