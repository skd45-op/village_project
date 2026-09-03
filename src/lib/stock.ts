import { prisma } from "@/lib/prisma";

// Per-occasion treasury "stock" — the running carry-forward balance from all
// manually-recorded surplus/deficit entries. Not tied to any single session;
// Super Admin decides when to record a year's leftover into (or draw from) it.
export async function getOccasionStock(occasionId: string) {
  const entries = await prisma.stockEntry.findMany({
    where: { occasionId },
    orderBy: [{ year: "desc" }, { addedAt: "desc" }],
    include: { addedBy: { select: { firstName: true, lastName: true } } },
  });

  const balance = entries.reduce((sum, e) => sum + Number(e.amountDelta), 0);

  return { entries, balance };
}

// Lightweight balance-only lookup for multiple occasions at once (occasion list view).
export async function getStockBalances(occasionIds: string[]) {
  if (occasionIds.length === 0) return new Map<string, number>();
  const rows = await prisma.stockEntry.groupBy({
    by: ["occasionId"],
    where: { occasionId: { in: occasionIds } },
    _sum: { amountDelta: true },
  });
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.occasionId, Number(r._sum.amountDelta ?? 0));
  return map;
}
