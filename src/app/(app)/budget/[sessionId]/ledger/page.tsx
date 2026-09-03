import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser, isMemberOrAbove } from "@/lib/auth";
import { getSessionBudget } from "@/lib/budget";
import { PageHeader, Card, CardBody, Badge, EmptyState } from "@/components/ui/primitives";
import { formatMoney, formatDateTime } from "@/lib/utils";

export default async function FullLedgerPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await getCurrentUser();
  if (!isMemberOrAbove(user)) redirect("/dashboard");
  const { sessionId } = await params;
  const { session, rows, income, expense, balance } = await getSessionBudget(sessionId);
  if (!session) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Full ledger — ${session.title}`}
        subtitle={`${session.occasion.name} · ${session.year} · every entry, in full detail`}
      />
      <Link href={`/budget?session=${session.id}`} className="text-sm text-brand-600 hover:underline">← Back to budget</Link>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-sm text-neutral-500">Total Income</p>
            <p className="mt-1 text-xl font-semibold text-brand-600">{formatMoney(income)}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-neutral-500">Total Expense</p>
            <p className="mt-1 text-xl font-semibold text-red-600">{formatMoney(expense)}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-neutral-500">Balance</p>
            <p className={`mt-1 text-xl font-semibold ${balance >= 0 ? "text-brand-600" : "text-red-600"}`}>{formatMoney(balance)}</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          {rows.length === 0 ? (
            <EmptyState title="No entries yet" />
          ) : (
            <div className="space-y-3">
              {rows.map(({ entry, delta, effective }) => (
                <div key={entry.id} className="rounded-lg border border-black/10 p-4 text-sm dark:border-white/10">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={entry.type === "income" ? "green" : "red"}>{entry.type}</Badge>
                        <span className="font-semibold">{entry.category}</span>
                      </div>
                      {entry.description && (
                        <p className="mt-1.5 text-neutral-600 dark:text-neutral-300">{entry.description}</p>
                      )}
                      <dl className="mt-2 grid gap-x-6 gap-y-1 text-xs text-neutral-500 sm:grid-cols-2">
                        <div>
                          <dt className="inline text-neutral-400">Timestamp: </dt>
                          <dd className="inline">{formatDateTime(entry.addedAt)}</dd>
                        </div>
                        {entry.receiptUrl && (
                          <div>
                            <dt className="inline text-neutral-400">Receipt: </dt>
                            <dd className="inline">
                              <a href={entry.receiptUrl} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                                View file
                              </a>
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className={delta !== 0 ? "text-neutral-400 line-through" : "font-semibold"}>{formatMoney(entry.amount)}</span>
                      {delta !== 0 && <div className="font-semibold">{formatMoney(effective)}</div>}
                    </div>
                  </div>

                  {entry.corrections.length > 0 && (
                    <ul className="mt-3 space-y-1.5 border-t border-dashed border-black/10 pt-3 text-xs text-amber-700 dark:border-white/10">
                      {entry.corrections.map((c) => (
                        <li key={c.id}>
                          Correction {formatMoney(c.amountDelta)} — {c.reason}{" "}
                          <span className="text-neutral-400">({formatDateTime(c.addedAt)})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
