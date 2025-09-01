/* app/portal/page.tsx */
import PortalClient from "./PortalClient";

export const dynamic = "force-dynamic"; // SSG を止めて毎回最新

export default function Page() {
  return <PortalClient />;
}
