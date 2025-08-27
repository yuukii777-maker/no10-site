"use client";

import { useEffect, useMemo, useState } from "react";
import s from "./entry.module.css";

/* =============== 型 =============== */
type Post = {
  id: string;
  title?: string;
  when?: string;            // ISO like "2025-08-31T21:00"
  seats: 2 | 3 | 4 | 5;
  conditions?: string;
  imageDataUrl?: string;
  participants: string[];   // 参加者名
  createdAt: number;
};

/* =============== ストレージ =============== */
const LS_KEY = "volce_entry_v1";
const readAll = (): Post[] => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
};
const writeAll = (arr: Post[]) => localStorage.setItem(LS_KEY, JSON.stringify(arr));

/* =============== 日時表示（M/D H時から） =============== */
function formatWhenJP(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(+d)) return "";
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}時から`;
}

/* =============== ページ =============== */
export default function EntryPage() {
  // form
  const [title, setTitle] = useState("");
  const [dateOnly, setDateOnly] = useState("");   // "YYYY-MM-DD"
  const [hourOnly, setHourOnly] = useState("");   // "00".."23"
  const [seats, setSeats] = useState<2 | 3 | 4 | 5>(5);
  const [conds, setConds] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // list
  const [items, setItems] = useState<Post[]>([]);

  useEffect(() => { setItems(readAll()); }, []);

  // 画像を DataURL に
  const fileToDataURL = (f: File) =>
    new Promise<string>((ok, ng) => {
      const r = new FileReader();
      r.onload = () => ok(String(r.result));
      r.onerror = () => ng(new Error("read_err"));
      r.readAsDataURL(f);
    });

  // 投稿
  const onSubmit = async () => {
    const whenIso =
      dateOnly && hourOnly ? `${dateOnly}T${hourOnly}:00` : undefined;

    const dataUrl = file ? await fileToDataURL(file).catch(() => "") : "";

    const post: Post = {
      id: "p_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      title: title.trim() || undefined,
      when: whenIso,
      seats,
      conditions: conds.trim() || undefined,
      imageDataUrl: dataUrl || undefined,
      participants: [],
      createdAt: Date.now(),
    };

    const all = [post, ...readAll()];
    writeAll(all);
    setItems(all);

    // reset
    setTitle("");
    setDateOnly("");
    setHourOnly("");
    setSeats(5);
    setConds("");
    setFile(null);
    // <input type="file"> の表示はブラウザが持つので特に触らない
  };

  // 参加
  const join = (id: string, name: string) => {
    const all = readAll();
    const idx = all.findIndex(p => p.id === id);
    if (idx < 0) return;
    const p = all[idx];
    if (name.trim() && !p.participants.includes(name) && p.participants.length < p.seats) {
      p.participants.push(name.trim());
      all[idx] = p;
      writeAll(all);
      setItems(all);
    }
  };

  const hours = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")),
    []
  );

  return (
    <main className={s.page}>
      <div className={s.wrap}>
        <h1 className={s.title}>ゲリラ情報</h1>

        {/* ---------- 投稿カード ---------- */}
        <section className={s.card} aria-labelledby="newpost">
          <h2 id="newpost" className={s.sectionTitle}>新規投稿</h2>

          <div className={s.formGrid}>
            {/* タイトル */}
            <div className={`${s.field} ${s.col1}`}>
              <div className={s.label}>タイトル（任意）</div>
              <input
                className={s.input}
                type="text"
                placeholder="例) ゲリラ参加者募集"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* 開催日時 */}
            <div className={`${s.field} ${s.col2}`}>
              <div className={s.label}>開催日時（何月何日・何時から）</div>
              <div className={s.whenRow}>
                <input
                  className={s.date}
                  type="date"
                  value={dateOnly}
                  onChange={(e) => setDateOnly(e.target.value)}
                  aria-label="開催日"
                />
                <select
                  className={s.select}
                  value={hourOnly}
                  onChange={(e) => setHourOnly(e.target.value)}
                  aria-label="開始時刻（時）"
                >
                  <option value="">--時--</option>
                  {hours.map(hh => (
                    <option key={hh} value={hh}>{Number(hh)}時</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 参加条件 */}
            <div className={`${s.field} ${s.col1}`}>
              <div className={s.label}>参加条件（任意）</div>
              <textarea
                className={s.textarea}
                placeholder="例) 精鋭5以上 / VC可 など"
                value={conds}
                onChange={(e) => setConds(e.target.value)}
              />
            </div>

            {/* 募集人数 */}
            <div className={`${s.field} ${s.col2}`}>
              <div className={s.label}>募集人数</div>
              <div className={s.chips}>
                {[2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    className={`${s.chip} ${seats === n ? s.chipActive : ""}`}
                    onClick={() => setSeats(n as 2 | 3 | 4 | 5)}
                  >
                    {n}人
                  </button>
                ))}
              </div>
            </div>

            {/* ファイル */}
            <div className={`${s.field} ${s.span}`}>
              <div className={s.label}>スクショ（任意）</div>
              <input
                className={s.file}
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            {/* 送信 */}
            <div className={`${s.actions} ${s.span}`}>
              <button className={s.btn} onClick={onSubmit}>投稿する</button>
            </div>
          </div>
        </section>

        {/* ---------- リスト ---------- */}
        {items.length === 0 ? (
          <p className={s.empty}>まだ投稿がありません。</p>
        ) : (
          <div className={s.list} aria-live="polite">
            {items.map(p => (
              <article key={p.id} className={s.item}>
                <div className={s.row}>
                  <strong>{p.title || "（タイトルなし）"}</strong>
                  {p.when && <span className={s.badge}>{formatWhenJP(p.when)}</span>}
                  <span className={s.badge}>募集 {p.seats}人</span>
                  <span className={s.badge}>現在 {p.participants.length}/{p.seats}</span>
                </div>

                {p.conditions && <p style={{ marginTop: 8 }}>{p.conditions}</p>}

                {p.imageDataUrl && (
                  <img
                    src={p.imageDataUrl}
                    alt=""
                    style={{ marginTop: 10, maxWidth: "100%", borderRadius: 12, border: "1px solid #e6eef6" }}
                  />
                )}

                {/* 参加フォーム */}
                <div className={s.joinWrap}>
                  <div className={s.joinRow}>
                    <input
                      className={s.joinName}
                      type="text"
                      placeholder="あなたのプレイヤー名"
                      id={`name_${p.id}`}
                    />
                    <button
                      className={s.joinBtn}
                      onClick={() => {
                        const el = document.getElementById(`name_${p.id}`) as HTMLInputElement | null;
                        join(p.id, el?.value || "");
                        if (el) el.value = "";
                      }}
                      disabled={p.participants.length >= p.seats}
                      title={p.participants.length >= p.seats ? "満員です" : "参加する"}
                    >
                      参加する
                    </button>
                  </div>
                  <div className={s.joinList}>
                    {p.participants.length === 0
                      ? "まだ参加者はいません。"
                      : "参加者：" + p.participants.join("、")}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
