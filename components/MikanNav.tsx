"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function MikanNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // 並び順はここで完全統一
  const navItems = [
    { href: "/", src: "/mikan/nav_home.png", label: "ホーム" },
    { href: "/products", src: "/mikan/nav_products.png", label: "商品" },
    { href: "/about", src: "/mikan/nav_farm.png", label: "農園について" },
    { href: "/news", src: "/mikan/nav_news.png", label: "お知らせ" },
    { href: "/contact", src: "/mikan/nav_contact.png", label: "お問い合わせ" },
  ];

  return (
    <>
      {/* ========================= */}
      {/* PCナビ（既存そのまま） */}
      {/* ========================= */}
      <nav className="hidden sm:block w-full bg-transparent py-3 z-[40]">
        <div className="max-w-6xl mx-auto px-4 flex gap-4 justify-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative w-[120px] h-[56px]
                  overflow-hidden
                  transition-all duration-200
                  active:scale-95
                  shadow-[0_4px_8px_rgba(0,0,0,0.18)]
                  hover:-translate-y-[1px]
                  hover:shadow-[0_6px_14px_rgba(0,0,0,0.22)]
                  ${isActive ? "ring-2 ring-orange-400 ring-offset-2" : ""}
                `}
              >
                <Image
                  src={item.src}
                  alt={item.label}
                  fill
                  className="object-cover hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ========================= */}
      {/* SP用：開くトリガー（既存仕様） */}
      {/* ========================= */}
      <button
        onClick={() => setOpen(true)}
        className="sm:hidden fixed top-3 right-3 z-[60] w-10 h-10 opacity-0"
        aria-label="open menu"
      />

      {/* ========================= */}
      {/* SPナビ（統一デザイン・間隔最適化） */}
      {/* ========================= */}
      {open && (
        <nav
          className="
            sm:hidden fixed inset-0 z-50
            flex flex-col items-center justify-center
            gap-4
            bg-[#faf7f2]
            animate-navFade
            before:content-['']
            before:absolute before:inset-0
            before:bg-[radial-gradient(ellipse_at_top,_rgba(255,210,120,0.35),_transparent_65%)]
            before:pointer-events-none
          "
          onClick={() => setOpen(false)}
        >
          {navItems.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="
                w-[260px]
                transition
                active:scale-95
                hover:scale-[1.03]
                drop-shadow-[0_10px_24px_rgba(180,120,20,0.45)]
                animate-navItem
              "
              style={{ animationDelay: `${80 + i * 60}ms` }}
            >
              <Image
                src={item.src}
                alt={item.label}
                width={520}
                height={200}
                className="w-full h-auto"
                priority={i === 0}
              />
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
