import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader, Card, CardBody } from "@/components/ui/primitives";
import { MODULES } from "@/lib/constants";

export default async function AdminHome() {
  const user = (await getCurrentUser())!;
  const isAdmin = user.role === "admin" || user.role === "superadmin";
  if (!isAdmin) redirect("/dashboard");
  const isSuper = user.role === "superadmin";
  const modules = user.permissions.map((p) => p.module);
  const can = (m: string) => isSuper || modules.includes(m as never);

  const tiles = [
    { href: "/admin/members", label: "Membership requests", show: can("members") },
    { href: "/occasions/new", label: "Create occasion / session", show: can("occasions") },
    { href: "/admin/permissions", label: "Manage admins & modules", show: isSuper },
    { href: "/admin/corrections", label: "Budget corrections", show: isSuper },
    { href: "/admin/contact", label: "Contact messages", show: isSuper },
  ].filter((t) => t.show);

  return (
    <div>
      <PageHeader title="Admin" subtitle={isSuper ? "Super Admin — full control" : "Module admin"} />
      {!isSuper && (
        <p className="mb-4 text-sm text-neutral-500">
          Granted modules: {modules.length ? MODULES.filter((m) => modules.includes(m.value)).map((m) => m.label).join(", ") : "none"}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href}>
            <Card className="transition hover:border-emerald-400 hover:shadow">
              <CardBody>{t.label}</CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
