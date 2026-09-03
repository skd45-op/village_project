"use client";

import { useActionState } from "react";
import { login, type ActionState } from "@/lib/actions/auth";
import { Field, IconInput, PasswordInput, Alert, ValidatedForm } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/submit-button";
import { MailIcon } from "@/components/ui/icons";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState<ActionState, FormData>(login, {});

  return (
    <ValidatedForm action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <Field label="Email" name="email" required>
        <IconInput icon={<MailIcon />} name="email" type="email" autoComplete="email" required placeholder="Enter your email" />
      </Field>
      <Field label="Password" name="password" required>
        <PasswordInput name="password" autoComplete="current-password" required placeholder="Enter your password" />
      </Field>
      <SubmitButton className="w-full" pendingText="Signing in…">
        Sign in
      </SubmitButton>
    </ValidatedForm>
  );
}
