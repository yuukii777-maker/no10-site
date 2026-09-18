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
      a: "商品によって異なります。家庭用みかんは、大きさや形にばらつきがあり、表面に傷があるものも含まれますが、味や中身には問題ありません。青果商品については、見た目や品質を選別したみかんをお届けします。詳しくは各商品ページをご確認ください。",
    },
    {
      q: "内容量はどれくらいですか？",
      a: "1箱あたり約5kgまたは10kgでお届けします。個数の目安は、5kgで約40個〜60個、10kgで約90個〜110個です。みかんの大きさによって個数は前後する場合があります。",
    },
    {
      q: "価格はいくらですか？追加料金はかかりますか？",
      a: "価格は品種・内容量・販売時期によって異なります。最新の価格は各商品ページをご確認ください。追加料金が発生するのは代引き（代金引換）をご利用の場合のみで、商品代金に代引き手数料300円が加算されます。それ以外の追加料金はかかりません。",
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
      a: "はい。ギフト・贈答用としてご利用いただける青果商品も販売しています。家庭用商品は見た目にばらつきや傷がある場合があるため、ご自宅用におすすめしています。贈答用をご希望の場合は、各商品ページに記載している青果商品をご確認ください。",
    },
    {
      q: "支払い方法は何がありますか？",
      a: "現在はPayPay送金・銀行振込・代引き（代金引換）に対応しています。事前払いの場合は表示金額ぴったりをお支払いください。代引きの場合は商品到着時に配達員へお支払いとなります。",
    },
    {
      q: "代引き（代金引換）の手数料はいくらですか？",
      a: "代引き手数料は300円です。商品代金に加算され、商品到着時に配達員へお支払いいただきます。",
    },
    {
      q: "注文後の流れを教えてください。",
      a: "① 注文フォーム送信 → ② 注文内容・注文IDを記載したメールが、ご登録いただいたメールアドレスに届きます。PayPay送金・銀行振込の場合は、メール記載の方法でお支払い後、入金確認ができ次第発送します。代引き（代金引換）の場合は事前のお支払いは不要です。商品発送後、商品到着時に配達員へ代金をお支払いください。",
    },
    {
      q: "メルマガ解除はどうしたらできますか？",
      a: "登録時に送信したメールに記載されているURLを開き、「配信停止はこちら」をタップすると、自動で配信停止となります。",
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