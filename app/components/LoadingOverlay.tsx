"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import s from "./LoadingOverlay.module.css";

/** ここを好きな画像に差し替え（public 以下） */
const LOGO_SRC = "/loading/logo.png"; // 例: あなたの“G”ロゴを public/loading/logo.png に置く

export default function LoadingOverlay() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  // NavBar からのグローバルイベントで表示/非表示
  useEffect(() => {
    const onShow = () => setShow(true);
    const onHide = () => setShow(false);
    window.addEventListener("volce-loading-show", onShow);
    window.addEventListener("volce-loading-hide", onHide);
    // ページ戻る等でブラウザが復元したときは念のため閉じる
    const onPageShow = () => setShow(false);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("volce-loading-show", onShow);
      window.removeEventListener("volce-loading-hide", onHide);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  // パスが変わったら少し待って自動で閉じる
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setShow(false), 400);
    return () => clearTimeout(t);
  }, [pathname, show]);

  return (
    <div className={`${s.wrap} ${show ? s.show : ""}`}
         aria-hidden={!show} aria-busy={show}>
      <div className={s.box}>
        {/* 画像が無い場合は文字だけでもOK */}
        <img className={s.logo} src={LOGO_SRC} alt="" onError={(e)=>{(e.currentTarget as HTMLImageElement).style.display="none"}}/>
        <div className={s.txt}>LOADING</div>
      </div>
    </div>
  );
}

/** どこからでも呼べるユーティリティ（任意）
 *  import { showLoading, hideLoading } from "@/app/components/LoadingOverlay";
 */
export function showLoading(){ window.dispatchEvent(new Event("volce-loading-show")); }
export function hideLoading(){ window.dispatchEvent(new Event("volce-loading-hide")); }
