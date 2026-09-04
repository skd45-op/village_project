"use client";

import { useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/primitives";
import { PhoneIcon, MailIcon } from "@/components/ui/icons";
import { cn, formatDate, formatDateTime } from "@/lib/utils";

export function HistoryRow({
  name,
  status,
  tone,
  reviewedAt,
  reviewedByName,
  adminNote,
  mobile,
  email,
  address,
  relation,
  age,
  children,
}: {
  name: string;
  status: string;
  tone: "neutral" | "green" | "amber" | "red" | "blue" | "brand" | "gold";
  reviewedAt: Date | string | null;
  reviewedByName: string | null;
  adminNote: string | null;
  mobile?: string;
  email?: string;
  address?: string;
  relation?: string;
  age?: number | null;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const verb = status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Reviewed";

  return (
    <div className="rounded-lg border border-black/10 dark:border-white/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
      >
        <span>
          {name} <span className="text-neutral-400">· {formatDate(reviewedAt)}</span>
        </span>
        <span className="flex items-center gap-2">
          <Badge tone={tone}>{status}</Badge>
          <svg
            viewBox="0 0 24 24"
            className={cn("h-4 w-4 shrink-0 text-neutral-400 transition-transform", open && "rotate-180")}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="space-y-2 border-t border-black/5 px-4 py-3 text-sm text-neutral-600 dark:border-white/5 dark:text-neutral-400">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {mobile && (
              <span className="inline-flex items-center gap-1.5">
                <PhoneIcon className="h-3.5 w-3.5 shrink-0" />
                {mobile}
              </span>
            )}
            {email && (
              <span className="inline-flex items-center gap-1.5 break-all">
                <MailIcon className="h-3.5 w-3.5 shrink-0" />
                {email}
              </span>
            )}
            {relation && <span>{relation}</span>}
            {age ? <span>Age {age}</span> : null}
          </div>
          {address && <p>{address}</p>}
          {adminNote && <p className="text-amber-700 dark:text-amber-400">Note: {adminNote}</p>}
          <p className="text-xs text-neutral-400">
            {verb} by {reviewedByName ?? "—"} · {formatDateTime(reviewedAt)}
          </p>
          {children}
        </div>
      )}
    </div>
  );
}
