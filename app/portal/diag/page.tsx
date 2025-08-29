/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

const SHA = (process.env.NEXT_PUBLIC_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || "")
  .toString()
  .slice(0, 8);
const Q = SHA ? `?v=${SHA}` : "";

const ASSETS = [
  "/portal/background2.webp",
  "/portal/cloud_far.webp",
  "/portal/cloud_mid.webp",
  "/portal/cloud_mid2.webp",
  "/portal/cloud_near.webp",
  "/portal/rays.webp",
  "/portal/flare_core.webp",
  "/portal/flare_wide.webp",
  "/portal/logo.webp",
];

const ThreeHeroLazy = dynamic(() => import("../ThreeHero").then(m => ({ default: m.default })), {
  ssr: false,
});

export default function DiagPage() {
  const [headStatuses, setHeadStatuses] = useState<Record<string, number | "ERR">>({});
  const [webgl, setWebgl] = useState<boolean>(false);
  const [reduced, setReduced] = useState<boolean>(false);
  const [threeLoaded, setThreeLoaded] = useState<boolean>(false);
  const [imgsOnDom, setImgsOnDom] = useState<string[]>([]);

  useEffect(() => {
    // HEAD で配信確認
    ASSETS.forEach((p) => {
      fetch(p, { method: "HEAD" })
        .then((r) => setHeadStatuses((s) => ({ ...s, [p]: r.status })))
        .catch(() => setHeadStatuses((s) => ({ ...s, [p]: "ERR" })));
    });
    // WebGL / reduced-motion
    try {
      const c = document.createElement("canvas");
      setWebgl(!!(c.getContext("webgl") || (c as any).getContext("experimental-webgl")));
    } catch {
      setWebgl(false);
    }
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
  }, []);

  useEffect(() => {
    // そのページが実際にimg要素として読み込んでいるか
    const list = Array.from(document.images)
      .map((i) => i.src)
      .filter((s) => /\/portal\/(cloud_|rays|flare_|logo)/.test(s));
    setImgsOnDom(list);
  }, []);

  // ThreeHero を一瞬だけ読み込んでみる（Canvasが1個出ればOK）
  const TryThree = useMemo(
    () =>
      function TryThree() {
        useEffect(() => setThreeLoaded(true), []);
        return (
          <div style={{ position: "relative", height: 220 }}>
            <ThreeHeroLazy />
          </div>
        );
      },
    []
  );

  return (
    <main style={{ padding: 20, color: "#e6edf3", fontFamily: "system-ui,Segoe UI,Roboto" }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Portal Diagnostics</h1>
      <div style={{ opacity: 0.8, marginBottom: 16 }}>
        commit: <b>{SHA || "(no sha)"}</b> · webgl: <b>{String(webgl)}</b> · reduce-motion:{" "}
        <b>{String(reduced)}</b>
      </div>

      <section style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <h3>HEAD status (CDN配信)</h3>
          <ul style={{ listStyle: "none", paddingLeft: 0, lineHeight: 1.6 }}>
            {ASSETS.map((p) => (
              <li key={p}>
                <code>{p}</code> :{" "}
                <b style={{ color: headStatuses[p] === 200 ? "#22c55e" : "#ef4444" }}>
                  {headStatuses[p] ?? "…"}
                </b>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3>実際にDOMへ出てる <code>&lt;img&gt;</code></h3>
          {imgsOnDom.length === 0 ? (
            <div style={{ color: "#f87171" }}>（該当imgがDOMに無い → JSが古い/分岐で出ていない）</div>
          ) : (
            <ul style={{ listStyle: "none", paddingLeft: 0 }}>
              {imgsOnDom.map((s) => (
                <li key={s}>
                  <small>{s.replace(location.origin, "")}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <h3 style={{ marginTop: 20 }}>画像のロード可視化（赤=失敗 / 緑=OK）</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {ASSETS.map((p) => (
          <div key={p} style={{ width: 180, height: 100, padding: 6, background: "#111827", borderRadius: 8 }}>
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 6,
                overflow: "hidden",
                border:
                  headStatuses[p] === 200
                    ? "2px solid rgba(34,197,94,.7)"
                    : headStatuses[p]
                    ? "2px solid rgba(239,68,68,.7)"
                    : "2px dashed rgba(156,163,175,.6)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <img
                src={p + Q}
                alt={p}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                onError={(e) => ((e.currentTarget.parentElement as HTMLDivElement).style.border = "2px solid rgba(239,68,68,.9)")}
                onLoad={(e) => ((e.currentTarget.parentElement as HTMLDivElement).style.border = "2px solid rgba(34,197,94,.9)")}
              />
            </div>
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>{p}</div>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: 24 }}>ThreeHero dynamic import テスト</h3>
      <p style={{ opacity: 0.85, marginTop: -8 }}>
        下にロゴが浮かぶ Canvas が出て、Console にエラーが出ていなければ OK（three/drei はクライアント限定）
      </p>
      <TryThree />
      <div style={{ marginTop: 8, fontSize: 13, opacity: 0.9 }}>
        loaded: <b style={{ color: threeLoaded ? "#22c55e" : "#ef4444" }}>{String(threeLoaded)}</b>
      </div>
    </main>
  );
}
