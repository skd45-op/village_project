import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getViewerContext } from "@/lib/auth";
import { ButtonLink } from "@/components/ui/button";
import { Container, SectionHeading, StatTile } from "@/components/ui/primitives";
import { HeroArt } from "@/components/brand/hero-art";
import { TiltCard } from "@/components/ui/tilt-card";
import { Reveal } from "@/components/ui/reveal";
import { PhotoMarquee } from "@/components/photo-marquee";
import { occasionGradient } from "@/lib/display";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  general: "Update",
  meeting: "Meeting",
  aarti: "Aarti",
  bhajan: "Bhajan",
  event: "Event",
};

export default async function HomePage() {
  const { user, previewAs } = await getViewerContext();

  const effectiveRole = previewAs ?? user?.role ?? "guest";
  const effectiveStatus = previewAs ? "active" : (user?.status ?? "guest");
  const isActiveMember = effectiveStatus === "active" && ["member", "admin", "superadmin"].includes(effectiveRole);
  const isAdminOrSuper = !previewAs && (user?.role === "admin" || user?.role === "superadmin");
  const isPending = !!user && user.status === "pending" && !previewAs;
  const showJoinCta = previewAs === "guest" || (!previewAs && !user);

  const [occasions, occasionCount, mediaCount, memberCount, ticker, updates] = await Promise.all([
    prisma.occasion.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        _count: { select: { sessions: true } },
        sessions: {
          orderBy: { year: "desc" },
          include: {
            _count: { select: { media: true } },
            media: { where: { type: "photo" }, orderBy: { addedAt: "desc" }, take: 1, select: { url: true } },
          },
        },
      },
    }),
    prisma.occasion.count(),
    prisma.media.count(),
    prisma.user.count({ where: { status: "active", role: { in: ["member", "admin", "superadmin"] } } }),
    prisma.announcement.findFirst({ orderBy: [{ pinned: "desc" }, { createdAt: "desc" }] }),
    prisma.announcement.findMany({ orderBy: [{ happensAt: "desc" }, { createdAt: "desc" }], take: 3 }),
  ]);

  const galleryPhotos = (
    await prisma.media.findMany({
      where: { type: "photo" },
      orderBy: { addedAt: "desc" },
      take: 14,
      select: { url: true },
    })
  ).map((m) => m.url);

  return (
    <div className="space-y-0">
      {/* ---------- HERO ---------- */}
      <section className="full-bleed -mt-10 bg-brand-900 text-white">
        <div className="ring-field">
          <Container className="grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
            <div>
              <p className="eyebrow mb-5 flex items-center gap-2 text-gold">
                <span aria-hidden>✦</span> Welcome home
              </p>
              <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl">
                Our place.
                <span className="block text-gold">Our people.</span>
                Our memories.
              </h1>
              <p className="mt-6 max-w-md text-lg text-white/70">
                Stay close to everything happening in Kundapur — from the next aarti to the
                stories we&apos;ve kept for years.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {showJoinCta && <ButtonLink href="/join" variant="gold" size="lg">Join our village →</ButtonLink>}
                {isActiveMember && !isAdminOrSuper && <ButtonLink href="/dashboard" variant="gold" size="lg">Go to dashboard →</ButtonLink>}
                {isAdminOrSuper && <ButtonLink href="/admin" variant="gold" size="lg">Admin panel →</ButtonLink>}
                {isPending && <ButtonLink href="/dashboard" variant="gold" size="lg">Check your status →</ButtonLink>}
                <ButtonLink href="/occasions" variant="secondary" size="lg">Explore occasions</ButtonLink>
              </div>
            </div>
            <div className="relative">
              <HeroArt className="float-slow" />
            </div>
          </Container>
        </div>
        <div className="border-t border-white/10">
          <Container className="flex items-center gap-4 py-4 text-xs text-white/50">
            <span className="h-px w-10 bg-white/30" />
            <span className="eyebrow">Scroll to explore</span>
          </Container>
        </div>
      </section>

      {/* ---------- HAPPENING SOON TICKER ---------- */}
      {ticker && (
        <section className="full-bleed border-b border-[color:var(--hairline)] bg-surface">
          <Container className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:gap-6">
            <span className="eyebrow flex shrink-0 items-center gap-2 text-terracotta">
              <BellIcon /> Happening soon
            </span>
            <span className="font-semibold">{ticker.title}</span>
            <span className="flex-1 truncate text-sm text-muted">{ticker.body}</span>
            <Link href="/updates" className="shrink-0 text-sm font-semibold text-terracotta hover:underline">
              Happening now →
            </Link>
          </Container>
        </section>
      )}

      {/* ---------- LIVING ARCHIVE + STATS ---------- */}
      <section className="full-bleed paper">
        <Container className="py-16">
          <div className="grid gap-6 md:grid-cols-2 md:items-end">
            <SectionHeading eyebrow="The village, together" title="A living archive of" accent="what matters." />
            <p className="text-muted md:pb-2">
              One place to remember the celebrations, meet the people behind them, and keep
              everyone in the loop.
            </p>
          </div>

          <div className="mt-12 grid gap-8 border-t border-[color:var(--hairline)] pt-10 sm:grid-cols-3">
            <Reveal delay={0}><StatTile icon={<CalendarIcon />} value={occasionCount} label="Celebrations archived" /></Reveal>
            <Reveal delay={100}><StatTile icon={<CameraIcon />} value={mediaCount} label="Photos & videos" /></Reveal>
            <Reveal delay={200}><StatTile icon={<PeopleIcon />} value={memberCount} label="People in our circle" /></Reveal>
          </div>
        </Container>
      </section>

      {/* ---------- OCCASIONS ---------- */}
      <section className="full-bleed bg-surface">
        <Container className="py-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Step into the archive" title="Moments worth" accent="coming back to." />
            <Link href="/occasions" className="text-sm font-semibold text-terracotta hover:underline">
              View all occasions →
            </Link>
          </div>

          {occasions.length === 0 ? (
            <p className="text-muted">No occasions yet — check back soon.</p>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {occasions.map((o, i) => {
                const totalMedia = o.sessions.reduce((sum, s) => sum + s._count.media, 0);
                const cover = o.sessions.flatMap((s) => s.media)[0]?.url ?? null;
                return (
                  <Reveal key={o.id} delay={i * 90}>
                    <TiltCard className="h-full">
                      <Link
                        href={`/occasions/${o.id}`}
                        className={`group relative flex min-h-[19rem] flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-br ${occasionGradient(o.id)} p-6 text-white shadow-lg transition hover:shadow-2xl`}
                      >
                        {cover && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45 transition duration-500 group-hover:scale-105 group-hover:opacity-55" />
                        )}
                        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        {o.iconUrl && <span className="absolute left-5 top-5 z-10 text-3xl drop-shadow">{o.iconUrl}</span>}
                        <div className="relative">
                          <p className="eyebrow mb-2 text-white/80">
                            {o._count.sessions} session{o._count.sessions === 1 ? "" : "s"}
                          </p>
                          <h3 className="font-display text-2xl font-semibold">{o.name}</h3>
                          {o.description && <p className="mt-1 line-clamp-2 text-sm text-white/85">{o.description}</p>}
                          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">
                            View archive <span className="transition group-hover:translate-x-0.5" aria-hidden>↗</span>
                          </span>
                          <span className="mt-2 block text-xs text-white/70">{totalMedia} photo{totalMedia === 1 ? "" : "s"} &amp; video{totalMedia === 1 ? "" : "s"}</span>
                        </div>
                      </Link>
                    </TiltCard>
                  </Reveal>
                );
              })}
            </div>
          )}
        </Container>
      </section>

      {/* ---------- PHOTO MARQUEE ---------- */}
      {galleryPhotos.length > 0 && (
        <section className="full-bleed border-y border-[color:var(--hairline)] bg-surface py-10">
          <div className="mb-5 text-center">
            <p className="eyebrow text-terracotta">From our albums</p>
          </div>
          <PhotoMarquee urls={galleryPhotos} />
        </section>
      )}

      {/* ---------- UPDATES ---------- */}
      <section className="full-bleed paper">
        <Container className="grid gap-10 py-16 md:grid-cols-2">
          <div>
            <SectionHeading eyebrow="No one misses a thing" title="Stay in the" accent="know." />
            <p className="mt-5 max-w-sm text-muted">
              Meetings, aartis, bhajans, volunteer calls — the little updates that keep a village
              feeling like a village.
            </p>
            <ButtonLink href="/updates" className="mt-7 bg-brand-950 text-white hover:bg-brand-900">
              See all updates →
            </ButtonLink>
          </div>

          <div className="divide-y divide-[color:var(--hairline)]">
            {updates.length === 0 ? (
              <p className="text-sm text-muted">No updates yet.</p>
            ) : (
              updates.map((a) => (
                <Link key={a.id} href="/updates" className="group flex gap-4 py-5">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
                    <BellIcon />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted">
                      <span className="eyebrow text-terracotta">{CATEGORY_LABEL[a.category] ?? "Update"}</span>
                      {" · "}
                      {formatDate(a.happensAt ?? a.createdAt)}
                    </p>
                    <h3 className="mt-1 font-semibold transition group-hover:text-terracotta">{a.title}</h3>
                    <p className="mt-0.5 line-clamp-1 text-sm text-muted">{a.body}</p>
                  </div>
                  <span className="mt-1 text-muted transition group-hover:translate-x-0.5" aria-hidden>↗</span>
                </Link>
              ))
            )}
          </div>
        </Container>
      </section>

      {/* ---------- CTA BAND ---------- */}
      <section className="full-bleed paper pb-16">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-plum px-8 py-12 text-white sm:px-12">
            <span aria-hidden className="pointer-events-none absolute -right-6 top-1/2 -translate-y-1/2 select-none font-display text-[16rem] leading-none text-white/[0.06]">
              ॐ
            </span>
            <div className="relative max-w-lg">
              <p className="eyebrow mb-4 text-gold">Part of Kundapur?</p>
              {showJoinCta ? (
                <>
                  <h2 className="font-display text-4xl font-semibold sm:text-5xl">
                    Make your place <span className="text-gold">official.</span>
                  </h2>
                  <p className="mt-4 text-white/70">
                    Apply to become a verified member and get access to the conversations that shape
                    our village.
                  </p>
                  <ButtonLink href="/join" variant="gold" size="lg" className="mt-7">
                    Apply for membership →
                  </ButtonLink>
                </>
              ) : (
                <>
                  <h2 className="font-display text-4xl font-semibold sm:text-5xl">
                    Thanks for being <span className="text-gold">here.</span>
                  </h2>
                  <p className="mt-4 text-white/70">
                    Everything the village shares lives here. Jump back into your dashboard whenever
                    you like.
                  </p>
                  <ButtonLink href="/dashboard" variant="gold" size="lg" className="mt-7">
                    Go to dashboard →
                  </ButtonLink>
                </>
              )}
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18M8 2v4M16 2v4" />
    </svg>
  );
}
function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 8h3l2-2h6l2 2h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}
function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M17 5.2a3.2 3.2 0 0 1 0 6M18 20a6.5 6.5 0 0 0-3-5.5" />
    </svg>
  );
}
