import type { ReactNode } from "react";
import { SiteShell } from "@/components/site-shell";

// Pages here read live data (and the viewer's session) — render per request.
export const dynamic = "force-dynamic";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
