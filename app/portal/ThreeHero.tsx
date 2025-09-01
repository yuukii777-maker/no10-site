/* eslint-disable @next/next/no-img-element */
"use client";

import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, useTexture, Sparkles } from "@react-three/drei";
import { useMemo, useRef } from "react";

// 型：page 側から isMobile を渡せるように（任意）
type Props = {
  deviceIsMobile?: boolean;
};

// 画面中央にロゴ（/portal/logo.webp）を半透明付きで描画
function LogoIsland({ isMobile }: { isMobile: boolean }) {
  const tex = useTexture("/portal/logo.webp");
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.transparent = true;

  // ロゴのアスペクト比から平面サイズを決定（視野に対して過剰に大きくしない）
  const size = useMemo(() => {
    const w = 3.6; // 横基準（調整済）
    const aspect = tex.source.data?.naturalWidth
      ? tex.source.data.naturalWidth / tex.source.data.naturalHeight
      : 1.0;
    return [w, w / (aspect || 1)] as [number, number];
  }, [tex]);

  const group = useRef<THREE.Group>(null!);
  const target = useRef({ rx: 0, ry: 0 });

  // ポインタ/傾き入力 → 緩やかに追従
  const { viewport, pointer } = useThree();

  useFrame((state, dt) => {
    // pointer は -1..1 の範囲
    const px = THREE.MathUtils.clamp(pointer.x, -1, 1);
    const py = THREE.MathUtils.clamp(pointer.y, -1, 1);

    const maxTilt = isMobile ? 0.18 : 0.22; // ラジアン
    target.current.ry = -px * maxTilt; // 左右
    target.current.rx = py * maxTilt * 0.8; // 上下

    // スムージング
    if (group.current) {
      group.current.rotation.x = THREE.MathUtils.damp(
        group.current.rotation.x,
        target.current.rx,
        4,
        dt
      );
      group.current.rotation.y = THREE.MathUtils.damp(
        group.current.rotation.y,
        target.current.ry,
        4,
        dt
      );
    }
  });

  return (
    <group ref={group}>
      {/* Float でゆっくり上下・微回転 */}
      <Float
        speed={1.2}
        rotationIntensity={0.25}
        floatIntensity={0.65}
        floatingRange={[-0.22, 0.22]}
      >
        <mesh castShadow receiveShadow>
          <planeGeometry args={[size[0], size[1], 2, 2]} />
          <meshStandardMaterial
            map={tex}
            transparent
            depthWrite={true}
            depthTest
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      </Float>

      {/* ロゴの下に淡い影（擬似的な奥行き） */}
      <mesh position={[0, -size[1] * 0.48, -0.01]}>
        <planeGeometry args={[size[0] * 0.75, size[1] * 0.08]} />
        <meshBasicMaterial
          color={"black"}
          transparent
          opacity={0.18}
          blending={THREE.MultiplyBlending}
        />
      </mesh>
    </group>
  );
}

export default function ThreeHero({ deviceIsMobile = false }: Props) {
  // iPhone では少し遠目のカメラ、DPR も抑えて発熱を避ける
  const cameraZ = deviceIsMobile ? 9.5 : 8.5;
  const fov = deviceIsMobile ? 46 : 45;

  return (
    <Canvas
      dpr={deviceIsMobile ? [1, 1.75] : [1, 2]}
      camera={{ position: [0, 0, cameraZ], fov }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
        failIfMajorPerformanceCaveat: false,
      }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      data-r3f="1"
    >
      {/* 柔らかい環境光 */}
      <ambientLight intensity={0.65} />
      <directionalLight
        position={[3, 5, 6]}
        intensity={1.1}
        castShadow={false}
        color={0xfff1e0}
      />
      <directionalLight position={[-3, 2, -2]} intensity={0.35} color={0xa0c0ff} />

      {/* ほんのりフォグ（雲に馴染ませる） */}
      <fog attach="fog" args={["#1a1f2a", 14, 26]} />

      {/* 空気中の微粒子（控えめ） */}
      <Sparkles
        count={deviceIsMobile ? 60 : 90}
        size={deviceIsMobile ? 2 : 2.5}
        speed={0.18}
        scale={[12, 6.5, 8]}
        opacity={0.12}
      />

      {/* 3Dロゴ */}
      <LogoIsland isMobile={deviceIsMobile} />

      {/* 環境（暖かい夕景寄り） */}
      <Environment preset="sunset" />
    </Canvas>
  );
}
