// app/api/contacts.csv/route.ts
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic"; // 常に最新

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return new Response("DATABASE_URL missing", { status: 500 });
    }

    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      SELECT id, name, email, message, created_at
      FROM contacts
      ORDER BY id DESC
    ` as unknown as {
      id: number; name: string; email: string; message: string; created_at: string;
    }[];

    // RFC4180準拠の簡易エスケープ（ダブルクォートを2つにして全体を""で囲む）
    const esc = (v: unknown) => {
      if (v === null || v === undefined) return '""';
      return `"${String(v).replace(/"/g, '""')}"`;
    };

    const header = ["id", "name", "email", "message", "created_at"].join(",");
    const body = rows
      .map(r =>
        [r.id, r.name, r.email, r.message, new Date(r.created_at).toISOString()]
          .map(esc)
          .join(",")
      )
      .join("\r\n");

    // Excelで文字化けしないようにBOMを先頭に付与
    const csv = "\uFEFF" + header + "\r\n" + body;

    return new Response(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": 'attachment; filename="contacts.csv"',
        "cache-control": "no-store",
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown";
    return new Response("error: " + msg, { status: 500 });
  }
}
