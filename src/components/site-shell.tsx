import type { ReactNode } from "react";
import { SiteNav } from "@/components/site-nav";
import { PreviewBanner } from "@/components/preview-banner";
import { getViewerContext } from "@/lib/auth";

export async function SiteShell({ children }: { children: ReactNode }) {
  const { previewAs } = await getViewerContext();
  return (
    <div className="flex min-h-dvh flex-col">
      {previewAs && <PreviewBanner previewAs={previewAs} />}
      <SiteNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-black/10 py-6 text-center text-xs text-neutral-400 dark:border-white/10">
        Village Community Platform · Built for our village 🪔
      </footer>
    </div>
  );
}
