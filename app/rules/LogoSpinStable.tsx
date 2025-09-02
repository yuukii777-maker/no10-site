"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

/** 画面中央に固定し、ロゴの“中心”を軸にその場回転だけを行う */
export default function LogoSpinStable() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });
    renderer.setClearColor(0x000000, 0);
    (renderer as any).outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 6);

    // ---- Pivot(0,0,0)にモデルを置く → “その場回転”だけになる ----
    const group = new THREE.Group();
    scene.add(group);

    const geo = new THREE.PlaneGeometry(1, 1);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      metalness: 0.86,
      roughness: 0.25,
      depthWrite: false,
      toneMapped: false,
      alphaTest: 0.02,
      side: THREE.DoubleSide, // 片面の裏返りを無くす
    });

    // 単一メッシュにして余計なズレ要因を排除
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, 0, 0);
    group.add(mesh);

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));

    // テクスチャ：PNGでもWEBPでもOK（存在する方に合わせて）
    new THREE.TextureLoader().load(
      "/RULE/volce-logo-3d.png",
      (tex) => {
        const aniso =
          (renderer.capabilities as any).getMaxAnisotropy?.() ?? 1;
        (tex as any).colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = aniso;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        mat.map = tex;
        mat.alphaMap = tex;
        mat.needsUpdate = true;
      },
      undefined,
      () => {
        // webp だけある場合
        new THREE.TextureLoader().load("/RULE/volce-logo-3d.webp", (tex) => {
          (tex as any).colorSpace = THREE.SRGBColorSpace;
          mat.map = tex;
          mat.alphaMap = tex;
          mat.needsUpdate = true;
        });
      }
    );

    // レイアウト：常に画面中央・スケールのみ調整
    const layout = () => {
      const w = wrap.clientWidth,
        h = wrap.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      const dist = camera.position.z - 0; // meshはz=0
      const vHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * dist;
      const target = vHeight * 0.33; // 画面高の33%程度に見える大きさ
      group.scale.setScalar(target);
      group.position.set(0, 0, 0); // ど真ん中固定
    };
    const ro = new ResizeObserver(layout);
    ro.observe(wrap);
    layout();

    let raf = 0;
    const tick = () => {
      // “自転のみ”：Y軸回転だけ、位置は一切動かさない
      group.rotation.set(0, group.rotation.y + 0.005, 0);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      geo.dispose();
      mat.map?.dispose();
      mat.alphaMap?.dispose();
      mat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="layer"
      aria-hidden="true"
      // ど真ん中に固定表示（本文の下・背景の上）
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9,
        pointerEvents: "none",
      }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
