"use client";

import { useEffect, useRef, useState } from "react";
import s from "./parallax-notes.module.css";

const IMG = {
  bg:   "/notes3d/ocean_bg.png",
  rays: "/notes3d/light_rays.png",
  cloud:"/notes3d/cloud_soft.png",
  col:  "/notes3d/ruins_columns.png",
  isle: "/notes3d/floating_island.png",
};

export default function NotesPage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  // 省モーション対応
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on(); mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);

  // マウス＆スクロール → CSS変数で反映（軽量）
  useEffect(() => {
    if (reduced || !stageRef.current) return;
    const root = stageRef.current;

    let mx = 0, my = 0, sy = 0;      // 目標値
    let vx = 0, vy = 0, vys = 0;     // 表示値（イージング）
    let raf = 0 as unknown as number;

    const onMouse = (e: MouseEvent) => {
      mx = (e.clientX / innerWidth  - 0.5) * 2; // -1..1
      my = (e.clientY / innerHeight - 0.5) * 2;
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight || 1;
      sy = scrollY / max; // 0..1
    };
    const tick = () => {
      vx  += (mx  - vx ) * 0.06;
      vy  += (my  - vy ) * 0.06;
      vys += (sy  - vys) * 0.08;
      root.style.setProperty("--mx",  vx.toFixed(4));
      root.style.setProperty("--my",  vy.toFixed(4));
      root.style.setProperty("--sy",  vys.toFixed(4));
      raf = requestAnimationFrame(tick);
    };

    addEventListener("mousemove", onMouse, { passive: true });
    addEventListener("scroll",    onScroll, { passive: true });
    onScroll();
    raf = requestAnimationFrame(tick);

    const vis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(tick);
    };
    document.addEventListener("visibilitychange", vis);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("mousemove", onMouse);
      removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [reduced]);

  return (
    <div
      ref={stageRef}
      className={s.stage}
      style={{
        ["--bg" as any]:   `url("${IMG.bg}")`,
        ["--rays" as any]: `url("${IMG.rays}")`,
        ["--cloud" as any]:`url("${IMG.cloud}")`,
        ["--col" as any]:  `url("${IMG.col}")`,
        ["--isle" as any]: `url("${IMG.isle}")`,
      }}
    >
      {/* 背景レイヤー（クリックは透過） */}
      <div className={s.bg} aria-hidden />
      <div className={s.rays} aria-hidden />
      <div className={s.clouds} aria-hidden />

      {/* “手前の物体”っぽい2枚（擬似3D） */}
      <div className={s.layer3d} aria-hidden>
        <img src={IMG.col}  alt="" className={`${s.plane} ${s.col}`}  decoding="async" loading="eager" />
        <img src={IMG.isle} alt="" className={`${s.plane} ${s.isle}`} decoding="async" loading="lazy" />
      </div>

      {/* コンテンツ */}
      <header className={s.hero} role="region" aria-labelledby="faqTitle">
        <div className={s.glass}>
          <h1 id="faqTitle">注意事項・よくある質問</h1>
          <dl className={s.faq}>
            <div className={s.qa}>
              <dt>Q. タイムラインで固まる</dt>
              <dd>A. ファイルが大きいと完了まで時間がかかります。3分以上進まない時はご連絡ください。</dd>
            </div>
            <div className={s.qa}>
              <dt>Q. 合言葉は何でもOK？</dt>
              <dd>A. 任意ですが「0000」など単純なものは避けてください。必要に応じて更新します。</dd>
            </div>
          </dl>
        </div>
      </header>

      <section className={s.fill}>
        <article>
          <p>ここにノート本文を入れてください。背景のパララックスは超軽量で動き続けます。</p>
        </article>
      </section>
    </div>
  );
}
