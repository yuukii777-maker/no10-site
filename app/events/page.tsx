/* eslint-disable @next/next/no-img-element */
"use client";

import "./styles.css";
import { useEffect, useRef, useState } from "react";

/* ========== パララックス（mouse / scroll / idle / gyro） ========== */
function useParallax() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layers = Array.from(document.querySelectorAll<HTMLElement>(".storm-bg .layer[data-depth]"));
    if (!layers.length) return;

    const CFG = { mouse: 1.0, scroll: 12, idleAfterMs: 3000, driftSpeed: 0.12, maxPX: 28, maxPY: 18, lerp: 0.06, gyro: 0.6 };

    let tx=0, ty=0, cx=0, cy=0, gyx=0, gyy=0, sy=0, raf=0, idleAt=Date.now();
    const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
    const wake=()=>{ idleAt = Date.now(); };

    const onMove=(e:MouseEvent)=>{ cx=(e.clientX/innerWidth-.5)*2*CFG.mouse+gyx; cy=(e.clientY/innerHeight-.5)*2*CFG.mouse+gyy; wake(); };
    const onScroll=()=>{ sy=(scrollY/innerHeight)*CFG.scroll; wake(); };
    addEventListener("mousemove", onMove);
    addEventListener("scroll", onScroll, {passive:true});

    // gyro（iOSはタップで許可）
    const anyWin = window as any;
    const ask = anyWin.DeviceOrientationEvent?.requestPermission;
    const listenGyro = () => addEventListener("deviceorientation", (ev:DeviceOrientationEvent) => {
      const g=(ev.gamma??0)/45, b=(ev.beta??0)/90; gyx=g*CFG.gyro; gyy=-b*CFG.gyro;
    });
    if (typeof ask==="function") {
      const req=async()=>{ try{ (await ask())==="granted" && listenGyro(); }catch{} document.removeEventListener("click",req); document.removeEventListener("touchstart",req); };
      document.addEventListener("click",req,{once:true}); document.addEventListener("touchstart",req,{once:true,passive:true});
    } else listenGyro();

    const loop=()=>{ 
      if (Date.now()-idleAt>CFG.idleAfterMs){ const t=performance.now()*CFG.driftSpeed*0.001; cx=Math.sin(t*1.3)*0.35+gyx; cy=Math.cos(t*1.1)*0.25+gyy; }
      tx=lerp(tx,cx,CFG.lerp); ty=lerp(ty,cy,CFG.lerp);
      for(const el of layers){ const d=Number(el.dataset.depth||0); const x=(-tx*CFG.maxPX*d).toFixed(2); const y=((ty*CFG.maxPY)*d+sy*d).toFixed(2); el.style.transform=`translate3d(${x}px,${y}px,0)`; }
      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);

    const onVis=()=>{ if(document.hidden) cancelAnimationFrame(raf); else raf=requestAnimationFrame(loop); };
    document.addEventListener("visibilitychange", onVis);
    return ()=>{ cancelAnimationFrame(raf); removeEventListener("mousemove",onMove); removeEventListener("scroll",onScroll); document.removeEventListener("visibilitychange",onVis); };
  }, []);
}

/* ========== BGM（手動トグル） ========== */
function useBGM() {
  const audioRef = useRef<HTMLAudioElement|null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const a = new Audio("/audio/Milky_Way.mp3");
    a.loop = true;
    a.preload = "auto";
    a.volume = 0.18; // 音量は控えめ
    audioRef.current = a;
    return () => { a.pause(); };
  }, []);

  // タブ復帰時に再開（ONのときだけ）
  useEffect(() => {
    const onVis = async () => {
      if (!audioRef.current) return;
      if (!document.hidden && playing) { try { await audioRef.current.play(); } catch {} }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [playing]);

  const toggle = async () => {
    if (!audioRef.current) return;
    try {
      if (playing) { audioRef.current.pause(); setPlaying(false); }
      else { await audioRef.current.play(); setPlaying(true); }
    } catch { /* ブラウザのポリシーで失敗したら次のタップでOK */ }
  };

  return { playing, toggle };
}

/* ========== 稲妻（超極細・控えめ） ========== */
function useLightning() {
  const ref = useRef<HTMLCanvasElement|null>(null);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d", { alpha: true })!;
    // 線が潰れないようにDPRの上限を少し抑える
    const DPR = Math.max(1, Math.min(1.5, devicePixelRatio || 1));

    const CFG = {
      minInterval: 700,     // 出現頻度（大きいほど控えめ）
      maxInterval: 1600,
      fade: 0.055,          // 残光（大きいほどすぐ消える）

      // ★極細設定
      thicknessOuter: 1.2,  // 外グロー
      thicknessInner: 0.35, // 芯
      glowOuter: 3,
      glowInner: 0.8,

      branchChance: 0.45,   // 分岐は少なめ
      branchLenMin: 100,
      branchLenMax: 200,
      branchScale: 0.35,    // 枝はさらに細く

      roughness: 0.60,
      jitterScale: 0.16,    // 蛇行を弱く

      boltsPerBurst: 1,     // 1回に1本
      flashPeak: 0.00,      // 画面フラッシュ無し
      flashDecay: 0.90,
    };

    const resize=()=>{ c.width=innerWidth*DPR; c.height=innerHeight*DPR; c.style.width=innerWidth+"px"; c.style.height=innerHeight+"px"; ctx.setTransform(DPR,0,0,DPR,0,0); };
    resize(); addEventListener("resize", resize);

    const rand=(a:number,b:number)=>a+Math.random()*(b-a);

    const makeBolt=(x1:number,y1:number,x2:number,y2:number)=>{
      const pts=[{x:x1,y:y1},{x:x2,y:y2}];
      let disp=Math.hypot(x2-x1,y2-y1)*0.25;
      while(disp>2){
        const next:{x:number;y:number}[]=[];
        for(let i=0;i<pts.length-1;i++){
          const a=pts[i], b=pts[i+1];
          const mx=(a.x+b.x)/2, my=(a.y+b.y)/2;
          const nx=mx+(b.y-a.y)/Math.hypot(b.x-a.x,b.y-a.y)*(Math.random()-0.5)*disp*CFG.jitterScale;
          const ny=my-(b.x-a.x)/Math.hypot(b.x-a.x,b.y-a.y)*(Math.random()-0.5)*disp*CFG.jitterScale;
          next.push(a,{x:nx,y:ny});
        }
        next.push(pts[pts.length-1]);
        pts.splice(0,pts.length,...next);
        disp*=CFG.roughness;
      }
      return pts;
    };

    // 透明度付き（rgba）でさらに目立ちにくく
    const strokeBolt=(pts:{x:number;y:number}[], A:string, B:string, scale=1)=>{
      ctx.globalCompositeOperation="lighter";
      ctx.lineCap="round";

      ctx.lineWidth=CFG.thicknessOuter*scale;
      ctx.strokeStyle=A;
      ctx.shadowBlur=CFG.glowOuter*scale;
      ctx.shadowColor=A;
      ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y); for(const p of pts.slice(1)) ctx.lineTo(p.x,p.y); ctx.stroke();

      ctx.lineWidth=CFG.thicknessInner*scale;
      ctx.shadowBlur=CFG.glowInner*scale;
      ctx.strokeStyle=B;
      ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y); for(const p of pts.slice(1)) ctx.lineTo(p.x,p.y); ctx.stroke();
    };

    let raf=0, timer=0;
    const loop=(t:number)=>{
      raf=requestAnimationFrame(loop);

      // 残光フェード（すぐ消える）
      ctx.fillStyle=`rgba(0,0,0,${CFG.fade})`;
      ctx.globalCompositeOperation="destination-out";
      ctx.fillRect(0,0,innerWidth,innerHeight);
      ctx.globalCompositeOperation="source-over";

      if(t-timer>rand(CFG.minInterval,CFG.maxInterval)){
        timer=t;
        for(let i=0;i<CFG.boltsPerBurst;i++){
          const x=innerWidth*0.5+rand(-30,30);
          const y=innerHeight*0.28+rand(-20,20);
          const tx=innerWidth*0.5+rand(-180,180);
          const ty=innerHeight*0.75+rand(-20,30);
          const main=makeBolt(x,y,tx,ty);

          // 外は淡いシアン、芯は半透明の白
          const A="rgba(143,239,255,0.45)";
          const B="rgba(255,255,255,0.65)";
          strokeBolt(main,A,B,1);

          if(Math.random()<CFG.branchChance){
            const pivot=main[Math.floor(main.length*rand(0.35,0.75))];
            const side=makeBolt(
              pivot.x,pivot.y,
              pivot.x+rand(-CFG.branchLenMax,CFG.branchLenMax),
              pivot.y+rand(CFG.branchLenMin,CFG.branchLenMax)
            );
            strokeBolt(side,A,B,CFG.branchScale);
          }
        }
      }
    };
    raf=requestAnimationFrame(loop);

    return ()=>{ cancelAnimationFrame(raf); removeEventListener("resize", resize); };
  }, []);

  return ref;
}

/* ===================== ページ本体 ===================== */
type Ev = { date: string; href: string; title: string };
const EVENTS: Ev[] = [
  { date: "2025.09.01", href: "https://example.com/ev1", title: "自由参加型 抽選イベント開催！" },
  { date: "2025.09.01", href: "https://example.com/ev2", title: "イベント募集中" },
  { date: "2025.09.01", href: "https://example.com/ev3", title: "イベント募集中" },
  { date: "2025.09.01", href: "https://example.com/ev4", title: "イベント募集中" },
];

export default function EventsPage() {
  useParallax();
  const boltCanvas = useLightning();
  const { playing, toggle } = useBGM();

  return (
    <>
      {/* ==== 背景（Stormgate） ==== */}
      <div className="storm-bg" aria-hidden="true">
        <div className="layer base"><img className="anim" src="/event/bg_event_sky_dark.png" alt="" loading="eager" fetchPriority="high"/></div>
        <div className="layer far" data-depth="0.06" style={{opacity:.32}}><img className="anim cloud-far" src="/event/cloud_bank_far.png" alt=""/></div>
        <div className="layer gate" data-depth="0.10" style={{opacity:.9}}><img className="anim ring-pulse" src="/event/arc_gate.png" alt=""/></div>
        <div className="layer rain" data-depth="0.18" style={{opacity:.30}}><img className="anim rain-flow" src="/event/rain_haze.png" alt=""/></div>
        {/* 稲妻（Canvasのみ。PNGの稲妻は外して“控えめ”に） */}
        <canvas ref={boltCanvas} className="bolt-canvas" />
      </div>

      {/* ==== BGMトグル ==== */}
      <button className="audio-toggle" onClick={toggle} aria-pressed={playing} aria-label="BGM toggle">
        <span className="dot" data-on={playing ? "1" : "0"} />
        <span className="label">{playing ? "BGM ON" : "BGM OFF"}</span>
      </button>

      {/* ==== コンテンツ ==== */}
      <main className="ev-page">
        <section className="card">
          <h1 className="brand cutline">VOLCE — イベントページ</h1>
          <p className="muted">個人イベントも開催可能、詳しくはエントリーボタンから。</p>
          <a className="btn" href="/entry">エントリーする</a>
        </section>

        <section className="ev-wrap">
          <ul className="ev-list">
            {EVENTS.map((ev, i) => (
              <li className="ev-item" key={i}>
                <time className="ev-date" dateTime={ev.date.replace(/\./g,"-")}>{ev.date}</time>
                <a className="ev-link" href={ev.href} target="_blank" rel="noopener noreferrer">
                  <span className="ev-text">{ev.title}</span>
                  <i className="ev-band" aria-hidden="true" />
                  <i className="ev-arrow" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
