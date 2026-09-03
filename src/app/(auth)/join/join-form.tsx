"use client";

import { useActionState } from "react";
import { register, type ActionState } from "@/lib/actions/auth";
import { Field, IconInput, PasswordInput, Alert, ValidatedForm } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/submit-button";
import { AvatarUploader } from "@/components/avatar-uploader";
import { UserIcon, PhoneIcon, MailIcon } from "@/components/ui/icons";

export function JoinForm() {
  const [state, action] = useActionState<ActionState, FormData>(register, {});

  return (
    <ValidatedForm action={action} className="space-y-3.5">
      {state.error && <Alert tone="error">{state.error}</Alert>}

      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Full name" name="name" required>
          <IconInput icon={<UserIcon />} name="name" required placeholder="Enter your name" />
        </Field>
        <Field label="Mobile number" name="mobile" required>
          <IconInput icon={<PhoneIcon />} name="mobile" type="tel" required placeholder="Enter your mobile" />
        </Field>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Email" name="email" required>
          <IconInput icon={<MailIcon />} name="email" type="email" autoComplete="email" required placeholder="Enter your email" />
        </Field>
        <Field label="Password" name="password" required>
          <PasswordInput name="password" autoComplete="new-password" required minLength={8} placeholder="Create a password" />
        </Field>
      </div>

      <div className="rounded-xl border border-black/[0.07] bg-black/[0.02] p-3 dark:border-white/10 dark:bg-white/[0.03]">
        <AvatarUploader name="photoUrl" label="Profile photo (optional)" />
      </div>

      <SubmitButton className="w-full" pendingText="Submitting…">
        Request membership
      </SubmitButton>
    </ValidatedForm>
  );
}
