"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

/* ===========================
   アニメーション設定
=========================== */
const STAGGER_DELAY = 0.08; // 秒（ここだけ触れば速度調整）

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
        h-[56px] sm:h-[64px]
        flex items-center
      "
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* ロゴ & ハンバーガー */}
      <div className="max-w-6xl mx-auto w-full px-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-lg sm:text-xl font-bold text-[#333]"
        >
          山川みかん農園
        </Link>

        {/* 文字ハンバーガー（iOS安定） */}
        <button
          className="
            w-10 h-10
            flex items-center justify-center
            rounded-md
            bg-orange-500 text-white text-xl
            sm:hidden
            active:scale-95 transition
          "
          onClick={() => setOpen(!open)}
          aria-label="メニューを開く"
        >
          ☰
        </button>
      </div>

      {/* 背景オーバーレイ */}
      {open && (
        <div
          className="fixed inset-0 bg-black/25 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ドロワーメニュー */}
      {open && (
        <nav
          className="
            sm:hidden
            fixed right-4 top-[72px]
            w-[240px]
            p-4 rounded-2xl shadow-xl
            bg-white/95 backdrop-blur-xl
          "
        >
          <ul className="space-y-3">
            {navItems.map((item, i) => (
              <li
                key={item.href}
                className="animate-fadeSlide"
                style={{ animationDelay: `${i * STAGGER_DELAY}s` }}
              >
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="
                    block w-full h-[56px]
                    rounded-xl overflow-hidden
                    shadow-sm
                    active:scale-[0.96]
                    transition
                  "
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={item.src}
                      alt={item.label}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
