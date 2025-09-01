/* eslint-disable @next/next/no-img-element */
"use client";

import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Sparkles, useTexture } from "@react-three/drei";
import { useMemo, useRef } from "react";

type Props = { deviceIsMobile?: boolean; onContextLost?: () => void };

function LogoIsland({ isMobile }: { isMobile: boolean }) {
  const tex = useTexture("/portal/logo.webp");
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.transparent = true;

  const size = useMemo(() => {
    const w = 3.6;
    // @ts-ignore
    const aspect = (tex.source?.data?.naturalWidth || 1024) / (tex.source?.data?.naturalHeight || 1024);
    return [w, w / aspect] as [number, number];
  }, [tex]);

  const group = useRef<THREE.Group>(null!);
  const target = useRef({ rx: 0, ry: 0 });
  const { pointer } = useThree();

  useFrame((_, dt) => {
    const px = THREE.MathUtils.clamp(pointer.x, -1, 1);
    const py = THREE.MathUtils.clamp(pointer.y, -1, 1);
    const maxTilt = isMobile ? 0.18 : 0.22;
    target.current.ry = -px * maxTilt;
    target.current.rx = py * maxTilt * 0.8;

    if (group.current) {
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, target.current.rx, 4, dt);
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, target.current.ry, 4, dt);
    }
  });

  return (
    <group ref={group}>
      <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.65} floatingRange={[-0.22, 0.22]}>
        <mesh castShadow receiveShadow>
          <planeGeometry args={[size[0], size[1], 2, 2]} />
          <meshStandardMaterial map={tex} transparent depthWrite roughness={0.8} metalness={0.1} />
        </mesh>
      </Float>

      {/* 薄影 */}
      <mesh position={[0, -size[1] * 0.48, -0.01]}>
        <planeGeometry args={[size[0] * 0.75, size[1] * 0.08]} />
        <meshBasicMaterial color={"black"} transparent opacity={0.18} blending={THREE.MultiplyBlending} />
      </mesh>
    </group>
  );
}

export default function ThreeHero({ deviceIsMobile = false, onContextLost }: Props) {
  const cameraZ = deviceIsMobile ? 9.5 : 8.5;
  const fov = deviceIsMobile ? 46 : 45;

  const onCreated = ({ gl }: { gl: THREE.WebGLRenderer }) => {
    const el = gl.domElement;
    const lost = () => onContextLost?.();
    el.addEventListener("webglcontextlost", lost, { passive: true } as any);
  };

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
      onCreated={onCreated as any}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 6]} intensity={1.1} castShadow={false} color={0xfff1e0} />
      <directionalLight position={[-3, 2, -2]} intensity={0.35} color={0xa0c0ff} />
      <fog attach="fog" args={["#1a1f2a", 14, 26]} />

      <Sparkles count={deviceIsMobile ? 60 : 90} size={deviceIsMobile ? 2 : 2.5} speed={0.18} scale={[12, 6.5, 8]} opacity={0.12} />

      <LogoIsland isMobile={deviceIsMobile} />
      <Environment preset="sunset" />
    </Canvas>
  );
}
