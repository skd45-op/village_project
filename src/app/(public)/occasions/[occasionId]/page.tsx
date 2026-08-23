import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canCreateInModule } from "@/lib/auth";
import { addMedia, deleteMedia } from "@/lib/actions/occasions";
import { youtubeEmbedUrl } from "@/lib/display";
import { Card, CardBody, Field, Input, Select } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/submit-button";

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
      {/* Header */}
      <div>
        <p className="text-sm text-neutral-500 mb-1">
          <a href="/occasions" className="hover:underline">Occasions</a> /
        </p>
        <h1 className="text-2xl font-bold">
          {occasion.iconUrl ? `${occasion.iconUrl} ` : ""}
          {occasion.name}
        </h1>
        {occasion.description && (
          <p className="mt-1 text-neutral-500">{occasion.description}</p>
        )}
      </div>

      {/* Year tabs */}
      <div className="flex gap-2 flex-wrap">
        {allYears.map((y) => (
          <a
            key={y}
            href={`/occasions/${occasionId}?year=${y}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              y === selectedYear
                ? "bg-emerald-600 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            }`}
          >
            {y}
          </a>
        ))}
      </div>

      {/* Add media form — visible to media-module admins */}
      {canAdd && (
        <Card>
          <CardBody>
            <h2 className="mb-3 text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
              Add media for {selectedYear}
            </h2>
            <form action={addMedia} className="space-y-3">
              <input type="hidden" name="occasionId" value={occasionId} />
              <input type="hidden" name="year" value={selectedYear} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Type">
                  <Select name="type" defaultValue="photo">
                    <option value="photo">Photo (image URL)</option>
                    <option value="yt_link">YouTube video</option>
                    <option value="live">Live stream</option>
                  </Select>
                </Field>
                <Field label="URL">
                  <Input name="url" required placeholder="https://…" />
                </Field>
              </div>
              <SubmitButton pendingText="Adding…">Add media</SubmitButton>
            </form>
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
                      <div className="aspect-square overflow-hidden rounded-xl border border-black/10 bg-neutral-100 dark:bg-neutral-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.url}
                          alt=""
                          className="h-full w-full object-cover transition group-hover:scale-105"
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
