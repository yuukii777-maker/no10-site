'use client';

import { useEffect, useRef } from 'react';
import AudioController from './components/AudioController';

export default function Page() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  // 画像パス（必要ならここだけ差し替え）
  const IMG = {
    sky:  '/background.png',
    far:  '/cloud_far.png',
    mid:  '/cloud_mid.png',
    near: '/cloud_near.png',
    rays: '/rays.png',
  };

  // スクロール/表示トリガー
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('is-visible')),
      { threshold: 0.15 }
    );
    rootRef.current?.querySelectorAll('.reveal').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <main ref={rootRef}>
      {/* ===== ヒーロー ===== */}
      <section className="parallax" aria-label="Hero">
        <div data-layer="sky"  style={{ backgroundImage:`url(${IMG.sky})` }} />
        <div data-layer="far"  style={{ backgroundImage:`url(${IMG.far})` }} />
        <div data-layer="mid"  style={{ backgroundImage:`url(${IMG.mid})` }} />
        <div data-layer="near" style={{ backgroundImage:`url(${IMG.near})` }} />
        <div data-layer="rays" style={{ backgroundImage:`url(${IMG.rays})` }} />
        <div className="hero-center">{/* ロゴ等あればここ */}</div>
      </section>

      {/* ===== ステートメント ===== */}
      <section className="section" id="about">
        <div className="cloud-card reveal">
          <h1 style={{fontSize:'36px'}}>VOLCE — 荒野行動を、もう一度熱く</h1>
          <p className="lead">ゲリラやイベントで戦うだけじゃない。火力・エンジョイ・クリエイター・ライバーが、それぞれの強みで集うクラン。</p>
        </div>

        <div className="cloud-card reveal delay-1" style={{marginTop:'32px'}}>
          <h2>宣言</h2>
          <p>戦いも、遊びも、発信も。すべてで荒野を盛り上げる。</p>
        </div>

        <div className="cloud-card reveal delay-2" style={{marginTop:'32px'}}>
          <h2>紹介</h2>
          <p>VOLCEは、ゲリラと公式イベントを軸に「プレイヤーの熱狂」を取り戻すクラン。火力は勝利を狙い、エンジョイは楽しく活動、クリエイター/ライバーは配信と発信で拡げる。多様な力を一つに束ねるのが私たちのやり方。</p>
        </div>
      </section>

      {/* ===== セクション構成 ===== */}
      <section className="section" id="sections">
        <div className="cloud-card reveal">
          <h2>コンテンツ</h2>
          <p>イベント — 定期ゲリラ/特別企画</p>
          <p>ルール — 方針と参加条件</p>
          <p>注意事項 — 参加前に知ること</p>
          <p>メンバー — 火力/エンジョイ/クリエイター/ライバー</p>
          <p>タイムライン — 日々の活動と成果</p>
          <p>申請 — 参加フォーム</p>
        </div>
      </section>

      {/* ===== ビジュアル指針 ===== */}
      <section className="section" id="visuals">
        <div className="cloud-card reveal">
          <h2>ビジュアル</h2>
          <p>火力＝稲妻/炎　エンジョイ＝明るい光　クリエイター/ライバー＝発光エフェクトと配信感。多様性をひとつの光で束ねる。</p>
        </div>
      </section>

      {/* 無表示BGM：初回タップ/クリックでフェードイン再生（プリロード無し） */}
      <AudioController src="/audio/megami.mp3" volume={0.55} startOnFirstInput />

      {/* 必要最小の補助スタイル（既存CSSがあればそちらが優先） */}
      <style jsx>{`
        .parallax{position:relative; min-height:min(100svh,100dvh); overflow:hidden}
        .parallax [data-layer]{position:absolute; inset:0; background-size:cover; background-position:center; pointer-events:none}
        .parallax [data-layer="sky"]{z-index:0}
        .parallax [data-layer="far"]{z-index:1}
        .parallax [data-layer="mid"]{z-index:2}
        .parallax [data-layer="near"]{z-index:3}
        .parallax [data-layer="rays"]{z-index:4; mix-blend-mode:screen; opacity:.55}

        .hero-center{position:absolute; inset:0; display:grid; place-items:center; z-index:5}

        .section{padding:40px 16px}
        .cloud-card{
          background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.12);
          border-radius:14px; padding:18px;
          -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
        }

        .reveal{opacity:0; transform:translateY(10px); transition:opacity .6s ease, transform .6s ease}
        .reveal.is-visible{opacity:1; transform:translateY(0)}
        .reveal.delay-1{transition-delay:.08s}
        .reveal.delay-2{transition-delay:.16s}
      `}</style>
    </main>
  );
}
