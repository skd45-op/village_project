import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, isMemberOrAbove, canCreateInModule } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSessionBudget } from "@/lib/budget";
import { getOccasionStock, getStockBalances } from "@/lib/stock";
import { addBudgetEntry, addDonation } from "@/lib/actions/budget";
import { PageHeader, Card, CardBody, Badge, Field, Input, Select, Textarea, EmptyState, Alert, ValidatedForm, MoneyInput } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { ReceiptUploader } from "@/components/receipt-uploader";
import { formatMoney, formatDate } from "@/lib/utils";
import { BudgetOccasionCard } from "./occasion-picker";
import { CategoryField } from "./category-field";

export default async function BudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const user = await getCurrentUser();
  if (!isMemberOrAbove(user)) redirect("/dashboard"); // budget is Member+ only
  const canAdd = canCreateInModule(user, "budget");
  const { session: sessionId } = await searchParams;

  if (!sessionId) {
    const sessions = await prisma.session.findMany({
      orderBy: [{ year: "desc" }],
      include: { occasion: true },
    });

    // Group sessions by occasion so users pick the occasion, then a year.
    const byOccasion = new Map<
      string,
      { name: string; iconUrl: string | null; years: { sessionId: string; year: number; title: string }[] }
    >();
    for (const s of sessions) {
      const entry = byOccasion.get(s.occasionId) ?? {
        name: s.occasion.name,
        iconUrl: s.occasion.iconUrl,
        years: [],
      };
      entry.years.push({ sessionId: s.id, year: s.year, title: s.title });
      byOccasion.set(s.occasionId, entry);
    }
    const occasions = Array.from(byOccasion.entries()).map(([occasionId, v]) => ({ occasionId, ...v }));
    const stockBalances = await getStockBalances(occasions.map((o) => o.occasionId));

    return (
      <div>
        <PageHeader title="Budget / Treasury" subtitle="Choose an occasion, then a year, to view its ledger" />
        {occasions.length === 0 ? (
          <EmptyState title="No sessions yet" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {occasions.map((o) => (
              <BudgetOccasionCard
                key={o.occasionId}
                name={o.name}
                iconUrl={o.iconUrl}
                years={o.years}
                stock={stockBalances.get(o.occasionId) ?? 0}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // getSessionBudget, members, and donations don't depend on each other's
  // results — fetch concurrently. getOccasionStock needs session.occasionId,
  // so it has to wait for getSessionBudget and stays a separate, final call.
  const [{ session, rows, income, expense, balance }, members, donations] = await Promise.all([
    getSessionBudget(sessionId),
    canAdd
      ? prisma.user.findMany({
          where: { status: "active", role: { in: ["member", "admin"] } },
          orderBy: { firstName: "asc" },
          select: { id: true, firstName: true, lastName: true },
        })
      : Promise.resolve([]),
    prisma.donation.findMany({
      where: { sessionId },
      orderBy: { date: "desc" },
      include: { member: { select: { firstName: true, lastName: true } } },
    }),
  ]);
  if (!session) redirect("/budget");

  const { balance: stockBalance } = await getOccasionStock(session.occasionId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Budget — ${session.title}`}
        subtitle={`${session.occasion.name} · ${session.year}`}
        action={
          <div className="flex flex-wrap gap-2">
            <ButtonLink href={`/budget/${session.id}/ledger`} variant="secondary" size="sm">Full ledger</ButtonLink>
            <ButtonLink href={`/budget/${session.id}/statement`} variant="secondary" size="sm">Statement (PDF)</ButtonLink>
          </div>
        }
      />
      <Link href="/budget" className="text-sm text-brand-600 hover:underline">← All sessions</Link>

      <div className="grid gap-4 sm:grid-cols-4">
        <SummaryCard label="Total Income" value={formatMoney(income)} tone="green" />
        <SummaryCard label="Total Expense" value={formatMoney(expense)} tone="red" />
        <SummaryCard label="Balance" value={formatMoney(balance)} tone={balance >= 0 ? "green" : "red"} />
        <Link href={`/budget/stock/${session.occasionId}`} className="block">
          <SummaryCard label="Stock in hand →" value={formatMoney(stockBalance)} tone={stockBalance >= 0 ? "green" : "red"} />
        </Link>
      </div>

      {canAdd && (
        <Card>
          <CardBody>
            <h2 className="mb-3 font-semibold">Add entry</h2>
            <ValidatedForm action={addBudgetEntry} className="grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="sessionId" value={session.id} />
              <Field label="Type" name="type">
                <Select name="type" defaultValue="income">
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </Select>
              </Field>
              <CategoryField />
              <Field label="Amount (₹)" name="amount" required>
                <MoneyInput name="amount" required />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Receipt / proof" name="receiptUrl" optional>
                  <ReceiptUploader name="receiptUrl" />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Description" name="description" optional>
                  <Textarea name="description" />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <SubmitButton pendingText="Adding…">Add entry</SubmitButton>
              </div>
            </ValidatedForm>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody>
          <h2 className="mb-3 font-semibold">Ledger</h2>
          {rows.length === 0 ? (
            <EmptyState title="No entries yet" />
          ) : (
            <div className="space-y-2">
              {rows.map(({ entry, delta, effective }) => (
                <div key={entry.id} className="rounded-lg border border-black/10 p-3 text-sm dark:border-white/10">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <Badge tone={entry.type === "income" ? "green" : "red"}>{entry.type}</Badge>{" "}
                      <span className="font-medium">{entry.category}</span>
                      {entry.description && <span className="text-neutral-500"> · {entry.description}</span>}
                      <p className="mt-0.5 text-xs text-neutral-400">
                        {formatDate(entry.addedAt)}
                        {entry.receiptUrl && (
                          <>
                            {" · "}
                            <a href={entry.receiptUrl} className="text-brand-600 hover:underline" target="_blank" rel="noreferrer">receipt</a>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={delta !== 0 ? "text-neutral-400 line-through" : "font-medium"}>{formatMoney(entry.amount)}</span>
                      {delta !== 0 && <div className="font-medium">{formatMoney(effective)}</div>}
                    </div>
                  </div>
                  {entry.corrections.length > 0 && (
                    <ul className="mt-2 space-y-1 border-t border-dashed border-black/10 pt-2 text-xs text-amber-700 dark:border-white/10">
                      {entry.corrections.map((c) => (
                        <li key={c.id}>
                          Correction {formatMoney(c.amountDelta)} — {c.reason} <span className="text-neutral-400">({formatDate(c.addedAt)})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
          {user!.role === "superadmin" && (
            <p className="mt-3 text-xs text-neutral-500">
              To fix an entry, add a correction from <Link href="/admin/corrections" className="text-brand-600 hover:underline">Budget corrections</Link>. Entries are never edited or deleted.
            </p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h2 className="mb-3 font-semibold">Donations</h2>
          {canAdd && (
            <form action={addDonation} className="mb-4 grid gap-3 sm:grid-cols-5">
              <input type="hidden" name="sessionId" value={session.id} />
              <Select name="memberId" defaultValue="" required>
                <option value="" disabled>Member…</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                ))}
              </Select>
              <MoneyInput name="amount" placeholder="Amount" required />
              <Select name="mode" defaultValue="cash">
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank">Bank</option>
              </Select>
              <Input name="date" type="date" />
              <SubmitButton pendingText="…">Add</SubmitButton>
            </form>
          )}
          {donations.length === 0 ? (
            <p className="text-sm text-neutral-500">No donations recorded.</p>
          ) : (
            <div className="space-y-2">
              {donations.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-3 rounded-lg border border-black/10 p-3 text-sm dark:border-white/10">
                  <div>
                    <span className="font-medium">{d.member.firstName} {d.member.lastName}</span>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      {d.mode} · {formatDate(d.date)}
                    </p>
                  </div>
                  <span className="font-medium">{formatMoney(d.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Alert tone="info">Budget is visible to Members, Admins and Super Admin only — never to guests.</Alert>
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone: "green" | "red" }) {
  return (
    <Card>
      <CardBody>
        <p className="text-sm text-neutral-500">{label}</p>
        <p className={`mt-1 text-xl font-semibold ${tone === "green" ? "text-brand-600" : "text-red-600"}`}>{value}</p>
      </CardBody>
    </Card>
  );
}
