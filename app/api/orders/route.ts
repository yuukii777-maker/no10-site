import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

const GAS_ORDER_URL =
  process.env.GAS_ORDER_URL ||
  "https://script.google.com/macros/s/AKfycbxUcnlYNwPZZTOD6O2kNSluEIX1ZbIWEyhkrXgDI8speIPSohRpTuKmyfLJ9b2jbdcq/exec";

/* =========================================================
   共通
========================================================= */

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function text(value: unknown) {
  return String(value ?? "").trim();
}

function numberValue(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function createFallbackClientOrderId() {
  return `SERVER-${crypto.randomUUID()}`;
}

/* =========================================================
   スプレッドシートへ注文作成
========================================================= */

async function createSpreadsheetOrder(
  payload: any,
  supabaseId: string,
  clientOrderId: string
) {
  try {
    /*
      client_order_id と supabase_id もGASへ渡す。

      将来的にGAS側でも client_order_id を使って
      重複チェックできるようにしておく。
    */
    const spreadsheetPayload = {
      ...payload,

      client_order_id: clientOrderId,
      supabase_id: supabaseId,
    };

    const params = new URLSearchParams();

    params.set("action", "order");
    params.set("payload", JSON.stringify(spreadsheetPayload));
    params.set("client_order_id", clientOrderId);
    params.set("supabase_id", supabaseId);

    let res = await fetch(GAS_ORDER_URL, {
      method: "POST",

      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded;charset=UTF-8",
      },

      body: params.toString(),

      cache: "no-store",

      /*
        Google Apps Script の ContentService は、
        script.googleusercontent.com 側へリダイレクトして
        JSON本文を返すことがある。

        Vercel / Node.js の fetch が自動追従すると、
        Google側の権限ページHTMLを拾うケースがあるため、
        リダイレクトは手動で受けてGETで取得する。
      */
      redirect: "manual",
    });

    if (
      res.status >= 300 &&
      res.status < 400
    ) {
      const location =
        res.headers.get("location");

      if (!location) {
        console.error(
          "SPREADSHEET_REDIRECT_LOCATION_MISSING",
          {
            status: res.status,
          }
        );

        return {
          ok: false,
          orderId: "",
          message:
            "スプレッドシート側からの応答先を取得できませんでした。",
        };
      }

      const redirectUrl =
        new URL(
          location,
          GAS_ORDER_URL
        ).toString();

      res = await fetch(
        redirectUrl,
        {
          method: "GET",
          cache: "no-store",
          redirect: "follow",
        }
      );
    }

    const responseText =
      await res.text().catch(() => "");

    let data: any = null;

    try {
      data = responseText
        ? JSON.parse(responseText)
        : null;
    } catch {
      data = null;
    }

    if (!res.ok) {
      console.error(
        "SPREADSHEET_HTTP_ERROR",
        res.status,
        responseText
      );

      return {
        ok: false,
        orderId: "",
        message:
          responseText ||
          "スプレッドシート側の注文作成に失敗しました。",
      };
    }

    if (!data || data.ok !== true) {
      console.error(
        "SPREADSHEET_RESPONSE_ERROR",
        responseText
      );

      return {
        ok: false,
        orderId: "",
        message:
          responseText ||
          "スプレッドシート側の注文作成に失敗しました。",
      };
    }

    const orderId = text(
      data.orderId ||
        data.order_id ||
        data.baseOrderId
    );

    if (!orderId) {
      console.error(
        "SPREADSHEET_ORDER_ID_MISSING",
        data
      );

      return {
        ok: false,
        orderId: "",
        message:
          "スプレッドシート側からYMK注文IDが返ってきませんでした。",
      };
    }

    return {
      ok: true,
      orderId,
      message: responseText,
    };
  } catch (error) {
    console.error(
      "SPREADSHEET_CREATE_ERROR",
      error
    );

    return {
      ok: false,
      orderId: "",
      message:
        "スプレッドシート側への注文作成通信に失敗しました。",
    };
  }
}

/* =========================================================
   client_order_id で既存注文を検索

   → ブラウザ再送時の二重登録防止
========================================================= */

async function findExistingOrder(
  clientOrderId: string
) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("client_order_id", clientOrderId)
    .maybeSingle();

  if (error) {
    console.error(
      "SUPABASE_EXISTING_ORDER_CHECK_ERROR",
      error
    );

    return {
      order: null,
      error,
    };
  }

  return {
    order: data,
    error: null,
  };
}

/* =========================================================
   Supabaseへ注文作成
   一時的通信障害を考慮して最大3回

   UNIQUE client_order_id があるので、
   再試行しても二重注文にならない
========================================================= */

async function createSupabaseOrder(
  insertData: any,
  clientOrderId: string
) {
  let lastError: any = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    const { data, error } = await supabase
      .from("orders")
      .insert(insertData)
      .select("*")
      .single();

    if (!error && data) {
      return {
        ok: true,
        order: data,
      };
    }

    lastError = error;

    console.error(
      `SUPABASE_INSERT_ERROR_ATTEMPT_${attempt}`,
      error
    );

    /*
      UNIQUE違反の場合は、
      同じ注文が既に作成済みの可能性が高い。
    */
    if (error?.code === "23505") {
      const existing =
        await findExistingOrder(
          clientOrderId
        );

      if (existing.order) {
        return {
          ok: true,
          order: existing.order,
        };
      }
    }

    if (attempt < 3) {
      await sleep(attempt * 500);
    }
  }

  return {
    ok: false,
    order: null,
    error: lastError,
  };
}

/* =========================================================
   sheet_order_id 更新
========================================================= */

async function updateSheetOrderId(
  supabaseId: string,
  sheetOrderId: string,
  rawPayload: any
) {
  let lastError: any = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    const { data, error } = await supabase
      .from("orders")
      .update({
        sheet_order_id: sheetOrderId,

        raw_payload: {
          ...rawPayload,

          orderId: sheetOrderId,
          sheet_order_id: sheetOrderId,
        },
      })
      .eq("id", supabaseId)
      .select("*")
      .single();

    if (!error && data) {
      return {
        ok: true,
        order: data,
      };
    }

    lastError = error;

    console.error(
      `SUPABASE_SHEET_ID_UPDATE_ERROR_ATTEMPT_${attempt}`,
      error
    );

    if (attempt < 3) {
      await sleep(attempt * 500);
    }
  }

  return {
    ok: false,
    order: null,
    error: lastError,
  };
}

/* =========================================================
   POST
========================================================= */

export async function POST(
  request: Request
) {
  try {
    const payload = await request.json();

    const isCart =
      payload.mode === "cart";

    const buyer = isCart
      ? payload.buyer
      : payload;

    /* -----------------------------------------
       入力チェック
    ----------------------------------------- */

    if (!buyer) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "注文者情報がありません。",
        },
        {
          status: 400,
        }
      );
    }

    const customerName =
      text(buyer.name);

    const postalCode =
      text(buyer.postal);

    const prefecture =
      text(buyer.prefecture);

    const address =
      text(buyer.address);

    const phone =
      text(buyer.phone);

    const email =
      text(buyer.email);

    if (
      !customerName ||
      !postalCode ||
      !prefecture ||
      !address ||
      !email
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "必須項目が不足しています。",
        },
        {
          status: 400,
        }
      );
    }

    if (
      isCart &&
      (!Array.isArray(payload.items) ||
        payload.items.length === 0)
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "カートに商品がありません。",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------
       注文固有ID

       OrderClientから来るIDを優先。
       古い画面から注文された場合のみ
       サーバー側で生成。
    ----------------------------------------- */

    const clientOrderId =
      text(payload.client_order_id) ||
      createFallbackClientOrderId();

    /* -----------------------------------------
       既存注文確認

       同じ注文が再送された場合、
       Supabaseを二重登録しない。
    ----------------------------------------- */

    const existingResult =
      await findExistingOrder(
        clientOrderId
      );

    if (existingResult.error) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "注文情報の確認に失敗しました。時間をおいて再度お試しください。",
        },
        {
          status: 503,
        }
      );
    }

    let order =
      existingResult.order;

    /*
      Supabase・スプレッドシートとも
      既に完成している注文ならそのまま成功。
    */
    if (
      order &&
      order.sheet_order_id
    ) {
      return NextResponse.json({
        ok: true,

        duplicated: true,

        orderId:
          order.sheet_order_id,

        sheet_order_id:
          order.sheet_order_id,

        supabase_id:
          order.id,

        supabase_sync: true,

        spreadsheet_sync: true,
      });
    }

    /* -----------------------------------------
       商品情報生成
    ----------------------------------------- */

    const productName = isCart
      ? payload.items
          .map(
            (item: any) =>
              `${text(item.name)} ${text(
                item.variant
              )} ×${numberValue(
                item.qty
              )}`
          )
          .join(" / ")
      : text(payload.product);

    const subtotal = isCart
      ? numberValue(payload.subtotal)
      : numberValue(payload.price);

    const codFee =
      numberValue(payload.cod_fee);

    const totalPrice =
      subtotal + codFee;

    /* -----------------------------------------
       ① Supabaseを先に保存

       スプレッドシートが落ちても、
       管理画面から注文が消えない。
    ----------------------------------------- */

    if (!order) {
      const rawPayload = {
        ...payload,

        client_order_id:
          clientOrderId,
      };

      const insertData = {
        client_order_id:
          clientOrderId,

        sheet_order_id: null,

        mode: isCart
          ? "cart"
          : "single",

        customer_name:
          customerName,

        postal_code:
          postalCode,

        prefecture,

        address,

        phone: phone || null,

        email,

        product_name:
          productName,

        size: isCart
          ? null
          : text(payload.size),

        price: isCart
          ? null
          : numberValue(
              payload.price
            ),

        quantity: 1,

        subtotal,

        cod_fee: codFee,

        total_price:
          totalPrice,

        payment_method:
          text(
            payload.payment_method
          ) || "bank",

        request_time:
          text(
            payload.request_time
          ) || null,

        items: isCart
          ? payload.items
          : null,

        raw_payload:
          rawPayload,

        status: "ordered",
      };

      const supabaseResult =
        await createSupabaseOrder(
          insertData,
          clientOrderId
        );

      if (
        !supabaseResult.ok ||
        !supabaseResult.order
      ) {
        console.error(
          "ORDER_SUPABASE_SAVE_FAILED",
          {
            clientOrderId,
            error:
              supabaseResult.error,
          }
        );

        return NextResponse.json(
          {
            ok: false,

            supabase_sync: false,

            spreadsheet_sync: false,

            message:
              "注文情報の保存に失敗しました。時間をおいて再度お試しください。",
          },
          {
            status: 503,
          }
        );
      }

      order =
        supabaseResult.order;
    }

    /* -----------------------------------------
       ② スプレッドシート作成
    ----------------------------------------- */

    const sheetResult =
      await createSpreadsheetOrder(
        payload,
        order.id,
        clientOrderId
      );

    if (!sheetResult.ok) {
      console.error(
        "ORDER_SPREADSHEET_SAVE_FAILED",
        {
          supabaseId:
            order.id,

          clientOrderId,

          message:
            sheetResult.message,
        }
      );

      return NextResponse.json(
        {
          ok: false,

          accepted: true,

          supabase_sync: true,

          spreadsheet_sync: false,

          supabase_id:
            order.id,

          message:
            "注文情報は保存されましたが、スプレッドシートへの反映に失敗しました。もう一度送信してください。",
        },
        {
          status: 503,
        }
      );
    }

    /* -----------------------------------------
       ③ SupabaseにYMK注文IDを保存
    ----------------------------------------- */

    const rawPayload = {
      ...(order.raw_payload ||
        {}),

      ...payload,

      client_order_id:
        clientOrderId,

      orderId:
        sheetResult.orderId,

      sheet_order_id:
        sheetResult.orderId,
    };

    const updateResult =
      await updateSheetOrderId(
        order.id,
        sheetResult.orderId,
        rawPayload
      );

    if (!updateResult.ok) {
      console.error(
        "ORDER_LINK_UPDATE_FAILED",
        {
          supabaseId:
            order.id,

          sheetOrderId:
            sheetResult.orderId,

          clientOrderId,

          error:
            updateResult.error,
        }
      );

      /*
        Supabaseとスプレッドシートには
        既に注文が保存されているため、
        注文自体は成功として返す。
      */
      return NextResponse.json({
        ok: true,

        orderId:
          sheetResult.orderId,

        sheet_order_id:
          sheetResult.orderId,

        supabase_id:
          order.id,

        supabase_sync: true,

        spreadsheet_sync: true,

        link_sync: false,

        message:
          "注文は正常に受け付けました。",
      });
    }

    /* -----------------------------------------
       完全成功
    ----------------------------------------- */

    return NextResponse.json({
      ok: true,

      orderId:
        sheetResult.orderId,

      sheet_order_id:
        sheetResult.orderId,

      supabase_id:
        order.id,

      client_order_id:
        clientOrderId,

      supabase_sync: true,

      spreadsheet_sync: true,

      link_sync: true,
    });
  } catch (error) {
    console.error(
      "ORDER_API_FATAL_ERROR",
      error
    );

    return NextResponse.json(
      {
        ok: false,

        message:
          "注文保存中に予期しないエラーが発生しました。",
      },
      {
        status: 500,
      }
    );
  }
}