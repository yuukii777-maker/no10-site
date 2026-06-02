"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = searchParams.get("next") || "/admin/orders";

  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const login = async () => {
    if (!adminId || !password) {
      setMessage("IDとパスワードを入力してください。");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminId,
          password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setMessage(data?.message || "ログインに失敗しました。");
        return;
      }

      router.push(next);
      router.refresh();
    } catch (error) {
      setMessage("通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-20 text-[#333]">
      <section className="w-full max-w-md bg-white rounded-2xl shadow-lg border p-8">
        <h1 className="text-2xl font-bold text-center mb-2">管理画面ログイン</h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          管理者のみアクセスできます。
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">
              管理ID
            </label>
            <input
              className="w-full border rounded-lg px-4 py-3"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              placeholder="管理ID"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              パスワード
            </label>
            <input
              className="w-full border rounded-lg px-4 py-3"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード"
              autoComplete="current-password"
              onKeyDown={(e) => {
                if (e.key === "Enter") login();
              }}
            />
          </div>

          {message && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {message}
            </p>
          )}

          <button
            onClick={login}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl shadow"
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>

          <button
            onClick={() => router.push("/")}
            className="w-full text-sm text-gray-500 underline pt-2"
          >
            トップページへ戻る
          </button>
        </div>
      </section>
    </main>
  );
}