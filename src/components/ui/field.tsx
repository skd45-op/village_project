"use client";

import { createContext, useContext, useState, type ReactNode, type FormEvent } from "react";
import { cn } from "@/lib/utils";

type Errors = Record<string, string>;
const FieldErrorContext = createContext<Errors>({});

// Browser-native validation messages are long and inconsistent across fields
// ("Please include an '@' in the email address. 'x' is missing an '@'.").
// Map each validity condition to a short message instead — falling back to the
// input's own `title` (used for pattern mismatches, e.g. PhoneInput) or the
// native message only as a last resort.
function shortMessage(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
  const v = el.validity;
  if (v.valueMissing) return "This field is required.";
  if (v.typeMismatch) return el.type === "email" ? "Enter a valid email." : "Invalid value.";
  if (v.tooShort) return `Must be at least ${(el as HTMLInputElement).minLength} characters.`;
  if (v.tooLong) return `Must be at most ${(el as HTMLInputElement).maxLength} characters.`;
  if (v.patternMismatch) return el.title || "Invalid format.";
  if (v.rangeUnderflow) return `Must be at least ${(el as HTMLInputElement).min}.`;
  if (v.rangeOverflow) return `Must be at most ${(el as HTMLInputElement).max}.`;
  return el.validationMessage;
}

export function useFieldError(name?: string) {
  const errors = useContext(FieldErrorContext);
  return name ? errors[name] : undefined;
}

// Drop-in replacement for <form> that shows validation errors inline (in red,
// below each field) instead of the browser's native popup bubbles. It relies on
// standard HTML constraints (required, type=email, minLength, …): when the browser
// finds an invalid field on submit it fires an `invalid` event, which we catch to
// render the message under the matching <Field name="…">. Errors clear as the user
// fixes each field.
export function ValidatedForm({
  action,
  onSubmit,
  className,
  children,
}: {
  action?: (formData: FormData) => void | Promise<void>;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  className?: string;
  children: ReactNode;
}) {
  const [errors, setErrors] = useState<Errors>({});

  function handleInvalid(e: FormEvent) {
    const el = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    if (!el?.name) return;
    e.preventDefault(); // suppress the native tooltip
    setErrors((prev) => ({ ...prev, [el.name]: shortMessage(el) }));
  }

  function clearIfValid(e: FormEvent) {
    const el = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    if (!el?.name) return;
    if (el.validity?.valid) {
      setErrors((prev) => {
        if (!(el.name in prev)) return prev;
        const next = { ...prev };
        delete next[el.name];
        return next;
      });
    }
  }

  return (
    <FieldErrorContext.Provider value={errors}>
      <form
        action={action}
        onSubmit={onSubmit}
        className={className}
        onInvalidCapture={handleInvalid}
        onInput={clearIfValid}
        onChange={clearIfValid}
      >
        {children}
      </form>
    </FieldErrorContext.Provider>
  );
}

export function Field({
  label,
  htmlFor,
  name,
  children,
  hint,
  optional,
  required,
}: {
  label: string;
  htmlFor?: string;
  name?: string;
  children: ReactNode;
  hint?: string;
  optional?: boolean;
  required?: boolean;
}) {
  const error = useFieldError(name);
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className={cn("mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-200")}
      >
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
        {optional && <span className="ml-1 text-xs font-normal text-neutral-400">(optional)</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-neutral-500">{hint}</p>
      ) : null}
    </div>
  );
}
