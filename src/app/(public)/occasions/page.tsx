import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canCreateInModule } from "@/lib/auth";
import { PageHeader, Card, CardBody, Badge, EmptyState } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { sessionStatusTone } from "@/lib/display";
import { formatDate } from "@/lib/utils";

export default async function OccasionsPage() {
  const user = await getCurrentUser();
  const canCreate = canCreateInModule(user, "occasions");

  const occasions = await prisma.occasion.findMany({
    orderBy: { name: "asc" },
    include: {
      sessions: { orderBy: { year: "desc" }, include: { _count: { select: { media: true } } } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Occasions"
        subtitle="Festivals and their yearly sessions"
        action={canCreate ? <ButtonLink href="/occasions/new" size="sm">New occasion</ButtonLink> : undefined}
      />

      {occasions.length === 0 ? (
        <EmptyState title="No occasions yet" hint={canCreate ? "Create the first one." : "Check back soon."} />
      ) : (
        <div className="space-y-8">
          {occasions.map((o) => (
            <section key={o.id}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {o.iconUrl ? `${o.iconUrl} ` : ""}
                  {o.name}
                </h2>
                {canCreate && (
                  <Link href={`/occasions/${o.id}/new`} className="text-sm text-emerald-600 hover:underline">
                    + Add session
                  </Link>
                )}
              </div>
              {o.description && <p className="mb-3 text-sm text-neutral-500">{o.description}</p>}
              {o.sessions.length === 0 ? (
                <p className="text-sm text-neutral-400">No sessions yet.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {o.sessions.map((s) => (
                    <Link key={s.id} href={`/occasions/${o.id}/${s.id}`}>
                      <Card className="h-full transition hover:border-emerald-400 hover:shadow">
                        <CardBody>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{s.year}</span>
                            <Badge tone={sessionStatusTone(s.status)}>{s.status}</Badge>
                          </div>
                          <p className="mt-1 text-sm">{s.title}</p>
                          <p className="mt-1 text-xs text-neutral-500">
                            {formatDate(s.startDate)} · {s._count.media} media
                          </p>
                        </CardBody>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
