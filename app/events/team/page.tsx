/* eslint-disable @next/next/no-img-element */
// app/events/page.tsx
"use client";

import { useEffect } from "react";

export default function EventsPage() {
  // 画像フォールバックと青バンド幅だけ最低限
  useEffect(() => {
    const img = document.getElementById("evHeroImg") as HTMLImageElement | null;
    if (img) {
      let triedThumb = false;
      const THUMB =
        "https://drive.google.com/thumbnail?id=1ALLmw96koivnt0xXo6WUyGmnnDF6Gvd0&sz=w1600";
      const DOT =
        "data:image/gif;base64,R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";
      img.addEventListener("error", () => {
        if (!triedThumb) {
          triedThumb = true;
          img.removeAttribute("srcset");
          img.src = THUMB;
        } else {
          img.src = DOT;
        }
      });
    }

    const sizeBands = () => {
      document.querySelectorAll<HTMLElement>(".ev-item").forEach((row) => {
        const text = row.querySelector<HTMLElement>(".ev-text");
        const band = row.querySelector<HTMLElement>(".ev-band");
        if (!text || !band) return;
        const w = text.getBoundingClientRect().width;
        const pad = 28;
        const minW = 160;
        const maxW = row.clientWidth - 210;
        const target = Math.max(minW, Math.min(maxW, w + pad * 2));
        band.style.width = target + "px";
      });
    };
    sizeBands();
    addEventListener("resize", sizeBands, { passive: true });
    return () => removeEventListener("resize", sizeBands);
  }, []);

  return (
    <>
      {/* --- 最低限のスタイル（表示優先） --- */}
      <style>{`
        :root{
          --bg1:#0a0f16; --bg2:#05070c;
          --line: rgba(255,255,255,.20);
          --line-soft: rgba(255,255,255,.12);
          --gold: #f0c85a;
          --txt: #e9f2ff;
          --blue-1: rgba(34,92,160,.90);
          --blue-2: rgba(14,46,95,.76);
          --blue-3: rgba(12,32,64,.00);
        }
        body{
          background: linear-gradient(180deg, var(--bg1), var(--bg2));
        }
        .page{ max-width:1020px; margin:16px auto 40px; padding:0 16px; }
        .card{ background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12);
               border-radius:14px; padding:16px 18px; }

        /* HERO */
        .event-hero{ position:relative; border-radius:16px; overflow:hidden; aspect-ratio:16/9; }
        .event-img{ width:100%; height:100%; object-fit:cover; display:block; background:#0b0f16; }
        .event-hero::after{ content:""; position:absolute; inset:0; pointer-events:none;
          background: radial-gradient(120% 120% at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,.40) 100%); }

        /* LIST */
        .ev-wrap{ margin-top:16px; }
        .ev-list{ display:grid; gap:14px; }
        .ev-item{ position:relative; overflow:hidden; border-radius:12px;
          background:linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,.04));
          border:1px solid var(--line-soft); padding: 18px 54px 18px 158px; }
        .ev-date{ position:absolute; left:28px; top:50%; transform:translateY(-50%);
          font-family:"Cinzel", serif; letter-spacing:.06em; color:var(--gold); font-weight:900; }
        .ev-link{ display:block; color:var(--txt); text-decoration:none; font-weight:800; line-height:1.9; position:relative; }
        .ev-text{ position:relative; z-index:2; }
        .ev-band{
          position:absolute; z-index:1; left:120px; top:50%; transform:translateY(-50%);
          height: 52px; border-radius:10px;
          background: linear-gradient(90deg, var(--blue-3) 0%, var(--blue-2) 10%, var(--blue-1) 55%, var(--blue-2) 90%, var(--blue-3) 100%);
          box-shadow: 0 8px 26px rgba(10,30,60,.28) inset, 0 4px 18px rgba(10,30,60,.35);
        }
        .ev-arrow{ position:absolute; right:16px; top:50%; width:18px; height:18px; transform:translateY(-50%); }
        .ev-arrow::before, .ev-arrow::after{
          content:""; position:absolute; inset:0;
          border-right:2px solid rgba(255,255,255,.65); border-top:2px solid rgba(255,255,255,.65);
          transform: rotate(45deg);
        }
        .ev-arrow::after{ transform: translateX(-5px) rotate(45deg); opacity:.6; }
        @media (max-width:760px){
          .ev-item{ padding:16px 42px 16px 130px; }
          .ev-band{ left:100px; height:46px; }
          .ev-date{ left:18px; }
        }

        .btn{
          display:inline-block; padding:10px 14px; border-radius:10px;
          background:rgba(255,255,255,.10); border:1px solid rgba(255,255,255,.22);
          color:#fff; font-weight:800; text-decoration:none;
        }
      `}</style>

      {/* ===== HERO（静的版） ===== */}
      <section className="event-hero card" aria-label="Event hero">
        <img
          id="evHeroImg"
          className="event-img"
          loading="eager"
          decoding="async"
          src="https://drive.google.com/uc?export=view&id=1ALLmw96koivnt0xXo6WUyGmnnDF6Gvd0"
          referrerPolicy="no-referrer"
          alt="イベント画像"
        />
      </section>

      {/* 説明カード */}
      <section className="card" style={{ marginTop: 14 }}>
        <div>
          <h2 className="cutline brand" style={{ marginTop: 0 }}>個人主催イベント掲載可能</h2>
          <p className="muted" style={{ margin: ".3em 0 1em" }}>
            掲載可能ですが審査制です。希望の方は VolceTenGOD まで。<br />
            送信内容：期間 / イベント名 / やりたい事 / ルール / 報酬 などを事前にまとめて送ってください。
          </p>
          <a className="btn" href="/entry">申請する</a>
        </div>
      </section>

      {/* 一覧（表示保証版） */}
      <main className="page ev-wrap">
        <ul className="ev-list" id="evList">
          <li className="ev-item">
            <time className="ev-date" dateTime="2025-08-20">2025.08.20</time>
            <a
              className="ev-link"
              href="https://script.google.com/macros/s/AKfycbx_VttuveV-jxkMXT6NMFdSd72VNawyai5mBVxvEKx-yn7EC5niFEOTPLgLoYIYVYVx/exec"
              target="_blank" rel="noopener noreferrer"
            >
              <span className="ev-text">自由参加型で8/20〜8/31に抽選を実施します！</span>
              <i className="ev-band" aria-hidden="true" />
              <i className="ev-arrow" aria-hidden="true" />
            </a>
          </li>

          <li className="ev-item">
            <time className="ev-date" dateTime="2025-08-00">2025.08.00</time>
            <a className="ev-link" href="#" target="_blank" rel="noopener noreferrer">
              <span className="ev-text">イベント募集中！</span>
              <i className="ev-band" aria-hidden="true" />
              <i className="ev-arrow" aria-hidden="true" />
            </a>
          </li>

          <li className="ev-item">
            <time className="ev-date" dateTime="2025-08-00">2025.08.00</time>
            <a className="ev-link" href="#" target="_blank" rel="noopener noreferrer">
              <span className="ev-text">イベント募集中！</span>
              <i className="ev-band" aria-hidden="true" />
              <i className="ev-arrow" aria-hidden="true" />
            </a>
          </li>
        </ul>
      </main>
    </>
  );
}
