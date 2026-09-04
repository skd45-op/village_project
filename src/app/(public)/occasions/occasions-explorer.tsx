"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { TiltCard } from "@/components/ui/tilt-card";
import { occasionGradient } from "@/lib/display";
import { SearchBar } from "@/components/ui/search-bar";
import { EmptyState } from "@/components/ui/primitives";

export type OccasionCard = {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  sessions: number;
  media: number;
  yearsLabel: string;
  cover: string | null;
};

export function OccasionsExplorer({ occasions }: { occasions: OccasionCard[] }) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const filtered = query
    ? occasions.filter(
        (o) =>
          o.name.toLowerCase().includes(query) ||
          (o.description ?? "").toLowerCase().includes(query),
      )
    : occasions;

  return (
    <div className="space-y-6">
      <SearchBar value={q} onChange={setQ} placeholder="Search occasions…" />

      {filtered.length === 0 ? (
        <EmptyState title="No matches" hint="Try a different search." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((o) => (
            <TiltCard key={o.id}>
              <Link
                href={`/occasions/${o.id}`}
                className={`group relative flex min-h-[16rem] flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-br ${occasionGradient(o.id)} p-6 text-white shadow-lg transition hover:shadow-2xl`}
              >
                {o.cover && (
                  <Image
                    src={o.cover}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover opacity-45 transition duration-500 group-hover:scale-105 group-hover:opacity-55"
                  />
                )}
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                {o.iconUrl && <span className="absolute left-5 top-5 z-10 text-3xl drop-shadow">{o.iconUrl}</span>}

                <div className="relative">
                  <p className="eyebrow mb-2 text-white/80">
                    {o.sessions} session{o.sessions === 1 ? "" : "s"}
                    {o.yearsLabel && ` · ${o.yearsLabel}`}
                  </p>
                  <h2 className="font-display text-2xl font-semibold">{o.name}</h2>
                  {o.description && <p className="mt-1 line-clamp-2 text-sm text-white/85">{o.description}</p>}
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">
                    View archive <span className="transition group-hover:translate-x-0.5" aria-hidden>↗</span>
                  </span>
                  <span className="mt-1 block text-xs text-white/70">
                    {o.media} photo{o.media === 1 ? "" : "s"} &amp; video{o.media === 1 ? "" : "s"}
                  </span>
                </div>
              </Link>
            </TiltCard>
          ))}
        </div>
      )}
    </div>
  );
}
