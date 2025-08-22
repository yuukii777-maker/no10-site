// app/contact/page.tsx
"use client";
import { useState } from "react";
import Script from "next/script";

export default function ContactPage(){
  const [pending,setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault(); setPending(true);

    const tokenInput = document.querySelector('input[name="cf-turnstile-response"]') as HTMLInputElement | null;
    const turnstileToken = tokenInput?.value ?? "";

    const form = e.currentTarget;
    const body = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
      turnstileToken,
    };

    const res = await fetch("/api/contact",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(body)
    });

    alert(res.ok ? "送信しました！" : "送信に失敗しました…");
    if(res.ok) form.reset();
    setPending(false);
  }

  return (
    <main className="py-10 space-y-6">
      <h1 className="font-display text-3xl font-semibold">お問い合わせ</h1>
      <form onSubmit={onSubmit} className="space-y-3 max-w-xl">
        <input name="name" className="input" placeholder="お名前" required />
        <input name="email" type="email" className="input" placeholder="メール" required />
        <textarea name="message" rows={5} className="input" placeholder="メッセージ" required />
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
        {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
          <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string}></div>
        ) : null}
        <button disabled={pending} className="px-4 py-2 bg-black text-white rounded">
          {pending ? "送信中…" : "送信"}
        </button>
      </form>
    </main>
  );
}
