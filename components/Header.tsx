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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl shadow-md">

      {/* ▼ 上段：ロゴ & ハンバーガー（スマホ限定） */}
      <div className="max-w-6xl mx-auto p-4 flex justify-between items-center">

        <Link href="/" className="text-xl font-bold text-[#333]">
          山川みかん農園
        </Link>

        {/* ハンバーガー（PCでは非表示） */}
        <button
          className="p-2 rounded-md bg-orange-500 hover:bg-orange-600 sm:hidden"
          onClick={() => setOpen(!open)}
        >
          <Image src="/icons/menu.svg" alt="menu" width={24} height={24} />
        </button>

      </div>

      {/* ▼ 縦メニュー（スマホのみ） */}
      {open && (
        <div
          className="
          sm:hidden      /* ← PCでは絶対表示しない */
          absolute right-4 mt-2 w-[150px]
          p-4 rounded-xl shadow-lg
          bg-white/90 backdrop-blur-xl
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
