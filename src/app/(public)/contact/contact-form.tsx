"use client";

import { useActionState } from "react";
import { submitContact } from "@/lib/actions/contact";
import type { ActionState } from "@/lib/actions/auth";
import { Field, Input, Textarea, Select, Alert } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/submit-button";

export function ContactForm() {
  const [state, action] = useActionState<ActionState, FormData>(submitContact, {});

  if (state.success) return <Alert tone="success">{state.success}</Alert>;

  return (
    <form action={action} className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <Field label="Your name" required>
        <Input name="name" required />
      </Field>
      <Field label="Email" optional hint="So we can reply to you">
        <Input name="email" type="email" />
      </Field>
      <Field label="To" required>
        <Select name="target" defaultValue="general">
          <option value="general">General</option>
          <option value="admin">Committee / Admin</option>
          <option value="member">Members</option>
        </Select>
      </Field>
      <Field label="Message" required>
        <Textarea name="message" required className="min-h-32" />
      </Field>
      <SubmitButton pendingText="Sending…">Send message</SubmitButton>
    </form>
  );
}
