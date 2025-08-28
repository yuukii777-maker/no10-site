"use client";
import { useEffect, useRef } from "react";


type Props = {
src?: string; // 例: "/audio/megami.mp3"
volume?: number; // 0.0 - 1.0
startOnFirstInput?: boolean; // true: 画面の最初のタップ/クリックで開始（UIを出さない）
};


/**
* デザインを変えないBGM制御。
* - 画面UIは一切出さない
* - iOSの自動再生制限に対応：初回ユーザー操作で開始
* - preload="none" で初期通信ゼロ
*/
export default function AudioController({ src = "/audio/megami.mp3", volume = 0.55, startOnFirstInput = true }: Props) {
const audioRef = useRef<HTMLAudioElement | null>(null);
const startedRef = useRef(false);


useEffect(() => {
const a = new Audio(src);
a.loop = true;
a.preload = "none"; // ← 自動プリロードしない
a.volume = 0; // フェードイン開始点
a.crossOrigin = "anonymous";
// iOSでの無音再生対策（実音量は後でフェードイン）
// ※mutedは一部環境で必要ないが安全のため最初だけ0音量で開始
audioRef.current = a;


const start = async () => {
if (startedRef.current || !audioRef.current) return;
try {
startedRef.current = true;
await audioRef.current.play();
// フェードイン
const target = Math.max(0, Math.min(1, volume));
let v = 0;
const step = () => {
v = Math.min(target, v + 0.05);
if (audioRef.current) audioRef.current.volume = v;
if (v < target) requestAnimationFrame(step);
};
requestAnimationFrame(step);
} catch (e) {
// ブロックされてもUIは出さない。次の入力で再試行。
startedRef.current = false;
}
};


const evs = ["pointerdown", "touchstart", "mousedown", "keydown"] as const;
const onAny = () => { if (startOnFirstInput) start(); };
evs.forEach(t => window.addEventListener(t, onAny, { passive: true, once: true }));


return () => {
evs.forEach(t => window.removeEventListener(t, onAny));
audioRef.current?.pause();
audioRef.current = null;
};
}, [src, volume, startOnFirstInput]);


return null; // UIは出さない
}