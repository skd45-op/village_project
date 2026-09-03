"use client";

import { useState } from "react";
import { Field, MoneyInput } from "@/components/ui/primitives";

// Lets the Super Admin either type the net amount directly, or fill in
// "Collected" / "Spent" for the year and have the amount computed automatically
// (Collected − Spent). Editing the Amount field by hand always wins.
export function StockAmountFields({ defaultAmount }: { defaultAmount?: number }) {
  const [collected, setCollected] = useState("");
  const [spent, setSpent] = useState("");
  const [amount, setAmount] = useState(defaultAmount !== undefined ? String(defaultAmount) : "");
  const [autoFilled, setAutoFilled] = useState(false);

  function recompute(nextCollected: string, nextSpent: string) {
    const c = nextCollected.trim() === "" ? null : Number(nextCollected);
    const s = nextSpent.trim() === "" ? null : Number(nextSpent);
    if (c === null && s === null) return;
    if ((c !== null && Number.isNaN(c)) || (s !== null && Number.isNaN(s))) return;
    setAmount(String(Math.round((c ?? 0) - (s ?? 0))));
    setAutoFilled(true);
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Collected (₹)" optional hint="This year's income, if known">
          <MoneyInput
            placeholder="e.g. 30000"
            value={collected}
            onChange={(e) => {
              setCollected(e.target.value);
              recompute(e.target.value, spent);
            }}
          />
        </Field>
        <Field label="Spent (₹)" optional hint="This year's expenses, if known">
          <MoneyInput
            placeholder="e.g. 25000"
            value={spent}
            onChange={(e) => {
              setSpent(e.target.value);
              recompute(collected, e.target.value);
            }}
          />
        </Field>
      </div>
      <Field
        label="Amount (₹)"
        name="amountDelta"
        required
        hint={autoFilled ? "Auto-calculated: Collected − Spent — you can still edit it" : "+ surplus, − drawn from stock"}
      >
        <MoneyInput
          name="amountDelta"
          allowNegative
          required
          placeholder="e.g. 5000 or -5000"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setAutoFilled(false);
          }}
        />
      </Field>
    </>
  );
}
