export const metadata = {
  title: "お知らせ｜山川みかん農園",
  description: "山川みかん農園のお知らせ一覧です。",
};

export default function NewsPage() {
  const newsList = [
    {
      date: "2026年 2月16日",
      title: "品種が変わりました（南津海）",
      detail: [
        "※寒波対策として、11月頃に果実へ1つずつサンテ（布）を被せ、手間をかけて育てています。",
        "※2月は酸味の後に遅れて甘さが来る印象。3月中旬頃から甘さが増してきます。",
        "※酸味と糖度のバランスが良く、種がある場合もあります。",
        "※青果ですが、送料込みのサイト特価で販売しています。",
      ],
    },
    {
      date: "2025年 11月25日",
      title: "品種が変わりました",
      detail: [
        "※最初から最後まで甘く、非常にコクのあるみかんです。",
        "※大きさにばらつきがあるため、100円みかんの一袋に対する量が大きく変動することがあります。",
      ],
    },
    {
      date: "2025年 11月10日",
      title: "品種が変わりました",
      detail: [
        "※味が甘く最後にほんのり酸っぱさが残り非常に満足感があります。",
      ],
    },
  ];

  return (
    <main className="max-w-4xl mx-auto px-6 py-20 text-[#222]">
      <h1 className="text-4xl font-bold mb-10 text-center text-[#1f1f1f]">
        お知らせ
      </h1>

      <div className="space-y-10">
        {/* =========================
            追加：次回販売のお知らせ
        ========================= */}
        <section className="border rounded-xl p-6 shadow-sm bg-white">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge tone="orange">次回販売のお知らせ</Badge>
            <Badge tone="green">2026年秋予定</Badge>
            <Badge tone="stone">メルマガ案内予定</Badge>
          </div>

          <p className="text-[15px] text-[#666] font-medium">2026年 秋予定</p>

          <h2 className="text-2xl sm:text-3xl font-bold mt-3 text-[#1f1f1f] leading-tight">
            次回は「早味かん」から販売開始予定です
          </h2>

          <p className="mt-5 text-[15px] sm:text-base text-[#333] leading-8">
            次回のみかん販売は、
            <strong className="text-[#1f1f1f]">極早生みかんではなく早味かんから開始予定</strong>
            です。おおむねの販売開始日は、
            <strong className="text-[#1f1f1f]">2026年9月10日</strong>
            に
            <strong className="text-[#1f1f1f]">早味かん青果・小玉</strong>
            を予定しています。
            その後、
            <strong className="text-[#1f1f1f]">2026年9月20日</strong>
            に
            <strong className="text-[#1f1f1f]">日南の青果・小玉</strong>
            を追加予定です。
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-4">
              <p className="text-sm font-semibold text-orange-700">販売予定①</p>
              <h3 className="mt-2 text-lg font-bold text-[#1f1f1f]">
                早味かん 青果・小玉
              </h3>
              <p className="mt-1 text-[#444]">2026年9月10日ごろ販売開始予定</p>
            </div>

            <div className="rounded-xl border border-green-200 bg-green-50/60 p-4">
              <p className="text-sm font-semibold text-green-700">販売予定②</p>
              <h3 className="mt-2 text-lg font-bold text-[#1f1f1f]">
                日南 青果・小玉
              </h3>
              <p className="mt-1 text-[#444]">2026年9月20日ごろ追加予定</p>
            </div>
          </div>

         

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-orange-200 bg-white p-5">
              <h3 className="text-lg font-bold text-[#1f1f1f]">早味かんの特徴</h3>
              <p className="mt-2 text-[#333] leading-7">
                極早生の時期に楽しめる、出始めのみかんです。さわやかな香りがあり、
                小ぶりで食べやすく、軽やかな食味が魅力です。
              </p>
            </div>

            <div className="rounded-xl border border-green-200 bg-white p-5">
              <h3 className="text-lg font-bold text-[#1f1f1f]">日南の特徴</h3>
              <p className="mt-2 text-[#333] leading-7">
                極早生温州みかんの代表的な系統のひとつで、早い時期から楽しめる品種です。
                さわやかな香りと甘みのバランスの良さが特徴です。
              </p>
            </div>
          </div>
        </section>

        {/* 既存のお知らせ一覧 */}
        {newsList.map((item, idx) => (
          <div
            key={idx}
            className="border rounded-xl p-6 shadow-sm bg-white"
          >
            <p className="text-[#666] font-medium">{item.date}</p>
            <h2 className="text-xl font-bold mt-2 text-[#1f1f1f]">
              {item.title}
            </h2>

            <ul className="list-disc pl-6 mt-4 text-[#333] leading-8">
              {item.detail.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "orange" | "green" | "stone";
}) {
  const styles = {
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    green: "bg-green-50 text-green-700 border-green-200",
    stone: "bg-stone-50 text-stone-700 border-stone-200",
  } as const;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${styles[tone]}`}
    >
      {children}
    </span>
  );
}