"use client";
import { useEffect, useState } from "react";

const rIC =
  typeof window !== "undefined" && "requestIdleCallback" in window
    ? (cb: () => void) => (window as any).requestIdleCallback(cb, { timeout: 1200 })
    : (cb: () => void) => setTimeout(cb, 600);

export default function Idle({
  children,
  after = 400,
}: {
  children: React.ReactNode;
  after?: number;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let t: any;
    const on = () => setReady(true);
    window.addEventListener("load", on, { once: true });
    window.addEventListener("pointerdown", on, { once: true, passive: true });
    t = setTimeout(on, after);
    rIC(on);
    return () => clearTimeout(t);
  }, [after]);
  return ready ? <>{children}</> : null;
}
