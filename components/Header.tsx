"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

/* ===========================
   アニメーション設定（←ここだけ触る）
=========================== */
const STAGGER_DELAY = 0.05; // ← 秒数を変えるだけで速度調整

export default function Header() {
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "/", src: "/mikan/nav_home.png", label: "ホーム" },
    { href: "/products", src: "/mikan/nav_products.png", label: "商品" },
    { href: "/about", src: "/mikan/nav_farm.png", label: "農園について" },
    { href: "/news", src: "/mikan/nav_news.png", label: "お知らせ" },
    { href: "/contact", src: "/mikan/nav_contact.png", label: "お問い合わせ" },
  ];

  return (
    <header
      className="
        fixed top-0 left-0 right-0 z-50
        bg-white/80 backdrop-blur-xl shadow-md
        h-[64px] flex items-center
      "
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* 上段：ロゴ & ハンバーガー */}
      <div className="max-w-6xl mx-auto w-full px-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-[#333]">
          山川みかん農園
        </Link>

        <button
          className="p-2 rounded-md bg-orange-500 hover:bg-orange-600 sm:hidden active:scale-95 transition"
          onClick={() => setOpen(!open)}
          aria-label="メニューを開く"
        >
          <Image src="/icons/menu.svg" alt="menu" width={24} height={24} />
        </button>
      </div>

      {/* 背景オーバーレイ */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ドロワーメニュー */}
      {open && (
        <nav
          className="
            sm:hidden
            fixed right-4 top-[72px]
            w-[180px]
            p-4 rounded-2xl shadow-xl
            bg-white/90 backdrop-blur-xl
          "
        >
          <ul className="space-y-2">
            {navItems.map((item, i) => (
              <li
                key={item.href}
                className="animate-fadeSlide"
                style={{
                  animationDelay: `${i * STAGGER_DELAY}s`,
                }}
              >
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="
                    flex items-center gap-3
                    h-[48px] px-3 rounded-lg
                    hover:bg-orange-50
                    active:scale-[0.97]
                    transition
                  "
                >
                  <div className="relative w-8 h-8">
                    <Image
                      src={item.src}
                      alt={item.label}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-sm font-medium text-[#333]">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
