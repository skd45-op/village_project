"use client";

import { useActionState } from "react";
import { register, type ActionState } from "@/lib/actions/auth";
import { Field, Input, Select, Alert, ValidatedForm } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/submit-button";
import { AvatarUploader } from "@/components/avatar-uploader";
import { RELATION_OPTIONS } from "@/lib/constants";

export function JoinForm() {
  const [state, action] = useActionState<ActionState, FormData>(register, {});

  return (
    <ValidatedForm action={action} className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" name="firstName" required>
          <Input name="firstName" required />
        </Field>
        <Field label="Last name" name="lastName" required>
          <Input name="lastName" required />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Mobile number" name="mobile" required>
          <Input name="mobile" type="tel" required />
        </Field>
        <Field label="Age" name="age" optional>
          <Input name="age" type="number" min={1} max={120} />
        </Field>
      </div>
      <Field label="Email" name="email" required>
        <Input name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Password" name="password" required hint="At least 8 characters">
        <Input name="password" type="password" autoComplete="new-password" required minLength={8} />
      </Field>
      <Field label="Address / Ward" name="address" optional>
        <Input name="address" />
      </Field>
      <Field label="Relation to village" name="relation" required>
        <Select name="relation" defaultValue="Native">
          {RELATION_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
      </Field>
      <div>
        <p className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
          Profile photo
          <span className="ml-0.5 text-red-500">*</span>
        </p>
        <AvatarUploader name="photoUrl" />
      </div>
      <SubmitButton className="w-full" pendingText="Submitting…">
        Request membership
      </SubmitButton>
      <p className="text-center text-xs text-neutral-500">
        An admin will verify your request within 1–2 days.
      </p>
    </ValidatedForm>
  );
}
