"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Mode = "ok" | "unsub" | "err";

export default function SubFlash() {
  const params = useSearchParams();
  const router = useRouter();
  const mode = (params.get("sub") || "") as Mode;

  const [open, setOpen] = useState(false);

  const msg = useMemo(() => {
    switch (mode) {
      case "ok":
        return {
          title: "登録が完了しました",
          body: "これから畑だよりをお届けします。いつでも解除できます。",
        };
      case "unsub":
        return {
          title: "登録を解除しました",
          body: "再度希望される場合は、メルマガ登録フォームからお申し込みください。",
        };
      case "err":
        return {
          title: "エラーが発生しました",
          body: "お手数ですが、時間をおいて再度お試しください。",
        };
      default:
        return null;
    }
  }, [mode]);

  useEffect(() => {
    if (msg) setOpen(true);
  }, [msg]);

  if (!msg || !open) return null;

  const close = () => {
    setOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("sub");
    router.replace(url.pathname + (url.searchParams.toString() ? `?${url.searchParams}` : ""), {
      scroll: false,
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      aria-live="polite"
      className="fixed inset-0 z-[1000] flex items-center justify-center"
    >
      {/* 背景の薄暗幕（クリックでも閉じる） */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
        onClick={close}
      />
      {/* モーダル本体（中央表示） */}
      <div className="relative mx-4 max-w-lg w-full rounded-2xl bg-white/95 ring-1 ring-black/10 shadow-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900">{msg.title}</h3>
        <p className="mt-2 text-sm text-gray-700">{msg.body}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={close}
            className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 active:scale-95 transition"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
