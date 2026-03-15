"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

/* =========================
   ★ シート連動用の型 & 取得
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
  MIKAN_DEFECT: "傷あり南津海（箱詰め）",
  MIKAN_PREMIUM: "青果みかん",
  BUNTAN: "文旦（箱）",
} as const;

/* =========================
   ★ UIヘルパー
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
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] sm:text-xs font-bold tracking-[0.08em] ${tones[tone]}`}
    >
      {children}
    </span>
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
    <div className="relative overflow-hidden rounded-[24px] border border-white/70 bg-gradient-to-br from-[#f6fff5] via-white to-[#fff8ee] shadow-[0_16px_40px_rgba(0,0,0,0.07)]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-16 -left-16 h-40 w-40 rounded-full bg-green-200/20 blur-3xl" />
        <div className="absolute -bottom-20 right-0 h-48 w-48 rounded-full bg-orange-200/20 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_20%_20%,#79b96e_0,transparent_24%),radial-gradient(circle_at_80%_28%,#f59e0b_0,transparent_20%),radial-gradient(circle_at_32%_82%,#8abf7b_0,transparent_18%)]" />
      </div>

      <div className="relative px-5 py-4 md:px-8 md:py-6">
        <div className="flex flex-wrap items-center gap-2">{badge}</div>

        <h1 className="mt-3 text-[1.65rem] leading-[1.05] md:text-4xl font-black tracking-tight text-[#243224]">
          {title}
        </h1>

        <p className="mt-2 max-w-3xl text-sm md:text-base leading-6 text-gray-700">
          農家直送・<strong className="text-green-700">送料込み価格</strong>で、すぐ選べます。
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {notes.map((n) => (
            <span
              key={n}
              className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs sm:text-sm font-semibold text-green-800"
            >
              {n}
            </span>
          ))}
        </div>

        <p className="mt-3 text-xs sm:text-sm text-gray-600">{subtitle}</p>
      </div>
    </div>
  );
}

function ProductCompareCard({
  tone,
  title,
  desc,
  price,
  badge,
  buttonText,
  onClick,
}: {
  tone: "orange" | "green" | "stone";
  title: string;
  desc: string;
  price: string;
  badge: string;
  buttonText: string;
  onClick: () => void;
}) {
  const toneMap = {
    orange: {
      wrap: "border-orange-200 bg-gradient-to-br from-orange-50 via-white to-white",
      badge: "bg-orange-100 text-orange-700 border-orange-200",
      price: "text-orange-700",
      button: "bg-orange-500 hover:bg-orange-600 text-white",
    },
    green: {
      wrap: "border-green-200 bg-gradient-to-br from-green-50 via-white to-white",
      badge: "bg-green-100 text-green-700 border-green-200",
      price: "text-green-700",
      button: "bg-green-600 hover:bg-green-700 text-white",
    },
    stone: {
      wrap: "border-stone-200 bg-gradient-to-br from-stone-50 via-white to-white",
      badge: "bg-stone-100 text-stone-700 border-stone-200",
      price: "text-stone-700",
      button: "bg-stone-700 hover:bg-stone-800 text-white",
    },
  } as const;

  const t = toneMap[tone];

  return (
    <div className={`rounded-[22px] border p-4 sm:p-5 shadow-sm ${t.wrap}`}>
      <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold ${t.badge}`}>
        {badge}
      </span>

      <h2 className="mt-3 text-lg sm:text-xl font-black tracking-tight text-[#2b3528]">{title}</h2>

      <p className="mt-2 text-sm leading-6 text-gray-600">{desc}</p>

      <p className={`mt-4 text-xl sm:text-2xl font-black ${t.price}`}>{price}</p>

      <button
        onClick={onClick}
        className={`mt-4 w-full rounded-2xl px-4 py-3 text-sm font-bold shadow transition ${t.button}`}
      >
        {buttonText}
      </button>
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
    <div className="mt-4 z-30 sm:sticky sm:top-[84px]">
      <div className="rounded-2xl border border-white/80 bg-white/94 backdrop-blur-md shadow-[0_10px_26px_rgba(0,0,0,0.08)] px-3 py-3">
        <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
          {items.map((it) => (
            <a
              key={it.href}
              href={it.href}
              className={`inline-flex shrink-0 items-center rounded-full px-4 py-2 text-sm font-bold shadow-sm border transition hover:-translate-y-0.5 ${
                it.tone === "orange"
                  ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                  : it.tone === "green"
                  ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                  : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
              }`}
            >
              {it.label}
            </a>
          ))}
        </div>
      </div>
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
    <section id={id} className="mt-12 sm:mt-18 scroll-mt-24 sm:scroll-mt-36">
      <div className="flex flex-wrap items-center gap-3">{eyebrow}</div>
      <h2 className="mt-3 text-[1.6rem] leading-tight md:text-[2rem] font-black tracking-tight text-[#263426]">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm sm:text-base text-gray-600 leading-6 sm:leading-7">
        {subtitle}
      </p>
      <div className="mt-5 sm:mt-7">{children}</div>
    </section>
  );
}

function SummaryStrip({
  items,
}: {
  items: { icon: string; label: string }[];
}) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
    <div className={`mt-5 rounded-3xl border bg-gradient-to-br ${bg} px-5 py-5`}>
      <div className={`text-[1.65rem] sm:text-3xl font-black ${color}`}>{priceLabel}</div>
      <div className={`mt-2 text-base sm:text-lg font-bold ${color}`}>{subtotalLabel}</div>
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
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
      className={`rounded-[22px] sm:rounded-[26px] border border-white/70 bg-white/88 backdrop-blur-md shadow-[0_14px_36px_rgba(0,0,0,0.07)] ${className}`}
    >
      {children}
    </div>
  );
}

function GradeGuideAccordion() {
  const [open, setOpen] = useState(false);

  return (
    <Panel className="mt-10 p-5 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <SectionBadge tone="green">選び方ガイド</SectionBadge>
          <h2 className="text-xl md:text-[1.85rem] font-black tracking-tight text-[#263426]">
            A品・B品・C品の違い
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50"
          aria-expanded={open}
        >
          {open ? "閉じる" : "詳しく見る"}
        </button>
      </div>

      <p className="mt-3 text-sm sm:text-base text-gray-600 leading-6 sm:leading-7">
        迷ったら<strong>「B品」</strong>、見た目重視なら<strong>「A品」</strong>、価格重視なら
        <strong>「C品」</strong>です。
      </p>

      {open && (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
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
      )}
    </Panel>
  );
}
/* ========================= */

export default function ProductsPage() {
  const router = useRouter();

  const PRICE_TABLE: Record<"5kg" | "10kg", number> = {
    "5kg": 2500,
    "10kg": 4000,
  };

  const [size, setSize] = useState<"5kg" | "10kg">("5kg");
  const [withBonus500g, setWithBonus500g] = useState(true);

  const [buntanTab, setBuntanTab] = useState<"5kg" | "10kg">("5kg");
  const [buntanQty, setBuntanQty] = useState<number>(1);

  const [mikanTab, setMikanTab] = useState<"5kg" | "10kg">("5kg");
  const [mikanQty, setMikanQty] = useState<number>(1);

  const [defectGrade, setDefectGrade] = useState<"B" | "C">("B");
  const [cGradeAccepted, setCGradeAccepted] = useState(false);

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setMikanTab(size);
  }, [size]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const NATSUMI_PRICE_TABLE: Record<"5kg" | "10kg", number> = {
    "5kg": 3000,
    "10kg": 5000,
  };
  const [natsumiTab, setNatsumiTab] = useState<"5kg" | "10kg">("5kg");
  const [natsumiQty, setNatsumiQty] = useState<number>(1);

  const natsumiStatus = "active" as ProductItem["status"];

  const NATSUMI_DEFECT_PRICE_TABLE = {
    B: {
      "5kg": 2000,
      "10kg": 3500,
      image: "/mikan/defect.png",
      label: "B品",
    },
    C: {
      "5kg": 1500,
      "10kg": 2500,
      image: "/mikan/defectc.png",
      label: "C品",
    },
  } as const;

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

  const mikanDefect = sheetMap[FIXED_KEYS.MIKAN_DEFECT];
  const buntan = sheetMap[FIXED_KEYS.BUNTAN];

  const mikanDefectStatus = (mikanDefect?.status || "active") as ProductItem["status"];
  const buntanStatus: ProductItem["status"] = "soldout";

  const currentDefect = NATSUMI_DEFECT_PRICE_TABLE[defectGrade];

  const mikanDefectPrice5 = Number(
    defectGrade === "B" ? mikanDefect?.price ?? currentDefect["5kg"] : currentDefect["5kg"]
  );
  const mikanDefectPrice10 = Number(currentDefect["10kg"]);
  const buntanPrice5 = Number(buntan?.price ?? PRICE_TABLE["5kg"]);

  const jumpTo = (href: string) => {
    const el = document.querySelector(href);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-24 text-[#333]">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-120px] left-[-120px] h-[260px] w-[260px] rounded-full bg-green-200/20 blur-3xl" />
        <div className="absolute top-[260px] right-[-120px] h-[280px] w-[280px] rounded-full bg-orange-200/20 blur-3xl" />
        <div className="absolute bottom-[180px] left-[10%] h-[240px] w-[240px] rounded-full bg-emerald-200/10 blur-3xl" />
      </div>

      <CartTopButton />

      <ProductHeroCard
        badge={
          <>
            <SectionBadge tone="green">DIRECT FARM STORE</SectionBadge>
            <SectionBadge tone="orange">送料込み</SectionBadge>
          </>
        }
        title="商品一覧"
        subtitle="下のボタンから、気になる商品へすぐ移動できます。"
        notes={["人気：傷あり南津海", "スマホで見やすく整理済み"]}
      />

      <AnchorNav />

      <div className="hidden sm:grid mt-5 gap-3 sm:grid-cols-3">
        <ProductCompareCard
          tone="orange"
          badge="人気No.1"
          title="傷あり南津海"
          desc="家庭用で一番人気。中身重視・お得重視ならこれ。"
          price={`${mikanDefectPrice5.toLocaleString()}円〜`}
          buttonText="人気No.1を見る"
          onClick={() => jumpTo("#defect")}
        />
        <ProductCompareCard
          tone="green"
          badge="贈答向け"
          title="南津海（青果）"
          desc="見た目のきれいさを重視したい方におすすめ。"
          price={`${NATSUMI_PRICE_TABLE["5kg"].toLocaleString()}円〜`}
          buttonText="A品を見る"
          onClick={() => jumpTo("#premium")}
        />
        <ProductCompareCard
          tone="stone"
          badge="売り切れ"
          title="文旦（箱）"
          desc="現在は売り切れです。再開までお待ちください。"
          price={`${buntanPrice5.toLocaleString()}円〜`}
          buttonText="文旦を見る"
          onClick={() => jumpTo("#buntan")}
        />
      </div>

      {false && sheetError && (
        <div className="max-w-2xl mx-auto mt-4 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          ※ 商品データの読み込みに失敗しています（/api/products）: {sheetError}
        </div>
      )}

      <ProductSectionFrame
        id="defect"
        eyebrow={
          <>
            <SectionBadge tone="orange">人気No.1</SectionBadge>
            <SectionBadge tone="stone">家庭用おすすめ</SectionBadge>
            <SectionBadge tone={defectGrade === "B" ? "orange" : "amber"}>
              現在選択中：{currentDefect.label}
            </SectionBadge>
          </>
        }
        title="傷あり南津海（箱詰め）"
        subtitle="家庭用で一番選ばれている、お得な箱詰め商品です。"
      >
        <div className="grid gap-5 sm:gap-6 xl:grid-cols-[1.02fr_0.98fr] items-stretch">
          <Panel className="overflow-hidden order-1 xl:order-1">
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
          </Panel>

          <Panel className="p-5 md:p-7 order-2 xl:order-2">
            <div className="flex flex-wrap items-center gap-2">
              <SectionBadge tone={defectGrade === "B" ? "orange" : "amber"}>
                {currentDefect.label}
              </SectionBadge>
              <SectionBadge tone="green">送料込み</SectionBadge>
              <SectionBadge tone="stone">数量選択可</SectionBadge>
            </div>

            <h3 className="mt-3 text-[1.75rem] md:text-[2rem] font-black tracking-tight text-[#2b3528]">
              家庭用ならまずこれ
            </h3>

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

            <div className="mt-5">
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
            </div>

            <div className="mt-5">
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
                      {mikanDefectPrice5.toLocaleString()}円
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
                      {mikanDefectPrice10.toLocaleString()}円
                    </span>
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-4">
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

            {mikanDefectStatus !== "active" && (
              <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl px-4 py-4">
                {mikanDefectStatus === "soldout"
                  ? "現在売り切れです。"
                  : "近日、事前予約可能予定です。"}
              </div>
            )}

            <div className="mt-4 rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white px-5 py-5">
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
                  checked={withBonus500g}
                  onChange={(e) => setWithBonus500g(e.target.checked)}
                  className="w-5 h-5 accent-orange-500"
                />
                <span className="text-sm font-semibold text-gray-700">
                  南津海＋500gおまけを希望する
                </span>
              </label>
            </div>

            {defectGrade === "C" && (
              <label className="mt-4 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-4 cursor-pointer">
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
                  id: `natsumi-defect-${defectGrade}-${size}-${withBonus500g ? "plus500" : "noextra"}`,
                  name: `傷あり南津海（${currentDefect.label}）`,
                  variant: `${currentDefect.label} / ${size}`,
                  unitPrice: size === "5kg" ? mikanDefectPrice5 : mikanDefectPrice10,
                  qty: mikanQty,
                  extra: { withBonus500g, defectGrade, cGradeAccepted },
                });
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new Event("yk-cart-updated"));
                }
                setToast("カートに追加しました");
              }}
              onBuy={() => {
                const unit = size === "5kg" ? mikanDefectPrice5 : mikanDefectPrice10;
                const p = unit * mikanQty;
                router.push(
                  `/order?product=${encodeURIComponent(`傷あり南津海（${currentDefect.label}）`)}` +
                    `&size=${encodeURIComponent(size)}` +
                    `&qty=${mikanQty}&price=${p}&buntan=${withBonus500g}&grade=${defectGrade}&accepted=${cGradeAccepted}`
                );
              }}
            />

            <p className="text-xs text-gray-500 mt-4 text-center leading-6">
              ※ 家庭用・不揃い商品のため、見た目による返品交換はご遠慮ください
            </p>
          </Panel>
        </div>
      </ProductSectionFrame>

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
        <div className="grid gap-5 sm:gap-6 xl:grid-cols-[1.02fr_0.98fr] items-stretch">
          <Panel className="overflow-hidden order-1 xl:order-1">
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
          </Panel>

          <Panel className="p-5 md:p-7 order-2 xl:order-2">
            <div className="flex flex-wrap items-center gap-2">
              <SectionBadge tone="green">A品</SectionBadge>
              <SectionBadge tone="red">残りわずか</SectionBadge>
              <SectionBadge tone="stone">送料込み</SectionBadge>
            </div>

            <h3 className="mt-3 text-[1.75rem] md:text-[2rem] font-black tracking-tight text-[#2b3528]">
              きれいさ重視の方に
            </h3>

            <SummaryStrip
              items={[
                { icon: "🎁", label: "贈答向きの見た目" },
                { icon: "🍊", label: "市場にも出回る品質" },
                { icon: "❄️", label: "サンテで守って育成" },
              ]}
            />

            <div className="mt-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">内容量を選択</p>
              <div className="inline-flex h-12 sm:h-11 rounded-2xl border border-gray-200 overflow-hidden w-full">
                <button
                  onClick={() => setNatsumiTab("5kg")}
                  className={`flex-1 inline-flex items-center justify-center text-center px-3 sm:px-4
                    text-[15px] sm:text-sm leading-snug ${
                      natsumiTab === "5kg" ? "bg-green-600 text-white" : "bg-white hover:bg-green-50"
                    }`}
                  aria-pressed={natsumiTab === "5kg"}
                >
                  <span className="flex flex-col items-center leading-tight sm:flex-row sm:gap-2">
                    <span className="font-bold whitespace-nowrap">5kg</span>
                    <span className="text-[13px] sm:text-sm whitespace-nowrap">
                      {NATSUMI_PRICE_TABLE["5kg"].toLocaleString()}円
                    </span>
                  </span>
                </button>

                <button
                  onClick={() => setNatsumiTab("10kg")}
                  className={`flex-1 inline-flex items-center justify-center text-center px-3 sm:px-4
                    text-[15px] sm:text-sm leading-snug border-l border-gray-200 ${
                      natsumiTab === "10kg" ? "bg-green-600 text-white" : "bg-white hover:bg-green-50"
                    }`}
                  aria-pressed={natsumiTab === "10kg"}
                >
                  <span className="flex flex-col items-center leading-tight sm:flex-row sm:gap-2">
                    <span className="font-bold whitespace-nowrap">10kg</span>
                    <span className="text-[13px] sm:text-sm whitespace-nowrap">
                      {NATSUMI_PRICE_TABLE["10kg"].toLocaleString()}円
                    </span>
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-4">
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
                natsumiTab === "5kg" ? NATSUMI_PRICE_TABLE["5kg"] : NATSUMI_PRICE_TABLE["10kg"]
              ).toLocaleString()}円 / 箱`}
              subtotalLabel={`小計：${(
                (natsumiTab === "5kg" ? NATSUMI_PRICE_TABLE["5kg"] : NATSUMI_PRICE_TABLE["10kg"]) *
                natsumiQty
              ).toLocaleString()}円`}
            />

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
                    natsumiTab === "5kg" ? NATSUMI_PRICE_TABLE["5kg"] : NATSUMI_PRICE_TABLE["10kg"],
                  qty: natsumiQty,
                  extra: { natsumi: true, grade: "A" },
                });
                window.dispatchEvent(new Event("yk-cart-updated"));
                setToast("カートに追加しました");
              }}
              onBuy={() => {
                const unit =
                  natsumiTab === "5kg" ? NATSUMI_PRICE_TABLE["5kg"] : NATSUMI_PRICE_TABLE["10kg"];
                const p = unit * natsumiQty;
                router.push(
                  `/order?product=${encodeURIComponent("南津海（A品）")}` +
                    `&size=${encodeURIComponent(natsumiTab)}` +
                    `&qty=${natsumiQty}&price=${p}&buntan=${withBonus500g}&grade=A`
                );
              }}
            />
          </Panel>
        </div>
      </ProductSectionFrame>

      <ProductSectionFrame
        id="buntan"
        eyebrow={
          <>
            <SectionBadge tone="stone">爽やかな香り</SectionBadge>
            <SectionBadge tone="red">売り切れ</SectionBadge>
            <SectionBadge tone="stone">個数目安つき</SectionBadge>
          </>
        }
        title="文旦（箱）"
        subtitle="さっぱりとした甘さと爽やかな香りを楽しめる商品ですが、現在は売り切れです。"
      >
        <div className="grid gap-5 sm:gap-6 xl:grid-cols-[1.02fr_0.98fr] items-stretch">
          <Panel className="overflow-hidden order-1 xl:order-1">
            <div className="relative aspect-[4/3] w-full">
              <Image src="/mikan/buntan.jpg" alt="文旦（箱）" fill className="object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent px-5 py-5">
                <div className="flex flex-wrap items-center gap-2">
                  <SectionBadge tone="stone">文旦</SectionBadge>
                  <SectionBadge tone="red">売り切れ</SectionBadge>
                </div>
                <p className="mt-3 text-lg md:text-xl font-black text-white">
                  爽やかな香りとすっきりした甘さ
                </p>
              </div>
            </div>
          </Panel>

          <Panel className="p-5 md:p-7 order-2 xl:order-2">
            <div className="flex flex-wrap items-center gap-2">
              <SectionBadge tone="stone">文旦</SectionBadge>
              <SectionBadge tone="red">売り切れ</SectionBadge>
              <SectionBadge tone="stone">個数目安あり</SectionBadge>
            </div>

            <h3 className="mt-3 text-[1.75rem] md:text-[2rem] font-black tracking-tight text-[#2b3528]">
              香りとさっぱり感を楽しむ
            </h3>

            <SummaryStrip
              items={[
                { icon: "🍋", label: "爽やかな香り" },
                { icon: "😋", label: "さっぱりした甘さ" },
                { icon: "📦", label: "5kg箱は6個目安" },
              ]}
            />

            <div className="mt-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">内容量を選択</p>
              <div className="inline-flex h-12 sm:h-11 rounded-2xl border border-gray-200 overflow-hidden w-full">
                <button
                  onClick={() => setBuntanTab("5kg")}
                  className={`flex-1 inline-flex items-center justify-center text-center px-3 sm:px-4
                    text-[15px] sm:text-sm leading-snug ${
                      buntanTab === "5kg" ? "bg-green-600 text-white" : "bg-white hover:bg-green-50"
                    }`}
                  aria-pressed={buntanTab === "5kg"}
                >
                  <span className="flex flex-col items-center leading-tight sm:flex-row sm:gap-2">
                    <span className="font-bold whitespace-nowrap">5kg（6個）</span>
                    <span className="text-[13px] sm:text-sm whitespace-nowrap">
                      {buntanPrice5.toLocaleString()}円
                    </span>
                  </span>
                </button>

                <button
                  onClick={() => setBuntanTab("10kg")}
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

            <div className="mt-4">
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

            {buntanStatus !== "active" && (
              <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl px-4 py-4">
                {buntanStatus === "soldout" ? "現在売り切れです。" : "近日、事前予約可能予定です。"}
              </div>
            )}

            <div className="mt-4 rounded-3xl border border-yellow-200 bg-yellow-50 px-4 py-4">
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
                  extra: { buntan: true },
                });
                window.dispatchEvent(new Event("yk-cart-updated"));
                setToast("カートに追加しました");
              }}
              onBuy={() => {
                const unit = buntanTab === "5kg" ? buntanPrice5 : PRICE_TABLE["10kg"];
                const p = unit * buntanQty;
                router.push(
                  `/order?product=${encodeURIComponent("文旦（箱）")}` +
                    `&size=${encodeURIComponent(
                      buntanTab === "5kg" ? "5kg（6個）" : "10kg（12個）"
                    )}` +
                    `&qty=${buntanQty}&price=${p}&buntan=${withBonus500g}`
                );
              }}
            />
          </Panel>
        </div>
      </ProductSectionFrame>

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
   右上カート（PC用）
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