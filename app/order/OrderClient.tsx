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

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbw9FiKbkzno4gqGK4jkZKaBB-Cxw8gOYtSCmMBOM8RNX95ZLp_uqxGiHvv0Wzm2eH1s/exec?action=order";

/* =========================
   ★ 到着希望（時間帯のみ）
========================= */
function DeliveryPicker({
  valueSlot,
  onChange,
}: {
  valueSlot: string | null;
  onChange: (s: string | null) => void;
}) {
  const slots = ["午前中","12-14","14-16","16-18","18-20","19-21"];

  return (
    <section className="mt-6">
      <h3 className="text-lg font-semibold">到着希望（任意）</h3>

      <div className="mt-3">
        <label className="block text-sm mb-1">時間帯（任意）</label>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          value={valueSlot ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
        >
          <option value="">指定なし</option>
          {slots.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        ※ 交通・天候・地域事情によりご希望に沿えない場合があります。
      </p>
    </section>
  );
}
/* ========================= */

 /* =========================
   ★ カート会計サポート
========================= */
type CartItem = {
  id: string;
  name: string;
  variant: string;
  unitPrice: number;
  qty: number;
  extra?: Record<string, any>;
};
const CART_KEY = "yk_cart";
const readCart = (): CartItem[] => {
  try { return JSON.parse((typeof window !== "undefined" && localStorage.getItem(CART_KEY)) || "[]"); }
  catch { return []; }
};
const writeCart = (items: CartItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("yk-cart-updated"));
};
/* ========================= */

/* =========================================================
   ★ 送信を絶対に通すフォールバック付きPOST関数（このファイル内だけで完結）
   1) fetch + x-www-form-urlencoded（従来）
   2) navigator.sendBeacon（CORSに強い）
   3) 見えない <iframe> + <form> POST（最終手段）
========================================================= */
async function postToGASWithFallback(params: URLSearchParams): Promise<void> {
  // 1) fetch（従来どおり）
  try {
    await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: params.toString(),
      keepalive: true,
      mode: "no-cors",
    });
    return;
  } catch (_) {
    // 次へ
  }

  // 2) sendBeacon（ヘッダ指定不可だが多くの環境で到達する）
  try {
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const ok = (navigator as any).sendBeacon(GAS_URL, params);
      if (ok) return;
    }
  } catch (_) {
    // 次へ
  }

  // 3) 隠しiframe + form POST（レスポンスは読まず送るだけ）
  await new Promise<void>((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.name = "yk_hidden_iframe_" + Math.random().toString(36).slice(2);
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const form = document.createElement("form");
    form.action = GAS_URL;
    form.method = "POST";
    form.target = iframe.name;
    form.style.display = "none";

    // URLSearchParams → hidden inputs
    params.forEach((v, k) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = k;
      input.value = v;
      form.appendChild(input);
    });

    document.body.appendChild(form);

    const cleanup = () => {
      try { document.body.removeChild(form); } catch {}
      try { document.body.removeChild(iframe); } catch {}
      resolve();
    };

    // ロード/エラー/タイムアウトのいずれでも後片付けして完了扱い
    const timer = window.setTimeout(cleanup, 3000);
    iframe.addEventListener("load", () => { clearTimeout(timer); cleanup(); });
    iframe.addEventListener("error", () => { clearTimeout(timer); cleanup(); });

    form.submit();
  });
}
/* ========================================================= */

export default function OrderClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const product = searchParams.get("product") || "商品名未設定";
  const size = searchParams.get("size") || "5kg";
  const price = Number(searchParams.get("price")) || 1500;

  const [name, setName] = useState("");
  const [postal, setPostal] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const sentOnceRef = useRef(false);

  // ★ 送信完了フラグ
  const [submitted, setSubmitted] = useState(false);

  /* =========================
     ★ 到着希望（時間帯のみ）
  ========================= */
  const [reqTime, setReqTime] = useState<string | null>(null);
  /* ========================= */

  /* =========================
     ★ カート会計の状態
  ========================= */
  const cartMode = searchParams.get("cart") === "1";
  const [cartItems, setCartItems] = useState<CartItem[]>(() => readCart());
  const subtotal = cartItems.reduce((s, it) => s + it.unitPrice * it.qty, 0);

  const inc = (i: number) => {
    if (!cartMode) return;
    const next = [...cartItems]; next[i].qty++; setCartItems(next); writeCart(next);
  };
  const dec = (i: number) => {
    if (!cartMode) return;
    const next = [...cartItems]; next[i].qty = Math.max(1, next[i].qty - 1); setCartItems(next); writeCart(next);
  };
  const removeAt = (i: number) => {
    if (!cartMode) return;
    const next = cartItems.filter((_, idx) => idx !== i); setCartItems(next); writeCart(next);
  };
  const clearCart = () => { if (!cartMode) return; setCartItems([]); writeCart([]); };

  const submitCartOrder = async () => {
    if (cartItems.length === 0) { alert("カートが空です。"); return; }
    if (!name || !postal || !prefecture || !address || !email) {
      alert("必須項目をすべて入力してください");
      return;
    }
    if (sentOnceRef.current) return;
    setLoading(true);
    sentOnceRef.current = true;

    try {
      const payload = {
        mode: "cart",
        items: cartItems.map(it => ({
          id: it.id, name: it.name, variant: it.variant, unitPrice: it.unitPrice, qty: it.qty, extra: it.extra
        })),
        subtotal,
        buyer: { name, postal, prefecture, address, phone, email },
        ua: typeof navigator !== "undefined" ? navigator.userAgent : "",
        // ★ 到着希望（時間帯のみ）
        request_time: reqTime,
      };

      const params = new URLSearchParams({ payload: JSON.stringify(payload) });
      // doPost側で action が必要なので付与（既存どおり）
      params.set("action", "order");

      await postToGASWithFallback(params);

      clearCart();
      setSubmitted(true);
    } catch (e) {
      console.error(e);
      alert("送信中にエラーが発生しました。時間をおいて再度お試しください。");
      sentOnceRef.current = false;
    } finally {
      setLoading(false);
    }
  };
  /* ========================= */

  const fetchAddress = async (zip: string) => {
    if (!/^\d{7}$/.test(zip)) return;
    try {
      const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zip}`);
      const data = await res.json();
      if (data.results && data.results[0]) {
        setPrefecture(data.results[0].address1);
        setAddress(data.results[0].address2 + data.results[0].address3);
      }
    } catch {}
  };

  const submitOrder = async () => {
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
        phone,
        email,
        ua: typeof navigator !== "undefined" ? navigator.userAgent : "",
        // ★ 到着希望（時間帯のみ）
        request_time: reqTime,
      };

      const params = new URLSearchParams({ payload: JSON.stringify(payload) });
      params.set("action", "order");

      await postToGASWithFallback(params);

      // ★ 画面表示用に完了状態へ
      setSubmitted(true);

    } catch (e) {
      console.error(e);
      alert("送信中にエラーが発生しました。時間をおいて再度お試しください。");
      sentOnceRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  // ★ カート会計UI（?cart=1 かつ 未送信時）
  if (cartMode && !submitted) {
    return (
      <main className="max-w-5xl mx-auto px-6 pt-28 pb-24 text-[#333]">
        <h1 className="text-3xl font-bold text-center">カートのご注文</h1>

        <section className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 md:p-8 mt-8">
          <h2 className="text-xl font-bold mb-4">注文内容</h2>
          {cartItems.length === 0 ? (
            <div className="text-center text-gray-600">
              カートは空です。<button className="text-orange-600 underline" onClick={()=>router.push("/products")}>商品一覧へ</button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((it, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 border-b pb-4">
                  <div className="flex-1">
                    <div className="font-semibold">{it.name}</div>
                    <div className="text-sm text-gray-600">{it.variant}</div>
                    <div className="text-sm text-gray-500">単価：{it.unitPrice.toLocaleString()}円</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => dec(i)} className="px-3 py-1 rounded border">−</button>
                    <span className="w-10 text-center">{it.qty}</span>
                    <button onClick={() => inc(i)} className="px-3 py-1 rounded border">＋</button>
                  </div>
                  <div className="w-24 text-right font-semibold">
                    {(it.unitPrice * it.qty).toLocaleString()}円
                  </div>
                  <button onClick={() => removeAt(i)} className="text-sm text-gray-600 underline self-start sm:self-auto">
                    削除
                  </button>
                </div>
              ))}

              <div className="flex justify-between items-center pt-2">
                <button onClick={clearCart} className="text-sm text-gray-500 underline">
                  カートを空にする
                </button>
                <div className="text-xl font-bold">合計：{subtotal.toLocaleString()}円（送料込み）</div>
              </div>
            </div>
          )}
        </section>

        {/* お届け先（既存フォームをそのまま使用） */}
        {cartItems.length > 0 && (
          <section className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 md:p-8 mt-8">
            <h2 className="text-xl font-bold mb-6">お届け先情報</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <input className="w-full border rounded-lg px-4 py-2" placeholder="お名前（必須）" value={name} onChange={(e) => setName(e.target.value)} />
              <input className="w-full border rounded-lg px-4 py-2" placeholder="郵便番号（7桁・必須）" value={postal}
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

            {/* ★ 到着希望（時間帯のみ） */}
            <DeliveryPicker
              valueSlot={reqTime}
              onChange={(s) => setReqTime(s)}
            />

            <div className="mt-6 flex結-col sm:flex-row gap-3 justify-end">
              <button
                onClick={submitCartOrder}
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white shadow disabled:opacity-60"
              >
                {loading ? "送信中..." : "注文を確定する"}
              </button>
              <button
                onClick={() => router.push("/products")}
                className="px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50"
              >
                買い物を続ける
              </button>
            </div>
          </section>
        )}
      </main>
    );
  }

  // ★ 完了画面
  if (submitted) {
    return (
      <main className="max-w-2xl mx-auto px-6 pt-40 pb-24 text-center text-[#333]">
        <h1 className="text-3xl font-bold mb-6">ご購入ありがとうございます</h1>
        <p className="text-lg leading-relaxed">
          詳細は、ご登録いただいたメールアドレス宛へのメッセージをご確認の上、<br />
          お支払いをお願いいたします。
        </p>

        <button
          onClick={() => router.push("/")}
          className="mt-10 bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-xl"
        >
          トップページへ戻る
        </button>
      </main>
    );
  }

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
        <p className="text-sm text-gray-600 mt-2">※ 送料込みです</p>
      </section>

      {/* お届け先 */}
      <section className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6">お届け先情報</h2>
        <div className="space-y-4">
          <input className="w-full border rounded-lg px-4 py-2" placeholder="お名前（必須）" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full border rounded-lg px-4 py-2" placeholder="郵便番号（7桁・必須）" value={postal}
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

        {/* ★ 到着希望（時間帯のみ） */}
        <DeliveryPicker
          valueSlot={reqTime}
          onChange={(s) => setReqTime(s)}
        />

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
