// app/portal/page.tsx
export const dynamic = "force-dynamic"; // ← SSGを止めて毎回最新
import PortalClient from "./PortalClient";

export default function Page() {
  return <PortalClient />;
}
