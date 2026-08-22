import type { Prisma } from "@/generated/prisma/client";

// Merge Tailwind class names, dropping falsy values.
export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

// Prisma Decimal | number | string -> "₹1,234.00"
export function formatMoney(value: Prisma.Decimal | number | string): string {
  return inr.format(Number(value));
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
