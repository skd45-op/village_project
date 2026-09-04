import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { markAllNotificationsRead } from "@/lib/actions/notifications";
import { MODULES } from "@/lib/constants";
import { Card, CardBody, PageHeader, Alert, Badge, EmptyState } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const user = (await getCurrentUser())!;
  const isSuper = user.role === "superadmin";
  const isAdmin = user.role === "admin";
  const isMember = user.status === "active" && user.role === "member";
  const isPending = user.status === "pending";

  // Notifications and stats are independent of each other — fetch concurrently.
  const [notifications, [pendingRequests, totalMembers, totalOccasions, totalMedia]] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    isSuper
      ? Promise.all([
          prisma.membershipRequest.count({ where: { status: "pending" } }),
          prisma.user.count({ where: { status: "active", role: { in: ["member", "admin"] } } }),
          prisma.occasion.count(),
          prisma.media.count(),
        ])
      : isAdmin
        ? Promise.all([prisma.membershipRequest.count({ where: { status: "pending" } }), Promise.resolve(0), Promise.resolve(0), Promise.resolve(0)])
        : Promise.resolve([0, 0, 0, 0] as const),
  ]);
  const hasUnread = notifications.some((n) => !n.read);

  const grantedModules = user.permissions.map((p) => p.module);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Namaste, ${user.firstName} 🙏`}
        subtitle={
          isSuper ? "Super Admin dashboard" :
          isAdmin ? "Admin dashboard" :
          isMember ? "Member dashboard" :
          "Your membership request"
        }
        action={<RoleBadge role={user.role} status={user.status} />}
      />

      {/* ── PENDING MEMBER ── */}
      {isPending && (
        <Alert tone="info">
          Your membership request is awaiting admin approval. You&apos;ll get full access once approved.
        </Alert>
      )}

      {/* ── SUPER ADMIN ── */}
      {isSuper && (
        <>
          {/* System stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard label="Active members" value={totalMembers} />
            <StatCard label="Pending requests" value={pendingRequests} highlight={pendingRequests > 0} />
            <StatCard label="Occasions" value={totalOccasions} />
            <StatCard label="Media items" value={totalMedia} />
          </div>

          {/* Quick actions */}
          <Card>
            <CardBody className="space-y-4">
              <h2 className="font-semibold text-red-600">Super Admin Controls</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <AdminTile href="/admin/members" label="Membership requests" count={pendingRequests} />
                <AdminTile href="/admin/permissions" label="Manage admins & modules" />
                <AdminTile href="/admin/corrections" label="Budget corrections" />
                <AdminTile href="/admin/contact" label="Contact messages" />
                <AdminTile href="/occasions/new" label="Create new occasion" />
              </div>
            </CardBody>
          </Card>
        </>
      )}

      {/* ── ADMIN ── */}
      {isAdmin && (
        <Card>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-blue-600">Your Admin Modules</h2>
              {pendingRequests > 0 && grantedModules.includes("members") && (
                <Badge tone="amber">{pendingRequests} pending</Badge>
              )}
            </div>
            {grantedModules.length === 0 ? (
              <p className="text-sm text-neutral-500">No modules assigned yet. Contact Super Admin.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {grantedModules.includes("members") && (
                  <AdminTile href="/admin/members" label="Membership requests" count={pendingRequests} />
                )}
                {grantedModules.includes("occasions") && (
                  <AdminTile href="/occasions/new" label="Create occasion" />
                )}
                {grantedModules.includes("media") && (
                  <AdminTile href="/occasions" label="Add media to occasions" />
                )}
                {grantedModules.includes("budget") && (
                  <AdminTile href="/budget" label="Add budget entries" />
                )}
                {grantedModules.includes("polls") && (
                  <AdminTile href="/polls/new" label="Create poll" />
                )}
              </div>
            )}
            <p className="text-xs text-neutral-400 border-t border-black/5 pt-3 dark:border-white/5">
              Modules: {MODULES.filter((m) => grantedModules.includes(m.value)).map((m) => m.label).join(", ") || "none"}
            </p>
          </CardBody>
        </Card>
      )}

      {/* ── ACTIVE MEMBER ── */}
      {isMember && (
        <div className="grid gap-4 sm:grid-cols-3">
          <QuickLink href="/occasions" title="Occasions" hint="Festivals & photo archives" />
          <QuickLink href="/budget" title="Budget" hint="Community treasury" />
          <QuickLink href="/polls" title="Polls" hint="Vote on decisions" />
        </div>
      )}

      {/* ── NOTIFICATIONS (all roles) ── */}
      {!isPending && (
        <Card>
          <CardBody>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Notifications</h2>
              {hasUnread && (
                <form action={markAllNotificationsRead}>
                  <Button variant="ghost" size="sm">Mark all read</Button>
                </form>
              )}
            </div>
            {notifications.length === 0 ? (
              <EmptyState title="No notifications yet" />
            ) : (
              <ul className="divide-y divide-black/5 dark:divide-white/5">
                {notifications.map((n) => (
                  <li key={n.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                    <span className={n.read ? "text-neutral-500" : "font-medium"}>{n.message}</span>
                    <span className="shrink-0 text-xs text-neutral-400">{formatDate(n.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <Card>
      <CardBody>
        <p className={`text-2xl font-bold ${highlight ? "text-amber-600" : "text-neutral-800 dark:text-neutral-100"}`}>
          {value}
        </p>
        <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
      </CardBody>
    </Card>
  );
}

function AdminTile({ href, label, count }: { href: string; label: string; count?: number }) {
  return (
    <Link href={href}>
      <Card className="transition hover:border-brand-400 hover:shadow">
        <CardBody className="flex items-center justify-between">
          <span className="text-sm font-medium">{label}</span>
          {count != null && count > 0 && (
            <Badge tone="amber">{count}</Badge>
          )}
        </CardBody>
      </Card>
    </Link>
  );
}

function QuickLink({ href, title, hint }: { href: string; title: string; hint: string }) {
  return (
    <Link href={href}>
      <Card className="transition hover:border-brand-400 hover:shadow">
        <CardBody>
          <p className="font-medium">{title}</p>
          <p className="mt-0.5 text-sm text-neutral-500">{hint}</p>
        </CardBody>
      </Card>
    </Link>
  );
}

function RoleBadge({ role, status }: { role: string; status: string }) {
  const tone = role === "superadmin" ? "red" : role === "admin" ? "blue" : status === "active" ? "green" : "amber";
  const label = role === "superadmin" ? "Super Admin" : status !== "active" ? `${role} · ${status}` : role;
  return <Badge tone={tone as "red" | "blue" | "green" | "amber"}>{label}</Badge>;
}
