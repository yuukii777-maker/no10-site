// app/admin/page.tsx
"use client";

import { useEffect } from "react";

type Member = {
  author: string;
  keyHash: string | null;
  revoked: boolean;
  created: string;
  updated: string;
};

const LS_MEM = "volce_members_v1";

async function sha256(text: string) {
  const buf = new TextEncoder().encode(text);
  const dig = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(dig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export default function AdminPage() {
  useEffect(() => {
    const $ = (s: string) => document.querySelector(s) as HTMLElement | null;
    const keyInp = $("#adminKey") as HTMLInputElement;
    const wrap = $("#wrap")!;
    const msg = $("#msg")!;

    const read = (): Member[] => { try { return JSON.parse(localStorage.getItem(LS_MEM) || "[]"); } catch { return []; } };
    const write = (arr: Member[]) => localStorage.setItem(LS_MEM, JSON.stringify(arr));

    function render(items: Member[]) {
      if (!items.length) { wrap.innerHTML = '<p class="muted">メンバー登録はまだありません。</p>'; return; }
      let html = '<div style="overflow:auto"><table><thead><tr><th>名前</th><th>状態</th><th>作成</th><th>更新</th><th>keyHash</th><th>操作</th></tr></thead><tbody>';
      for (const it of items) {
        html += `<tr>
          <td>${escapeHtml(it.author)}</td>
          <td><span class="state-badge ${it.revoked ? "revoked" : "active"}">${it.revoked ? "停止中" : "有効"}</span></td>
          <td>${it.created || ""}</td>
          <td>${it.updated || ""}</td>
          <td class="keyhash">${it.keyHash ? it.keyHash.slice(0, 10) + "…" : ""}</td>
          <td class="row-actions">
            ${it.revoked
              ? `<button class="btn small" data-act="restore" data-author="${encodeURIComponent(it.author)}">復活</button>`
              : `<button class="btn small" data-act="revoke" data-author="${encodeURIComponent(it.author)}">取り上げ</button>`}
            <button class="btn small" data-act="setkey" data-author="${encodeURIComponent(it.author)}">キーをリセット</button>
          </td>
        </tr>`;
      }
      html += "</tbody></table></div>";
      wrap.innerHTML = html;

      wrap.querySelectorAll<HTMLButtonElement>("button[data-act]").forEach(b => {
        b.addEventListener("click", async () => {
          const act = b.dataset.act!;
          const author = decodeURIComponent(b.dataset.author!);
          try {
            const all = read();
            const idx = all.findIndex(x => x.author === author);
            if (idx < 0) return;
            if (act === "revoke") all[idx].revoked = true;
            else if (act === "restore") all[idx].revoked = false;
            else if (act === "setkey") {
              const nk = prompt(`${author} の新しい合言葉（英数字推奨）を入力してください:`,"") || "";
              if (!nk.trim()) return;
              all[idx].keyHash = await sha256(nk.trim());
            }
            all[idx].updated = new Date().toISOString();
            write(all);
            msg.textContent = "OK";
            render(read());
          } catch (e: any) {
            msg.textContent = "エラー: " + (e?.message || e);
          }
        });
      });
    }

    function escapeHtml(s: string) {
      return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
    }

    function ensureSamples() {
      // 初回用：タイムライン投稿者から自動抽出（存在しなければ）
      const mem = read();
      if (mem.length) return;
      try {
        const tl = JSON.parse(localStorage.getItem("volce_timeline_v1") || "[]") as any[];
        const map = new Map<string, Member>();
        for (const it of tl) {
          const a = (it.author || "").trim();
          if (!a) continue;
          if (!map.has(a)) {
            map.set(a, {
              author: a,
              keyHash: it.keyHash || null,
              revoked: false,
              created: new Date().toISOString(),
              updated: new Date().toISOString(),
            });
          }
        }
        const arr = Array.from(map.values());
        if (arr.length) write(arr);
      } catch {}
    }

    function load() {
      msg.textContent = "読み込み中…";
      ensureSamples();
      const list = read();
      render(list);
      msg.textContent = "";
    }

    document.getElementById("btnLoad")!.addEventListener("click", load);
  }, []);

  return (
    <>
      <style>{`
        .page{max-width:980px;margin:16px auto 40px;position:relative;z-index:1}
        table{width:100%;border-collapse:collapse}
        th,td{padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.12);font-size:14px}
        th{text-align:left;opacity:.85}
        .row-actions{display:flex;gap:8px;flex-wrap:wrap}
        .small{padding:6px 10px;font-size:12px}
        .muted{opacity:.75}
        .keyhash{font-family:ui-monospace,Consolas,monospace;font-size:12px;opacity:.7}
        .state-badge{font-size:12px;padding:2px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.2)}
        .revoked{background:rgba(255,80,80,.15);border-color:rgba(255,80,80,.35)}
        .active{background:rgba(90,200,120,.15);border-color:rgba(90,200,120,.35)}
        .topbar{display:flex;gap:10px;align-items:center;margin-bottom:12px}
        input[type="password"],input[type="text"]{padding:8px 10px;border-radius:10px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.06);color:#fff}
      `}</style>

      <main className="page">
        <section className="card">
          <h2 className="cutline brand" style={{ marginTop: 0 }}>メンバー管理</h2>

          <div className="topbar">
            <label>管理者合言葉</label>
            <input id="adminKey" type="password" placeholder="ADMIN_****" style={{ minWidth: 220 }} />
            <button className="btn small" id="btnLoad">読み込み</button>
            <span className="muted" id="msg"></span>
          </div>

          <div className="muted" style={{ marginBottom: 8 }}>
            ※合言葉はハッシュで保存のため表示しません。必要時は「キーをリセット」で新しい合言葉に置き換えてください（既存端末トークンは失効）。
          </div>

          <div id="wrap"></div>
        </section>
      </main>
    </>
  );
}
