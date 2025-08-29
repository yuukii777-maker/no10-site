/* eslint-disable @next/next/no-img-element */
"use client";

import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { useMemo, useRef } from "react";

const SHA = (process.env.NEXT_PUBLIC_COMMIT_SHA || "").toString().slice(0, 8);
const Q = SHA ? `?v=${SHA}` : "";

const CFG = { floatAmp: 0.28, floatSpd: 1.1, tiltAmp: { x: 0.18, y: 0.22 } } as const;

function ThreeLogo() {
  const group = useRef<THREE.Group>(null);
  const raysRef = useRef<THREE.Mesh>(null);

  const plane = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const makeMat = (url: string, transparent = true, blending?: THREE.Blending) => {
    const tex = new THREE.TextureLoader().load(url + Q);
    tex.anisotropy = 8;
    return new THREE.MeshBasicMaterial({ map: tex, transparent, depthWrite: false, blending });
  };

  const logoMat = useMemo(() => makeMat("/portal/logo.webp", true), []);
  const raysMat = useMemo(() => makeMat("/portal/rays.webp", true, THREE.AdditiveBlending), []);

  useFrame(({ clock, mouse }) => {
    const t = clock.getElapsedTime();
    if (group.current) {
      group.current.position.y = Math.sin(t * CFG.floatSpd) * CFG.floatAmp;
      const tx = (mouse.y || 0) * CFG.tiltAmp.x;
      const ty = (mouse.x || 0) * CFG.tiltAmp.y;
      group.current.rotation.x += (tx - group.current.rotation.x) * 0.08;
      group.current.rotation.y += (-ty - group.current.rotation.y) * 0.08;
    }
    if (raysRef.current) {
      const mat = raysRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.45 + Math.sin(t * 1.2) * 0.08;
      raysRef.current.rotation.z = Math.sin(t * 0.3) * 0.05;
    }
  });

  return (
    <group ref={group} position={[0, 0.15, 0]}>
      <mesh ref={raysRef} position={[0, 0.25, 0]} scale={[3.2, 1.7, 1]} geometry={plane} material={raysMat} />
      <mesh position={[0, 0, 0.05]} scale={[2.4, 1.0, 1]} geometry={plane} material={logoMat} />
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
