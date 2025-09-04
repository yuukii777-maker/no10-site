import PortalClient from "./PortalClient";

// 初回は静的生成（TTFB短縮）
export const dynamic = "force-static";
export const revalidate = 60 * 60; // 1時間

export default function Page() {
  return <PortalClient />;
}
