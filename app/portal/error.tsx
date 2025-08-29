// app/portal/error.tsx
"use client";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <div className="min-h-[60vh] grid place-items-center text-center p-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">一時的なエラーが発生しました</h1>
        <p className="text-white/70 mb-6">ページを再読み込みするか、2D表示でご覧ください。</p>
        <button onClick={() => reset()} className="px-4 py-2 rounded bg-white/10 hover:bg-white/20">
          再試行
        </button>
      </div>
    </div>
  );
}
