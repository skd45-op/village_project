import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, Badge } from "@/components/ui/primitives";
import { formatDate } from "@/lib/utils";
import { sessionStatusTone } from "@/lib/display";

export default async function HomePage() {
  const [sessions, memberCount] = await Promise.all([
    prisma.session.findMany({
      orderBy: [{ year: "desc" }, { createdAt: "desc" }],
      take: 6,
      include: { occasion: true, _count: { select: { media: true } } },
    }),
    prisma.user.count({ where: { status: "active", role: { in: ["member", "admin", "superadmin"] } } }),
  ]);

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 px-6 py-12 text-center text-white">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Our Village, Together 🪔</h1>
        <p className="mx-auto mt-3 max-w-xl text-emerald-50">
          Festivals, photos and live streams, a transparent community treasury, and a
          directory of {memberCount} members — all in one place.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <ButtonLink href="/occasions" variant="secondary">Explore occasions</ButtonLink>
          <ButtonLink href="/join">Become a member</ButtonLink>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent occasions</h2>
          <Link href="/occasions" className="text-sm text-emerald-600 hover:underline">View all</Link>
        </div>
        {sessions.length === 0 ? (
          <p className="text-sm text-neutral-500">No sessions yet — check back soon.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((s) => (
              <Link key={s.id} href={`/occasions/${s.occasionId}/${s.id}`}>
                <Card className="h-full transition hover:border-emerald-400 hover:shadow">
                  <CardBody>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-400">{s.occasion.name}</span>
                      <Badge tone={sessionStatusTone(s.status)}>{s.status}</Badge>
                    </div>
                    <p className="mt-1 font-medium">{s.title}</p>
                    <p className="mt-1 text-sm text-neutral-500">
                      {formatDate(s.startDate)} · {s._count.media} media
                    </p>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
