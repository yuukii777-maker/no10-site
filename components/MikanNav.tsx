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
        hidden sm:block
        w-full
        bg-white/60 backdrop-blur-md
        py-2 shadow
        z-[40]
      "
    >
      <div className="max-w-6xl mx-auto px-4 flex gap-4">
        {navItems.map((item) => (
          <Link
            href={item.href}
            key={item.href}
            className="
              relative w-[120px] h-[56px]
              rounded-lg overflow-hidden
              active:scale-95 transition
            "
          >
            <Image
              src={item.src}
              alt={item.label}
              fill
              className="object-cover"
            />
          </Link>
        ))}
      </div>
    </nav>
  );
}
