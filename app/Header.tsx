// app/components/Header.tsx
"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/">
          <h2 style={{ fontWeight: 700 }}>山川みかん農園</h2>
        </Link>

        <nav className="nav">
          <Link href="/">ホーム</Link>
          <Link href="/products">商品</Link>
          <Link href="/about">農園について</Link>
          <Link href="/news">お知らせ</Link>
          <Link href="/contact">お問い合わせ</Link>
        </nav>
      </div>
    </header>
  );
}
