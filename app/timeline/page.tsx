/* eslint-disable @next/next/no-img-element */
// app/timeline/page.tsx
"use client";

import { useEffect } from "react";

/** ====== 設定（任意） ===========================
 * GAS に “投稿ログだけ” を残したい場合は exec の URL を入れてください。
 * 不要なら空文字 "" にして問題ありません。
 */
const GAS_URL =
  "https://script.google.com/macros/s/AKfycbw9FiKbkzno4gqGK4jkZKaBB-Cxw8gOYtSCmMBOM8RNX95ZLp_uqxGiHvv0Wzm2eH1s/exec";
/** ============================================ */

/** 画像を JPEG DataURL に圧縮（約 ~2.2MP / 82%） */
async function compressImageToDataURL(
  file: File,
  { maxPixels = 2.2e6, quality = 0.82 } = {}
) {
  const img = new Image();
  const url = URL.createObjectURL(file);
  await new Promise<void>((ok, ng) => {
    img.onload = () => ok();
    img.onerror = () => ng(new Error("load_err"));
    img.src = url;
  });
  let w = img.naturalWidth,
    h = img.naturalHeight;
  const pix = w * h;
  if (pix > maxPixels) {
    const s = Math.sqrt(maxPixels / pix);
    w = Math.max(1, Math.round(w * s));
    h = Math.max(1, Math.round(h * s));
  }
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  const blob: Blob = (await new Promise((res) =>
    canvas.toBlob((b) => res(b as Blob), "image/jpeg", quality)
  )) as Blob;
  URL.revokeObjectURL(url);

  const r = new FileReader();
  const dataUrl = await new Promise<string>((ok, ng) => {
    r.onload = () => ok(String(r.result));
    r.onerror = () => ng(new Error("read_err"));
    r.readAsDataURL(blob);
  });
  return {
    dataUrl,
    mime: "image/jpeg",
    name: (file.name || "image").replace(/\.\w+$/, "") + ".jpg",
    size: blob.size,
  };
}

function fileToDataURL(file: File) {
  const r = new FileReader();
  return new Promise<string>((ok, ng) => {
    r.onload = () => ok(String(r.result));
    r.onerror = () => ng(new Error("read_err"));
    r.readAsDataURL(file);
  });
}

export default function TimelinePage() {
  useEffect(() => {
    /** ------- DOM 参照 */
    const $ = (s: string) => document.querySelector(s) as HTMLElement | null;
    const feed = $("#feed")!;
    const btnPost = $("#btnPost") as HTMLButtonElement;
    const msg = $("#postMsg")!;
    const nameInput = $("#fAuthor") as HTMLInputElement;
    const textInput = $("#fText") as HTMLTextAreaElement;
    const fileInput = $("#fFile") as HTMLInputElement;
    const btnMore = $("#btnMore") as HTMLButtonElement;
    const prog = $("#upProg") as HTMLElement;
    const pct = $("#upPct") as HTMLElement;
    const preview = $("#preview") as HTMLImageElement;
    const clearImgBtn = $("#clearImg") as HTMLButtonElement;

    /** ------- 旧仕様の個人コードを完全に削除 */
    try {
      localStorage.removeItem("volce_member_code");
      localStorage.removeItem("volce_device_id");
    } catch {}

    /** ------- 進捗 UI */
    function setProgress(v: number) {
      const n = Math.max(0, Math.min(100, v | 0));
      prog.style.setProperty("--p", String(n));
      pct.textContent = n + "%";
    }
    function showProg() {
      prog.hidden = false;
      prog.classList.remove("done");
      setProgress(0);
    }
    function markDone() {
      prog.classList.add("done");
      pct.textContent = "投稿";
    }
    function hideProg() {
      prog.hidden = true;
      prog.classList.remove("done");
      setProgress(0);
    }

    /** ------- 保存モデル */
    const LS_KEY = "volce_timeline_v2";
    type Item = {
      rid: string;
      author?: string;
      text?: string;
      mime?: string;
      publicUrl?: string; // DataURL
      thumbUrl?: string; // DataURL（今回は同一）
      downloadUrl?: string; // DataURL
      timestamp: string; // 表示用
    };

    const speak = (t: string) => {
      msg.textContent = t;
    };
    const readAll = (): Item[] => {
      try {
        return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
      } catch {
        return [];
      }
    };
    const writeAll = (arr: Item[]) =>
      localStorage.setItem(LS_KEY, JSON.stringify(arr));

    /** ------- 入力補助：画像プレビュー */
    fileInput?.addEventListener("change", async () => {
      const f = fileInput.files?.[0];
      if (!f) {
        preview.src = "";
        preview.hidden = true;
        clearImgBtn.hidden = true;
        return;
      }
      try {
        const out =
          f.type.startsWith("image/")
            ? await compressImageToDataURL(f)
            : { dataUrl: await fileToDataURL(f), mime: f.type || "image/jpeg" };
        preview.src = out.dataUrl;
        preview.hidden = false;
        clearImgBtn.hidden = false;
      } catch {
        preview.src = "";
        preview.hidden = true;
        clearImgBtn.hidden = true;
      }
    });
    clearImgBtn?.addEventListener("click", () => {
      fileInput.value = "";
      preview.src = "";
      preview.hidden = true;
      clearImgBtn.hidden = true;
      textInput?.focus();
    });

    /** ------- 投稿 */
    btnPost.addEventListener("click", async () => {
      const author = (nameInput.value || "").trim(); // 任意
      const text = (textInput.value || "").trim();
      const file = fileInput.files?.[0] || null;

      if (!text && !file) {
        speak("本文か画像のどちらかは必須です");
        return;
      }
      if (file && !/^image\//i.test(file.type || "")) {
        speak("画像のみアップできます");
        return;
      }
      if (file && file.size > 15 * 1024 * 1024) {
        speak("画像が大きすぎます（目安 15MB）");
        return;
      }

      btnPost.disabled = true;
      showProg();
      speak("準備中…");

      try {
        let dataUrl = "";
        let mime = "";
        if (file) {
          try {
            const out = await compressImageToDataURL(file, {
              maxPixels: 2.2e6,
              quality: 0.82,
            });
            dataUrl = out.dataUrl;
            mime = out.mime;
          } catch {
            dataUrl = await fileToDataURL(file);
            mime = file.type || "image/jpeg";
          }
        }

        setProgress(35);
        speak("投稿中…");

        const now = new Date();
        const item: Item = {
          rid:
            "rid_" +
            now.getTime() +
            "_" +
            Math.random().toString(16).slice(2),
          author,
          text,
          mime: dataUrl ? mime || "image/jpeg" : "",
          publicUrl: dataUrl || "",
          thumbUrl: dataUrl || "",
          downloadUrl: dataUrl || "",
          timestamp: new Intl.DateTimeFormat("ja-JP", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(now),
        };

        const all = readAll();
        all.unshift(item);
        writeAll(all);

        // （任意）GASへ投稿ログ（匿名・コード無し）
        if (GAS_URL) {
          try {
            const payload = JSON.stringify({
              rid: item.rid,
              author: author || "anonymous",
              text,
              ua: navigator.userAgent,
            });
            const blob = new Blob([payload], {
              type: "text/plain;charset=UTF-8",
            });
            navigator.sendBeacon(`${GAS_URL}?action=log`, blob);
            const qs = new URLSearchParams({
              rid: item.rid,
              author: author || "anonymous",
              text,
              ua: navigator.userAgent,
            });
            fetch(`${GAS_URL}?action=log&${qs.toString()}`, {
              method: "GET",
            }).catch(() => {});
          } catch {}
        }

        setProgress(100);
        markDone();
        prependPostDOM(item);

        // リセット
        textInput.value = "";
        fileInput.value = "";
        preview.src = "";
        preview.hidden = true;
        clearImgBtn.hidden = true;

        speak("投稿しました");
        setTimeout(hideProg, 800);
      } catch (e: any) {
        speak("エラー: " + (e?.message || e));
        console.error(e);
        hideProg();
      } finally {
        btnPost.disabled = false;
      }
    });

    /** ------- タイムライン描画（X風） */
    function escapeHtml(s: string) {
      return s.replace(/[&<>"']/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
          c
        ]!)
      );
    }
    function addPostToDOM(item: Item) {
      const el = document.createElement("article");
      el.className = "tw-post";

      // ヘッダ
      const head = document.createElement("header");
      head.className = "tw-post-h";
      head.innerHTML = `
        <div class="avt" aria-hidden="true"></div>
        <div class="meta">
          <strong class="name">${escapeHtml(item.author || "名無し")}</strong>
          <span class="dot">·</span>
          <time>${item.timestamp}</time>
        </div>
      `;
      el.appendChild(head);

      // 本文
      if (item.text) {
        const p = document.createElement("p");
        p.className = "tw-text";
        p.textContent = item.text;
        el.appendChild(p);
      }

      // 画像
      if (item.mime?.startsWith("image/") && (item.thumbUrl || item.publicUrl)) {
        const img = new Image();
        img.loading = "lazy";
        img.decoding = "async";
        img.referrerPolicy = "no-referrer";
        img.src = item.thumbUrl || item.publicUrl!;
        img.className = "tw-image";
        img.onerror = () => {
          img.remove();
          if (item.publicUrl) {
            const a = document.createElement("a");
            a.href = item.publicUrl;
            a.target = "_blank";
            a.rel = "noopener";
            a.textContent = "画像を開く";
            a.className = "tw-link";
            el.appendChild(a);
          }
        };
        el.appendChild(img);
      }

      // アクション（見た目だけ）
      const act = document.createElement("div");
      act.className = "tw-actions";
      act.innerHTML = `
        <button class="tw-ic" title="コメント" aria-label="コメント">💬</button>
        <button class="tw-ic" title="リポスト" aria-label="リポスト">🔁</button>
        <button class="tw-ic" title="いいね" aria-label="いいね">❤️</button>
        <button class="tw-ic" title="共有" aria-label="共有">↗</button>
        <span class="flex"></span>
        <button class="tw-del" title="削除" aria-label="削除">削除</button>
      `;
      (act.querySelector(".tw-del") as HTMLButtonElement).onclick = () => {
        if (!confirm("この投稿を削除しますか？")) return;
        const all = readAll();
        const idx = all.findIndex((x) => x.rid === item.rid);
        if (idx >= 0) {
          all.splice(idx, 1);
          writeAll(all);
          el.remove();
        }
      };
      el.appendChild(act);

      feed.appendChild(el);
    }
    function prependPostDOM(item: Item) {
      const before = feed.firstChild;
      addPostToDOM(item);
      if (before) feed.insertBefore(feed.lastChild!, before);
    }

    /** ------- 一覧・もっと読む */
    let offset = 0,
      limit = 12,
      done = false,
      loading = false;
    function renderMore() {
      if (loading || done) return;
      loading = true;
      btnMore.style.display = "none";

      const all = readAll();
      const slice = all.slice(offset, offset + limit);
      slice.forEach(addPostToDOM);
      offset += slice.length;
      done = offset >= all.length;
      if (!done) btnMore.style.display = "inline-flex";
      loading = false;
    }
    btnMore.addEventListener("click", renderMore);
    renderMore();

    /** ------- iOS 100vh & タップ */
    const setVH = () =>
      document.documentElement.style.setProperty(
        "--vh",
        window.innerHeight * 0.01 + "px"
      );
    setVH();
    addEventListener("resize", setVH, { passive: true });
    addEventListener("orientationchange", setVH, { passive: true });

    return () => {
      removeEventListener("resize", setVH);
      removeEventListener("orientationchange", setVH);
    };
  }, []);

  return (
    <>
      {/* このページだけ白背景に（グローバル） */}
      <style jsx global>{`
        body {
          background: #fff !important;
          color-scheme: light;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>

      {/* スコープ済み X 風スタイル */}
      <style jsx>{`
        :root {
          --blue: #1d9bf0;
          --text: #0f1419;
          --muted: #536471;
          --line: #eff3f4;
          --hover: rgba(29, 155, 240, 0.08);
        }
        .tw-page {
          max-width: 680px;
          margin: 0 auto;
          min-height: calc(var(--vh, 1vh) * 100);
          padding: 8px 0 40px;
          color: var(--text);
          background: #fff;
        }

        /* ===== Composer ===== */
        .composer {
          display: grid;
          grid-template-columns: 48px 1fr;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--line);
        }
        .avt {
          width: 48px;
          height: 48px;
          border-radius: 999px;
          background: #e6ecf0;
        }
        .name {
          width: 100%;
          border: none;
          outline: none;
          font-size: 15px;
          padding: 4px 0;
          color: var(--text);
          background: transparent;
        }
        .name::placeholder {
          color: var(--muted);
        }

        .text {
          width: 100%;
          min-height: 88px;
          border: none;
          outline: none;
          resize: vertical;
          font-size: 18px;
          line-height: 1.5;
          writing-mode: horizontal-tb;
          text-orientation: mixed;
          color: var(--text);
          background: transparent;
        }
        .text::placeholder {
          color: var(--muted);
        }

        .bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-top: 8px;
        }
        .icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 999px;
          border: 1px solid var(--line);
          background: #fff;
        }
        .icon-btn:hover {
          background: var(--hover);
          border-color: #e5f2ff;
        }
        .file {
          display: none;
        }
        .preview {
          width: 100%;
          max-height: 60vh;
          object-fit: contain;
          border-radius: 12px;
          border: 1px solid var(--line);
        }
        .clear {
          border: none;
          background: transparent;
          color: var(--muted);
          padding: 4px 8px;
          border-radius: 8px;
        }
        .clear:hover {
          background: #f1f5f9;
        }

        .post {
          margin-left: auto;
          padding: 8px 16px;
          min-width: 92px;
          height: 36px;
          border-radius: 999px;
          border: 1px solid #c2e7ff;
          background: #e8f3ff;
          color: #0b69c7;
          font-weight: 800;
        }
        .post:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .pc {
          --p: 0;
          width: 40px;
          height: 40px;
          border-radius: 999px;
          display: inline-grid;
          place-items: center;
          font-size: 12px;
          color: #7a5a00;
          background:
            conic-gradient(#ffd166 calc(var(--p) * 1%), #edf2f7 0) border-box,
            #fff padding-box;
          border: 1px solid #e2e8f0;
        }
        .pc.done {
          color: #0b69c7;
          background: #e8f3ff;
          border-color: #c2e7ff;
        }
        .pc[hidden] {
          display: none;
        }
        .muted {
          color: var(--muted);
          font-size: 13px;
        }

        /* ===== Posts ===== */
        .tw-post {
          padding: 12px 16px;
          border-bottom: 1px solid var(--line);
        }
        .tw-post-h {
          display: grid;
          grid-template-columns: 48px 1fr;
          gap: 12px;
          align-items: center;
        }
        .tw-post-h .meta {
          display: inline-flex;
          align-items: baseline;
          gap: 6px;
          color: var(--muted);
          font-size: 14px;
        }
        .tw-post-h .name {
          font-size: 15px;
          color: var(--text);
        }
        .tw-post .tw-text {
          white-space: pre-wrap;
          word-break: break-word;
          font-size: 15px;
          line-height: 1.6;
          margin: 8px 0 10px 60px;
        }
        .tw-image {
          margin-left: 60px;
          width: 100%;
          height: auto;
          border-radius: 16px;
          border: 1px solid var(--line);
          background: #fff;
          max-height: 70vh;
          object-fit: contain;
        }
        .tw-link {
          margin-left: 60px;
          color: var(--blue);
        }
        .tw-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-left: 60px;
          margin-top: 8px;
        }
        .tw-ic {
          border: none;
          background: transparent;
          width: 36px;
          height: 36px;
          border-radius: 999px;
        }
        .tw-ic:hover {
          background: var(--hover);
        }
        .flex {
          flex: 1;
        }
        .tw-del {
          border: 1px solid #fecaca;
          background: #fee2e2;
          color: #b91c1c;
          padding: 6px 12px;
          border-radius: 999px;
          font-weight: 700;
        }

        .more-wrap {
          display: grid;
          place-items: center;
          padding: 12px 0 24px;
        }
        .more {
          padding: 10px 16px;
          border-radius: 999px;
          border: 1px solid var(--line);
          background: #fff;
        }

        @media (max-width: 480px) {
          .tw-page {
            padding-bottom: max(40px, env(safe-area-inset-bottom));
          }
        }
      `}</style>

      <main className="tw-page" aria-label="タイムライン">
        {/* Composer */}
        <section className="composer" aria-label="投稿フォーム">
          <div className="avt" aria-hidden="true" />
          <div>
            <input
              id="fAuthor"
              className="name"
              type="text"
              placeholder="名前（任意）"
              maxLength={24}
            />
            <textarea
              id="fText"
              className="text"
              placeholder="いまどうしてる？"
            />
            <img id="preview" className="preview" hidden alt="" />
            <div className="bar">
              <label className="icon-btn" title="画像を追加">
                <input id="fFile" className="file" type="file" accept="image/*" />
                📷
              </label>
              <button id="clearImg" className="clear" hidden>
                画像をクリア
              </button>
              <span className="muted" id="postMsg" aria-live="polite" />
              <span style={{ flex: 1 }} />
              <div id="upProg" className="pc" hidden>
                <span id="upPct">0%</span>
              </div>
              <button id="btnPost" className="post">
                投稿する
              </button>
            </div>
          </div>
        </section>

        {/* Feed */}
        <section aria-label="最新投稿">
          <div id="feed" />
          <div className="more-wrap">
            <button id="btnMore" className="more" style={{ display: "none" }}>
              もっと読む
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
