/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";

/** ===== 可変パラメータ（数字を変えるだけでOK） ===== */
const UI = {
  AVATAR_PX: 190,           // ロゴ（丸画像）の直径
  GRID_GAP: 32,             // カード同士の間隔
  LOGO_MARK_SCALE: 1.12,    // 右下の巨大VGロゴの大きさ
  LOGO_MARK_OPACITY: 0.12,  // 右下VGロゴの薄さ
} as const;

/** Google Drive サムネURL */
const drive = (id: string, w = 512) =>
  `https://drive.google.com/thumbnail?id=${id.replace("__ZEO", "")}&sz=w${w}`;

/** 人物データ */
type Person = { id: string; name: string; badge?: string };

const leaders: Person[] = [
  { id: "1GjhePWk7knqKjAI8CjpSqujXKxw8Hbg1", name: "VolceSharGOD", badge: "代表" },
  { id: "14Y9U97vFVNkzS81F9qotCfpq3DgjCcSL", name: "VolceTenGOD",  badge: "副代表" },
  { id: "15Lmehli_MZTEQG7IZ-vcz15KLth-rsOx", name: "VolceReyGOD",  badge: "副団長" },
];

const core: Person[] = [
  { id: "1S8MKLZEhekE25zmlMOlGDIWlrz4IC9RN", name: "VolceLozGOD",   badge: "主力" },
  { id: "10f0Sy9lPfavOMc0BKbvqsder7Q8m9JmE", name: "VolceKillerGOD", badge: "主力" },
  { id: "1LNgsTIc5WBYbFp2bydpLO4_sJmDyc3Td", name: "VolceJunGOD",    badge: "主力" },
];

const creators: Person[] = [];
const livers: Person[] = [];

const members: Person[] = [
  { id: "1qqEt12-1MLapP8ERIPKPrz4zYWxtE66h", name: "VolceE1GOD" },
  { id: "1lPuNE44kWml-LLeX7mV10KhPmOA17mFW", name: "VolceLoaGOD" },
  { id: "1GGBvKxCCMzX78HMw2uGnzs9F0i3PkFtm", name: "VolceDelaGOD" },
  { id: "1SuriOFvJ1TtLUmCcsl7S65kjN_jMSL0-", name: "VolcedarkGOD" },
  { id: "1lRX_TqkZI9NGin-peJJCul9G4cuovvHK", name: "VolceZelaGOD" },
  { id: "1rG-M39BfXRnQkqvPgMcpPIvSm_Bdd1nA", name: "VolcePIPIGOD" },
  // Zeo 用：ID重複対策で __ZEO を付けて Key 衝突回避、URL生成時に除去
  { id: "1GGBvKxCCMzX78HMw2uGnzs9F0i3PkFtm__ZEO", name: "VolceZeoGOD" },
];

/** タブ */
type Tab = "幹部" | "主力" | "クリエイター" | "ライバー" | "メンバー";
const TABS: Tab[] = ["幹部", "主力", "クリエイター", "ライバー", "メンバー"];

export default function TeamsPage() {
  const [tab, setTab] = useState<Tab>("幹部");

  const list: Person[] = useMemo(() => {
    switch (tab) {
      case "幹部": return leaders;
      case "主力": return core;
      case "クリエイター": return creators;
      case "ライバー": return livers;
      default: return members;
    }
  }, [tab]);

  return (
    <main
      id="teamsPage"
      style={
        {
          // CSS 変数で数値調整可能
          ["--avatar" as any]: `${UI.AVATAR_PX}px`,
          ["--gap" as any]: `${UI.GRID_GAP}px`,
          ["--markScale" as any]: UI.LOGO_MARK_SCALE,
          ["--markOpacity" as any]: UI.LOGO_MARK_OPACITY,
        } as React.CSSProperties
      }
    >
      {/* 背景：黒 + うっすら金のアクセント + 右下の巨大VGロゴ */}
      <div className="bg" aria-hidden="true" />

      {/* タイトル */}
      <header className="titleWrap">
        <h1>Volceクラン</h1>
      </header>

      {/* タブ */}
      <nav className="tabs" role="tablist" aria-label="カテゴリ切替">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={`tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>

      {/* グリッド */}
      <section className="grid">
        {list.length === 0 && (
          <p className="empty">準備中です。</p>
        )}
        {list.map((p, i) => (
          <figure className="card" key={`${p.id}-${p.name}-${i}`}>
            <div className="avatarWrap">
              <img className="avatar" src={drive(p.id, 768)} alt="" loading="lazy" referrerPolicy="no-referrer" />
              {/* 金のハロー */}
              <span className="ring" aria-hidden />
              {/* 役職バッジ */}
              {!!p.badge && <span className="badge">{p.badge}</span>}
            </div>
            <figcaption className="name">{p.name}</figcaption>
          </figure>
        ))}
      </section>

      <style jsx>{`
        :root{
          --gold-1:#ffe7a6; --gold-2:#e8c872; --gold-3:#b68a40;
          --ink:#e9eef6; --muted:#aab3c2;
          --bg:#0b0f16;
        }
        #teamsPage{
          position:relative; min-height:100vh; padding:88px 22px 140px;
          color:var(--ink); overflow:hidden;
          isolation:isolate;
        }

        .bg{
          position:fixed; inset:0; z-index:-1; pointer-events:none;
          background:
            radial-gradient(1400px 700px at 50% -10%, rgba(255,214,120,.10), transparent 60%),
            radial-gradient(1000px 600px at 90% 90%, rgba(255,214,120,.10), transparent 70%),
            linear-gradient(#0a0f18, #0a0f18);
        }
        /* 右下の巨大VGロゴ（/public/teams/volce-logo-3d.webp） */
        .bg::after{
          content:""; position:fixed; right:-6vw; bottom:-6vh; width:52vw; aspect-ratio:1/1;
          background:url("/teams/volce-logo-3d.webp") right bottom / contain no-repeat;
          opacity:var(--markOpacity, .12); transform: scale(var(--markScale,1));
          filter:contrast(1.05) brightness(.9);
        }
        /* 上下に金のアクセントライン（さり気なく） */
        .bg::before{
          content:""; position:fixed; inset:0; pointer-events:none;
          background:
            conic-gradient(from 0deg at 10% -10%, rgba(255,200,120,.35), transparent 12% 100%),
            conic-gradient(from 180deg at 110% 110%, rgba(255,200,120,.25), transparent 12% 100%);
          mix-blend-mode:screen; opacity:.35; filter:blur(1px);
        }

        .titleWrap{ display:grid; place-items:center; margin: 0 0 14px; }
        .titleWrap h1{
          margin:0; letter-spacing:.16em; font-weight:900;
          font-size: clamp(18px, 2vw, 22px);
          color:var(--ink);
          text-shadow: 0 1px 0 rgba(0,0,0,.5);
        }

        .tabs{
          display:flex; justify-content:center; gap:12px; flex-wrap:wrap;
          margin:10px auto 26px; padding:10px 12px; width:min(920px, 92vw);
          background: rgba(255,255,255,.03);
          border:1px solid rgba(255,255,255,.12);
          border-radius:14px;
          backdrop-filter: blur(6px);
        }
        .tab{
          appearance:none; cursor:pointer; border:1px solid rgba(255,255,255,.14);
          background:
            linear-gradient(180deg, rgba(255,255,255,.06), rgba(0,0,0,.12));
          color:var(--ink); font-weight:900; letter-spacing:.06em;
          padding:10px 22px; border-radius:10px;
          box-shadow: 0 4px 12px rgba(0,0,0,.28), 0 0 0 1px rgba(255,255,255,.04) inset;
          transition: filter .12s ease, transform .06s ease, border-color .12s ease;
        }
        .tab:hover{ filter:brightness(1.06) }
        .tab:active{ transform: translateY(1px) }
        .tab.active{
          background: linear-gradient(180deg, var(--gold-1), var(--gold-2));
          color:#1a1a1a; border-color: color-mix(in oklab, var(--gold-2) 70%, #000);
          box-shadow: 0 10px 28px rgba(0,0,0,.35), 0 0 0 1px rgba(0,0,0,.12) inset;
        }

        .grid{
          display:grid; justify-content:center;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: var(--gap);
          width:min(1200px, 94vw); margin:0 auto;
        }
        .empty{ color:var(--muted); text-align:center; grid-column:1/-1; }

        .card{ display:grid; justify-items:center; gap:10px; }
        .avatarWrap{ position:relative; width:var(--avatar); height:var(--avatar); }
        .avatar{
          width:100%; height:100%; object-fit:cover; display:block; border-radius:50%;
          box-shadow: 0 10px 28px rgba(0,0,0,.45);
          background: radial-gradient(60% 60% at 50% 45%, rgba(255,255,255,.06), rgba(255,255,255,0) 72%), rgba(16,22,38,.12);
        }
        /* 金のハロー：画像の外周だけを輝かせる */
        .ring{
          position:absolute; inset:-8%; border-radius:50%; pointer-events:none;
          background:
            conic-gradient(from 0deg, rgba(255,240,200,.0) 0 40%, rgba(255,240,180,.65) 50%, rgba(255,240,200,.0) 60% 100%),
            radial-gradient(closest-side, rgba(255,220,140,.85), rgba(255,220,140,.35) 55%, rgba(255,220,140,0) 68%);
          filter: blur(6px);
          -webkit-mask: radial-gradient(circle, transparent 62%, #000 68%, #000 100%);
                  mask: radial-gradient(circle, transparent 62%, #000 68%, #000 100%);
          opacity:.75; animation: glow 3.4s linear infinite;
        }
        @keyframes glow { to { transform: rotate(360deg) } }

        .badge{
          position:absolute; top:6px; right:10px;
          font-size:12px; font-weight:900; letter-spacing:.06em;
          color:#1a1a1a; padding:4px 10px; border-radius:999px;
          background: linear-gradient(180deg, var(--gold-1), var(--gold-2));
          border:1px solid var(--gold-3);
          box-shadow: 0 6px 16px rgba(0,0,0,.35);
        }
        .name{ font-weight:800; text-align:center; letter-spacing:.02em; }
      `}</style>
    </main>
  );
}
