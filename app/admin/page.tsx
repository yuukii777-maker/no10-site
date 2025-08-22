/* app/page.tsx — ランディング大枠 + お問い合わせフォーム */
"use client";
import React, { useState } from "react";
import Script from "next/script";

export default function Home() {
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "");
    const email = String(fd.get("email") ?? "");
    const message = String(fd.get("message") ?? "");

    // Turnstile（あれば）
    let turnstileToken = "";
    const tokenInput = document.querySelector(
      'input[name="cf-turnstile-response"]'
    ) as HTMLInputElement | null;
    if (tokenInput?.value) turnstileToken = tokenInput.value;

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message, turnstileToken }),
    });

    alert(res.ok ? "送信しました！" : "送信に失敗しました…");
    if (res.ok) form.reset();
    setPending(false);
  }

  return (
    <main className="space-y-24">
      {/* Hero */}
      <section className="pt-16 pb-20 bg-white">
        <div className="container-max">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div>
              <p className="uppercase tracking-[0.25em] text-sm text-neutral-500">
                No.10 Family Office
              </p>
              <h1 className="font-display text-4xl sm:text-5xl leading-tight mt-3">
                Legacy &amp; Innovation<br />
                crafted with patience.
              </h1>
              <p className="mt-6 text-neutral-600">
                Crafting long-term value across culture, technology, and
                communities. Stewarding multigenerational capital with
                craftsmanship.
              </p>
              <div className="mt-8 flex gap-3">
                <a
                  href="#contact"
                  className="inline-flex rounded-xl px-4 py-2 bg-black text-white hover:opacity-90"
                >
                  Get in touch
                </a>
                <a
                  href="#ethos"
                  className="inline-flex rounded-xl px-4 py-2 border border-neutral-300 hover:bg-neutral-100"
                >
                  Explore
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] w-full rounded-2xl bg-neutral-100 img-rounded" />
              {/* 後で映像/画像に差し替え予定 */}
            </div>
          </div>
        </div>
      </section>

      {/* Ethos */}
      <section id="ethos">
        <div className="container-max">
          <h2 className="font-display text-3xl">Ethos</h2>
          <p className="mt-3 text-neutral-600 max-w-3xl">
            Patient capital, understated design, cultural sensitivity. We
            partner with founders and creators who build for generations, not
            quarters.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="card p-6">
              <div className="text-sm uppercase tracking-wider text-neutral-500">
                Craft
              </div>
              <div className="mt-2 font-medium">
                Careful stewardship and meticulous execution.
              </div>
            </div>
            <div className="card p-6">
              <div className="text-sm uppercase tracking-wider text-neutral-500">
                Time
              </div>
              <div className="mt-2 font-medium">
                Compounding over decades, not years.
              </div>
            </div>
            <div className="card p-6">
              <div className="text-sm uppercase tracking-wider text-neutral-500">
                Culture
              </div>
              <div className="mt-2 font-medium">
                Respect for heritage, appetite for progress.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legacy */}
      <section id="legacy">
        <div className="container-max">
          <h2 className="font-display text-3xl">Legacy</h2>
          <p className="mt-3 text-neutral-600 max-w-3xl">
            A long view on capital allocation, supporting resilient,
            compounding enterprises and cultural institutions.
          </p>
        </div>
      </section>

      {/* Portfolio */}
      <section id="portfolio">
        <div className="container-max">
          <h2 className="font-display text-3xl">Portfolio</h2>
          <p className="mt-3 text-neutral-600 max-w-3xl">
            Select partnerships in software, media, craft, and infrastructure.
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="card p-6">Company A — Seed</div>
            <div className="card p-6">Company B — Series A</div>
            <div className="card p-6">Studio / Craft Initiative</div>
          </div>
        </div>
      </section>

      {/* People */}
      <section id="people">
        <div className="container-max">
          <h2 className="font-display text-3xl">People</h2>
          <p className="mt-3 text-neutral-600 max-w-3xl">
            Operators, artisans, and researchers collaborating across borders.
          </p>
        </div>
      </section>

      {/* Philanthropy */}
      <section id="philanthropy">
        <div className="container-max">
          <h2 className="font-display text-3xl">Philanthropy</h2>
          <p className="mt-3 text-neutral-600 max-w-3xl">
            Enduring commitments in education, preservation, and public goods.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="pb-24">
        <div className="container-max">
          <h2 className="font-display text-3xl">お問い合わせ</h2>
          <form onSubmit={onSubmit} className="mt-4 space-y-3 max-w-xl">
            <input name="name" className="input" placeholder="お名前" required />
            <input name="email" type="email" className="input" placeholder="メール" required />
            <textarea name="message" rows={5} className="input" placeholder="メッセージ" required />
            {/* Turnstile（環境変数があれば表示） */}
            <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
            {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
              <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}></div>
            ) : null}
            <button
              disabled={pending}
              className="px-4 py-2 bg-black text-white rounded-xl disabled:opacity-50"
            >
              {pending ? "送信中…" : "送信"}
            </button>
          </form>

          <p className="text-sm text-neutral-500 mt-6">
            APIヘルス:{" "}
            <a className="underline" href="/api/health" target="_blank" rel="noreferrer">
              /api/health
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
