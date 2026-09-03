"use client";

import { useState } from "react";
import Link from "next/link";
import { logout } from "@/lib/actions/auth";

export function ProfileMenu({ firstName }: { firstName: string }) {
  const [open, setOpen] = useState(false);
  const initial = firstName?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 text-sm font-medium text-foreground/80 transition hover:bg-black/[0.05] hover:text-terracotta dark:hover:bg-white/10"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-800 text-xs font-semibold text-white">
          {initial}
        </span>
        <span>{firstName}</span>
        <ChevronIcon className={`h-3.5 w-3.5 text-muted transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          {/* click-away backdrop */}
          <button
            className="fixed inset-0 z-40 cursor-default"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-[color:var(--hairline)] bg-surface shadow-xl"
          >
            <Link
              href="/dashboard"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-foreground/80 transition hover:bg-black/[0.04] hover:text-terracotta dark:hover:bg-white/10"
            >
              Dashboard
            </Link>
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-foreground/80 transition hover:bg-black/[0.04] hover:text-terracotta dark:hover:bg-white/10"
            >
              Profile
            </Link>
            <form action={logout}>
              <button
                type="submit"
                role="menuitem"
                className="block w-full px-4 py-2.5 text-left text-sm text-muted transition hover:bg-black/[0.04] hover:text-red-600 dark:hover:bg-white/10"
              >
                Sign out
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
