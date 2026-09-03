import { redirect } from "next/navigation";
import { getCurrentUser, canCreateInModule } from "@/lib/auth";
import { createPoll } from "@/lib/actions/polls";
import { PageHeader, Card, CardBody, Field, Input, ValidatedForm } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/submit-button";
import { PollOptionsField } from "./poll-options-field";

export default async function NewPollPage() {
  const user = await getCurrentUser();
  if (!canCreateInModule(user, "polls")) redirect("/polls");

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="New Poll" subtitle="Members-only. Guests never vote." />
      <Card>
        <CardBody>
          <ValidatedForm action={createPoll} className="space-y-4">
            <Field label="Question" name="title" required>
              <Input name="title" required placeholder="Which date for the annual feast?" />
            </Field>
            <Field label="Options" name="options" required hint="At least two">
              <PollOptionsField />
            </Field>
            <Field label="Closes at" name="expiresAt" optional>
              <Input name="expiresAt" type="datetime-local" />
            </Field>
            <SubmitButton pendingText="Creating…">Create poll</SubmitButton>
          </ValidatedForm>
        </CardBody>
      </Card>
    </div>
  );
}
