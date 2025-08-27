"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Stage3DFrozen() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;

    const hasWebGL = (() => {
      try { const c=document.createElement("canvas");
        return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
      } catch { return false; }
    })();

    // WebGLが無い場合は静的CSS（動き無し）
    const enableCss = () => {
      wrap.style.backgroundImage =
        "url(/RULE/bg_base.jpg), url(/RULE/pattern_overlay.png), url(/RULE/glow_rays.png)";
      wrap.style.backgroundSize = "cover, 1200px, 1400px";
      wrap.style.backgroundRepeat = "no-repeat,no-repeat,no-repeat";
      wrap.style.backgroundPosition = "center, center, center";
      return () => {};
    };

    if (!hasWebGL) { enableCss(); return; }

    // ---- Three.js（静止画・描画はリサイズ時のみ）----
    const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0,0,8);

    const loader = new THREE.TextureLoader();
    const load = (url:string) =>
      new Promise<THREE.Texture>((res, rej)=>loader.load(url, res, undefined, rej));

    const mk = (t:THREE.Texture, z:number, s=18, o=1) => {
      const g=new THREE.PlaneGeometry(s,(s*9)/16);
      const m=new THREE.MeshBasicMaterial({ map:t, transparent:true, opacity:o });
      const mesh=new THREE.Mesh(g,m); mesh.position.z=z; return mesh;
    };

    let ro:ResizeObserver|undefined;

    (async () => {
      try {
        const [baseT, patT, raysT, crestT, ornT] = await Promise.all([
          load("/RULE/bg_base.jpg"),
          load("/RULE/pattern_overlay.png"),
          load("/RULE/glow_rays.png"),
          load("/RULE/crest.png"),
          load("/RULE/ornament.png"),
        ]);

        // レイヤーを重ねる（回転・視差なし＝完全停止）
        const base = mk(baseT, -6.0, 20, 1.0);
        const pat  = mk(patT,  -5.8, 20, 0.10);
        const rays = mk(raysT, -5.6, 20, 0.28);
        const crest= mk(crestT,-5.4, 12, 0.18);
        const orn  = mk(ornT,  -5.2, 22, 0.50);
        scene.add(base, pat, rays, crest, orn);

        const render = () => renderer.render(scene, camera);
        const fit=()=>{const w=wrap.clientWidth,h=wrap.clientHeight;
          renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); render();};
        ro=new ResizeObserver(fit); ro.observe(wrap); fit(); // 初回1回描画・以降はサイズ変更時のみ描画
      } catch {
        enableCss();
      }
    })();

    return ()=>{ ro?.disconnect(); renderer.dispose(); };
  }, []);

  return (
    <>
      <div ref={wrapRef} className="stage" aria-hidden="true">
        <canvas ref={canvasRef} className="cv" />
      </div>
      <style jsx>{`
        .stage{position:fixed; inset:0; z-index:0}
        .cv{width:100%; height:100%; display:block}
      `}</style>
    </>
  );
}
