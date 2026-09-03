"use client";

import { useState } from "react";
import { Field, Input, Select } from "@/components/ui/primitives";
import { BUDGET_CATEGORIES, CUSTOM_CATEGORY_VALUE } from "@/lib/constants";

// Category select with a "Custom…" option that reveals a free-text field.
// Renders its own hidden name="category" input so the parent form just works.
export function CategoryField() {
  const [choice, setChoice] = useState<string>(BUDGET_CATEGORIES[0]);
  const [custom, setCustom] = useState("");
  const isCustom = choice === CUSTOM_CATEGORY_VALUE;
  const value = isCustom ? custom.trim() : choice;

  return (
    <Field label="Category" name="category" required>
      <Select value={choice} onChange={(e) => setChoice(e.target.value)}>
        {BUDGET_CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
        <option value={CUSTOM_CATEGORY_VALUE}>Custom…</option>
      </Select>
      {isCustom && (
        <Input
          className="mt-2"
          placeholder="Enter category name"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          required
        />
      )}
      <input type="hidden" name="category" value={value} />
    </Field>
  );
}
