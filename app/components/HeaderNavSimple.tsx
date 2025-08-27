import Link from "next/link";

const items = [
  { href: "/portal", label: "ポータル" }, // ← ここを "/" から "/portal" に
  { href: "/events", label: "イベント" },
  { href: "/rules", label: "ルール" },
  { href: "/teams", label: "メンバー紹介" },
  { href: "/notes", label: "注意事項" },
  { href: "/timeline", label: "タイムライン" },
];

export default function HeaderNavSimple() {
  return (
    <header className="site-header" role="banner">
      <div className="wrap">
        <Link className="site-logo" href="/portal" title="トップへ">
          <span className="text">VOLCE 公式</span>
        </Link>
        <nav className="site-nav" role="navigation" aria-label="main navigation" id="mainNav">
          {items.map((it) => (
            <Link key={it.href} href={it.href}>
              {it.label}
            </Link>
          ))}
        </nav>
        <div className="site-actions">
          <a href="https://x.com/tenten040611" target="_blank" rel="noopener noreferrer" title="X">
            X
          </a>
        </div>
      </div>
    </header>
  );
}
