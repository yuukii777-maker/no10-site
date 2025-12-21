export const metadata = {
  title: "お知らせ｜山川みかん農園",
  description: "山川みかん農園のお知らせ一覧です。",
};

export default function NewsPage() {
  const newsList = [
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
    <main className="max-w-4xl mx-auto px-6 py-20 text-[#333]">
      <h1 className="text-4xl font-bold mb-10 text-center">お知らせ</h1>

      <div className="space-y-10">
        {newsList.map((item, idx) => (
          <div
            key={idx}
            className="border rounded-xl p-6 shadow-sm bg-white"
          >
            <p className="text-gray-500">{item.date}</p>
            <h2 className="text-xl font-bold mt-2">{item.title}</h2>

            <ul className="list-disc pl-6 mt-4 text-gray-700 leading-relaxed">
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
