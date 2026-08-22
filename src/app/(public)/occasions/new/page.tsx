import { redirect } from "next/navigation";
import { getCurrentUser, canCreateInModule } from "@/lib/auth";
import { createOccasion } from "@/lib/actions/occasions";
import { PageHeader, Card, CardBody, Field, Input, Textarea } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function NewOccasionPage() {
  const user = await getCurrentUser();
  if (!canCreateInModule(user, "occasions")) redirect("/occasions");

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="New Occasion" subtitle="A festival/category, e.g. Ganesh Puja" />
      <Card>
        <CardBody>
          <form action={createOccasion} className="space-y-4">
            <Field label="Name">
              <Input name="name" required placeholder="Ganesh Puja" />
            </Field>
            <Field label="Description" hint="optional">
              <Textarea name="description" />
            </Field>
            <Field label="Icon (emoji)" hint="optional, e.g. 🪔">
              <Input name="iconUrl" placeholder="🪔" />
            </Field>
            <SubmitButton pendingText="Creating…">Create &amp; add a session</SubmitButton>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
