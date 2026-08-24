import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardBody, Badge } from "@/components/ui/primitives";
import { MODULES } from "@/lib/constants";

export default async function AdminHome() {
  const user = (await getCurrentUser())!;
  const isAdmin = user.role === "admin" || user.role === "superadmin";
  if (!isAdmin) redirect("/dashboard");

  const isSuper = user.role === "superadmin";
  const modules = user.permissions.map((p) => p.module);
  const can = (m: string) => isSuper || modules.includes(m as never);

  const pendingRequests = await prisma.membershipRequest.count({ where: { status: "pending" } });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-2xl px-6 py-5 ${isSuper ? "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900" : "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900"}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{isSuper ? "🛡️" : "⚙️"}</span>
          <div>
            <h1 className={`text-xl font-bold ${isSuper ? "text-red-800 dark:text-red-300" : "text-blue-800 dark:text-blue-300"}`}>
              {isSuper ? "Super Admin Control Panel" : "Admin Panel"}
            </h1>
            <p className={`text-sm ${isSuper ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}`}>
              {isSuper
                ? "Full platform control — only you can edit, delete, and manage permissions."
                : `Module admin — you can create in: ${MODULES.filter((m) => modules.includes(m.value)).map((m) => m.label).join(", ") || "none yet"}`}
            </p>
          </div>
        </div>
      </div>

      {/* Super Admin: full tile grid */}
      {isSuper && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AdminTile
            href="/admin/members"
            icon="👥"
            label="Membership requests"
            description="Review, approve, or reject join requests"
            count={pendingRequests}
          />
          <AdminTile
            href="/admin/permissions"
            icon="🔑"
            label="Manage admins & modules"
            description="Promote members to admins, assign modules"
          />
          <AdminTile
            href="/admin/corrections"
            icon="📋"
            label="Budget corrections"
            description="Fix ledger entries via correction records"
          />
          <AdminTile
            href="/admin/contact"
            icon="✉️"
            label="Contact messages"
            description="Read and resolve incoming messages"
          />
          <AdminTile
            href="/occasions/new"
            icon="🪔"
            label="Create occasion"
            description="Add a new festival or community event"
          />
          <AdminTile
            href="/polls/new"
            icon="📊"
            label="Create poll"
            description="Post a new members-only poll"
          />
        </div>
      )}

      {/* Admin: only granted module tiles */}
      {!isSuper && (
        <>
          {modules.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-10 text-center text-sm text-neutral-400">
              No modules assigned yet. Contact the Super Admin to be granted module permissions.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {can("members") && (
                <AdminTile
                  href="/admin/members"
                  icon="👥"
                  label="Membership requests"
                  description="Review and approve join requests"
                  count={pendingRequests}
                />
              )}
              {can("occasions") && (
                <AdminTile
                  href="/occasions/new"
                  icon="🪔"
                  label="Create occasion"
                  description="Add a new festival or community event"
                />
              )}
              {can("media") && (
                <AdminTile
                  href="/occasions"
                  icon="📷"
                  label="Add media"
                  description="Add photos and videos to occasions"
                />
              )}
              {can("budget") && (
                <AdminTile
                  href="/budget"
                  icon="💰"
                  label="Budget entries"
                  description="Add income and expense records"
                />
              )}
              {can("polls") && (
                <AdminTile
                  href="/polls/new"
                  icon="📊"
                  label="Create poll"
                  description="Post a new members-only poll"
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AdminTile({
  href,
  icon,
  label,
  description,
  count,
}: {
  href: string;
  icon: string;
  label: string;
  description: string;
  count?: number;
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition hover:border-emerald-400 hover:shadow-md">
        <CardBody className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{icon}</span>
              <p className="font-semibold group-hover:text-emerald-600 transition">{label}</p>
            </div>
            {count != null && count > 0 && <Badge tone="amber">{count}</Badge>}
          </div>
          <p className="text-sm text-neutral-500">{description}</p>
        </CardBody>
      </Card>
    </Link>
  );
}
