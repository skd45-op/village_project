import { redirect, notFound } from "next/navigation";
import { getCurrentUser, isMemberOrAbove } from "@/lib/auth";
import { getSessionBudget } from "@/lib/budget";
import { PrintButton } from "@/components/print-button";
import { formatMoney, formatDate } from "@/lib/utils";

export default async function StatementPage({
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
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <a href={`/budget?session=${session.id}`} className="text-sm text-emerald-600 hover:underline">← Back</a>
        <PrintButton />
      </div>

      <div className="rounded-xl border border-black/10 bg-white p-8 text-neutral-900 print:border-0 print:p-0">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold">🪔 Village Community</h1>
          <p className="text-sm text-neutral-500">Yearly Financial Statement</p>
          <p className="mt-1 font-medium">{session.occasion.name} {session.year} — {session.title}</p>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-neutral-300 text-left">
              <th className="py-1">Date</th>
              <th>Type</th>
              <th>Category</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ entry, effective, delta }) => (
              <tr key={entry.id} className="border-b border-neutral-200">
                <td className="py-1">{formatDate(entry.addedAt)}</td>
                <td className="capitalize">{entry.type}</td>
                <td>
                  {entry.category}
                  {delta !== 0 && <span className="text-xs text-neutral-500"> (corrected)</span>}
                </td>
                <td className="text-right">{formatMoney(effective)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 space-y-1 text-sm">
          <Row label="Total Income" value={formatMoney(income)} />
          <Row label="Total Expense" value={formatMoney(expense)} />
          <div className="mt-2 flex justify-between border-t-2 border-neutral-300 pt-2 font-bold">
            <span>Balance</span>
            <span>{formatMoney(balance)}</span>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-neutral-400">
          Generated {formatDate(new Date())} · Immutable ledger with corrections shown
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
