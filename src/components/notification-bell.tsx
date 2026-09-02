"use client";

import { useState } from "react";
import { markAllNotificationsRead } from "@/lib/actions/notifications";
import { formatDate } from "@/lib/utils";

type Note = { id: string; message: string; type: string; read: boolean; createdAt: Date | string };

export function NotificationBell({ notifications, unread }: { notifications: Note[]; unread: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition hover:bg-black/[0.05] hover:text-terracotta dark:hover:bg-white/10"
      >
        <BellIcon />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-terracotta px-1 text-[9px] font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
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
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-[color:var(--hairline)] bg-surface shadow-xl">
            <div className="flex items-center justify-between border-b border-[color:var(--hairline)] px-4 py-3">
              <p className="text-sm font-semibold">Notifications</p>
              {unread > 0 && (
                <form action={markAllNotificationsRead}>
                  <button className="text-xs font-medium text-terracotta hover:underline">Mark all read</button>
                </form>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted">You&apos;re all caught up 🎉</p>
              ) : (
                <ul className="divide-y divide-[color:var(--hairline)]">
                  {notifications.map((n) => (
                    <li key={n.id} className={`flex gap-3 px-4 py-3 ${!n.read ? "bg-terracotta/[0.04]" : ""}`}>
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!n.read ? "bg-terracotta" : "bg-transparent"}`} />
                      <div className="min-w-0">
                        <p className="text-sm">{n.message}</p>
                        <p className="mt-0.5 text-xs text-muted">{formatDate(n.createdAt)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}
