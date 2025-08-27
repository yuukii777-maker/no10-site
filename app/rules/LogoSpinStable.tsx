"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

// 1周 ≒ 24～26秒（ゆっくり）
const ROT_SPEED = 0.0045; // radians/frame @60fps
const TARGET_VIEWPORT_HEIGHT_RATIO = 0.34; // ロゴの見かけ高さ(画面高さの34%)

export default function LogoSpinStable() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 6);

    const root = new THREE.Group();
    scene.add(root);

    // 基本は1x1の正方形にしてスケールで調整
    const geo = new THREE.PlaneGeometry(1, 1);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff, transparent: true, metalness:.85, roughness:.25,
      opacity:.98, depthWrite:false, toneMapped:false
    });
    const logo = new THREE.Mesh(geo, mat);
    logo.position.set(0, 0, -1.0);
    logo.rotation.x = THREE.MathUtils.degToRad(6); // わずかに前傾
    root.add(logo);

    const rim = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ color: 0xc7a756, side: THREE.BackSide, transparent: true, opacity: 0.85 })
    );
    rim.position.copy(logo.position);
    rim.rotation.x = logo.rotation.x;
    root.add(rim);

    // ライト
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(2.6, 3.6, 4.4);
    root.add(key);
    root.add(new THREE.AmbientLight(0xffffff, .7));

    // テクスチャ
    new THREE.TextureLoader().load("/RULE/volce-logo-3d.png", (tex) => {
      const maxAniso = (renderer.capabilities as any).getMaxAnisotropy?.() ?? 1;
      tex.anisotropy = maxAniso;
      mat.map = tex; mat.alphaMap = tex; mat.needsUpdate = true;
    });

    // レイアウト：どの画面でも「全体が見える」ようにスケール＆位置を計算
    const layout = () => {
      const w = wrap.clientWidth, h = wrap.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();

      // カメラからロゴまでの距離における可視高さ（ワールド単位）
      const dist = camera.position.z - logo.position.z; // = 7
      const vHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * dist; // その距離で画面に映る高さ
      const targetWorldHeight = vHeight * TARGET_VIEWPORT_HEIGHT_RATIO; // 高さを画面の34%に
      logo.scale.setScalar(targetWorldHeight);       // 正方形なのでX=Y同値
      rim.scale.setScalar(targetWorldHeight * 1.035);

      // 画面内で少し上に配置（全体が見える安全域）
      const yOffset = vHeight * 0.16; // 画面高さの16%上へ
      logo.position.y = yOffset;
      rim.position.y = yOffset;
    };

    const ro = new ResizeObserver(layout);
    ro.observe(wrap);
    layout();

    // 連続回転（横方向：Y軸）
    let raf = 0;
    const tick = () => {
      const k = document.documentElement.classList.contains("reduced") ? 0 : 1;
      logo.rotation.y += ROT_SPEED * k;
      rim.rotation.y = logo.rotation.y;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); };
  }, []);

  return (
    <div ref={wrapRef} className="layer" aria-hidden="true">
      <canvas ref={canvasRef} className="cv"/>
      <style jsx>{`
        /* 背景(0)と本文(10)の間で確実に見える */
        .layer{ position:fixed; inset:0; z-index:9; pointer-events:none }
        .cv{width:100%; height:100%; display:block}
      `}</style>
    </div>
  );
}
