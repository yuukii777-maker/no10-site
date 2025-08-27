// app/entry/storage.ts
export type Member = { id: string; name: string };
export type EntryPost = {
  id: string;
  title?: string;
  when?: string;          // ISO string from <input type="datetime-local">
  seats: 2 | 3 | 4 | 5;
  conditions?: string;
  imageDataUrl?: string;  // 圧縮DataURL
  createdAt: number;
  members: Member[];
};

const LS_KEY = "volce_entry_posts_v1";
const DEVKEY = "volce_device_id";

export function getDeviceId() {
  let id = "";
  try { id = localStorage.getItem(DEVKEY) || ""; } catch {}
  if (!id) {
    id = crypto.randomUUID();
    try { localStorage.setItem(DEVKEY, id); } catch {}
  }
  return id;
}

export function readAll(): EntryPost[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as EntryPost[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function writeAll(list: EntryPost[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
  // 別タブへ反映用（iOS Safari 向けフォールバック）
  localStorage.setItem(LS_KEY + "_ping", String(Date.now()));
}

export function createPost(p: Omit<EntryPost, "id" | "createdAt" | "members">) {
  const list = readAll();
  const id = "ep_" + Date.now() + "_" + Math.random().toString(16).slice(2);
  const post: EntryPost = { id, createdAt: Date.now(), members: [], ...p };
  list.unshift(post);
  writeAll(list);
  return post;
}

export function updatePost(id: string, patch: Partial<EntryPost>) {
  const list = readAll();
  const i = list.findIndex((x) => x.id === id);
  if (i < 0) return;
  list[i] = { ...list[i], ...patch };
  writeAll(list);
}

export function joinPost(id: string, name: string, deviceId: string) {
  const list = readAll();
  const p = list.find((x) => x.id === id);
  if (!p) return;
  if (p.members.some((m) => m.id === deviceId)) return; // 既参加
  if (p.members.length >= p.seats) return;               // 満席
  p.members.push({ id: deviceId, name });
  writeAll(list);
}

export function cancelJoin(id: string, deviceId: string) {
  const list = readAll();
  const p = list.find((x) => x.id === id);
  if (!p) return;
  p.members = p.members.filter((m) => m.id !== deviceId);
  writeAll(list);
}
