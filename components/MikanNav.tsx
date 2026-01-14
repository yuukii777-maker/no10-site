"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MikanNav() {
  const pathname = usePathname();

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
      {/* PCナビ（そのまま） */}
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
                  opacity-100
                  transition-all duration-200
                  active:scale-95
                  shadow-[0_4px_8px_rgba(0,0,0,0.18)]
                  hover:-translate-y-[1px]
                  hover:shadow-[0_6px_14px_rgba(0,0,0,0.22)]
                  ${isActive ? "ring-2 ring-orange-400 ring-offset-2 ring-offset-transparent" : ""}
                `}
              >
                <Image
                  src={item.src}
                  alt={item.label}
                  fill
                  className="object-cover transition hover:brightness-110 hover:saturate-110"
                />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/20 to-transparent" />
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ========================= */}
      {/* 📱 iPhone専用ナビ（木札UI） */}
      {/* ========================= */}
      <nav className="sm:hidden fixed bottom-3 left-0 right-0 z-[50]">
        <div
          className="
            mx-auto
            max-w-[95%]
            flex gap-3 justify-between
            px-3 py-2
            bg-transparent
          "
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative
                  w-[64px] h-[64px]
                  rounded-md
                  overflow-hidden
                  transition-all duration-200
                  active:scale-90

                  /* 木札感 */
                  shadow-[0_3px_6px_rgba(0,0,0,0.22)]
                  ${isActive ? "ring-2 ring-orange-400" : ""}
                `}
              >
                <Image
                  src={item.src}
                  alt={item.label}
                  fill
                  className="object-cover"
                />

                {/* 紙・木の質感ハイライト */}
                <div
                  className="
                    absolute inset-0
                    pointer-events-none
                    bg-gradient-to-b
                    from-white/25
                    to-transparent
                  "
                />
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
