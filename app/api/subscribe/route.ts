// app/api/subscribe/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // JSON と form-urlencoded の両方に対応
    const contentType = req.headers.get("content-type") || "";
    let email = "";
    let source = "";

    if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      email = (body?.email || "").trim();
      source = (body?.source || "").trim();
    } else {
      const form = await req.formData();
      email = String(form.get("email") || "").trim();
      source = String(form.get("source") || "").trim();
    }

    if (!email) {
      // fetch からのエラー応答
      if (!wantsHtml(req)) {
        return NextResponse.json({ ok: false, error: "no_email" }, { status: 400 });
      }
      // フォーム送信なら同じページへエラークエリで戻す
      return NextResponse.redirect(new URL("/about?sub=err", req.url));
    }

    const endpoint = process.env.GAS_SUBSCRIBE_ENDPOINT;
    if (!endpoint) {
      const msg = "Missing GAS_SUBSCRIBE_ENDPOINT";
      if (!wantsHtml(req)) return NextResponse.json({ ok: false, error: msg }, { status: 500 });
      return NextResponse.redirect(new URL("/about?sub=err", req.url));
    }

    // GAS 側は JSON で受ける想定
    const r = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source }),
      cache: "no-store",
    });

    if (!r.ok) {
      if (!wantsHtml(req)) return NextResponse.json({ ok: false }, { status: 502 });
      return NextResponse.redirect(new URL("/about?sub=err", req.url));
    }

    // fetch からは JSON、フォーム送信からは /about に戻す
    if (!wantsHtml(req)) return NextResponse.json({ ok: true });
    return NextResponse.redirect(new URL("/about?sub=ok", req.url));
  } catch (err) {
    if (!wantsHtml(req)) {
      return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
    }
    return NextResponse.redirect(new URL("/about?sub=err", req.url));
  }
}

function wantsHtml(req: NextRequest) {
  const accept = req.headers.get("accept") || "";
  // ブラウザのフォーム送信は text/html を含むことが多い
  return accept.includes("text/html");
}
