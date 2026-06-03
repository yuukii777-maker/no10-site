import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("home_banners")
      .select("*")
      .eq("is_active", true)
      .order("slot", { ascending: true });

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        banners: data ?? [],
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("HOME_BANNERS_GET_ERROR", error);

    return NextResponse.json(
      { ok: false, message: "ホームバナーの取得に失敗しました。" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}