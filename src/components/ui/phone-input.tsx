"use client";

import type { InputHTMLAttributes, KeyboardEvent, ChangeEvent } from "react";
import { cn } from "@/lib/utils";
import { fieldStyles } from "./field-styles";
import { PhoneIcon } from "./icons";

const MAX_LEN = 10;

// A mobile number input that structurally cannot exceed 10 digits — non-digit
// keystrokes and any keystroke past the 10th digit are blocked outright rather
// than validated after submit (matches the MoneyInput pattern). Paste/autofill
// are sanitized as a fallback via onChange.
export function PhoneInput({ className, onKeyDown, onChange, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    const isControlKey = e.key.length > 1 || e.metaKey || e.ctrlKey || e.altKey;
    if (isControlKey) {
      onKeyDown?.(e);
      return;
    }
    const input = e.currentTarget;
    const selectionLength = (input.selectionEnd ?? 0) - (input.selectionStart ?? 0);
    const atMax = input.value.length - selectionLength >= MAX_LEN;
    if (!/^[0-9]$/.test(e.key) || atMax) {
      e.preventDefault();
      return;
    }
    onKeyDown?.(e);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const cleaned = raw.replace(/[^0-9]/g, "").slice(0, MAX_LEN);
    if (cleaned !== raw) e.target.value = cleaned;
    onChange?.(e);
  }

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
        <PhoneIcon />
      </span>
      <input
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        maxLength={MAX_LEN}
        pattern="[0-9]{10}"
        title="Enter a 10-digit mobile number"
        className={cn(fieldStyles, "pl-9", className)}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        {...props}
      />
    </div>
  );
}
