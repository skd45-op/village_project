import { prisma } from "@/lib/prisma";
import { getCurrentUser, isMemberOrAbove } from "@/lib/auth";
import { SectionHeading } from "@/components/ui/primitives";
import { PeopleDirectory, type Person } from "./people-directory";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const user = await getCurrentUser();

  const full = isMemberOrAbove(user);

  // Only the super admin sees internal role labels.
  const showRealRoles = user?.role === "superadmin";

  const members = await prisma.user.findMany({
    where: { status: "active", role: { in: ["member", "admin"] } },
    orderBy: { firstName: "asc" },
    select: { id: true, firstName: true, lastName: true, photoUrl: true, role: true, mobile: true },
  });

  const people: Person[] = members.map((m) => ({
    ...m,
    // Hide contact from non-members before it ever reaches the client.
    mobile: full ? m.mobile : null,
  }));

  return (
    <div>
      <div className="mb-6">
        <SectionHeading eyebrow="Our circle" title="The people of Kundapur" />
        <p className="mt-2 text-sm text-muted">
          {members.length} approved member{members.length === 1 ? "" : "s"}
          {!full && " · public directory (name & photo only)"}
        </p>
      </div>
      <PeopleDirectory people={people} full={full} showRealRoles={showRealRoles} />
    </div>
  );
}
