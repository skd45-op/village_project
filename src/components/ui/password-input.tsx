"use client";

import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { fieldStyles } from "./field-styles";
import { LockIcon, EyeIcon, EyeOffIcon } from "./icons";

// A password field with a leading lock icon and a show/hide (eye) toggle on the
// right. Toggling swaps the input's type between "password" and "text".
export function PasswordInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
        <LockIcon />
      </span>
      <input
        type={visible ? "text" : "password"}
        className={cn(fieldStyles, "pl-9 pr-10", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-terracotta"
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}
