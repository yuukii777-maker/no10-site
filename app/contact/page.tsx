"use client";

import { useState } from "react";
import Link from "next/link";

type FAQ = {
  q: string;
  a: string;
};

export default function ContactPage() {
  const faqs: FAQ[] = [
    {
      q: "本当に100円みかんなんですか？なぜこんなに安いのですか？",
      a: "はい。山口農園の直売所では、実際に1袋100円で販売している家庭用みかんがあります。市場には流通しにくい“小玉”や“外皮に傷のあるもの”が中心ですが、味・中身（果肉）の品質は全く問題ありません。",
    },
    {
      q: "どのような商品が届きますか？",
      a: "ご家庭用のみかんです。大きさ・形にばらつきがあり、表面に傷があるものも含まれますが、食味には問題ありません。見た目より「量と味」を重視される方向けの商品です。",
    },
    {
      q: "内容量はどれくらいですか？",
      a: "1箱あたり約5kgまたは10kgでお届けします。個数の目安は、5kgで約40個〜60個、10kgで約90個〜110個です。みかんの大きさによって個数は前後する場合があります。",
    },
    {
      q: "価格はいくらですか？追加料金はかかりますか？",
      a: "価格は品種や販売時期によって異なる場合があります。最新の価格については商品ページをご確認ください。商品ページに表示されている金額以外に追加料金が発生する場合は、注文確定前にご案内します。",
    },
    {
      q: "発送はいつ頃になりますか？",
      a: "お支払い確定後、原則として3日以内に発送します。収穫状況や天候により前後する場合がありますが、できるだけ新鮮な状態でお届けします。",
    },
    {
      q: "日持ちはどれくらいしますか？",
      a: "冬場は2週間程度、暖かい時期は5〜7日が目安です。風通しの良い冷暗所で保管し、傷みやすいものから先にお召し上がりください。",
    },
    {
      q: "返品・交換はできますか？",
      a: "家庭用商品のため、見た目や個体差による返品・交換はお受けできません。ただし、到着時に多数の腐敗や明らかな品質不良が見受けられる場合は、状況を確認のうえ対応いたします。",
    },
    {
      q: "ギフトや贈答用として使えますか？",
      a: "本商品は家庭用のため、贈答用途にはあまり向いていません。見た目を重視される場合は、正規品みかん（販売時期限定）をご検討ください。",
    },

    // ✅ [MODIFIED] 支払い方法に代引きを追加
    {
      q: "支払い方法は何がありますか？",
      a: "現在は PayPay送金・銀行振込・代引き（代金引換）に対応しています。事前払いの場合は表示金額ぴったりをお支払いください。代引きの場合は商品到着時に配達員へお支払いとなります。",
    },

    // ✅ [ADDED] 代引き手数料のFAQを追加
    {
      q: "代引き（代金引換）の手数料はいくらですか？",
      a: "代引き手数料は【300円】です（合計金額に加算されます）。※地域や配送事情により変更となる場合は、注文確定前に表示します。",
    },

    {
      q: "注文後の流れを教えてください。",
      a: "① 注文フォーム送信 → ② 注文ID発行メールがご登録いただいたアドレスに届きます。 → ③ メール記載のPayPay送金または銀行振込 → ④ 入金確認 → ⑤ 発送、という流れになります。",
    },
    {
      q: "メルマガ解除はどうしたらできますか？",
      a: "登録時に送信したメールに記載のurlをタップ後、配信停止はこちらをクリックで自動で停止となります。",
    },
  ];

  return (
    <main className="max-w-4xl mx-auto px-6 pt-28 pb-24 text-[#333]">
      {/* タイトル */}
      <h1 className="text-4xl font-bold text-center mb-6">
        よくある質問
      </h1>

      <p className="text-center text-gray-600 mb-12 leading-relaxed">
        山口農園のみかんについて、<br className="sm:hidden" />
        ご購入前に多くいただくご質問をまとめました。
      </p>

      {/* FAQ */}
      <div className="space-y-4">
        {faqs.map((item, index) => (
          <AccordionItem key={index} q={item.q} a={item.a} />
        ))}
      </div>

      {/* 導線 */}
      <div className="mt-16 flex justify-center">
        <Link
          href="/products"
          className="
            bg-orange-500 hover:bg-orange-600
            text-white font-semibold
            px-10 py-4 rounded-full
            shadow-lg transition text-center
          "
        >
          商品一覧へ戻る →
        </Link>
      </div>
    </main>
  );
}

/* ===========================
   アコーディオン
=========================== */
function AccordionItem({ q, a }: FAQ) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="
          w-full flex justify-between items-center
          px-6 py-5 text-left
          font-semibold text-[#333]
          hover:bg-orange-50 transition
        "
      >
        <span className="pr-4">{q}</span>
        <span
          className={`text-xl transition-transform ${
            open ? "rotate-45" : ""
          }`}
        >
          ＋
        </span>
      </button>

      {open && (
        <div className="px-6 pb-6 text-gray-700 leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}