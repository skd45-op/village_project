"use client";

import { useActionState } from "react";
import { register, type ActionState } from "@/lib/actions/auth";
import { Field, Input, Select, Alert } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/submit-button";
import { RELATION_OPTIONS } from "@/lib/constants";

export function JoinForm() {
  const [state, action] = useActionState<ActionState, FormData>(register, {});

  return (
    <form action={action} className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" required>
          <Input name="firstName" required />
        </Field>
        <Field label="Last name" required>
          <Input name="lastName" required />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Mobile number" required>
          <Input name="mobile" type="tel" required />
        </Field>
        <Field label="Age" optional>
          <Input name="age" type="number" min={1} max={120} />
        </Field>
      </div>
      <Field label="Email" required>
        <Input name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Password" required hint="At least 8 characters">
        <Input name="password" type="password" autoComplete="new-password" required />
      </Field>
      <Field label="Address / Ward" optional>
        <Input name="address" />
      </Field>
      <Field label="Relation to village" required>
        <Select name="relation" defaultValue="Native">
          {RELATION_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Photo URL" optional hint="Paste a link to your photo">
        <Input name="photoUrl" type="url" placeholder="https://…" />
      </Field>
      <SubmitButton className="w-full" pendingText="Submitting…">
        Request membership
      </SubmitButton>
      <p className="text-center text-xs text-neutral-500">
        An admin will verify your request within 1–2 days.
      </p>
    </form>
  );
}
