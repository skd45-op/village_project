import Link from "next/link";
import { getCurrentUser, isMemberOrAbove } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { markAllNotificationsRead } from "@/lib/actions/notifications";
import { MODULES } from "@/lib/constants";
import { Card, CardBody, PageHeader, Alert, Badge, EmptyState } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const user = (await getCurrentUser())!; // layout guarantees non-null
  const member = isMemberOrAbove(user);
  const isAdmin = user.role === "admin" || user.role === "superadmin";
  const isSuper = user.role === "superadmin";

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 15,
  });
  const hasUnread = notifications.some((n) => !n.read);

  const pendingRequests = isAdmin
    ? await prisma.membershipRequest.count({ where: { status: "pending" } })
    : 0;

  const grantedModules = user.permissions.map((p) => p.module);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Namaste, ${user.firstName} 🙏`}
        subtitle="Your community dashboard"
        action={<RoleBadge role={user.role} status={user.status} />}
      />

      {user.status === "pending" && (
        <Alert tone="info">
          Your membership request is awaiting admin approval. You&apos;ll get full access once it&apos;s approved.
        </Alert>
      )}

      {member && (
        <div className="grid gap-4 sm:grid-cols-3">
          <QuickLink href="/occasions" title="Occasions" hint="Festivals & sessions" />
          <QuickLink href="/budget" title="Budget" hint="Treasury & ledger" />
          <QuickLink href="/polls" title="Polls" hint="Vote on decisions" />
        </div>
      )}

      {isAdmin && (
        <Card>
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Admin</h2>
              {pendingRequests > 0 && <Badge tone="amber">{pendingRequests} pending requests</Badge>}
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <Link href="/admin/members" className="text-emerald-600 hover:underline">Review members</Link>
              {isSuper && <Link href="/admin/permissions" className="text-emerald-600 hover:underline">Manage admins</Link>}
              {isSuper && <Link href="/admin/corrections" className="text-emerald-600 hover:underline">Budget corrections</Link>}
            </div>
            {!isSuper && (
              <p className="text-xs text-neutral-500">
                Your modules:{" "}
                {grantedModules.length
                  ? MODULES.filter((m) => grantedModules.includes(m.value)).map((m) => m.label).join(", ")
                  : "none yet"}
              </p>
            )}
          </CardBody>
        </Card>
      )}

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
    </div>
  );
}

function QuickLink({ href, title, hint }: { href: string; title: string; hint: string }) {
  return (
    <Link href={href}>
      <Card className="transition hover:border-emerald-400 hover:shadow">
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
  const label = status !== "active" ? `${role} · ${status}` : role;
  return <Badge tone={tone as "red" | "blue" | "green" | "amber"}>{label}</Badge>;
}
