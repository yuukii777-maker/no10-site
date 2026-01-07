"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function OrderClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const boxes = Number(searchParams.get("boxes")) || 1;
  const price = Number(searchParams.get("price")) || 3000;

  const [name, setName] = useState("");
  const [postal, setPostal] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  return (
    <main className="max-w-3xl mx-auto px-6 pt-28 pb-24 text-[#333]">
      <h1 className="text-3xl font-bold text-center mb-8">
        ご購入手続き
      </h1>

      {/* 注文内容 */}
      <section className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 md:p-8 mb-10">
        <h2 className="text-xl font-bold mb-4">注文内容</h2>

        <p>商品：<strong>山川100円みかん（家庭用）</strong></p>
        <p>
          内容量：<strong>約10kg × {boxes}箱</strong><br />
          <span className="text-sm text-gray-600">
            （1袋 約600g × 16〜18袋分）
          </span>
        </p>
        <p>発送：<strong>ご注文から3日以内</strong></p>

        <p className="text-2xl font-bold text-green-700 mt-4">
          合計金額：{price.toLocaleString()}円（税込・送料込み）
        </p>
      </section>

      {/* お客様情報 */}
      <section className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6">お届け先情報</h2>

        <div className="space-y-4">
          <input className="w-full border rounded-lg px-4 py-2" placeholder="お名前" onChange={(e) => setName(e.target.value)} />
          <input className="w-full border rounded-lg px-4 py-2" placeholder="郵便番号" onChange={(e) => setPostal(e.target.value)} />
          <input className="w-full border rounded-lg px-4 py-2" placeholder="都道府県" onChange={(e) => setPrefecture(e.target.value)} />
          <input className="w-full border rounded-lg px-4 py-2" placeholder="市区町村・番地" onChange={(e) => setAddress(e.target.value)} />
          <input className="w-full border rounded-lg px-4 py-2" placeholder="電話番号" onChange={(e) => setPhone(e.target.value)} />
          <input className="w-full border rounded-lg px-4 py-2" placeholder="メールアドレス" onChange={(e) => setEmail(e.target.value)} />
        </div>

        <button
          className="mt-8 w-full bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg"
          onClick={() => alert("PayPay決済（仮）")}
        >
          PayPayで購入を確定する
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
