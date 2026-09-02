import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addCorrection } from "@/lib/actions/budget";
import { PageHeader, Card, CardBody, Badge, Field, Input, EmptyState, ValidatedForm } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatMoney, formatDate } from "@/lib/utils";

export default async function CorrectionsPage() {
  const user = await getCurrentUser();
  if (user?.role !== "superadmin") redirect("/dashboard");

  const entries = await prisma.budgetEntry.findMany({
    orderBy: { addedAt: "desc" },
    take: 100,
    include: { corrections: true, session: { include: { occasion: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budget Corrections"
        subtitle="Entries are immutable. Fix mistakes with a linked correction — nothing is ever deleted."
      />
      {entries.length === 0 ? (
        <EmptyState title="No budget entries yet" />
      ) : (
        <div className="space-y-3">
          {entries.map((e) => {
            const delta = e.corrections.reduce((s, c) => s + Number(c.amountDelta), 0);
            const effective = Number(e.amount) + delta;
            return (
              <Card key={e.id}>
                <CardBody className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <div>
                      <Badge tone={e.type === "income" ? "green" : "red"}>{e.type}</Badge>{" "}
                      <span className="font-medium">{e.category}</span>
                      <span className="text-neutral-400"> · {e.session.occasion.name} {e.session.year} · {formatDate(e.addedAt)}</span>
                    </div>
                    <div className="text-right">
                      {delta !== 0 ? (
                        <>
                          <span className="text-neutral-400 line-through">{formatMoney(e.amount)}</span>{" "}
                          <span className="font-medium">{formatMoney(effective)}</span>
                        </>
                      ) : (
                        <span className="font-medium">{formatMoney(e.amount)}</span>
                      )}
                    </div>
                  </div>
                  {e.corrections.length > 0 && (
                    <ul className="text-xs text-amber-700">
                      {e.corrections.map((c) => (
                        <li key={c.id}>{formatMoney(c.amountDelta)} — {c.reason}</li>
                      ))}
                    </ul>
                  )}
                  <ValidatedForm action={addCorrection} className="flex flex-wrap items-end gap-2 border-t border-black/5 pt-2 dark:border-white/5">
                    <input type="hidden" name="originalEntryId" value={e.id} />
                    <Field label="Correction (₹, ± )" name="amountDelta">
                      <Input name="amountDelta" type="number" step="0.01" placeholder="-500" className="w-32" required />
                    </Field>
                    <Field label="Reason" name="reason">
                      <Input name="reason" placeholder="duplicate entry" className="w-64" required />
                    </Field>
                    <SubmitButton size="sm" pendingText="Adding…">Add correction</SubmitButton>
                  </ValidatedForm>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
