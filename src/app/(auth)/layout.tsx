import Link from "next/link";
import type { ReactNode } from "react";

// Bootstrap/login read live data — render per request, never prerender.
export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-neutral-50 px-4 py-10 dark:bg-neutral-950">
      <Link href="/" className="mb-6 text-lg font-semibold tracking-tight">
        🪔 Village Community
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
