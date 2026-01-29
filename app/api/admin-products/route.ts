import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const GAS_URL = process.env.GAS_URL || process.env.NEXT_PUBLIC_GAS_URL;
    if (!GAS_URL) {
      return NextResponse.json(
        { ok: false, error: "GAS_URL is not set" },
        { status: 500 }
      );
    }

    const r = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await r.text();

    // GASがエラーでも本文は返して原因を見える化
    let parsed: any = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { ok: false, raw: text };
    }

    // ここ重要：GAS側の ok=false でも HTTP 200 にしてフロントで表示できるようにする
    return NextResponse.json(parsed, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
