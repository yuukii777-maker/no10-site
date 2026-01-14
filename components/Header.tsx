"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  const navItems = [
    { href: "/", src: "/mikan/nav_home.png", label: "ホーム" },
    { href: "/products", src: "/mikan/nav_products.png", label: "商品" },
    { href: "/about", src: "/mikan/nav_farm.png", label: "農園について" },
    { href: "/news", src: "/mikan/nav_news.png", label: "お知らせ" },
    { href: "/contact", src: "/mikan/nav_contact.png", label: "お問い合わせ" },
  ];

  // 開閉アニメ制御
  useEffect(() => {
    if (open) {
      setVisible(true);
    } else {
      const t = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  return (
    <header
      className="
        fixed top-0 left-0 right-0 z-50
        bg-[#faf7f2]/95
        backdrop-blur-sm
        border-b border-black/10
        h-[52px]
        flex items-center
      "
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="max-w-6xl mx-auto w-full px-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-lg font-semibold tracking-wide text-[#2e2a25]"
        >
          山口みかん農園
        </Link>

        {/* ハンバーガー */}
        <button
          onClick={() => setOpen(!open)}
          className="
            sm:hidden
            w-10 h-10
            flex items-center justify-center
            rounded-md
            bg-orange-500 text-white
            shadow-md
            active:scale-95 transition
          "
          aria-label="メニュー"
        >
          ☰
        </button>
      </div>

      {/* 背景タップ */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* 📱 高級ドロワーメニュー */}
      {visible && (
        <nav
          className={`
            sm:hidden
            fixed right-4 top-[64px] z-50
            w-[280px]
            rounded-2xl
            p-5
            bg-[url('/mikan/bg_washi.png')]
            bg-repeat
            shadow-[0_12px_30px_rgba(0,0,0,0.28)]
            transition-all duration-200
            ${open ? "opacity-100 scale-100" : "opacity-0 scale-95"}
          `}
        >
          <ul className="space-y-4">
            {navItems.map((item, i) => (
              <li
                key={item.href}
                style={{ transitionDelay: `${i * 40}ms` }}
                className={`
                  transition-all duration-300
                  ${open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
                `}
              >
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="
                    group
                    relative block h-[64px]
                    rounded-lg overflow-hidden
                    shadow-[0_6px_14px_rgba(0,0,0,0.25)]
                    active:scale-[0.97]
                    transition
                  "
                >
                  <Image
                    src={item.src}
                    alt={item.label}
                    fill
                    className="object-cover"
                  />

                  {/* 上品な紙ハイライト */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />

                  {/* ラベル */}
                  <div
                    className="
                      absolute inset-0
                      flex items-center justify-center
                      text-white text-sm font-semibold tracking-wide
                      drop-shadow
                    "
                  >
                    {item.label}
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
