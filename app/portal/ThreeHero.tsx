"use client";

import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";

type Props = { deviceIsMobile?: boolean; scrollY?: number; onContextLost?: () => void; cameraZ?: number; logoScale?: number; };

function LogoBillboard({ deviceIsMobile, scrollY = 0, logoScale = 1 }: Props) {
  const tex = useMemo(() => {
    const t = new THREE.TextureLoader().load("/portal/logo.webp");
    t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter;
    t.anisotropy = 2; t.colorSpace = THREE.SRGBColorSpace; t.transparent = true;
    return t;
  }, []);
  const g = useRef<THREE.Group>(null!);
  const base = (deviceIsMobile ? 1.4 : 1.9) * logoScale;
  const yFactor = deviceIsMobile ? 0.0008 : 0.001;
  const frame = useRef(0);
  useFrame(({ clock }) => {
    if ((frame.current++ % 2) !== 0) return; // 30fpsに間引き
    const t = clock.getElapsedTime();
    if (!g.current) return;
    g.current.position.y = -scrollY * yFactor + Math.sin(t * 1.05) * 0.08;
    g.current.rotation.x = Math.sin(t * 0.35) * 0.02;
    g.current.rotation.y = Math.sin(t * 0.25) * 0.02;
  });
  return (
    <group ref={g}>
      <mesh>
        <planeGeometry args={[2.4 * base, 2.4 * base]} />
        <meshBasicMaterial map={tex} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function ThreeHero(props: Props) {
  const cameraZ = useMemo(() => props.cameraZ ?? (props.deviceIsMobile ? 8.8 : 8.2), [props.cameraZ, props.deviceIsMobile]);
  const dpr = useMemo(() => typeof window === "undefined" ? 1 : Math.min(1.5, window.devicePixelRatio || 1), []);
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
