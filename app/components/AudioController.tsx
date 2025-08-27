"use client";
import { useEffect, useRef, useState } from "react";

type Props = { src?: string; volume?: number };

export default function AudioController({ src="/audio/megami.mp3", volume=0.55 }: Props){
  const audioRef = useRef<HTMLAudioElement|null>(null);
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const a = new Audio(src);
    a.loop = true; a.preload = "auto"; a.volume = 0;
    const ok = () => setReady(true);
    a.addEventListener("canplaythrough", ok, { once:true });
    audioRef.current = a;
    return () => { a.pause(); a.removeEventListener("canplaythrough", ok); audioRef.current = null; };
  }, [src]);

  const fade = (to: number, ms=900) => {
    const a = audioRef.current; if(!a) return;
    const from = a.volume; const steps = 28; const dt = ms/steps; let i=0;
    const id = setInterval(()=>{ i++; a.volume = from + (to-from)*(i/steps); if(i>=steps){ clearInterval(id); a.volume=to; } }, dt);
  };

  const toggle = async () => {
    const a = audioRef.current; if(!a) return;
    if (!on) { try { await a.play(); setOn(true); fade(volume); } catch{} }
    else { fade(0, 500); setOn(false); setTimeout(()=>a.pause(), 520); }
  };

  return (
    <>
      <style jsx>{`
        .btn{
          position:fixed; left:16px; bottom:calc(16px + env(safe-area-inset-bottom,0)); z-index:60;
          padding:12px 14px; border-radius:999px; color:#fff; font-weight:700; letter-spacing:.04em;
          background: rgba(18,18,22,.62); border:1px solid rgba(255,255,255,.14);
          box-shadow: 0 8px 22px rgba(0,0,0,.35); -webkit-tap-highlight-color:transparent;
        }
        .btn:active{ transform: translateY(1px); }
        .badge{ font-size:12px; opacity:.8; margin-left:8px }
      `}</style>
      <button className="btn" onClick={toggle} aria-label="Toggle BGM">
        {on ? "Pause BGM" : "Play BGM"}
        <span className="badge">{ready ? "" : "…loading"}</span>
      </button>
    </>
  );
}
