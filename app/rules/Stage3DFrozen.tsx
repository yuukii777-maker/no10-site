/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Stage3DFrozen() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;

    const SHA = (process.env.NEXT_PUBLIC_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || "")
      .toString()
      .slice(0, 8);
    const Q = SHA ? `?v=${SHA}` : "";

    // 1) 即時CSS背景（読み込みラグ無し）
    wrap.style.backgroundColor = "#0a0e15";
    wrap.style.backgroundImage =
      `url("/RULE/pattern_overlay.png${Q}"), url("/RULE/glow_rays.png${Q}"), image-set(` +
      `url("/RULE/bg_base.webp${Q}") type("image/webp"),` +
      `url("/RULE/bg_base.jpg${Q}") type("image/jpeg"),` +
      `url("/RULE/bg_base.png${Q}") type("image/png"))`;
    wrap.style.backgroundSize = "1200px, 1400px, cover";
    wrap.style.backgroundRepeat = "no-repeat,no-repeat,no-repeat";
    wrap.style.backgroundPosition = "center, center, center";

    // 2) WebGL 判定
    const hasWebGL = (() => {
      try { const c=document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl"))); }
      catch { return false; }
    })();
    if (!hasWebGL) return;

    // 3) Three.js
    const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true, powerPreference:"high-performance" });
    renderer.setClearColor(0x000000, 0);
    (renderer as any).outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0,0,8);

    const loader = new THREE.TextureLoader();
    const loadFirst = (paths: string[]) =>
      new Promise<THREE.Texture>((resolve, reject) => {
        const tryNext = (i: number) => {
          if (i >= paths.length) return reject(new Error("all failed"));
          loader.load(paths[i], (t) => resolve(t), undefined, () => tryNext(i + 1));
        };
        tryNext(0);
      });

    const mk = (t:THREE.Texture, z:number, s=18, o=1) => {
      const g=new THREE.PlaneGeometry(s,(s*9)/16);
      const m=new THREE.MeshBasicMaterial({ map:t, transparent:true, opacity:o, depthWrite:false });
      const mesh=new THREE.Mesh(g,m); mesh.position.z=z; return mesh;
    };

    let ro:ResizeObserver|undefined;

    (async () => {
      try {
        const [baseT, patT, raysT, crestT, ornT] = await Promise.all([
          loadFirst([`/RULE/bg_base.webp${Q}`, `/RULE/bg_base.jpg${Q}`, `/RULE/bg_base.png${Q}`]),
          loadFirst([`/RULE/pattern_overlay.webp${Q}`, `/RULE/pattern_overlay.png${Q}`]),
          loadFirst([`/RULE/glow_rays.webp${Q}`, `/RULE/glow_rays.png${Q}`]),
          loadFirst([`/RULE/crest.webp${Q}`, `/RULE/crest.png${Q}`]),
          loadFirst([`/RULE/ornament.webp${Q}`, `/RULE/ornament.png${Q}`]),
        ]);

        const aniso = (renderer.capabilities as any).getMaxAnisotropy?.() ?? 1;
        for (const t of [baseT, patT, raysT, crestT, ornT]) {
          (t as any).colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = aniso; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter;
        }

        const base  = mk(baseT,  -6.0, 20, 1.0);
        const pat   = mk(patT,   -5.8, 20, 0.08);
        const rays  = mk(raysT,  -5.6, 20, 0.22);
        const crest = mk(crestT, -5.4, 12, 0.18);
        const orn   = mk(ornT,   -5.2, 22, 0.50);
        scene.add(base, pat, rays, crest, orn);

        // WebGLが走ったらCSS背景はベースのみへ差し替え（“二重見え”防止）
        wrap.style.backgroundImage =
          `image-set(url("/RULE/bg_base.webp${Q}") type("image/webp"), url("/RULE/bg_base.jpg${Q}") type("image/jpeg"), url("/RULE/bg_base.png${Q}") type("image/png"))`;
        wrap.style.backgroundSize = "cover";
        wrap.style.backgroundRepeat = "no-repeat";
        wrap.style.backgroundPosition = "center";

        const render = () => renderer.render(scene, camera);
        const fit=()=>{const w=wrap.clientWidth,h=wrap.clientHeight;
          renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); render();};
        ro=new ResizeObserver(fit); ro.observe(wrap); fit();
      } catch { /* 失敗時はCSS背景のまま */ }
    })();

    return ()=>{ ro?.disconnect(); renderer.dispose(); };
  }, []);

  return (
    <>
      <div ref={wrapRef} className="stage" aria-hidden="true">
        <canvas ref={canvasRef} className="cv" />
      </div>
      <style jsx>{`.stage{position:fixed; inset:0; z-index:7; pointer-events:none} .cv{width:100%; height:100%; display:block}`}</style>
    </>
  );
}
