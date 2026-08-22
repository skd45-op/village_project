import { prisma } from "@/lib/prisma";
import { PageHeader, Card, CardBody, Badge } from "@/components/ui/primitives";
import { ContactForm } from "./contact-form";

export default async function ContactPage() {
  const committee = await prisma.user.findMany({
    where: { status: "active", role: { in: ["admin", "superadmin"] } },
    orderBy: { role: "desc" },
    select: { id: true, firstName: true, lastName: true, role: true },
  });

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <PageHeader title="Contact us" subtitle="Send a message to the committee" />
        <Card>
          <CardBody>
            <ContactForm />
          </CardBody>
        </Card>
      </div>

      <div>
        <PageHeader title="Committee" subtitle="Messages route here — no phone numbers shown" />
        <Card>
          <CardBody>
            {committee.length === 0 ? (
              <p className="text-sm text-neutral-500">Committee details coming soon.</p>
            ) : (
              <ul className="divide-y divide-black/5 dark:divide-white/5">
                {committee.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-2.5">
                    <span>{c.firstName} {c.lastName}</span>
                    <Badge tone={c.role === "superadmin" ? "red" : "blue"}>{c.role}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
