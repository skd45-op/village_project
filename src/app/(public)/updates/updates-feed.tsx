"use client";

import { useState } from "react";
import { deleteAnnouncement } from "@/lib/actions/announcements";
import { SearchBar } from "@/components/ui/search-bar";
import { EmptyState, Badge } from "@/components/ui/primitives";
import { formatDate } from "@/lib/utils";

const CATEGORY_LABEL: Record<string, string> = {
  general: "Update", meeting: "Meeting", aarti: "Aarti", bhajan: "Bhajan", event: "Event",
};

export type Update = {
  id: string;
  title: string;
  body: string;
  category: string;
  happensAt: Date | string | null;
  pinned: boolean;
  createdAt: Date | string;
};

export function UpdatesFeed({ updates, isAdmin }: { updates: Update[]; isAdmin: boolean }) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const filtered = query
    ? updates.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.body.toLowerCase().includes(query) ||
          (CATEGORY_LABEL[a.category] ?? "").toLowerCase().includes(query),
      )
    : updates;

  return (
    <div className="space-y-5">
      <SearchBar value={q} onChange={setQ} placeholder="Search updates…" />

      {filtered.length === 0 ? (
        <EmptyState title="No matching updates" hint="Try a different search." />
      ) : (
        <div className="divide-y divide-[color:var(--hairline)]">
          {filtered.map((a) => (
            <article key={a.id} className="flex gap-4 py-5">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
                <BellIcon />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="eyebrow text-terracotta">{CATEGORY_LABEL[a.category] ?? "Update"}</span>
                  <span>·</span>
                  <span>{formatDate(a.happensAt ?? a.createdAt)}</span>
                  {a.pinned && <Badge tone="gold">Pinned</Badge>}
                </div>
                <h3 className="mt-1 font-display text-lg font-semibold">{a.title}</h3>
                <p className="mt-1 text-sm text-muted">{a.body}</p>
              </div>
              {isAdmin && (
                <form action={deleteAnnouncement} className="shrink-0">
                  <input type="hidden" name="id" value={a.id} />
                  <button className="text-xs text-muted transition hover:text-red-600">Delete</button>
                </form>
              )}
            </article>
          ))}
        </div>
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
