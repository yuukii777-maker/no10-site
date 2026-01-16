// components/MikanNav.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function MikanNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // 並び順はここで完全統一
  const navItems = [
    { href: "/",         src: "/mikan/nav_home.png",     label: "ホーム" },
    { href: "/products", src: "/mikan/nav_products.png", label: "商品" },
    { href: "/about",    src: "/mikan/nav_farm.png",     label: "農園について" },
    { href: "/news",     src: "/mikan/nav_news.png",     label: "お知らせ" },
    { href: "/contact",  src: "/mikan/nav_contact.png",  label: "お問い合わせ" },
  ];

  // メニューオープン中は背面スクロールを止める
  useEffect(() => {
    if (!open) return;
    const { style } = document.body;
    const prev = style.overflow;
    style.overflow = "hidden";
    return () => { style.overflow = prev; };
  }, [open]);

  return (
    <>
      {/* PCナビ */}
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
                  overflow-hidden transition-all duration-200 active:scale-95
                  shadow-[0_4px_8px_rgba(0,0,0,0.18)]
                  hover:-translate-y-[1px] hover:shadow-[0_6px_14px_rgba(0,0,0,0.22)]
                  ${isActive ? "ring-2 ring-orange-400 ring-offset-2" : ""}
                `}
              >
                <Image src={item.src} alt={item.label} fill className="object-cover hover:brightness-110" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
              </Link>
            );
          })}
        </div>
      </nav>

      {/* SP用：開くトリガー（ヘッダー右上の透明ボタン想定） */}
      <button
        onClick={() => setOpen(true)}
        className="sm:hidden fixed top-3 right-3 z-[60] w-10 h-10 opacity-0"
        aria-label="open menu"
      />

      {/* SPフルスクリーンナビ（5枚を1画面に収める） */}
      {open && (
        <div
          className="
            sm:hidden fixed inset-0 z-[80]
            bg-[#faf7f2]
            "
          // 背景タップで閉じる
          onClick={() => setOpen(false)}
        >
          {/* 安全域 + 100svh で厳密に全高を確保 */}
          <div
            className="
              absolute left-0 right-0
              flex flex-col items-center justify-between
              h-[100svh]
              pt-[max(16px,env(safe-area-inset-top))]
              pb-[max(16px,env(safe-area-inset-bottom))]
            "
          >
            {/* 閉じるボタン（明示） */}
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); }}
              className="absolute top-[max(10px,env(safe-area-inset-top))] right-3 z-[90]
                         rounded-full bg-black/10 px-3 py-1 text-sm"
              aria-label="close menu"
            >
              とじる
            </button>

            {/* 天面の淡いグロー */}
            <div className="pointer-events-none absolute inset-0
                            bg-[radial-gradient(ellipse_at_top,_rgba(255,210,120,0.35),_transparent_65%)]" />

            {/* ボタン群：上下端を含めて等間隔（justify-between） */}
            <div className="relative z-[1] w-full flex-1 flex flex-col items-center justify-between">
              {navItems.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => { e.stopPropagation(); setOpen(false); }}
                  className="
                    w-[82vw] max-w-[420px]
                    transition active:scale-95 hover:scale-[1.02]
                    drop-shadow-[0_10px_18px_rgba(180,120,20,0.35)]
                  "
                >
                  {/* 画像は横幅フィット・高さは比率で自動（520x200相当の比率） */}
                  <div className="relative w-full" style={{ aspectRatio: "26 / 10" }}>
                    <Image
                      src={item.src}
                      alt={item.label}
                      fill
                      priority={i < 2}
                      className="object-contain"
                      sizes="82vw"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
