// app/portal/page.tsx
import PortalClient from "./PortalClient";

// SSG/ISRのキャッシュを避ける（常に最新アセットを読む）
export const revalidate = 0;

export default function Page() {
  return <PortalClient />;
}
