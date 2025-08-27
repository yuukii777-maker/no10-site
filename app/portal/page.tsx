/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import AudioController from "@/app/components/AudioController";

/** /public 必須アセット: background2.png, cloud_* , island.png, rays.png, audio/megami.mp3 */
const BACKGROUND_IMAGE = "/background2.png";

/* ===== 調整ノブ ===== */
const CAMERA = { FOV: 36, TILT_DEG: 24, ROLL_DEG: -1.6, Z: 80 };
const LOOP   = { COPIES: 8, STEP_RATIO: 0.84, EDGE_FADE: 0.16 };
const MOTION = { INERTIA: 0.1, SPEED: 1.0, TOUCH_SPEED: 1.0, PX2WORLD: 0.016, TILT_MAX: 5 };

/* 岩＋ロゴ＆光の一括スケール（0.85 = 15%縮小） */
const ISLAND_SCALE = 0.85;

/* ▼ 高さ（基準）と 揺れ幅：ここを触れば上下のレンジを調整できます */
const ISLAND_BASE_Y = -19;  // 例：-6で高め、-20で低め（下へ）
const ISLAND_SWAY   = 2.2;  // 揺れ幅（上下アニメの強さ）

/* ===== テキスト ===== */
const TUNE = { TITLE_PX: 50, BODY_PX: 50, TITLE_W: 70, TITLE_H: 16, BODY_W: 70, BODY_H: 16, START_Y: 18, GAP_Y: 8, TEXT_SCROLL: 3.2, GROUP_Z: 12 };

/* ===== 近景雲の初期非表示ガード ===== */
const INTRO_NEAR = { startAlpha: 0.0, scrollWorldForMax: 26, requireInteract: true };

/* ===== 使用バンド ===== */
const USE_BANDS = { FAR_1: true, FAR_2: true, MID_1: true, MID_2: false, NEAR_1: true, NEAR_2: true } as const;

/* ===== パララックス雲 ===== */
const LCONF = {
  FAR_1:  { z: -130, width: 390, height: 220, speed: 0.16, tint: 0xf4efe2, opacity: 0.10, drift: 0.0025, yoff: +36,  type: "far"  },
  FAR_2:  { z: -118, width: 380, height: 214, speed: 0.21, tint: 0xffffff, opacity: 0.20, drift: 0.0035, yoff: +22,  type: "far"  },
  MID_1:  { z:  -64, width: 350, height: 196, speed: 0.30, tint: 0xfff2dc, opacity: 0.70, drift: 0.0055, yoff:  -6,  type: "mid"  },
  MID_2:  { z:  -54, width: 336, height: 188, speed: 0.36, tint: 0xffffff, opacity: 0.15, drift: 0.0065, yoff: -20,  type: "mid"  },
  NEAR_1: { z:  -10, width: 286, height: 174, speed: 0.56, tint: 0xffffff, opacity: 0.50, drift: 0.0000, yoff: -220, type: "near" },
  NEAR_2: { z:   -6, width: 280, height: 170, speed: 0.66, tint: 0xffffff, opacity: 0.42, drift: 0.0000, yoff: -300, type: "near" },
};

/* ===== 表示テキスト ===== */
const LINES = [
  { kind: "title", text: "荒野行動を通じて多くの人に影響を与える" },
  { kind: "body",  text: "VOLCEは、ゲリラ参加やイベントを中心に、荒野行動知名度アップを目指すクランです。" },
  { kind: "body",  text: "実力ある火力枠はゲリラ優勝を狙い、エンジョイ枠は楽しく、クリエイター/ライバー枠は配信で拡げる。" },
  { kind: "body",  text: "それぞれの強みを一つの力にし、現環境にもう一度“熱狂”を取り戻します。" },
  { kind: "body",  text: "これらを目標に協力してくれるメンバーを募集しています。" },
  { kind: "body",  text: "入隊したいかたはＸ→＠Char_god1へ志望枠を載せてDMください。" },
] as const;

/* ===== テクスチャ生成（省略なし） ===== */
function makeSolidGlass(text: string, px: number) {
  const scale = 2, W = 2400 * scale, H = 720 * scale;
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `800 ${px * scale}px 'Noto Sans JP', system-ui, sans-serif`;
  g.fillStyle = "rgba(255,255,255,.66)";
  g.shadowColor = "rgba(0,0,0,.35)"; g.shadowBlur = 28 * scale;
  g.fillText(text, W / 2, H / 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = true;
  return t;
}
function makeMask(text: string, px: number) {
  const scale = 2, W = 2400 * scale, H = 720 * scale;
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `900 ${px * scale}px 'Noto Sans JP', system-ui, sans-serif`;
  g.fillStyle = "#fff"; g.fillText(text, W / 2, H / 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = true;
  return t;
}
function makeCloudEdgeMat(mask: THREE.Texture) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uText: { value: mask }, uTime: { value: 0 }, uAlpha: { value: 0.0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `
      precision mediump float; varying vec2 vUv; uniform sampler2D uText; uniform float uTime,uAlpha;
      void main(){
        vec2 px = vec2(1.0/2048.0, 1.0/2048.0);
        float a  = texture2D(uText, vUv).a;
        float ax = texture2D(uText, vUv+vec2(px.x,0.)).a - texture2D(uText, vUv-vec2(px.x,0.)).a;
        float ay = texture2D(uText, vUv+vec2(0.,px.y)).a - texture2D(uText, vUv-vec2(0.,px.y)).a;
        float edge = clamp(abs(ax)+abs(ay), 0.0, 1.0);
        edge = smoothstep(0.05, 0.24, edge) * a;
        vec3 gold = mix(vec3(1.0,0.97,0.90), vec3(1.0,0.92,0.65), 0.55);
        float pulse = 0.75 + 0.25 * sin(uTime*1.15);
        vec3 col = gold * pulse;
        float alpha = edge * uAlpha;
        if(alpha < 0.02) discard;
        gl_FragColor = vec4(col, alpha);
      }`,
  });
}
function makeShadowTex(w=512,h=256,spread=0.42,soft=0.35){
  const c=document.createElement("canvas"); c.width=w; c.height=h;
  const g=c.getContext("2d")!;
  const grd=g.createRadialGradient(w/2,h*0.55,1,w/2,h*0.55,Math.max(w,h)*0.55);
  grd.addColorStop(0.0, `rgba(0,0,0,${spread})`);
  grd.addColorStop(soft, `rgba(0,0,0,${spread*0.5})`);
  grd.addColorStop(1.0, `rgba(0,0,0,0)`);
  g.fillStyle = grd; g.fillRect(0,0,w,h);
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t;
}

/* ===== 雲マテリアル ===== */
const makeCloudMat = (map: THREE.Texture, tint: THREE.ColorRepresentation, opacity=1, drift=0) =>
  new THREE.ShaderMaterial({
    transparent:true, depthWrite:false,
    uniforms:{ uMap:{value:map}, uTint:{value:new THREE.Color(tint)}, uOpacity:{value:opacity},
      uEdge:{value:LOOP.EDGE_FADE}, uTime:{value:0}, uDrift:{value:drift}, uWobble:{value:new THREE.Vector2(0.0018,0.0012)} },
    vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader:`
      precision mediump float; varying vec2 vUv;
      uniform sampler2D uMap; uniform vec3 uTint; uniform float uOpacity,uEdge,uTime,uDrift; uniform vec2 uWobble;
      float n21(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
      void main(){
        vec2 uv=vUv; uv.y = fract(uv.y + uTime*uDrift);
        vec2 q = uv*vec2(2.0,1.6)+uTime*0.015; uv += (vec2(n21(q), n21(q+7.3))-0.5)*uWobble;
        vec4 c = texture2D(uMap, uv); c.rgb*=uTint;
        float ft=smoothstep(0.0,uEdge,uv.y), fb=1.0-smoothstep(1.0-uEdge,1.0,uv.y); c.a *= min(ft,fb)*uOpacity;
        if(c.a<0.003) discard; gl_FragColor=c;
      }`,
  });

const makePlane=(map:THREE.Texture,w:number,h:number,z:number,tint:THREE.ColorRepresentation,opacity:number,drift=0)=>{
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h), makeCloudMat(map,tint,opacity,drift));
  m.position.set(0,0,z);
  m.rotation.x = -THREE.MathUtils.degToRad(CAMERA.TILT_DEG);
  m.rotation.z =  THREE.MathUtils.degToRad(CAMERA.ROLL_DEG);
  return m;
};
const makeBand=(map:THREE.Texture,conf:any)=>{
  const g=new THREE.Group(); const step=conf.height*LOOP.STEP_RATIO;
  for(let i=0;i<LOOP.COPIES;i++){
    const p=makePlane(map,conf.width,conf.height,conf.z,conf.tint,conf.opacity,conf.drift);
    (p.material as THREE.ShaderMaterial).uniforms.uWobble.value.set(0.0016+conf.speed*0.001, 0.0011+conf.speed*0.0007);
    p.position.y=i*step; g.add(p);
  }
  g.position.y = conf.yoff || 0;
  (g as any).userData={ speed:conf.speed, step, mats:g.children.map(m=>(m as any).material), baseOpacity: conf.opacity, type: conf.type || 'mid' };
  return g;
};

export default function PortalPage() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current!;
    const { width: cw, height: ch } = container.getBoundingClientRect();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(cw, ch);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CAMERA.FOV, cw / ch, 0.1, 2000);
    camera.position.set(0, 22, CAMERA.Z);
    camera.rotation.x = -THREE.MathUtils.degToRad(CAMERA.TILT_DEG);
    camera.rotation.z =  THREE.MathUtils.degToRad(CAMERA.ROLL_DEG);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x324454, 0.88));
    const dir = new THREE.DirectionalLight(0xffffff, 0.95); dir.position.set(-20, 28, 12); scene.add(dir);

    const loader = new THREE.TextureLoader();
    const load = (src: string) => loader.load(src);
    const tex = {
      far1:  load("/cloud_far.png"),
      far2:  load("/cloud_far2.png"),
      mid1:  load("/cloud_mid.png"),
      mid2:  load("/cloud_mid2.png"),
      near1: load("/cloud_near.png"),
      near2: load("/cloud_near2.png"),
      island: load("/island.png"),
      rays:   load("/rays.png"),
    };
    Object.values(tex).forEach((t:any) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.generateMipmaps = true;
    });

    // バンド生成
    const farBand1  = USE_BANDS.FAR_1  ? makeBand(tex.far1,  LCONF.FAR_1)  : null; if (farBand1)  scene.add(farBand1);
    const farBand2  = USE_BANDS.FAR_2  ? makeBand(tex.far2,  LCONF.FAR_2)  : null; if (farBand2)  scene.add(farBand2);
    const midBand1  = USE_BANDS.MID_1  ? makeBand(tex.mid1,  LCONF.MID_1)  : null; if (midBand1)  scene.add(midBand1);
    const midBand2  = USE_BANDS.MID_2  ? makeBand(tex.mid2,  LCONF.MID_2)  : null; if (midBand2)  scene.add(midBand2);
    const nearBand1 = USE_BANDS.NEAR_1 ? makeBand(tex.near1, LCONF.NEAR_1) : null; if (nearBand1) scene.add(nearBand1);
    const nearBand2 = USE_BANDS.NEAR_2 ? makeBand(tex.near2, LCONF.NEAR_2) : null; if (nearBand2) scene.add(nearBand2);

    // ===== 浮島（ロゴ） =====
    const island = new THREE.Mesh(
      new THREE.PlaneGeometry(58, 58),
      new THREE.MeshBasicMaterial({ map: tex.island, transparent: true, depthWrite: false })
    );
    island.position.set(0, ISLAND_BASE_Y, -2); // 基準Yを使用
    island.rotation.x = -THREE.MathUtils.degToRad(CAMERA.TILT_DEG);
    island.rotation.z =  THREE.MathUtils.degToRad(CAMERA.ROLL_DEG);
    island.scale.set(ISLAND_SCALE, ISLAND_SCALE, 1);
    scene.add(island);

    // ===== 光（rays） =====
    const rays = (tex.rays as any).image
      ? new THREE.Mesh(
          new THREE.PlaneGeometry(260, 160),
          new THREE.MeshBasicMaterial({ map: tex.rays, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.62 })
        )
      : new THREE.Mesh(
          new THREE.PlaneGeometry(260, 160),
          new THREE.ShaderMaterial({
            transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
            uniforms: { uTime: { value: 0 }, uOpacity: { value: 0.26 } },
            vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
            fragmentShader: `
              precision mediump float; varying vec2 vUv; uniform float uTime,uOpacity;
              void main(){ vec2 p=vUv-vec2(0.5,0.25); float a=atan(p.y,p.x), r=length(p);
                float beams=0.6+0.4*sin(10.5*a+uTime*0.8); float glow=smoothstep(0.96,0.0,r);
                float col=beams*glow; gl_FragColor=vec4(vec3(1.0,0.98,0.88)*col, col*uOpacity);} `,
          })
        );
    rays.position.set(0, ISLAND_BASE_Y + 4, -7); // 島の基準Yに追従
    rays.rotation.x = island.rotation.x;
    rays.rotation.z = island.rotation.z;
    rays.scale.set(ISLAND_SCALE, ISLAND_SCALE, 1);
    scene.add(rays);

    // ===== テキスト =====
    type Item = { solid: THREE.Mesh; edge: THREE.Mesh; shadow: THREE.Mesh; baseY: number; speed: number };
    const items: Item[] = [];
    const shadowTex = makeShadowTex();
    LINES.forEach((ln, i) => {
      const px = ln.kind === "title" ? TUNE.TITLE_PX : TUNE.BODY_PX;
      const w  = ln.kind === "title" ? TUNE.TITLE_W  : TUNE.BODY_W;
      const h  = ln.kind === "title" ? TUNE.TITLE_H  : TUNE.BODY_H;

      const solid  = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: makeSolidGlass(ln.text, px), transparent: true, depthWrite: false, opacity: 0 }));
      const edge   = new THREE.Mesh(new THREE.PlaneGeometry(w, h), makeCloudEdgeMat(makeMask(ln.text, px)));
      const shadow = new THREE.Mesh(new THREE.PlaneGeometry(w*1.12, h*0.85), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0 }));

      const y = TUNE.START_Y + i * TUNE.GAP_Y;
      [solid, edge, shadow].forEach(m => {
        m.position.set(0, y, TUNE.GROUP_Z + 3.0);
        m.rotation.x = -THREE.MathUtils.degToRad(CAMERA.TILT_DEG);
        m.rotation.z =  THREE.MathUtils.degToRad(CAMERA.ROLL_DEG);
        scene.add(m);
      });
      shadow.position.z = TUNE.GROUP_Z + 3.4;
      items.push({ solid, edge, shadow, baseY: y, speed: 0.72 });
    });

    // === 入力系 ===
    const isInteractive = (t: EventTarget | null) =>
      t instanceof Element && t.closest('a, button, [role="button"], input, textarea, select, summary, details');

    let scrollTarget = 0, scrollState = 0, pointerDown = false, lastY = 0;
    let userInteracted = false;
    const mark = () => { userInteracted = true; };

    const wheel  = (e: WheelEvent) => { if (isInteractive(e.target)) return; scrollTarget += e.deltaY * MOTION.SPEED; mark(); };
    const pdown  = (e: PointerEvent) => { if (isInteractive(e.target)) return; pointerDown = true; lastY = e.clientY; mark(); };
    const pup    = () => (pointerDown = false);
    const pmove  = (e: PointerEvent) => { if (!pointerDown || isInteractive(e.target)) return; const dy = e.clientY - lastY; lastY = e.clientY; scrollTarget += dy * MOTION.TOUCH_SPEED; };

    window.addEventListener("wheel", wheel, { passive: true });
    window.addEventListener("pointerdown", pdown, { passive: true });
    window.addEventListener("pointerup", pup, { passive: true });
    window.addEventListener("pointercancel", pup, { passive: true });
    window.addEventListener("pointermove", pmove, { passive: true });
    window.addEventListener("touchstart", mark, { passive: true });
    window.addEventListener("keydown",  mark, { passive: true });

    const tilt = { x: 0, y: 0 };
    const mouse = (e: MouseEvent) => {
      if (isInteractive(e.target)) return;
      const r = container.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      tilt.x = THREE.MathUtils.degToRad(MOTION.TILT_MAX) * ny;
      tilt.y = THREE.MathUtils.degToRad(MOTION.TILT_MAX) * -nx;
    };
    window.addEventListener("mousemove", mouse, { passive: true });

    const onResize = () => {
      const r = container.getBoundingClientRect();
      renderer.setSize(r.width, r.height);
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize, { passive: true });

    // ===== ループ =====
    const clock = new THREE.Clock();
    const updateBand = (band: THREE.Group, worldYRaw: number) => {
      const ud = (band as any).userData;
      const base = ((worldYRaw * ud.speed) % ud.step + ud.step) % ud.step;
      band.children.forEach((m, i) => (((m as THREE.Mesh).position.y = i * ud.step - base), 0));
      (ud.mats as THREE.ShaderMaterial[]).forEach((m) => (m.uniforms.uTime.value = clock.getElapsedTime()));
    };
    const setBandOpacity = (band: THREE.Group, alpha: number) => {
      const ud = (band as any).userData;
      (ud.mats as THREE.ShaderMaterial[]).forEach((m) => { m.uniforms.uOpacity.value = ud.baseOpacity * alpha; });
    };

    let raf = 0;
    const loop = () => {
      const t = clock.getElapsedTime();

      scrollState += (scrollTarget - scrollState) * MOTION.INERTIA;
      const worldYRaw  = scrollState * MOTION.PX2WORLD;
      const worldYText = worldYRaw * TUNE.TEXT_SCROLL;

      const upd = (b: THREE.Group | null) => { if (b) updateBand(b, worldYRaw); };
      upd(farBand1); upd(farBand2); upd(midBand1); upd(midBand2); upd(nearBand1); upd(nearBand2);

      // 近景のフェードイン
      const progress = THREE.MathUtils.clamp(Math.abs(worldYRaw) / INTRO_NEAR.scrollWorldForMax, 0, 1);
      const allow = INTRO_NEAR.requireInteract ? userInteracted : true;
      const nearAlpha = allow ? INTRO_NEAR.startAlpha + (1 - INTRO_NEAR.startAlpha) * progress : 0.0;

      const setA = (b: THREE.Group | null, a: number) => { if (b) setBandOpacity(b, a); };
      setA(nearBand1, nearAlpha); setA(nearBand2, nearAlpha);
      setA(farBand1, 1); setA(farBand2, 1); setA(midBand1, 1); setA(midBand2, 1);

      // テキスト出現
      const centerY = -2;
      items.forEach(({ solid, edge, shadow, baseY, speed }) => {
        const y = baseY - worldYText * speed;
        solid.position.set(0, y, TUNE.GROUP_Z + 3.0);
        edge.position.set(0, y, TUNE.GROUP_Z + 3.01);
        shadow.position.set(0, y - 1.4, TUNE.GROUP_Z + 3.4);
        const d = Math.abs(y - centerY);
        const boost = THREE.MathUtils.clamp(1.8 - d * 0.10, 0, 1);
        const gate  = THREE.MathUtils.clamp((boost - 0.15) / 0.45, 0, 1);
        (edge.material as THREE.ShaderMaterial).uniforms.uTime.value  = t;
        (edge.material as THREE.ShaderMaterial).uniforms.uAlpha.value = 0.95 * gate;
        (solid.material as THREE.MeshBasicMaterial).opacity  = gate * (0.12 + 0.88 * boost);
        (shadow.material as THREE.MeshBasicMaterial).opacity = gate * (0.15 + 0.35 * boost);
      });

      // 微動
      camera.rotation.x = -THREE.MathUtils.degToRad(CAMERA.TILT_DEG) + tilt.x * 0.35;
      camera.rotation.z =  THREE.MathUtils.degToRad(CAMERA.ROLL_DEG) + tilt.y * 0.35;
      camera.position.z  = CAMERA.Z + Math.sin(t * 0.25) * 0.6;

      // ▼ 高さアニメ：基準＋揺れ幅
      island.position.y  = ISLAND_BASE_Y + Math.sin(t * 1.2) * ISLAND_SWAY;

      if ((rays.material as any).uniforms) (rays.material as any).uniforms.uTime.value = t;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // cleanup
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("pointerdown", pdown);
      window.removeEventListener("pointerup", pup);
      window.removeEventListener("pointercancel", pup);
      window.removeEventListener("pointermove", pmove);
      window.removeEventListener("touchstart", mark);
      window.removeEventListener("keydown",  mark);
      window.removeEventListener("mousemove", mouse);
      renderer.dispose();
      container.removeChild(renderer.domElement);
      scene.traverse((o:any) => {
        o.geometry?.dispose?.();
        if (o.material) {
          const m = o.material;
          Array.isArray(m) ? m.forEach((mm:any)=>mm.dispose?.()) : m.dispose?.();
        }
      });
    };
  }, []);

  return (
    <>
      <style>{`
        :root { color-scheme: dark; }
        .stage{
          position:relative; width:100%; height:92vh; min-height:680px;
          border-radius:20px; overflow:hidden; isolation:isolate;
          box-shadow:0 24px 60px rgba(0,0,0,.38);
          background-image:url('${BACKGROUND_IMAGE}');
          background-size:cover; background-position:center; background-repeat:no-repeat;
          z-index: 1;
        }
        .stage::before{
          content:""; position:absolute; inset:0; pointer-events:none; z-index:0;
          background: radial-gradient(30% 20% at 50% -10%, rgba(255,245,210,.22), transparent 40%);
          mix-blend-mode:soft-light;
        }
        .webgl{ position:absolute; inset:0; z-index:1; }
      `}</style>

      <section id="hero" className="stage" aria-label="Sky Parallax Portal">
        <div className="webgl" ref={mountRef} />
      </section>

      <AudioController src="/audio/megami.mp3" volume={0.5} />
    </>
  );
}
