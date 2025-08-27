// app/components/NavLoaderSafe.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const INLINE_SVG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'><rect x='6' y='6' width='84' height='84' rx='12' fill='%23fff'/><path d='M18 30h22l12 22 12-22h22L60 70H36z' fill='%23111'/></svg>";

export default function NavLoaderSafe() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  // ルート変更で一瞬表示
  useEffect(() => {
    setShow(true);
    const t = setTimeout(() => setShow(false), 260);
    return () => clearTimeout(t);
  }, [pathname]);

  // 内部リンククリックで表示
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      const tgt = a.getAttribute("target");
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;
      if (tgt === "_blank" || a.hasAttribute("download")) return;
      try {
        const u = new URL(href, location.href);
        if (u.origin === location.origin && u.href !== location.href) setShow(true);
      } catch {}
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // 出っぱなし保険（6s）
  useEffect(() => {
    let startedAt = 0;
    const el = document.getElementById("navLoader");
    if (!el) return;
    const mo = new MutationObserver(() => {
      const shown = el.classList.contains("show");
      if (shown && !startedAt) startedAt = performance.now();
      if (!shown) startedAt = 0;
    });
    mo.observe(el, { attributes: true, attributeFilter: ["class"] });
    const id = setInterval(() => {
      if (startedAt && performance.now() - startedAt > 6000) setShow(false);
    }, 1500);
    return () => { mo.disconnect(); clearInterval(id); };
  }, []);

  return (
    <div
      className={`nav-loader ${show ? "show" : ""}`}
      id="navLoader"
      aria-hidden={!show}
      aria-live="polite"
      aria-busy={show}
    >
      <div>
        <img
          className="nav-logo"
          src={"/logo.svg"}
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = INLINE_SVG; }}
          alt="VOLCE"
          referrerPolicy="no-referrer"
          decoding="async"
          fetchPriority="high"
        />
        <div className="nav-text">LOADING</div>
      </div>
    </div>
  );
}
