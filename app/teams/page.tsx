/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";

/* ====== データ ====== */
type Person = { id: string; name: string; role?: string; badge?: string };

const leaders: Person[] = [
  { id: "15Lmehli_MZTEQG7IZ-vcz15KLth-rsOx", name: "VolceReyGOD", role: "副団長" },
  { id: "1GjhePWk7knqKjAI8CjpSqujXKxw8Hbg1", name: "VolceSharGOD", role: "代表" },
  { id: "14Y9U97vFVNkzS81F9qotCfpq3DgjCcSL", name: "VolceTenGOD", role: "副代表" },
];
const specials: Person[] = [
  { id: "1S8MKLZEhekE25zmlMOlGDIWlrz4IC9RN", name: "VolceLozGOD",  badge: "火力枠" },
  { id: "10f0Sy9lPfavOMc0BKbvqsder7Q8m9JmE", name: "VolceKillerGOD", badge: "大火力枠" },
  { id: "1LNgsTIc5WBYbFp2bydpLO4_sJmDyc3Td", name: "VolceJunGOD",  badge: "火力枠" },
];
const members: Person[] = [
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

/* ====== 便利 ====== */
const drive = (id: string, w = 512) => `https://drive.google.com/thumbnail?id=${id}&sz=w${w}`;

/* ====== ページ ====== */
export default function TeamsPage() {
  const [reveal, setReveal] = useState(false);
  useEffect(() => {
    // 初回のみ“霧が晴れる”
    const t = setTimeout(() => setReveal(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* 背景：暗紺→中央やや明るめ＋紫の発光 */}
      <div className="scene" aria-hidden="true">
        <div className="glow" />
        {/* 霧カーテン（最初は濃い→だんだん消える） */}
        <img className={`curtain fog1 ${reveal ? "out" : ""}`} src="/portal/fog_soft.png" alt="" />
        <img className={`curtain fog2 ${reveal ? "out" : ""}`} src="/portal/smoke_dense.png" alt="" />
      </div>

      <main className="wrap">
        <h2 className="ttl">クランメンバー</h2>

        <div className="leaders">
          {leaders.map((p, i) => (
            <figure key={p.id} className="card">
              <img src={drive(p.id, 256)} alt="" />
              <figcaption className="name">{p.name}</figcaption>
              {p.role && <span className="role">{p.role}</span>}
            </figure>
          ))}
        </div>

        <h3 className="sub">特別枠</h3>
        <div className="specials">
          {specials.map((p) => (
            <figure key={p.id} className="card">
              <img src={drive(p.id, 512)} alt="" />
              <figcaption className="name">{p.name}</figcaption>
              {p.badge && <span className="badge">{p.badge}</span>}
            </figure>
          ))}
        </div>

        <h3 className="sub">メンバー</h3>
        <div className="grid">
          {members.map((p, idx) => (
            <figure key={`${p.id}-${idx}`} className="card small">
              <img src={drive(p.id.replace("__ZEO",""), 256)} alt="" />
              <figcaption className="name">{p.name}</figcaption>
            </figure>
          ))}
        </div>
      </main>

      <style jsx>{`
        .scene{
          position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden;
          background: radial-gradient(120% 80% at 50% 40%, #0e1422 0, #0b101a 55%, #070b12 100%);
        }
        .glow{
          position:absolute; left:50%; top:50%; width:min(70vmin,720px); aspect-ratio:1/1; translate:-50% -50%;
          background:
            radial-gradient(closest-side, rgba(170,120,255,.35), rgba(170,120,255,.18) 45%, rgba(170,120,255,0) 70%),
            radial-gradient(closest-side, rgba(170,120,255,.18), rgba(170,120,255,0) 55%);
          filter: blur(2px);
        }
        .curtain{ position:absolute; inset:auto; left:50%; top:50%; translate:-50% -50%; pointer-events:none; opacity:.95; mix-blend-mode:screen; transition: opacity .9s ease 250ms; }
        .curtain.out{ opacity:0; }
        .fog1{ width:110vw; animation: drift 24s linear infinite, bob 17s ease-in-out infinite; }
        .fog2{ width:90vw;  animation: driftR 32s linear infinite, bob 21s ease-in-out infinite; opacity:.65; }

        @keyframes drift{  0%{ transform:translate(-50%,-50%) translateX(-2vw) } 100%{ transform:translate(-50%,-50%) translateX(2vw) } }
        @keyframes driftR{ 0%{ transform:translate(-50%,-50%) translateX( 2vw) } 100%{ transform:translate(-50%,-50%) translateX(-2vw) } }
        @keyframes bob{ 0%,100%{ transform:translate(-50%,-52%) } 50%{ transform:translate(-50%,-48%) } }

        .wrap{ position:relative; z-index:1; width:min(1080px,92vw); margin:22px auto 80px; padding:20px;
               background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:14px; backdrop-filter: blur(2px); }
        .ttl{ margin:4px 0 14px; font-weight:900; letter-spacing:.06em; text-align:center; }
        .sub{ margin:14px 0 10px; font-weight:900; letter-spacing:.04em; }

        .leaders{ display:grid; grid-template-columns:repeat(3,1fr); gap:16px; justify-items:center; }
        .specials{ display:grid; grid-template-columns:repeat(3,1fr); gap:16px; justify-items:center; }
        .grid{ display:grid; gap:14px; grid-template-columns: repeat(auto-fill, minmax(clamp(120px, 18vw, 160px), 1fr)); }

        .card{ position:relative; display:grid; place-items:center; gap:8px; padding:12px; border-radius:12px; background:transparent; }
        .card img{ width:clamp(110px, 10vw, 140px); height:clamp(110px, 10vw, 140px); border-radius:50%; object-fit:cover; display:block;
                   box-shadow: 0 8px 18px rgba(0,0,0,.28); background: rgba(10,14,21,.18); }
        .card.small img{ width:clamp(74px, 8.5vw, 96px); height:clamp(74px, 8.5vw, 96px); }
        .name{ font-weight:800; font-size:14px; text-align:center; }
        .role{ font-size:12px; opacity:.9; padding:2px 10px; border-radius:999px; background:rgba(255,255,255,.10);
               border:1px solid rgba(255,255,255,.18); }
        .badge{ position:absolute; top:6px; right:10px; font-size:12px; font-weight:800; padding:2px 8px; border-radius:999px;
                color:#1a1a1a; background:linear-gradient(180deg,#ffe887,#f2d64e); box-shadow:0 4px 14px rgba(0,0,0,.35); }

        @media (max-width: 760px){
          .leaders{ grid-template-columns:1fr; }
          .specials{ grid-template-columns:1fr; }
        }
      `}</style>
    </>
  );
}
