"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@/components/ui/primitives";
import { formatMoney } from "@/lib/utils";

type YearOption = { sessionId: string; year: number; title: string };

export function BudgetOccasionCard({
  name,
  iconUrl,
  years,
  stock,
}: {
  name: string;
  iconUrl: string | null;
  years: YearOption[];
  stock?: number;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const minYear = Math.min(...years.map((y) => y.year));
  const maxYear = Math.max(...years.map((y) => y.year));

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="block w-full text-left"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Card className={`transition hover:border-brand-400 hover:shadow ${open ? "border-brand-400 shadow" : ""}`}>
          <CardBody className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">
                {iconUrl && <span className="mr-1.5">{iconUrl}</span>}
                {name}
              </p>
              <p className="text-sm text-neutral-500">
                {years.length} season{years.length === 1 ? "" : "s"} · {minYear}
                {maxYear > minYear && `–${maxYear}`}
              </p>
              {stock !== undefined && (
                <p className={`mt-0.5 text-xs font-medium ${stock >= 0 ? "text-brand-600" : "text-red-600"}`}>
                  Stock: {formatMoney(stock)}
                </p>
              )}
            </div>
            <ChevronIcon className={`h-4 w-4 shrink-0 text-muted transition ${open ? "rotate-180" : ""}`} />
          </CardBody>
        </Card>
      </button>

      {open && (
        <>
          <button
            className="fixed inset-0 z-40 cursor-default"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
          />
          <div
            role="listbox"
            className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-[color:var(--hairline)] bg-surface shadow-xl"
          >
            {years.map((y) => {
              const showTitle = y.title && y.title !== String(y.year);
              return (
                <button
                  key={y.sessionId}
                  role="option"
                  onClick={() => router.push(`/budget?session=${y.sessionId}`)}
                  className="block w-full px-4 py-2.5 text-left text-sm text-foreground/80 transition hover:bg-terracotta/10 hover:text-terracotta"
                >
                  {y.year}
                  {showTitle && <span className="text-muted"> · {y.title}</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
