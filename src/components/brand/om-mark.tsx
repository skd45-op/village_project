import { cn } from "@/lib/utils";

// Kundapur logo mark: the Om (ॐ) glyph in a warm terracotta badge.
export function OmMark({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const box =
    size === "lg" ? "h-12 w-12 text-2xl" : size === "sm" ? "h-8 w-8 text-base" : "h-10 w-10 text-xl";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-terracotta to-terracotta-600 font-semibold text-white shadow-sm ring-1 ring-black/5",
        box,
        className,
      )}
      aria-hidden="true"
    >
      ॐ
    </span>
  );
}
