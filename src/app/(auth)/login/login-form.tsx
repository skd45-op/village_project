"use client";

import { useActionState } from "react";
import { login, type ActionState } from "@/lib/actions/auth";
import { Field, Input, Alert, ValidatedForm } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/submit-button";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState<ActionState, FormData>(login, {});

  return (
    <ValidatedForm action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <Field label="Email" name="email" required>
        <Input name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Password" name="password" required>
        <Input name="password" type="password" autoComplete="current-password" required />
      </Field>
      <SubmitButton className="w-full" pendingText="Signing in…">
        Sign in
      </SubmitButton>
    </ValidatedForm>
  );
}
