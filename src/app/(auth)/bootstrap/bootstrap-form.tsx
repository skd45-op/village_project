"use client";

import { useActionState } from "react";
import { bootstrapSuperAdmin } from "@/lib/actions/bootstrap";
import type { ActionState } from "@/lib/actions/auth";
import { Field, Input, Alert, ValidatedForm } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/submit-button";

export function BootstrapForm() {
  const [state, action] = useActionState<ActionState, FormData>(bootstrapSuperAdmin, {});

  return (
    <ValidatedForm action={action} className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <Field label="Bootstrap secret" name="secret" required>
        <Input name="secret" type="password" required />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" name="firstName" required>
          <Input name="firstName" required />
        </Field>
        <Field label="Last name" name="lastName" required>
          <Input name="lastName" required />
        </Field>
      </div>
      <Field label="Email" name="email" required>
        <Input name="email" type="email" required />
      </Field>
      <Field label="Password" name="password" required hint="At least 8 characters">
        <Input name="password" type="password" required minLength={8} />
      </Field>
      <SubmitButton className="w-full" pendingText="Creating…">
        Create Super Admin
      </SubmitButton>
    </ValidatedForm>
  );
}
