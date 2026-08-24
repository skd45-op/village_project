import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getViewerContext } from "@/lib/auth";
import { ButtonLink } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { user, previewAs } = await getViewerContext();

  const effectiveRole = previewAs ?? user?.role ?? "guest";
  const effectiveStatus = previewAs ? "active" : (user?.status ?? "guest");
  const isLoggedIn = !!user && !previewAs;
  const isActiveMember = effectiveStatus === "active" && ["member", "admin", "superadmin"].includes(effectiveRole);
  const isAdminOrSuper = !previewAs && (user?.role === "admin" || user?.role === "superadmin");
  const isPending = !!user && user.status === "pending" && !previewAs;

  const [occasions, memberCount] = await Promise.all([
    prisma.occasion.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        sessions: {
          orderBy: { year: "desc" },
          take: 1,
          include: { _count: { select: { media: true } } },
        },
      },
    }),
    prisma.user.count({
      where: { status: "active", role: { in: ["member", "admin", "superadmin"] } },
    }),
  ]);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 px-6 py-12 text-center text-white">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Our Village, Together 🪔</h1>
        <p className="mx-auto mt-3 max-w-xl text-emerald-50">
          Festivals, photos and live streams, a transparent community treasury, and a
          directory of {memberCount} member{memberCount === 1 ? "" : "s"} — all in one place.
        </p>

        <div className="mt-6 flex justify-center gap-3 flex-wrap">
          <ButtonLink href="/occasions" variant="secondary">Explore occasions</ButtonLink>

          {/* CTA changes based on role */}
          {isAdminOrSuper && (
            <ButtonLink href="/admin">Admin panel</ButtonLink>
          )}
          {isActiveMember && !isAdminOrSuper && (
            <ButtonLink href="/dashboard">Go to dashboard</ButtonLink>
          )}
          {isPending && (
            <ButtonLink href="/dashboard">Check your status</ButtonLink>
          )}
          {!isLoggedIn && !isPending && (
            <ButtonLink href="/join">Become a member</ButtonLink>
          )}
        </div>
      </section>

      {/* Recent occasions */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent occasions</h2>
          <Link href="/occasions" className="text-sm text-emerald-600 hover:underline">
            View all
          </Link>
        </div>

        {occasions.length === 0 ? (
          <p className="text-sm text-neutral-500">No occasions yet — check back soon.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {occasions.map((o) => {
              const latestSession = o.sessions[0];
              const totalMedia = o.sessions.reduce((sum, s) => sum + s._count.media, 0);
              return (
                <Link key={o.id} href={`/occasions/${o.id}`} className="group">
                  <div className="rounded-2xl border border-black/10 bg-white p-5 transition hover:border-emerald-400 hover:shadow-md dark:border-white/10 dark:bg-neutral-900">
                    <div className="flex items-center gap-2 mb-2">
                      {o.iconUrl && <span className="text-xl">{o.iconUrl}</span>}
                      <h3 className="font-semibold group-hover:text-emerald-600 transition">{o.name}</h3>
                    </div>
                    {o.description && (
                      <p className="text-sm text-neutral-500 line-clamp-1 mb-2">{o.description}</p>
                    )}
                    <p className="text-xs text-neutral-400">
                      {totalMedia} media item{totalMedia === 1 ? "" : "s"}
                      {latestSession && ` · Latest: ${latestSession.year}`}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
