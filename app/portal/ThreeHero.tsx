"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = {
  deviceIsMobile: boolean;
  scrollY: number;
  onContextLost?: () => void;
};

export default function ThreeHero({ deviceIsMobile, onContextLost }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;

    const hasWebGL = (() => {
      try {
        const c = document.createElement("canvas");
        // @ts-ignore
        return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
      } catch {
        return false;
      }
    })();
    if (!hasWebGL) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    // @ts-ignore
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 6);

    const loader = new THREE.TextureLoader();
    const tex = loader.load("/portal/logo.webp");

    // 中央ロゴ（平面）―― 自転のみ・公転なし
    const g = new THREE.PlaneGeometry(4, (4 * 9) / 16);
    const m = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
    });
    const logo = new THREE.Mesh(g, m);
    scene.add(logo);

    // ほんのりゴールドグロー（外周フェード）
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, (4.6 * 9) / 16),
      new THREE.MeshBasicMaterial({
        color: 0xffd88a,
        transparent: true,
        opacity: 0.18,
      })
    );
    glow.renderOrder = -1;
    scene.add(glow);

    let ro: ResizeObserver | undefined;
    const fit = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    ro = new ResizeObserver(fit);
    ro.observe(wrap);
    fit();

    let t = 0;
    let raf = 0;
    const loop = () => {
      t += 0.016;
      // 自転（その場回転）
      logo.rotation.z = Math.sin(t * 0.6) * 0.06;
      logo.rotation.y = Math.sin(t * 0.18) * 0.05;
      glow.rotation.z = logo.rotation.z;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onLost = () => onContextLost?.();
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      canvas.removeEventListener("webglcontextlost", onLost);
      ro?.disconnect();
      cancelAnimationFrame(raf);
      renderer.dispose();
      g.dispose();
      (m.map as any)?.dispose?.();
      m.dispose();
    };
  }, [deviceIsMobile, onContextLost]);

  return (
    <div
      ref={wrapRef}
      style={{ position: "absolute", inset: 0, zIndex: 30, pointerEvents: "none" }}
      aria-hidden
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
