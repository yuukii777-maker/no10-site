import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const GAS_ORDER_URL =
  process.env.GAS_ORDER_URL ||
  "https://script.google.com/macros/s/AKfycbw9FiKbkzno4gqGK4jkZKaBB-Cxw8gOYtSCmMBOM8RNX95ZLp_uqxGiHvv0Wzm2eH1s/exec";

async function createSpreadsheetOrder(payload: any) {
  try {
    const params = new URLSearchParams({
      payload: JSON.stringify(payload),
    });

    params.set("action", "order");

    const res = await fetch(GAS_ORDER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: params.toString(),
      cache: "no-store",
    });

    const text = await res.text().catch(() => "");

    let data: any = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!res.ok) {
      return {
        ok: false,
        orderId: "",
        message: text || "スプレッドシート側の注文作成に失敗しました。",
      };
    }

    if (!data || data.ok !== true) {
      return {
        ok: false,
        orderId: "",
        message: text || "スプレッドシート側の注文作成に失敗しました。",
      };
    }

    const orderId = String(
      data.orderId || data.order_id || data.baseOrderId || ""
    ).trim();

    if (!orderId) {
      return {
        ok: false,
        orderId: "",
        message: "スプレッドシート側からYMK注文IDが返ってきませんでした。",
      };
    }

    return {
      ok: true,
      orderId,
      message: text,
    };
  } catch (error) {
    console.error("Spreadsheet order create error:", error);

    return {
      ok: false,
      orderId: "",
      message: "スプレッドシート側への注文作成通信に失敗しました。",
    };
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const sheetResult = await createSpreadsheetOrder(payload);

    if (!sheetResult.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: sheetResult.message,
        },
        { status: 500 }
      );
    }

    const isCart = payload.mode === "cart";
    const buyer = isCart ? payload.buyer : payload;

    const productName = isCart
      ? payload.items
          ?.map((item: any) => `${item.name} ${item.variant} ×${item.qty}`)
          .join(" / ")
      : payload.product;

    const totalPrice = isCart
      ? Number(payload.subtotal || 0) + Number(payload.cod_fee || 0)
      : Number(payload.price || 0) + Number(payload.cod_fee || 0);

    const { error } = await supabase.from("orders").insert({
      sheet_order_id: sheetResult.orderId,

      mode: isCart ? "cart" : "single",

      customer_name: buyer.name,
      postal_code: buyer.postal,
      prefecture: buyer.prefecture,
      address: buyer.address,
      phone: buyer.phone || null,
      email: buyer.email,

      product_name: productName,
      size: isCart ? null : payload.size,
      price: isCart ? null : Number(payload.price || 0),
      quantity: 1,

      subtotal: isCart ? Number(payload.subtotal || 0) : Number(payload.price || 0),
      cod_fee: Number(payload.cod_fee || 0),
      total_price: totalPrice,

      payment_method: payload.payment_method,
      request_time: payload.request_time || null,

      items: isCart ? payload.items : null,
      raw_payload: {
        ...payload,
        orderId: sheetResult.orderId,
        sheet_order_id: sheetResult.orderId,
      },

      status: "ordered",
    });

    if (error) {
      console.error("Supabase insert error:", error);

      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      orderId: sheetResult.orderId,
      sheet_order_id: sheetResult.orderId,
    });
  } catch (error) {
    console.error("Order API error:", error);

    return NextResponse.json(
      { ok: false, message: "注文保存に失敗しました" },
      { status: 500 }
    );
  }
}