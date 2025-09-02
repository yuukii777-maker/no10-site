import PortalClient from "./PortalClient";
export const dynamic = "force-dynamic"; // ← SSGを止める
export default function Page() {
  return <PortalClient />;
}
