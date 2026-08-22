import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setContactStatus } from "@/lib/actions/contact";
import { PageHeader, Card, CardBody, Badge, EmptyState } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatDate } from "@/lib/utils";

const tone = { new: "amber", read: "blue", resolved: "green" } as const;

export default async function AdminContactPage() {
  const user = await getCurrentUser();
  if (user?.role !== "superadmin") redirect("/dashboard");

  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div className="space-y-6">
      <PageHeader title="Contact Messages" subtitle={`${messages.filter((m) => m.status === "new").length} new`} />
      {messages.length === 0 ? (
        <EmptyState title="No messages yet" />
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <Card key={m.id}>
              <CardBody className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="font-medium">{m.name}</span>
                    {m.email && <span className="text-sm text-neutral-500"> · {m.email}</span>}
                    <span className="text-sm text-neutral-400"> · to {m.target} · {formatDate(m.createdAt)}</span>
                  </div>
                  <Badge tone={tone[m.status]}>{m.status}</Badge>
                </div>
                <p className="text-sm">{m.message}</p>
                <div className="flex gap-2 border-t border-black/5 pt-2 dark:border-white/5">
                  {m.status !== "read" && (
                    <form action={setContactStatus}>
                      <input type="hidden" name="id" value={m.id} />
                      <input type="hidden" name="status" value="read" />
                      <SubmitButton size="sm" variant="ghost" pendingText="…">Mark read</SubmitButton>
                    </form>
                  )}
                  {m.status !== "resolved" && (
                    <form action={setContactStatus}>
                      <input type="hidden" name="id" value={m.id} />
                      <input type="hidden" name="status" value="resolved" />
                      <SubmitButton size="sm" variant="secondary" pendingText="…">Resolve</SubmitButton>
                    </form>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
