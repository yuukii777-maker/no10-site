"use client";

import Image from "next/image";
import Link from "next/link";

export default function MikanNav() {
  const navItems = [
    { href: "/", src: "/mikan/nav_home.png", label: "ホーム" },
    { href: "/products", src: "/mikan/nav_products.png", label: "商品" },
    { href: "/about", src: "/mikan/nav_farm.png", label: "農園について" },
    { href: "/news", src: "/mikan/nav_news.png", label: "お知らせ" },
    { href: "/contact", src: "/mikan/nav_contact.png", label: "お問い合わせ" },
  ];

  return (
    <nav
      className="
        w-full
        bg-white/60 backdrop-blur-md 
        py-3 shadow
        mikan-nav-container
        hidden sm:block   /* ←スマホでは消える */
        z-[40]
      "
    >
      <div className="max-w-5xl mx-auto px-3 flex gap-4 overflow-x-auto scrollbar-hide">
        {navItems.map((item) => (
          <Link
            href={item.href}
            key={item.href}
            className="flex-shrink-0 w-[110px] h-[50px] relative active:scale-95 transition"
          >
            <Image
              src={item.src}
              alt={item.label}
              fill
              className="object-contain"
            />
          </Link>
        ))}
      </div>
    </nav>
  );
}
