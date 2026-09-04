import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { promoteToAdmin, demoteToMember, toggleModule } from "@/lib/actions/permissions";
import { PageHeader, Card, CardBody, Badge } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/submit-button";
import { MODULES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default async function PermissionsPage() {
  const me = await getCurrentUser();
  if (me?.role !== "superadmin") redirect("/dashboard");

  const users = await prisma.user.findMany({
    where: { status: "active", role: { in: ["member", "admin", "superadmin"] } },
    orderBy: [{ role: "desc" }, { firstName: "asc" }],
    include: { permissions: true },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Manage Admins & Modules" subtitle="Promote members and grant module permissions" />
      <div className="space-y-4">
        {users.map((u) => {
          const granted = new Set(u.permissions.map((p) => p.module));
          const isSuper = u.role === "superadmin";
          const isAdmin = u.role === "admin";
          return (
            <Card key={u.id} className="transition hover:shadow-md">
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-base font-semibold",
                        isSuper
                          ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                          : isAdmin
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                            : "bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-200",
                      )}
                    >
                      {(u.firstName?.[0] ?? "?").toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="truncate text-sm text-neutral-500">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge tone={isSuper ? "red" : isAdmin ? "blue" : "neutral"}>{u.role}</Badge>
                    {!isSuper &&
                      (isAdmin ? (
                        <form action={demoteToMember}>
                          <input type="hidden" name="userId" value={u.id} />
                          <SubmitButton size="sm" variant="ghost" pendingText="…">Demote</SubmitButton>
                        </form>
                      ) : (
                        <form action={promoteToAdmin}>
                          <input type="hidden" name="userId" value={u.id} />
                          <SubmitButton size="sm" variant="secondary" pendingText="…">Make admin</SubmitButton>
                        </form>
                      ))}
                  </div>
                </div>

                {isAdmin && (
                  <div className="border-t border-black/5 pt-3 dark:border-white/5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                      Module access
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {MODULES.map((m) => {
                        const on = granted.has(m.value);
                        return (
                          <form key={m.value} action={toggleModule}>
                            <input type="hidden" name="userId" value={u.id} />
                            <input type="hidden" name="module" value={m.value} />
                            <button
                              className={cn(
                                "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition",
                                on
                                  ? "border-brand-500 bg-brand-600 text-white shadow-sm hover:bg-brand-700"
                                  : "border-black/15 text-neutral-500 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 dark:border-white/15 dark:hover:bg-neutral-800",
                              )}
                              title={m.description}
                            >
                              {on ? "✓ " : ""}
                              {m.label}
                            </button>
                          </form>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
