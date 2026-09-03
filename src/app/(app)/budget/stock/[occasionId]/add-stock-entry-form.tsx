"use client";

import { useActionState } from "react";
import { addStockEntry } from "@/lib/actions/stock";
import type { ActionState } from "@/lib/actions/auth";
import { Field, Input, Textarea, Alert, ValidatedForm } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/submit-button";
import { StockAmountFields } from "./stock-amount-fields";

export function AddStockEntryForm({ occasionId }: { occasionId: string }) {
  const [state, action] = useActionState<ActionState, FormData>(addStockEntry, {});

  return (
    <ValidatedForm action={action} className="space-y-3">
      <input type="hidden" name="occasionId" value={occasionId} />
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}
      <Field label="Year" name="year" required>
        <Input name="year" type="number" required placeholder="e.g. 2026" className="max-w-xs" />
      </Field>
      <StockAmountFields />
      <Field label="Description" name="description" optional>
        <Textarea name="description" className="min-h-10" placeholder="e.g. Ganesh Puja 2026 surplus" />
      </Field>
      <div>
        <SubmitButton pendingText="Adding…">Add entry</SubmitButton>
      </div>
    </ValidatedForm>
  );
}
