import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canCreateInModule } from "@/lib/auth";
import { deleteMedia } from "@/lib/actions/occasions";
import { youtubeEmbedUrl, occasionGradient } from "@/lib/display";
import { Card, CardBody } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/submit-button";
import { AddMediaForm } from "./add-media-form";

export const dynamic = "force-dynamic";

export default async function OccasionPage({
  params,
  searchParams,
}: {
  params: Promise<{ occasionId: string }>;
  searchParams: Promise<{ year?: string }>;
}) {
  const { occasionId } = await params;
  const { year: yearStr } = await searchParams;

  const occasion = await prisma.occasion.findUnique({
    where: { id: occasionId },
    include: {
      sessions: {
        orderBy: { year: "desc" },
        include: { media: { orderBy: { addedAt: "desc" } } },
      },
    },
  });
  if (!occasion) notFound();

  const user = await getCurrentUser();
  const canAdd = canCreateInModule(user, "media");
  const isSuperAdmin = user?.role === "superadmin";

  const currentYear = new Date().getFullYear();
  const sessionYears = occasion.sessions.map((s) => s.year);
  const allYears = Array.from(new Set([...sessionYears, currentYear])).sort((a, b) => b - a);

  const selectedYear = yearStr ? parseInt(yearStr, 10) : (sessionYears[0] ?? currentYear);
  const session = occasion.sessions.find((s) => s.year === selectedYear);
  const media = session?.media ?? [];

  const photos = media.filter((m) => m.type === "photo");
  const videos = media.filter((m) => m.type === "yt_link");
  const lives = media.filter((m) => m.type === "live");

  return (
    <div className="space-y-6">
      {/* Gradient header banner */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${occasionGradient(occasion.id)} px-7 py-10 text-white shadow-lg`}>
        <span className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <p className="relative mb-2 text-sm text-white/70">
          <Link href="/occasions" className="hover:underline">Occasions</Link> /
        </p>
        <h1 className="relative font-display text-4xl font-semibold">
          {occasion.iconUrl ? `${occasion.iconUrl} ` : ""}
          {occasion.name}
        </h1>
        {occasion.description && (
          <p className="relative mt-2 max-w-2xl text-white/80">{occasion.description}</p>
        )}
      </div>

      {/* Year tabs */}
      <div className="flex gap-2 flex-wrap">
        {allYears.map((y) => (
          <Link
            key={y}
            href={`/occasions/${occasionId}?year=${y}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              y === selectedYear
                ? "bg-brand-800 text-white"
                : "bg-black/[0.05] text-neutral-600 hover:bg-black/10 dark:bg-white/10 dark:text-neutral-300 dark:hover:bg-white/20"
            }`}
          >
            {y}
          </Link>
        ))}
      </div>

      {/* Add media form — visible to media-module admins */}
      {canAdd && (
        <Card>
          <CardBody>
            <h2 className="mb-3 text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
              Add media
            </h2>
            <AddMediaForm
              occasionId={occasionId}
              currentYear={currentYear}
              selectedYear={selectedYear}
            />
          </CardBody>
        </Card>
      )}

      {/* Media content */}
      {media.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-10 text-center text-neutral-400 text-sm">
          No media for {selectedYear} yet.
          {canAdd ? " Use the form above to add photos or videos." : ""}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Live streams */}
          {lives.length > 0 && (
            <section>
              <h2 className="mb-3 font-semibold flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Live / Premieres
              </h2>
              <div className="space-y-4">
                {lives.map((m) => (
                  <div key={m.id} className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
                    <div className="aspect-video w-full">
                      <iframe
                        src={youtubeEmbedUrl(m.url) ?? undefined}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    {isSuperAdmin && (
                      <div className="flex justify-end px-3 py-2">
                        <form action={deleteMedia}>
                          <input type="hidden" name="mediaId" value={m.id} />
                          <SubmitButton size="sm" variant="danger" pendingText="…">Delete</SubmitButton>
                        </form>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Photos */}
          {photos.length > 0 && (
            <section>
              <h2 className="mb-3 font-semibold">Photos ({photos.length})</h2>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {photos.map((m) => (
                  <div key={m.id} className="group relative">
                    <a href={m.url} target="_blank" rel="noopener noreferrer">
                      <div className="relative aspect-square overflow-hidden rounded-xl border border-black/10 bg-neutral-100 dark:bg-neutral-800">
                        <Image
                          src={m.url}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                          className="object-cover transition group-hover:scale-105"
                        />
                      </div>
                    </a>
                    {isSuperAdmin && (
                      <form
                        action={deleteMedia}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <input type="hidden" name="mediaId" value={m.id} />
                        <button
                          type="submit"
                          className="rounded bg-red-600 px-1.5 py-0.5 text-xs text-white hover:bg-red-700"
                        >
                          ✕
                        </button>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* YouTube videos */}
          {videos.length > 0 && (
            <section>
              <h2 className="mb-3 font-semibold">Videos ({videos.length})</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {videos.map((m) => (
                  <div key={m.id} className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
                    <div className="aspect-video w-full">
                      <iframe
                        src={youtubeEmbedUrl(m.url) ?? undefined}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    {isSuperAdmin && (
                      <div className="flex justify-end px-3 py-2">
                        <form action={deleteMedia}>
                          <input type="hidden" name="mediaId" value={m.id} />
                          <SubmitButton size="sm" variant="danger" pendingText="…">Delete</SubmitButton>
                        </form>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
