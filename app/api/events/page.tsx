// app/events/page.tsx
type Event = {
  date: string;
  title: string;
  location: string;
  description: string;
};

const events: Event[] = [
  { date: "2025-09-10", title: "Founders Roundtable", location: "Kyoto", description: "Craft, culture, and capital for the next century." },
  { date: "2025-10-21", title: "Heritage & Technology Forum", location: "Tokyo", description: "Long-term innovation across family enterprises." },
  { date: "2026-01-15", title: "Philanthropy Salon", location: "Osaka", description: "Community investment and cultural stewardship." },
];

export default function EventsPage() {
  return (
    <main className="py-10 space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold">イベント</h1>
        <p className="mt-2 text-neutral-600">今後のイベント予定とアーカイブ。</p>
      </header>

      <section className="grid gap-4">
        {events.map((e) => (
          <article key={e.title} className="card p-6">
            <div className="text-sm text-neutral-500">
              {new Date(e.date).toLocaleDateString("ja-JP", { dateStyle: "medium" })} ・ {e.location}
            </div>
            <h2 className="mt-1 font-medium">{e.title}</h2>
            <p className="mt-2 text-neutral-600">{e.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
