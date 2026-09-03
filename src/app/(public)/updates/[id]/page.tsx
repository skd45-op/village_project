import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Container, Card, CardBody, Badge } from "@/components/ui/primitives";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  general: "Update",
  meeting: "Meeting",
  aarti: "Aarti",
  bhajan: "Bhajan",
  event: "Event",
};

export default async function UpdateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement) notFound();

  const ended = !!announcement.endsAt && announcement.endsAt < new Date();

  return (
    <Container className="max-w-2xl">
      <Link href="/updates" className="text-sm text-brand-600 hover:underline">← All updates</Link>

      <Card className="mt-4">
        <CardBody className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="eyebrow text-terracotta">{CATEGORY_LABEL[announcement.category] ?? "Update"}</span>
            {announcement.pinned && !ended && <Badge tone="gold">Pinned</Badge>}
            {ended && <Badge tone="neutral">Ended</Badge>}
          </div>

          <h1 className="font-display text-2xl font-semibold">{announcement.title}</h1>

          {(announcement.happensAt || announcement.endsAt) && (
            <p className="text-sm text-muted">
              {announcement.happensAt ? formatDate(announcement.happensAt) : "—"}
              {announcement.endsAt && <> – {formatDate(announcement.endsAt)}</>}
            </p>
          )}

          <p className="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">{announcement.body}</p>

          <p className="border-t border-[color:var(--hairline)] pt-3 text-xs text-neutral-400">
            Posted {formatDate(announcement.createdAt)}
          </p>
        </CardBody>
      </Card>
    </Container>
  );
}
