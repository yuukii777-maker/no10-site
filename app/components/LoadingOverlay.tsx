"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import s from "./LoadingOverlay.module.css";

const LOGO_SRC = "/loading/logo.png";

export default function LoadingOverlay() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onShow = () => setShow(true);
    const onHide = () => setShow(false);
    const onPageShow = () => setShow(false);
    window.addEventListener("volce-loading-show", onShow);
    window.addEventListener("volce-loading-hide", onHide);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("volce-loading-show", onShow);
      window.removeEventListener("volce-loading-hide", onHide);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setShow(false), 400);
    return () => clearTimeout(t);
  }, [pathname, show]);

  return (
    <div className={`${s.wrap} ${show ? s.show : ""}`} aria-hidden={!show} aria-busy={show}>
      <div className={s.box}>
        <img className={s.logo} src={LOGO_SRC} alt="" onError={e => ((e.currentTarget as HTMLImageElement).style.display = "none")} />
        <div className={s.txt}>LOADING</div>
      </div>
    </div>
  );
}

export function showLoading(){ window.dispatchEvent(new Event("volce-loading-show")); }
export function hideLoading(){ window.dispatchEvent(new Event("volce-loading-hide")); }
