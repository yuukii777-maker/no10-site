// app/team/page.tsx
type Member = {
  name: string;
  role: string;
  bio: string;
};

const team: Member[] = [
  { name: "A. Yamato", role: "Principal", bio: "Heritage-led investing and governance." },
  { name: "M. Sora", role: "Partner, Technology", bio: "Deep tech, software, and data platforms." },
  { name: "K. Rin", role: "Partner, Culture", bio: "Crafts, media, and community programs." },
];

export default function TeamPage() {
  return (
    <main className="py-10 space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold">チーム紹介</h1>
        <p className="mt-2 text-neutral-600">世代を超えて価値をつなぐメンバー。</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {team.map((m) => (
          <article key={m.name} className="card p-6">
            <h2 className="font-medium">{m.name}</h2>
            <div className="text-sm text-neutral-500">{m.role}</div>
            <p className="mt-3 text-neutral-600">{m.bio}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
