"use client";

import { useActionState } from "react";
import { bootstrapSuperAdmin } from "@/lib/actions/bootstrap";
import type { ActionState } from "@/lib/actions/auth";
import { Field, Input, Alert } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/submit-button";

export function BootstrapForm() {
  const [state, action] = useActionState<ActionState, FormData>(bootstrapSuperAdmin, {});

  return (
    <form action={action} className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <Field label="Bootstrap secret">
        <Input name="secret" type="password" required />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name">
          <Input name="firstName" required />
        </Field>
        <Field label="Last name">
          <Input name="lastName" required />
        </Field>
      </div>
      <Field label="Email">
        <Input name="email" type="email" required />
      </Field>
      <Field label="Password" hint="At least 8 characters">
        <Input name="password" type="password" required />
      </Field>
      <SubmitButton className="w-full" pendingText="Creating…">
        Create Super Admin
      </SubmitButton>
    </form>
  );
}
