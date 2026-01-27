// app/api/subscribe/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ★追加：環境変数が無いとき用の“固定URL”フォールバック
const GAS_FALLBACK =
  "https://script.google.com/macros/s/AKfycbw9FiKbkzno4gqGK4jkZKaBB-Cxw8gOYtSCmMBOM8RNX95ZLp_uqxGiHvv0Wzm2eH1s/exec";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let email = "";
    let source = "";

    if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({} as any));
      email = (body?.email || "").trim();
      source = (body?.source || "").trim();
    } else {
      const form = await req.formData();
      email = String(form.get("email") || "").trim();
      source = String(form.get("source") || "").trim();
    }

    if (!email) {
      if (!wantsHtml(req)) {
        return NextResponse.json({ ok: false, error: "no_email" }, { status: 400 });
      }
      return NextResponse.redirect(new URL("/about?sub=err", req.url));
    }

    // ★修正：環境変数→無ければハードコードURLへフォールバック
    const endpoint =
      process.env.GAS_SUBSCRIBE_ENDPOINT ||
      process.env.GAS_SUBSCRIBE_URL ||
      GAS_FALLBACK;

    // ---- POST→GET フォールバック ----
    let ok = false;
    let detail: any = null;

    const r1 = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source }),
      cache: "no-store",
    }).catch(() => null as any);

    if (r1 && r1.ok) {
      ok = true;
      detail = await r1.json().catch(() => null);
    }

    if (!ok) {
      const qs = new URLSearchParams({ email, source, ts: String(Date.now()) });
      const r2 = await fetch(`${endpoint}?${qs.toString()}`, {
        method: "GET",
        cache: "no-store",
      }).catch(() => null as any);

      if (r2 && r2.ok) {
        ok = true;
        detail = await r2
          .json()
          .catch(async () => ({ text: await r2.text().catch(() => "") }));
      }
    }

    if (!ok) {
      if (!wantsHtml(req)) return NextResponse.json({ ok: false }, { status: 502 });
      return NextResponse.redirect(new URL("/about?sub=err", req.url));
    }

    if (!wantsHtml(req)) return NextResponse.json({ ok: true, detail });
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
  return accept.includes("text/html");
}
