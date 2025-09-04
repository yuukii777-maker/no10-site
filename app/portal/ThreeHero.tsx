"use client";

import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef } from "react";

type Props = {
  deviceIsMobile?: boolean;
  scrollY?: number;
  onContextLost?: () => void;
  cameraZ?: number;   // 中央のまま遠近のみ変える
  logoScale?: number; // ロゴ倍率
};

const SHA =
  (process.env.NEXT_PUBLIC_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_BUILD_TIME ||
    ""
  ).toString().slice(0, 8);
const Q = SHA ? `?v=${SHA}` : "";

function useTextureSafe(url: string) {
  const tex = useMemo(() => new THREE.TextureLoader().load(
    url,
    (t) => {
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.anisotropy = 2;
      t.colorSpace = THREE.SRGBColorSpace;
      t.transparent = true;
    }
  ), [url]);
  return tex;
}

function LogoBillboard({
  deviceIsMobile,
  scrollY = 0,
  logoScale = 1,
}: Props) {
  const tex = useTextureSafe(`/portal/logo.webp${Q}`);
  const g = useRef<THREE.Group>(null!);
  const baseScale = (deviceIsMobile ? 1.4 : 1.9) * logoScale;
  const yFactor = deviceIsMobile ? 0.0008 : 0.001;

  // 30fpsに間引いて負荷を安定
  const frame = useRef(0);
  useFrame(({ clock }) => {
    if ((frame.current++ % 2) !== 0) return; // 60fps環境で30fps描画
    const t = clock.getElapsedTime();
    if (!g.current) return;
    g.current.position.y = -scrollY * yFactor + Math.sin(t * 1.05) * 0.08;
    g.current.rotation.x = Math.sin(t * 0.35) * 0.02;
    g.current.rotation.y = Math.sin(t * 0.25) * 0.02;
  });

  return (
    <group ref={g}>
      <mesh>
        <planeGeometry args={[2.4 * baseScale, 2.4 * baseScale]} />
        <meshBasicMaterial map={tex} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function ThreeHero(props: Props) {
  const cameraZ = useMemo(
    () => props.cameraZ ?? (props.deviceIsMobile ? 8.8 : 8.2),
    [props.cameraZ, props.deviceIsMobile]
  );

  // 高DPRでも上限をかける
  const dpr = useMemo(() => {
    if (typeof window === "undefined") return 1;
    const real = window.devicePixelRatio || 1;
    return Math.min(1.5, real);
  }, []);

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 0, cameraZ], fov: 45 }}
      gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NoToneMapping;
        gl.domElement.addEventListener("webglcontextlost", props.onContextLost ?? (() => {}), false);
      }}
    >
      <LogoBillboard {...props} />
    </Canvas>
  );
}
