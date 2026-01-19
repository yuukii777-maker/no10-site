"use client";

import Image from "next/image";
import { useState, useEffect } from "react"; // ← useEffectを追加（カート用）
import { useRouter } from "next/navigation";

export default function ProductsPage() {
  const router = useRouter();

  // 規格と価格（送料込み）
  const PRICE_TABLE: Record<"5kg" | "10kg", number> = {
    "5kg": 2500,
    "10kg": 4000, // ★ 変更：10kg を 4000 円に
  };

  const [size, setSize] = useState<"5kg" | "10kg">("5kg");
  const [withBuntan, setWithBuntan] = useState(true); // ★ 名称は既存のまま（互換維持）。true=「みかん＋500gおまけ」
  const price = PRICE_TABLE[size];

  // ★ 追加：文旦用タブ/選択/箱数
  const [buntanTab, setBuntanTab] = useState<"5kg" | "10kg" | "review">("5kg");
  const [buntanSize, setBuntanSize] = useState<"5kg" | "10kg" | null>(null);
  const [buntanQty, setBuntanQty] = useState<number>(1);

  /* =========================
     ★ 追加：みかん用の切替ボタン & 数量
  ========================= */
  const [mikanTab, setMikanTab] = useState<"5kg" | "10kg">("5kg");
  const [mikanQty, setMikanQty] = useState<number>(1);

  // ★ 追加：size と みかんタブの同期
  useEffect(() => {
    setMikanTab(size);
  }, [size]);
  /* ========================= */

  return (
    <main className="max-w-5xl mx-auto px-6 pt-28 pb-24 text-[#333]">
      <h1 className="text-4xl font-bold text-center">商品一覧</h1>

      {/* ★ 追加：右上カート（Amazon風） */}
      <CartTopButton />

      <div className="max-w-2xl mx-auto mt-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 md:p-8 text-center text-gray-700">
        見た目に傷はありますが、味には自信のある青島みかんです。
      </div>

      {/* ====================== */}
      {/* 傷あり青島みかん */}
      {/* ====================== */}
      <section className="mt-16">
        <h2 className="text-3xl font-semibold">
          傷あり青島みかん（箱詰め）
        </h2>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 md:p-8 mt-4 leading-relaxed text-gray-700">
          見た目に多少の傷がありますが,  
          <strong>糖度12.5〜13度になることもある</strong>、家庭用に人気のみかんです。
        </div>

        <div className="grid md:grid-cols-2 gap-10 mt-10 items-center">
          <div className="relative w-full h-72 rounded-xl overflow-hidden shadow-md">
            <Image
              src="/mikan/defect.png"
              alt="傷あり青島みかん"
              fill
              className="object-cover"
            />
          </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 md:p-8">
            <h3 className="text-2xl font-bold mb-2">価格（送料込み）</h3>

            {/* ★★ 統一：セグメント型（SP=2行 / MD+=1行） */}
            <div className="mt-2 grid grid-cols-[auto,1fr] items-center gap-3">
              <span className="text-sm text-gray-600">内容量：</span>
              <div className="inline-flex h-12 sm:h-10 rounded-xl border border-gray-200 overflow-hidden w-full sm:w-auto">
                <button
                  onClick={() => { setMikanTab("5kg"); setSize("5kg"); }}
                  className={`flex-1 inline-flex items-center justify-center text-center px-3 sm:px-4 min-w-[140px] sm:min-w-0
                    text-[15px] sm:text-sm leading-snug
                    ${mikanTab==="5kg" ? "bg-green-600 text-white" : "bg-white hover:bg-green-50"}`}
                  aria-pressed={mikanTab==="5kg"}
                >
                  {/* ▼ 2行（SP）/ 1行（MD+） */}
                  <span className="flex flex-col items-center leading-tight sm:flex-row sm:gap-1">
                    <span className="font-semibold whitespace-nowrap">
                      5kg<span className="hidden sm:inline">（6個）</span>
                    </span>
                    <span className="text-[13px] sm:text-sm whitespace-nowrap">2,500円</span>
                  </span>
                </button>
                <button
                  onClick={() => { setMikanTab("10kg"); setSize("10kg"); }}
                  className={`flex-1 inline-flex items-center justify-center text-center px-3 sm:px-4 min-w-[140px] sm:min-w-0
                    text-[15px] sm:text-sm leading-snug border-l border-gray-200
                    ${mikanTab==="10kg" ? "bg-green-600 text-white" : "bg-white hover:bg-green-50"}`}
                  aria-pressed={mikanTab==="10kg"}
                >
                  {/* ▼ 2行（SP）/ 1行（MD+） */}
                  <span className="flex flex-col items-center leading-tight sm:flex-row sm:gap-1">
                    <span className="font-semibold whitespace-nowrap">
                      10kg<span className="hidden sm:inline">（12個）</span>
                    </span>
                    <span className="text-[13px] sm:text-sm whitespace-nowrap">4,000円</span>
                  </span>
                </button>
              </div>
            </div>

            {/* 規格選択 */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">
                内容量を選択
              </label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value as "5kg" | "10kg")}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="5kg">5kg（2,500円）</option>
                <option value="10kg">10kg（4,000円）</option>
              </select>
            </div>

            {/* ★★ 追加：数量（箱数）指定 */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">数量（箱）</label>
              <select
                value={mikanQty}
                onChange={(e)=>setMikanQty(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                {[1,2,3,4,5].map(n=>(
                  <option key={n} value={n}>{n} 箱</option>
                ))}
              </select>
            </div>

            {/* 価格 */}
            <p className="text-2xl font-bold text-green-700 mt-6">
              価格：{price.toLocaleString()}円
            </p>

            {/* ★★ 追加：小計（数量反映） */}
            <p className="text-lg font-semibold text-green-700 mt-1">
              小計：{(price * mikanQty).toLocaleString()}円
            </p>

            <p className="text-sm text-gray-600 mt-2">
              ※ 送料込みです。
            </p>

            {/* ★ イベント：みかん＋500gおまけ */}
            <label
              className="
                mt-4 flex items-center gap-3
                bg-orange-50/70 backdrop-blur-sm
                border border-orange-200
                rounded-xl px-4 py-3
                cursor-pointer
              "
            >
              <input
                type="checkbox"
                checked={withBuntan}
                onChange={(e) => setWithBuntan(e.target.checked)}
                className="w-5 h-5 accent-orange-500"
              />

              <div className="text-sm leading-tight">
                <p className="font-semibold text-orange-700">
                  【期間限定】みかん＋500gおまけ
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  ※ 数量限定・無くなり次第終了
                </p>
              </div>
            </label>

            {/* ★ 2択：カート or 今すぐ購入（※ 購入手続きへ は削除） */}
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  addToCart({
                    id: `mikan-${size}-${withBuntan ? "plus500" : "noextra"}`,
                    name: "傷あり青島みかん（箱詰め）",
                    variant: size,
                    unitPrice: price,
                    qty: mikanQty,
                    extra: { withBonus500g: withBuntan },
                  });
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("yk-cart-updated"));
                  }
                  alert("カートに追加しました。右上のカートからまとめて注文できます。");
                }}
                className="w-full bg-white border border-green-600 text-green-700 hover:bg-green-50 text-lg font-semibold py-3 rounded-xl shadow-lg transition"
              >
                カートに入れる
              </button>

              <button
                onClick={() => {
                  const p = price * mikanQty;
                  router.push(
                    `/order?product=${encodeURIComponent("傷あり青島みかん（箱詰め）")}` +
                    `&size=${encodeURIComponent(size)}` +
                    `&qty=${mikanQty}&price=${p}&buntan=${withBuntan}`
                  );
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-semibold py-3 rounded-xl shadow-lg transition"
              >
                今すぐ注文する
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-3 text-center">
              ※ 家庭用・不揃い商品のため、見た目による返品交換はご遠慮ください
            </p>
          </div>
        </div>
      </section>

      {/* ====================== */}
      {/* 青果みかん（状態良） */}
      {/* ====================== */}
      <section className="mt-24">
        <h2 className="text-3xl font-semibold text-red-700">
          青果みかん
        </h2>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 md:p-8 mt-4 leading-relaxed text-gray-700">
          贈答用・青果基準で選別した高品質みかんです。
          現在は収穫終了のため販売を停止しています。
        </div>

        <div className="grid md:grid-cols-2 gap-10 mt-10 items-center">
          <div className="relative w-full h-72 rounded-xl overflow-hidden shadow-md">
            <Image
              src="/mikan/premium.png"
              alt="青果みかん(状態良)"
              fill
              className="object-cover"
            />
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 md:p-8">
            <h3 className="text-2xl font-bold mb-4">青果</h3>

            <ul className="text-sm text-gray-700 space-y-1 mb-4">
              <li>・5kg：4,500円（送料込み）</li>
              <li>・10kg：8,000円（送料込み）</li>
            </ul>

            <button
              disabled
              className="w-full bg-red-500 text白 text-lg font-bold py-3 rounded-xl opacity-70 cursor-not-allowed"
            >
              現在売り切れ
            </button>
          </div>
        </div>
      </section>

      {/* ====================== */}
      {/* 文旦（みかん形式 + 2択） */}
      {/* ====================== */}
      <section className="mt-24">
        <h2 className="text-3xl font-semibold">文旦（箱）</h2>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 md:p-8 mt-4 leading-relaxed text-gray-700">
          さっぱりとした甘さと爽やかな香りの文旦。<br />
          <strong>大きさ不揃いで、5kg箱は6個入り／10kg箱は12個入り</strong>です（目安）。
        </div>

        <div className="grid md:grid-cols-2 gap-10 mt-6 items-center">
          <div className="relative w-full h-72 rounded-xl overflow-hidden shadow-md">
            <Image
              src="/mikan/buntan.jpg"
              alt="文旦（箱）"
              fill
              className="object-cover"
            />
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 md:p-8">
            {/* ★ みかんと同形式：サイズ切替ボタン（ずれ解消版） */}
<div className="mt-2 grid grid-cols-[auto,1fr] items-center gap-3">
  <span className="text-sm text-gray-600">内容量：</span>

  {/* 2ボタンを1つの“セグメント”にまとめる */}
  <div className="inline-flex h-12 sm:h-10 rounded-xl border border-gray-200 overflow-hidden w-full sm:w-auto">
    <button
      onClick={() => { setBuntanTab("5kg"); setBuntanSize("5kg"); }}
      className={`flex-1 inline-flex items-center justify-center text-center px-3 sm:px-4 min-w-[140px] sm:min-w-0
        text-[15px] sm:text-sm leading-snug
        ${buntanTab==="5kg" ? "bg-green-600 text-white" : "bg-white hover:bg-green-50"}`}
      aria-pressed={buntanTab==="5kg"}
    >
      {/* ▼ 2行（SP）/ 1行（MD+） */}
      <span className="flex flex-col items-center leading-tight sm:flex-row sm:gap-1">
        <span className="font-semibold whitespace-nowrap">
          5kg<span className="hidden sm:inline">（6個）</span>
        </span>
        <span className="text-[13px] sm:text-sm whitespace-nowrap">{PRICE_TABLE["5kg"].toLocaleString()}円</span>
      </span>
    </button>

    <button
      onClick={() => { setBuntanTab("10kg"); setBuntanSize("10kg"); }}
      className={`flex-1 inline-flex items-center justify-center text-center px-3 sm:px-4 min-w-[140px] sm:min-w-0
        text-[15px] sm:text-sm leading-snug border-l border-gray-200
        ${buntanTab==="10kg" ? "bg-green-600 text-white" : "bg-white hover:bg-green-50"}`}
      aria-pressed={buntanTab==="10kg"}
    >
      {/* ▼ 2行（SP）/ 1行（MD+） */}
      <span className="flex flex-col items-center leading-tight sm:flex-row sm:gap-1">
        <span className="font-semibold whitespace-nowrap">
          10kg<span className="hidden sm:inline">（12個）</span>
        </span>
        <span className="text-[13px] sm:text-sm whitespace-nowrap">{PRICE_TABLE["10kg"].toLocaleString()}円</span>
      </span>
    </button>
  </div>
</div>

            {/* 規格選択（既存互換） */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">内容量を選択</label>
              <select
                value={buntanTab}
                onChange={(e)=>{ const v = e.target.value as "5kg"|"10kg"; setBuntanTab(v); setBuntanSize(v); }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="5kg">5kg（6個） / {PRICE_TABLE["5kg"].toLocaleString()}円</option>
                <option value="10kg">10kg（12個） / {PRICE_TABLE["10kg"].toLocaleString()}円</option>
              </select>
            </div>

            {/* 箱数 */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">数量（箱）</label>
              <select
                value={buntanQty}
                onChange={(e) => setBuntanQty(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                {[1,2,3,4,5].map(n=>(
                  <option key={n} value={n}>{n} 箱</option>
                ))}
              </select>
            </div>

            {/* 価格 + 小計 */}
            <p className="text-2xl font-bold text-green-700 mt-6">
              価格：{PRICE_TABLE[buntanTab].toLocaleString()}円 / 箱
            </p>
            <p className="text-lg font-semibold text-green-700 mt-1">
              小計：{(PRICE_TABLE[buntanTab] * buntanQty).toLocaleString()}円
            </p>

            {/* 注意 */}
            <p className="text-xs text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 mt-4">
              「5kg／10kg」は箱サイズの目安で、実際は個数基準（5kg箱=6個・10kg箱=12個）で詰めるため、総重量は前後し“6個=5kgぴったり”ではありません。
            </p>

            {/* 2択：カート or 今すぐ注文 */}
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              <button
                onClick={()=>{
                  addToCart({
                    id: `buntan-${buntanTab}`,
                    name: "文旦（不揃い）",
                    variant: buntanTab === "5kg" ? "5kg（6個）" : "10kg（12個）",
                    unitPrice: PRICE_TABLE[buntanTab],
                    qty: buntanQty,
                    extra: { buntan: withBuntan },
                  });
                  alert("カートに追加しました。右上のカートからまとめて注文できます。");
                  window.dispatchEvent(new Event("yk-cart-updated"));
                }}
                className="w-full bg-white border border-green-600 text-green-700 hover:bg-green-50 text-lg font-semibold py-3 rounded-xl shadow-lg transition"
              >
                カートに入れる
              </button>

              <button
                onClick={()=>{
                  const p = PRICE_TABLE[buntanTab] * buntanQty;
                  router.push(
                    `/order?product=${encodeURIComponent("文旦（不揃い）")}` +
                    `&size=${encodeURIComponent(buntanTab === "5kg" ? "5kg（6個）" : "10kg（12個）")}` +
                    `&qty=${buntanQty}&price=${p}&buntan=${withBuntan}`
                  );
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-semibold py-3 rounded-xl shadow-lg transition"
              >
                今すぐ注文する
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 右下カート */}
      <CartWidget />
    </main>
  );
}

/* ===========================
   簡易カート（localStorage）
=========================== */
type CartItem = {
  id: string;                 // 例: "buntan-5kg"
  name: string;               // 例: "文旦（不揃い）"
  variant: string;            // 例: "5kg（6個）"
  unitPrice: number;          // 単価（送料込み）
  qty: number;                // 箱数
  extra?: Record<string, any>;
};

const CART_KEY = "yk_cart";

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  // ★ 追加：右下カート更新通知
  window.dispatchEvent(new Event("yk-cart-updated"));
}
function addToCart(item: CartItem) {
  const items = readCart();
  const idx = items.findIndex((x) => x.id === item.id && x.variant === item.variant);
  if (idx >= 0) {
    items[idx].qty += item.qty;
  } else {
    items.push(item);
  }
  writeCart(items);
}
function cartCount(): number {
  return readCart().reduce((sum, it) => sum + it.qty, 0);
}

/* ===========================
   右下フローティング・カート
=========================== */
function CartWidget() {
  const [count, setCount] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const update = () => setCount(cartCount());
    update();
    window.addEventListener("storage", update);
    window.addEventListener("yk-cart-updated", update as any);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("yk-cart-updated", update as any);
    };
  }, []);

  if (count <= 0) return null;

  return (
    <button
      onClick={() => router.push("/order?cart=1")}
      className="fixed z-50 right-5 bottom-5 flex items-center gap-2 rounded-full px-5 py-3
                 bg-orange-500 text-white shadow-lg hover:bg-orange-600 transition"
      aria-label="カートを見る"
      title="カートを見る"
    >
      🛒 カート <span className="ml-1 font-bold">{count}</span>
    </button>
  );
}

/* ===========================
   ★ 追加：右上カート（Amazon風）
=========================== */
function CartTopButton() {
  const router = useRouter();
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const update = () => setCount(cartCount());
    update();
    window.addEventListener("storage", update);
    window.addEventListener("yk-cart-updated", update as any);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("yk-cart-updated", update as any);
    };
  }, []);

  return (
    <button
      onClick={() => router.push("/order?cart=1")}
      className="fixed z-50 right-5 top-20 sm:top-24 flex items-center gap-2 rounded-full px-4 py-2
                 bg-white/90 backdrop-blur border border-gray-200 shadow hover:bg-white"
      aria-label="カートへ（まとめて注文）"
      title="カートへ（まとめて注文）"
    >
      🛒<span className="text-sm font-semibold">カート</span>
      <span className="ml-1 inline-flex items-center justify-center min-w-[1.5rem] h-6 text-xs font-bold rounded-full bg-green-600 text-white px-2">
        {count}
      </span>
    </button>
  );
}
