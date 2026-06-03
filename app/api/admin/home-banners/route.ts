import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

function isAdminLoggedIn() {
  const session = cookies().get("admin_auth")?.value;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  return !!sessionSecret && session === sessionSecret;
}

export async function GET() {
  if (!isAdminLoggedIn()) {
    return NextResponse.json(
      { ok: false, message: "ログインが必要です。" },
      { status: 401 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("home_banners")
      .select("*")
      .order("slot", { ascending: true });

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      banners: data ?? [],
    });
  } catch (error) {
    console.error("ADMIN_HOME_BANNERS_GET_ERROR", error);

    return NextResponse.json(
      { ok: false, message: "ホームバナーの取得に失敗しました。" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  if (!isAdminLoggedIn()) {
    return NextResponse.json(
      { ok: false, message: "ログインが必要です。" },
      { status: 401 }
    );
  }

  try {
    const payload = await request.json();

    const slot = Number(payload.slot);
    const image_url = String(payload.image_url || "").trim();
    const caption = String(payload.caption || "").trim();
    const is_active =
      typeof payload.is_active === "boolean" ? payload.is_active : true;

    if (!slot || slot < 1 || slot > 3) {
      return NextResponse.json(
        { ok: false, message: "更新するバナー番号が正しくありません。" },
        { status: 400 }
      );
    }

    if (!image_url) {
      return NextResponse.json(
        { ok: false, message: "画像を設定してください。" },
        { status: 400 }
      );
    }

    if (!caption) {
      return NextResponse.json(
        { ok: false, message: "バナー下の文章を入力してください。" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("home_banners")
      .update({
        image_url,
        caption,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("slot", slot)
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
      banner: data,
    });
  } catch (error) {
    console.error("ADMIN_HOME_BANNERS_PATCH_ERROR", error);

    return NextResponse.json(
      { ok: false, message: "ホームバナーの更新に失敗しました。" },
      { status: 500 }
    );
  }
}