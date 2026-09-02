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
            <Card key={u.id}>
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {u.firstName} {u.lastName}
                    </p>
                    <p className="text-sm text-neutral-500">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
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
                  <div className="flex flex-wrap gap-2 border-t border-black/5 pt-3 dark:border-white/5">
                    {MODULES.map((m) => {
                      const on = granted.has(m.value);
                      return (
                        <form key={m.value} action={toggleModule}>
                          <input type="hidden" name="userId" value={u.id} />
                          <input type="hidden" name="module" value={m.value} />
                          <button
                            className={cn(
                              "rounded-full border px-3 py-1 text-xs font-medium transition",
                              on
                                ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                                : "border-black/15 text-neutral-500 hover:bg-neutral-50 dark:border-white/15 dark:hover:bg-neutral-800",
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
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
