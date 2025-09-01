// app/portal/page.tsx
import PortalClient from "./PortalClient";
export const dynamic = "force-dynamic";   // ← これ重要（SSGを止める）
export default function Page() {
  return <PortalClient />;
}
