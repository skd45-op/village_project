"use client";

import { useState } from "react";
import { useActionState } from "react";
import { loginSuperAdmin, type ActionState } from "@/lib/actions/auth";
import { ValidatedForm, useFieldError } from "@/components/ui/primitives";
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon } from "@/components/ui/icons";

export function AdminLoginForm() {
  const [state, action] = useActionState<ActionState, FormData>(loginSuperAdmin, {});
  const [showPassword, setShowPassword] = useState(false);

  return (
    <ValidatedForm action={action} className="dark-autofill space-y-4">
      {state.error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}

      <DarkField name="email" label="Email">
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70">
            <MailIcon />
          </span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition focus:border-gold/60 focus:ring-1 focus:ring-gold/40"
            placeholder="superadmin@example.com"
          />
        </div>
      </DarkField>

      <DarkField name="password" label="Password">
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70">
            <LockIcon />
          </span>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-white placeholder-white/30 outline-none transition focus:border-gold/60 focus:ring-1 focus:ring-gold/40"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/70 transition hover:text-gold"
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </DarkField>

      <button
        type="submit"
        className="w-full rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-brand-950 shadow-md shadow-black/30 transition hover:bg-gold-600 active:scale-[0.99]"
      >
        Access Admin Panel →
      </button>
    </ValidatedForm>
  );
}

// Dark-themed field with inline validation, matching the admin portal styling.
function DarkField({
  name,
  label,
  children,
}: {
  name: string;
  label: string;
  children: React.ReactNode;
}) {
  const error = useFieldError(name);
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-widest text-white/40">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
