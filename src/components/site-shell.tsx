import type { ReactNode } from "react";
import { SiteNav } from "@/components/site-nav";

// Common chrome: sticky nav + centered content + footer.
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-black/10 py-6 text-center text-xs text-neutral-400 dark:border-white/10">
        Village Community Platform · Built for our village 🪔
      </footer>
    </div>
  );
}
