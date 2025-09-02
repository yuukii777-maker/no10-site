/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";

// ============ データ（カテゴリ構成） ============
type Person = { id: string; name: string; badge?: string };

const DRIVE = (id: string, w = 512) =>
  `https://drive.google.com/thumbnail?id=${id}&sz=w${w}`;

// 代表/副代表（最上段の固定3人）
const CORE: Person[] = [
  { id: "15Lmehli_MZTEQG7IZ-vcz15KLth-rsOx", name: "VolceReyGOD" }, // 副団長
  { id: "1GjhePWk7knqKjAI8CjpSqujXKxw8Hbg1", name: "VolceSharGOD" }, // 代表
  { id: "14Y9U97vFVNkzS81F9qotCfpq3DgjCcSL", name: "VolceTenGOD" }, // 副代表
];

// 火力枠（“特別枠”だった3人）
const FIRE: Person[] = [
  { id: "1S8MKLZEhekE25zmlMOlGDIWlrz4IC9RN", name: "VolceLozGOD", badge: "火力枠" },
  { id: "10f0Sy9lPfavOMc0BKbvqsder7Q8m9JmE", name: "VolceKillerGOD", badge: "大火力枠" },
  { id: "1LNgsTIc5WBYbFp2bydpLO4_sJmDyc3Td", name: "VolceJunGOD", badge: "火力枠" },
];

// クリエイター枠（今は空でもOK。後で追加していけば良い）
const CREATORS: Person[] = [
  // { id: "driveId", name: "name" },
];

// ライバー枠（同上）
const LIVERS: Person[] = [
  // { id: "driveId", name: "name" },
];

// 一般メンバー
const MEMBERS: Person[] = [
  { id: "1qqEt12-1MLapP8ERIPKPrz4zYWxtE66h", name: "VolceE1GOD" },
  { id: "1lPuNE44kWml-LLeX7mV10KhPmOA17mFW", name: "VolceLoaGOD" },
  { id: "1GGBvKxCCMzX78HMw2uGnzs9F0i3PkFtm", name: "VolceDelaGOD" },
  { id: "1SuriOFvJ1TtLUmCcsl7S65kjN_jMSL0-", name: "VolcedarkGOD" },
  { id: "1lRX_TqkZI9NGin-peJJCul9G4cuovvHK", name: "VolceZelaGOD" },
  { id: "1rG-M39BfXRnQkqvPgMcpPIvSm_Bdd1nA", name: "VolcePIPIGOD" },
  { id: "1beUsCNzBzsJjwEQiPs_bAdddpbQkvX2z", name: "VolceRyzGOD" },
  { id: "1QnfZ2jueRWiv8e6eFWhMwzhnUjDAtzxP", name: "VolceTeruGOD" },
  { id: "1hOe7DENon23mdYMSKN7n-1Frqko1kuIt", name: "VolceRezGOD" },
  { id: "1GGBvKxCCMzX78HMw2uGnzs9F0i3PkFtm", name: "VolceZeoGOD" },
];

type TabKey = "火力枠" | "クリエイター枠" | "ライバー枠" | "メンバー";
const TABS: { key: TabKey; data: Person[] }[] = [
  { key: "火力枠", data: FIRE },
  { key: "クリエイター枠", data: CREATORS },
  { key: "ライバー枠", data: LIVERS },
  { key: "メンバー", data: MEMBERS },
];

// ============ ページ本体 ============
export default function TeamsPage() {
  const [tab, setTab] = useState<TabKey>("火力枠");
  const list = useMemo(() => TABS.find((t) => t.key === tab)?.data ?? [], [tab]);

  return (
    <main className="teams">
      {/* ===== 上段：コアメンバー（3名） ===== */}
      <section className="core">
        {CORE.map((p, i) => (
          <figure key={p.id} className={`card corecard i${i}`}>
            <div className="logoWrap">
              <img src={DRIVE(p.id, 512)} alt="" referrerPolicy="no-referrer" />
            </div>
            <figcaption className="name">{p.name}</figcaption>
          </figure>
        ))}
      </section>

      {/* ===== タブ ===== */}
      <nav className="tabbar" role="tablist" aria-label="member categories">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            className={tab === t.key ? "on" : ""}
            onClick={() => setTab(t.key)}
          >
            {t.key}
            <span className="count">{t.data.length}</span>
          </button>
        ))}
      </nav>

      {/* ===== 一覧 ===== */}
      <section className="grid">
        {list.map((p) => (
          <figure key={p.id + p.name} className="card">
            <div className="logoWrap">
              <img src={DRIVE(p.id, 512)} alt="" referrerPolicy="no-referrer" />
              {!!p.badge && <span className="badge">{p.badge}</span>}
            </div>
            <figcaption className="name">{p.name}</figcaption>
          </figure>
        ))}
        {list.length === 0 && (
          <div className="empty">まだ登録がありません</div>
        )}
      </section>

      {/* ===== styles ===== */}
      <style jsx>{`
        .teams {
          --ink: #e8edf6;
          --muted: #a8b0bd;
          --panel: rgba(10, 14, 21, 0.75);
          --gold1: #ffe887;
          --gold2: #f2d64e;

          position: relative;
          min-height: 100vh;
          padding: 24px 18px 64px;
          margin: 0 auto;
          max-width: 1120px;
          color: var(--ink);
        }

        /* 背景：黒 + うっすらロゴ（ウォーターマーク） */
        .teams::before {
          content: "";
          position: fixed;
          inset: 0;
          background:
            radial-gradient(1200px 700px at 50% 30%, rgba(255,255,255,.05), transparent 60%),
            #0b0f16;
          z-index: -2;
        }
        .teams::after {
          content: "";
          position: fixed;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background: url("/RULE/volce-logo-3d.webp") center 22%/min(62vmin, 720px)
              no-repeat;
          opacity: 0.06; /* ほんのり */
          filter: blur(0.3px) saturate(0.9);
          mix-blend-mode: screen;
        }

        /* コア3人（カードは枠ナシ、個別グロー） */
        .core {
          display: grid;
          grid-template-columns: repeat(3, minmax(220px, 1fr));
          gap: 16px;
          margin: 12px 0 18px;
        }
        .corecard {
          background: linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,.01));
          border: 0;
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 14px 38px rgba(0,0,0,.45);
        }
        .corecard .logoWrap {
          display: grid; place-items: center;
          aspect-ratio: 1/1;
          border-radius: 16px;
          background: rgba(255,255,255,.02);
        }
        .corecard img {
          width: clamp(120px, 20vmin, 160px);
          height: auto;
          border-radius: 50%;
          filter:
            drop-shadow(0 0 20px rgba(170,130,255,.32))
            drop-shadow(0 0 36px rgba(140,100,255,.18));
          transition: filter .2s ease, transform .15s ease;
        }
        .corecard:hover img{ transform: translateY(-1px); filter:
            drop-shadow(0 0 26px rgba(180,140,255,.45))
            drop-shadow(0 0 60px rgba(150,110,255,.30)); }
        .name{
          margin-top: 10px; text-align:center; font-weight: 800; letter-spacing:.02em;
        }

        /* タブ（シンプル） */
        .tabbar{
          display:flex; gap:8px; align-items:center; margin: 10px 0 12px;
          position: sticky; top: 64px; z-index: 1;
          backdrop-filter: blur(6px);
        }
        .tabbar button{
          appearance:none; border:1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.04); color:var(--ink);
          border-radius: 999px; padding: 8px 14px; font-weight: 800;
        }
        .tabbar button.on{
          background: linear-gradient(180deg, #202a44, #171f33);
          border-color: rgba(255,255,255,.2);
          box-shadow: 0 6px 18px rgba(0,0,0,.35) inset, 0 0 0 1px rgba(255,255,255,.06);
        }
        .tabbar .count{
          margin-left: 8px; opacity:.75; font-weight: 700;
        }

        /* 一覧（枠線なし、各ロゴだけが発光） */
        .grid{
          display:grid; gap: 16px;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          align-items: start;
        }
        .card{
          background: rgba(255,255,255,.02);
          border: 0;
          border-radius: 16px;
          padding: 14px 12px 16px;
          box-shadow: 0 12px 34px rgba(0,0,0,.38);
        }
        .logoWrap{
          position: relative;
          display: grid; place-items:center;
        }
        .logoWrap img{
          width: clamp(82px, 10.5vmin, 120px); height: auto; border-radius: 50%;
          filter:
            drop-shadow(0 0 14px rgba(170,130,255,.30))
            drop-shadow(0 0 34px rgba(140,100,255,.20));
          transition: filter .2s ease, transform .15s ease;
        }
        .card:hover img{
          transform: translateY(-1px);
          filter:
            drop-shadow(0 0 18px rgba(180,140,255,.45))
            drop-shadow(0 0 48px rgba(150,110,255,.30));
        }
        .badge{
          position:absolute; right: 6px; top: 6px;
          font-size: 12px; font-weight: 900; letter-spacing:.04em;
          padding: 2px 8px; border-radius: 999px; color:#1a1a1a;
          background: linear-gradient(180deg, var(--gold1), var(--gold2));
          box-shadow:0 4px 12px rgba(0,0,0,.35);
        }

        .empty{
          grid-column: 1/-1; text-align:center; color:var(--muted); padding:24px 0 10px;
        }

        @media (max-width: 860px){
          .core{ grid-template-columns: 1fr; }
          .tabbar{ top: 54px; }
        }
      `}</style>
    </main>
  );
}
