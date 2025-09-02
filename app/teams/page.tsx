/* eslint-disable @next/next/no-img-element */
"use client";
import { useMemo, useState } from "react";

/** === 調整値（数字だけ変えればOK） === */
const UI = {
  AVATAR_PX: 200,            // 丸ロゴの直径
  GRID_GAP: 34,              // カード間
  HALO_STRENGTH: 1.25,       // 金フェードの強さ（1.0〜1.6くらい）
  HALO_WIDTH_PX: 22,         // 縁の幅（px）
  HALO_OPACITY: 0.95,        // 金フェードの最大不透明度
  MARK_SCALE: 1.18,          // 右下VGスケール
  MARK_OPACITY: 0.22,        // 右下VGの薄さ
} as const;

/* データ */
type Person = { id: string; name: string; badge?: string };
const drive = (id: string, w = 700) =>
  `https://drive.google.com/thumbnail?id=${id.replace("__ZEO","")}&sz=w${w}`;

type Tab = "幹部" | "主力" | "クリエイター" | "ライバー" | "メンバー";
const TABS: Tab[] = ["幹部", "主力", "クリエイター", "ライバー", "メンバー"];

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
  { id: "1GGBvKxCCMzX78HMw2uGnzs9F0i3PkFtm__ZEO", name: "VolceZeoGOD" },
];

export default function TeamsPage() {
  const [tab, setTab] = useState<Tab>("幹部");
  const list = useMemo(() => {
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
          ["--avatar" as any]: `${UI.AVATAR_PX}px`,
          ["--gap" as any]: `${UI.GRID_GAP}px`,
          ["--haloStrength" as any]: UI.HALO_STRENGTH,
          ["--haloWidth" as any]: `${UI.HALO_WIDTH_PX}px`,
          ["--haloOpacity" as any]: UI.HALO_OPACITY,
          ["--markScale" as any]: UI.MARK_SCALE,
          ["--markOpacity" as any]: UI.MARK_OPACITY,
        } as React.CSSProperties
      }
    >
      <div className="bg" aria-hidden />

      <header className="titleWrap"><h1>Volceクラン</h1></header>

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

      <section className="grid">
        {list.length === 0 && <p className="empty">準備中です。</p>}
        {list.map((p, i) => (
          <figure className="memberCard" key={`${p.id}-${i}`}>
            <div className="avatarWrap">
              <img className="avatar" src={drive(p.id)} alt="" loading="lazy" referrerPolicy="no-referrer" />
              {/* 縁全周 金フェード（強さ/幅/不透明度は上の定数で変更可） */}
              <span className="halo" aria-hidden />
              {!!p.badge && <span className="badge">{p.badge}</span>}
            </div>
            <figcaption className="name">{p.name}</figcaption>
          </figure>
        ))}
      </section>

      <style jsx>{`
        :root{
          --gold-1:#ffe7a6; --gold-2:#e8c872; --gold-3:#b68a40;
          --ink:#e9eef6; --muted:#aab3c2; --bg:#0b0f16;
        }
        #teamsPage{
          position:relative; min-height:100vh; padding:88px 22px 140px;
          color:var(--ink); overflow:hidden; isolation:isolate;
        }

        /* 背景：黒 + 金アクセント + 右下VG（webp→pngフォールバック） */
        .bg{
          position:fixed; inset:0; z-index:0; pointer-events:none;
          background:
            radial-gradient(1400px 700px at 50% -10%, rgba(255,214,120,.10), transparent 60%),
            radial-gradient(1000px 600px at 90% 90%, rgba(255,214,120,.10), transparent 70%),
            linear-gradient(#0a0f18, #0a0f18);
        }
        .bg::after{
          content:""; position:fixed; right:-6vw; bottom:-6vh; width:52vw; aspect-ratio:1;
          background:
            image-set(
              url("/teams/volce-logo-3d.webp") type("image/webp"),
              url("/RULE/volce-logo-3d.png") type("image/png")
            ) right bottom / contain no-repeat;
          opacity:var(--markOpacity,.22);
          transform: scale(var(--markScale,1.18));
          filter:contrast(1.05) brightness(.95);
        }
        .bg::before{
          content:""; position:fixed; inset:0; mix-blend-mode:screen; pointer-events:none;
          background:
            conic-gradient(from 0deg at 10% -10%, rgba(255,200,120,.35), transparent 12% 100%),
            conic-gradient(from 180deg at 110% 110%, rgba(255,200,120,.25), transparent 12% 100%);
          opacity:.35; filter:blur(1px);
        }

        .titleWrap{ display:grid; place-items:center; margin: 0 0 12px; }
        .titleWrap h1{ margin:0; font-weight:900; letter-spacing:.16em; font-size: clamp(18px, 2vw, 22px); }

        /* タブ（バーは透明、ボタンのみ黒金） */
        .tabs{
          display:flex; justify-content:center; gap:12px; flex-wrap:wrap;
          margin:10px auto 26px; padding:0; width:min(920px, 92vw);
          background:transparent; border:none; box-shadow:none;
        }
        .tab{
          appearance:none; cursor:pointer; border:1px solid rgba(255,255,255,.14);
          background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(0,0,0,.12));
          color:var(--ink); font-weight:900; letter-spacing:.06em;
          padding:10px 22px; border-radius:10px;
          box-shadow:0 4px 12px rgba(0,0,0,.28), 0 0 0 1px rgba(255,255,255,.04) inset;
          transition: filter .12s ease, transform .06s ease, border-color .12s ease;
        }
        .tab:hover{ filter:brightness(1.06) }
        .tab:active{ transform: translateY(1px) }
        .tab.active{
          background: linear-gradient(180deg, var(--gold-1), var(--gold-2));
          color:#1a1a1a; border-color: color-mix(in oklab, var(--gold-2) 70%, #000);
          box-shadow:0 10px 28px rgba(0,0,0,.35), 0 0 0 1px rgba(0,0,0,.12) inset;
        }

        .grid{
          display:grid; justify-content:center;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: var(--gap);
          width:min(1200px, 94vw); margin:0 auto;
        }
        .empty{ color:var(--muted); text-align:center; grid-column:1/-1; }

        /* 枠・影などは完全無効化 */
        .memberCard{
          display:grid; justify-items:center; gap:10px;
          background:none !important; border:none !important; box-shadow:none !important;
          padding:0; border-radius:0;
        }

        .avatarWrap{ position:relative; width:var(--avatar); height:var(--avatar); }
        .avatar{
          width:100%; height:100%; object-fit:cover; display:block; border-radius:50%;
          box-shadow:0 10px 28px rgba(0,0,0,.45);
          background: radial-gradient(60% 60% at 50% 45%, rgba(255,255,255,.06), rgba(255,255,255,0) 72%), rgba(16,22,38,.12);
          position:relative; z-index:1;
        }

        /* === 金フェード：縁全周 ===
           - --haloStrength: 明るさ（1.0〜1.6）
           - --haloWidth   : 縁の太さ（px）
           - --haloOpacity : 最大不透明度
        */
        .halo{
          position:absolute; inset:-10%; border-radius:50%; pointer-events:none; z-index:2;
          /* 内側をくり抜いた同心円のグローを2段重ね */
          -webkit-mask:
            radial-gradient(circle, transparent calc(50% - var(--haloWidth)), #000 calc(50% - var(--haloWidth) + 1px));
                  mask:
            radial-gradient(circle, transparent calc(50% - var(--haloWidth)), #000 calc(50% - var(--haloWidth) + 1px));
          background:
            radial-gradient(closest-side, rgba(255,220,150, calc(.70 * var(--haloOpacity))), rgba(255,220,150,0) 72%);
          filter:
            blur(6px)
            brightness(calc(1 * var(--haloStrength)));
          opacity: var(--haloOpacity);
          animation: haloPulse 2.8s ease-in-out infinite;
        }
        @keyframes haloPulse{
          0%{ opacity: calc(.72 * var(--haloOpacity)); filter: blur(6px) brightness(calc(.95 * var(--haloStrength))); }
          50%{ opacity: var(--haloOpacity);          filter: blur(4px) brightness(calc(1.15 * var(--haloStrength))); }
          100%{ opacity: calc(.72 * var(--haloOpacity)); filter: blur(6px) brightness(calc(.95 * var(--haloStrength))); }
        }

        .badge{
          position:absolute; top:6px; right:10px;
          font-size:12px; font-weight:900; letter-spacing:.06em;
          color:#1a1a1a; padding:4px 10px; border-radius:999px;
          background: linear-gradient(180deg, var(--gold-1), var(--gold-2));
          border:1px solid var(--gold-3);
          box-shadow:0 6px 16px rgba(0,0,0,.35); z-index:3;
        }
        .name{ font-weight:800; text-align:center; letter-spacing:.02em; }
      `}</style>
    </main>
  );
}
