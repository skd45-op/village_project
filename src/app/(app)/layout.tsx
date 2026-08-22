import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { getCurrentUser } from "@/lib/auth";

// Authenticated area. Coarse redirect also happens in proxy.ts; this guarantees
// a user object for the pages below.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  return <SiteShell>{children}</SiteShell>;
}
