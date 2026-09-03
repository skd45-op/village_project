import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser, isMemberOrAbove } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOccasionStock } from "@/lib/stock";
import { PageHeader, Card, CardBody, EmptyState } from "@/components/ui/primitives";
import { formatMoney } from "@/lib/utils";
import { StockEntryRow } from "./stock-entry-row";
import { AddStockEntryForm } from "./add-stock-entry-form";

export default async function OccasionStockPage({
  params,
}: {
  params: Promise<{ occasionId: string }>;
}) {
  const user = await getCurrentUser();
  if (!isMemberOrAbove(user)) redirect("/dashboard");
  const { occasionId } = await params;

  const occasion = await prisma.occasion.findUnique({ where: { id: occasionId } });
  if (!occasion) notFound();

  const { entries, balance } = await getOccasionStock(occasionId);
  const isSuper = user!.role === "superadmin";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Stock — ${occasion.name}`}
        subtitle="Treasury carried forward across years, recorded manually by the Super Admin"
      />
      <Link href="/budget" className="text-sm text-brand-600 hover:underline">← All occasions</Link>

      <Card>
        <CardBody>
          <p className="text-sm text-neutral-500">Stock in hand</p>
          <p className={`mt-1 text-3xl font-semibold ${balance >= 0 ? "text-brand-600" : "text-red-600"}`}>
            {formatMoney(balance)}
          </p>
        </CardBody>
      </Card>

      {isSuper && (
        <Card>
          <CardBody>
            <h2 className="mb-3 font-semibold">Add stock entry</h2>
            <AddStockEntryForm occasionId={occasionId} />
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody>
          <h2 className="mb-3 font-semibold">Stock ledger</h2>
          {entries.length === 0 ? (
            <EmptyState title="No stock entries yet" hint={isSuper ? "Add the first carry-forward entry above." : "Check back after a season concludes."} />
          ) : (
            <div className="space-y-2">
              {entries.map((e) => (
                <StockEntryRow
                  key={e.id}
                  canManage={isSuper}
                  entry={{
                    id: e.id,
                    occasionId: e.occasionId,
                    year: e.year,
                    amountDelta: Number(e.amountDelta),
                    description: e.description,
                    addedAt: e.addedAt,
                    addedBy: e.addedBy,
                  }}
                />
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
