"use client";

// Catches runtime errors from any page/layout below the root (including the
// database queries in the nav and pages). In production this replaces the crash
// with a friendly message instead of a broken/blank screen.

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Detect a database-unreachable error so we can show a clearer message.
  const msg = `${error?.message ?? ""}`.toLowerCase();
  const isDbDown =
    msg.includes("tenant/user") ||
    msg.includes("enotfound") ||
    msg.includes("can't reach database") ||
    msg.includes("econnrefused") ||
    msg.includes("connection") ||
    error?.name === "PrismaClientKnownRequestError" ||
    error?.name === "PrismaClientInitializationError";

  return (
    <main className="flex min-h-[70vh] flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-neutral-900">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl dark:bg-amber-950">
          {isDbDown ? "🔌" : "⚠️"}
        </div>
        <h1 className="text-xl font-semibold">
          {isDbDown ? "Service temporarily unavailable" : "Something went wrong"}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {isDbDown
            ? "We can't reach the database right now. This is usually temporary — please try again in a moment."
            : "An unexpected error occurred. Please try again."}
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-lg border border-black/15 px-4 py-2 text-sm font-medium transition hover:border-brand-400 hover:text-brand-600 dark:border-white/15"
          >
            Go home
          </a>
        </div>

        {error?.digest && (
          <p className="mt-4 text-xs text-neutral-400">Reference: {error.digest}</p>
        )}
      </div>
    </main>
  );
}
