"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

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
        h-[64px]
        flex items-center
      "
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* 上段：ロゴ & ハンバーガー */}
      <div className="max-w-6xl mx-auto w-full px-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-[#333]">
          山川みかん農園
        </Link>

        <button
          className="p-2 rounded-md bg-orange-500 hover:bg-orange-600 sm:hidden"
          onClick={() => setOpen(!open)}
          aria-label="メニューを開く"
        >
          <Image src="/icons/menu.svg" alt="menu" width={24} height={24} />
        </button>
      </div>

      {/* 縦メニュー（スマホのみ） */}
      {open && (
        <div
          className="
            sm:hidden
            absolute right-4 top-[72px]
            w-[150px]
            p-4 rounded-xl shadow-lg
            bg-white/90 backdrop-blur-xl
            animate-fadeSlide
          "
        >
          {navItems.map((item) => (
            <Link
              href={item.href}
              key={item.href}
              className="block mb-3 last:mb-0"
              onClick={() => setOpen(false)}
            >
              <div className="w-full h-[50px] relative">
                <Image
                  src={item.src}
                  alt={item.label}
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
