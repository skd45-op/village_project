import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canCreateInModule, isMemberOrAbove } from "@/lib/auth";
import { addMedia, flagMedia, deleteMedia } from "@/lib/actions/occasions";
import { PageHeader, Card, CardBody, Badge, Field, Input, Select, EmptyState } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/submit-button";
import { sessionStatusTone, youtubeEmbedUrl } from "@/lib/display";
import { formatDate } from "@/lib/utils";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ occasionId: string; sessionId: string }>;
}) {
  const { occasionId, sessionId } = await params;
  const user = await getCurrentUser();
  const canAddMedia = canCreateInModule(user, "media");
  const isSuper = user?.role === "superadmin";
  const member = isMemberOrAbove(user);

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { occasion: true, media: { orderBy: { addedAt: "desc" } } },
  });
  if (!session || session.occasionId !== occasionId) notFound();

  const live = session.media.filter((m) => m.type === "live");
  const photos = session.media.filter((m) => m.type === "photo");
  const videos = session.media.filter((m) => m.type === "yt_link");

  return (
    <div className="space-y-8">
      <PageHeader
        title={session.title}
        subtitle={`${session.occasion.name} · ${formatDate(session.startDate)}`}
        action={<Badge tone={sessionStatusTone(session.status)}>{session.status}</Badge>}
      />

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/occasions" className="text-emerald-600 hover:underline">← All occasions</Link>
        {member && (
          <Link href={`/budget?session=${session.id}`} className="text-emerald-600 hover:underline">
            View this session&apos;s budget →
          </Link>
        )}
      </div>

      {live.map((m) => {
        const embed = youtubeEmbedUrl(m.url);
        return (
          <section key={m.id}>
            <h2 className="mb-2 font-semibold">🔴 Live now</h2>
            {embed ? (
              <div className="aspect-video overflow-hidden rounded-xl">
                <iframe src={embed} className="h-full w-full" allowFullScreen title="Live stream" />
              </div>
            ) : (
              <a href={m.url} className="text-emerald-600 hover:underline">{m.url}</a>
            )}
          </section>
        );
      })}

      {canAddMedia && (
        <Card>
          <CardBody>
            <h2 className="mb-3 font-semibold">Add media</h2>
            <form action={addMedia} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="sessionId" value={session.id} />
              <input type="hidden" name="occasionId" value={occasionId} />
              <Field label="Type">
                <Select name="type" defaultValue="photo" className="w-36">
                  <option value="photo">Photo (URL)</option>
                  <option value="yt_link">YouTube video</option>
                  <option value="live">YouTube live</option>
                </Select>
              </Field>
              <Field label="URL">
                <Input name="url" type="url" required placeholder="https://…" className="w-72" />
              </Field>
              <SubmitButton pendingText="Adding…">Add</SubmitButton>
            </form>
          </CardBody>
        </Card>
      )}

      <section>
        <h2 className="mb-3 font-semibold">Photos</h2>
        {photos.length === 0 ? (
          <EmptyState title="No photos yet" />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((m) => (
              <div key={m.id} className="group relative overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt="Session photo" className="aspect-square w-full object-cover" />
                <MediaAdminControls mediaId={m.id} flagged={m.correctionFlag !== "none"} canAddMedia={canAddMedia} isSuper={isSuper} />
              </div>
            ))}
          </div>
        )}
      </section>

      {videos.length > 0 && (
        <section>
          <h2 className="mb-3 font-semibold">Videos</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {videos.map((m) => {
              const embed = youtubeEmbedUrl(m.url);
              return (
                <div key={m.id}>
                  {embed ? (
                    <div className="aspect-video overflow-hidden rounded-xl">
                      <iframe src={embed} className="h-full w-full" allowFullScreen title="Video" />
                    </div>
                  ) : (
                    <a href={m.url} className="text-emerald-600 hover:underline">{m.url}</a>
                  )}
                  <MediaAdminControls mediaId={m.id} flagged={m.correctionFlag !== "none"} canAddMedia={canAddMedia} isSuper={isSuper} inline />
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function MediaAdminControls({
  mediaId,
  flagged,
  canAddMedia,
  isSuper,
  inline,
}: {
  mediaId: string;
  flagged: boolean;
  canAddMedia: boolean;
  isSuper: boolean;
  inline?: boolean;
}) {
  if (!canAddMedia && !isSuper) return null;
  return (
    <div className={inline ? "mt-1 flex gap-2" : "absolute right-1 top-1 flex gap-1 opacity-0 transition group-hover:opacity-100"}>
      {canAddMedia && !flagged && !isSuper && (
        <form action={flagMedia}>
          <input type="hidden" name="mediaId" value={mediaId} />
          <button className="rounded bg-amber-500/90 px-2 py-0.5 text-xs text-white">Flag</button>
        </form>
      )}
      {flagged && <span className="rounded bg-amber-500/90 px-2 py-0.5 text-xs text-white">Flagged</span>}
      {isSuper && (
        <form action={deleteMedia}>
          <input type="hidden" name="mediaId" value={mediaId} />
          <button className="rounded bg-red-600/90 px-2 py-0.5 text-xs text-white">Delete</button>
        </form>
      )}
    </div>
  );
}
