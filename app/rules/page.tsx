// app/rules/page.tsx
"use client";

import { useEffect } from "react";
import { BIZ_UDPGothic, Noto_Sans_JP } from "next/font/google";

// フォント（見出し：BIZ UDPGothic / 予備：Noto Sans JP）
const biz = BIZ_UDPGothic({ weight: ["700"], subsets: ["latin"], display: "swap" });
const noto = Noto_Sans_JP({ weight: ["400", "700"], subsets: ["latin"], display: "swap" });

// 背景（固定）＆ ロゴ（安定回転）※SSRで即描画させる
import Stage3D from "./Stage3DFrozen";
import LogoSpin from "./LogoSpinStable";

export default function RulePage() {
  // 省動作
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.classList.toggle("reduced", reduce);
  }, []);

  // スクロール・リビール
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => { for (const e of entries) if (e.isIntersecting) e.target.classList.add("in"); },
      { threshold: 0.16 }
    );
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="wrap" id="rules">
      <Stage3D />
      <LogoSpin />
      {/* 背景上部のボケ文字を覆って“消す”帯 */}
      <div className="hero-scrim" aria-hidden="true" />

      <main className="content">
        {/* 見出し：クランルール */}
        <header className="hero reveal" data-reveal>
          <h1 className={`${biz.className} title`}>ルール</h1>
          <p className={`${noto.className} tagline`}>秩序を守り、仲間と共に楽しむために。</p>
        </header>

        {/* 禁止事項 */}
        <section className="card card-strong reveal" data-reveal>
          <h2>禁止事項</h2>
          <ul>
            <li><strong>煽り行為の禁止：</strong> 挑発・死体撃ち・煽りエモート等を含む。</li>
            <li><strong>暴言の禁止：</strong> ゲーム内VC・個チャ・SNS すべて対象。</li>
            <li><strong>不正・代行の禁止：</strong> アカウント共有・チート・外部ツールの利用。</li>
            <li><strong>なりすまし／晒し行為の禁止：</strong> メンバーの安全と信頼を最優先。</li>
          </ul>
          <p className="note">重大な違反は即時処分の可能性があります。</p>
        </section>

        {/* 2カラム */}
        <section className="grid">
          <div className="card reveal" data-reveal>
            <h3>参加条件（一例）</h3>
            <ul>
              <li>活動基準（活動値・精鋭・行動規範）を満たすこと。</li>
              <li>必要な手続き（改名等）に応じられること。</li>
              <li>X / TikTok / Discord など連絡手段の整備。</li>
            </ul>
          </div>
          <div className="card reveal" data-reveal>
            <h3>運営ポリシー</h3>
            <ul>
              <li>ルールは予告なく変更される場合があります。</li>
              <li>公平性と安全性を最優先に運営します。</li>
              <li>お問い合わせは公式Xへ。</li>
            </ul>
          </div>
        </section>

        {/* 注記 */}
        <aside className="aside reveal" data-reveal>
          <p>※本ページの規定は、コミュニティの秩序・安全・公平性の維持を目的としています。</p>
        </aside>

        <footer className="foot">
          <small>© VOLCE — Rules Page</small>
        </footer>
      </main>

      {/* ====== STYLES ====== */}
      <style jsx global>{`
        :root{
          --bg:#0a0e15; --ink:#e9edf3; --muted:#a9b0bb;
          --accent:#c9a86a;
          --panel:rgba(10,14,21,.80);
          --stroke:rgba(201,168,106,.45);
          --shadow:0 22px 60px rgba(0,0,0,.46);
        }
        html,body,#__next{height:100%}
        body{margin:0;background:var(--bg);color:var(--ink);
             -webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
        *{box-sizing:border-box}

        .wrap{min-height:100vh; position:relative; overflow-x:hidden}
        .content{position:relative; z-index:10; width:min(1120px,92vw); margin:0 auto; padding:96px 0 120px; isolation:isolate;}

        /* 上部のボケ背景を覆って非表示にする帯（背景<8<ロゴ<9<本文10） */
        .hero-scrim{
          position:fixed; top:0; left:0; right:0; height:40vh;
          z-index:8; pointer-events:none;
          background: linear-gradient(to bottom,
              rgba(10,14,21,0.95) 0%,
              rgba(10,14,21,0.78) 55%,
              rgba(10,14,21,0.00) 100%);
        }
        @media (max-width:960px){ .hero-scrim{ height:46vh } }

        /* 見出し（フォント：BIZ UDPGothic） */
        .hero{text-align:center; margin:18px 0 24px; position:relative; z-index:12;}
        .title{
          margin:0 0 10px;
          font-size:clamp(34px,3.6vw,56px);
          letter-spacing:.10em; font-weight:700; line-height:1.1;
          color:#e9edf3;
          -webkit-text-stroke:.35px rgba(0,0,0,.35);
          text-shadow:0 1px 2px rgba(0,0,0,.35);
          font-feature-settings:"palt" 1, "kern" 1;
        }
        .tagline{color:var(--muted); margin:0; font-size:clamp(13px,1.2vw,15px)}

        /* === カード：背景だけ薄くブラー（文字はクッキリのまま） === */
        .card{
          background: rgba(10,14,21,.5);
          backdrop-filter: blur(3px) saturate(1.05);
          -webkit-backdrop-filter: blur(3px) saturate(1.05);
          border:1px solid var(--stroke); border-radius:20px;
          padding:28px; box-shadow:var(--shadow); position:relative; overflow:hidden;
        }
        .card:before{ display:none; }
        .card *, .card{ filter:none !important; -webkit-filter:none !important; text-shadow:none; }

        .card-strong{border-color:rgba(201,168,106,.65); box-shadow:0 30px 80px rgba(0,0,0,.55)}
        .card h2,.card h3{margin:0 0 12px; letter-spacing:.08em}
        .card h2{font-size:clamp(20px,2.1vw,28px)}
        .card h3{font-size:clamp(18px,1.8vw,22px)}
        ul{margin:0; padding-left:1.15em; line-height:1.9}
        .note{color:#ffb7b7; margin-top:10px}

        .grid{display:grid; gap:24px; grid-template-columns:1fr 1fr; margin-top:18px}
        @media (max-width:960px){ .grid{ grid-template-columns:1fr } }

        .aside{color:var(--muted); margin-top:22px; font-size:clamp(12px,1vw,14px); padding-left:4px}
        .foot{margin-top:48px; text-align:center; color:var(--muted)}

        /* リビール後にtransformを残さない＝滲み防止 */
        .reveal{opacity:0; transform: translate3d(0,16px,0);
          transition: opacity .9s cubic-bezier(.22,1,.36,1),
                      transform .9s cubic-bezier(.22,1,.36,1); }
        .reveal.in{opacity:1; transform:none;}

        /* 背景効果（本文より下のレイヤー） */
        .wrap:after{
          content:""; position:fixed; inset:-40px; pointer-events:none; z-index:5;
          background:
            radial-gradient(80% 60% at 50% 0%, transparent 45%, rgba(0,0,0,.22) 100%),
            radial-gradient(110% 90% at 50% 100%, transparent 40%, rgba(0,0,0,.28) 100%);
          mix-blend-mode:multiply;
        }
        .wrap:before{
          content:""; position:fixed; inset:0; pointer-events:none; z-index:6;
          background-image: repeating-linear-gradient(0deg, rgba(255,255,255,.015) 0, rgba(255,255,255,.015) 1px, transparent 1px, transparent 2px);
          opacity:.25;
        }

        /* ヒーローは絶対にボカさない（保険も含めて全解除） */
        .hero, .hero *{
          filter:none !important;
          backdrop-filter:none !important;
          -webkit-backdrop-filter:none !important;
          mix-blend-mode:normal !important;
          transform:none !important;
        }

        html.reduced .reveal{transition:none; opacity:1; transform:none}
      `}</style>
    </div>
  );
}
