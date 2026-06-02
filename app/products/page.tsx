"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  tag: string;
  image_url: string | null;
  description: string | null;
  notice: string | null;
  price_5kg: number | null;
  price_10kg: number | null;
  unit_label: string | null;
  stock_status: string;
  is_active: boolean;
  sort_order: number | null;
};

type CartItem = {
  id: string;
  name: string;
  variant: string;
  unitPrice: number;
  qty: number;
  extra?: Record<string, any>;
};

const CART_KEY = "yk_cart";
const NEWS_LINK = "/news";

/* ===== [TEMP_NEXT_SALE_COMPARISON_IMAGE_START] 告知終了後はここから削除 ===== */
const NEXT_SALE_COMPARISON_IMAGE = "/mikan/hayami-hinami-comparison.png";
/* ===== [TEMP_NEXT_SALE_COMPARISON_IMAGE_END] 告知終了後はここまで削除 ===== */

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
  window.dispatchEvent(new Event("yk-cart-updated"));
}

function addToCart(item: CartItem) {
  const items = readCart();
  const index = items.findIndex(
    (cartItem) => cartItem.id === item.id && cartItem.variant === item.variant
  );

  if (index >= 0) {
    items[index].qty += item.qty;
  } else {
    items.push(item);
  }

  writeCart(items);
}

function cartCount() {
  return readCart().reduce((sum, item) => sum + item.qty, 0);
}

function yen(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";
  return `${value.toLocaleString()}円`;
}

function SectionBadge({
  tone = "green",
  children,
}: {
  tone?: "green" | "orange" | "amber" | "red" | "stone" | "gold";
  children: React.ReactNode;
}) {
  const tones = {
    green: "bg-green-50 text-green-700 border-green-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
    stone: "bg-stone-50 text-stone-700 border-stone-200",
    gold: "bg-yellow-50 text-yellow-800 border-yellow-200",
  } as const;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] sm:text-xs font-black tracking-[0.08em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function CartTopButton() {
  const router = useRouter();
  const [count, setCount] = useState(0);

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
      className="hidden sm:flex fixed z-50 right-5 top-20 sm:top-24 items-center gap-2 rounded-full px-4 py-2.5 bg-white/92 backdrop-blur border border-white/80 shadow-[0_10px_25px_rgba(0,0,0,0.12)] hover:bg-white transition"
      aria-label="カートへ"
      title="カートへ"
    >
      <span className="text-lg">🛒</span>
      <span className="text-sm font-bold text-gray-800">カート</span>
      <span className="ml-1 inline-flex items-center justify-center min-w-[1.6rem] h-6 text-xs font-black rounded-full bg-green-600 text-white px-2">
        {count}
      </span>
    </button>
  );
}

function CartWidget() {
  const router = useRouter();
  const [count, setCount] = useState(0);

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
      className="fixed sm:hidden z-50 right-5 bottom-5 flex items-center gap-2 rounded-full px-5 py-3 bg-orange-500 text-white shadow-[0_16px_35px_rgba(249,115,22,0.35)] hover:bg-orange-600 transition"
      aria-label="カートを見る"
      title="カートを見る"
    >
      🛒 カート <span className="ml-1 font-bold">{count}</span>
    </button>
  );
}

function SaleNoticeCard() {
  return (
    <section id="next-sale" className="mt-5 scroll-mt-28">
      <div className="relative overflow-hidden rounded-[30px] border border-orange-200 bg-gradient-to-br from-[#fff8ef] via-white to-[#f4fff3] shadow-[0_18px_44px_rgba(0,0,0,0.08)]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-14 right-0 h-40 w-40 rounded-full bg-orange-200/25 blur-3xl" />
          <div className="absolute -bottom-16 left-0 h-44 w-44 rounded-full bg-green-200/20 blur-3xl" />
        </div>

        <div className="relative px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-wrap items-center gap-2">
            <SectionBadge tone="orange">次回販売のお知らせ</SectionBadge>
            <SectionBadge tone="green">2026年秋予定</SectionBadge>
            <SectionBadge tone="stone">メルマガ案内予定</SectionBadge>
          </div>

          <h2 className="mt-4 text-[1.45rem] sm:text-[2rem] leading-tight font-black tracking-tight text-[#2b3528]">
            次回は「早味かん」から販売開始予定です
          </h2>

          {/* ===== [TEMP_NEXT_SALE_COMPARISON_IMAGE_START] 告知終了後はここから削除 ===== */}
          <div className="mt-5 overflow-hidden rounded-[24px] border border-orange-100 bg-white shadow-[0_14px_34px_rgba(0,0,0,0.08)]">
            <div className="relative aspect-[16/9] w-full">
              <img
                src={NEXT_SALE_COMPARISON_IMAGE}
                alt="早味かんと日南の次回販売予定"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          {/* ===== [TEMP_NEXT_SALE_COMPARISON_IMAGE_END] 告知終了後はここまで削除 ===== */}

          <p className="mt-4 text-sm sm:text-base leading-7 text-gray-700">
            次回のみかん販売は、
            <strong className="text-orange-700">早味かんから開始予定</strong>
            です。おおむねの販売開始日は、
            <strong className="text-green-700">2026年9月10日</strong>に
            <strong>早味かん 青果・小玉</strong>を予定しています。その後、
            <strong className="text-green-700">2026年9月20日</strong>に
            <strong>日南の青果・小玉</strong>を追加予定です。
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-orange-200 bg-white/92 px-4 py-4">
              <p className="text-xs font-bold tracking-[0.08em] text-orange-700">
                販売予定①
              </p>
              <p className="mt-2 text-lg font-black text-[#2b3528]">
                早味かん 青果・小玉
              </p>
              <p className="mt-1 text-sm text-gray-600">
                2026年9月10日ごろ販売開始予定
              </p>
            </div>

            <div className="rounded-2xl border border-green-200 bg-white/92 px-4 py-4">
              <p className="text-xs font-bold tracking-[0.08em] text-green-700">
                販売予定②
              </p>
              <p className="mt-2 text-lg font-black text-[#2b3528]">
                日南 青果・小玉
              </p>
              <p className="mt-1 text-sm text-gray-600">
                2026年9月20日ごろ追加予定
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-sm leading-6 text-gray-700">
            ※ 事前予約をご希望の方は、お問合せよりご連絡ください。
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={NEWS_LINK}
              className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-[0_12px_28px_rgba(249,115,22,0.28)] transition hover:bg-orange-600"
            >
              お知らせを見る
            </a>

            <a
              href="#products"
              className="inline-flex items-center justify-center rounded-2xl border border-green-200 bg-white px-5 py-3 text-sm font-bold text-green-700 shadow-sm transition hover:bg-green-50"
            >
              現在の商品状況を見る
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function GradeGuideAccordion() {
  const [open, setOpen] = useState(false);

  return (
    <section className="mt-10 rounded-[28px] border border-white/70 bg-white/90 backdrop-blur-md p-5 md:p-8 shadow-[0_14px_36px_rgba(0,0,0,0.07)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <SectionBadge tone="green">選び方ガイド</SectionBadge>
          <h2 className="text-xl md:text-[1.85rem] font-black tracking-tight text-[#263426]">
            A品・B品・C品の違い
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50"
        >
          {open ? "閉じる" : "詳しく見る"}
        </button>
      </div>

      <p className="mt-3 text-sm sm:text-base text-gray-600 leading-6 sm:leading-7">
        迷ったら<strong>「B品」</strong>、見た目重視なら
        <strong>「A品」</strong>、価格重視なら
        <strong>「C品」</strong>です。
      </p>

      {open && (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-green-200 bg-green-50/80 px-5 py-5 shadow-sm">
            <p className="text-lg font-black text-green-700">A品</p>
            <p className="mt-3 text-sm leading-6 text-gray-700">
              見た目がきれいで、贈答向けにも選びやすい品質です。
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li>✓ 市場品質</li>
              <li>✓ 贈答向け</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-orange-200 bg-orange-50/80 px-5 py-5 shadow-sm">
            <p className="text-lg font-black text-orange-700">B品</p>
            <p className="mt-3 text-sm leading-6 text-gray-700">
              見た目にやや傷がありますが、中身はA品同等。家庭用で一番人気です。
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li>✓ 中身はA品同等</li>
              <li>✓ 価格とのバランス◎</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-amber-50/80 px-5 py-5 shadow-sm">
            <p className="text-lg font-black text-amber-700">C品</p>
            <p className="mt-3 text-sm leading-6 text-gray-700">
              見た目に個体差があります。価格重視で選びたい方向けです。
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li>✓ 最安クラス</li>
              <li>✓ お得重視向け</li>
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

function ProductCard({
  product,
  onToast,
}: {
  product: Product;
  onToast: (message: string) => void;
}) {
  const router = useRouter();

  const options = useMemo(() => {
    const list: { key: "5kg" | "10kg"; label: string; price: number }[] = [];

    if (product.price_5kg !== null && product.price_5kg !== undefined) {
      list.push({
        key: "5kg",
        label: "5kg",
        price: product.price_5kg,
      });
    }

    if (product.price_10kg !== null && product.price_10kg !== undefined) {
      list.push({
        key: "10kg",
        label: "10kg",
        price: product.price_10kg,
      });
    }

    return list;
  }, [product.price_5kg, product.price_10kg]);

  const [selectedKey, setSelectedKey] = useState<"5kg" | "10kg">(
    options[0]?.key || "5kg"
  );
  const [qty, setQty] = useState(1);

  const selected =
    options.find((option) => option.key === selectedKey) || options[0];

  const unitLabel = product.unit_label || "箱";
  const isOnSale = product.stock_status === "販売中";
  const total = selected ? selected.price * qty : 0;

  useEffect(() => {
    if (
      options.length > 0 &&
      !options.find((option) => option.key === selectedKey)
    ) {
      setSelectedKey(options[0].key);
    }
  }, [options, selectedKey]);

  return (
    <article className="overflow-hidden rounded-[30px] border border-white/80 bg-white/92 backdrop-blur shadow-[0_18px_48px_rgba(0,0,0,0.08)]">
      <div className="relative bg-gradient-to-br from-[#f7fff4] via-white to-[#fff8eb]">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[720px]">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-contain object-center p-3"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              画像未設定
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <SectionBadge tone="stone">{product.tag || "商品"}</SectionBadge>
            <SectionBadge tone={isOnSale ? "green" : "red"}>
              {product.stock_status || "販売中"}
            </SectionBadge>
          </div>

          <div className="absolute left-5 right-5 bottom-5">
            <p className="text-xl sm:text-2xl font-black text-white drop-shadow">
              {product.name}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-7 lg:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <SectionBadge tone="gold">送料込み</SectionBadge>
          <SectionBadge tone="green">農家直送</SectionBadge>
          <SectionBadge tone={isOnSale ? "green" : "red"}>
            {isOnSale ? "販売中" : "売り切れ"}
          </SectionBadge>
        </div>

        <h2 className="mt-4 text-[1.8rem] sm:text-[2.15rem] leading-tight font-black tracking-tight text-[#243224]">
          {product.name}
        </h2>

        {product.description && (
          <p className="mt-4 text-sm sm:text-base leading-7 text-gray-700">
            {product.description}
          </p>
        )}

        {options.length > 0 ? (
          <div className="mt-6">
            <p className="text-sm font-bold text-gray-700 mb-2">
              内容量を選択
            </p>

            <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {options.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setSelectedKey(option.key)}
                  className={`px-3 py-3 text-sm sm:text-base font-black transition ${
                    selectedKey === option.key
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-700 hover:bg-green-50"
                  }`}
                >
                  <span className="block">{option.label}</span>
                  <span className="block text-xs sm:text-sm">
                    {yen(option.price)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            価格が未設定です。
          </div>
        )}

        <div className="mt-5">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            数量（{unitLabel}）
          </label>

          <select
            value={qty}
            onChange={(event) => setQty(Number(event.target.value))}
            className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-[15px] shadow-sm outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
              <option key={number} value={number}>
                {number} {unitLabel}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 to-white px-5 py-5">
          <div className="text-[1.7rem] sm:text-3xl font-black text-green-700">
            価格：{selected ? yen(selected.price) : "-"} / {unitLabel}
          </div>
          <div className="mt-2 text-base sm:text-lg font-bold text-green-700">
            小計：{yen(total)}
          </div>
          <p className="mt-3 text-xs text-gray-500">
            ※ すべて送料込み価格です。
          </p>
        </div>

        {!isOnSale && (
          <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl px-4 py-4">
            現在売り切れです。
          </div>
        )}

        {product.notice && (
          <div className="mt-4 rounded-3xl border border-yellow-200 bg-yellow-50 px-4 py-4">
            <p className="text-sm text-gray-700 leading-6">{product.notice}</p>
          </div>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => {
              if (!selected) return;

              addToCart({
                id: `${product.id}-${selected.key}`,
                name: product.name,
                variant: selected.key,
                unitPrice: selected.price,
                qty,
                extra: {
                  tag: product.tag,
                  unit_label: unitLabel,
                },
              });

              onToast("カートに追加しました");
            }}
            disabled={!isOnSale || !selected}
            className={`w-full rounded-2xl border bg-white px-5 py-4 text-base font-bold shadow-sm transition ${
              isOnSale && selected
                ? "border-green-600 text-green-700 hover:bg-green-50"
                : "border-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            カートに入れる
          </button>

          <button
            onClick={() => {
              if (!selected) return;

              router.push(
                `/order?product=${encodeURIComponent(product.name)}` +
                  `&size=${encodeURIComponent(selected.key)}` +
                  `&qty=${qty}` +
                  `&price=${total}`
              );
            }}
            disabled={!isOnSale || !selected}
            className={`w-full rounded-2xl px-5 py-4 text-base font-bold text-white shadow-lg transition ${
              isOnSale && selected
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            今すぐ注文する
          </button>
        </div>
      </div>
    </article>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setMessage("");

      try {
        const res = await fetch("/api/products", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          setMessage(data?.message || "商品情報の取得に失敗しました。");
          return;
        }

        setProducts(data.products || []);
      } catch (error) {
        setMessage("通信エラーが発生しました。");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <main className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-24 text-[#333]">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-120px] left-[-120px] h-[260px] w-[260px] rounded-full bg-green-200/20 blur-3xl" />
        <div className="absolute top-[260px] right-[-120px] h-[280px] w-[280px] rounded-full bg-orange-200/20 blur-3xl" />
        <div className="absolute bottom-[180px] left-[10%] h-[240px] w-[240px] rounded-full bg-emerald-200/10 blur-3xl" />
      </div>

      <CartTopButton />

      <section className="relative overflow-hidden rounded-[28px] border border-white/70 bg-gradient-to-br from-[#f6fff5] via-white to-[#fff8ee] shadow-[0_16px_40px_rgba(0,0,0,0.07)]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -left-16 h-40 w-40 rounded-full bg-green-200/20 blur-3xl" />
          <div className="absolute -bottom-20 right-0 h-48 w-48 rounded-full bg-orange-200/20 blur-3xl" />
        </div>

        <div className="relative px-5 py-5 md:px-8 md:py-7">
          <div className="flex flex-wrap items-center gap-2">
            <SectionBadge tone="green">送料込み表記</SectionBadge>
            <SectionBadge tone="orange">100円みかん</SectionBadge>
            <SectionBadge tone="gold">産地直送</SectionBadge>
          </div>

          <h1 className="mt-4 text-[1.85rem] leading-[1.05] md:text-4xl font-black tracking-tight text-[#243224]">
            商品一覧
          </h1>

          <p className="mt-3 max-w-3xl text-sm md:text-base leading-7 text-gray-700">
            農家直送・<strong className="text-green-700">送料込み価格</strong>
            でご注文いただけます。販売状況・価格・商品画像は管理画面の内容が反映されます。
          </p>
        </div>
      </section>

      <SaleNoticeCard />

      <section id="products" className="mt-10 scroll-mt-28">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <SectionBadge tone="green">現在の商品</SectionBadge>
              <SectionBadge tone="stone">価格・在庫は最新情報</SectionBadge>
            </div>

            <h2 className="mt-3 text-[1.65rem] sm:text-[2rem] leading-tight font-black tracking-tight text-[#263426]">
              旬の商品一覧
            </h2>

            <p className="mt-2 text-sm sm:text-base text-gray-600 leading-7">
              販売中の商品は「カートに入れる」「今すぐ注文する」ボタンを押せます。
              売り切れの商品は、ボタンが押せない状態になります。
            </p>
          </div>
        </div>

        {message && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            {message}
          </div>
        )}

        {loading ? (
          <div className="mt-6 rounded-[28px] border border-white/70 bg-white/90 px-6 py-12 text-center text-gray-500 shadow-sm">
            商品情報を読み込み中...
          </div>
        ) : products.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-white/70 bg-white/90 px-6 py-12 text-center text-gray-500 shadow-sm">
            現在表示中の商品はありません。
          </div>
        ) : (
          <div className="mt-6 space-y-7">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onToast={(text) => setToast(text)}
              />
            ))}
          </div>
        )}
      </section>

      <GradeGuideAccordion />

      <CartWidget />

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 sm:bottom-6 z-[70] flex justify-center px-4">
          <div className="rounded-full bg-[#243224] text-white px-4 py-3 text-sm font-bold shadow-[0_16px_35px_rgba(0,0,0,0.22)]">
            {toast}
          </div>
        </div>
      )}
    </main>
  );
}