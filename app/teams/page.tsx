/* eslint-disable @next/next/no-img-element */
// app/teams/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";

/* ===============================
   強化パララックス（mouse/scroll/idle/gyro）
   ※ 背景ラップ(.celestial-bg)は回転させない＝素材だけ動く
================================= */
function useParallaxStrong() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const layers = Array.from(
      document.querySelectorAll<HTMLElement>(".celestial-bg .layer[data-depth]")
    );
    if (!layers.length) return;

    const CFG = {
      mouse: 1.0,
      scroll: 16,
      maxPX: 46,
      maxPY: 28,
      lerp: 0.06,
      idleAfterMs: 2400,
      driftSpeed: 0.15,
      gyro: 0.7,
    };

    let tx = 0, ty = 0, cx = 0, cy = 0, sy = 0, gyx = 0, gyy = 0, raf = 0, idleAt = Date.now();
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const wake = () => (idleAt = Date.now());

    const onMove = (e: MouseEvent) => {
      cx = (e.clientX / innerWidth - 0.5) * 2 * CFG.mouse + gyx;
      cy = (e.clientY / innerHeight - 0.5) * 2 * CFG.mouse + gyy;
      wake();
    };
    const onScroll = () => {
      sy = (scrollY / innerHeight) * CFG.scroll;
      wake();
    };
    addEventListener("mousemove", onMove);
    addEventListener("scroll", onScroll, { passive: true });

    // gyro
    const any = window as any;
    const ask = any.DeviceOrientationEvent?.requestPermission;
    const listenGyro = () =>
      addEventListener("deviceorientation", (ev: DeviceOrientationEvent) => {
        const g = (ev.gamma ?? 0) / 45, b = (ev.beta ?? 0) / 90;
        gyx = g * CFG.gyro; gyy = -b * CFG.gyro;
      });
    if (typeof ask === "function") {
      const req = async () => {
        try { (await ask()) === "granted" && listenGyro(); } catch {}
        document.removeEventListener("click", req);
        document.removeEventListener("touchstart", req);
      };
      document.addEventListener("click", req, { once: true });
      document.addEventListener("touchstart", req, { once: true, passive: true });
    } else {
      listenGyro();
    }

    const loop = () => {
      if (Date.now() - idleAt > CFG.idleAfterMs) {
        const t = performance.now() * CFG.driftSpeed * 0.001;
        cx = Math.sin(t * 1.3) * 0.44 + gyx;
        cy = Math.cos(t * 1.1) * 0.32 + gyy;
      }
      tx = lerp(tx, cx, CFG.lerp);
      ty = lerp(ty, cy, CFG.lerp);

      for (const el of layers) {
        const d = Number(el.dataset.depth || 0);
        const x = -tx * CFG.maxPX * d;
        const y = ty * CFG.maxPY * d + sy * d;
        const s = Number(el.dataset.scale || 1);
        const ox = Number(el.dataset.ox || 0);
        const oy = Number(el.dataset.oy || 0);
        const origin = (el.dataset.origin as string) || "50% 50%";
        el.style.transformOrigin = origin;
        el.style.transform = `translate3d(${(x + ox).toFixed(2)}px, ${(y + oy).toFixed(
          2
        )}px, 0) scale(${s})`;
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("mousemove", onMove);
      removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
}

/* ===============================
   金の粒子（Canvas）
================================= */
function useParticles() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d", { alpha: true })!;
    const DPR = Math.max(1, Math.min(2, devicePixelRatio || 1));

    const resize = () => {
      c.width = innerWidth * DPR; c.height = innerHeight * DPR;
      c.style.width = innerWidth + "px"; c.style.height = innerHeight + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize(); addEventListener("resize", resize);

    const N = 160;
    const P = Array.from({ length: N }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      d: Math.random() * 0.6 + 0.2,
      a: Math.random() * Math.PI * 2,
      s: Math.random() * 0.7 + 0.25,
    }));

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.globalCompositeOperation = "screen";
      for (const p of P) {
        p.a += 0.004 * p.s;
        p.x += Math.cos(p.a) * 0.38 * p.s - 0.02;
        p.y += Math.sin(p.a) * 0.26 * p.s + 0.05;
        if (p.x < -20) p.x = innerWidth + 20;
        if (p.y > innerHeight + 20) p.y = -20;

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 14 * p.d);
        g.addColorStop(0, "rgba(247,211,114,.85)");
        g.addColorStop(0.6, "rgba(247,168, 50,.45)");
        g.addColorStop(1, "rgba(247,168, 50,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2); ctx.fill();
      }
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); };
  }, []);
  return ref;
}

/* ===============================
   BGM（DOM <audio> 版：確実再生＆音量スライダー付き）
================================= */
function useBGM() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [vol, setVol] = useState<number>(0.35); // 初期音量（お好みで）

  // 保存音量を復元
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = Number(localStorage.getItem("bgmVol"));
    if (!Number.isNaN(saved) && saved >= 0 && saved <= 1) setVol(saved);
  }, []);

  // DOMのaudioに反映＋保存
  useEffect(() => {
    const a = audioRef.current;
    if (a) a.volume = vol;
    if (typeof window !== "undefined") localStorage.setItem("bgmVol", String(vol));
  }, [vol]);

  // タブ復帰時に復旧
  useEffect(() => {
    const onVis = async () => {
      const a = audioRef.current;
      if (!a) return;
      if (!document.hidden && playing && a.paused) {
        try { await a.play(); } catch (err) { console.warn("[BGM] resume failed:", err); }
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [playing]);

  // 初回クリックでも確実に鳴らす
  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      // 一度もロードされていなければ明示的にロード
      if (a.readyState < 2) a.load();
      if (a.paused) {
        a.muted = false;           // 念のため解除
        a.volume = vol;            // 現在値を反映
        await a.play();            // ここでユーザー操作に紐づく
        setPlaying(true);
      } else {
        a.pause();
        setPlaying(false);
      }
    } catch (err) {
      console.error("[BGM] play failed:", err);
      alert("ブラウザに再生をブロックされています。タブのミュート・省データ・拡張機能等を確認してください。");
    }
  };

  // JSX へ埋め込む audio 要素（非表示でOK）
  const AudioEl = (
    <audio
      ref={audioRef}
      src="/sanctum/They.mp3"  // ここは「/public/sanctum」に置いたファイルでOK
      preload="auto"
      loop
      playsInline
      crossOrigin="anonymous"
      onError={(e) => {
        const a = e.currentTarget;
        console.error("[BGM] load error", { networkState: a.networkState, readyState: a.readyState, src: a.currentSrc });
        alert("BGMファイルを読み込めませんでした。/sanctum/Milky_Way.mp3 のパスを確認してください。");
      }}
      onCanPlay={() => console.log("[BGM] ready")}
    />
  );

  return { playing, toggle, vol, setVol, AudioEl };
}

/* ===============================
   ロゴ背面の薄さ（安全にlocalStorage）
================================= */
type Shade = "none" | "thin" | "mid" | "strong";
function useLogoShade(targetSelector: string) {
  const [shade, setShade] = useState<Shade>("thin");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = (localStorage.getItem("logoShade") as Shade) || "thin";
    setShade(saved);
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("logoShade", shade);
    const el = document.querySelector<HTMLElement>(targetSelector);
    if (!el) return;
    el.classList.remove("shade-none", "shade-thin", "shade-mid", "shade-strong");
    el.classList.add(`shade-${shade}`);
  }, [shade, targetSelector]);
  return { shade, setShade };
}

/* ===============================
   データ
================================= */
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
  // ↓ IDが被るのでダミーサフィックスを付与（キー衝突回避）
  { id: "1GGBvKxCCMzX78HMw2uGnzs9F0i3PkFtm__ZEO", name: "VolceZeoGOD" },
];

/* ===============================
   ページ本体
================================= */
export default function TeamsPage() {
  useEffect(() => {
    // 100vh 対策
    const set = () => document.documentElement.style.setProperty("--vh", window.innerHeight * 0.01 + "px");
    set(); addEventListener("resize", set, { passive: true }); addEventListener("orientationchange", set, { passive: true });

    const root = document.getElementById("teams"); if (!root) return;

    // ドライブ画像のフォールバック
    (function forceLoadImages() {
      const isMobile = matchMedia("(max-width:760px)").matches;
      root.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
        img.setAttribute("referrerpolicy", "no-referrer");
        if (isMobile && "loading" in HTMLImageElement.prototype) { try { (img as any).loading = "eager"; } catch {} }
        img.addEventListener("error", () => {
          img.removeAttribute("srcset");
          img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect width="1" height="1" fill="rgba(255,255,255,0)"/></svg>'
          );
        }, { once: true });
        (img as any).decoding = "async";
      });
    })();

    // 散開→集合→ブラックアウト→膨張→収束
    function randomize() {
      root.querySelectorAll<HTMLElement>(".leader, .member").forEach((el, i) => {
        el.style.setProperty("--i", String(i));
        const tx = (Math.random() * 2 - 1) * 140;
        const ty = (Math.random() * 2 - 1) * 100;
        const rot = (Math.random() * 2 - 1) * 18;
        el.style.setProperty("--tx", tx + "px");
        el.style.setProperty("--ty", ty + "px");
        el.style.setProperty("--rot", rot + "deg");
      });
    }
    function blackoutAndBloom() {
      let ov = root.querySelector(".teams-blackout") as HTMLElement | null;
      if (!ov) { ov = document.createElement("div"); ov.className = "teams-blackout"; root.appendChild(ov); }
      root.classList.add("black");
      setTimeout(() => {
        const ring = document.createElement("div"); ring.className = "bloom-ring"; root.appendChild(ring);
        setTimeout(() => ring.remove(), 1200);
        setTimeout(() => { root.classList.remove("black"); root.classList.add("bloom", "warping"); setTimeout(() => root.classList.remove("warping"), 700); }, 120);
      }, 350);
    }
    function run() {
      randomize(); root.classList.add("scatter");
      const t1 = 1500; const t2 = t1 + 1900;
      setTimeout(() => root.classList.add("gather"), t1);
      setTimeout(() => blackoutAndBloom(), t2 - 200);
      setTimeout(() => root.classList.add("settle"), t2 + 800);
    }

    let fired = false;
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => {
        es.forEach((e) => { if (e.isIntersecting && !fired) { fired = true; run(); io.unobserve(e.target); } });
      }, { threshold: 0.25, rootMargin: "0px 0px -12%" });
      io.observe(root);
    }
    setTimeout(() => { if (!fired) { fired = true; run(); } }, 900);

    return () => { removeEventListener("resize", set); removeEventListener("orientationchange", set); };
  }, []);

  // 背景演出
  useParallaxStrong();
  const particles = useParticles();
  const { playing, toggle, vol, setVol, AudioEl } = useBGM();
  const { shade, setShade } = useLogoShade("#teams");

  const drive = (id: string, w = 512) => `https://drive.google.com/thumbnail?id=${id}&sz=w${w}`;

  return (
    <>
      {/* ===== Celestial 背景（バックグラウンド固定／素材のみ引き＆動く） ===== */}
      <div className="celestial-bg" aria-hidden="true">
        {/* 背景：星空（固定・パララックスなし） */}
        <img className="layer base" src="/sanctum/background_sky.png" alt="" data-depth="0.00" data-scale="0.70" />
        {/* 遠景雲（引き） */}
        <img className="layer far" src="/sanctum/cloud_far.png" alt="" data-depth="0.06" data-scale="0.62" />
        {/* 遠い神殿（さらに引き＋上へ） */}
        <img className="layer t-small" src="/sanctum/temple_small.png" alt="" data-depth="0.10" data-scale="0.44" data-oy="-70" data-origin="50% 60%" />
        {/* 中景：神殿（引き＋上へ） */}
        <img className="layer t-main" src="/sanctum/temple_main.png" alt="" data-depth="0.14" data-scale="0.50" data-oy="-50" data-origin="50% 60%" />
        {/* ★ 渦（ボルテックス） */}
        <div className="layer vortex" data-depth="0.16" data-scale="0.30" />
        {/* ゴッドレイ */}
        <div className="layer rays" data-depth="0.16" />
        {/* 中景〜近景雲（少し引き） */}
        <img className="layer cloud-mid" src="/sanctum/cloud_strip.png" alt="" data-depth="0.18" data-scale="0.42" />
        <img className="layer near"  src="/sanctum/cloud_near.png"  alt="" data-depth="0.26" data-scale="0.95" />
        <img className="layer near2" src="/sanctum/cloud_near2.png" alt="" data-depth="0.30" data-scale="0.95" />
        <canvas ref={particles} className="spark-canvas" />
      </div>

      {/* BGM（audio要素） */}
      {AudioEl}

      {/* BGM トグル */}
      <button className="audio-toggle" onClick={toggle} aria-pressed={playing} aria-label="BGM toggle">
        <span className="dot" data-on={playing ? "1" : "0"} />
        <span className="label">{playing ? "BGM ON" : "BGM OFF"}</span>
      </button>

      {/* 音量スライダー */}
      <div className="audio-vol">
        <input type="range" min="0" max="1" step="0.01" value={vol} onChange={(e)=>setVol(parseFloat(e.target.value))} />
        <span>{Math.round(vol*100)}%</span>
      </div>

      {/* 薄さコントロール */}
      <div className="shade-ctrl" role="group" aria-label="ロゴ背面の薄さ">
        <label>ロゴ背面：</label>
        <select value={shade} onChange={(e) => setShade(e.target.value as Shade)}>
          <option value="none">なし</option>
          <option value="thin">薄め</option>
          <option value="mid">ふつう</option>
          <option value="strong">濃い</option>
        </select>
      </div>

      {/* ===== CSS ===== */}
      <style>{`
        .celestial-bg{ position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden; background:#0b0f18; transform-style:preserve-3d; }
        .celestial-bg::after{
          content:""; position:absolute; inset:-12%;
          background: radial-gradient(60% 50% at 50% 55%, rgba(0,0,0,.18) 0%, rgba(0,0,0,.28) 55%, rgba(0,0,0,.50) 100%);
          mix-blend-mode:multiply;
        }
        .celestial-bg .layer{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; will-change:transform,opacity; filter: saturate(1.05) brightness(.98); }
        .celestial-bg .far{ opacity:.35 }
        .celestial-bg .t-small{ opacity:.55; filter: blur(.2px) saturate(1.02) brightness(.96); }
        .celestial-bg .t-main{ opacity:.9; filter: drop-shadow(0 0 18px rgba(255,255,255,.06)); transform-origin:center 60%; }
        .celestial-bg .cloud-mid{ opacity:.65 }
        .celestial-bg .near{ opacity:.9 }
        .celestial-bg .near2{ opacity:.95 }

        /* 光芒 */
        .celestial-bg .rays{
          mix-blend-mode:screen;
          background:
            radial-gradient(60% 50% at 50% 40%, rgba(160,220,255,.20), rgba(160,220,255,0) 60%),
            conic-gradient(from -20deg at 52% 30%, rgba(255,255,255,.25), rgba(255,255,255,0) 40%);
          opacity:.45; animation:raysSpin 36s linear infinite;
        }
        @keyframes raysSpin{ to{ transform: rotate(360deg); } }

        /* 渦（ボルテックス） */
        .vortex{ position:absolute; inset:0; }
        .vortex::before,
        .vortex::after{
          content:""; position:absolute; left:50%; top:42%; translate:-50% -50%;
          width:min(56vmin, 720px); aspect-ratio:1; border-radius:50%;
          mix-blend-mode:screen; filter: blur(.6px);
          -webkit-mask: radial-gradient(circle at 50% 50%, transparent 40%, black 55%, black 86%, transparent 92%);
                  mask: radial-gradient(circle at 50% 50%, transparent 40%, black 55%, black 86%, transparent 92%);
        }
        .vortex::before{
          background:
            conic-gradient(from 0deg, rgba(0,224,255,.0) 0 10%, rgba(0,224,255,.7) 20% 22%, rgba(255,55,199,.0) 30% 40%, rgba(255,55,199,.7) 48% 50%, rgba(0,224,255,.0) 60% 70%, rgba(0,224,255,.7) 78% 80%, rgba(255,55,199,.0) 88% 100%);
          animation: vortexSpin 18s linear infinite;
        }
        .vortex::after{
          width:calc(min(56vmin, 720px) * .82);
          background:
            conic-gradient(from 90deg, rgba(255,55,199,.0) 0 12%, rgba(255,55,199,.65) 18% 21%, rgba(0,224,255,.0) 30% 39%, rgba(0,224,255,.65) 47% 49%, rgba(255,55,199,.0) 58% 69%, rgba(255,55,199,.65) 76% 78%, rgba(0,224,255,.0) 86% 100%);
          animation: vortexSpinReverse 22s linear infinite;
          filter: blur(1px);
        }
        @keyframes vortexSpin{ to{ rotate(360deg); } }
        @keyframes vortexSpinReverse{ to{ rotate(-360deg); } }

        /* 雲モーション（素材のみ） */
        @keyframes cloud-drift{ from{ transform:translateX(0) } to{ transform:translateX(-10vw) } }
        @keyframes cloud-bob{ 0%{ transform:translateY(0) } 50%{ transform:translateY(2vh) } 100%{ transform:translateY(0) } }
        .celestial-bg .cloud-mid, .celestial-bg .near, .celestial-bg .near2{
          animation: cloud-drift 32s linear infinite, cloud-bob 16s ease-in-out infinite;
        }

        .spark-canvas{ position:absolute; inset:0; width:100%; height:100%; mix-blend-mode:screen; pointer-events:none; }

        /* BGM トグル */
        .audio-toggle{
          position: fixed; left: 18px; bottom: 18px; z-index: 2;
          display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:999px;
          border:1px solid rgba(255,255,255,.18); background: rgba(16,22,38,.72); color:#e7eefc; font-weight:700;
          backdrop-filter: blur(6px); pointer-events:auto;
        }
        .audio-toggle .dot{ width:10px; height:10px; border-radius:999px; background:#9aa4b7; box-shadow:0 0 0 2px rgba(255,255,255,.1) inset; }
        .audio-toggle .dot[data-on="1"]{ background:#6ff; box-shadow:0 0 10px #6ff; }
        .audio-toggle .label{ letter-spacing:.02em; }

        /* 音量スライダー */
        .audio-vol{
          position: fixed; left: 18px; bottom: 64px; z-index: 2;
          display:flex; align-items:center; gap:8px; padding:8px 12px; border-radius:10px;
          border:1px solid rgba(255,255,255,.18); background: rgba(16,22,38,.66); color:#e7eefc;
          backdrop-filter: blur(6px); pointer-events:auto;
        }
        .audio-vol input{ width:160px; }

        /* 薄さコントロール */
        .shade-ctrl{
          position: fixed; right: 18px; bottom: 18px; z-index: 2;
          display:flex; align-items:center; gap:8px; padding:8px 12px; border-radius:10px;
          border:1px solid rgba(255,255,255,.18); background: rgba(16,22,38,.66); color:#e7eefc;
          backdrop-filter: blur(6px);
        }
        .shade-ctrl select{ background: rgba(0,0,0,.2); color:#e7eefc; border:1px solid rgba(255,255,255,.18); border-radius:6px; padding:4px 8px; }

        .page{max-width:1020px;margin:16px auto 0; position:relative; z-index:1;}

        /* === メンバーUI === */
        .leaders-grid{ display:grid; gap:16px; grid-template-columns:repeat(3, minmax(160px,1fr)); justify-items:center; align-items:end; margin-bottom:18px; }
        .leader{ display:grid; justify-items:center; gap:8px; padding:12px; border-radius:14px; background:transparent; border:0; box-shadow:none; }
        .leader img{ width:clamp(112px, 10vw, 140px); height:clamp(112px, 10vw, 140px); border-radius:50%; object-fit:cover; border:0; display:block; }
        .leader .role{ font-size:12px; opacity:.9; padding:2px 10px; border-radius:999px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.18); }
        .leader .name{ font-weight:800; font-size:16px; text-align:center; }

        .special-wrap{ margin:14px 0 6px; }
        .special-title{ display:flex; align-items:center; gap:10px; margin:6px 0 10px; font-family:'Cinzel',serif; letter-spacing:.06em; font-weight:900; }
        .special-title::before, .special-title::after{ content:""; flex:1; height:1px; background:linear-gradient(90deg, rgba(255,242,168,.0), rgba(255,242,168,.6), rgba(255,242,168,.0)); filter:blur(.2px); }
        .special-grid{ display:grid; gap:16px; grid-template-columns:repeat(3, minmax(180px,1fr)); justify-items:center; }

        .member{ display:grid; justify-items:center; gap:8px; padding:10px; border-radius:12px; background:transparent; border:0; box-shadow:none; }
        .member.special{ position:relative; }
        .member.special img{ width:clamp(118px, 11vw, 140px); height:clamp(118px, 11vw, 140px); border-radius:50%; object-fit:cover; display:block; }
        .member.special .role-badge{ position:absolute; top:6px; right:10px; font-size:12px; font-weight:800; letter-spacing:.04em; padding:2px 8px; border-radius:999px; color:#1a1a1a; background:linear-gradient(180deg,#ffe887,#f2d64e); box-shadow:0 4px 14px rgba(0,0,0,.35); }

        .divider-title{ display:flex; align-items:center; gap:10px; margin:18px 0 8px; font-weight:900; letter-spacing:.04em; }
        .divider-title::before, .divider-title::after{ content:""; flex:1; height:1px; background:linear-gradient(90deg, rgba(255,255,255,.0), rgba(255,255,255,.32), rgba(255,255,255,0)); }

        .member-grid{ display:grid; gap:14px; grid-template-columns: repeat(auto-fill, minmax(clamp(120px, 18vw, 160px), 1fr)); }
        .member img{ width:clamp(74px, 8.5vw, 96px); height:clamp(74px, 8.5vw, 96px); border-radius:50%; object-fit:cover; border:0; display:block; }
        .member .name{ font-weight:800; font-size:14px; text-align:center; }

        /* ロゴ背面の薄さ */
        #teams.shade-none  .leader img, #teams.shade-none  .member img, #teams.shade-none  .member.special img{ background: transparent !important; box-shadow: 0 8px 18px rgba(0,0,0,.12) !important; }
        #teams.shade-thin  .leader img, #teams.shade-thin  .member img, #teams.shade-thin  .member.special img{
          background:
            radial-gradient(60% 60% at 50% 45%, rgba(255,255,255,.05), rgba(255,255,255,0) 72%),
            rgba(16,22,38,.10);
          box-shadow: 0 8px 18px rgba(0,0,0,.18);
        }
        #teams.shade-mid   .leader img, #teams.shade-mid   .member img, #teams.shade-mid   .member.special img{
          background:
            radial-gradient(60% 60% at 50% 45%, rgba(255,255,255,.07), rgba(255,255,255,0) 72%),
            rgba(10,14,21,.20);
          box-shadow: 0 10px 20px rgba(0,0,0,.26);
        }
        #teams.shade-strong .leader img, #teams.shade-strong .member img, #teams.shade-strong .member.special img{ background: rgba(10,14,21,.36); box-shadow: 0 12px 22px rgba(0,0,0,.35); }

        @media (max-width:760px){
          .leaders-grid{ grid-template-columns:1fr; }
          .member-grid{ grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
          .special-grid{ grid-template-columns:repeat(1, minmax(180px,1fr)); }
          #teams img{ aspect-ratio:1/1; height:auto; }
          .celestial-bg .near2{ display:none; }
        }

        /* Teams エフェクト（※初期ブラーOFFでシャープに） */
        #teams .leader, #teams .member{
          opacity:0; transform: translate3d(0,20px,0) scale(.96); filter: none !important; will-change: transform, opacity;
        }
        #teams.scatter .leader, #teams.scatter .member{
          opacity:1; transform: translate3d(var(--tx,0), var(--ty,0), 0) rotate(var(--rot,0deg)) scale(.98);
          transition: transform .65s cubic-bezier(.25,.85,.2,1), opacity .45s ease-out;
          transition-delay: calc(var(--i, 0) * 90ms);
        }
        #teams.gather .leader, #teams.gather .member{ transform:none; transition: transform 1.9s cubic-bezier(.16,.9,.1,1), opacity .6s ease-out; transition-delay: calc(var(--i, 0) * 60ms); }
        #teams.settle .leader, #teams.settle .member{ animation: settle .55s cubic-bezier(.18,.9,.2,1) both; animation-delay: calc(var(--i, 0) * 25ms); }
        @keyframes settle{ 0%{ transform: translateY(0) scale(1);} 40%{ transform: translateY(-2px) scale(1.01);} 100%{ transform: translateY(0) scale(1);} }

        #teams .teams-blackout{ position:absolute; inset:0; border-radius:inherit; background:#000; opacity:0; pointer-events:none; transition: opacity .45s ease; z-index:5; }
        #teams.black .teams-blackout{ opacity:.98; }
        .bloom-ring{
          position:absolute; left:50%; top:50%; width:20px; height:20px; border-radius:50%;
          background: radial-gradient(closest-side, rgba(160,120,255,.85), rgba(160,120,255,.25) 60%, rgba(160,120,255,0) 70%);
          box-shadow: 0 0 24px rgba(170,120,255,.6), 0 0 60px rgba(170,120,255,.4);
          transform: translate(-50%,-50%) scale(.1); opacity:.0; pointer-events:none; z-index:6; filter: blur(2px);
          animation: ringExpand 900ms cubic-bezier(.2,.8,.1,1) forwards;
        }
        @keyframes ringExpand{ 0%{ transform: translate(-50%,-50%) scale(.1); opacity:.0;} 15%{ opacity:1;} 100%{ transform: translate(-50%,-50%) scale(14); opacity:0;} }
        #teams.bloom .leader img, #teams.bloom .member img{ filter: drop-shadow(0 0 16px rgba(180,120,255,.35)) drop-shadow(0 0 38px rgba(160,120,255,.22)); transition: filter .6s ease; }
        #teams.warping{ filter: url(#teamWarp); transition: filter .7s ease; }

        /* ガラス効果は弱めに（ぼやけ感を抑える） */
        #teams{
          position:relative; overflow:hidden; border-radius: 14px;
          background: rgba(16,22,38,.18); /* .28 → .18 へ */
          border:1px solid rgba(255,255,255,.06);
          backdrop-filter: blur(2px);    /* 6px → 2px へ */
        }

        @media (prefers-reduced-motion: reduce){
          #teams .leader, #teams .member{ opacity:1; transform:none; filter:none; transition:none; animation:none; }
          #teams .teams-blackout, .bloom-ring{ display:none !important; }
          .celestial-bg, .celestial-bg .layer{ transform:none !important; animation:none !important; }
          .spark-canvas{ display:none; }
        }
      `}</style>

      <main className="page">
        <section id="teams" className="card shade-thin" style={{ maxWidth: 1000, margin: "16px auto 0" }}>
          <h2 style={{ margin: "0 0 10px", fontFamily: "'Cinzel',serif", letterSpacing: ".06em" }}>クランメンバー</h2>

          {/* 役職：代表・副代表 */}
          <div className="leaders-grid">
            {leaders.map((p, i) => (
              <figure className={`leader ${i === 1 ? "main" : ""}`} key={`${p.id}-${p.name}`}>
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
              {specials.map((p) => (
                <figure className="member special" key={`${p.id}-${p.name}`}>
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
              <figure className="member" key={`${p.id}-${p.name}-${idx}`}>
                <img loading="lazy" referrerPolicy="no-referrer" src={drive(p.id.replace("__ZEO",""), 256)} alt="" />
                <figcaption className="name">{p.name}</figcaption>
              </figure>
            ))}
          </div>

          {/* ゆがみ用フィルタ */}
          <svg width="0" height="0" style={{ position: "absolute", left: -9999, top: -9999 }} aria-hidden="true">
            <defs>
              <filter id="teamWarp">
                <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="7" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
          </svg>
        </section>
      </main>
    </>
  );
}
