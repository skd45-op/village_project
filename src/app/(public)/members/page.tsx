import { prisma } from "@/lib/prisma";
import { getViewerContext, isMemberOrAbove } from "@/lib/auth";
import { PageHeader, Card, CardBody, Badge } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const { user, previewAs } = await getViewerContext();

  // Determine what the effective viewer can see based on real role or preview override.
  const full =
    previewAs === "member" ? true :
    previewAs === "guest"  ? false :
    isMemberOrAbove(user);

  const members = await prisma.user.findMany({
    where: { status: "active", role: { in: ["member", "admin", "superadmin"] } },
    orderBy: { firstName: "asc" },
    select: { id: true, firstName: true, lastName: true, photoUrl: true, role: true, mobile: true },
  });

  return (
    <div>
      <PageHeader
        title="Member Directory"
        subtitle={`${members.length} approved member${members.length === 1 ? "" : "s"}`}
      />
      {!full && (
        <p className="mb-4 text-sm text-neutral-500">
          You&apos;re viewing the public directory (name &amp; photo only).
          Members can see contact details.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m) => (
          <Card key={m.id}>
            <CardBody className="flex items-center gap-3">
              <Avatar name={`${m.firstName} ${m.lastName}`} photoUrl={m.photoUrl} />
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {m.firstName} {m.lastName}
                </p>
                {/* Role badge only shown to member+ viewers — guests see name+photo only */}
                {full && m.role !== "member" && (
                  <Badge tone={m.role === "superadmin" ? "red" : "blue"}>{m.role}</Badge>
                )}
                {full && (
                  <p className="mt-0.5 truncate text-sm text-neutral-500">{m.mobile ?? "—"}</p>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Avatar({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  if (photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photoUrl} alt={name} className="h-12 w-12 shrink-0 rounded-full object-cover" />;
  }
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
      {initials}
    </div>
  );
}
