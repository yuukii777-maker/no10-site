"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "/", label: "ホーム" },
    { href: "/products", label: "商品" },
    { href: "/about", label: "農園について" },
    { href: "/news", label: "お知らせ" },
    { href: "/contact", label: "お問い合わせ" },
  ];

  return (
    <>
      {/* ========================= */}
      {/* ヘッダー本体 */}
      {/* ========================= */}
      <header
        className="
          fixed top-0 left-0 right-0 z-50
          h-[48px]
          flex items-center justify-between
          px-4
          bg-transparent
        "
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <Link href="/" className="text-lg font-semibold text-[#333]">
          山口みかん農園
        </Link>

        {/* ハンバーガー */}
        <button
          onClick={() => setOpen(true)}
          aria-label="メニューを開く"
          className="
            w-10 h-10
            flex items-center justify-center
            rounded-full
            bg-orange-500 text-white text-xl
            active:scale-95 transition
            sm:hidden
          "
        >
          ☰
        </button>
      </header>

      {/* ========================= */}
      {/* 📱 フルスクリーンメニュー */}
      {/* ========================= */}
      {open && (
        <div
          className="
            fixed inset-0 z-[60]
            bg-[#f7f4ef]
            flex flex-col items-center justify-center
            animate-fadeIn
          "
        >
          {/* 閉じる */}
          <button
            onClick={() => setOpen(false)}
            aria-label="閉じる"
            className="
              absolute top-6 right-6
              w-10 h-10
              rounded-full
              border border-gray-400
              text-xl text-gray-600
              active:scale-95 transition
            "
          >
            ×
          </button>

          {/* メニュー */}
          <nav className="space-y-6 text-center">
            {navItems.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="
                  block
                  text-2xl
                  tracking-wide
                  text-[#5a3a1e]
                  hover:opacity-70
                  transition
                  animate-slideUp
                "
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
