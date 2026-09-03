// Shared input/select/textarea styling, used by primitives.tsx and any
// standalone client input components (e.g. money-input.tsx) that need to
// match without importing from primitives.tsx and risking a circular import.
export const fieldStyles =
  "w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60 dark:border-white/15 dark:bg-neutral-950";
