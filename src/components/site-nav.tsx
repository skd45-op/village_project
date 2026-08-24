import Link from "next/link";
import { getViewerContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logout, setPreviewMode } from "@/lib/actions/auth";
import { ButtonLink } from "@/components/ui/button";

export async function SiteNav() {
  const { user, previewAs } = await getViewerContext();

  // When Super Admin is in preview mode, render nav as that role would see it
  const effectiveRole = previewAs ?? user?.role ?? "guest";
  const effectiveStatus = previewAs ? "active" : (user?.status ?? "guest");

  const isMember = effectiveStatus === "active" && ["member", "admin", "superadmin"].includes(effectiveRole);
  const isAdmin = !previewAs && (effectiveRole === "admin" || effectiveRole === "superadmin");
  const isSuper = !previewAs && effectiveRole === "superadmin";

  const unread =
    user && !previewAs
      ? await prisma.notification.count({ where: { userId: user.id, read: false } })
      : 0;

  const links = [
    { href: "/", label: "Home", show: true },
    { href: "/occasions", label: "Occasions", show: true },
    { href: "/members", label: "Members", show: true },
    { href: "/budget", label: "Budget", show: isMember },
    { href: "/polls", label: "Polls", show: isMember },
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
              <Link
                key={l.href}
                href={l.href}
                className="text-neutral-600 hover:text-emerald-600 dark:text-neutral-300"
              >
                {l.label}
              </Link>
            ))}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {user ? (
            <>
              {/* Super Admin preview toggle — only shown when not already in preview */}
              {isSuper && (
                <div className="flex items-center gap-1 text-xs">
                  <form action={setPreviewMode.bind(null, "member")}>
                    <button
                      type="submit"
                      className="rounded-full border border-neutral-200 px-2.5 py-1 text-neutral-500 hover:border-emerald-400 hover:text-emerald-600 transition dark:border-neutral-700 dark:text-neutral-400"
                    >
                      View as Member
                    </button>
                  </form>
                  <form action={setPreviewMode.bind(null, "guest")}>
                    <button
                      type="submit"
                      className="rounded-full border border-neutral-200 px-2.5 py-1 text-neutral-500 hover:border-emerald-400 hover:text-emerald-600 transition dark:border-neutral-700 dark:text-neutral-400"
                    >
                      View as Guest
                    </button>
                  </form>
                </div>
              )}

              <Link
                href="/dashboard"
                className="relative text-sm text-neutral-600 hover:text-emerald-600 dark:text-neutral-300"
              >
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
              <Link
                href="/login"
                className="text-sm text-neutral-600 hover:text-emerald-600 dark:text-neutral-300"
              >
                Sign in
              </Link>
              <ButtonLink href="/join" size="sm">Join</ButtonLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
