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

  return (
    <main className="max-w-5xl mx-auto px-6 pt-28 pb-24 text-[#333]">
      <h1 className="text-4xl font-bold text-center">商品一覧</h1>

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

            {/* 価格 */}
            <p className="text-2xl font-bold text-green-700 mt-6">
              価格：{price.toLocaleString()}円
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

            {/* 購入 */}
            <button
              onClick={() => {
                router.push(
                  `/order?product=${encodeURIComponent("傷あり青島みかん（箱詰め）")}&size=${size}&price=${price}&buntan=${withBuntan}`
                );
              }}
              className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white text-lg font-semibold py-3 rounded-xl shadow-lg transition"
            >
              購入手続きへ
            </button>

            {/* ★ 追加：みかんをカートへ */}
            <button
              onClick={() => {
                addToCart({
                  id: `mikan-${size}-${withBuntan ? "plus500" : "noextra"}`,
                  name: "傷あり青島みかん（箱詰め）",
                  variant: size,
                  unitPrice: price,
                  qty: 1,
                  extra: { withBonus500g: withBuntan },
                });
                // 即時に右下カウントが上がるよう通知
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new Event("yk-cart-updated"));
                }
                alert("カートに追加しました。右下のカートから確認できます。");
              }}
              className="mt-3 w-full bg-white border border-green-600 text-green-700 hover:bg-green-50 text-lg font-semibold py-3 rounded-xl shadow-lg transition"
            >
              カートに入れる
            </button>

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
              className="w-full bg-red-500 text-white text-lg font-bold py-3 rounded-xl opacity-70 cursor-not-allowed"
            >
              現在売り切れ
            </button>
          </div>
        </div>
      </section>

      {/* ====================== */}
      {/* 文旦（タブ切替 + 注文確認 + カート） */}
      {/* ====================== */}
      <section className="mt-24">
        <h2 className="text-3xl font-semibold">文旦（箱）</h2>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-md p-6 md:p-8 mt-4 leading-relaxed text-gray-700">
          さっぱりとした甘さと爽やかな香りの文旦。<br />
          <strong>大きさ不揃いで、5kg箱は6個入り／10kg箱は12個入り</strong>です（目安）。
        </div>

        {/* タブ */}
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => setBuntanTab("5kg")}
            className={`px-4 py-2 rounded-xl border text-sm font-semibold transition ${
              buntanTab === "5kg"
                ? "bg-green-600 text-white border-green-600"
                : "bg-white/80 border-gray-200 hover:bg-green-50"
            }`}
          >
            5kg（6個）
          </button>
          <button
            onClick={() => setBuntanTab("10kg")}
            className={`px-4 py-2 rounded-xl border text-sm font-semibold transition ${
              buntanTab === "10kg"
                ? "bg-green-600 text-white border-green-600"
                : "bg-white/80 border-gray-200 hover:bg-green-50"
            }`}
          >
            10kg（12個）
          </button>
          <button
            onClick={() => setBuntanTab("review")}
            disabled={!buntanSize}
            className={`ml-auto px-4 py-2 rounded-xl border text-sm font-semibold transition ${
              buntanTab === "review"
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white/80 border-gray-200 hover:bg-orange-50"
            } ${!buntanSize ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            注文内容確認
          </button>
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
            {/* 規格タブ内容 */}
            {buntanTab !== "review" && (
              <>
                <h3 className="text-2xl font-bold mb-2">
                  {buntanTab === "5kg" ? "5kg箱（6個入り）" : "10kg箱（12個入り）"}
                </h3>

                <p className="text-sm text-gray-700">
                  価格（送料込み）：{" "}
                  <strong>{PRICE_TABLE[buntanTab].toLocaleString()}円 / 箱</strong>
                </p>

                {/* 箱数 */}
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">箱数</label>
                  <select
                    value={buntanQty}
                    onChange={(e) => setBuntanQty(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} 箱
                      </option>
                    ))}
                  </select>
                </div>

                {/* 注意：一文 */}
                <p className="text-xs text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 mt-4">
                  「5kg／10kg」は箱サイズの目安で、実際は個数基準（5kg箱=6個・10kg箱=12個）で詰めるため、総重量は前後し“6個=5kgぴったり”ではありません。
                </p>

                {/* 次へ */}
                <button
                  onClick={() => {
                    setBuntanSize(buntanTab);
                    setBuntanTab("review");
                  }}
                  className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white text-lg font-semibold py-3 rounded-xl shadow-lg transition"
                >
                  注文内容を確認する
                </button>
              </>
            )}

            {/* 注文確認タブ */}
            {buntanTab === "review" && buntanSize && (
              <>
                <h3 className="text-2xl font-bold mb-2">注文内容の確認</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>商品：文旦（不揃い）</li>
                  <li>規格：{buntanSize === "5kg" ? "5kg（6個）" : "10kg（12個）"}</li>
                  <li>箱数：{buntanQty} 箱</li>
                  <li>
                    小計：
                    <strong className="text-green-700">
                      {(PRICE_TABLE[buntanSize] * buntanQty).toLocaleString()}円
                    </strong>
                    （送料込み）
                  </li>
                </ul>

                {/* イベント（互換：withBuntanを流用） */}
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
                    <p className="text-gray-600 text-xs mt-1">※ 数量限定・無くなり次第終了</p>
                  </div>
                </label>

                {/* アクション */}
                <div className="mt-6 grid sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      addToCart({
                        id: `buntan-${buntanSize}`,
                        name: "文旦（不揃い）",
                        variant: buntanSize === "5kg" ? "5kg（6個）" : "10kg（12個）",
                        unitPrice: PRICE_TABLE[buntanSize],
                        qty: buntanQty,
                        extra: { buntan: withBuntan },
                      });
                      alert("カートに追加しました。右下のカートから確認できます。");
                      window.dispatchEvent(new Event("yk-cart-updated"));
                    }}
                    className="w-full bg-white border border-green-600 text-green-700 hover:bg-green-50 text-lg font-semibold py-3 rounded-xl shadow-lg transition"
                  >
                    カートに入れる
                  </button>

                  <button
                    onClick={() => {
                      const p = PRICE_TABLE[buntanSize] * buntanQty;
                      router.push(
                        `/order?product=${encodeURIComponent("文旦（不揃い）")}` +
                          `&size=${encodeURIComponent(
                            buntanSize === "5kg" ? "5kg（6個）" : "10kg（12個）"
                          )}` +
                          `&qty=${buntanQty}&price=${p}&buntan=${withBuntan}`
                      );
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-semibold py-3 rounded-xl shadow-lg transition"
                  >
                    今すぐ注文
                  </button>
                </div>

                <button
                  onClick={() => setBuntanTab(buntanSize)}
                  className="mt-3 text-sm text-gray-600 underline"
                >
                  ← 規格選択に戻る
                </button>
              </>
            )}
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
