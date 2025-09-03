"use client";

import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  deviceIsMobile?: boolean;
  scrollY?: number;
  onContextLost?: () => void;
  /** 中央のまま遠近だけを変えるためのカメラ距離。大きいほど奥へ */
  cameraZ?: number;
  /** ロゴの倍率（大きさ） */
  logoScale?: number;
};

/* ── ビルド識別子（キャッシュバスター） ─────────────────────────── */
const SHA =
  (process.env.NEXT_PUBLIC_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_BUILD_TIME ||
    "").toString().slice(0, 8);
const Q = SHA ? `?v=${SHA}` : "";

/* ── 安全なテクスチャローダー（エラーで throw しない） ─────────────── */
function useTextureSafe(url: string) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [err, setErr] = useState<Error | null>(null);

  useEffect(() => {
    let alive = true;
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (t) => {
        if (!alive) return;
        t.minFilter = THREE.LinearFilter;
        t.magFilter = THREE.LinearFilter;
        t.anisotropy = 8;
        t.colorSpace = THREE.SRGBColorSpace;
        t.transparent = true;
        setTex(t);
      },
      undefined,
      (e) => {
        if (!alive) return;
        setErr(e as any);
      }
    );
    return () => {
      alive = false;
    };
  }, [url]);

  return { tex, err };
}

function LogoBillboard({
  deviceIsMobile,
  scrollY = 0,
  logoScale = 1,
  onContextLost,
}: Props) {
  // ※ Three.js 側も ?v= を付ける
  const url = `/portal/logo.webp${Q}`;
  const { tex, err } = useTextureSafe(url);

  // もし読み込みに失敗したら、上位へ通知しつつ描画はスキップ（クラッシュさせない）
  useEffect(() => {
    if (err) onContextLost?.();
  }, [err, onContextLost]);

  const g = useRef<THREE.Group>(null!);
  const baseScale = (deviceIsMobile ? 1.4 : 1.9) * logoScale;
  const yFactor = deviceIsMobile ? 0.0008 : 0.001;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!g.current) return;
    g.current.position.y = -scrollY * yFactor + Math.sin(t * 1.05) * 0.08;
    g.current.rotation.x = Math.sin(t * 0.35) * 0.02;
    g.current.rotation.y = Math.sin(t * 0.25) * 0.02;
  });

  // テクスチャ未読込 or 失敗時は何も描かずに返す（Canvas自体は維持）
  if (!tex) return null;

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

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, cameraZ], fov: 45 }}
      gl={{ alpha: true, antialias: true }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener(
          "webglcontextlost",
          props.onContextLost ?? (() => {}),
          false
        );
      }}
      data-r3f="1"
    >
      <LogoBillboard {...props} />
    </Canvas>
  );
}
