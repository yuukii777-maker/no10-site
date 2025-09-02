"use client";

import * as THREE from "three";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { useMemo, useRef } from "react";

type Props = {
  deviceIsMobile?: boolean;
  scrollY?: number;                 // 親からスクロール量
  onContextLost?: () => void;
};

function LogoBillboard({ deviceIsMobile, scrollY = 0 }: Props) {
  const tex = useLoader(THREE.TextureLoader, "/portal/logo.webp");
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.transparent = true;

  const g = useRef<THREE.Group>(null!);

  const baseScale = deviceIsMobile ? 1.6 : 2.0;     // 画面中央にドン
  const yFactor  = deviceIsMobile ? 0.0008 : 0.001; // 縦パララックス係数（控えめ）

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!g.current) return;
    g.current.position.set(0, -scrollY * yFactor + Math.sin(t * 1.2) * 0.08, 0); // 縦主体のフロート
    g.current.rotation.set(Math.sin(t * 0.35) * 0.02, Math.sin(t * 0.25) * 0.02, 0); // 横はかなり控えめ
  });

  return (
    <group ref={g}>
      <mesh>
        <planeGeometry args={[2.4 * baseScale, 2.4 * baseScale]} />
        <meshBasicMaterial map={tex} transparent depthWrite={false} />
      </mesh>
      {/* うっすら影 */}
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
