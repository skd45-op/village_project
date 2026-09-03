import { cn } from "@/lib/utils";
import { fieldStyles } from "./field-styles";
import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, LabelHTMLAttributes } from "react";

// Standard page-width wrapper. Content pages wrap themselves in this; the shell
// no longer clamps width, so full-bleed sections (the homepage) can break out.
export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}>{children}</div>;
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-black/[0.07] bg-surface shadow-sm dark:border-white/10", className)}>
      {children}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// Eyebrow + big display heading, used to open sections (matches the reference).
export function SectionHeading({
  eyebrow,
  title,
  accent,
  align = "left",
  tone = "terracotta",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  accent?: string;
  align?: "left" | "center";
  tone?: "terracotta" | "gold" | "brand";
  className?: string;
}) {
  const accentColor =
    tone === "gold" ? "text-gold-600" : tone === "brand" ? "text-brand-700" : "text-terracotta";
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      {eyebrow && <p className={cn("eyebrow mb-3", accentColor)}>{eyebrow}</p>}
      <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
        {accent && <span className={cn("block", accentColor)}>{accent}</span>}
      </h2>
    </div>
  );
}

// Big-number stat tile for the homepage / dashboards.
export function StatTile({
  icon,
  value,
  label,
  className,
}: {
  icon?: ReactNode;
  value: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {icon && <div className="text-2xl text-terracotta">{icon}</div>}
      <div className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{value}</div>
      <div className="text-sm text-muted">{label}</div>
    </div>
  );
}

const badgeTones: Record<string, string> = {
  neutral: "bg-black/[0.06] text-neutral-700 dark:bg-white/10 dark:text-neutral-300",
  green: "bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-200",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  red: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  brand: "bg-brand-800 text-white",
  gold: "bg-gold/15 text-gold-600",
};

export function Badge({ tone = "neutral", children }: { tone?: keyof typeof badgeTones; children: ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", badgeTones[tone])}>{children}</span>;
}

const alertTones: Record<string, string> = {
  info: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200",
  success: "border-brand-200 bg-brand-50 text-brand-800 dark:border-brand-900 dark:bg-brand-950/50 dark:text-brand-200",
  error: "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200",
};

export function Alert({ tone = "info", children }: { tone?: keyof typeof alertTones; children: ReactNode }) {
  return <div className={cn("rounded-lg border px-4 py-3 text-sm", alertTones[tone])}>{children}</div>;
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-black/15 p-10 text-center dark:border-white/15">
      <p className="font-medium text-neutral-600 dark:text-neutral-300">{title}</p>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </div>
  );
}

export function Label({ className, children, ...props }: LabelHTMLAttributes<HTMLLabelElement> & { children: ReactNode }) {
  return (
    <label className={cn("mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-200", className)} {...props}>
      {children}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldStyles, className)} {...props} />;
}

// Input with a leading icon (used on the compact auth forms).
export function IconInput({ icon, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { icon: ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">{icon}</span>
      <input className={cn(fieldStyles, "pl-9", className)} {...props} />
    </div>
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldStyles, "min-h-24", className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select className={cn(fieldStyles, className)} {...props}>
      {children}
    </select>
  );
}

// Field, ValidatedForm and useFieldError live in ./field (client-only, they use
// React context for inline validation). Re-exported here so existing imports from
// "@/components/ui/primitives" keep working.
export { Field, ValidatedForm, useFieldError } from "./field";

// MoneyInput lives in ./money-input (client-only — it intercepts keystrokes).
export { MoneyInput } from "./money-input";

// PasswordInput lives in ./password-input (client-only — show/hide toggle state).
export { PasswordInput } from "./password-input";
