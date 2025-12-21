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
    <header className="fixed top-0 left-0 right-0 z-50 shadow-md bg-white/80 backdrop-blur-xl">
      {/* 上段：ロゴ＋ハンバーガー */}
      <div className="max-w-6xl mx-auto p-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-[#333]">
          山川みかん農園
        </Link>

        <button
          className="p-2 border rounded-md shadow-sm bg-white/70 backdrop-blur-sm hover:bg-white"
          onClick={() => setOpen(!open)}
        >
          <Image
            src="/icons/menu.svg"
            alt="menu"
            width={24}
            height={24}
          />
        </button>
      </div>

      {/* ドロワーメニュー（縦の画像メニュー） */}
      {open && (
        <div className="
          absolute right-4 mt-2 w-[150px]
          p-4 rounded-xl shadow-lg
          bg-white/80 backdrop-blur-xl
          animate-fadeSlide
        ">
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
                  sizes="150px"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
