// app/portal/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import PortalClient from "./PortalClient";

export default function Page() {
  return <PortalClient />;
}
