import { prisma } from "@/lib/prisma";

// Loads a session's ledger (entries + their corrections) and computes totals.
// Effective amount of an entry = base amount + sum of its correction deltas.
export async function getSessionBudget(sessionId: string) {
  const [session, entries] = await Promise.all([
    prisma.session.findUnique({ where: { id: sessionId }, include: { occasion: true } }),
    prisma.budgetEntry.findMany({
      where: { sessionId },
      orderBy: { addedAt: "asc" },
      include: { corrections: { orderBy: { addedAt: "asc" } }, addedBy: true },
    }),
  ]);

  let income = 0;
  let expense = 0;

  const rows = entries.map((e) => {
    const delta = e.corrections.reduce((sum, c) => sum + Number(c.amountDelta), 0);
    const effective = Number(e.amount) + delta;
    if (e.type === "income") income += effective;
    else expense += effective;
    return { entry: e, delta, effective };
  });

  return {
    session,
    rows,
    income,
    expense,
    balance: income - expense,
  };
}
