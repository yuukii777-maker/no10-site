"use client";

import { useEffect, useMemo, useState } from "react";

type ProductItem = {
  id: string; // row number string
  product: string;
  price: number;
  status: "active" | "soldout" | "comingsoon";
  feature: string;
};

type ApiReadRes =
  | { ok: true; items: ProductItem[] }
  | { ok: false; error: string; [k: string]: any };

type ApiWriteRes =
  | { ok: true }
  | { ok: false; error: string; [k: string]: any };

function cls(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function yen(n: number) {
  try {
    return new Intl.NumberFormat("ja-JP").format(Number(n || 0)) + "円";
  } catch {
    return String(n || 0) + "円";
  }
}

async function postJson<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(body),
  });
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("APIがJSON以外を返しました: " + text.slice(0, 200));
  }
}

export default function AdminProductsPage() {
  const [adminPw, setAdminPw] = useState("");
  const [items, setItems] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "ng"; text: string } | null>(
    null
  );
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return items;
    return items.filter((it) => {
      const blob = `${it.product} ${it.feature} ${it.status} ${it.price}`.toLowerCase();
      return blob.includes(qq);
    });
  }, [items, q]);

  const load = async () => {
    setMsg(null);
    if (!adminPw) {
      setMsg({ type: "ng", text: "ADMIN_PW を入力してください。" });
      return;
    }

    setLoading(true);
    try {
      const data = await postJson<ApiReadRes>("/api/admin-products", {
        action: "readProducts",
        password: adminPw,
      });
      if (!data || data.ok !== true) {
        setItems([]);
        setMsg({
          type: "ng",
          text: `読み込み失敗: ${(data as any)?.error || "unknown"}`,
        });
      } else {
        setItems(data.items || []);
        setMsg({ type: "ok", text: `読み込みOK（${data.items.length}件）` });
      }
    } catch (e: any) {
      setItems([]);
      setMsg({ type: "ng", text: `読み込み例外: ${e?.message || e}` });
    } finally {
      setLoading(false);
    }
  };

  const saveOne = async (it: ProductItem) => {
    setMsg(null);
    if (!adminPw) {
      setMsg({ type: "ng", text: "ADMIN_PW を入力してください。" });
      return;
    }

    setSavingId(it.id);
    try {
      const data = await postJson<ApiWriteRes>("/api/admin-products", {
        action: "updateProduct",
        password: adminPw,
        payload: {
          id: it.id,
          product: it.product,
          price: Number(it.price || 0),
          status: it.status,
          feature: it.feature,
        },
      });
      if (!data || data.ok !== true) {
        setMsg({
          type: "ng",
          text: `更新失敗: ${(data as any)?.error || "unknown"}`,
        });
      } else {
        setMsg({ type: "ok", text: `更新OK（行ID: ${it.id}）` });
      }
    } catch (e: any) {
      setMsg({ type: "ng", text: `更新例外: ${e?.message || e}` });
    } finally {
      setSavingId(null);
    }
  };

  useEffect(() => {
    try {
      const v = localStorage.getItem("ymk_admin_pw") || "";
      if (v && !adminPw) setAdminPw(v);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      if (adminPw) localStorage.setItem("ymk_admin_pw", adminPw);
    } catch {}
  }, [adminPw]);

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#2b2b2b]">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-bold">商品管理 /admin/products</h1>

        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
          <label className="text-sm font-semibold">ADMIN_PW</label>
          <input
            value={adminPw}
            onChange={(e) => setAdminPw(e.target.value)}
            type="password"
            className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3"
          />

          <button
            onClick={load}
            disabled={loading}
            className="mt-4 rounded-xl bg-black px-5 py-3 font-semibold text-white"
          >
            {loading ? "読み込み中..." : "商品を読み込む"}
          </button>

          {msg && (
            <div className="mt-4 text-sm">
              {msg.type === "ok" ? "✅ " : "❌ "}
              {msg.text}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
          <table className="w-full">
            <tbody>
              {filtered.map((it) => (
                <RowEditor
                  key={it.id}
                  item={it}
                  onChange={(next) =>
                    setItems((prev) =>
                      prev.map((p) => (p.id === next.id ? next : p))
                    )
                  }
                  onSave={() => saveOne(it)}
                  saving={savingId === it.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RowEditor({
  item,
  onChange,
  onSave,
  saving,
}: {
  item: ProductItem;
  onChange: (v: ProductItem) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <tr>
      <td>{item.id}</td>
      <td>
        <input
          value={item.product}
          onChange={(e) => onChange({ ...item, product: e.target.value })}
        />
      </td>
      <td>
        <input
          value={String(item.price)}
          onChange={(e) =>
            onChange({ ...item, price: Number(e.target.value) || 0 })
          }
        />
        {yen(item.price)}
      </td>
      <td>
        <select
          value={item.status}
          onChange={(e) =>
            onChange({
              ...item,
              status: e.target.value as ProductItem["status"],
            })
          }
        >
          <option value="active">active</option>
          <option value="soldout">soldout</option>
          <option value="comingsoon">comingsoon</option>
        </select>
      </td>
      <td>
        <textarea
          value={item.feature}
          onChange={(e) => onChange({ ...item, feature: e.target.value })}
        />
      </td>
      <td>
        <button onClick={onSave} disabled={saving}>
          {saving ? "更新中..." : "更新"}
        </button>
      </td>
    </tr>
  );
}
