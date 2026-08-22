import { notFound, redirect } from "next/navigation";
import { getCurrentUser, canCreateInModule } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/actions/occasions";
import { PageHeader, Card, CardBody, Field, Input, Select } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function NewSessionPage({
  params,
}: {
  params: Promise<{ occasionId: string }>;
}) {
  const { occasionId } = await params;
  const user = await getCurrentUser();
  if (!canCreateInModule(user, "occasions")) redirect("/occasions");

  const occasion = await prisma.occasion.findUnique({ where: { id: occasionId } });
  if (!occasion) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={`New session — ${occasion.name}`} subtitle="One yearly instance" />
      <Card>
        <CardBody>
          <form action={createSession} className="space-y-4">
            <input type="hidden" name="occasionId" value={occasion.id} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Title">
                <Input name="title" required placeholder={`${occasion.name} 2026`} />
              </Field>
              <Field label="Year">
                <Input name="year" type="number" required defaultValue={2026} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start date" hint="optional">
                <Input name="startDate" type="date" />
              </Field>
              <Field label="End date" hint="optional">
                <Input name="endDate" type="date" />
              </Field>
            </div>
            <Field label="Status">
              <Select name="status" defaultValue="upcoming">
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </Select>
            </Field>
            <SubmitButton pendingText="Creating…">Create session</SubmitButton>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
