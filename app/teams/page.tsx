/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";

/** Drive helpers */
const drive = (id: string, w = 512) =>
  `https://drive.google.com/thumbnail?id=${id}&sz=w${w}`;

type Group = "火力枠" | "クリエイター枠" | "ライバー枠" | "メンバー";
const GROUPS: Group[] = ["火力枠", "クリエイター枠", "ライバー枠", "メンバー"];

type Person = { id: string; name: string; group: Group };
const DATA: Person[] = [
  { id: "1S8MKLZEhekE25zmlMOlGDIWlrz4IC9RN", name: "VolceLozGOD", group: "火力枠" },
  { id: "10f0Sy9lPfavOMc0BKbvqsder7Q8m9JmE", name: "VolceKillerGOD", group: "火力枠" },
  { id: "1LNgsTIc5WBYbFp2bydpLO4_sJmDyc3Td", name: "VolceJunGOD", group: "火力枠" },

  { id: "15Lmehli_MZTEQG7IZ-vcz15KLth-rsOx", name: "VolceReyGOD", group: "メンバー" },
  { id: "1GjhePWk7knqKjAI8CjpSqujXKxw8Hbg1", name: "VolceSharGOD", group: "メンバー" },
  { id: "14Y9U97vFVNkzS81F9qotCfpq3DgjCcSL", name: "VolceTenGOD", group: "メンバー" },

  { id: "1qqEt12-1MLapP8ERIPKPrz4zYWxtE66h", name: "VolceE1GOD", group: "メンバー" },
  { id: "1lPuNE44kWml-LLeX7mV10KhPmOA17mFW", name: "VolceLoaGOD", group: "メンバー" },
  { id: "1GGBvKxCCMzX78HMw2uGnzs9F0i3PkFtm", name: "VolceDelaGOD", group: "メンバー" },
  { id: "1SuriOFvJ1TtLUmCcsl7S65kjN_jMSL0-", name: "VolcedarkGOD", group: "メンバー" },
  { id: "1lRX_TqkZI9NGin-peJJCul9G4cuovvHK", name: "VolceZelaGOD", group: "メンバー" },
  { id: "1rG-M39BfXRnQkqvPgMcpPIvSm_Bdd1nA", name: "VolcePIPIGOD", group: "メンバー" },
  { id: "1beUsCNzBzsJjwEQiPs_bAdddpbQkvX2z", name: "VolceRyzGOD", group: "メンバー" },
  { id: "1QnfZ2jueRWiv8e6eFWhMwzhnUjDAtzxP", name: "VolceTeruGOD", group: "メンバー" },
  { id: "1hOe7DENon23mdYMSKN7n-1Frqko1kuIt", name: "VolceRezGOD", group: "メンバー" },
];

/* ---------- UI parts ---------- */
function Card({ p }: { p: Person }) {
  return (
    <figure className="card" title={p.name}>
      <div className="thumb-wrap">
        <img className="thumb" src={drive(p.id, 512)} alt={p.name} loading="lazy" referrerPolicy="no-referrer" />
      </div>
      <figcaption className="name">{p.name}</figcaption>

      <style jsx>{`
        .card {
          display: grid;
          justify-items: center;
          gap: 10px;
          padding: 14px 10px 16px;
          border-radius: 14px;
          background: transparent;
          transition: transform 120ms ease, filter 200ms ease;
          will-change: transform, filter;
        }
        .card:hover { transform: translateY(-2px); }

        .thumb-wrap {
          position: relative;
          width: clamp(92px, 10.8vw, 136px);
          aspect-ratio: 1/1;
          display: grid; place-items: center;
          isolation: isolate;
        }

        /* ゴールドリング（下地） */
        .thumb-wrap::before{
          content:"";
          position:absolute; inset:-8% -8% auto -8%;
          height:58%; top:64%;
          border-radius:50%;
          background:
            radial-gradient(60% 48% at 50% 60%,
              rgba(255, 215, 120, .55),
              rgba(255, 180,  60, .28) 40%,
              rgba(255, 140,  20, .08) 60%,
              rgba(255, 140,  20, 0)   72%);
          filter: blur(3px); transform: translateY(6%);
          mix-blend-mode: screen; z-index:0;
        }
        .thumb-wrap::after{
          content:"";
          position:absolute; inset:14% 14% 0 14%;
          top:62%; height:2px; border-radius:999px;
          box-shadow:0 0 10px rgba(255,210,120,.7),0 0 24px rgba(255,190,90,.5);
          background:linear-gradient(90deg,rgba(255,240,180,.9),rgba(255,200,90,.84),rgba(255,240,180,.9));
          filter:blur(.6px); opacity:.75; mix-blend-mode:screen;
        }

        .thumb{
          width:100%; height:100%;
          border-radius:50%; object-fit:cover; z-index:1;
          box-shadow:0 6px 14px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.06) inset;
          transition: filter 160ms ease, box-shadow 160ms ease;
        }
        .card:hover .thumb{ box-shadow:0 8px 18px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.1) inset; }

        .name{ font-weight:800; font-size:14px; letter-spacing:.02em; text-align:center; opacity:.96; }

        @media (prefers-reduced-motion: reduce){
          .card, .thumb{ transition:none !important; }
        }
      `}</style>
    </figure>
  );
}

/* ---------- Page ---------- */
export default function TeamsPage() {
  const [group, setGroup] = useState<Group>("火力枠");
  const list = useMemo(() => DATA.filter((p) => p.group === group), [group]);

  return (
    <main className="wrap">
      {/* 背景＆透かしロゴ */}
      <div className="bg" aria-hidden>
        <picture>
          <source srcSet="/teams/volce-logo-3d.webp" type="image/webp" />
          <img src="/RULE/volce-logo-3d.png" alt="" className="watermark" loading="eager" />
        </picture>
      </div>

      {/* 見出し */}
      <header className="header">
        <h1 className="title">クラメンバー</h1>

        {/* セグメント・タブ（黒金） */}
        <div className="tabs-wrap" role="tablist" aria-label="カテゴリ切替">
          {GROUPS.map((g) => (
            <button
              key={g}
              role="tab"
              aria-selected={group === g}
              className={group === g ? "tab is-active" : "tab"}
              onClick={() => setGroup(g)}
            >
              <span>{g}</span>
            </button>
          ))}
        </div>
      </header>

      {/* メンバー（中央寄せ） */}
      <section className="grid">
        {list.length ? (
          list.map((p) => <Card key={`${p.id}-${p.name}`} p={p} />)
        ) : (
          <p className="empty">このカテゴリにはまだメンバーがいません。</p>
        )}
      </section>

      {/* Styles */}
      <style jsx>{`
        .wrap{
          min-height:100vh; position:relative; color:#e8edf6; overflow:hidden;
          background:
            radial-gradient(1300px 800px at 10% -10%, rgba(79,106,229,.14), transparent 60%),
            radial-gradient(1200px 800px at 110%  8%, rgba(79,106,229,.10), transparent 60%),
            #0a0e14;
        }
        .bg{
          position:fixed; inset:0; z-index:-1; pointer-events:none;
          background:
            url("/teams/bg_goldflare.webp") center/cover no-repeat,
            radial-gradient(70% 50% at 50% 0%, rgba(0,0,0,.0), rgba(0,0,0,.5) 90%),
            #0a0e14;
          filter:saturate(.9) brightness(.92) contrast(1.08);
        }
        .watermark{
          position:fixed; right:-6vmin; bottom:-4vmin;
          width:min(64vmin,860px); height:auto; opacity:.06;
          transform:rotate(-12deg); filter:drop-shadow(0 8px 18px rgba(0,0,0,.4));
          pointer-events:none; user-select:none; z-index:-1;
        }

        .header{ max-width:1100px; margin:28px auto 18px; padding:0 16px; text-align:center; }
        .title{
          margin:6px 0 16px; font-weight:900; letter-spacing:.04em;
          font-size:clamp(22px,3.2vw,34px);
          background:linear-gradient(90deg,#ffe39c,#f2d64e 35%,#ffe39c 70%);
          -webkit-background-clip:text; background-clip:text; color:transparent;
          text-shadow:0 1px 2px rgba(0,0,0,.35);
        }

        /* === 黒金セグメントバー === */
        .tabs-wrap{
          --gold1:#ffe9b0; --gold2:#f2d64e; --gold3:#caa45a;
          --ink:#e8edf6;
          display:inline-flex; gap:8px; justify-content:center; align-items:center;
          padding:8px; border-radius:999px;
          background:linear-gradient(180deg,rgba(16,22,38,.75),rgba(10,14,20,.75));
          border:1px solid rgba(255,255,255,.14);
          box-shadow:0 12px 36px rgba(0,0,0,.35), 0 0 0 1px rgba(255,255,255,.05) inset;
          -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
        }
        .tab{
          position:relative; cursor:pointer; appearance:none;
          padding:10px 16px; border-radius:999px; border:0;
          font-weight:900; letter-spacing:.02em;
          color:color-mix(in oklab, var(--gold1) 70%, #fff);
          background:transparent;
          transition: transform .08s ease, filter .14s ease, color .14s ease;
        }
        .tab:hover{ transform:translateY(-1px); filter:brightness(1.06); }
        .tab.is-active{
          color:#1a1a1a;
          background:linear-gradient(180deg, var(--gold1), var(--gold2) 60%, var(--gold3));
          box-shadow:
            0 8px 22px rgba(202,164,90,.40),
            0 0 0 1px rgba(255,255,255,.18) inset;
        }
        .tab.is-active span{
          text-shadow:0 1px 0 rgba(255,255,255,.55);
        }

        /* === メンバー一覧：中央寄せ（Flex） === */
        .grid{
          max-width:1100px; margin:18px auto 64px; padding:0 16px;
          display:flex; flex-wrap:wrap; gap:18px 16px; justify-content:center;
        }
        .empty{ opacity:.75; padding:14px 4px; }

        @media (max-width:760px){
          .header{ margin-top:18px; }
          .watermark{ right:-14vmin; bottom:-10vmin; width:min(82vmin,780px); }
          .tabs-wrap{ gap:6px; padding:6px; }
          .tab{ padding:8px 12px; }
        }
      `}</style>
    </main>
  );
}
