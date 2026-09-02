import Link from "next/link";
import { getViewerContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logout, setPreviewMode } from "@/lib/actions/auth";
import { ButtonLink } from "@/components/ui/button";
import { OmMark } from "@/components/brand/om-mark";
import { NotificationBell } from "@/components/notification-bell";

export async function SiteNav() {
  const { user, previewAs } = await getViewerContext();

  const effectiveRole = previewAs ?? user?.role ?? "guest";
  const effectiveStatus = previewAs ? "active" : (user?.status ?? "guest");

  const isMember = effectiveStatus === "active" && ["member", "admin", "superadmin"].includes(effectiveRole);
  const isAdmin = !previewAs && (effectiveRole === "admin" || effectiveRole === "superadmin");
  const isSuper = !previewAs && effectiveRole === "superadmin";

  const showBell = !!user && !previewAs;
  const notifications = showBell
    ? await prisma.notification.findMany({
        where: { userId: user!.id },
        orderBy: { createdAt: "desc" },
        take: 12,
        select: { id: true, message: true, type: true, read: true, createdAt: true },
      })
    : [];
  const unread = notifications.filter((n) => !n.read).length;

  // Primary links (left cluster) + the "Contact" utility link (right cluster).
  const primary = [
    { href: "/occasions", label: "Occasions", show: true },
    { href: "/updates", label: "Updates", show: true },
    { href: "/members", label: "People", show: true },
    { href: "/polls", label: "Polls", show: true },
    { href: "/budget", label: "Budget", show: isMember },
    { href: "/admin", label: "Admin", show: isAdmin },
  ].filter((l) => l.show);

  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--hairline)] bg-[color:var(--background)]/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <OmMark />
          <span className="leading-tight">
            <span className="block font-semibold tracking-tight">Kundapur</span>
            <span className="block text-[0.62rem] font-medium uppercase tracking-[0.18em] text-muted">
              Village Connect
            </span>
          </span>
        </Link>

        {/* Primary links */}
        <div className="ml-4 hidden flex-1 items-center gap-x-5 gap-y-1 text-sm md:flex">
          {primary.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-medium text-foreground/70 transition hover:text-terracotta"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right cluster */}
        <div className="ml-auto flex shrink-0 items-center gap-3 md:ml-0">
          <span className="hidden h-5 w-px bg-[color:var(--hairline)] md:block" />
          <Link
            href="/contact"
            className="hidden text-sm font-medium text-foreground/70 transition hover:text-terracotta sm:block"
          >
            Contact
          </Link>

          {user ? (
            <>
              {isSuper && (
                <div className="hidden items-center gap-1 text-xs lg:flex">
                  <form action={setPreviewMode.bind(null, "member")}>
                    <button className="rounded-full border border-[color:var(--hairline)] px-2.5 py-1 text-muted transition hover:border-brand-400 hover:text-brand-700">
                      View as Member
                    </button>
                  </form>
                  <form action={setPreviewMode.bind(null, "guest")}>
                    <button className="rounded-full border border-[color:var(--hairline)] px-2.5 py-1 text-muted transition hover:border-brand-400 hover:text-brand-700">
                      View as Guest
                    </button>
                  </form>
                </div>
              )}
              {showBell && <NotificationBell notifications={notifications} unread={unread} />}
              <Link
                href="/dashboard"
                className="text-sm font-medium text-foreground/80 transition hover:text-terracotta"
              >
                {user.firstName}
              </Link>
              {!previewAs && (
                <Link
                  href="/profile"
                  className="hidden text-sm text-muted transition hover:text-terracotta sm:block"
                >
                  Profile
                </Link>
              )}
              <form action={logout}>
                <button className="text-sm text-muted transition hover:text-red-600">Sign out</button>
              </form>
            </>
          ) : (
            <ButtonLink href="/join" size="sm">
              Join our village <span aria-hidden>→</span>
            </ButtonLink>
          )}
        </div>
      </nav>
    </header>
  );
}
