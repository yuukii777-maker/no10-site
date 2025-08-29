/* eslint-disable @next/next/no-img-element */
"use client";

import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { useMemo, useRef } from "react";

const SHA = (process.env.NEXT_PUBLIC_COMMIT_SHA || "").toString().slice(0, 8);
const Q = SHA ? `?v=${SHA}` : "";

/** 調整値（強さ・サイズ・浮遊など） */
const CFG = {
  floatAmp: 0.26,
  floatSpd: 1.05,
  tiltAmp: { x: 0.18, y: 0.22 },
  logo:     { scale: [2.5, 1.0, 1] as [number, number, number] },
  rays:     { scale: [3.2, 1.7, 1] as [number, number, number], y: 0.25 },
  flareWide:{ scale: [5.4, 2.2, 1] as [number, number, number], y: 0.23, base: 0.38 },
  flareCore:{ scale: [3.0, 3.0, 1] as [number, number, number], y: 0.26, base: 0.55 },
};

function ThreeLogo() {
  const group = useRef<THREE.Group>(null);
  const raysRef = useRef<THREE.Mesh>(null);
  const flareWideRef = useRef<THREE.Mesh>(null);
  const flareCoreRef = useRef<THREE.Mesh>(null);

  const plane = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const makeMat = (url: string, blending: THREE.Blending = THREE.NormalBlending) => {
    const tex = new THREE.TextureLoader().load(url + Q);
    tex.anisotropy = 8;
    return new THREE.MeshBasicMaterial({
      map: tex, transparent: true, depthWrite: false, blending,
    });
  };

  // テクスチャ
  const logoMat      = useMemo(() => makeMat("/portal/logo.webp"), []);
  const raysMat      = useMemo(() => makeMat("/portal/rays.webp", THREE.AdditiveBlending), []);
  const flareWideMat = useMemo(() => makeMat("/portal/flare_wide.webp", THREE.AdditiveBlending), []);
  const flareCoreMat = useMemo(() => makeMat("/portal/flare_core.webp", THREE.AdditiveBlending), []);

  useFrame(({ clock, mouse }) => {
    const t = clock.getElapsedTime();

    // 浮遊 & マウス傾き
    if (group.current) {
      group.current.position.y = Math.sin(t * CFG.floatSpd) * CFG.floatAmp;
      const tx = (mouse.y || 0) * CFG.tiltAmp.x;
      const ty = (mouse.x || 0) * CFG.tiltAmp.y;
      group.current.rotation.x += (tx - group.current.rotation.x) * 0.08;
      group.current.rotation.y += (-ty - group.current.rotation.y) * 0.08;
    }

    // 翼のゆらぎ
    if (raysRef.current) {
      const m = raysRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.45 + Math.sin(t * 1.2) * 0.08;
      raysRef.current.rotation.z = Math.sin(t * 0.3) * 0.05;
    }

    // フレア（パルス & 微回転）
    if (flareWideRef.current) {
      const m = flareWideRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = CFG.flareWide.base + Math.sin(t * 1.3) * 0.12;
      flareWideRef.current.rotation.z = Math.sin(t * 0.25) * 0.03;
    }
    if (flareCoreRef.current) {
      const m = flareCoreRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = CFG.flareCore.base + Math.sin(t * 1.6) * 0.18;
      const s = 1 + Math.sin(t * 1.1) * 0.035;
      flareCoreRef.current.scale.set(
        CFG.flareCore.scale[0] * s,
        CFG.flareCore.scale[1] * s,
        1
      );
    }
  });

  return (
    <group ref={group} position={[0, 0.15, 0]}>
      {/* 横長フレア → 翼 → フレア核 → ロゴ の順で重ねる */}
      <mesh
        ref={flareWideRef}
        position={[0, CFG.flareWide.y, -0.02]}
        scale={CFG.flareWide.scale}
        geometry={plane}
        material={flareWideMat}
      />
      <mesh
        ref={raysRef}
        position={[0, CFG.rays.y, -0.01]}
        scale={CFG.rays.scale}
        geometry={plane}
        material={raysMat}
      />
      <mesh
        ref={flareCoreRef}
        position={[0, CFG.flareCore.y, 0]}
        scale={CFG.flareCore.scale}
        geometry={plane}
        material={flareCoreMat}
      />
      <mesh
        position={[0, 0, 0.05]}
        scale={CFG.logo.scale}
        geometry={plane}
        material={logoMat}
      />
    </group>
  );
}

export default function ThreeHero() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 8.5], fov: 45 }}
      gl={{ alpha: true, antialias: true }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[2, 3, 4]} intensity={1.3} />
      <Environment preset="sunset" />
      <ThreeLogo />
    </Canvas>
  );
}
