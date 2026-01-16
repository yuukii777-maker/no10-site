// app/(whatever)/OrderClient.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef } from "react";

const PREFECTURES = [
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県",
  "岐阜県","静岡県","愛知県","三重県",
  "滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県",
  "鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県",
  "福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県",
  "沖縄県"
];

// GAS エンドポイント
const GAS_URL =
  "https://script.google.com/macros/s/AKfycbw9FiKbkzno4gqGK4jkZKaBB-Cxw8gOYtSCmMBOM8RNX95ZLp_uqxGiHvv0Wzm2eH1s/exec?action=order";

export default function OrderClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URLから商品情報
  const product = searchParams.get("product") || "商品名未設定";
  const size = searchParams.get("size") || "5kg";
  const price = Number(searchParams.get("price")) || 1500;

  // お客様情報
  const [name, setName] = useState("");
  const [postal, setPostal] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");   // ← 任意
  const [email, setEmail] = useState("");   // ← 必須

  const [loading, setLoading] = useState(false);
  const sentOnceRef = useRef(false);

  // 郵便番号 → 住所自動補完
  const fetchAddress = async (zip: string) => {
    if (!/^\d{7}$/.test(zip)) return;
    try {
      const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zip}`);
      const data = await res.json();
      if (data.results && data.results[0]) {
        setPrefecture(data.results[0].address1);
        setAddress(data.results[0].address2 + data.results[0].address3);
      }
    } catch {
      console.error("住所取得失敗");
    }
  };

  const submitOrder = async () => {
    // ✅ 必須チェック（メール必須・電話任意）
    if (!name || !postal || !prefecture || !address || !email) {
      alert("必須項目をすべて入力してください");
      return;
    }
    if (sentOnceRef.current) return;

    setLoading(true);
    sentOnceRef.current = true;

    try {
      const payload = {
        product,
        size,
        price,
        name,
        postal,
        prefecture,
        address,
        phone, // 任意
        email, // 必須
        ua: typeof navigator !== "undefined" ? navigator.userAgent : "",
      };

      await fetch(GAS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: new URLSearchParams({ payload: JSON.stringify(payload) }).toString(),
        keepalive: true,
        mode: "no-cors",
      });

      new Image().src =
        "https://script.google.com/macros/s/AKfycbw9FiKbkzno4gqGK4jkZKaBB-Cxw8gOYtSCmMBOM8RNX95ZLp_uqxGiHvv0Wzm2eH1s/exec" +
        "?action=log&rid=order_submit&ua=" + encodeURIComponent(
          typeof navigator !== "undefined" ? navigator.userAgent : ""
        );

      alert("ご注文を受け付けました。確認メールをお送りしています。");
      router.push("/");
    } catch (e) {
      console.error(e);
      alert("送信中にエラーが発生しました。時間をおいて再度お試しください。");
      sentOnceRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-6 pt-28 pb-24 text-[#333]">
      <h1 className="text-3xl font-bold text-center mb-8">ご購入手続き</h1>

      {/* 注文内容 */}
      <section className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 md:p-8 mb-10">
        <h2 className="text-xl font-bold mb-4">注文内容</h2>
        <p>商品：<strong>{product}</strong></p>
        <p className="mt-2">規格：<strong>{size}</strong></p>
        <p className="text-2xl font-bold text-green-700 mt-4">
          商品代金：{price.toLocaleString()}円
        </p>
        <p className="text-sm text-gray-600 mt-2">※ 送料は別途ご案内します</p>
      </section>

      {/* お届け先 */}
      <section className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6">お届け先情報</h2>
        <div className="space-y-4">
          <input className="w-full border rounded-lg px-4 py-2" placeholder="お名前（必須）" value={name} onChange={(e) => setName(e.target.value)} />
          <input
            className="w-full border rounded-lg px-4 py-2"
            placeholder="郵便番号（7桁・必須）"
            value={postal}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "");
              setPostal(v);
              if (v.length === 7) fetchAddress(v);
            }}
          />
          <select className="w-full border rounded-lg px-4 py-2" value={prefecture} onChange={(e) => setPrefecture(e.target.value)}>
            <option value="">都道府県を選択（必須）</option>
            {PREFECTURES.map((p) => (<option key={p} value={p}>{p}</option>))}
          </select>
          <input className="w-full border rounded-lg px-4 py-2" placeholder="市区町村・番地（必須）" value={address} onChange={(e) => setAddress(e.target.value)} />
          <input className="w-full border rounded-lg px-4 py-2" placeholder="電話番号（任意）" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className="w-full border rounded-lg px-4 py-2" placeholder="メールアドレス（必須）" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <button
          onClick={submitOrder}
          disabled={loading}
          className="mt-8 w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-lg font-bold py-4 rounded-xl shadow-lg transition"
        >
          {loading ? "送信中..." : "注文を確定する"}
        </button>

        <button onClick={() => router.back()} className="mt-4 w-full text-sm text-gray-500 underline">
          商品ページに戻る
        </button>
      </section>
    </main>
  );
}
