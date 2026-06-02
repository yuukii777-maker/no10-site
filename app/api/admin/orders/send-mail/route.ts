import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type SendMailType = "paid" | "shipped";

type RequestBody = {
  id?: string;
  orderId?: string;
  type?: SendMailType;
  status?: string;
  trackingNumber?: string;
};

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

function getGasUrl() {
  return (
    process.env.GAS_STATUS_MAIL_URL ||
    process.env.GAS_WEB_APP_URL ||
    process.env.GAS_ORDER_URL ||
    process.env.GAS_URL ||
    ""
  );
}

function getSheetOrderId(order: any, fallbackOrderId: string) {
  return String(
    fallbackOrderId ||
      order?.sheet_order_id ||
      order?.order_id ||
      order?.orderId ||
      order?.orderid ||
      order?.raw_payload?.sheet_order_id ||
      order?.raw_payload?.orderId ||
      order?.raw_payload?.order_id ||
      order?.raw_payload?.orderid ||
      ""
  ).trim();
}

function isTrackingColumnError(errorMessage: string) {
  const msg = String(errorMessage || "").toLowerCase();

  return (
    msg.includes("tracking_number") ||
    msg.includes("column") ||
    msg.includes("schema cache")
  );
}

export async function POST(req: Request) {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Supabaseの環境変数が設定されていません。SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY を確認してください。",
        },
        { status: 500 }
      );
    }

    const body = (await req.json()) as RequestBody;

    const id = String(body.id || "").trim();
    const requestOrderId = String(body.orderId || "").trim();
    const type = body.type;
    const trackingNumber = String(body.trackingNumber || "").trim();

    if (!id) {
      return NextResponse.json(
        {
          ok: false,
          message: "注文IDがありません。",
        },
        { status: 400 }
      );
    }

    if (type !== "paid" && type !== "shipped") {
      return NextResponse.json(
        {
          ok: false,
          message: "メール種別が不正です。",
        },
        { status: 400 }
      );
    }

    if (type === "shipped") {
      const trackingDigits = trackingNumber.replace(/[^0-9]/g, "");

      if (!/^\d{11,13}$/.test(trackingDigits)) {
        return NextResponse.json(
          {
            ok: false,
            message: "発送完了メールには11〜13桁の追跡番号が必要です。",
          },
          { status: 400 }
        );
      }
    }

    const gasUrl = getGasUrl();

    if (!gasUrl) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "GASのURLが設定されていません。GAS_STATUS_MAIL_URL / GAS_WEB_APP_URL / GAS_ORDER_URL / GAS_URL のどれかを設定してください。",
        },
        { status: 500 }
      );
    }

    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        {
          ok: false,
          message: "注文情報が見つかりません。",
          detail: fetchError?.message,
        },
        { status: 404 }
      );
    }

    const orderId = getSheetOrderId(order, requestOrderId);

    if (!orderId) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "スプレッドシート側の注文IDが見つかりません。sheet_order_id または raw_payload.orderId を確認してください。",
        },
        { status: 400 }
      );
    }

    const nextStatus = type === "paid" ? "PAID" : "SHIPPED";

    const gasRes = await fetch(gasUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "sendStatusMail",
        id,
        orderId,
        order_id: orderId,
        orderid: orderId,
        type,
        mailType: type,
        status: nextStatus,
        tracking: trackingNumber,
        trackingNumber,
        password: process.env.ADMIN_PW || "",
      }),
      cache: "no-store",
    });

    const text = await gasRes.text();

    let gasData: any = null;

    try {
      gasData = text ? JSON.parse(text) : null;
    } catch {
      gasData = {
        raw: text,
      };
    }

    if (!gasRes.ok) {
      return NextResponse.json(
        {
          ok: false,
          message:
            gasData?.message ||
            gasData?.error ||
            "GAS側でメール送信に失敗しました。",
          gas: gasData,
        },
        { status: 500 }
      );
    }

    if (gasData?.ok === false) {
      return NextResponse.json(
        {
          ok: false,
          message:
            gasData?.message ||
            gasData?.error ||
            "GAS側でメール送信に失敗しました。",
          gas: gasData,
        },
        { status: 500 }
      );
    }

    const updatePayload: Record<string, any> = {
      status: gasData?.status || nextStatus,
      raw_payload: {
        ...(order.raw_payload || {}),
        sheet_order_id: orderId,
        orderId,
        lastStatusMailType: type,
        lastStatusMailSentAt: new Date().toISOString(),
        trackingNumber: trackingNumber || order.raw_payload?.trackingNumber || "",
      },
    };

    if (type === "shipped") {
      updatePayload.tracking_number = trackingNumber;
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update(updatePayload)
      .eq("id", id);

    if (updateError) {
      if (type === "shipped" && isTrackingColumnError(updateError.message)) {
        const fallbackPayload = {
          status: gasData?.status || nextStatus,
          raw_payload: {
            ...(order.raw_payload || {}),
            sheet_order_id: orderId,
            orderId,
            lastStatusMailType: type,
            lastStatusMailSentAt: new Date().toISOString(),
            trackingNumber,
          },
        };

        const { error: fallbackUpdateError } = await supabase
          .from("orders")
          .update(fallbackPayload)
          .eq("id", id);

        if (fallbackUpdateError) {
          return NextResponse.json(
            {
              ok: false,
              message:
                "メール送信は完了しましたが、Supabase側のステータス更新に失敗しました。",
              detail: fallbackUpdateError.message,
              gas: gasData,
            },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          {
            ok: false,
            message:
              "メール送信は完了しましたが、Supabase側のステータス更新に失敗しました。",
            detail: updateError.message,
            gas: gasData,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      message:
        type === "paid"
          ? "入金確認メールを送信しました。"
          : "発送完了メールを送信しました。",
      status: gasData?.status || nextStatus,
      orderId,
      trackingNumber,
      gas: gasData,
    });
  } catch (error) {
    console.error("send-mail route error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "メール送信処理でエラーが発生しました。",
      },
      { status: 500 }
    );
  }
}