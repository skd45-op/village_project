"use client";

import type { InputHTMLAttributes, KeyboardEvent, ChangeEvent } from "react";
import { cn } from "@/lib/utils";
import { fieldStyles } from "./field-styles";

// A whole-rupee amount input that structurally cannot contain a decimal point —
// disallowed keystrokes (".", ",", "e"/"E" for scientific notation, and "-"/"+"
// unless negatives are allowed) are blocked outright rather than validated after
// the fact. Paste/autofill are sanitized as a fallback. Renders as a plain text
// input (numeric keypad on mobile) so the browser's native number spinner and its
// permissive decimal handling never come into play.
export function MoneyInput({
  allowNegative = false,
  className,
  onKeyDown,
  onChange,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { allowNegative?: boolean }) {
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    const blocked = allowNegative ? [".", ",", "e", "E"] : [".", ",", "e", "E", "-", "+"];
    if (blocked.includes(e.key)) {
      e.preventDefault();
      return;
    }
    onKeyDown?.(e);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const cleaned = allowNegative
      ? raw.replace(/[^0-9-]/g, "").replace(/(?!^)-/g, "")
      : raw.replace(/[^0-9]/g, "");
    if (cleaned !== raw) e.target.value = cleaned;
    onChange?.(e);
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      className={cn(fieldStyles, className)}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      {...props}
    />
  );
}
