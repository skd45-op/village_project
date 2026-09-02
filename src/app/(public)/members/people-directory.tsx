"use client";

import { useState } from "react";
import { SearchBar } from "@/components/ui/search-bar";
import { Card, CardBody, Badge, EmptyState } from "@/components/ui/primitives";

export type Person = {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  role: string;
  mobile: string | null;
};

export function PeopleDirectory({
  people,
  full,
  showRealRoles,
}: {
  people: Person[];
  full: boolean;
  showRealRoles: boolean;
}) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const filtered = query
    ? people.filter((p) => `${p.firstName} ${p.lastName}`.toLowerCase().includes(query))
    : people;

  return (
    <div className="space-y-6">
      <SearchBar value={q} onChange={setQ} placeholder="Search people by name…" />

      {filtered.length === 0 ? (
        <EmptyState title="No matches" hint="Try a different name." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <Card key={m.id} className="transition hover:shadow-md">
              <CardBody className="flex items-center gap-3">
                <Avatar name={`${m.firstName} ${m.lastName}`} photoUrl={m.photoUrl} />
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {m.firstName} {m.lastName}
                  </p>
                  {showRealRoles && m.role !== "member" && (
                    <Badge tone={m.role === "superadmin" ? "red" : "blue"}>{m.role}</Badge>
                  )}
                  {full && <p className="mt-0.5 truncate text-sm text-muted">{m.mobile ?? "—"}</p>}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Avatar({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  if (photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photoUrl} alt={name} className="h-12 w-12 shrink-0 rounded-full object-cover" />;
  }
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300">
      {initials}
    </div>
  );
}
