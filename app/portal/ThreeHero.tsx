/* eslint-disable @next/next/no-img-element */
"use client";

import * as THREE from "three";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { useMemo, useRef } from "react";

type Props = {
  deviceIsMobile?: boolean;
  scrollY?: number;
  onContextLost?: () => void;
};

function LogoBillboard({ deviceIsMobile, scrollY = 0 }: Props) {
  const tex = useLoader(THREE.TextureLoader, "/portal/logo.webp");
  tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter; tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace; tex.transparent = true;

  const g = useRef<THREE.Group>(null!);

  const baseScale = deviceIsMobile ? 1.35 : 1.8;
  const yFactor   = deviceIsMobile ? 0.0009 : 0.0011;  // 縦パララックス
  const floatAmp  = deviceIsMobile ? 0.10 : 0.12;      // 浮遊の振幅
  const yawAmp    = 0.025;
  const pitchAmp  = 0.018;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!g.current) return;
    g.current.position.y = -scrollY * yFactor + Math.sin(t * 1.15) * floatAmp;
    g.current.rotation.y = Math.sin(t * 0.6) * yawAmp;
    g.current.rotation.x = Math.sin(t * 0.35) * pitchAmp;
  });

  return (
    <group ref={g}>
      <mesh>
        <planeGeometry args={[2.4 * baseScale, 2.4 * baseScale]} />
        <meshBasicMaterial map={tex} transparent depthWrite={false} />
      </mesh>
      <mesh position={[0, -1.1 * baseScale, -0.01]}>
        <planeGeometry args={[1.6 * baseScale, 0.6 * baseScale]} />
        <meshBasicMaterial color="#000" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

export default function ThreeHero(props: Props) {
  const cameraZ = useMemo(() => (props.deviceIsMobile ? 8.8 : 8.2), [props.deviceIsMobile]);
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, cameraZ], fov: 45 }}
      gl={{ alpha: true, antialias: true }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", props.onContextLost ?? (() => {}), false);
      }}
    >
      <LogoBillboard {...props} />
    </Canvas>
  );
}
