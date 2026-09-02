import { prisma } from "@/lib/prisma";
import { getCurrentUser, canCreateInModule } from "@/lib/auth";
import { PageHeader } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { OccasionsExplorer, type OccasionCard } from "./occasions-explorer";

export const dynamic = "force-dynamic";

export default async function OccasionsPage() {
  const user = await getCurrentUser();
  const canCreate = canCreateInModule(user, "occasions");

  const occasions = await prisma.occasion.findMany({
    orderBy: { name: "asc" },
    include: {
      sessions: {
        orderBy: { year: "desc" },
        include: {
          _count: { select: { media: true } },
          media: { where: { type: "photo" }, orderBy: { addedAt: "desc" }, take: 1, select: { url: true } },
        },
      },
    },
  });

  const cards: OccasionCard[] = occasions.map((o) => {
    const years = o.sessions.map((s) => s.year).sort((a, b) => b - a);
    return {
      id: o.id,
      name: o.name,
      description: o.description,
      iconUrl: o.iconUrl,
      sessions: o.sessions.length,
      media: o.sessions.reduce((sum, s) => sum + s._count.media, 0),
      yearsLabel: years.length > 1 ? `${years[years.length - 1]}–${years[0]}` : "",
      cover: o.sessions.flatMap((s) => s.media)[0]?.url ?? null,
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Occasions"
        subtitle="Festivals and events — browse photos and videos by year"
        action={canCreate ? <ButtonLink href="/occasions/new" size="sm">New occasion</ButtonLink> : undefined}
      />
      <OccasionsExplorer occasions={cards} />
    </div>
  );
}
