"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const KEY = "mikanOpeningPlayed_v2";

/** 8秒（ゆっくり） */
const D = {
  IN: 300, // ふわっと入る
  HOLD: 3300, // 泡が割れていくメイン時間
  OUT: 700, // 最後の余韻（ほぼ使わないが保険）
};

type Phase = "in" | "hold" | "out" | "done";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(!!m.matches);
    on();
    m.addEventListener?.("change", on);
    return () => m.removeEventListener?.("change", on);
  }, []);
  return reduced;
}

type Bubble = {
  id: string;
  x: number; // 0..100 vw
  y: number; // 0..100 vh (初期)
  size: number; // px
  driftX: number; // px
  driftY: number; // px
  floatDur: number; // s
  delay: number; // s (出現遅延)
  popAt: number; // ms (いつ割れるか)
  hue: number; // 色味
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function OpeningIntro() {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>("in");
  const [enabled, setEnabled] = useState(false);

  // どの泡が「割れた」か
  const [popped, setPopped] = useState<Record<string, boolean>>({});
  const timers = useRef<number[]>([]);
  const prevOverflow = useRef<string>("");

  const clearAll = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  const finish = () => {
    clearAll();
    try {
      localStorage.setItem(KEY, "true");
    } catch {}
    setPhase("done");
    setEnabled(false);
    document.body.style.overflow = prevOverflow.current;
  };

  const skip = () => finish();

  /** 泡を生成（毎回同じにしない＝楽しい。でもHydrationはmountedガード済み前提） */
  const bubbles: Bubble[] = useMemo(() => {
    // 端末幅で個数調整（重すぎ回避）
    const w = typeof window !== "undefined" ? window.innerWidth : 1200;
    const count = w < 430 ? 10 : w < 900 ? 14 : 18;

    // 8秒のうち、IN後〜HOLD終盤で割らせる
    const startPop = D.IN + 350;
    const endPop = D.IN + D.HOLD - 300;

    const arr: Bubble[] = [];
    for (let i = 0; i < count; i++) {
      const size = Math.round(56 + Math.random() * 92); // 56..148
      const x = clamp(Math.random() * 100, 6, 94);
      const y = clamp(18 + Math.random() * 70, 10, 92);

      // 浮遊の幅
      const driftX = (Math.random() - 0.5) * 110;
      const driftY = -80 - Math.random() * 170;

      // ふわふわ速度
      const floatDur = 5.2 + Math.random() * 3.6; // 秒
      const delay = Math.random() * 0.9; // 秒

      // 割れるタイミング：早いのと遅いのを混ぜる（後半に集中させて「全部割れた感」）
      const t =
        startPop +
        (i / (count - 1)) * (endPop - startPop) +
        (Math.random() - 0.5) * 520;

      // 色：みかん系（橙〜黄）に軽く振る
      const hue = 24 + Math.random() * 28; // 24..52

      arr.push({
        id: uid(),
        x,
        y,
        size,
        driftX,
        driftY,
        floatDur,
        delay,
        popAt: Math.round(clamp(t, startPop, endPop)),
        hue,
      });
    }

    // 割れる順に整列（視覚的に気持ちいい）
    arr.sort((a, b) => a.popAt - b.popAt);
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // 既に再生済みならスキップ
    try {
      if (localStorage.getItem(KEY) === "true") {
        setEnabled(false);
        setPhase("done");
        return;
      }
    } catch {}

    // 省モーションならスキップ
    if (reduced) {
      try {
        localStorage.setItem(KEY, "true");
      } catch {}
      setEnabled(false);
      setPhase("done");
      return;
    }

    setEnabled(true);
    setPhase("in");

    prevOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);

    // フェーズ遷移
    timers.current.push(
      window.setTimeout(() => setPhase("hold"), D.IN),
      window.setTimeout(() => setPhase("out"), D.IN + D.HOLD)
    );

    // 泡を順番に割る
    bubbles.forEach((b) => {
      timers.current.push(
        window.setTimeout(() => {
          setPopped((prev) => (prev[b.id] ? prev : { ...prev, [b.id]: true }));
        }, b.popAt)
      );
    });

    // 最後の泡が割れて少し余韻でfinish
    const lastPopAt = bubbles[bubbles.length - 1]?.popAt ?? D.IN + D.HOLD;
    timers.current.push(window.setTimeout(() => finish(), lastPopAt + 420));

    return () => {
      clearAll();
      document.body.style.overflow = prevOverflow.current;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  if (!enabled || phase === "done") return null;

  return (
    <div className={`oi8 ${phase}`} role="presentation">
      <button className="oi8Skip" onClick={skip} type="button" aria-label="Skip opening">
        Skip
      </button>

      {/* うっすら朝もや（下地） */}
      <div className="oi8Wash" aria-hidden />

      {/* みかんシャボン玉（全画面） */}
      <div className="oi8Field" aria-hidden>
        {bubbles.map((b) => {
          const isPopped = !!popped[b.id];
          return (
            <div
              key={b.id}
              className={`oi8Bubble ${isPopped ? "isPopped" : ""}`}
              style={
                {
                  left: `${b.x}vw`,
                  top: `${b.y}vh`,
                  width: `${b.size}px`,
                  height: `${b.size}px`,
                  ["--dx" as any]: `${b.driftX}px`,
                  ["--dy" as any]: `${b.driftY}px`,
                  ["--fd" as any]: `${b.floatDur}s`,
                  ["--del" as any]: `${b.delay}s`,
                  ["--h" as any]: `${b.hue}`,
                } as any
              }
            >
              {/* 泡本体 */}
              <div className="oi8BubbleCore" />
              {/* ハイライト */}
              <div className="oi8BubbleHi" />
              {/* 割れた時の粒 */}
              <div className="oi8PopBits" />
              {/* かわいい「パチ」 */}
              <div className="oi8PopPuff" />
            </div>
          );
        })}
      </div>

      {/* ロゴ（控えめに中央：泡が割れていくのが主役） */}
      <div className="oi8Logo" aria-hidden>
        <div className="oi8Title">山口みかん農園</div>
        <div className="oi8Sub">Yamaguchi Mikan Farm</div>
      </div>

      <style suppressHydrationWarning>{`
        .oi8{
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: grid;
          place-items: center;
          background: radial-gradient(1200px 800px at 50% 10%, rgba(255,255,255,0.85), rgba(255,255,255,0.22) 55%, rgba(255,255,255,0) 75%),
                      linear-gradient(180deg, rgba(255,244,224,0.92), rgba(255,255,255,0.2));
          overflow: hidden;
          transform: translateZ(0);
        }

        .oi8Wash{
          position:absolute;
          inset:-10%;
          background:
            radial-gradient(900px 540px at 50% 20%, rgba(255,255,255,0.75), rgba(255,255,255,0) 62%),
            radial-gradient(900px 540px at 30% 85%, rgba(255,220,170,0.28), rgba(255,255,255,0) 60%);
          filter: blur(6px);
          opacity: .75;
          animation: oi8Wash 6.8s ease-in-out infinite;
          transform: translate3d(0,0,0);
          pointer-events:none;
        }
        @keyframes oi8Wash{
          0%{ transform: translate3d(0,0,0) scale(1); opacity: .68; }
          50%{ transform: translate3d(0,-10px,0) scale(1.02); opacity: .82; }
          100%{ transform: translate3d(0,0,0) scale(1); opacity: .68; }
        }

        .oi8Skip{
          position:absolute;
          right: 14px;
          top: 14px;
          z-index: 20;
          padding: 10px 14px;
          border-radius: 9999px;
          border: 1px solid rgba(0,0,0,0.10);
          background: rgba(255,255,255,0.78);
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          color: rgba(0,0,0,0.7);
          font-weight: 700;
          backdrop-filter: blur(10px);
          transition: transform .15s ease, opacity .15s ease;
        }
        .oi8Skip:hover{ transform: translateY(-1px); }
        .oi8Skip:active{ transform: translateY(0px) scale(0.98); }

        /* ロゴ（主張しすぎない） */
        .oi8Logo{
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 18px 22px;
          border-radius: 26px;
          background: rgba(255,255,255,0.40);
          border: 1px solid rgba(255,255,255,0.55);
          box-shadow: 0 18px 60px rgba(0,0,0,0.10);
          backdrop-filter: blur(10px);
          transform: translate3d(0,0,0);
          animation: oi8LogoBreath 2.8s ease-in-out infinite;
        }
        @keyframes oi8LogoBreath{
          0%{ transform: translate3d(0,0,0) scale(1); opacity: .94;}
          50%{ transform: translate3d(0,-4px,0) scale(1.01); opacity: 1;}
          100%{ transform: translate3d(0,0,0) scale(1); opacity: .94;}
        }
        .oi8Title{
          font-weight: 900;
          letter-spacing: .12em;
          font-size: clamp(20px, 4.2vw, 44px);
          color: rgba(255, 120, 0, 0.92);
          text-shadow: 0 2px 10px rgba(0,0,0,0.08);
        }
        .oi8Sub{
          margin-top: 6px;
          font-weight: 700;
          letter-spacing: .10em;
          font-size: clamp(11px, 2.2vw, 14px);
          color: rgba(0,0,0,0.55);
        }

        /* 泡フィールド */
        .oi8Field{
          position:absolute;
          inset:0;
          z-index: 5;
          pointer-events:none;
          transform: translate3d(0,0,0);
        }

        /* 泡：ふわふわ上昇＋左右ゆらぎ */
        .oi8Bubble{
          position:absolute;
          border-radius: 9999px;
          transform: translate3d(-50%,-50%,0);
          animation:
            oi8Float var(--fd) ease-in-out infinite,
            oi8Appear .55s ease-out both;
          animation-delay: 0s, var(--del);
          will-change: transform, opacity;
          filter: drop-shadow(0 18px 26px rgba(0,0,0,0.10));
        }

        @keyframes oi8Appear{
          from { opacity: 0; transform: translate3d(-50%,-50%,0) scale(0.92); }
          to   { opacity: 1; transform: translate3d(-50%,-50%,0) scale(1); }
        }

        @keyframes oi8Float{
          0%   { transform: translate3d(-50%,-50%,0) translate3d(0,0,0); }
          50%  { transform: translate3d(-50%,-50%,0) translate3d(var(--dx), var(--dy), 0); }
          100% { transform: translate3d(-50%,-50%,0) translate3d(0,0,0); }
        }

        /* 泡の見た目（みかんっぽい） */
        .oi8BubbleCore{
          position:absolute;
          inset:0;
          border-radius:9999px;
          background:
            radial-gradient(circle at 30% 30%,
              rgba(255,255,255,0.95) 0%,
              rgba(255,255,255,0.55) 14%,
              hsla(var(--h), 98%, 62%, 0.78) 38%,
              hsla(var(--h), 98%, 55%, 0.58) 60%,
              hsla(var(--h), 95%, 50%, 0.30) 78%,
              rgba(255,160,0,0.0) 100%);
          border: 1px solid rgba(255,160,0,0.28);
          box-shadow:
            inset 0 0 0 1px rgba(255,255,255,0.28),
            inset 0 -18px 30px rgba(255,140,0,0.10);
          opacity: 0.95;
        }

        .oi8BubbleHi{
          position:absolute;
          inset: 10% 14% auto auto;
          width: 36%;
          height: 36%;
          border-radius:9999px;
          background: radial-gradient(circle, rgba(255,255,255,0.92), rgba(255,255,255,0) 70%);
          filter: blur(0.2px);
          opacity: .95;
          transform: translate3d(0,0,0);
        }

        /* 割れる演出：ぷく→パチ→消える */
        .oi8Bubble.isPopped{
          animation: none;
          filter: none;
        }

        .oi8Bubble.isPopped .oi8BubbleCore{
          animation: oi8PopCore 520ms cubic-bezier(.2,.9,.2,1) forwards;
        }
        @keyframes oi8PopCore{
          0%   { transform: scale(1); opacity: 1; }
          35%  { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(0.55); opacity: 0; }
        }

        .oi8Bubble.isPopped .oi8BubbleHi{
          animation: oi8PopHi 520ms cubic-bezier(.2,.9,.2,1) forwards;
        }
        @keyframes oi8PopHi{
          0%   { transform: scale(1); opacity: .95; }
          60%  { transform: scale(1.3); opacity: .8; }
          100% { transform: scale(0.7); opacity: 0; }
        }

        /* “パチッ”の白いふわ輪 */
        .oi8PopPuff{
          position:absolute;
          inset:-22%;
          border-radius:9999px;
          background: radial-gradient(circle, rgba(255,255,255,0.95), rgba(255,255,255,0) 62%);
          opacity: 0;
          transform: scale(0.6);
          filter: blur(0.6px);
        }
        .oi8Bubble.isPopped .oi8PopPuff{
          animation: oi8Puff 520ms ease-out forwards;
        }
        @keyframes oi8Puff{
          0%{ opacity: 0; transform: scale(0.55); }
          30%{ opacity: .95; transform: scale(1.05); }
          100%{ opacity: 0; transform: scale(1.35); }
        }

        /* 粒が散る */
        .oi8PopBits{
          position:absolute;
          inset: -40%;
          border-radius:9999px;
          opacity:0;
          background:
            radial-gradient(circle at 22% 40%, rgba(255,160,0,0.85) 0 2px, rgba(255,160,0,0) 3px),
            radial-gradient(circle at 68% 28%, rgba(255,210,120,0.80) 0 2px, rgba(255,210,120,0) 3px),
            radial-gradient(circle at 42% 72%, rgba(255,140,0,0.78) 0 2px, rgba(255,140,0,0) 3px),
            radial-gradient(circle at 78% 66%, rgba(255,220,140,0.70) 0 2px, rgba(255,220,140,0) 3px),
            radial-gradient(circle at 32% 22%, rgba(255,255,255,0.75) 0 2px, rgba(255,255,255,0) 3px);
          transform: scale(0.7);
          filter: blur(0.15px);
        }
        .oi8Bubble.isPopped .oi8PopBits{
          animation: oi8Bits 520ms ease-out forwards;
        }
        @keyframes oi8Bits{
          0%{ opacity: 0; transform: scale(0.75); }
          30%{ opacity: .95; transform: scale(1.02); }
          100%{ opacity: 0; transform: scale(1.25); }
        }

        /* 全体フェード */
        .oi8.in{ opacity: 1; }
        .oi8.hold{ opacity: 1; }
        .oi8.out{
          animation: oi8Out 520ms ease-in forwards;
        }
        @keyframes oi8Out{
          from{ opacity: 1; }
          to{ opacity: 0; }
        }

        @media (max-width: 430px){
          .oi8Logo{
            padding: 14px 16px;
            border-radius: 22px;
          }
          .oi8Skip{
            padding: 9px 12px;
          }
        }

        @media (prefers-reduced-motion: reduce){
          .oi8Wash, .oi8Logo, .oi8Bubble{
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}