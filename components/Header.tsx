"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">

        {/* 🟧 ロゴだけにする */}
        <Link href="/" className="text-xl font-bold text-gray-800">
          山川みかん農園
        </Link>

      </div>
    </header>
  );
}
