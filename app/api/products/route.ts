// app/api/products/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ProductItem = {
  id?: string;
  product: string;
  price: number;
  status: "active" | "soldout" | "comingsoon";
  feature: string;
};

type GasRes =
  | { ok: true; items: ProductItem[] }
  | { ok: false; error: string; [k: string]: any };

export async function GET() {
  try {
    const GAS_URL = process.env.GAS_URL || process.env.NEXT_PUBLIC_GAS_URL;
    if (!GAS_URL) {
      return NextResponse.json(
        { ok: false, error: "GAS_URL is not set" },
        { status: 500 }
      );
    }

    // GASへ readProducts を依頼（PW不要の読み取り設計を想定）
    const r = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "readProducts" }),
      cache: "no-store",
    });

    const text = await r.text();

    // GASがエラーでも本文を返して原因を見える化
    let parsed: any = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { ok: false, error: "GAS returned non-JSON", raw: text.slice(0, 500) },
        { status: 200 }
      );
    }

    const data = parsed as GasRes;

    if (!data || data.ok !== true || !Array.isArray((data as any).items)) {
      return NextResponse.json(
        { ok: false, error: (data as any)?.error || "unknown", raw: data },
        { status: 200 }
      );
    }

    // 形を軽く正規化（壊れてても落とさず吸収）
    const items: ProductItem[] = (data.items || []).map((it: any) => ({
      id: String(it?.id ?? ""),
      product: String(it?.product ?? ""),
      price: Number(it?.price ?? 0),
      status: (it?.status === "active" ||
      it?.status === "soldout" ||
      it?.status === "comingsoon"
        ? it.status
        : "soldout") as ProductItem["status"],
      feature: String(it?.feature ?? ""),
    }));

    return NextResponse.json({ ok: true, items }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
