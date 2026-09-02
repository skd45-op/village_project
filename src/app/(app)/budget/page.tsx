import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, isMemberOrAbove, canCreateInModule } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSessionBudget } from "@/lib/budget";
import { addBudgetEntry, addDonation } from "@/lib/actions/budget";
import { PageHeader, Card, CardBody, Badge, Field, Input, Select, Textarea, EmptyState, Alert, ValidatedForm } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { BUDGET_CATEGORIES } from "@/lib/constants";
import { formatMoney, formatDate } from "@/lib/utils";

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
    return (
      <div>
        <PageHeader title="Budget / Treasury" subtitle="Choose a session to view its ledger" />
        {sessions.length === 0 ? (
          <EmptyState title="No sessions yet" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {sessions.map((s) => (
              <Link key={s.id} href={`/budget?session=${s.id}`}>
                <Card className="transition hover:border-brand-400 hover:shadow">
                  <CardBody>
                    <p className="font-medium">{s.title}</p>
                    <p className="text-sm text-neutral-500">{s.occasion.name} · {s.year}</p>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  const { session, rows, income, expense, balance } = await getSessionBudget(sessionId);
  if (!session) redirect("/budget");

  const members = canAdd
    ? await prisma.user.findMany({
        where: { status: "active", role: { in: ["member", "admin", "superadmin"] } },
        orderBy: { firstName: "asc" },
        select: { id: true, firstName: true, lastName: true },
      })
    : [];

  const donations = await prisma.donation.findMany({
    where: { sessionId },
    orderBy: { date: "desc" },
    include: { member: { select: { firstName: true, lastName: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Budget — ${session.title}`}
        subtitle={`${session.occasion.name} · ${session.year}`}
        action={<ButtonLink href={`/budget/${session.id}/statement`} variant="secondary" size="sm">Statement (PDF)</ButtonLink>}
      />
      <Link href="/budget" className="text-sm text-brand-600 hover:underline">← All sessions</Link>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Total Income" value={formatMoney(income)} tone="green" />
        <SummaryCard label="Total Expense" value={formatMoney(expense)} tone="red" />
        <SummaryCard label="Balance" value={formatMoney(balance)} tone={balance >= 0 ? "green" : "red"} />
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
              <Field label="Category" name="category">
                <Select name="category" defaultValue={BUDGET_CATEGORIES[0]}>
                  {BUDGET_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Amount (₹)" name="amount" required>
                <Input name="amount" type="number" step="0.01" min="0" required />
              </Field>
              <Field label="Receipt/proof URL" name="receiptUrl" required>
                <Input name="receiptUrl" type="url" required placeholder="https://…" />
              </Field>
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
                        {formatDate(entry.addedAt)} · by {entry.addedBy?.firstName ?? "—"} ·{" "}
                        <a href={entry.receiptUrl ?? "#"} className="text-brand-600 hover:underline" target="_blank" rel="noreferrer">receipt</a>
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
              <Input name="amount" type="number" step="0.01" min="0" placeholder="Amount" required />
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
            <ul className="divide-y divide-black/5 text-sm dark:divide-white/5">
              {donations.map((d) => (
                <li key={d.id} className="flex items-center justify-between py-2">
                  <span>{d.member.firstName} {d.member.lastName} <span className="text-neutral-400">· {d.mode} · {formatDate(d.date)}</span></span>
                  <span className="font-medium">{formatMoney(d.amount)}</span>
                </li>
              ))}
            </ul>
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
