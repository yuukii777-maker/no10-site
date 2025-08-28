"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, MouseEvent } from "react";
import s from "./NavBar.module.css";

const LINKS = [
  { label: "ポータル", href: "/portal" },
  { label: "イベント", href: "/events" },
  { label: "ルール",   href: "/rules"  },
  { label: "注意事項", href: "/notes"  },
  { label: "メンバー紹介", href: "/teams" },
  { label: "タイムライン", href: "/timeline" },
  { label: "ゲリラ情報",   href: "/entry" },
] as const;

function fireLoading(e: MouseEvent<HTMLAnchorElement>) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
  const a = e.currentTarget as HTMLAnchorElement;
  if (typeof window !== "undefined" && a.pathname === window.location.pathname) return;
  window.dispatchEvent(new Event("volce-loading-show"));
}

export default function NavBar() {
  const raw = usePathname() || "/";
  const pathname = raw === "/" ? "/portal" : raw;
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header className={s.nav} aria-label="メインメニュー">
      <div className={s.inner}>
        <Link href="/portal" className={s.brand} aria-label="VOLCE トップへ" onClick={fireLoading}>VOLCE</Link>

        <div className={s.spacer} />

        <button
          className={s.menuBtn}
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
          aria-controls="main-nav"
        >
          {open ? "閉じる" : "メニュー"}
        </button>

        <nav id="main-nav" className={`${s.links} ${open ? "" : s.isCollapsed}`} aria-label="サイト内リンク">
          {LINKS.map(it => {
            const active = pathname === it.href || (it.href !== "/portal" && pathname.startsWith(it.href));
            return (
              <Link
                key={it.href}
                href={it.href}
                onClick={fireLoading}
                className={`${s.link} ${active ? s.active : ""}`}
                aria-current={active ? "page" : undefined}
                prefetch
              >
                {it.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
