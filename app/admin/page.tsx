// app/admin/page.tsx ーー CSVダウンロードボタン付き
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic"; // 常に最新

type Row = {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

export default async function AdminPage() {
  if (!process.env.DATABASE_URL) {
    return (
      <main className="container-max py-10">
        <h1 className="font-display text-3xl font-semibold mb-4">お問い合わせ一覧</h1>
        <p className="text-red-600">DATABASE_URL が未設定です。.env.local を確認してください。</p>
      </main>
    );
  }

  const sql = neon(process.env.DATABASE_URL);
  const rows = (await sql`
    SELECT id, name, email, message, created_at
    FROM contacts
    ORDER BY id DESC
    LIMIT 200
  `) as unknown as Row[];

  return (
    <main className="container-max py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">お問い合わせ一覧</h1>

        {/* ← これが保存ボタン（CSVダウンロード） */}
        <a
          href="/api/contacts.csv"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-black text-white hover:opacity-90"
          download
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 3v10m0 0l3.5-3.5M12 13L8.5 9.5M4 15v3a3 3 0 003 3h10a3 3 0 003-3v-3" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          CSVダウンロード
        </a>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">名前</th>
                <th className="px-4 py-3 text-left">メール</th>
                <th className="px-4 py-3 text-left">メッセージ</th>
                <th className="px-4 py-3 text-left">日時</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-neutral-500" colSpan={5}>
                    まだデータがありません。トップのフォームから送信してみてください。
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-3">{r.id}</td>
                    <td className="px-4 py-3">{r.name}</td>
                    <td className="px-4 py-3">{r.email}</td>
                    <td className="px-4 py-3 max-w-[520px]">
                      <div className="whitespace-pre-wrap break-words">{r.message}</div>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(r.created_at).toLocaleString("ja-JP")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-sm text-neutral-500">
        ※ この一覧とCSVは誰でもアクセスできます。公開時は認証で保護することをおすすめします。
      </p>
    </main>
  );
}
