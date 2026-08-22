import { redirect } from "next/navigation";
import { getCurrentUser, canCreateInModule } from "@/lib/auth";
import { createPoll } from "@/lib/actions/polls";
import { PageHeader, Card, CardBody, Field, Input, Textarea } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function NewPollPage() {
  const user = await getCurrentUser();
  if (!canCreateInModule(user, "polls")) redirect("/polls");

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="New Poll" subtitle="Members-only. Guests never vote." />
      <Card>
        <CardBody>
          <form action={createPoll} className="space-y-4">
            <Field label="Question">
              <Input name="title" required placeholder="Which date for the annual feast?" />
            </Field>
            <Field label="Options" hint="one per line, at least two">
              <Textarea name="options" required placeholder={"Saturday\nSunday"} className="min-h-32" />
            </Field>
            <Field label="Closes at" hint="optional">
              <Input name="expiresAt" type="datetime-local" />
            </Field>
            <SubmitButton pendingText="Creating…">Create poll</SubmitButton>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
