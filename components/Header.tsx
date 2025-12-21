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
      {/* ==============================
          ヘッダー本体（和紙ガラス）
      ============================== */}
      <header className="
        fixed top-0 left-0 right-0
        backdrop-blur-md
        bg-white/60
        border-b border-white/30
        shadow-sm
        z-50
      ">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">

          {/* ロゴ */}
          <Link href="/" className="text-xl font-bold text-gray-800">
            山川みかん農園
          </Link>

          {/* ハンバーガー */}
          <button
            className="w-10 h-10 flex items-center justify-center rounded-md
                       bg-white/40 backdrop-blur-sm shadow
                       active:scale-95 transition"
            onClick={() => setOpen(!open)}
          >
            <span className="text-2xl">☰</span>
          </button>
        </div>
      </header>

      {/* ==============================
          ドロワーメニュー（縦に展開）
      ============================== */}
      {open && (
        <div className="
          fixed top-16 right-3
          w-48
          bg-white/80 backdrop-blur-md
          rounded-xl shadow-lg border border-white/40
          p-2
          z-40
          animate-fadeSlide
        ">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="
                block w-full
                px-4 py-3
                text-gray-800
                rounded-md
                hover:bg-orange-100
                transition
              "
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
