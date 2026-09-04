"use client";

import { useActionState } from "react";
import { updateProfile } from "@/lib/actions/profile";
import type { ActionState } from "@/lib/actions/auth";
import { Field, Input, PhoneInput, Alert, ValidatedForm } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/submit-button";
import { AvatarUploader } from "@/components/avatar-uploader";

export function ProfileForm({
  photoUrl,
  mobile,
  address,
  age,
}: {
  photoUrl: string | null;
  mobile: string;
  address: string;
  age: number | null;
}) {
  const [state, action] = useActionState<ActionState, FormData>(updateProfile, {});

  return (
    <ValidatedForm action={action} className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}

      <div>
        <p className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
          Profile photo
          <span className="ml-1 text-xs font-normal text-neutral-400">(optional)</span>
        </p>
        <AvatarUploader name="photoUrl" defaultUrl={photoUrl} />
      </div>

      <Field label="Mobile number" name="mobile" required>
        <PhoneInput name="mobile" defaultValue={mobile} required />
      </Field>
      <Field label="Address / Ward" name="address" optional>
        <Input name="address" defaultValue={address} />
      </Field>
      <Field label="Age" name="age" optional>
        <Input name="age" type="number" min={1} max={120} defaultValue={age ?? ""} />
      </Field>

      <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
    </ValidatedForm>
  );
}
