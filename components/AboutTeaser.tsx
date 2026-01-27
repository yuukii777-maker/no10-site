"use client";
import { useState } from "react";

export default function AboutTeaser() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"ok"|"err">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const r = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "top_about" }),
      });
      if (!r.ok) throw new Error();
      setStatus("ok"); setEmail("");
    } catch { setStatus("err"); }
  }

  return (
    <section className="mx-auto mt-8 max-w-4xl rounded-2xl border bg-white/70 p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-2">夫婦で育てる、小さなみかん農園です</h2>
      <p className="text-sm leading-6">
        2023年春、私たちは脱サラしてみかん農家になりました。温暖化に負けない
        樹づくり・樹勢強化・土づくりに日々向き合っています。贈答用の正規品から
        「小玉・キズあり」の訳ありまで、等級を正直に分けてお届けします。
      </p>
      <a href="/about" className="inline-block mt-3 text-sm underline underline-offset-4 hover:opacity-80">
        農園について詳しく見る →
      </a>

      <form onSubmit={onSubmit} className="mt-4 flex gap-2">
        <input
          type="email" required value={email}
          onChange={(e)=>setEmail(e.target.value)}
          placeholder="メールアドレスを入力"
          className="w-full rounded-xl border px-3 py-2"
        />
        <button
          type="submit" disabled={status==="loading"}
          className="whitespace-nowrap rounded-xl border px-4 py-2 font-semibold hover:opacity-90"
        >
          {status==="loading" ? "登録中…" : "メルマガ登録"}
        </button>
      </form>
      {status==="ok"  && <p className="mt-2 text-xs">仮登録メールを送りました。メール内リンクで本登録してください。</p>}
      {status==="err" && <p className="mt-2 text-xs text-red-600">登録に失敗しました。時間をおいてお試しください。</p>}
    </section>
  );
}
