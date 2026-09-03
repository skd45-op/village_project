"use client";

import { useActionState, useEffect, useState } from "react";
import { updateStockEntry, deleteStockEntry } from "@/lib/actions/stock";
import type { ActionState } from "@/lib/actions/auth";
import { Field, Input, Textarea, Alert, ValidatedForm } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatMoney, formatDateTime } from "@/lib/utils";
import { StockAmountFields } from "./stock-amount-fields";

export type StockEntryRowData = {
  id: string;
  occasionId: string;
  year: number;
  amountDelta: number;
  description: string | null;
  addedAt: Date | string;
  addedBy: { firstName: string; lastName: string } | null;
};

export function StockEntryRow({ entry, canManage }: { entry: StockEntryRowData; canManage: boolean }) {
  const [editing, setEditing] = useState(false);
  const [state, action] = useActionState<ActionState, FormData>(updateStockEntry, {});
  const positive = entry.amountDelta >= 0;

  // Close the edit form automatically once the update actually succeeds.
  useEffect(() => {
    if (state.success) setEditing(false);
  }, [state.success]);

  if (editing) {
    return (
      <div className="rounded-lg border border-brand-300 bg-brand-50/40 p-3 dark:border-brand-800 dark:bg-brand-950/30">
        <ValidatedForm action={action} className="space-y-3">
          {state.error && <Alert tone="error">{state.error}</Alert>}
          <input type="hidden" name="id" value={entry.id} />
          <input type="hidden" name="occasionId" value={entry.occasionId} />
          <Field label="Year" name="year" required>
            <Input name="year" type="number" defaultValue={entry.year} required className="max-w-xs" />
          </Field>
          <StockAmountFields defaultAmount={entry.amountDelta} />
          <Field label="Description" name="description" optional>
            <Textarea name="description" defaultValue={entry.description ?? ""} className="min-h-10" />
          </Field>
          <div className="flex items-center gap-2">
            <SubmitButton size="sm" pendingText="Saving…">Save</SubmitButton>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-full border border-black/15 px-3.5 py-1.5 text-sm font-medium transition hover:bg-black/[0.04] dark:border-white/15 dark:hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </ValidatedForm>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-black/10 p-3 text-sm dark:border-white/10">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{entry.year}</span>
          <span className={positive ? "font-semibold text-brand-600" : "font-semibold text-red-600"}>
            {positive ? "+" : ""}{formatMoney(entry.amountDelta)}
          </span>
        </div>
        {entry.description && <p className="mt-0.5 text-neutral-500">{entry.description}</p>}
        <p className="mt-0.5 text-xs text-neutral-400">{formatDateTime(entry.addedAt)}</p>
      </div>
      {canManage && (
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => setEditing(true)}
            className="text-xs font-medium text-brand-600 hover:underline"
          >
            Edit
          </button>
          <form action={deleteStockEntry}>
            <input type="hidden" name="id" value={entry.id} />
            <input type="hidden" name="occasionId" value={entry.occasionId} />
            <button type="submit" className="text-xs font-medium text-red-600 hover:underline">
              Delete
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
