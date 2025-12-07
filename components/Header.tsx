"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        {/* ロゴ */}
        <Link href="/" className="text-xl font-bold text-gray-800">
          山川みかん農園
        </Link>

        {/* PCメニュー */}
        <nav className="hidden md:flex gap-8 text-gray-700 font-medium">
          <Link href="/">ホーム</Link>
          <Link href="/products">商品</Link>
          <Link href="/about">農園について</Link>
          <Link href="/news">お知らせ</Link>
          <Link href="/contact">お問い合わせ</Link>
        </nav>

        {/* スマホメニュー */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="menu"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* スマホ用ドロワー */}
      {open && (
        <div className="md:hidden bg-white shadow-lg px-6 py-4 space-y-4 text-gray-700">
          <Link href="/" onClick={() => setOpen(false)}>ホーム</Link>
          <Link href="/products" onClick={() => setOpen(false)}>商品</Link>
          <Link href="/about" onClick={() => setOpen(false)}>農園について</Link>
          <Link href="/news" onClick={() => setOpen(false)}>お知らせ</Link>
          <Link href="/contact" onClick={() => setOpen(false)}>お問い合わせ</Link>
        </div>
      )}
    </header>
  );
}
