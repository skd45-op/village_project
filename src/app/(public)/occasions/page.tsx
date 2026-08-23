import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canCreateInModule } from "@/lib/auth";
import { PageHeader, EmptyState } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function OccasionsPage() {
  const user = await getCurrentUser();
  const canCreate = canCreateInModule(user, "occasions");

  const occasions = await prisma.occasion.findMany({
    orderBy: { name: "asc" },
    include: {
      sessions: {
        orderBy: { year: "desc" },
        include: { _count: { select: { media: true } } },
      },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Occasions"
        subtitle="Festivals and events — browse photos and videos by year"
        action={
          canCreate ? (
            <ButtonLink href="/occasions/new" size="sm">New occasion</ButtonLink>
          ) : undefined
        }
      />

      {occasions.length === 0 ? (
        <EmptyState
          title="No occasions yet"
          hint={canCreate ? "Create the first occasion." : "Check back soon."}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {occasions.map((o) => {
            const totalMedia = o.sessions.reduce((sum, s) => sum + s._count.media, 0);
            const years = o.sessions.map((s) => s.year).sort((a, b) => b - a);

            return (
              <Link key={o.id} href={`/occasions/${o.id}`} className="group">
                <div className="rounded-2xl border border-black/10 bg-white p-5 transition hover:border-emerald-400 hover:shadow-md dark:border-white/10 dark:bg-neutral-900">
                  <div className="mb-2 flex items-center gap-2">
                    {o.iconUrl && <span className="text-2xl leading-none">{o.iconUrl}</span>}
                    <h2 className="font-semibold text-lg group-hover:text-emerald-600 transition">
                      {o.name}
                    </h2>
                  </div>

                  {o.description && (
                    <p className="mb-3 text-sm text-neutral-500 line-clamp-2">{o.description}</p>
                  )}

                  <p className="text-xs text-neutral-400 mb-3">
                    {totalMedia} media item{totalMedia === 1 ? "" : "s"}
                    {years.length > 1 && ` · ${years[years.length - 1]}–${years[0]}`}
                  </p>

                  {years.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {years.slice(0, 6).map((y) => (
                        <span
                          key={y}
                          className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        >
                          {y}
                        </span>
                      ))}
                      {years.length > 6 && (
                        <span className="text-xs text-neutral-400">+{years.length - 6} more</span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
