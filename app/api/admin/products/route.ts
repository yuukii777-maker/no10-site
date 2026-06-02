import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

function isAdminLoggedIn() {
  const session = cookies().get("admin_auth")?.value;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  return !!sessionSecret && session === sessionSecret;
}

function normalizeProductPayload(payload: any) {
  return {
    name: String(payload.name || "").trim(),
    tag: String(payload.tag || "みかん").trim(),
    image_url: String(payload.image_url || "").trim(),

    description: String(payload.description || "").trim(),
    notice: String(payload.notice || "").trim(),

    price_5kg:
      payload.price_5kg === "" || payload.price_5kg === null
        ? null
        : Number(payload.price_5kg),

    price_10kg:
      payload.price_10kg === "" || payload.price_10kg === null
        ? null
        : Number(payload.price_10kg),

    unit_label: String(payload.unit_label || "箱").trim(),
    stock_status: String(payload.stock_status || "販売中").trim(),

    is_active: Boolean(payload.is_active),
    sort_order:
      payload.sort_order === "" || payload.sort_order === null
        ? 0
        : Number(payload.sort_order),

    updated_at: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    if (!isAdminLoggedIn()) {
      return NextResponse.json(
        { ok: false, message: "ログインが必要です。" },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      products: data ?? [],
    });
  } catch (error) {
    console.error("ADMIN_PRODUCTS_GET_ERROR", error);

    return NextResponse.json(
      { ok: false, message: "商品の取得に失敗しました。" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!isAdminLoggedIn()) {
      return NextResponse.json(
        { ok: false, message: "ログインが必要です。" },
        { status: 401 }
      );
    }

    const payload = await request.json();
    const product = normalizeProductPayload(payload);

    if (!product.name) {
      return NextResponse.json(
        { ok: false, message: "商品名を入力してください。" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("products")
      .insert(product)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      product: data,
    });
  } catch (error) {
    console.error("ADMIN_PRODUCTS_POST_ERROR", error);

    return NextResponse.json(
      { ok: false, message: "商品の追加に失敗しました。" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    if (!isAdminLoggedIn()) {
      return NextResponse.json(
        { ok: false, message: "ログインが必要です。" },
        { status: 401 }
      );
    }

    const payload = await request.json();
    const id = String(payload.id || "").trim();

    if (!id) {
      return NextResponse.json(
        { ok: false, message: "商品IDがありません。" },
        { status: 400 }
      );
    }

    const product = normalizeProductPayload(payload);

    if (!product.name) {
      return NextResponse.json(
        { ok: false, message: "商品名を入力してください。" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("products")
      .update(product)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      product: data,
    });
  } catch (error) {
    console.error("ADMIN_PRODUCTS_PATCH_ERROR", error);

    return NextResponse.json(
      { ok: false, message: "商品の更新に失敗しました。" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    if (!isAdminLoggedIn()) {
      return NextResponse.json(
        { ok: false, message: "ログインが必要です。" },
        { status: 401 }
      );
    }

    const payload = await request.json();

    const items = Array.isArray(payload.items)
      ? payload.items
      : Array.isArray(payload.ids)
      ? payload.ids.map((id: string, index: number) => ({
          id,
          sort_order: index + 1,
        }))
      : [];

    if (items.length === 0) {
      return NextResponse.json(
        { ok: false, message: "並び替える商品がありません。" },
        { status: 400 }
      );
    }

    const normalizedItems = items.map((item: any, index: number) => ({
      id: String(item.id || "").trim(),
      sort_order:
        item.sort_order === "" ||
        item.sort_order === null ||
        item.sort_order === undefined
          ? index + 1
          : Number(item.sort_order),
    }));

    const invalidItem = normalizedItems.find((item) => !item.id);

    if (invalidItem) {
      return NextResponse.json(
        { ok: false, message: "商品IDがない商品があります。" },
        { status: 400 }
      );
    }

    const updatedAt = new Date().toISOString();

    const results = await Promise.all(
      normalizedItems.map((item) =>
        supabase
          .from("products")
          .update({
            sort_order: item.sort_order,
            updated_at: updatedAt,
          })
          .eq("id", item.id)
      )
    );

    const errorResult = results.find((result) => result.error);

    if (errorResult?.error) {
      return NextResponse.json(
        { ok: false, message: errorResult.error.message },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      products: data ?? [],
    });
  } catch (error) {
    console.error("ADMIN_PRODUCTS_PUT_ERROR", error);

    return NextResponse.json(
      { ok: false, message: "商品の並び替え保存に失敗しました。" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!isAdminLoggedIn()) {
      return NextResponse.json(
        { ok: false, message: "ログインが必要です。" },
        { status: 401 }
      );
    }

    const payload = await request.json();
    const id = String(payload.id || "").trim();

    if (!id) {
      return NextResponse.json(
        { ok: false, message: "商品IDがありません。" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("products")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("ADMIN_PRODUCTS_DELETE_ERROR", error);

    return NextResponse.json(
      { ok: false, message: "商品の非表示に失敗しました。" },
      { status: 500 }
    );
  }
}