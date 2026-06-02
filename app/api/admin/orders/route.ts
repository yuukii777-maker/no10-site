import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const GAS_ORDER_URL =
  process.env.GAS_ORDER_URL ||
  "https://script.google.com/macros/s/AKfycbw9FiKbkzno4gqGK4jkZKaBB-Cxw8gOYtSCmMBOM8RNX95ZLp_uqxGiHvv0Wzm2eH1s/exec";

function isAdminLoggedIn() {
  const session = cookies().get("admin_auth")?.value;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  return !!sessionSecret && session === sessionSecret;
}

function normalizeStatus(status: string) {
  if (status === "未確認") return "ordered";
  if (status === "確認中") return "PAID（要確認）";
  if (status === "発送準備中") return "SHIPPED（要確認）";
  if (status === "発送済み") return "SHIPPED";
  if (status === "キャンセル") return "CANCELED";

  return status;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

function isSheetOrderId(value: string) {
  return /^YMK-/i.test(value);
}

function getOrderIdForSheet(order: any) {
  const candidates = [
    order?.sheet_order_id,
    order?.sheetOrderId,
    order?.order_id,
    order?.orderId,
    order?.orderid,

    order?.raw_payload?.sheet_order_id,
    order?.raw_payload?.sheetOrderId,
    order?.raw_payload?.orderId,
    order?.raw_payload?.order_id,
    order?.raw_payload?.orderid,

    order?.raw_payload?.baseOrderId,
    order?.raw_payload?.base_order_id,
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  const ymkId = candidates.find((value) => isSheetOrderId(value));
  if (ymkId) return ymkId;

  const nonUuidId = candidates.find((value) => !isUuid(value));
  if (nonUuidId) return nonUuidId;

  return "";
}

async function updateSpreadsheetStatus(order: any, status: string) {
  const orderId = getOrderIdForSheet(order);

  if (!orderId) {
    return {
      ok: false,
      skipped: true,
      message:
        "スプレッドシート更新用のYMK注文IDが見つかりませんでした。Supabaseのordersにsheet_order_idを保存してください。",
    };
  }

  const params = new URLSearchParams();
  params.set("action", "updateStatus");
  params.set("orderId", String(orderId));
  params.set("status", status);
  params.set("supabase_id", String(order.id || ""));
  params.set("email", String(order.email || ""));
  params.set("customer_name", String(order.customer_name || ""));

  try {
    const res = await fetch(GAS_ORDER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: params.toString(),
      cache: "no-store",
    });

    const text = await res.text().catch(() => "");

    let gasJson: any = null;

    try {
      gasJson = text ? JSON.parse(text) : null;
    } catch {
      gasJson = null;
    }

    if (!res.ok) {
      return {
        ok: false,
        skipped: false,
        message: text || "スプレッドシート側の更新に失敗しました。",
      };
    }

    if (gasJson && gasJson.ok === false) {
      return {
        ok: false,
        skipped: false,
        message: text,
      };
    }

    return {
      ok: true,
      skipped: false,
      message: text || "スプレッドシート側のステータスを更新しました。",
    };
  } catch (error) {
    console.error("SPREADSHEET_STATUS_UPDATE_ERROR", error);

    return {
      ok: false,
      skipped: false,
      message: "スプレッドシート側の更新通信に失敗しました。",
    };
  }
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
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      orders: data ?? [],
    });
  } catch (error) {
    console.error("ADMIN_ORDERS_GET_ERROR", error);

    return NextResponse.json(
      { ok: false, message: "注文情報の取得に失敗しました。" },
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
    const status = normalizeStatus(String(payload.status || "").trim());

    if (!id) {
      return NextResponse.json(
        { ok: false, message: "注文IDがありません。" },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { ok: false, message: "ステータスがありません。" },
        { status: 400 }
      );
    }

    const { data: beforeOrder, error: beforeError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (beforeError) {
      return NextResponse.json(
        { ok: false, message: beforeError.message },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from("orders")
      .update({
        status,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    const sheetResult = await updateSpreadsheetStatus(
      {
        ...beforeOrder,
        ...data,
      },
      status
    );

    return NextResponse.json({
      ok: true,
      order: data,
      spreadsheet_sync: sheetResult.ok,
      spreadsheet_message: sheetResult.message,
    });
  } catch (error) {
    console.error("ADMIN_ORDERS_PATCH_ERROR", error);

    return NextResponse.json(
      { ok: false, message: "注文ステータスの更新に失敗しました。" },
      { status: 500 }
    );
  }
}