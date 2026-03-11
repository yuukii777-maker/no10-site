"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

/* =========================
   ★ 追加：シート連動用の型 & 取得
========================= */
type ProductItem = {
  id?: string;
  product: string;
  price: number;
  status: "active" | "soldout" | "comingsoon";
  feature: string;
};

type ApiProductsRes =
  | { ok: true; items: ProductItem[] }
  | { ok: false; error: string; raw?: any };

const FIXED_KEYS = {
  // ★変更：傷あり青島みかん → 傷あり南津海（箱詰め）
  MIKAN_DEFECT: "傷あり南津海（箱詰め）",
  MIKAN_PREMIUM: "青果みかん",
  BUNTAN: "文旦（箱）",
} as const;

/* =========================
   ★ 追加：UIヘルパー
========================= */
function SectionBadge({
  tone = "green",
  children,
}: {
  tone?: "green" | "orange" | "amber" | "red" | "stone";
  children: React.ReactNode;
}) {
  const tones = {
    green: "bg-green-50 text-green-700 border-green-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
    stone: "bg-stone-50 text-stone-700 border-stone-200",
  } as const;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold tracking-[0.08em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function QuickPoint({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur px-4 py-4 shadow-sm">
      <div className="text-xl">{icon}</div>
      <p className="mt-2 text-xs font-semibold tracking-[0.12em] text-gray-500 uppercase">{label}</p>
      <p className="mt-1 text-sm font-bold text-gray-800 leading-snug">{value}</p>
    </div>
  );
}

function ProductHeroCard({
  badge,
  title,
  subtitle,
  notes,
}: {
  badge: React.ReactNode;
  title: string;
  subtitle: string;
  notes: string[];
}) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-br from-[#f6fff5] via-white to-[#fff8ee] shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-16 -left-16 h-40 w-40 rounded-full bg-green-200/20 blur-3xl" />
        <div className="absolute -bottom-20 right-0 h-48 w-48 rounded-full bg-orange-200/20 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_20%_20%,#79b96e_0,transparent_24%),radial-gradient(circle_at_80%_28%,#f59e0b_0,transparent_20%),radial-gradient(circle_at_32%_82%,#8abf7b_0,transparent_18%)]" />
      </div>

      <div className="relative px-6 py-7 md:px-8 md:py-9">
        <div className="flex flex-wrap items-center gap-2">{badge}</div>

        <h1 className="mt-4 text-4xl md:text-5xl font-black tracking-tight text-[#243224]">
          {title}
        </h1>

        <p className="mt-4 max-w-3xl text-[15px] md:text-base leading-7 text-gray-700">
          手間ひまかけて育てた果実を、<strong className="text-green-700">送料込みの分かりやすい価格</strong>でご案内しています。
          ご家庭用から贈答向けまで、選びやすくまとめました。
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {notes.map((n) => (
            <span
              key={n}
              className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-800"
            >
              {n}
            </span>
          ))}
        </div>

        <p className="mt-5 text-sm text-gray-600">{subtitle}</p>
      </div>
    </div>
  );
}

function AnchorNav() {
  const items = [
    { href: "#defect", label: "傷あり南津海", tone: "orange" },
    { href: "#premium", label: "南津海（青果）", tone: "green" },
    { href: "#buntan", label: "文旦", tone: "stone" },
  ] as const;

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {items.map((it) => (
        <a
          key={it.href}
          href={it.href}
          className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-bold shadow-sm border transition hover:-translate-y-0.5 ${
            it.tone === "orange"
              ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
              : it.tone === "green"
              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
          }`}
        >
          {it.label}へ
        </a>
      ))}
    </div>
  );
}

function GradeGuideCard({
  title,
  tone,
  body,
  points,
}: {
  title: string;
  tone: "green" | "orange" | "amber";
  body: string;
  points: string[];
}) {
  const toneClass =
    tone === "green"
      ? "border-green-200 bg-green-50/80"
      : tone === "orange"
      ? "border-orange-200 bg-orange-50/80"
      : "border-amber-200 bg-amber-50/80";

  const titleClass =
    tone === "green"
      ? "text-green-700"
      : tone === "orange"
      ? "text-orange-700"
      : "text-amber-700";

  return (
    <div className={`rounded-3xl border ${toneClass} px-5 py-5 shadow-sm`}>
      <p className={`text-lg font-black ${titleClass}`}>{title}</p>
      <p className="mt-3 text-sm leading-6 text-gray-700">{body}</p>
      <ul className="mt-4 space-y-2">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="mt-[2px] text-green-700">✓</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProductSectionFrame({
  id,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  id: string;
  eyebrow: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-24 scroll-mt-28">
      <div className="flex flex-wrap items-center gap-3">{eyebrow}</div>
      <h2 className="mt-4 text-3xl md:text-[2.1rem] font-black tracking-tight text-[#263426]">
        {title}
      </h2>
      <p className="mt-3 max-w-3xl text-gray-600 leading-7">{subtitle}</p>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function SummaryStrip({
  items,
}: {
  items: { icon: string; label: string }[];
}) {
  return (
    <div className="mt-5 grid sm:grid-cols-2 gap-3">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm"
        >
          <span className="mr-2">{it.icon}</span>
          {it.label}
        </div>
      ))}
    </div>
  );
}

function PriceSummary({
  priceLabel,
  subtotalLabel,
  accent = "green",
}: {
  priceLabel: string;
  subtotalLabel: string;
  accent?: "green" | "orange" | "amber";
}) {
  const color =
    accent === "green"
      ? "text-green-700"
      : accent === "orange"
      ? "text-orange-700"
      : "text-amber-700";

  const bg =
    accent === "green"
      ? "from-green-50 to-white border-green-100"
      : accent === "orange"
      ? "from-orange-50 to-white border-orange-100"
      : "from-amber-50 to-white border-amber-100";

  return (
    <div className={`mt-6 rounded-3xl border bg-gradient-to-br ${bg} px-5 py-5`}>
      <div className={`text-3xl font-black ${color}`}>{priceLabel}</div>
      <div className={`mt-2 text-lg font-bold ${color}`}>{subtotalLabel}</div>
      <p className="mt-3 text-xs text-gray-500">※ すべて送料込み価格です。</p>
    </div>
  );
}

function CTAButtons({
  onCart,
  onBuy,
  disabled,
  accent = "green",
}: {
  onCart: () => void;
  onBuy: () => void;
  disabled?: boolean;
  accent?: "green" | "orange" | "amber";
}) {
  const primary =
    accent === "green"
      ? "bg-green-600 hover:bg-green-700"
      : accent === "orange"
      ? "bg-orange-500 hover:bg-orange-600"
      : "bg-amber-500 hover:bg-amber-600";

  const secondary =
    accent === "green"
      ? "border-green-600 text-green-700 hover:bg-green-50"
      : accent === "orange"
      ? "border-orange-500 text-orange-700 hover:bg-orange-50"
      : "border-amber-500 text-amber-700 hover:bg-amber-50";

  return (
    <div className="mt-6 grid sm:grid-cols-2 gap-3">
      <button
        onClick={onCart}
        disabled={disabled}
        className={`w-full rounded-2xl border bg-white px-5 py-4 text-base font-bold shadow-sm transition ${secondary} ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        カートに入れる
      </button>

      <button
        onClick={onBuy}
        disabled={disabled}
        className={`w-full rounded-2xl px-5 py-4 text-base font-bold text-white shadow-lg transition ${primary} ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        今すぐ注文する
      </button>
    </div>
  );
}

function SoftSelect({
  value,
  onChange,
  options,
}: {
  value: string | number;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-[15px] shadow-sm outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
    >
      {options.map((opt) => (
        <option key={`${opt.value}-${opt.label}`} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[28px] border border-white/70 bg-white/85 backdrop-blur-md shadow-[0_15px_45px_rgba(0,0,0,0.07)] ${className}`}
    >
      {children}
    </div>
  );
}
/* ========================= */

export default function ProductsPage() {
  const router = useRouter();

  // 規格と価格（送料込み）
  const PRICE_TABLE: Record<"5kg" | "10kg", number> = {
    "5kg": 2500,
    "10kg": 4000,
  };

  const [size, setSize] = useState<"5kg" | "10kg">("5kg");
  const [withBuntan, setWithBuntan] = useState(true);
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

  // ★追加：傷あり欄の等級切替（B / C）
  const [defectGrade, setDefectGrade] = useState<"B" | "C">("B");
  const [cGradeAccepted, setCGradeAccepted] = useState(false);

  // ★ 追加：size と みかんタブの同期
  useEffect(() => {
    setMikanTab(size);
  }, [size]);
  /* ========================= */

  /* =========================
     ★ 追加：南津海（A品）用：価格/タブ/数量
  ========================= */
  const NATSUMI_PRICE_TABLE: Record<"5kg" | "10kg", number> = {
    "5kg": 3000,
    "10kg": 5000,
  };
  const [natsumiTab, setNatsumiTab] = useState<"5kg" | "10kg" | "review">("5kg");
  const [natsumiSize, setNatsumiSize] = useState<"5kg" | "10kg" | null>(null);
  const [natsumiQty, setNatsumiQty] = useState<number>(1);

  const natsumiStatus = "active" as ProductItem["status"];

  const natsumiFeature =
    "【A品／送料込みサイト特価】見た目の状態が良く、市場にも出回る品質の南津海です。寒波から果実を守るため、11月頃に一つ一つ“サンテ（布）”を掛けて育てた手間ひま品。2月は酸味のあとに甘さが追いかけ、3月中旬から甘みがさらに増します。酸味×糖度のバランスが良く、※種がある場合があります。";
  /* ========================= */

  /* =========================
     ★追加：傷あり南津海（B/C切替）用：価格/特徴/在庫
  ========================= */
  const NATSUMI_DEFECT_PRICE_TABLE = {
    B: {
      "5kg": 2000,
      "10kg": 3500,
      image: "/mikan/defect.png",
      label: "B品",
      feature:
        "【B品／送料込み】見た目にやや傷がありますが、中身はA品同等でおいしくお召し上がりいただける南津海です。ご家庭用として人気の高い、お得な箱詰め商品です。",
    },
    C: {
      "5kg": 1500,
      "10kg": 2500, // ★必要に応じて変更してください
      image: "/mikan/defectc.png",
      label: "C品",
      feature:
        "【C品／送料込み】見た目に傷や色ムラがあり、果肉にやや隙間が見られる場合がありますが、ご家庭用として十分おいしく楽しめる南津海です。見た目よりお得さ重視の方向けです。",
    },
  } as const;

  const natsumiDefectStatus = "active" as ProductItem["status"];
  /* ========================= */

  /* =========================
     ★ 追加：シート連動（/api/products から取得）
     - product名完全一致で紐付け
     - 反映するのは「status / feature / price（5kg側に反映）」だけ
  ========================= */
  const [sheetMap, setSheetMap] = useState<Record<string, ProductItem>>({});
  const [sheetError, setSheetError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setSheetError(null);
        const r = await fetch("/api/products", { cache: "no-store" });
        const data = (await r.json()) as ApiProductsRes;

        if (!data || data.ok !== true) {
          setSheetMap({});
          setSheetError((data as any)?.error || "unknown");
          return;
        }

        const map: Record<string, ProductItem> = {};
        for (const it of data.items || []) {
          if (it?.product) map[String(it.product)] = it;
        }
        setSheetMap(map);
      } catch (e: any) {
        setSheetMap({});
        setSheetError(e?.message || String(e));
      }
    };
    run();
  }, []);

  // ★変更：mikanDefect は「傷あり南津海（箱詰め）」として取得
  const mikanDefect = sheetMap[FIXED_KEYS.MIKAN_DEFECT];
  const mikanPremium = sheetMap[FIXED_KEYS.MIKAN_PREMIUM];
  const buntan = sheetMap[FIXED_KEYS.BUNTAN];

  // ★変更：売り切れ固定は撤去（傷あり南津海は active で出す）
  const mikanDefectStatus = (mikanDefect?.status || "active") as ProductItem["status"];
  const mikanPremiumStatus = "soldout" as ProductItem["status"];
  const buntanStatus = (buntan?.status || "active") as ProductItem["status"];

  // ★追加：現在選択中の傷あり等級データ
  const currentDefect = NATSUMI_DEFECT_PRICE_TABLE[defectGrade];

  // ★変更：特徴文（シート優先、無ければ今回指定）
  const mikanDefectFeature =
    defectGrade === "B"
      ? (mikanDefect?.feature && String(mikanDefect.feature)) || currentDefect.feature
      : currentDefect.feature;

  const mikanPremiumFeature =
    (mikanPremium?.feature && String(mikanPremium.feature)) ||
    "贈答用・青果基準で選別した高品質みかんです。現在は収穫終了のため販売を停止しています。";

  const buntanFeature =
    (buntan?.feature && String(buntan.feature)) ||
    "さっぱりとした甘さと爽やかな香りの文旦。大きさ不揃いで、5kg箱は6個入り／10kg箱は12個入りです（目安）。";

  // ★変更：傷あり南津海はB/C切替に対応（Bのみシート価格の5kg上書きを許可）
  const mikanDefectPrice5 = Number(
    defectGrade === "B"
      ? mikanDefect?.price ?? currentDefect["5kg"]
      : currentDefect["5kg"]
  );
  const mikanDefectPrice10 = Number(currentDefect["10kg"]);
  const buntanPrice5 = Number(buntan?.price ?? PRICE_TABLE["5kg"]);
  /* ========================= */

  return (
    <main className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-24 text-[#333]">
      {/* 背景演出 */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-120px] left-[-120px] h-[260px] w-[260px] rounded-full bg-green-200/20 blur-3xl" />
        <div className="absolute top-[260px] right-[-120px] h-[280px] w-[280px] rounded-full bg-orange-200/20 blur-3xl" />
        <div className="absolute bottom-[180px] left-[10%] h-[240px] w-[240px] rounded-full bg-emerald-200/10 blur-3xl" />
      </div>

      {/* ★ 追加：右上カート（PC用） */}
      <CartTopButton />

      {/* ファーストビュー */}
      <ProductHeroCard
        badge={
          <>
            <SectionBadge tone="green">DIRECT FARM STORE</SectionBadge>
            <SectionBadge tone="orange">送料込み</SectionBadge>
            <SectionBadge tone="stone">家庭用〜贈答用まで</SectionBadge>
          </>
        }
        title="商品一覧"
        subtitle="迷ったら『傷あり南津海（B品）』が一番人気。きれいさ重視なら『南津海（青果）』、爽やかさ重視なら『文旦』がおすすめです。"
        notes={["ご家庭用も贈答向けも選べる", "今すぐ注文・カート注文対応", "数量を選ぶだけで分かりやすい"]}
      />

      <div className="mt-6 grid lg:grid-cols-4 gap-4">
        <QuickPoint icon="🍊" label="人気" value="傷あり南津海（B品）" />
        <QuickPoint icon="🎁" label="贈答向け" value="南津海（青果・A品）" />
        <QuickPoint icon="📦" label="送料" value="表示価格はすべて送料込み" />
        <QuickPoint icon="🛒" label="購入方法" value="カートに追加 / 今すぐ注文" />
      </div>

      <AnchorNav />

      {/* A/B/C説明 */}
      <Panel className="mt-10 p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <SectionBadge tone="green">まずここを見ればOK</SectionBadge>
          <h2 className="text-2xl md:text-[1.9rem] font-black tracking-tight text-[#263426]">
            A品・B品・C品の違い
          </h2>
        </div>

        <p className="mt-3 text-gray-600 leading-7">
          違いは主に<strong>見た目</strong>と<strong>価格</strong>です。用途に合わせて選べます。
        </p>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <GradeGuideCard
            title="A品"
            tone="green"
            body="見た目がきれいで、贈答向けにも選びやすい品質です。"
            points={["市場品質", "贈答向け"]}
          />
          <GradeGuideCard
            title="B品"
            tone="orange"
            body="見た目にやや傷がありますが、中身はA品同等。家庭用で一番人気です。"
            points={["中身はA品同等", "価格とのバランス◎"]}
          />
          <GradeGuideCard
            title="C品"
            tone="amber"
            body="見た目に個体差があります。価格重視で選びたい方向けです。"
            points={["最安クラス", "お得重視向け"]}
          />
        </div>
      </Panel>

      {/* エラーバナーは非表示にする */}
      {false && sheetError && (
        <div className="max-w-2xl mx-auto mt-4 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          ※ 商品データの読み込みに失敗しています（/api/products）: {sheetError}
        </div>
      )}

      {/* ====================== */}
      {/* ★追加：傷あり南津海（最上部に表示） */}
      {/* ====================== */}
      <ProductSectionFrame
        id="defect"
        eyebrow={
          <>
            <SectionBadge tone="orange">一番人気</SectionBadge>
            <SectionBadge tone="stone">家庭用おすすめ</SectionBadge>
            <SectionBadge tone={defectGrade === "B" ? "orange" : "amber"}>
              現在選択中：{currentDefect.label}
            </SectionBadge>
          </>
        }
        title="傷あり南津海（箱詰め）"
        subtitle="ご家庭用として選ばれやすい、お得な箱詰め商品です。"
      >
        <div className="grid xl:grid-cols-[1.02fr_0.98fr] gap-6 items-stretch">
          <Panel className="overflow-hidden">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={currentDefect.image}
                alt={`傷あり南津海 ${currentDefect.label}`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent px-5 py-5">
                <div className="flex flex-wrap items-center gap-2">
                  <SectionBadge tone={defectGrade === "B" ? "orange" : "amber"}>
                    {currentDefect.label}
                  </SectionBadge>
                  <SectionBadge tone="green">送料込み</SectionBadge>
                </div>
                <p className="mt-3 text-lg md:text-xl font-black text-white">
                  見た目より、中身とお得さで選ぶ方向け
                </p>
              </div>
            </div>

            <div className="p-6 md:p-7">
              <div className="inline-flex rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                <button
                  onClick={() => {
                    setDefectGrade("B");
                    setCGradeAccepted(false);
                  }}
                  className={`px-5 py-3 text-sm font-bold transition ${
                    defectGrade === "B"
                      ? "bg-orange-500 text-white"
                      : "bg-white text-gray-700 hover:bg-orange-50"
                  }`}
                  aria-pressed={defectGrade === "B"}
                >
                  B品
                </button>
                <button
                  onClick={() => {
                    setDefectGrade("C");
                    setCGradeAccepted(false);
                  }}
                  className={`px-5 py-3 text-sm font-bold transition border-l border-gray-200 ${
                    defectGrade === "C"
                      ? "bg-amber-500 text-white"
                      : "bg-white text-gray-700 hover:bg-amber-50"
                  }`}
                  aria-pressed={defectGrade === "C"}
                >
                  C品
                </button>
              </div>

              <p className="mt-5 text-[15px] leading-7 text-gray-700">
                {defectGrade === "B"
                  ? "やや傷ありですが、中身はA品同等。ご家庭用で最も選びやすい人気商品です。"
                  : "見た目に個体差はありますが、価格を抑えて楽しみたい方向けです。"}
              </p>

              <SummaryStrip
                items={
                  defectGrade === "B"
                    ? [
                        { icon: "🏠", label: "家庭用で一番人気" },
                        { icon: "✨", label: "中身はA品同等" },
                        { icon: "💰", label: "価格とのバランス◎" },
                      ]
                    : [
                        { icon: "💸", label: "価格重視向け" },
                        { icon: "🏠", label: "家庭用として十分" },
                        { icon: "⚠️", label: "見た目に個体差あり" },
                      ]
                }
              />
            </div>
          </Panel>

          <Panel className="p-6 md:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <SectionBadge tone={defectGrade === "B" ? "orange" : "amber"}>
                {currentDefect.label}
              </SectionBadge>
              <SectionBadge tone="green">送料込み</SectionBadge>
              <SectionBadge tone="stone">数量選択可</SectionBadge>
            </div>

            <h3 className="mt-4 text-2xl md:text-[2rem] font-black tracking-tight text-[#2b3528]">
              迷ったらこれ
            </h3>
            <p className="mt-2 text-gray-600 leading-7">
              サイズと数量を選ぶだけで、すぐ注文できます。
            </p>

            {/* セグメント型 */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">内容量を選択</p>
              <div className="inline-flex h-12 sm:h-11 rounded-2xl border border-gray-200 overflow-hidden w-full">
                <button
                  onClick={() => {
                    setMikanTab("5kg");
                    setSize("5kg");
                  }}
                  className={`flex-1 inline-flex items-center justify-center text-center px-3 sm:px-4
                    text-[15px] sm:text-sm leading-snug ${
                      mikanTab === "5kg"
                        ? defectGrade === "B"
                          ? "bg-orange-500 text-white"
                          : "bg-amber-500 text-white"
                        : "bg-white hover:bg-green-50"
                    }`}
                  aria-pressed={mikanTab === "5kg"}
                >
                  <span className="flex flex-col items-center leading-tight sm:flex-row sm:gap-2">
                    <span className="font-bold whitespace-nowrap">5kg</span>
                    <span className="text-[13px] sm:text-sm whitespace-nowrap">
                      {Number(mikanDefectPrice5).toLocaleString()}円
                    </span>
                  </span>
                </button>

                <button
                  onClick={() => {
                    setMikanTab("10kg");
                    setSize("10kg");
                  }}
                  className={`flex-1 inline-flex items-center justify-center text-center px-3 sm:px-4
                    text-[15px] sm:text-sm leading-snug border-l border-gray-200 ${
                      mikanTab === "10kg"
                        ? defectGrade === "B"
                          ? "bg-orange-500 text-white"
                          : "bg-amber-500 text-white"
                        : "bg-white hover:bg-green-50"
                    }`}
                  aria-pressed={mikanTab === "10kg"}
                >
                  <span className="flex flex-col items-center leading-tight sm:flex-row sm:gap-2">
                    <span className="font-bold whitespace-nowrap">10kg</span>
                    <span className="text-[13px] sm:text-sm whitespace-nowrap">
                      {Number(mikanDefectPrice10).toLocaleString()}円
                    </span>
                  </span>
                </button>
              </div>
            </div>

            {/* 数量 */}
            <div className="mt-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">数量（箱）</label>
              <SoftSelect
                value={mikanQty}
                onChange={(v) => setMikanQty(Number(v))}
                options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} 箱` }))}
              />
            </div>

            <PriceSummary
              accent={defectGrade === "B" ? "orange" : "amber"}
              priceLabel={`価格：${(
                size === "5kg" ? mikanDefectPrice5 : mikanDefectPrice10
              ).toLocaleString()}円`}
              subtotalLabel={`小計：${(
                (size === "5kg" ? mikanDefectPrice5 : mikanDefectPrice10) * mikanQty
              ).toLocaleString()}円`}
            />

            {/* soldout/comingsoon 表示 */}
            {mikanDefectStatus !== "active" && (
              <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl px-4 py-4">
                {mikanDefectStatus === "soldout"
                  ? "現在売り切れです。"
                  : "近日、事前予約可能予定です。"}
              </div>
            )}

            {/* おまけ */}
            <div className="mt-5 rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white px-5 py-5">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🎁</div>
                <div>
                  <p className="text-base font-black text-orange-700">今だけ 500gおまけ付き</p>
                  <p className="mt-1 text-sm text-gray-600">数量限定・なくなり次第終了です。</p>
                </div>
              </div>

              <label className="mt-4 flex items-center gap-3 rounded-2xl border border-orange-200 bg-white px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={withBuntan}
                  onChange={(e) => setWithBuntan(e.target.checked)}
                  className="w-5 h-5 accent-orange-500"
                />
                <span className="text-sm font-semibold text-gray-700">
                  南津海＋500gおまけを希望する
                </span>
              </label>
            </div>

            {/* C品時のみ承諾チェック */}
            {defectGrade === "C" && (
              <label className="mt-5 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cGradeAccepted}
                  onChange={(e) => setCGradeAccepted(e.target.checked)}
                  className="w-5 h-5 accent-amber-500"
                />
                <span className="text-sm font-semibold text-gray-700">
                  中身にばらつきがある場合があることを理解しました
                </span>
              </label>
            )}

            <CTAButtons
              accent={defectGrade === "B" ? "orange" : "amber"}
              disabled={mikanDefectStatus !== "active" || (defectGrade === "C" && !cGradeAccepted)}
              onCart={() => {
                addToCart({
                  id: `natsumi-defect-${defectGrade}-${size}-${withBuntan ? "plus500" : "noextra"}`,
                  name: `傷あり南津海（${currentDefect.label}）`,
                  variant: `${currentDefect.label} / ${size}`,
                  unitPrice: size === "5kg" ? mikanDefectPrice5 : mikanDefectPrice10,
                  qty: mikanQty,
                  extra: { withBonus500g: withBuntan, defectGrade, cGradeAccepted },
                });
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new Event("yk-cart-updated"));
                }
                alert("カートに追加しました。右上のカートからまとめて注文できます。");
              }}
              onBuy={() => {
                const unit = size === "5kg" ? mikanDefectPrice5 : mikanDefectPrice10;
                const p = unit * mikanQty;
                router.push(
                  `/order?product=${encodeURIComponent(`傷あり南津海（${currentDefect.label}）`)}` +
                    `&size=${encodeURIComponent(size)}` +
                    `&qty=${mikanQty}&price=${p}&buntan=${withBuntan}&grade=${defectGrade}&accepted=${cGradeAccepted}`
                );
              }}
            />

            <p className="text-xs text-gray-500 mt-4 text-center leading-6">
              ※ 家庭用・不揃い商品のため、見た目による返品交換はご遠慮ください
            </p>
          </Panel>
        </div>
      </ProductSectionFrame>

      {/* ====================== */}
      {/* 南津海（購入可能） */}
      {/* ====================== */}
      <ProductSectionFrame
        id="premium"
        eyebrow={
          <>
            <SectionBadge tone="green">青果品質</SectionBadge>
            <SectionBadge tone="red">残りわずか</SectionBadge>
            <SectionBadge tone="stone">贈答にもおすすめ</SectionBadge>
          </>
        }
        title="南津海（青果）"
        subtitle="見た目の美しさや贈答向けを重視したい方におすすめです。"
      >
        <div className="grid xl:grid-cols-[1.02fr_0.98fr] gap-6 items-stretch">
          <Panel className="overflow-hidden">
            <div className="relative aspect-[4/3] w-full">
              <Image src="/mikan/premium.png" alt="南津海（青果）" fill className="object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent px-5 py-5">
                <div className="flex flex-wrap items-center gap-2">
                  <SectionBadge tone="green">A品</SectionBadge>
                  <SectionBadge tone="red">残りわずか</SectionBadge>
                </div>
                <p className="mt-3 text-lg md:text-xl font-black text-white">
                  見た目の美しさと品質を重視する方向け
                </p>
              </div>
            </div>

            <div className="p-6 md:p-7">
              <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-5">
                <p className="text-sm font-black text-red-700">
                  ※ 南津海（青果）は残りわずかです。売り切れ次第終了となります。
                </p>
              </div>

              <p className="mt-5 text-[15px] leading-7 text-gray-700">
                見た目がきれいで、市場にも出回る品質。贈答向けにも選びやすい南津海です。
              </p>

              <SummaryStrip
                items={[
                  { icon: "🎁", label: "贈答向きの見た目" },
                  { icon: "🍊", label: "市場にも出回る品質" },
                  { icon: "❄️", label: "サンテで守って育成" },
                ]}
              />
            </div>
          </Panel>

          <Panel className="p-6 md:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <SectionBadge tone="green">A品</SectionBadge>
              <SectionBadge tone="red">残りわずか</SectionBadge>
              <SectionBadge tone="stone">送料込み</SectionBadge>
            </div>

            <h3 className="mt-4 text-2xl md:text-[2rem] font-black tracking-tight text-[#2b3528]">
              きれいさ重視の方に
            </h3>
            <p className="mt-2 text-gray-600 leading-7">贈答向けにも選びやすい品質です。</p>

            {/* サイズ切替 */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">内容量を選択</p>
              <div className="inline-flex h-12 sm:h-11 rounded-2xl border border-gray-200 overflow-hidden w-full">
                <button
                  onClick={() => {
                    setNatsumiTab("5kg");
                    setNatsumiSize("5kg");
                  }}
                  className={`flex-1 inline-flex items-center justify-center text-center px-3 sm:px-4
                    text-[15px] sm:text-sm leading-snug ${
                      natsumiTab === "5kg" ? "bg-green-600 text-white" : "bg-white hover:bg-green-50"
                    }`}
                  aria-pressed={natsumiTab === "5kg"}
                >
                  <span className="flex flex-col items-center leading-tight sm:flex-row sm:gap-2">
                    <span className="font-bold whitespace-nowrap">5kg</span>
                    <span className="text-[13px] sm:text-sm whitespace-nowrap">
                      {Number(NATSUMI_PRICE_TABLE["5kg"]).toLocaleString()}円
                    </span>
                  </span>
                </button>

                <button
                  onClick={() => {
                    setNatsumiTab("10kg");
                    setNatsumiSize("10kg");
                  }}
                  className={`flex-1 inline-flex items-center justify-center text-center px-3 sm:px-4
                    text-[15px] sm:text-sm leading-snug border-l border-gray-200 ${
                      natsumiTab === "10kg" ? "bg-green-600 text-white" : "bg-white hover:bg-green-50"
                    }`}
                  aria-pressed={natsumiTab === "10kg"}
                >
                  <span className="flex flex-col items-center leading-tight sm:flex-row sm:gap-2">
                    <span className="font-bold whitespace-nowrap">10kg</span>
                    <span className="text-[13px] sm:text-sm whitespace-nowrap">
                      {Number(NATSUMI_PRICE_TABLE["10kg"]).toLocaleString()}円
                    </span>
                  </span>
                </button>
              </div>
            </div>

            {/* 箱数 */}
            <div className="mt-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">数量（箱）</label>
              <SoftSelect
                value={natsumiQty}
                onChange={(v) => setNatsumiQty(Number(v))}
                options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} 箱` }))}
              />
            </div>

            <PriceSummary
              accent="green"
              priceLabel={`価格：${(
                natsumiTab === "5kg"
                  ? NATSUMI_PRICE_TABLE["5kg"]
                  : NATSUMI_PRICE_TABLE["10kg"]
              ).toLocaleString()}円 / 箱`}
              subtotalLabel={`小計：${(
                (natsumiTab === "5kg"
                  ? NATSUMI_PRICE_TABLE["5kg"]
                  : NATSUMI_PRICE_TABLE["10kg"]) * natsumiQty
              ).toLocaleString()}円`}
            />

            {/* soldout/comingsoon 表示 */}
            {natsumiStatus !== "active" && (
              <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl px-4 py-4">
                {natsumiStatus === "soldout" ? "現在売り切れです。" : "近日、事前予約可能予定です。"}
              </div>
            )}

            <CTAButtons
              accent="green"
              disabled={natsumiStatus !== "active"}
              onCart={() => {
                addToCart({
                  id: `natsumi-${natsumiTab}`,
                  name: "南津海（A品）",
                  variant: natsumiTab,
                  unitPrice:
                    natsumiTab === "5kg"
                      ? NATSUMI_PRICE_TABLE["5kg"]
                      : NATSUMI_PRICE_TABLE["10kg"],
                  qty: natsumiQty,
                  extra: { natsumi: true, grade: "A" },
                });
                alert("カートに追加しました。右上のカートからまとめて注文できます。");
                window.dispatchEvent(new Event("yk-cart-updated"));
              }}
              onBuy={() => {
                const unit =
                  natsumiTab === "5kg"
                    ? NATSUMI_PRICE_TABLE["5kg"]
                    : NATSUMI_PRICE_TABLE["10kg"];
                const p = unit * natsumiQty;
                router.push(
                  `/order?product=${encodeURIComponent("南津海（A品）")}` +
                    `&size=${encodeURIComponent(natsumiTab)}` +
                    `&qty=${natsumiQty}&price=${p}&buntan=${withBuntan}&grade=A`
                );
              }}
            />
          </Panel>
        </div>
      </ProductSectionFrame>

      {/* ====================== */}
      {/* 文旦（みかん形式 + 2択） */}
      {/* ====================== */}
      <ProductSectionFrame
        id="buntan"
        eyebrow={
          <>
            <SectionBadge tone="stone">爽やかな香り</SectionBadge>
            <SectionBadge tone="green">送料込み</SectionBadge>
            <SectionBadge tone="stone">個数目安つき</SectionBadge>
          </>
        }
        title="文旦（箱）"
        subtitle="さっぱりとした甘さと爽やかな香りを楽しみたい方におすすめです。"
      >
        <div className="grid xl:grid-cols-[1.02fr_0.98fr] gap-6 items-stretch">
          <Panel className="overflow-hidden">
            <div className="relative aspect-[4/3] w-full">
              <Image src="/mikan/buntan.jpg" alt="文旦（箱）" fill className="object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent px-5 py-5">
                <div className="flex flex-wrap items-center gap-2">
                  <SectionBadge tone="stone">文旦</SectionBadge>
                  <SectionBadge tone="green">送料込み</SectionBadge>
                </div>
                <p className="mt-3 text-lg md:text-xl font-black text-white">
                  爽やかな香りとすっきりした甘さ
                </p>
              </div>
            </div>

            <div className="p-6 md:p-7">
              <p className="text-[15px] leading-7 text-gray-700">
                みかんとは違う爽やかさを楽しみたい方に。個数目安つきで選びやすい商品です。
              </p>

              <SummaryStrip
                items={[
                  { icon: "🍋", label: "爽やかな香り" },
                  { icon: "😋", label: "さっぱりした甘さ" },
                  { icon: "📦", label: "5kg箱は6個目安" },
                ]}
              />
            </div>
          </Panel>

          <Panel className="p-6 md:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <SectionBadge tone="stone">文旦</SectionBadge>
              <SectionBadge tone="green">送料込み</SectionBadge>
              <SectionBadge tone="stone">個数目安あり</SectionBadge>
            </div>

            <h3 className="mt-4 text-2xl md:text-[2rem] font-black tracking-tight text-[#2b3528]">
              香りとさっぱり感を楽しむ
            </h3>
            <p className="mt-2 text-gray-600 leading-7">個数目安があるので、初めてでも選びやすいです。</p>

            {/* サイズ切替 */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">内容量を選択</p>
              <div className="inline-flex h-12 sm:h-11 rounded-2xl border border-gray-200 overflow-hidden w-full">
                <button
                  onClick={() => {
                    setBuntanTab("5kg");
                    setBuntanSize("5kg");
                  }}
                  className={`flex-1 inline-flex items-center justify-center text-center px-3 sm:px-4
                    text-[15px] sm:text-sm leading-snug ${
                      buntanTab === "5kg" ? "bg-green-600 text-white" : "bg-white hover:bg-green-50"
                    }`}
                  aria-pressed={buntanTab === "5kg"}
                >
                  <span className="flex flex-col items-center leading-tight sm:flex-row sm:gap-2">
                    <span className="font-bold whitespace-nowrap">5kg（6個）</span>
                    <span className="text-[13px] sm:text-sm whitespace-nowrap">
                      {Number(buntanPrice5).toLocaleString()}円
                    </span>
                  </span>
                </button>

                <button
                  onClick={() => {
                    setBuntanTab("10kg");
                    setBuntanSize("10kg");
                  }}
                  className={`flex-1 inline-flex items-center justify-center text-center px-3 sm:px-4
                    text-[15px] sm:text-sm leading-snug border-l border-gray-200 ${
                      buntanTab === "10kg" ? "bg-green-600 text-white" : "bg-white hover:bg-green-50"
                    }`}
                  aria-pressed={buntanTab === "10kg"}
                >
                  <span className="flex flex-col items-center leading-tight sm:flex-row sm:gap-2">
                    <span className="font-bold whitespace-nowrap">10kg（12個）</span>
                    <span className="text-[13px] sm:text-sm whitespace-nowrap">
                      {PRICE_TABLE["10kg"].toLocaleString()}円
                    </span>
                  </span>
                </button>
              </div>
            </div>

            {/* 箱数 */}
            <div className="mt-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">数量（箱）</label>
              <SoftSelect
                value={buntanQty}
                onChange={(v) => setBuntanQty(Number(v))}
                options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} 箱` }))}
              />
            </div>

            <PriceSummary
              accent="green"
              priceLabel={`価格：${(
                buntanTab === "5kg" ? buntanPrice5 : PRICE_TABLE["10kg"]
              ).toLocaleString()}円 / 箱`}
              subtotalLabel={`小計：${(
                (buntanTab === "5kg" ? buntanPrice5 : PRICE_TABLE["10kg"]) * buntanQty
              ).toLocaleString()}円`}
            />

            {/* soldout/comingsoon 表示 */}
            {buntanStatus !== "active" && (
              <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl px-4 py-4">
                {buntanStatus === "soldout" ? "現在売り切れです。" : "近日、事前予約可能予定です。"}
              </div>
            )}

            {/* 注意 */}
            <div className="mt-5 rounded-3xl border border-yellow-200 bg-yellow-50 px-4 py-4">
              <p className="text-sm text-gray-700 leading-6">
                「5kg／10kg」は箱サイズの目安です。実際は個数基準（5kg箱=6個・10kg箱=12個）で詰めるため、総重量は前後します。
              </p>
            </div>

            <CTAButtons
              accent="green"
              disabled={buntanStatus !== "active"}
              onCart={() => {
                addToCart({
                  id: `buntan-${buntanTab}`,
                  name: "文旦（箱）",
                  variant: buntanTab === "5kg" ? "5kg（6個）" : "10kg（12個）",
                  unitPrice: buntanTab === "5kg" ? buntanPrice5 : PRICE_TABLE["10kg"],
                  qty: buntanQty,
                  extra: { buntan: withBuntan },
                });
                alert("カートに追加しました。右上のカートからまとめて注文できます。");
                window.dispatchEvent(new Event("yk-cart-updated"));
              }}
              onBuy={() => {
                const unit = buntanTab === "5kg" ? buntanPrice5 : PRICE_TABLE["10kg"];
                const p = unit * buntanQty;
                router.push(
                  `/order?product=${encodeURIComponent("文旦（箱）")}` +
                    `&size=${encodeURIComponent(
                      buntanTab === "5kg" ? "5kg（6個）" : "10kg（12個）"
                    )}` +
                    `&qty=${buntanQty}&price=${p}&buntan=${withBuntan}`
                );
              }}
            />
          </Panel>
        </div>
      </ProductSectionFrame>

      {/* 右下カート（スマホ用） */}
      <CartWidget />
    </main>
  );
}

/* ===========================
   簡易カート（localStorage）
=========================== */
type CartItem = {
  id: string;
  name: string;
  variant: string;
  unitPrice: number;
  qty: number;
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
   右下フローティング・カート（スマホ用）
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
      className="fixed sm:hidden z-50 right-5 bottom-5 flex items-center gap-2 rounded-full px-5 py-3
                 bg-orange-500 text-white shadow-[0_16px_35px_rgba(249,115,22,0.35)] hover:bg-orange-600 transition"
      aria-label="カートを見る"
      title="カートを見る"
    >
      🛒 カート <span className="ml-1 font-bold">{count}</span>
    </button>
  );
}

/* ===========================
   ★ 追加：右上カート（PC用）
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
      className="hidden sm:flex fixed z-50 right-5 top-20 sm:top-24 items-center gap-2 rounded-full px-4 py-2.5
                 bg-white/92 backdrop-blur border border-white/80 shadow-[0_10px_25px_rgba(0,0,0,0.12)] hover:bg-white transition"
      aria-label="カートへ（まとめて注文）"
      title="カートへ（まとめて注文）"
    >
      <span className="text-lg">🛒</span>
      <span className="text-sm font-bold text-gray-800">カート</span>
      <span className="ml-1 inline-flex items-center justify-center min-w-[1.6rem] h-6 text-xs font-black rounded-full bg-green-600 text-white px-2">
        {count}
      </span>
    </button>
  );
}