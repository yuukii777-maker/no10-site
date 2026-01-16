// app/order/page.tsx
import { Suspense } from "react";
import OrderClient from "./OrderClient";          // 既存の注文フォーム（Client Component）
import CancelBox from "@/components/CancelBox";   // 追加：キャンセル入力ボックス

export const metadata = {
  title: "ご購入手続き | 山口みかん農園",
  description: "ご注文情報の入力と、受付番号によるキャンセル（1時間以内）を受け付けます。",
};

export default function OrderPage() {
  return (
    <>
      {/* ご注文フォーム（読み込み待ちのフォールバック付き） */}
      <Suspense fallback={<div className="pt-32 text-center">読み込み中...</div>}>
        <OrderClient />
      </Suspense>

      {/* フォームの下にキャンセルボックスを表示 */}
      <div className="max-w-3xl mx-auto px-6 pb-24">
        <CancelBox />
      </div>
    </>
  );
}
