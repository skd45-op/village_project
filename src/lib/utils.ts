import type { Prisma } from "@/generated/prisma/client";

// Merge Tailwind class names, dropping falsy values.
export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

// Prisma Decimal | number | string -> "₹1,234" (whole rupees only — no decimals)
export function formatMoney(value: Prisma.Decimal | number | string): string {
  return inr.format(Math.round(Number(value)));
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Full timestamp — date + time — for detailed ledgers/audit views.
export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
