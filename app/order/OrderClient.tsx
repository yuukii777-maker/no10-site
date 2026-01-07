"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function OrderClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URLから注文情報を取得
  const boxes = Number(searchParams.get("boxes")) || 1;
  const price = Number(searchParams.get("price")) || 3000;

  // お客様情報
  const [name, setName] = useState("");
  const [postal, setPostal] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  // =========================
  // 注文送信（GASへ）
  // =========================
  const submitOrder = async () => {
    if (!name || !postal || !prefecture || !address || !phone || !email) {
      alert("すべての項目を入力してください");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "https://script.google.com/macros/s/AKfycbyPr7e6l31p64tr_qbygG-DAPfwBG_qAXi4j0K25Tuap61ImT1zy7jOIQAMEsvxN5c/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // ▼ 直叩き防止用（GAS側と一致させる）
            secret: "YAMAKAWA_MIKAN_100",

            // ▼ 注文情報
            product: "山川100円みかん（家庭用）",
            boxes,
            price,

            // ▼ お客様情報
            name,
            postal,
            prefecture,
            address,
            phone,
            email,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("送信に失敗しました");
      }

      alert("ご注文を受け付けました。ありがとうございます！");
      router.push("/"); // /thanks を作ったら差し替えOK

    } catch (error) {
      console.error(error);
      alert("送信中にエラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-6 pt-28 pb-24 text-[#333]">
      <h1 className="text-3xl font-bold text-center mb-8">
        ご購入手続き
      </h1>

      {/* ===================== */}
      {/* 注文内容 */}
      {/* ===================== */}
      <section className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 md:p-8 mb-10">
        <h2 className="text-xl font-bold mb-4">注文内容</h2>

        <p>
          商品：<strong>山川100円みかん（家庭用）</strong>
        </p>

        <p className="mt-2">
          内容量：<strong>約10kg × {boxes}箱</strong><br />
          <span className="text-sm text-gray-600">
            （1袋 約600g × 16〜18袋分・目安）
          </span>
        </p>

        <p className="mt-2">
          発送：<strong>ご注文から3日以内</strong>
        </p>

        <p className="text-2xl font-bold text-green-700 mt-4">
          合計金額：{price.toLocaleString()}円（税込・送料込み）
        </p>
      </section>

      {/* ===================== */}
      {/* お客様情報 */}
      {/* ===================== */}
      <section className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6">お届け先情報</h2>

        <div className="space-y-4">
          <input
            className="w-full border rounded-lg px-4 py-2"
            placeholder="お名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="w-full border rounded-lg px-4 py-2"
            placeholder="郵便番号"
            value={postal}
            onChange={(e) => setPostal(e.target.value)}
          />
          <input
            className="w-full border rounded-lg px-4 py-2"
            placeholder="都道府県"
            value={prefecture}
            onChange={(e) => setPrefecture(e.target.value)}
          />
          <input
            className="w-full border rounded-lg px-4 py-2"
            placeholder="市区町村・番地"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <input
            className="w-full border rounded-lg px-4 py-2"
            placeholder="電話番号"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            className="w-full border rounded-lg px-4 py-2"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* ===================== */}
        {/* 支払い注意事項 */}
        {/* ===================== */}
        <div className="mt-6 text-sm text-gray-700 leading-relaxed bg-white/40 rounded-lg p-4">
          <p className="font-bold mb-2">【PayPay・銀行振込でのお支払いについて】</p>
          <ul className="list-disc list-inside space-y-1">
            <li>表示された金額ぴったりをお支払いください</li>
            <li>注文IDを必ずメッセージ欄・振込名義にご記入ください</li>
            <li>金額・注文IDが一致しない場合、発送されません</li>
          </ul>
        </div>

        {/* 注意書き */}
        <div className="text-sm text-gray-600 mt-4 leading-relaxed">
          <p>※ 家庭用・不揃いの商品です。</p>
          <p>※ 見た目による返品・交換はご遠慮ください。</p>
          <p>※ お支払い方法：PayPay送金 または 銀行振込</p>
        </div>

        {/* 送信ボタン */}
        <button
          onClick={submitOrder}
          disabled={loading}
          className="
            mt-8 w-full
            bg-green-600 hover:bg-green-700
            disabled:bg-gray-400
            text-white text-lg font-bold
            py-4 rounded-xl shadow-lg
            transition
          "
        >
          {loading ? "送信中..." : "注文を確定する"}
        </button>

        <button
          onClick={() => router.back()}
          className="mt-4 w-full text-sm text-gray-500 underline"
        >
          商品ページに戻る
        </button>
      </section>
    </main>
  );
}
