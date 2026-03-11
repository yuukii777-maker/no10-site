"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

const KEY = "mikanOpeningPlayed_v7";
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "dev";
const VERSION_KEY = "mikanOpeningLastSeenVersion_v7";

const D = {
  TOTAL: 7600,
  OUT: 700,
};

type Phase = "in" | "out" | "done";

type Bubble = {
  id: string;
  x: number;
  y: number;
  size: number;
  driftX: number;
  driftY: number;
  floatDur: number;
  delay: number;
  popAt: number;
  hue: number;
};

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

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * 素材サイズ差はここで吸収
 */
const ALIGN = {
  whole: { scale: 0.92, x: 0, y: 8 },
  peel1: { scale: 0.9, x: 0, y: 10 },
  peel2: { scale: 0.88, x: 0, y: 12 },
};

export default function OpeningIntro() {
  const reduced = usePrefersReducedMotion();

  const [mounted, setMounted] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [phase, setPhase] = useState<Phase>("in");
  const [popped, setPopped] = useState<Record<string, boolean>>({});

  const timers = useRef<number[]>([]);
  const prevOverflow = useRef<string>("");

  useEffect(() => setMounted(true), []);

  const isIOS = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }, []);

  /**
   * 周囲だけに泡を出す
   * 中央のみかん付近は避ける
   */
  const bubbles: Bubble[] = useMemo(() => {
    if (!mounted) return [];

    const w = window.innerWidth;
    const count = w < 430 ? 8 : w < 900 ? 12 : 16;

    const startPop = 1800;
    const endPop = 6100;

    const arr: Bubble[] = [];

    while (arr.length < count) {
      const x = Math.random() * 100;
      const y = 10 + Math.random() * 76;

      // 中央の主役エリアを避ける
      const inCenterX = x > 28 && x < 72;
      const inCenterY = y > 18 && y < 78;
      if (inCenterX && inCenterY) continue;

      const size = Math.round(34 + Math.random() * 54);
      const driftX = (Math.random() - 0.5) * 70;
      const driftY = -30 - Math.random() * 90;
      const floatDur = 5 + Math.random() * 3.4;
      const delay = Math.random() * 0.8;

      const t =
        startPop +
        (arr.length / Math.max(count - 1, 1)) * (endPop - startPop) +
        (Math.random() - 0.5) * 520;

      const hue = 24 + Math.random() * 16;

      arr.push({
        id: uid(),
        x: clamp(x, 4, 96),
        y: clamp(y, 8, 92),
        size,
        driftX,
        driftY,
        floatDur,
        delay,
        popAt: Math.round(clamp(t, startPop, endPop)),
        hue,
      });
    }

    arr.sort((a, b) => a.popAt - b.popAt);
    return arr;
  }, [mounted]);

  const clearAll = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  const finish = () => {
    clearAll();

    if (!isIOS) {
      try {
        localStorage.setItem(VERSION_KEY, APP_VERSION);
        localStorage.setItem(KEY, "true");
      } catch {}
    }

    setPhase("done");
    setEnabled(false);
    document.body.style.overflow = prevOverflow.current;
  };

  const skip = () => {
    setPhase("out");
    timers.current.push(window.setTimeout(finish, 220));
  };

  useEffect(() => {
    if (!mounted) return;

    if (!isIOS) {
      try {
        const last = localStorage.getItem(VERSION_KEY);
        if (last === APP_VERSION) {
          setEnabled(false);
          setPhase("done");
          return;
        }
      } catch {}
    }

    if (reduced) {
      if (!isIOS) {
        try {
          localStorage.setItem(VERSION_KEY, APP_VERSION);
        } catch {}
      }
      setEnabled(false);
      setPhase("done");
      return;
    }

    setEnabled(true);
    setPhase("in");
    setPopped({});

    prevOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);

    bubbles.forEach((b) => {
      timers.current.push(
        window.setTimeout(() => {
          setPopped((prev) => (prev[b.id] ? prev : { ...prev, [b.id]: true }));
        }, b.popAt)
      );
    });

    timers.current.push(
      window.setTimeout(() => setPhase("out"), D.TOTAL - D.OUT),
      window.setTimeout(() => finish(), D.TOTAL)
    );

    return () => {
      clearAll();
      document.body.style.overflow = prevOverflow.current;
      window.removeEventListener("keydown", onKey);
    };
  }, [mounted, reduced, isIOS, bubbles]);

  if (!mounted) return null;
  if (!enabled || phase === "done") return null;

  return (
    <div className={`mi ${phase}`} role="presentation" aria-hidden="true">
      <button
        className="miSkip"
        onClick={skip}
        type="button"
        aria-label="Skip opening"
      >
        Skip
      </button>

      <div className="miBg" />
      <div className="miGlowBack" />
      <div className="miGlowCenter" />
      <div className="miVignette" />
      <div className="miDust miDust1" />
      <div className="miDust miDust2" />
      <div className="miDust miDust3" />

      {/* 周囲のオレンジ泡 */}
      <div className="miBubbleField" aria-hidden>
        {bubbles.map((b) => {
          const isPopped = !!popped[b.id];
          return (
            <div
              key={b.id}
              className={`miBubble ${isPopped ? "isPopped" : ""}`}
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
              <div className="miBubbleCore" />
              <div className="miBubbleHi" />
              <div className="miBubblePuff" />
              <div className="miBubbleBits" />
            </div>
          );
        })}
      </div>

      <div className="miStage">
        {/* 1枚目 */}
        <div
          className="miLayer whole"
          style={
            {
              ["--sx" as any]: ALIGN.whole.scale,
              ["--tx" as any]: `${ALIGN.whole.x}px`,
              ["--ty" as any]: `${ALIGN.whole.y}px`,
            } as any
          }
        >
          <Image
            src="/intro/intro_mikan_whole.png?v=20260312c"
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 72vw, 520px"
            className="miImg"
          />
        </div>

        {/* 2枚目 */}
        <div
          className="miLayer peel1"
          style={
            {
              ["--sx" as any]: ALIGN.peel1.scale,
              ["--tx" as any]: `${ALIGN.peel1.x}px`,
              ["--ty" as any]: `${ALIGN.peel1.y}px`,
            } as any
          }
        >
          <Image
            src="/intro/intro_mikan_peel1.png?v=20260312c"
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 72vw, 520px"
            className="miImg"
          />
        </div>

        {/* 3枚目 */}
        <div
          className="miLayer peel2"
          style={
            {
              ["--sx" as any]: ALIGN.peel2.scale,
              ["--tx" as any]: `${ALIGN.peel2.x}px`,
              ["--ty" as any]: `${ALIGN.peel2.y}px`,
            } as any
          }
        >
          <Image
            src="/intro/intro_mikan_peel2.png?v=20260312c"
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 72vw, 520px"
            className="miImg"
          />
        </div>

        <div className="miShadow" />
      </div>

      <div className="miLogoWrap">
        <div className="miLogoMain">山口みかん農園</div>
        <div className="miLogoSub">Yamaguchi Mikan Farm</div>
      </div>

      <style suppressHydrationWarning>{`
        .mi{
          position: fixed;
          inset: 0;
          z-index: 9999;
          overflow: hidden;
          background:
            radial-gradient(1100px 760px at 50% 18%, rgba(255,251,242,0.99), rgba(252,241,222,0.98) 48%, rgba(244,228,199,0.99) 100%);
        }

        .mi.out{
          animation: miOutro ${D.OUT}ms ease forwards;
        }

        @keyframes miOutro{
          from{ opacity:1; filter: blur(0px); }
          to{ opacity:0; filter: blur(10px); }
        }

        .miSkip{
          position:absolute;
          top:14px;
          right:14px;
          z-index:60;
          border:1px solid rgba(90,64,35,.08);
          background:rgba(255,255,255,.82);
          color:rgba(90,64,35,.85);
          padding:10px 14px;
          border-radius:999px;
          font-size:13px;
          font-weight:800;
          box-shadow:0 8px 20px rgba(90,64,35,.08);
          backdrop-filter: blur(8px);
        }

        .miBg,.miGlowBack,.miGlowCenter,.miVignette,.miDust{
          position:absolute;
          inset:0;
          pointer-events:none;
        }

        .miBg{
          background:
            radial-gradient(760px 380px at 50% 44%, rgba(255,255,255,.50), rgba(255,255,255,0) 68%),
            radial-gradient(540px 220px at 50% 80%, rgba(255,188,92,.08), rgba(255,188,92,0) 74%);
          animation: miBgMove ${D.TOTAL}ms ease-in-out both;
        }

        @keyframes miBgMove{
          0%{ transform: scale(1.02) translateY(8px); opacity:.84; }
          50%{ transform: scale(1.00) translateY(0); opacity:1; }
          100%{ transform: scale(1.02) translateY(-4px); opacity:.92; }
        }

        .miGlowBack{
          background: radial-gradient(circle at 50% 46%, rgba(255,209,128,.12), rgba(255,209,128,0) 44%);
          filter: blur(30px);
          animation: miGlowBack ${D.TOTAL}ms ease-in-out both;
        }

        @keyframes miGlowBack{
          0%{ opacity:.08; transform: scale(.94); }
          62%{ opacity:.16; transform: scale(1); }
          100%{ opacity:.10; transform: scale(1.02); }
        }

        .miGlowCenter{
          background: radial-gradient(circle at 50% 46%, rgba(255,247,236,.54), rgba(255,247,236,0) 32%);
          filter: blur(18px);
          opacity:.24;
          animation: miGlowCenter ${D.TOTAL}ms ease-in-out both;
        }

        @keyframes miGlowCenter{
          0%{ opacity:.18; }
          60%{ opacity:.22; }
          100%{ opacity:.18; }
        }

        .miVignette{
          box-shadow: inset 0 0 140px rgba(120,82,34,.08);
        }

        .miDust1{
          background:
            radial-gradient(circle at 25% 32%, rgba(255,210,139,.32) 0 1.2px, transparent 2px),
            radial-gradient(circle at 72% 40%, rgba(255,226,170,.30) 0 1.2px, transparent 2px),
            radial-gradient(circle at 58% 22%, rgba(255,200,110,.26) 0 1.1px, transparent 2px);
          animation: miDustA ${D.TOTAL}ms ease-out both;
        }

        .miDust2{
          background:
            radial-gradient(circle at 34% 70%, rgba(255,215,150,.24) 0 1.1px, transparent 2px),
            radial-gradient(circle at 64% 66%, rgba(255,199,106,.22) 0 1.1px, transparent 2px),
            radial-gradient(circle at 82% 26%, rgba(255,239,208,.28) 0 1.1px, transparent 2px);
          animation: miDustB ${D.TOTAL}ms ease-out both;
        }

        .miDust3{
          background:
            radial-gradient(circle at 42% 18%, rgba(255,244,217,.22) 0 1.1px, transparent 2px),
            radial-gradient(circle at 56% 62%, rgba(255,209,132,.18) 0 1.1px, transparent 2px);
          animation: miDustC ${D.TOTAL}ms ease-out both;
        }

        @keyframes miDustA{
          0%{ opacity:0; transform: translateY(10px); }
          20%{ opacity:.32; }
          100%{ opacity:.10; transform: translateY(-14px); }
        }
        @keyframes miDustB{
          0%{ opacity:0; transform: translateY(16px); }
          26%{ opacity:.24; }
          100%{ opacity:.08; transform: translateY(-10px); }
        }
        @keyframes miDustC{
          0%{ opacity:0; transform: translateY(8px); }
          34%{ opacity:.16; }
          100%{ opacity:.06; transform: translateY(-6px); }
        }

        /* 周囲の泡 */
        .miBubbleField{
          position:absolute;
          inset:0;
          z-index:14;
          pointer-events:none;
        }

        .miBubble{
          position:absolute;
          border-radius:999px;
          transform: translate3d(-50%,-50%,0);
          animation:
            miBubbleFloat var(--fd) ease-in-out infinite,
            miBubbleAppear .55s ease-out both;
          animation-delay: 0s, var(--del);
          will-change: transform, opacity;
          filter: drop-shadow(0 14px 22px rgba(120,72,20,.08));
        }

        @keyframes miBubbleAppear{
          from{ opacity:0; transform: translate3d(-50%,-50%,0) scale(.9); }
          to{ opacity:1; transform: translate3d(-50%,-50%,0) scale(1); }
        }

        @keyframes miBubbleFloat{
          0%{ transform: translate3d(-50%,-50%,0) translate3d(0,0,0); }
          50%{ transform: translate3d(-50%,-50%,0) translate3d(var(--dx), var(--dy), 0); }
          100%{ transform: translate3d(-50%,-50%,0) translate3d(0,0,0); }
        }

        .miBubbleCore{
          position:absolute;
          inset:0;
          border-radius:999px;
          background:
            radial-gradient(circle at 30% 30%,
              rgba(255,255,255,0.96) 0%,
              rgba(255,255,255,0.56) 14%,
              hsla(var(--h), 98%, 62%, 0.72) 38%,
              hsla(var(--h), 98%, 55%, 0.48) 60%,
              hsla(var(--h), 95%, 50%, 0.24) 78%,
              rgba(255,160,0,0.0) 100%);
          border: 1px solid rgba(255,160,0,0.22);
          box-shadow:
            inset 0 0 0 1px rgba(255,255,255,0.24),
            inset 0 -14px 24px rgba(255,140,0,0.08);
          opacity:.92;
        }

        .miBubbleHi{
          position:absolute;
          inset: 10% 14% auto auto;
          width: 36%;
          height: 36%;
          border-radius:9999px;
          background: radial-gradient(circle, rgba(255,255,255,0.92), rgba(255,255,255,0) 70%);
          opacity:.92;
        }

        .miBubble.isPopped{
          animation: none;
          filter: none;
        }

        .miBubblePuff{
          position:absolute;
          inset:-22%;
          border-radius:9999px;
          background: radial-gradient(circle, rgba(255,255,255,0.92), rgba(255,255,255,0) 62%);
          opacity:0;
          transform: scale(.6);
          filter: blur(.6px);
        }

        .miBubbleBits{
          position:absolute;
          inset:-40%;
          border-radius:9999px;
          opacity:0;
          background:
            radial-gradient(circle at 22% 40%, rgba(255,160,0,0.74) 0 2px, rgba(255,160,0,0) 3px),
            radial-gradient(circle at 68% 28%, rgba(255,210,120,0.70) 0 2px, rgba(255,210,120,0) 3px),
            radial-gradient(circle at 42% 72%, rgba(255,140,0,0.64) 0 2px, rgba(255,140,0,0) 3px),
            radial-gradient(circle at 78% 66%, rgba(255,220,140,0.58) 0 2px, rgba(255,220,140,0) 3px),
            radial-gradient(circle at 32% 22%, rgba(255,255,255,0.64) 0 2px, rgba(255,255,255,0) 3px);
          transform: scale(.7);
          filter: blur(.15px);
        }

        .miBubble.isPopped .miBubbleCore{
          animation: miBubblePopCore 520ms cubic-bezier(.2,.9,.2,1) forwards;
        }

        .miBubble.isPopped .miBubbleHi{
          animation: miBubblePopHi 520ms cubic-bezier(.2,.9,.2,1) forwards;
        }

        .miBubble.isPopped .miBubblePuff{
          animation: miBubblePuff 520ms ease-out forwards;
        }

        .miBubble.isPopped .miBubbleBits{
          animation: miBubbleBits 520ms ease-out forwards;
        }

        @keyframes miBubblePopCore{
          0%{ transform: scale(1); opacity:1; }
          35%{ transform: scale(1.08); opacity:1; }
          100%{ transform: scale(0.55); opacity:0; }
        }

        @keyframes miBubblePopHi{
          0%{ transform: scale(1); opacity:.92; }
          60%{ transform: scale(1.26); opacity:.76; }
          100%{ transform: scale(0.7); opacity:0; }
        }

        @keyframes miBubblePuff{
          0%{ opacity:0; transform: scale(.55); }
          30%{ opacity:.9; transform: scale(1.04); }
          100%{ opacity:0; transform: scale(1.32); }
        }

        @keyframes miBubbleBits{
          0%{ opacity:0; transform: scale(.75); }
          30%{ opacity:.86; transform: scale(1.02); }
          100%{ opacity:0; transform: scale(1.2); }
        }

        .miStage{
          position:absolute;
          left:50%;
          top:46%;
          width:min(62vw, 520px);
          aspect-ratio:1 / 1;
          transform:translate(-50%, -50%);
          z-index:20;
        }

        .miLayer{
          position:absolute;
          inset:0;
          will-change: transform, opacity, filter;
        }

        .miImg{
          object-fit:contain;
          user-select:none;
          -webkit-user-drag:none;
          pointer-events:none;
        }

        .whole,
        .peel1,
        .peel2{
          transform:
            translate(var(--tx), var(--ty))
            scale(var(--sx));
          filter: drop-shadow(0 10px 18px rgba(108,72,28,.08));
        }

        .whole{
          z-index:3;
          opacity:0;
          animation: wholeAnim ${D.TOTAL}ms cubic-bezier(.22,.84,.2,1) both;
        }

        @keyframes wholeAnim{
          0%{
            opacity:0;
            transform: translate(var(--tx), calc(var(--ty) + 18px)) scale(calc(var(--sx) * .93));
            filter: blur(8px) drop-shadow(0 6px 10px rgba(108,72,28,.04));
          }
          10%{
            opacity:1;
            transform: translate(var(--tx), var(--ty)) scale(var(--sx));
            filter: blur(0px) drop-shadow(0 10px 18px rgba(108,72,28,.08));
          }
          30%{
            opacity:1;
            transform: translate(var(--tx), calc(var(--ty) - 1px)) scale(calc(var(--sx) * 1.002));
            filter: blur(0px) drop-shadow(0 10px 18px rgba(108,72,28,.08));
          }
          40%{
            opacity:0;
            transform: translate(var(--tx), calc(var(--ty) - 1px)) scale(calc(var(--sx) * 1.004));
            filter: blur(.5px) drop-shadow(0 10px 18px rgba(108,72,28,.06));
          }
          100%{
            opacity:0;
          }
        }

        .peel1{
          z-index:4;
          opacity:0;
          animation: peel1Anim ${D.TOTAL}ms cubic-bezier(.22,.84,.2,1) both;
        }

        @keyframes peel1Anim{
          0%, 24%{
            opacity:0;
            transform: translate(var(--tx), calc(var(--ty) + 12px)) scale(calc(var(--sx) * .97));
            filter: blur(7px) drop-shadow(0 6px 10px rgba(108,72,28,.04));
          }
          34%{
            opacity:1;
            transform: translate(var(--tx), var(--ty)) scale(var(--sx));
            filter: blur(.4px) drop-shadow(0 10px 18px rgba(108,72,28,.08));
          }
          40%{
            opacity:1;
            transform: translate(var(--tx), var(--ty)) scale(var(--sx));
            filter: blur(0px) drop-shadow(0 10px 18px rgba(108,72,28,.08));
          }
          52%{
            opacity:1;
            transform: translate(var(--tx), calc(var(--ty) - 1px)) scale(calc(var(--sx) * 1.003));
            filter: blur(0px) drop-shadow(0 10px 18px rgba(108,72,28,.08));
          }
          62%{
            opacity:0;
            transform: translate(var(--tx), calc(var(--ty) - 1px)) scale(calc(var(--sx) * 1.005));
            filter: blur(.5px) drop-shadow(0 10px 18px rgba(108,72,28,.06));
          }
          100%{
            opacity:0;
          }
        }

        .peel2{
          z-index:5;
          opacity:0;
          animation: peel2Anim ${D.TOTAL}ms cubic-bezier(.22,.84,.2,1) both;
        }

        @keyframes peel2Anim{
          0%, 48%{
            opacity:0;
            transform: translate(var(--tx), calc(var(--ty) + 10px)) scale(calc(var(--sx) * .98));
            filter: blur(6px) drop-shadow(0 6px 10px rgba(108,72,28,.04));
          }
          58%{
            opacity:1;
            transform: translate(var(--tx), var(--ty)) scale(var(--sx));
            filter: blur(.4px) drop-shadow(0 10px 18px rgba(108,72,28,.08));
          }
          64%{
            opacity:1;
            transform: translate(var(--tx), var(--ty)) scale(var(--sx));
            filter: blur(0px) drop-shadow(0 10px 18px rgba(108,72,28,.08));
          }
          78%{
            opacity:1;
            transform: translate(var(--tx), calc(var(--ty) - 2px)) scale(calc(var(--sx) * 1.004));
            filter: blur(0px) drop-shadow(0 10px 18px rgba(108,72,28,.08));
          }
          100%{
            opacity:1;
            transform: translate(var(--tx), calc(var(--ty) - 3px)) scale(calc(var(--sx) * 1.006));
            filter: blur(0px) drop-shadow(0 10px 18px rgba(108,72,28,.08));
          }
        }

        .miShadow{
          position:absolute;
          left:50%;
          bottom:10%;
          width:44%;
          height:9%;
          transform:translateX(-50%);
          border-radius:999px;
          background: radial-gradient(circle, rgba(115,75,23,.14), rgba(115,75,23,0) 72%);
          filter: blur(12px);
          opacity:0;
          animation: shadowAnim ${D.TOTAL}ms ease-in-out both;
        }

        @keyframes shadowAnim{
          0%{ opacity:0; transform:translateX(-50%) scale(.86); }
          14%{ opacity:.10; }
          58%{ opacity:.14; transform:translateX(-50%) scale(1); }
          100%{ opacity:.10; transform:translateX(-50%) scale(1.04); }
        }

        .miLogoWrap{
          position:absolute;
          left:50%;
          bottom:clamp(52px, 9vh, 90px);
          transform:translateX(-50%);
          z-index:30;
          text-align:center;
          width:min(92vw, 900px);
          opacity:0;
          animation: logoAnim ${D.TOTAL}ms cubic-bezier(.22,.84,.2,1) both;
        }

        @keyframes logoAnim{
          0%, 58%{
            opacity:0;
            transform:translateX(-50%) translateY(16px);
            filter: blur(8px);
          }
          68%{
            opacity:1;
            transform:translateX(-50%) translateY(0px);
            filter: blur(0px);
          }
          100%{
            opacity:1;
            transform:translateX(-50%) translateY(-2px);
            filter: blur(0px);
          }
        }

        .miLogoMain{
          font-size:clamp(28px, 5.1vw, 60px);
          line-height:1.08;
          font-weight:900;
          letter-spacing:.10em;
          color:rgba(176,96,16,.95);
          text-shadow: 0 6px 24px rgba(148,89,18,.08);
        }

        .miLogoSub{
          margin-top:10px;
          font-size:clamp(11px, 1.5vw, 15px);
          font-weight:700;
          letter-spacing:.22em;
          color:rgba(96,67,34,.62);
        }

        @media (max-width: 768px){
          .miStage{
            width:min(78vw, 430px);
            top:45%;
          }
        }

        @media (max-width: 430px){
          .miSkip{
            top:10px;
            right:10px;
            padding:9px 12px;
            font-size:12px;
          }

          .miStage{
            width:min(84vw, 360px);
            top:43%;
          }

          .miLogoMain{
            font-size:clamp(24px, 8vw, 40px);
            letter-spacing:.08em;
          }

          .miLogoSub{
            font-size:11px;
            letter-spacing:.16em;
          }
        }

        @media (prefers-reduced-motion: reduce){
          .miBg,.miGlowBack,.miGlowCenter,.miDust1,.miDust2,.miDust3,
          .miBubble,.whole,.peel1,.peel2,.miShadow,.miLogoWrap{
            animation:none !important;
          }
        }
      `}</style>
    </div>
  );
}