"use client";
} as const;


let W = 0, H = 0, DPR = Math.min(devicePixelRatio || 1, 2);
const set = () => {
const parent = canvas.parentElement || document.documentElement;
W = Math.max(1, parent.clientWidth);
H = Math.max(1, parent.clientHeight);
canvas.width = Math.round(W * DPR);
canvas.height = Math.round(H * DPR);
canvas.style.width = W + "px";
canvas.style.height = H + "px";
ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
};
set();
addEventListener("resize", set, { passive: true });


type P = { x: number; y: number; vx: number; vy: number };
const ps: P[] = Array.from({ length: CFG.count }, () => ({
x: Math.random() * W,
y: Math.random() * H,
vx: (Math.random() - 0.5) * CFG.speed,
vy: (Math.random() - 0.5) * CFG.speed,
}));


let running = true;
const onVis = () => { running = document.visibilityState === "visible"; };
document.addEventListener("visibilitychange", onVis);


const loop = () => {
if (!running) return void requestAnimationFrame(loop);
ctx.clearRect(0, 0, W, H);


// links
ctx.strokeStyle = CFG.stroke;
for (let i = 0; i < ps.length; i++) {
for (let j = i + 1; j < ps.length; j++) {
const a = ps[i], b = ps[j];
const dx = a.x - b.x, dy = a.y - b.y;
const d2 = dx * dx + dy * dy;
if (d2 < CFG.link * CFG.link) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
}
}


// dots
ctx.fillStyle = CFG.color;
for (const p of ps) {
p.x += p.vx; p.y += p.vy;
if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
if (p.y < -10) p.y = H + 10; else if (p.y > H + 10) p.y = -10;
ctx.beginPath(); ctx.arc(p.x, p.y, CFG.radius, 0, Math.PI * 2); ctx.fill();
}
requestAnimationFrame(loop);
};
requestAnimationFrame(loop);


return () => {
removeEventListener("resize", set);
document.removeEventListener("visibilitychange", onVis);
};
}, []);


return <canvas ref={ref} className={className} aria-hidden />;
}