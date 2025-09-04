import PortalClient from "./PortalClient";

// 初回だけ生成（ISR）。毎回SSRをやめてTTFBを短縮
export const dynamic = "force-static";
export const revalidate = 60 * 60; // 1時間ごとに再生成（必要なら短く）

export default function Page() {
  return <PortalClient />;
}
