'use client';

import { useEffect, useRef, useState } from 'react';

export default function Page() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false); // 初回操作で音を鳴らす
  const audioRef = useRef<HTMLAudioElement>(null);

  // 画像パス（ファイル名を変えてもここを書き換えるだけ）
  const IMG = {
    sky:  '/background.png',
    far:  '/cloud_far.png',
    mid:  '/cloud_mid.png',
    near: '/cloud_near.png',
    rays: '/rays.png'
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

  // 最初のユーザー操作で音楽スタート（スクロール・クリック・タップいずれか）
  useEffect(() => {
    if (armed) return;
    const kick = () => {
      if (audioRef.current && !armed) {
        audioRef.current.play().catch(() => {/* ブラウザ制限で無音でもOK */});
        setArmed(true);
      }
      window.removeEventListener('scroll', kick);
      window.removeEventListener('pointerdown', kick);
      window.removeEventListener('keydown', kick);
    };
    window.addEventListener('scroll', kick, { once:true });
    window.addEventListener('pointerdown', kick, { once:true });
    window.addEventListener('keydown', kick, { once:true });
    return () => {
      window.removeEventListener('scroll', kick);
      window.removeEventListener('pointerdown', kick);
      window.removeEventListener('keydown', kick);
    };
  }, [armed]);

  return (
    <main ref={rootRef}>
      {/* ===== ヒーロー（文字は出さず、スクロールで下から出てくる） ===== */}
      <section className="parallax" aria-label="Hero">
        <div data-layer="sky"  style={{ backgroundImage:`url(${IMG.sky})` }} />
        <div data-layer="far"  style={{ backgroundImage:`url(${IMG.far})` }} />
        <div data-layer="mid"  style={{ backgroundImage:`url(${IMG.mid})` }} />
        <div data-layer="near" style={{ backgroundImage:`url(${IMG.near})` }} />
        <div data-layer="rays" style={{ backgroundImage:`url(${IMG.rays})` }} />
        <div className="hero-center">
          {/* ここにロゴ／島のSVGや画像があるなら配置 */}
          {/* <img src="/island.png" alt="" style={{ width:'min(56vw,780px)' }} /> */}
        </div>

        {/* 非表示のオーディオ（/public/audio/ に mp3 を置く） */}
        <audio ref={audioRef} src="/audio/megami.mp3" preload="auto" />
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

      {/* ===== セクション構成（短く、雲カードで可読性UP） ===== */}
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

      {/* ===== ビジュアル指針（必要なら画像/アイコンを後で差す） ===== */}
      <section className="section" id="visuals">
        <div className="cloud-card reveal">
          <h2>ビジュアル</h2>
          <p>火力＝稲妻/炎　エンジョイ＝明るい光　クリエイター/ライバー＝発光エフェクトと配信感。多様性をひとつの光で束ねる。</p>
        </div>
      </section>
    </main>
  );
}
