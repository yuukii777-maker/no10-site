/* eslint-disable @next/next/no-img-element */
"use client";

import * as THREE from "three";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";

type ThreeHeroProps = {
  deviceIsMobile?: boolean;
  scrollY?: number;          // 親から受け取るスクロール量（縦パララックス）
  onContextLost?: () => void;
};

function LogoBillboard({ deviceIsMobile, scrollY = 0 }: ThreeHeroProps) {
  const { gl } = useThree();
  const tex = useLoader(THREE.TextureLoader, "/portal/logo.webp");

  // テクスチャ設定：Three のバージョン差異に両対応（colorSpace / encoding）
  useEffect(() => {
    const anyTex = tex as any;
    if ("colorSpace" in anyTex) {
      anyTex.colorSpace = THREE.SRGBColorSpace; // r152+
    } else {
      (tex as THREE.Texture).encoding = (THREE as any).sRGBEncoding ?? 3001; // 旧版
    }
    tex.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy?.() ?? 8);
    tex.needsUpdate = true;
  }, [tex, gl]);

  const g = useRef<THREE.Group>(null!);

  const baseScale = deviceIsMobile ? 1.4 : 1.9;   // 遠目に浮かせるサイズ感
  const yFactor  = deviceIsMobile ? 0.0008 : 0.001; // 縦パララックス係数（控えめ）

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!g.current) return;
    g.current.position.y = -scrollY * yFactor + Math.sin(t * 1.2) * 0.08; // 縦主体のフロート
    g.current.rotation.x = Math.sin(t * 0.35) * 0.02;
    g.current.rotation.y = Math.sin(t * 0.25) * 0.02;                    // 横はかなり控えめ
  });

  return (
    <group ref={g}>
      {/* ロゴ（透明WEBP/PNGのビルボード） */}
      <mesh>
        <planeGeometry args={[2.4 * baseScale, 2.4 * baseScale]} />
        <meshBasicMaterial map={tex} transparent depthWrite={false} />
      </mesh>

      {/* やわらかい落ち影 */}
      <mesh position={[0, -1.1 * baseScale, -0.01]}>
        <planeGeometry args={[1.6 * baseScale, 0.6 * baseScale]} />
        <meshBasicMaterial color="#000" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

export default function ThreeHero({ deviceIsMobile, scrollY = 0, onContextLost }: ThreeHeroProps) {
  // モバイルはやや引き気味
  const cameraZ = deviceIsMobile ? 8.8 : 8.2;

  const handleCreated = (state: { gl: THREE.WebGLRenderer }) => {
    const { gl } = state;
    const onLost = (e: Event) => {
      // Safari などでは preventDefault しないと復帰時に固まることがある
      (e as WebGLContextEvent).preventDefault?.();
      onContextLost?.();
    };
    gl.domElement.addEventListener("webglcontextlost", onLost, { passive: false });
  };

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, cameraZ], fov: 45 }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: false,
        premultipliedAlpha: true,
      }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      onCreated={handleCreated as any}
      data-r3f="1"
    >
      <Suspense fallback={null}>
        <LogoBillboard deviceIsMobile={deviceIsMobile} scrollY={scrollY} />
      </Suspense>
    </Canvas>
  );
}
