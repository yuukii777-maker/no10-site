// components/CancelBox.tsx
"use client";
import { useState, useRef } from "react";

const GAS_BASE =
  "https://script.google.com/macros/s/AKfycbw9FiKbkzno4gqGK4jkZKaBB-Cxw8gOYtSCmMBOM8RNX95ZLp_uqxGiHvv0Wzm2eH1s/exec";

export default function CancelBox() {
  const [orderId, setOrderId] = useState("");
  const [sending, setSending] = useState(false);
  const sentRef = useRef(false);

  const sendCancel = async () => {
    if (!orderId.trim()) { alert("受付番号を入力してください"); return; }
    if (sentRef.current) return;

    setSending(true);
    sentRef.current = true;

    const payload = { orderId: orderId.trim() };

    try {
      const res = await fetch(`${GAS_BASE}?action=cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: new URLSearchParams({ payload: JSON.stringify(payload) }).toString(),
        keepalive: true,
      });
      const json = await res.json().catch(() => null);
      if (!json || json.ok !== true) {
        const err = json?.error || "キャンセルに失敗しました";
        if (err === "too_late") alert("キャンセル可能時間（1時間）を超えています。");
        else if (err === "order_not_found") alert("受付番号が見つかりません。");
        else alert(err);
        sentRef.current = false;
        setSending(false);
        return;
      }
      alert("キャンセルを受け付けました。");
    } catch (e) {
      try {
        await fetch(`${GAS_BASE}?action=cancel`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
          body: new URLSearchParams({ payload: JSON.stringify(payload) }).toString(),
          keepalive: true,
          mode: "no-cors",
        });
        alert("キャンセルを受け付けました。（反映に時間がかかる場合があります）");
      } catch {
        alert("通信エラーのためキャンセルできませんでした。時間をおいてお試しください。");
        sentRef.current = false;
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-10 bg-white/70 backdrop-blur-sm rounded-2xl shadow-md p-6">
      <h3 className="text-lg font-semibold mb-3">注文のキャンセル</h3>
      <p className="text-sm text-gray-600 mb-3">
        受付番号（例: YMK-20260116-12）を貼り付けてください。<br />
        ※ご注文から1時間以内のみ受付可能です。
      </p>
      <div className="flex gap-3">
        <input
          className="flex-1 border rounded-lg px-4 py-2"
          placeholder="受付番号を入力"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />
        <button
          onClick={sendCancel}
          disabled={sending}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold"
        >
          {sending ? "送信中..." : "確認してキャンセル"}
        </button>
      </div>
    </div>
  );
}
