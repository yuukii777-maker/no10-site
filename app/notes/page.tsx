/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import styles from "./parallax-notes.module.css";

/* === BGM 設定（1曲のみ） ==================== */
/* 置き場所は public/audio/ にしてください */
const MUSIC_SRC = "/audio/seasong.mp3";
const MUSIC_VOLUME = 0.45; // 0..1
/* =========================================== */

export default function NotesParallaxPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef  = useRef<HTMLAudioElement | null>(null);

  // 既定：ON。保存値があればそれを使う
  const [bgmOn, setBgmOn] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return (localStorage.getItem("volce_bgm") ?? "on") !== "off";
  });

  // フェード
  const fadeTo = (target: number, ms: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const steps = 24;
    const dv = (target - audio.volume) / steps;
    let i = 0;
    const id = window.setInterval(() => {
      const a = audioRef.current;
      if (!a) return window.clearInterval(id);
      i++;
      a.volume = Math.max(0, Math.min(1, a.volume + dv));
      if (i >= steps) window.clearInterval(id);
    }, ms / steps);
  };

  // BGMトグル
  const handleToggleBgm = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (bgmOn) {
      // OFF
      fadeTo(0, 400);
      setTimeout(() => { audio.pause(); audio.muted = true; }, 420);
      setBgmOn(false);
      try { localStorage.setItem("volce_bgm", "off"); } catch {}
    } else {
      // ON（ユーザ操作なので確実に解錠）
      audio.muted = false;
      audio.play().catch(() => {});
      fadeTo(MUSIC_VOLUME, 900);
      setBgmOn(true);
      try { localStorage.setItem("volce_bgm", "on"); } catch {}
    }
  };

  useEffect(() => {
    /* ===== Three.js ===== */
    const canvas = canvasRef.current!;
    const renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: true, powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8);

    const group = new THREE.Group();
    scene.add(group);

    const loader = new THREE.TextureLoader();
    const makePlane = (url: string, size: [number, number], pos: [number, number, number], shadow=false) => {
      const tex = loader.load(url);
      tex.anisotropy = 8;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
      const geo = new THREE.PlaneGeometry(size[0], size[1]);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...pos);
      if (shadow) {
        const m2 = mat.clone(); m2.opacity = 0.28;
        const r = new THREE.Mesh(geo, m2);
        r.scale.y = -0.75; r.position.set(pos[0], pos[1]-1.1, pos[2]+0.02);
        r.rotation.x = THREE.MathUtils.degToRad(2);
        group.add(r);
      }
      group.add(mesh);
      return mesh;
    };

    const columns = makePlane("/notes3d/ruins_columns.png", [6.6, 9], [-2.6, -0.4, -1.4]);
    const island  = makePlane("/notes3d/floating_island.png", [7.2, 4.2], [1.4, -0.3, 0.2], true);
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));

    const onResize = () => {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    let mx = 0, my = 0, sy = 0;
    const onMouse = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouse);

    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight || 1;
      sy = window.scrollY / max;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    /* ===== BGM（1曲のみ） ===== */
    const audio = new Audio(MUSIC_SRC);
    audio.preload = "auto";
    audio.loop = true;
    audio.crossOrigin = "anonymous";
    audio.volume = 0;       // 後からフェードで上げる
    audio.muted = !bgmOn;   // 保存状態を反映
    audioRef.current = audio;

    const unlock = () => {
      audio.muted = !bgmOn ? true : false;
      if (bgmOn) { audio.play().catch(() => {}); fadeTo(MUSIC_VOLUME, 1000); }
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
      document.removeEventListener("click", unlock);
    };

    // 自動再生トライ → 失敗時は初回ジェスチャで解錠
    audio.load();
    audio.play()
      .then(() => { if (bgmOn) fadeTo(MUSIC_VOLUME, 1000); })
      .catch(() => {
        window.addEventListener("pointerdown", unlock, { once: true });
        window.addEventListener("keydown", unlock, { once: true });
        window.addEventListener("touchstart", unlock, { once: true });
        document.addEventListener("click", unlock, { once: true });
      });

    const onVis = () => {
      if (document.visibilityState === "hidden") audio.pause();
      else if (bgmOn) audio.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVis);
    const onPageHide = () => { audio.pause(); };
    const onPageShow = () => { if (bgmOn) audio.play().catch(() => {}); };
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);

    // ===== animation =====
    let rafId = 0;
    const clock = new THREE.Clock();
    const tick = () => {
      const t = clock.getElapsedTime();
      (group.rotation as any).y += ((mx * 0.18) - group.rotation.y) * 0.05;
      (group.rotation as any).x += ((-my * 0.12) - group.rotation.x) * 0.05;
      group.position.y += ((sy * -2.4) - group.position.y) * 0.05;

      island.position.y  = -0.3 + Math.sin(t * 1.1) * 0.15;
      columns.position.y = -0.4 + Math.sin(t * 0.6) * 0.08;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    // ===== cleanup =====
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVis);

      renderer.dispose();
      scene.traverse((obj) => {
        const m = (obj as THREE.Mesh).material as THREE.Material | undefined;
        if (m && "map" in m) (m as THREE.MeshBasicMaterial).map?.dispose();
        (obj as any).geometry?.dispose?.();
      });

      audio.pause();
      audio.src = "";
      audio.load();
      audioRef.current = null;
    };
  }, [bgmOn]);

  return (
    <div className={styles.stage}>
      {/* layered backgrounds */}
      <div className={styles.bg} />
      <div className={styles.rays} aria-hidden />
      <div className={styles.clouds} aria-hidden />

      {/* 3D canvas */}
      <canvas ref={canvasRef} className={styles.canvas3d} />

      {/* Hero / FAQ（UIはそのまま） */}
      <header className={styles.hero} role="region" aria-labelledby="faqTitle">
        <div className={styles.glass}>
          <h1 id="faqTitle">注意事項・よくある質問</h1>

          <dl className={styles.faq}>
            <div className={styles.qa}>
              <dt>Q. タイムラインに動画や画像を読み込ませると画面が固まります。</dt>
              <dd>
                A. 容量に応じて投稿完了まで時間がかかる場合があります。画面が止まっても完了までお待ちください。<br />
                <small>※ 3分以上動かない場合は、公式LINEなどからご連絡ください。</small>
              </dd>
            </div>

            <div className={styles.qa}>
              <dt>Q. 投稿時の合言葉は何でも良いですか？</dt>
              <dd>
                A. 基本は任意ですが、1 や 0000 など単純なものは避けてください。必要に応じて更新します。
              </dd>
            </div>
          </dl>
        </div>
      </header>

      {/* 左下 BGM トグル */}
      <button
        type="button"
        aria-label={bgmOn ? "BGMをオフ" : "BGMをオン"}
        aria-pressed={bgmOn}
        className={`${styles.bgm} ${bgmOn ? styles.bgmOn : styles.bgmOff}`}
        onClick={handleToggleBgm}
        title={bgmOn ? "BGM: ON" : "BGM: OFF"}
      >
        {bgmOn ? "♪" : "🔇"}
      </button>
    </div>
  );
}
