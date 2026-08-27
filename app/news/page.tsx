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
  ];

  return (
    <main className="max-w-4xl mx-auto px-6 py-20 text-[#222]">
      <h1 className="text-4xl font-bold mb-10 text-center text-[#1f1f1f]">
        お知らせ
      </h1>

      <div className="space-y-10">
        {/* =========================
            2026年産みかん販売のお知らせ
        ========================= */}
        <section className="border rounded-xl p-6 shadow-sm bg-white">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge tone="orange">2026年産</Badge>
            <Badge tone="green">販売予定</Badge>
            <Badge tone="stone">農家直送</Badge>
          </div>

          <p className="text-[15px] text-[#666] font-medium">
            2026年8月29日
          </p>

          <h2 className="text-2xl sm:text-3xl font-bold mt-3 text-[#1f1f1f] leading-tight">
            2026年産みかんの販売について
          </h2>

          <p className="mt-5 text-[15px] sm:text-base text-[#333] leading-8">
            2026年産のみかんは、
            <strong className="text-[#1f1f1f]">
              9月5日（土）より販売サイトでご注文受付を開始
            </strong>
            いたします。
            <br />
            9月9日（水）より順次発送予定です。
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-4">
              <p className="text-sm font-semibold text-orange-700">
                早味かん
              </p>

              <h3 className="mt-2 text-lg font-bold text-[#1f1f1f]">
                早味かん 青果・小玉
              </h3>

              <p className="mt-2 text-[#444] leading-7">
                販売期間：
                <strong>9月9日〜10月10日頃</strong>
              </p>
            </div>

            <div className="rounded-xl border border-green-200 bg-green-50/60 p-4">
              <p className="text-sm font-semibold text-green-700">
                日南
              </p>

              <h3 className="mt-2 text-lg font-bold text-[#1f1f1f]">
                日南 青果
              </h3>

              <p className="mt-2 text-[#444] leading-7">
                販売期間：
                <strong>9月20日〜10月5日頃</strong>
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm text-[#666] leading-7">
            ※収穫・販売状況により、販売期間が前後する場合があります。
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-orange-200 bg-white p-5">
              <h3 className="text-lg font-bold text-[#1f1f1f]">
                早味かんの特徴
              </h3>

              <p className="mt-2 text-[#333] leading-7">
                極早生の時期に楽しめる、出始めのみかんです。
                青みの残る外観ですが、糖度は12度前後あり、
                極早生みかんの中でも特に甘い品種です。
                福岡県でしか栽培できない希少な品種でもあります。
              </p>
            </div>

            <div className="rounded-xl border border-green-200 bg-white p-5">
              <h3 className="text-lg font-bold text-[#1f1f1f]">
                日南の特徴
              </h3>

              <p className="mt-2 text-[#333] leading-7">
                極早生温州みかんの代表的な系統のひとつで、
                早い時期から楽しめる品種です。
                さわやかな香りと甘みのバランスの良さが特徴です。
              </p>
            </div>
          </div>

          {/* =========================
              北原早生
          ========================= */}
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="orange">次回販売予定</Badge>
              <Badge tone="stone">10月頃</Badge>
            </div>

            <h3 className="mt-4 text-xl sm:text-2xl font-bold text-[#1f1f1f]">
              北原早生
            </h3>

            <p className="mt-3 text-[#333] leading-7">
              早味かん・日南の販売終了後は、
              <strong className="text-[#1f1f1f]">
                北原早生を10月20日頃より販売予定
              </strong>
              です。
            </p>

            <p className="mt-3 text-[#333] leading-7">
              北原早生は、糖度が高く、
              <strong>
                コクのある甘みにほどよい酸味が加わった、
                絶妙なバランス
              </strong>
              が魅力のみかんです。
            </p>
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