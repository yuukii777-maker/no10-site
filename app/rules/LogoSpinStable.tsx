"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// 1周 ≒ 24～26秒
const ROT_SPEED = 0.0045;
const TARGET_VIEWPORT_HEIGHT_RATIO = 0.34;

export default function LogoSpinStable() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace as any;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 6);

    // 回転用グループ（ここを回す）
    const group = new THREE.Group();
    scene.add(group);

    // 共通ジオメトリ & マテリアル
    const geo = new THREE.PlaneGeometry(1, 1);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      metalness: 0.86,
      roughness: 0.25,
      opacity: 1,
      depthWrite: false,
      toneMapped: false,
      alphaTest: 0.02, // ほぼ透明ピクセルを落としてフチのにじみ軽減
      side: THREE.FrontSide, // 両面は2枚メッシュで対応
    });

    // front / back（裏面は水平反転）
    const front = new THREE.Mesh(geo, mat);
    front.position.set(0, 0, -1.0);
    front.rotation.x = THREE.MathUtils.degToRad(6);

    const back = new THREE.Mesh(geo, mat);
    back.position.set(0, 0, -1.0002); // z-fighting回避に極小オフセット
    back.rotation.x = THREE.MathUtils.degToRad(6);
    back.rotation.y = Math.PI;        // 180度反転
    back.scale.x = -1;                // 水平反転して正しい向きに

    group.add(front, back);

    // 簡易環境光（テクスチャ主体だが少しだけ質感を残す）
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));

    // テクスチャ
    new THREE.TextureLoader().load("/RULE/volce-logo-3d.png", (tex) => {
      const aniso =
        (renderer.capabilities as any).getMaxAnisotropy?.() ?? 1;
      tex.anisotropy = aniso;
      tex.flipY = false;
      (tex as any).colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      mat.map = tex;
      mat.alphaMap = tex;
      mat.needsUpdate = true;
    });

    // レイアウト（既存ロジックを踏襲）
    const layout = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      const dist = camera.position.z - front.position.z;
      const vHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * dist;
      const target = vHeight * TARGET_VIEWPORT_HEIGHT_RATIO;
      group.scale.setScalar(target);
      group.position.y = vHeight * 0.16; // 画面上方へ少し
    };

    const ro = new ResizeObserver(layout);
    ro.observe(wrap);
    layout();

    let raf = 0;
    const tick = () => {
      const k = document.documentElement.classList.contains("reduced") ? 0 : 1;
      group.rotation.y += ROT_SPEED * k;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      // 片付け
      geo.dispose();
      mat.map?.dispose();
      mat.alphaMap?.dispose();
      mat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={wrapRef} className="layer" aria-hidden="true">
      <canvas ref={canvasRef} className="cv" />
      <style jsx>{`
        .layer { position: fixed; inset: 0; z-index: 9; pointer-events: none }
        .cv { width: 100%; height: 100%; display: block }
      `}</style>
    </div>
  );
}
