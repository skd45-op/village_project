import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default function AdminPortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-950 px-4 py-10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-2xl shadow-lg shadow-indigo-900/50">
          🔐
        </div>
        <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
          Village Community Platform
        </p>
      </div>
      <div className="w-full max-w-sm">{children}</div>
      <p className="mt-8 text-xs text-slate-700">Restricted access — authorised personnel only.</p>
    </div>
  );
}
