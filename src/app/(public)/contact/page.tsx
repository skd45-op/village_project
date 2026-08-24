import { prisma } from "@/lib/prisma";
import { PageHeader, Card, CardBody } from "@/components/ui/primitives";
import { ContactForm } from "./contact-form";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const committee = await prisma.user.findMany({
    where: { status: "active", role: { in: ["admin", "superadmin"] } },
    orderBy: { firstName: "asc" },
    select: { id: true, firstName: true, lastName: true },
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
        <PageHeader title="Our committee" subtitle="Your message will be reviewed by these members" />
        <Card>
          <CardBody>
            {committee.length === 0 ? (
              <p className="text-sm text-neutral-500">Committee details coming soon.</p>
            ) : (
              <ul className="divide-y divide-black/5 dark:divide-white/5">
                {committee.map((c) => (
                  <li key={c.id} className="py-2.5 text-sm font-medium">
                    {c.firstName} {c.lastName}
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
