import PortalClient from "./PortalClient";

// できるだけ静的化（毎回サーバー生成を避けてTTFB改善）
export const dynamic = "force-static";
export const revalidate = 60 * 60; // 1時間ごとに再生成（必要に応じて変更）

export default function Page() {
  return <PortalClient />;
}
