/* eslint-disable @next/next/no-img-element */
// app/teams/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

/* =========================================
   データ
   - 幹部：団長(=代表)・副団長のみ
   - 主力：Loz / Killer / Jun の3名
   - それ以外はメンバー
========================================= */
type Person = {
  id: string;       // Google Drive thumbnail id
  name: string;
  role?: string;    // 表示用バッジ（例：団長 / 副団長）
};

type CategoryKey = "leader" | "core" | "creator" | "liver" | "member";

const drive = (id: string, w = 512) =>
  `https://drive.google.com/thumbnail?id=${id}&sz=w${w}`;

const leaders: Person[] = [
  { id: "1GjhePWk7knqKjAI8CjpSqujXKxw8Hbg1", name: "VolceSharGOD", role: "団長" },     // 代表=団長
  { id: "15Lmehli_MZTEQG7IZ-vcz15KLth-rsOx", name: "VolceReyGOD",  role: "副団長" },   // 副団長
];

const core: Person[] = [
  { id: "1S8MKLZEhekE25zmlMOlGDIWlrz4IC9RN", name: "VolceLozGOD"  },
  { id: "10f0Sy9lPfavOMc0BKbvqsder7Q8m9JmE", name: "VolceKillerGOD" },
  { id: "1LNgsTIc5WBYbFp2bydpLO4_sJmDyc3Td", name: "VolceJunGOD"  },
];

const others: Person[] = [
  // 幹部に含めなかった副代表 Ten はメンバーに
  { id: "14Y9U97vFVNkzS81F9qotCfpq3DgjCcSL", name: "VolceTenGOD" },
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

/* いまは Creator / Liver の個別データが未定なので空配列。
   追加が決まったらここに push すればOK。 */
const creators: Person[] = [];
const livers: Person[] = [];

/* =========================================
   タブ（黒×金・角丸なしの長方形）
========================================= */
const TABS: { key: CategoryKey; label: string }[] = [
  { key: "leader",  label: "幹部" },
  { key: "core",    label: "主力" },
  { key: "creator", label: "クリエイター" },
  { key: "liver",   label: "ライバー" },
  { key: "member",  label: "メンバー" },
];

/* =========================================
   ページ本体
========================================= */
export default function TeamsPage() {
  // 初期タブ：幹部
  const [tab, setTab] = useState<CategoryKey>("leader");

  // タブ選択ごとの表示配列
  const items = useMemo(() => {
    switch (tab) {
      case "leader":  return leaders;
      case "core":    return core;
      case "creator": return creators;
      case "liver":   return livers;
      case "member":  return others;
    }
  }, [tab]);

  // iOS の 100vh 問題対策（任意）
  useEffect(() => {
    const set = () =>
      document.documentElement.style.setProperty(
        "--vh",
        String((window.innerHeight || 800) * 0.01) + "px"
      );
    set();
    addEventListener("resize", set, { passive: true });
    addEventListener("orientationchange", set, { passive: true });
    return () => {
      removeEventListener("resize", set);
      removeEventListener("orientationchange", set);
    };
  }, []);

  return (
    <main className="teams-wrap">
      {/* 背景：金のフレア（最背面）＋ 右下の大ロゴ（フォールバック込み） */}
      <div className="bg" aria-hidden />

      {/* 見出し */}
      <header className="hero">
        <h1>Volceクラン</h1>
      </header>

      {/* タブ（中央寄せ・黒金） */}
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

      {/* メンバー一覧（中央寄せ・薄枠は削除） */}
      <section className="grid" aria-live="polite">
        {items.map((p, i) => (
          <figure className="tile" key={`${p.id}-${p.name}-${i}`}>
            <div className="avatar">
              <img
                loading="lazy"
                referrerPolicy="no-referrer"
                src={drive(p.id, 512)}
                alt={p.name}
              />
              {!!p.role && <span className="badge">{p.role}</span>}
            </div>
            <figcaption className="name">{p.name}</figcaption>
          </figure>
        ))}
        {/* データがないカテゴリのときの空表示 */}
        {!items.length && (
          <div className="empty">準備中です</div>
        )}
      </section>

      {/* スタイル（このページ専用） */}
      <style jsx>{`
        :root{
          --ink:#e9edf3;
          --muted:#a9b0bb;
          --gold-1:#fff6cc;
          --gold-2:#ffe39c;
          --gold-3:#caa45a;
          --panel:rgba(8,12,20,.72);
        }
        .teams-wrap{
          min-height: calc(var(--vh, 1vh) * 100);
          position: relative;
          color: var(--ink);
          overflow-x: hidden;
        }

        /* ===== 背景 ===== */
        .bg{
          position: fixed; inset: 0; z-index: -1; pointer-events:none;
          /* 1枚目：右下の大ロゴ（フォールバック2経路）
             2枚目：金フレア（/teams → /effects の順にフォールバック）
             最背面：濃い黒グラデーション */
          background:
            url("/teams/volce-logo-3d.webp") bottom right/52vmin auto no-repeat,
            url("/RULE/volce-logo-3d.png") bottom right/52vmin auto no-repeat,
            url("/teams/bg_goldflare.webp") center/cover no-repeat,
            url("/effects/bg_goldflare.webp") center/cover no-repeat,
            radial-gradient(1200px 800px at 110% 100%, rgba(255,255,255,.06), transparent 60%),
            linear-gradient(#0b0f17, #0b0f17);
          /* 右下ロゴはほんの少し傾ける */
          transform-origin: 100% 100%;
          transform: rotate(-6deg);
          opacity: 0.98;
        }

        /* ===== 見出し：ナビに埋もれないよう下げる ===== */
        .hero{
          display:grid; place-items:center;
          padding: clamp(84px, 12vh, 140px) 16px 10px;
          text-align:center;
        }
        .hero h1{
          margin:0;
          letter-spacing:.08em;
          font-weight:900;
          font-size: clamp(24px, 4.8vw, 40px);
          background: linear-gradient(90deg, var(--gold-1), var(--gold-2) 40%, var(--gold-3) 100%);
          -webkit-background-clip:text; background-clip:text; color:transparent;
          text-shadow: 0 0 20px rgba(255,230,150,.05);
        }

        /* ===== タブ：黒金の長方形（中央揃え） ===== */
        .tabs{ display:grid; place-items:center; padding: 6px 0 18px; }
        .tabs-inner{
          display:flex; gap: 10px; padding: 8px;
          border:1px solid rgba(255,255,255,.12);
          background: rgba(10,14,21,.55);
          border-radius: 14px;
          backdrop-filter: blur(6px);
        }
        .tab{
          appearance:none; border:0; cursor:pointer;
          padding: 12px 22px; border-radius: 8px; /* 角丸は最小限（＝ほぼ長方形） */
          color:#d7deeb; font-weight:900; letter-spacing:.04em;
          background: linear-gradient(180deg, rgba(20,24,34,.9), rgba(14,18,28,.9));
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

        /* ===== グリッド ===== */
        .grid{
          width: min(1180px, 92vw);
          margin: 10px auto 80px;
          display: grid;
          justify-items: center;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 28px 28px;
        }

        /* ===== 各タイル（薄枠は無し） ===== */
        .tile{
          display:grid; gap: 10px; justify-items:center; text-align:center;
          padding: 10px;
          /* 枠やカード感は消す。ホバーでほんの少しだけ光らせる */
          border: 0; background: transparent; box-shadow:none;
        }
        .avatar{
          position:relative; width: 200px; height: 200px;
          display:grid; place-items:center;
          border-radius: 50%;
          transition: filter .2s ease, transform .2s ease;
        }
        .avatar img{
          width: 100%; height: 100%; object-fit: cover; border-radius: 50%;
          display:block;
          filter: drop-shadow(0 12px 24px rgba(0,0,0,.45));
        }
        .tile:hover .avatar{ transform: translateY(-2px) }
        .tile:hover .avatar img{
          filter: drop-shadow(0 14px 28px rgba(0,0,0,.5)) drop-shadow(0 0 28px rgba(255,215,120,.15));
        }
        .badge{
          position:absolute; right: 8px; top: 8px;
          font-size: 12px; font-weight: 900; letter-spacing: .04em;
          padding: 4px 10px; border-radius: 999px;
          color:#1a1a1a;
          background: linear-gradient(180deg, #ffe887, #f2d64e);
          box-shadow: 0 6px 16px rgba(0,0,0,.35);
        }
        .name{
          font-weight: 800; letter-spacing:.02em;
          text-align:center; font-size: 14px;
          text-shadow: 0 1px 2px rgba(0,0,0,.3);
        }

        .empty{
          grid-column: 1 / -1;
          opacity:.76; color: var(--muted);
          padding: 40px 0; font-weight: 800;
        }

        @media (max-width: 760px){
          .avatar{ width: 160px; height: 160px; }
          .tabs-inner{ gap:8px; }
          .tab{ padding: 10px 14px; }
        }
      `}</style>
    </main>
  );
}
