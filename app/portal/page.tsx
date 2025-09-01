// app/portal/page.tsx
import PortalClient from "./PortalClient";

export const dynamic = "force-dynamic"; // CDN / cache 影響を受けにくく（任意）

export default function Page() {
  return <PortalClient />;
}
