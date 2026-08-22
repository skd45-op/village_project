import Link from "next/link";
import { getCurrentUser, isMemberOrAbove } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logout } from "@/lib/actions/auth";
import { ButtonLink } from "@/components/ui/button";

export async function SiteNav() {
  const user = await getCurrentUser();
  const member = isMemberOrAbove(user);
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  const unread = user
    ? await prisma.notification.count({ where: { userId: user.id, read: false } })
    : 0;

  const links: { href: string; label: string; show: boolean }[] = [
    { href: "/", label: "Home", show: true },
    { href: "/occasions", label: "Occasions", show: true },
    { href: "/members", label: "Members", show: true },
    { href: "/budget", label: "Budget", show: member },
    { href: "/polls", label: "Polls", show: member },
    { href: "/contact", label: "Contact", show: true },
    { href: "/admin", label: "Admin", show: isAdmin },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-black/10 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-neutral-950/90">
      <nav className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
        <Link href="/" className="shrink-0 font-semibold tracking-tight">
          🪔 Village
        </Link>
        <div className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {links
            .filter((l) => l.show)
            .map((l) => (
              <Link key={l.href} href={l.href} className="text-neutral-600 hover:text-emerald-600 dark:text-neutral-300">
                {l.label}
              </Link>
            ))}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard" className="relative text-sm text-neutral-600 hover:text-emerald-600 dark:text-neutral-300">
                {user.firstName}
                {unread > 0 && (
                  <span className="absolute -right-3 -top-2 rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">
                    {unread}
                  </span>
                )}
              </Link>
              <form action={logout}>
                <button className="text-sm text-neutral-500 hover:text-red-600">Sign out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-neutral-600 hover:text-emerald-600 dark:text-neutral-300">
                Sign in
              </Link>
              <ButtonLink href="/join" size="sm">
                Join
              </ButtonLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
