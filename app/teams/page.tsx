/* eslint-disable @next/next/no-img-element */
// app/teams/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

/* ================== データ ================== */
type Person = { id: string; name: string; role?: string };
type CategoryKey = "leader" | "core" | "creator" | "liver" | "member";
const drive = (id: string, w = 512) =>
  `https://drive.google.com/thumbnail?id=${id}&sz=w${w}`;

/** 幹部：代表 / 副代表 / 副団長 */
const leaders: Person[] = [
  { id: "1GjhePWk7knqKjAI8CjpSqujXKxw8Hbg1", name: "VolceSharGOD", role: "代表" },
  { id: "14Y9U97vFVNkzS81F9qotCfpq3DgjCcSL", name: "VolceTenGOD",  role: "副代表" },
  { id: "15Lmehli_MZTEQG7IZ-vcz15KLth-rsOx", name: "VolceReyGOD",  role: "副団長" },
];

/** 主力（3名） */
const core: Person[] = [
  { id: "1S8MKLZEhekE25zmlMOlGDIWlrz4IC9RN", name: "VolceLozGOD" },
  { id: "10f0Sy9lPfavOMc0BKbvqsder7Q8m9JmE", name: "VolceKillerGOD" },
  { id: "1LNgsTIc5WBYbFp2bydpLO4_sJmDyc3Td", name: "VolceJunGOD" },
];

/** 追加予定 */
const creators: Person[] = [];
const livers: Person[] = [];

/** その他メンバー */
const members: Person[] = [
  // 幹部／主力以外
  { id: "1qqEt12-1MLapP8ERIPKPrz4zYWxtE66h", name: "VolceE1GOD" },
  { id: "1lPuNE44kWml-LLeX7mV10KhPmOA17mFW", name: "VolceLoaGOD" },
  { id: "1GGBvKxCCMzX78HMw2uGnzs9F0i3PkFtm", name: "VolceDelaGOD" },
  { id: "1SuriOFvJ1TtLUmCcsl7S65kjN_jMSL0-", name: "VolcedarkGOD" },
  { id: "1lRX_TqkZI9NGin-peJJCul9G4cuovvHK", name: "VolceZelaGOD" },
  { id: "1rG-M39BfXRnQkqvPgMcpPIvSm_Bdd1nA", name: "VolcePIPIGOD" },
  { id: "1beUsCNzBzsJjwEQiPs_bAdddpbQkvX2z", name: "VolceRyzGOD" },
  { id: "1QnfZ2jueRWiv8e6eFWhMwzhnUjDAtzxP", name: "VolceTeruGOD" },
  { id: "1hOe7DENon23mdYMSKN7n-1Frqko1kuIt", name: "VolceRezGOD" },
  { id: "1GGBvKxCCMzX78HMw2uGnzs9F0i3PkFtm__ZEO", name: "VolceZeoGOD" },
];

const TABS: { key: CategoryKey; label: string }[] = [
  { key: "leader",  label: "幹部" },
  { key: "core",    label: "主力" },
  { key: "creator", label: "クリエイター" },
  { key: "liver",   label: "ライバー" },
  { key: "member",  label: "メンバー" },
];

/* ================== Page ================== */
export default function TeamsPage() {
  const [tab, setTab] = useState<CategoryKey>("leader");

  const items = useMemo(() => {
    switch (tab) {
      case "leader":  return leaders;
      case "core":    return core;
      case "creator": return creators;
      case "liver":   return livers;
      case "member":  return members;
    }
  }, [tab]);

  // iOS 100vh対策
  useEffect(() => {
    const set = () =>
      document.documentElement.style.setProperty("--vh", `${(window.innerHeight || 800) * 0.01}px`);
    set();
    addEventListener("resize", set, { passive: true });
    addEventListener("orientationchange", set, { passive: true });
    return () => { removeEventListener("resize", set); removeEventListener("orientationchange", set); };
  }, []);

  return (
    <main className="teams">
      {/* 背景（黒＋金アクセント） */}
      <div className="bg" aria-hidden>
        {/* 右下の大ロゴ：webp / png フォールバック */}
        <i className="brand webp" />
        <i className="brand png" />
      </div>

      {/* 見出し（ナビに被らないよう少し下げる） */}
      <header className="hero">
        <h1>Volceクラン</h1>
      </header>

      {/* タブ（黒金・長方形） */}
      <nav className="tabs" role="tablist" aria-label="カテゴリ切替">
        <div className="tabs-inner">
          {TABS.map(({ key, label }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={active}
                className={`tab ${active ? "is-active" : ""}`}
                onClick={() => setTab(key)}
              >
                <span className="tab-label">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* メンバー一覧（中央揃え・金のリング復活） */}
      <section className="grid" aria-live="polite">
        {items.map((p, i) => (
          <figure className="tile" key={`${p.id}-${p.name}-${i}`}>
            <div className="avatar">
              <img loading="lazy" referrerPolicy="no-referrer" src={drive(p.id, 512)} alt={p.name} />
              {!!p.role && <span className="badge">{p.role}</span>}
            </div>
            <figcaption className="name">{p.name}</figcaption>
          </figure>
        ))}
        {!items.length && <div className="empty">準備中です</div>}
      </section>

      <style jsx>{`
        :root{
          --ink:#e9edf3; --muted:#a9b0bb;
          --gold-1:#fff6cc; --gold-2:#ffe39c; --gold-3:#caa45a;
        }
        .teams{ position:relative; min-height:calc(var(--vh,1vh)*100); color:var(--ink); overflow-x:hidden; }

        /* ===== 純黒ベース + 金アクセント ===== */
        .bg{
          position:fixed; inset:0; z-index:-1; pointer-events:none;
          background:
            radial-gradient(100% 60% at 50% -10%, rgba(255,230,160,.09), transparent 55%),
            radial-gradient(100% 60% at 50% 110%, rgba(255,230,160,.06), transparent 55%),
            linear-gradient(180deg, #0a0e15 0%, #0b0f17 100%);
        }
        /* 金のストリーク（CSSのみ） */
        .bg::before{
          content:""; position:absolute; inset:-12% -12% -30% -12%;
          background:
            conic-gradient(from -20deg at 120% 60%, rgba(255,220,140,.10), transparent 22%, rgba(255,220,140,.08) 26%, transparent 36% 52%, rgba(255,220,140,.10) 58%, transparent 78%),
            conic-gradient(from 30deg at -10% 30%, rgba(255,220,140,.05), transparent 20%, rgba(255,220,140,.05) 28%, transparent 40% 70%, rgba(255,220,140,.05) 76%, transparent 100%);
          mix-blend-mode:screen; filter: blur(.6px);
        }
        /* 右下の大ロゴ（大きく・薄く） */
        .bg .brand{
          position:absolute; right:-6vmin; bottom:-6vmin;
          width:72vmin; aspect-ratio:1/1;
          background-position:center; background-size:contain; background-repeat:no-repeat;
          opacity:.18; transform: rotate(-8deg);
          filter: blur(.2px);
        }
        .bg .brand.webp{ background-image:url("/teams/volce-logo-3d.webp"); }
        .bg .brand.png { background-image:url("/RULE/volce-logo-3d.png"); }

        /* ===== 見出し ===== */
        .hero{ display:grid; place-items:center; padding: clamp(86px, 12vh, 140px) 16px 8px; text-align:center; }
        .hero h1{
          margin:0; font-weight:900; letter-spacing:.08em; font-size:clamp(24px, 4.8vw, 40px);
          background: linear-gradient(90deg, var(--gold-1), var(--gold-2) 45%, var(--gold-3) 100%);
          -webkit-background-clip:text; background-clip:text; color:transparent;
          text-shadow:0 0 20px rgba(255,230,150,.06);
        }

        /* ===== タブ（黒金の長方形） ===== */
        .tabs{ display:grid; place-items:center; padding: 6px 0 18px; }
        .tabs-inner{
          display:flex; gap:10px; padding:8px;
          border:1px solid rgba(255,255,255,.12);
          background: rgba(10,14,21,.55); border-radius:14px;
          backdrop-filter: blur(6px);
        }
        .tab{
          appearance:none; border:0; cursor:pointer;
          padding:12px 22px; border-radius:8px;
          color:#d7deeb; font-weight:900; letter-spacing:.04em;
          background: linear-gradient(180deg, rgba(20,24,34,.92), rgba(14,18,28,.92));
          border:1px solid rgba(255,255,255,.14);
          box-shadow: inset 0 0 0 1px rgba(0,0,0,.2);
          transition: transform .06s ease, filter .12s ease, box-shadow .12s ease;
        }
        .tab:hover{ filter:brightness(1.06) }
        .tab:active{ transform: translateY(1px) }
        .tab.is-active{
          color:#1a1a1a;
          background: linear-gradient(180deg, #ffe39c, #caa45a);
          border-color: rgba(255,255,255,.2);
          box-shadow: 0 10px 28px rgba(202,164,90,.25);
        }

        /* ===== グリッド（中央寄せ） ===== */
        .grid{
          width:min(1180px, 92vw); margin: 10px auto 80px;
          display:grid; justify-items:center;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap:28px;
        }

        /* ===== タイル（薄枠なし ／ 金のリング復活） ===== */
        .tile{ display:grid; gap:10px; justify-items:center; text-align:center; padding:10px; background:transparent; border:0; box-shadow:none; }
        .avatar{
          position:relative; width:200px; height:200px; border-radius:50%; display:grid; place-items:center;
          transition: transform .2s ease;
        }
        .avatar img{
          width:100%; height:100%; border-radius:50%; object-fit:cover; display:block;
          filter: drop-shadow(0 12px 24px rgba(0,0,0,.45));
        }
        /* 金のリング（常時うっすら、ホバーで強め） */
        .avatar::before{
          content:""; position:absolute; inset:-10px; border-radius:50%; pointer-events:none;
          background:
            radial-gradient(closest-side, rgba(255,245,185,.90), rgba(255,220,140,.32) 56%, rgba(255,220,140,0) 68%);
          mix-blend-mode:screen; filter: blur(.6px); opacity:.55;
        }
        .tile:hover .avatar{ transform: translateY(-2px) }
        .tile:hover .avatar::before{ opacity:.85 }
        .tile:hover .avatar img{
          filter: drop-shadow(0 14px 28px rgba(0,0,0,.50)) drop-shadow(0 0 28px rgba(255,215,120,.18));
        }

        .badge{
          position:absolute; right:8px; top:8px; font-size:12px; font-weight:900; letter-spacing:.04em;
          padding:4px 10px; border-radius:999px; color:#1a1a1a;
          background: linear-gradient(180deg,#ffe887,#f2d64e);
          box-shadow:0 6px 16px rgba(0,0,0,.35);
        }
        .name{ font-weight:800; font-size:14px; text-align:center; text-shadow:0 1px 2px rgba(0,0,0,.3); }

        .empty{ grid-column:1/-1; opacity:.76; color:var(--muted); padding:40px 0; font-weight:800; }

        @media (max-width:760px){
          .avatar{ width:160px; height:160px; }
          .tabs-inner{ gap:8px; }
          .tab{ padding:10px 14px; }
        }
      `}</style>
    </main>
  );
}
