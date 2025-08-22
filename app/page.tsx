"use client";
import { useState } from "react";
import Script from "next/script";

export default function Home(){
  const [pending,setPending] = useState(false);
  async function onSubmit(e:any){
    e.preventDefault(); setPending(true);
    const tokenInput = document.querySelector('input[name="cf-turnstile-response"]') as HTMLInputElement | null;
    const turnstileToken = tokenInput?.value ?? "";
    const body = { name:e.target.name.value, email:e.target.email.value, message:e.target.message.value, turnstileToken };
    const res = await fetch("/api/contact",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body) });
    alert(res.ok ? "送信しました！" : "送信に失敗しました（鍵未設定の可能性）");
    if(res.ok) e.target.reset();
    setPending(false);
  }
  return (
    <main className="min-h-screen max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">お問い合わせ</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input name="name" className="border p-2 w-full rounded" placeholder="お名前" required />
        <input name="email" type="email" className="border p-2 w-full rounded" placeholder="メール" required />
        <textarea name="message" rows={5} className="border p-2 w-full rounded" placeholder="メッセージ" required />
        {/* Turnstile のスクリプト（鍵を入れたらウィジェットが表示されます） */}
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
        {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
          <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}></div>
        ) : null}
        <button disabled={pending} className="px-4 py-2 bg-black text-white rounded">
          {pending ? "送信中…" : "送信"}
        </button>
      </form>
      <p className="text-sm text-gray-500">APIヘルス: <a className="underline" href="/api/health" target="_blank">/api/health</a></p>
    </main>
  );
}
