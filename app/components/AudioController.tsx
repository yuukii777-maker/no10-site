"use client";
import { useEffect, useRef } from "react";

declare global {
  interface Window { __VOLCE_AUDIO__?: HTMLAudioElement }
}

type Props = {
  src?: string;
  volume?: number;
  startOnFirstInput?: boolean;
};

export default function AudioController({
  src = "/audio/megami.mp3",
  volume = 0.55,
  startOnFirstInput = true,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    // すでにどこかで初期化されていればそれを使う（多重再生ガード）
    if (typeof window !== "undefined" && window.__VOLCE_AUDIO__) {
      audioRef.current = window.__VOLCE_AUDIO__;
      return;
    }

    const a = new Audio(src);
    a.loop = true;
    a.preload = "none";   // 初期ダウンロードしない
    a.volume = 0;         // フェードイン開始点
    a.crossOrigin = "anonymous";

    audioRef.current = a;
    if (typeof window !== "undefined") window.__VOLCE_AUDIO__ = a;

    const start = async () => {
      if (startedRef.current || !audioRef.current) return;
      try {
        startedRef.current = true;
        await audioRef.current.play();
        const target = Math.max(0, Math.min(1, volume));
        let v = 0;
        const step = () => {
          if (!audioRef.current) return;
          v = Math.min(target, v + 0.05);
          audioRef.current.volume = v;
          if (v < target) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      } catch {
        startedRef.current = false; // 次の入力で再試行
      }
    };

    const evs = ["pointerdown", "touchstart", "mousedown", "keydown"] as const;
    const onAny = () => { if (startOnFirstInput) start(); };
    evs.forEach(t => window.addEventListener(t, onAny, { passive: true, once: true }));

    return () => {
      evs.forEach(t => window.removeEventListener(t, onAny));
      // ページ遷移でも切れないよう停止はしない
    };
  }, [src, volume, startOnFirstInput]);

  return null;
}
