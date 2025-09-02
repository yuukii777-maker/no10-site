/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";

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

const Q = (() => {
  const sha = (process.env.NEXT_PUBLIC_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || "").toString().slice(0, 8);
  return sha ? `?v=${sha}` : "";
})();

export default function TeamsPage() {
  const [revealed, setRevealed] = useState(false);
  const hostRef = useRef<HTMLDivElement | null>(null);

  // 霧カーテンのIO開始
  useEffect(() => {
    const root = hostRef.current;
    if (!root) return;
    let fired = false;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!fired && e.isIntersecting) {
          fired = true;
          setTimeout(() => setRevealed(true), 300); // すこし間を置く
          io.disconnect();
        }
      });
    }, { threshold: 0.2 });
    io.observe(root);
    return () => io.disconnect();
  }, []);

  const drive = (id: string, w = 512) => `https://drive.google.com/thumbnail?id=${id}&sz=w${w}`;

  return (
    <main className="page">
      <section ref={hostRef} id="teams" className="card" style={{ maxWidth: 1000, margin: "16px auto 0", position: "relative", overflow: "hidden" }}>
        <h2 style={{ margin: "0 0 10px", fontFamily: "'Cinzel',serif", letterSpacing: ".06em" }}>クランメンバー</h2>

        {/* 役職 */}
        <div className="leaders-grid">
          {leaders.map((p, i) => (
            <figure className={`leader ${revealed ? "in" : ""}`} key={`${p.id}-${p.name}`}>
              <img loading="lazy" referrerPolicy="no-referrer" src={drive(p.id, 256)} alt="" />
              <figcaption className="name">{p.name}</figcaption>
              {!!p.role && <div className="role">{p.role}</div>}
            </figure>
          ))}
        </div>

        {/* 特別枠 */}
        <div className="special-wrap">
          <h3 className="special-title">特別枠</h3>
          <div className="special-grid">
            {specials.map((p, idx) => (
              <figure className={`member special ${revealed ? "in" : ""}`} key={`${p.id}-${p.name}`}>
                <img loading="lazy" referrerPolicy="no-referrer" src={drive(p.id, 512)} alt="" />
                <figcaption className="name">{p.name}</figcaption>
                {!!p.badge && <span className="role-badge">{p.badge}</span>}
              </figure>
            ))}
          </div>
        </div>

        <h3 className="divider-title">メンバー</h3>
        <div className="member-grid">
          {members.map((p, idx) => (
            <figure className={`member ${revealed ? "in" : ""}`} key={`${p.id}-${p.name}-${idx}`}>
              <img loading="lazy" referrerPolicy="no-referrer" src={drive(p.id.replace("__ZEO",""), 256)} alt="" />
              <figcaption className="name">{p.name}</figcaption>
            </figure>
          ))}
        </div>

        {/* 霧カーテン */}
        <FogCurtain show={!revealed} />

        {/* 紫の常時発光（ロゴ周辺に固定） */}
        <Glow />
      </section>

      <style jsx>{`
        .page{max-width:1020px;margin:16px auto 0;}
        .leaders-grid{ display:grid; gap:16px; grid-template-columns:repeat(3, minmax(160px,1fr)); justify-items:center; align-items:end; margin-bottom:18px; }
        .leader{ display:grid; justify-items:center; gap:8px; padding:12px; border-radius:14px; background:transparent; }
        .leader img{ width:clamp(112px, 10vw, 140px); height:clamp(112px, 10vw, 140px); border-radius:50%; object-fit:cover; display:block; }
        .leader .role{ font-size:12px; opacity:.9; padding:2px 10px; border-radius:999px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.18); }
        .leader .name{ font-weight:800; font-size:16px; text-align:center; }

        .special-wrap{ margin:14px 0 6px; }
        .special-title{ display:flex; align-items:center; gap:10px; margin:6px 0 10px; letter-spacing:.06em; font-weight:900; }
        .special-title::before, .special-title::after{ content:""; flex:1; height:1px; background:linear-gradient(90deg, rgba(255,242,168,.0), rgba(255,242,168,.6), rgba(255,242,168,.0)); filter:blur(.2px); }
        .special-grid{ display:grid; gap:16px; grid-template-columns:repeat(3, minmax(180px,1fr)); justify-items:center; }

        .member-grid{ display:grid; gap:14px; grid-template-columns: repeat(auto-fill, minmax(clamp(120px, 18vw, 160px), 1fr)); }
        .member{ display:grid; justify-items:center; gap:8px; padding:10px; border-radius:12px; background:transparent; }
        .member img{ width:clamp(74px, 8.5vw, 96px); height:clamp(74px, 8.5vw, 96px); border-radius:50%; object-fit:cover; display:block; }
        .member .name{ font-weight:800; font-size:14px; text-align:center; }

        /* ステップフェード（散開→集合は廃止） */
        .leader, .member{ opacity:0; transform: translate3d(0,12px,0) scale(.98); }
        .leader.in, .member.in{ opacity:1; transform: none; transition: opacity .7s ease, transform .7s ease; }
        .member.in{ transition-delay: .1s; }
        .special .in{ transition-delay: .15s; }

        @media (max-width:760px){
          .leaders-grid{ grid-template-columns:1fr; }
          .special-grid{ grid-template-columns:1fr; }
          .member-grid{ grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
        }
      `}</style>
    </main>
  );
}

/* ===== 霧カーテン（画像2層＋フェードアウト） ===== */
function FogCurtain({ show }: { show: boolean }) {
  return (
    <div className={`fog-curtain ${show ? "show" : "hide"}`} aria-hidden>
      <picture>
        <source srcSet={`/portal/fog_soft.webp${Q}`} type="image/webp" />
        <img src={`/portal/fog_soft.png${Q}`} alt="" />
      </picture>
      <picture>
        <source srcSet={`/portal/smoke_light.webp${Q}`} type="image/webp" />
        <img src={`/portal/smoke_light.png${Q}`} alt="" />
      </picture>
      <style jsx>{`
        .fog-curtain{ position:absolute; inset:-6% -4% -2% -4%; width:108%; height:104%; pointer-events:none; }
        .fog-curtain picture{ position:absolute; inset:0; }
        .fog-curtain img{ width:100%; height:100%; object-fit:cover; display:block; }
        .fog-curtain :first-child{ opacity:.92; filter: saturate(.96) brightness(.96); }
        .fog-curtain :last-child{ mix-blend-mode:screen; opacity:.42; animation: fogFloat 18s ease-in-out infinite; }
        .fog-curtain.show{ opacity:1; }
        .fog-curtain.hide{ opacity:0; transition: opacity 1600ms cubic-bezier(.2,.8,.1,1); }
        @keyframes fogFloat { 0%{ transform: translateY(0) } 50%{ transform: translateY(14px) } 100%{ transform: translateY(0) } }
      `}</style>
    </div>
  );
}

/* ===== 紫の常時発光（中心固定） ===== */
function Glow() {
  return (
    <>
      <picture className="glow aura">
        <source srcSet={`/effects/glow_purple.webp${Q}`} type="image/webp" />
        <img src={`/effects/glow_purple.png${Q}`} alt="" />
      </picture>
      <picture className="glow ring">
        <source srcSet={`/effects/glow_ring.webp${Q}`} type="image/webp" />
        <img src={`/effects/glow_ring.png${Q}`} alt="" />
      </picture>

      <style jsx>{`
        .glow{ position:absolute; left:50%; top:50%; translate:-50% -50%; width:min(54vmin, 620px); aspect-ratio:1; pointer-events:none; z-index:1; }
        .glow img{ width:100%; height:100%; object-fit:contain; display:block; mix-blend-mode:screen; }
        .aura{ opacity:.55; filter: blur(.3px); animation: auraPulse 3.8s ease-in-out infinite; }
        .ring{ opacity:.70; filter: blur(.3px); animation: ringPulse 2.4s ease-in-out infinite; }
        @keyframes auraPulse{ 0%,100%{ transform:scale(1); opacity:.52 } 50%{ transform:scale(1.04); opacity:.66 } }
        @keyframes ringPulse{ 0%,100%{ transform:scale(.98) } 50%{ transform:scale(1.03) } }
      `}</style>
    </>
  );
}
