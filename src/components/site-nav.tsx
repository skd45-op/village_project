import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ButtonLink } from "@/components/ui/button";
import { OmMark } from "@/components/brand/om-mark";
import { NotificationBell } from "@/components/notification-bell";
import { ProfileMenu } from "@/components/profile-menu";

export async function SiteNav() {
  const user = await getCurrentUser();

  const isMember = user?.status === "active" && ["member", "admin", "superadmin"].includes(user.role);
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  const notifications = user
    ? await prisma.notification.findMany({
        where: { userId: user.id },
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
    <header className="sticky top-0 z-30 border-b border-[color:var(--hairline)] bg-[color:var(--background)]/80 backdrop-blur-md print:hidden">
      <nav className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <OmMark />
          <span className="font-semibold tracking-tight">Kundapur</span>
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
          {!isAdmin && (
            <>
              <span className="hidden h-5 w-px bg-[color:var(--hairline)] md:block" />
              <Link
                href="/contact"
                className="hidden text-sm font-medium text-foreground/70 transition hover:text-terracotta sm:block"
              >
                Contact
              </Link>
            </>
          )}

          {user ? (
            <>
              <NotificationBell notifications={notifications} unread={unread} />
              <ProfileMenu firstName={user.firstName} />
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
