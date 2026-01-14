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
                ${isActive ? "outline outline-2 outline-orange-400" : ""}
              `}
            >
              <Image
                src={item.src}
                alt={item.label}
                fill
                className="
                  object-cover
                  transition
                  hover:brightness-110
                  hover:saturate-110
                "
              />
              <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
