import Link from "next/link";

// Friendly 404 for unmatched routes (and any notFound() call).
export default function NotFound() {
  return (
    <main className="paper flex min-h-dvh flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-black/10 bg-surface p-8 text-center shadow-sm dark:border-white/10">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-2xl">
          🧭
        </div>
        <p className="eyebrow mb-2 text-terracotta">Error 404</p>
        <h1 className="font-display text-2xl font-semibold">This page doesn&apos;t exist</h1>
        <p className="mt-2 text-sm text-muted">
          The page you&apos;re looking for may have moved or never existed. Let&apos;s get you back.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-900"
          >
            Go home
          </Link>
          <Link
            href="/occasions"
            className="rounded-full border border-black/15 px-5 py-2.5 text-sm font-medium transition hover:border-brand-400 hover:text-brand-700 dark:border-white/15"
          >
            Browse occasions
          </Link>
        </div>
      </div>
    </main>
  );
}
