"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Stage3DStable() {
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

    // CSSフォールバック（最低限の視差）
    const enableCss = () => {
      wrap.classList.add("css-fallback");
      wrap.style.backgroundImage =
        "url(/RULE/bg_base.jpg), url(/RULE/pattern_overlay.png), url(/RULE/glow_rays.png)";
      wrap.style.backgroundSize = "cover, 1200px, 1400px";
      wrap.style.backgroundRepeat = "no-repeat,no-repeat,no-repeat";
      wrap.style.backgroundPosition = "center, center, center";
      const onScroll = () => {
        const y = window.scrollY || 0;
        wrap.style.backgroundPositionY = `0px, ${-y*0.06}px, ${-y*0.1}px`;
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive:true });
      return () => window.removeEventListener("scroll", onScroll);
    };

    if (!hasWebGL) { enableCss(); return; }

    // ---- Three.js ----
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

    let ro:ResizeObserver|undefined, raf=0;

    (async () => {
      try {
        const [baseT, patT, raysT, crestT, ornT] = await Promise.all([
          load("/RULE/bg_base.jpg"),
          load("/RULE/pattern_overlay.png"),
          load("/RULE/glow_rays.png"),
          load("/RULE/crest.png"),
          load("/RULE/ornament.png"),
        ]);

        const base = mk(baseT, -6.0, 20, 1.0);
        const pat  = mk(patT,  -5.8, 20, 0.10);
        const rays = mk(raysT, -5.6, 20, 0.28);
        const crest= mk(crestT,-5.4, 12, 0.18);
        const orn  = mk(ornT,  -5.2, 22, 0.50);
        scene.add(base, pat, rays, crest, orn);

        const fit=()=>{const w=wrap.clientWidth,h=wrap.clientHeight;
          renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();};
        ro=new ResizeObserver(fit); ro.observe(wrap); fit();

        let targetY=0,y=0,mx=0,my=0;
        const onScroll=()=>{ targetY = window.scrollY||0; };
        const onMove=(e:MouseEvent)=>{ const r=wrap.getBoundingClientRect();
          mx=(e.clientX-r.left)/r.width-.5; my=(e.clientY-r.top)/r.height-.5; };
        window.addEventListener("scroll", onScroll, { passive:true });
        window.addEventListener("mousemove", onMove, { passive:true });

        const tick=()=>{ const k=document.documentElement.classList.contains("reduced")?0:1;
          y+=(targetY-y)*0.08;
          camera.position.x += ((mx*.6)-camera.position.x)*0.06*k;
          camera.position.y += (((-my)*.6)-camera.position.y)*0.06*k;
          camera.lookAt(0,0,-5);
          base.position.y = -y*0.0004*k; pat.position.y = -y*0.0007*k;
          rays.position.y = -y*0.0011*k; crest.position.y = -y*0.0015*k; orn.position.y = -y*0.0019*k;
          crest.rotation.z += 0.0006*k;
          renderer.render(scene,camera); raf=requestAnimationFrame(tick); };
        tick();

        return ()=>{ cancelAnimationFrame(raf);
          window.removeEventListener("scroll", onScroll);
          window.removeEventListener("mousemove", onMove);
          ro?.disconnect(); renderer.dispose(); };
      } catch (e) {
        console.warn("Stage3DStable: textures failed, fallback to CSS", e);
        enableCss();
      }
    })();
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
