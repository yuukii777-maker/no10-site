"use client";

import { useEffect, useMemo, useState } from "react";

type OrderItem = {
  id?: string;
  name?: string;
  variant?: string;
  unitPrice?: number;
  qty?: number;
  extra?: Record<string, any>;
};

type Order = {
  id: string;
  created_at: string;
  updated_at?: string | null;

  mode?: string | null;
  customer_name?: string | null;
  postal_code?: string | null;
  prefecture?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;

  product_name?: string | null;
  size?: string | null;
  price?: number | null;
  quantity?: number | null;

  subtotal?: number | null;
  cod_fee?: number | null;
  total_price?: number | null;

  payment_method?: string | null;
  request_time?: string | null;

  items?: OrderItem[] | null;
  raw_payload?: any;

  status?: string | null;
  tracking_number?: string | null;
};

const STATUS_OPTIONS = [
  "ordered",
  "PAID（要確認）",
  "PAID",
  "SHIPPED（要確認）",
  "SHIPPED",
  "CANCELED",
];

function yen(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";
  return `${Number(value).toLocaleString()}円`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function paymentLabel(value: string | null | undefined) {
  if (value === "cod") return "代金引換";
  if (value === "bank") return "銀行振込 / PayPay";
  return value || "-";
}

function statusLabel(value: string | null | undefined) {
  if (value === "ordered") return "ordered：注文受付";
  if (value === "PAID（要確認）") return "PAID（要確認）：入金確認待ち";
  if (value === "PAID") return "PAID：入金済み";
  if (value === "SHIPPED（要確認）") return "SHIPPED（要確認）：発送確認待ち";
  if (value === "SHIPPED") return "SHIPPED：発送済み";
  if (value === "CANCELED") return "CANCELED：キャンセル";
  if (value === "未確認") return "ordered：注文受付";
  if (value === "確認中") return "PAID（要確認）：入金確認待ち";
  if (value === "発送準備中") return "SHIPPED（要確認）：発送確認待ち";
  if (value === "発送済み") return "SHIPPED：発送済み";
  if (value === "キャンセル") return "CANCELED：キャンセル";
  return value || "ordered：注文受付";
}

function normalizeStatus(value: string | null | undefined) {
  if (value === "未確認") return "ordered";
  if (value === "確認中") return "PAID（要確認）";
  if (value === "発送準備中") return "SHIPPED（要確認）";
  if (value === "発送済み") return "SHIPPED";
  if (value === "キャンセル") return "CANCELED";
  return value || "ordered";
}

function statusBadgeClass(value: string | null | undefined) {
  const status = normalizeStatus(value);

  if (status === "ordered") {
    return "border-sky-300/30 bg-sky-400/10 text-sky-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_18px_rgba(56,189,248,0.12)]";
  }

  if (status === "PAID（要確認）") {
    return "border-blue-300/30 bg-blue-400/10 text-blue-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_18px_rgba(96,165,250,0.12)]";
  }

  if (status === "PAID") {
    return "border-blue-300/35 bg-blue-500/20 text-blue-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_22px_rgba(59,130,246,0.16)]";
  }

  if (status === "SHIPPED（要確認）") {
    return "border-orange-300/30 bg-orange-400/10 text-orange-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_18px_rgba(251,146,60,0.12)]";
  }

  if (status === "SHIPPED") {
    return "border-green-300/30 bg-green-400/10 text-green-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_18px_rgba(74,222,128,0.12)]";
  }

  if (status === "CANCELED") {
    return "border-red-300/30 bg-red-500/15 text-red-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_18px_rgba(248,113,113,0.12)]";
  }

  return "border-white/10 bg-white/5 text-white/70";
}

function compactProductName(order: Order) {
  if (Array.isArray(order.items) && order.items.length > 0) {
    if (order.items.length === 1) {
      const item = order.items[0];
      return `${item.name || "商品名未設定"} ${item.variant || ""} ×${
        item.qty || 1
      }`;
    }

    return `${order.items[0]?.name || "商品名未設定"} ほか${
      order.items.length - 1
    }件`;
  }

  return `${order.product_name || "商品名未設定"} ${order.size || ""}`;
}

// [ADDED] 一覧で注文IDを見やすく表示するための補助
function orderDisplayId(order: Order) {
  return (
    order.raw_payload?.orderId ||
    order.raw_payload?.order_id ||
    order.raw_payload?.orderid ||
    order.id ||
    "-"
  );
}

// [ADDED] 一覧で住所を短く表示するための補助
function compactAddress(order: Order) {
  const postal = order.postal_code ? `〒${order.postal_code}` : "";
  const address = `${order.prefecture || ""}${order.address || ""}`.trim();

  if (!postal && !address) return "-";
  return `${postal} ${address}`.trim();
}

function OrderItemsView({ order }: { order: Order }) {
  if (Array.isArray(order.items) && order.items.length > 0) {
    return (
      <div className="mt-3 space-y-2">
        {order.items.map((item, index) => (
          <div
            key={`${item.id || index}-${index}`}
            className="rounded-xl border border-white/10 bg-black/35 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_24px_rgba(0,0,0,0.18)]"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="font-black text-white">
                  {item.name || "商品名未設定"}
                </p>
                <p className="mt-1 text-xs text-white/45">
                  {item.variant || "-"} / 数量：{item.qty || 1}
                </p>
              </div>

              <div className="text-sm font-bold text-yellow-100">
                {yen((item.unitPrice || 0) * (item.qty || 1))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-black/35 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_24px_rgba(0,0,0,0.18)]">
      <p className="font-black text-white">
        {order.product_name || "商品名未設定"}
      </p>
      <p className="mt-1 text-xs text-white/45">
        {order.size || "-"} / 数量：{order.quantity || 1}
      </p>
    </div>
  );
}

function OrderRuleBox({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "rounded-xl border border-yellow-300/15 bg-black/35 p-4 text-xs leading-6 text-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_28px_rgba(0,0,0,0.22)]"
          : "text-xs text-white/45 leading-6"
      }
    >
      <p className="font-black tracking-[0.18em] text-yellow-200/80">
        注文対応ルール
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <p className="font-bold text-white/70">基本の流れ</p>
          <p className="mt-1 text-yellow-100/80">
            ordered → PAID → SHIPPED
          </p>
        </div>

        <div>
          <p className="font-bold text-white/70">やること</p>
          <ol className="mt-1 list-decimal space-y-1 pl-4">
            <li>ordered の注文を確認</li>
            <li>入金後「入金確認メールを送信」</li>
            <li>発送後、追跡番号を入れて「発送完了メールを送信」</li>
          </ol>
        </div>

        <div>
          <p className="font-bold text-white/70">ステータス</p>
          <div className="mt-1 space-y-1">
            <p>ordered：注文受付</p>
            <p>PAID：入金確認済み</p>
            <p>SHIPPED：発送完了</p>
            <p>CANCELED：キャンセル</p>
          </div>
        </div>

        <div className="rounded-lg border border-yellow-300/15 bg-yellow-300/[0.06] px-3 py-2 text-yellow-50/80">
          ステータスだけを手動で変えない。<br />
          基本はメール送信ボタンで進める。<br />
          間違えた時だけ手動で戻す。
        </div>
      </div>
    </div>
  );
}

function OrderCard({
  order,
  savingId,
  mailSavingId,
  trackingNumber,
  onTrackingNumberChange,
  onUpdateStatus,
  onSendStatusMail,
  compact = false,
}: {
  order: Order;
  savingId: string | null;
  mailSavingId: string | null;
  trackingNumber: string;
  onTrackingNumberChange: (orderId: string, value: string) => void;
  onUpdateStatus: (order: Order, status: string) => void;
  onSendStatusMail: (
    order: Order,
    mailType: "paid" | "shipped"
  ) => Promise<void>;
  compact?: boolean;
}) {
  const status = normalizeStatus(order.status);
  const paidMailSavingKey = `${order.id}:paid`;
  const shippedMailSavingKey = `${order.id}:shipped`;

  const isPaidMailSaving = mailSavingId === paidMailSavingKey;
  const isShippedMailSaving = mailSavingId === shippedMailSavingKey;
  const isSaving =
    savingId === order.id || isPaidMailSaving || isShippedMailSaving;

  if (compact) {
    return (
      <article className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0b1114]/90 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.65),0_18px_42px_rgba(0,0,0,0.34)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/20">
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-yellow-300/70 via-green-300/35 to-transparent" />

        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 pl-1">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-md border px-2.5 py-1 text-[11px] font-black ${statusBadgeClass(
                  status
                )}`}
              >
                {status}
              </span>
              <span className="text-[11px] text-white/35">
                {formatDate(order.created_at)}
              </span>
            </div>

            <h3 className="mt-2 text-lg font-black text-white">
              {order.customer_name || "名前未設定"}
            </h3>

            <p className="mt-1 text-sm text-white/50 truncate">
              {compactProductName(order)}
            </p>

            {/* [ADDED] 一覧でも誰の注文か分かるように最低限の注文者情報を表示 */}
            <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-white/55 md:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <span className="text-white/35">注文ID：</span>
                <span className="font-bold text-white/75 break-all">
                  {orderDisplayId(order)}
                </span>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <span className="text-white/35">メール：</span>
                <span className="font-bold text-white/75 break-all">
                  {order.email || "-"}
                </span>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <span className="text-white/35">電話：</span>
                <span className="font-bold text-white/75">
                  {order.phone || "-"}
                </span>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <span className="text-white/35">住所：</span>
                <span className="font-bold text-white/75">
                  {compactAddress(order)}
                </span>
              </div>
            </div>

            {/* [ADDED] メール送信操作 */}
            <div className="mt-4 rounded-xl border border-yellow-300/15 bg-yellow-300/[0.05] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_24px_rgba(0,0,0,0.18)]">
              <p className="text-[11px] font-black tracking-[0.18em] text-yellow-100/75">
                MAIL ACTION
              </p>

              <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                <button
                  type="button"
                  onClick={() => onSendStatusMail(order, "paid")}
                  disabled={isSaving || !order.email}
                  className="rounded-lg border border-blue-300/25 bg-blue-500/15 px-4 py-3 text-sm font-black text-blue-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_10px_20px_rgba(0,0,0,0.22)] transition active:translate-y-[2px] active:scale-[0.99] hover:bg-blue-500/25 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isPaidMailSaving ? "送信中..." : "入金確認メールを送信"}
                </button>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) =>
                      onTrackingNumberChange(order.id, e.target.value)
                    }
                    placeholder="追跡番号を入力"
                    disabled={isSaving}
                    className="min-w-0 rounded-lg border border-white/10 bg-black/45 px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-white/30 shadow-[inset_0_1px_4px_rgba(0,0,0,0.55)]"
                  />

                  <button
                    type="button"
                    onClick={() => onSendStatusMail(order, "shipped")}
                    disabled={isSaving || !order.email}
                    className="rounded-lg border border-green-300/25 bg-green-500/15 px-4 py-3 text-sm font-black text-green-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_10px_20px_rgba(0,0,0,0.22)] transition active:translate-y-[2px] active:scale-[0.99] hover:bg-green-500/25 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {isShippedMailSaving ? "送信中..." : "発送完了メールを送信"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row xl:flex-col gap-3 sm:items-center xl:items-stretch">
            <select
              value={status}
              onChange={(e) => onUpdateStatus(order, e.target.value)}
              disabled={savingId === order.id}
              className="rounded-lg border border-white/10 bg-black/45 px-4 py-3 text-sm font-bold text-white outline-none shadow-[inset_0_1px_4px_rgba(0,0,0,0.55)]"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-[#111]">
                  {statusLabel(option)}
                </option>
              ))}
            </select>

            <div className="rounded-lg border border-yellow-300/20 bg-yellow-300/10 px-5 py-3 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_24px_rgba(0,0,0,0.2)]">
              <p className="text-xs text-white/45">合計</p>
              <p className="text-xl font-black text-yellow-100">
                {yen(order.total_price)}
              </p>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="overflow-hidden rounded-xl border border-white/10 bg-[#0b1114]/90 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.65),0_22px_50px_rgba(0,0,0,0.36)]">
      <div className="border-b border-white/10 bg-gradient-to-r from-yellow-400/12 to-transparent px-5 sm:px-6 py-5">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-md border px-3 py-1 text-[11px] font-black ${statusBadgeClass(
                  status
                )}`}
              >
                {statusLabel(status)}
              </span>

              <span className="text-xs tracking-[0.2em] text-yellow-200/75">
                {formatDate(order.created_at)}
              </span>
            </div>

            <h3 className="mt-2 text-xl sm:text-2xl font-black">
              {order.customer_name || "名前未設定"}
            </h3>
            <p className="mt-1 text-sm text-white/45">{order.email || "-"}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <select
              value={status}
              onChange={(e) => onUpdateStatus(order, e.target.value)}
              disabled={savingId === order.id}
              className="rounded-lg border border-white/10 bg-black/45 px-4 py-3 text-sm font-bold text-white outline-none shadow-[inset_0_1px_4px_rgba(0,0,0,0.55)]"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-[#111]">
                  {statusLabel(option)}
                </option>
              ))}
            </select>

            <div className="rounded-lg border border-yellow-300/20 bg-yellow-300/10 px-5 py-3 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_24px_rgba(0,0,0,0.2)]">
              <p className="text-xs text-white/45">合計</p>
              <p className="text-xl font-black text-yellow-100">
                {yen(order.total_price)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5 p-5 sm:p-6">
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-black/35 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_24px_rgba(0,0,0,0.18)]">
              <p className="text-xs text-white/40">住所</p>
              <p className="mt-2 text-sm leading-6 text-white/80">
                〒{order.postal_code || "-"}
                <br />
                {order.prefecture || ""}
                {order.address || ""}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/35 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_24px_rgba(0,0,0,0.18)]">
              <p className="text-xs text-white/40">連絡先</p>
              <p className="mt-2 text-sm leading-6 text-white/80">
                電話：{order.phone || "-"}
                <br />
                メール：{order.email || "-"}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/35 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_24px_rgba(0,0,0,0.18)]">
              <p className="text-xs text-white/40">支払い</p>
              <p className="mt-2 text-sm leading-6 text-white/80">
                {paymentLabel(order.payment_method)}
                <br />
                代引き手数料：{yen(order.cod_fee)}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/35 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_24px_rgba(0,0,0,0.18)]">
              <p className="text-xs text-white/40">到着希望</p>
              <p className="mt-2 text-sm leading-6 text-white/80">
                {order.request_time || "指定なし"}
              </p>
            </div>
          </div>

          <OrderItemsView order={order} />

          {/* [ADDED] メール送信操作 */}
          <div className="mt-4 rounded-xl border border-yellow-300/15 bg-yellow-300/[0.05] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_24px_rgba(0,0,0,0.18)]">
            <p className="text-xs font-black tracking-[0.18em] text-yellow-100/75">
              MAIL ACTION
            </p>

            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
              <button
                type="button"
                onClick={() => onSendStatusMail(order, "paid")}
                disabled={isSaving || !order.email}
                className="rounded-lg border border-blue-300/25 bg-blue-500/15 px-4 py-3 text-sm font-black text-blue-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_10px_20px_rgba(0,0,0,0.22)] transition active:translate-y-[2px] active:scale-[0.99] hover:bg-blue-500/25 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {isPaidMailSaving ? "送信中..." : "入金確認メールを送信"}
              </button>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) =>
                    onTrackingNumberChange(order.id, e.target.value)
                  }
                  placeholder="追跡番号を入力"
                  disabled={isSaving}
                  className="min-w-0 rounded-lg border border-white/10 bg-black/45 px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-white/30 shadow-[inset_0_1px_4px_rgba(0,0,0,0.55)]"
                />

                <button
                  type="button"
                  onClick={() => onSendStatusMail(order, "shipped")}
                  disabled={isSaving || !order.email}
                  className="rounded-lg border border-green-300/25 bg-green-500/15 px-4 py-3 text-sm font-black text-green-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_10px_20px_rgba(0,0,0,0.22)] transition active:translate-y-[2px] active:scale-[0.99] hover:bg-green-500/25 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isShippedMailSaving ? "送信中..." : "発送完了メールを送信"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/35 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_28px_rgba(0,0,0,0.22)]">
          <p className="text-sm font-black text-white/70">金額内訳</p>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
              <span className="text-white/45">商品小計</span>
              <span className="font-bold text-white">{yen(order.subtotal)}</span>
            </div>

            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
              <span className="text-white/45">代引き手数料</span>
              <span className="font-bold text-white">{yen(order.cod_fee)}</span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <span className="text-yellow-100 font-black">合計</span>
              <span className="text-xl font-black text-yellow-100">
                {yen(order.total_price)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [mailSavingId, setMailSavingId] = useState<string | null>(null);
  const [trackingNumbers, setTrackingNumbers] = useState<Record<string, string>>(
    {}
  );
  const [message, setMessage] = useState("");
  const [showCanceled, setShowCanceled] = useState(false);
  const [showShipped, setShowShipped] = useState(false);
  const [showMobileRules, setShowMobileRules] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/orders", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.message || "注文情報の取得に失敗しました。");
        return;
      }

      setOrders(data.orders || []);

      const initialTrackingNumbers: Record<string, string> = {};

      (data.orders || []).forEach((order: Order) => {
        initialTrackingNumbers[order.id] =
          order.tracking_number ||
          order.raw_payload?.trackingNumber ||
          order.raw_payload?.tracking_number ||
          "";
      });

      setTrackingNumbers(initialTrackingNumbers);
    } catch (error) {
      setMessage("通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const activeOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = normalizeStatus(order.status);
      return status !== "CANCELED" && status !== "SHIPPED";
    });
  }, [orders]);

  const shippedOrders = useMemo(() => {
    return orders.filter((order) => normalizeStatus(order.status) === "SHIPPED");
  }, [orders]);

  const canceledOrders = useMemo(() => {
    return orders.filter((order) => normalizeStatus(order.status) === "CANCELED");
  }, [orders]);

  const counts = useMemo(() => {
    return {
      total: orders.length,
      active: activeOrders.length,
      ordered: orders.filter((order) => normalizeStatus(order.status) === "ordered")
        .length,
      paidNeedCheck: orders.filter(
        (order) => normalizeStatus(order.status) === "PAID（要確認）"
      ).length,
      shipped: shippedOrders.length,
      canceled: canceledOrders.length,
    };
  }, [orders, activeOrders.length, shippedOrders.length, canceledOrders.length]);

  const updateStatus = async (order: Order, status: string) => {
    setSavingId(order.id);
    setMessage("");

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: order.id,
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.message || "ステータス更新に失敗しました。");
        return;
      }

      setOrders((current) =>
        current.map((item) =>
          item.id === order.id
            ? {
                ...item,
                status,
              }
            : item
        )
      );

      setMessage("対応状況を更新しました。");
    } catch (error) {
      setMessage("通信エラーが発生しました。");
    } finally {
      setSavingId(null);
    }
  };

  const updateTrackingNumber = (orderId: string, value: string) => {
    setTrackingNumbers((current) => ({
      ...current,
      [orderId]: value,
    }));
  };

  const sendStatusMail = async (
    order: Order,
    mailType: "paid" | "shipped"
  ) => {
    const trackingNumber = (trackingNumbers[order.id] || "").trim();
    const nextStatus = mailType === "paid" ? "PAID" : "SHIPPED";
    const mailSavingKey = `${order.id}:${mailType}`;

    if (!order.email) {
      setMessage("メールアドレスがないため送信できません。");
      return;
    }

    if (mailType === "shipped" && !trackingNumber) {
      setMessage("発送完了メールを送る前に追跡番号を入力してください。");
      return;
    }

    const ok = window.confirm(
      mailType === "paid"
        ? `「${order.customer_name || "名前未設定"}」様へ入金確認メールを送信します。\nステータスはPAIDになります。\n\n間違いありませんか？`
        : `「${order.customer_name || "名前未設定"}」様へ発送完了メールを送信します。\n追跡番号：${trackingNumber}\nステータスはSHIPPEDになります。\n\n間違いありませんか？`
    );

    if (!ok) return;

    setMailSavingId(mailSavingKey);
    setMessage("");

    try {
      const res = await fetch("/api/admin/orders/send-mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: order.id,
          orderId: orderDisplayId(order),
          type: mailType,
          status: nextStatus,
          trackingNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.message || "メール送信に失敗しました。");
        return;
      }

      setOrders((current) =>
        current.map((item) =>
          item.id === order.id
            ? {
                ...item,
                status: data?.status || nextStatus,
                tracking_number:
                  mailType === "shipped"
                    ? trackingNumber
                    : item.tracking_number || null,
              }
            : item
        )
      );

      setMessage(
        mailType === "paid"
          ? "入金確認メールを送信し、ステータスをPAIDに更新しました。"
          : "発送完了メールを送信し、ステータスをSHIPPEDに更新しました。"
      );
    } catch (error) {
      setMessage("通信エラーが発生しました。");
    } finally {
      setMailSavingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#06090d] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_8%,rgba(250,204,21,0.20),transparent_32%),radial-gradient(circle_at_84%_18%,rgba(34,197,94,0.13),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(59,130,246,0.10),transparent_32%),linear-gradient(135deg,#05070a_0%,#111827_48%,#030405_100%)]" />
        <div className="absolute inset-0 opacity-[0.10] bg-[linear-gradient(90deg,white_1px,transparent_1px),linear-gradient(0deg,white_1px,transparent_1px)] bg-[size:38px_38px]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.05)_45%,transparent_48%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-white/10 bg-black/45 backdrop-blur-xl shadow-[8px_0_30px_rgba(0,0,0,0.25)]">
          <div className="px-7 py-7 border-b border-white/10">
            <p className="text-xs tracking-[0.35em] text-yellow-300/80">
              MIKAN AGENT
            </p>
            <h1 className="mt-3 text-2xl font-black">山口みかん農園</h1>
            <p className="mt-2 text-xs text-white/45">
              Order Control Console
            </p>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            <a
              href="/admin/orders"
              className="block rounded-lg px-4 py-3 text-sm font-bold bg-gradient-to-r from-yellow-400/20 to-green-400/10 text-yellow-100 border border-yellow-300/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_10px_22px_rgba(0,0,0,0.22)]"
            >
              注文管理
            </a>
            <a
              href="/admin/products"
              className="block rounded-lg px-4 py-3 text-sm text-white/65 hover:bg-white/10 hover:text-white"
            >
              商品管理
            </a>
            <a
              href="/products"
              className="block rounded-lg px-4 py-3 text-sm text-white/65 hover:bg-white/10 hover:text-white"
            >
              お客様商品ページ
            </a>
          </nav>

          <div className="px-6 py-6 border-t border-white/10">
            <OrderRuleBox />

            <a
              href="/admin/login"
              className="mt-5 block w-full rounded-lg border border-red-300/20 bg-red-500/10 px-4 py-3 text-center text-sm font-black text-red-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_24px_rgba(0,0,0,0.18)] transition hover:bg-red-500/20 active:translate-y-[2px]"
            >
              ログアウト
            </a>
          </div>
        </aside>

        <section className="flex-1 px-3 sm:px-8 lg:px-10 py-4 sm:py-8">
          <div className="lg:hidden mb-3 flex items-center justify-between gap-3">
            <div className="rounded-lg border border-yellow-300/20 bg-black/45 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_22px_rgba(0,0,0,0.22)]">
              <p className="text-[10px] tracking-[0.18em] text-yellow-200/70">
                オーダー状況
              </p>
              <p className="mt-1 text-[11px] text-white/55">
                通常 {counts.active} / ordered {counts.ordered} / PAID{" "}
                {counts.paidNeedCheck} / CXL {counts.canceled}
              </p>
            </div>

            <a
              href="/admin/login"
              className="rounded-lg border border-red-300/20 bg-red-500/10 px-3 py-2 text-[11px] font-black text-red-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_22px_rgba(0,0,0,0.20)] active:translate-y-[2px]"
            >
              ログアウト
            </a>
          </div>

          <header
            className="relative mb-5 sm:mb-8 overflow-hidden rounded-xl border border-yellow-300/25 backdrop-blur-2xl px-4 sm:px-6 py-5 sm:py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),inset_0_-1px_0_rgba(0,0,0,0.65),0_22px_55px_rgba(0,0,0,0.36)]"
            style={{
              background:
                "linear-gradient(135deg, rgba(250,204,21,0.16), rgba(60,48,12,0.30), rgba(5,8,8,0.82))",
            }}
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-yellow-300/80 via-green-300/40 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-px bg-white/20" />

            <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-2 rounded-md border border-yellow-300/20 bg-yellow-400/10 px-3 py-2 text-[11px] sm:text-xs text-yellow-100 mb-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <span className="h-2 w-2 rounded-full bg-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.9)]" />
                  オーダー　システム
                </div>

                <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                  注文管理
                </h2>
                <p className="mt-3 text-white/55 text-xs sm:text-base leading-6">
                  注文内容・住所・支払い方法・メール送信・発送状況をここで管理します。
                </p>
              </div>

              <div className="hidden sm:flex flex-wrap gap-3">
                <div className="rounded-lg border border-white/10 bg-black/30 backdrop-blur-xl px-5 py-4 min-w-[130px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_26px_rgba(0,0,0,0.22)]">
                  <p className="text-xs text-white/45">通常注文</p>
                  <p className="text-2xl font-black text-yellow-200 mt-1">
                    {counts.active}
                  </p>
                </div>

                <div className="rounded-lg border border-sky-300/20 bg-sky-400/[0.08] backdrop-blur-xl px-5 py-4 min-w-[130px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_26px_rgba(0,0,0,0.22)]">
                  <p className="text-xs text-white/45">ordered</p>
                  <p className="text-2xl font-black text-sky-200 mt-1">
                    {counts.ordered}
                  </p>
                </div>

                <div className="rounded-lg border border-blue-300/20 bg-blue-400/[0.08] backdrop-blur-xl px-5 py-4 min-w-[130px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_26px_rgba(0,0,0,0.22)]">
                  <p className="text-xs text-white/45">PAID確認</p>
                  <p className="text-2xl font-black text-blue-200 mt-1">
                    {counts.paidNeedCheck}
                  </p>
                </div>

                <div className="rounded-lg border border-red-300/20 bg-red-400/[0.08] backdrop-blur-xl px-5 py-4 min-w-[130px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_26px_rgba(0,0,0,0.22)]">
                  <p className="text-xs text-white/45">CANCELED</p>
                  <p className="text-2xl font-black text-red-200 mt-1">
                    {counts.canceled}
                  </p>
                </div>
              </div>
            </div>
          </header>

          <div className="lg:hidden mb-5 rounded-xl border border-yellow-300/15 bg-yellow-300/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_30px_rgba(0,0,0,0.24)] overflow-hidden">
            <button
              type="button"
              onClick={() => setShowMobileRules((value) => !value)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left active:translate-y-[1px]"
            >
              <div>
                <p className="text-[11px] tracking-[0.22em] text-yellow-200/75">
                  Manual
                </p>
                <p className="mt-1 text-sm font-black text-white">
                  処理手順
                </p>
              </div>

              <span className="text-xs font-bold text-white/55">
                {showMobileRules ? "閉じる ▲" : "開く ▼"}
              </span>
            </button>

            {showMobileRules && (
              <div className="border-t border-yellow-300/10 p-4">
                <OrderRuleBox compact />
              </div>
            )}
          </div>

          {message && (
            <div className="mb-5 rounded-lg border border-yellow-300/20 bg-yellow-300/10 px-4 py-3 text-sm text-yellow-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_26px_rgba(0,0,0,0.22)]">
              {message}
            </div>
          )}

          <div className="mb-5 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            <button
              onClick={loadOrders}
              className="rounded-lg border border-white/10 bg-black/35 px-4 sm:px-5 py-3 text-sm font-bold text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_22px_rgba(0,0,0,0.20)] transition hover:bg-white/10 active:translate-y-[2px]"
            >
              再読み込み
            </button>

            <a
              href="/admin/products"
              className="rounded-lg border border-white/10 bg-black/35 px-4 sm:px-5 py-3 text-center text-sm font-bold text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_22px_rgba(0,0,0,0.20)] transition hover:bg-white/10 active:translate-y-[2px]"
            >
              商品管理へ
            </a>
          </div>

          {loading ? (
            <div className="rounded-xl border border-white/10 bg-[#0b1114]/90 backdrop-blur-2xl px-6 py-14 text-center text-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_42px_rgba(0,0,0,0.34)]">
              注文情報を読み込み中...
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-[#0b1114]/90 backdrop-blur-2xl px-6 py-14 text-center text-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_42px_rgba(0,0,0,0.34)]">
              通常注文はありません。
            </div>
          ) : (
            <section className="space-y-4">
              {activeOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  savingId={savingId}
                  mailSavingId={mailSavingId}
                  trackingNumber={trackingNumbers[order.id] || ""}
                  onTrackingNumberChange={updateTrackingNumber}
                  onUpdateStatus={updateStatus}
                  onSendStatusMail={sendStatusMail}
                  compact={true}
                />
              ))}
            </section>
          )}

          <section className="mt-6 rounded-xl border border-green-300/15 bg-green-500/[0.045] backdrop-blur-2xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_34px_rgba(0,0,0,0.26)]">
            <button
              type="button"
              onClick={() => setShowShipped((value) => !value)}
              className="w-full flex flex-row items-center justify-between gap-2 px-4 sm:px-5 py-4 text-left hover:bg-white/[0.04] active:translate-y-[1px]"
            >
              <div>
                <p className="text-[10px] sm:text-xs tracking-[0.22em] text-green-200/70">
                  SHIPPED ORDERS
                </p>
                <h3 className="mt-1 text-base sm:text-lg font-black text-white">
                  発送済み注文
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-md border border-green-300/20 bg-green-400/10 px-3 py-1.5 text-xs sm:text-sm font-black text-green-100">
                  {shippedOrders.length}件
                </span>
                <span className="text-xs sm:text-sm text-white/50">
                  {showShipped ? "閉じる ▲" : "開く ▼"}
                </span>
              </div>
            </button>

            {showShipped && (
              <div className="border-t border-green-300/10 p-3 sm:p-4">
                {shippedOrders.length === 0 ? (
                  <div className="rounded-lg border border-white/10 bg-black/25 px-5 py-6 text-center text-white/45">
                    発送済み注文はありません。
                  </div>
                ) : (
                  <div className="space-y-3">
                    {shippedOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        savingId={savingId}
                        mailSavingId={mailSavingId}
                        trackingNumber={trackingNumbers[order.id] || ""}
                        onTrackingNumberChange={updateTrackingNumber}
                        onUpdateStatus={updateStatus}
                        onSendStatusMail={sendStatusMail}
                        compact={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="mt-5 rounded-xl border border-red-300/15 bg-red-500/[0.045] backdrop-blur-2xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_34px_rgba(0,0,0,0.26)]">
            <button
              type="button"
              onClick={() => setShowCanceled((value) => !value)}
              className="w-full flex flex-row items-center justify-between gap-2 px-4 sm:px-5 py-4 text-left hover:bg-white/[0.04] active:translate-y-[1px]"
            >
              <div>
                <p className="text-[10px] sm:text-xs tracking-[0.22em] text-red-200/70">
                  CANCELED ORDERS
                </p>
                <h3 className="mt-1 text-base sm:text-lg font-black text-white">
                  キャンセル済み注文
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-md border border-red-300/20 bg-red-400/10 px-3 py-1.5 text-xs sm:text-sm font-black text-red-100">
                  {canceledOrders.length}件
                </span>
                <span className="text-xs sm:text-sm text-white/50">
                  {showCanceled ? "閉じる ▲" : "開く ▼"}
                </span>
              </div>
            </button>

            {showCanceled && (
              <div className="border-t border-red-300/10 p-3 sm:p-4">
                {canceledOrders.length === 0 ? (
                  <div className="rounded-lg border border-white/10 bg-black/25 px-5 py-6 text-center text-white/45">
                    キャンセル済み注文はありません。
                  </div>
                ) : (
                  <div className="space-y-3">
                    {canceledOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        savingId={savingId}
                        mailSavingId={mailSavingId}
                        trackingNumber={trackingNumbers[order.id] || ""}
                        onTrackingNumberChange={updateTrackingNumber}
                        onUpdateStatus={updateStatus}
                        onSendStatusMail={sendStatusMail}
                        compact={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}