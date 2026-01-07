import { Suspense } from "react";
import OrderClient from "./OrderClient";

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center">読み込み中...</div>}>
      <OrderClient />
    </Suspense>
  );
}
