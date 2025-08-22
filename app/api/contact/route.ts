// app/api/contact/route.ts
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";

type Body = {
  name?: string;
  email?: string;
  message?: string;
  turnstileToken?: string;
};

export async function POST(req: Request) {
  try {
    const { name, email, message, turnstileToken } = (await req.json()) as Body;

    // 入力チェック
    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: "missing fields" },
        { status: 400 }
      );
    }

    // --- Turnstile 検証（鍵が設定されていれば実行 / 無ければスキップ）
    if (process.env.TURNSTILE_SECRET_KEY) {
      const body = new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: turnstileToken ?? "",
      });
      const verify = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "content-type": "application/x-www-form-urlencoded" },
          body,
        }
      ).then((r) => r.json());

      if (!verify?.success) {
        return NextResponse.json(
          { ok: false, error: "turnstile failed" },
          { status: 400 }
        );
      }
    }

    // --- DB 保存（Neon）
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { ok: false, error: "server not configured (DATABASE_URL missing)" },
        { status: 500 }
      );
    }
    const sql = neon(process.env.DATABASE_URL);

    // テーブルが無ければ作成
    await sql`
      CREATE TABLE IF NOT EXISTS contacts (
        id serial PRIMARY KEY,
        name text NOT NULL,
        email text NOT NULL,
        message text NOT NULL,
        created_at timestamptz DEFAULT now()
      )
    `;

    // 1件登録
    await sql`
      INSERT INTO contacts (name, email, message)
      VALUES (${name}, ${email}, ${message})
    `;

    // --- 確認メール（鍵があれば送信 / 無ければスキップ）
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const from = process.env.RESEND_FROM || "onboarding@resend.dev";
        await resend.emails.send({
          from,
          to: email,
          subject: "お問い合わせありがとうございます",
          text: `${name} 様\n\nメッセージを受け取りました。\n\n—— 自動送信 / No.10 Family Office`,
        });
      } catch {
        // メール失敗は致命ではないので何もしない
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
