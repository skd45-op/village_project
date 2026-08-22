import { redirect } from "next/navigation";
import { getCurrentUser, canCreateInModule } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { approveRequest, rejectRequest, needsInfoRequest, deleteRequest } from "@/lib/actions/members";
import { PageHeader, Card, CardBody, Badge, EmptyState, Input } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/submit-button";
import { requestStatusTone } from "@/lib/display";
import { formatDate } from "@/lib/utils";

type Snapshot = {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  address?: string;
  relation?: string;
  age?: number | null;
};

export default async function AdminMembersPage() {
  const user = await getCurrentUser();
  if (!canCreateInModule(user, "members")) redirect("/dashboard");
  const isSuper = user!.role === "superadmin";

  const requests = await prisma.membershipRequest.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const open = requests.filter((r) => r.status === "pending" || r.status === "needs_info");
  const closed = requests.filter((r) => r.status === "approved" || r.status === "rejected");

  return (
    <div className="space-y-8">
      <PageHeader title="Membership Requests" subtitle={`${open.length} awaiting review`} />

      {open.length === 0 ? (
        <EmptyState title="No open requests" hint="New join requests will appear here." />
      ) : (
        <div className="space-y-4">
          {open.map((r) => {
            const s = r.userSnapshot as Snapshot;
            return (
              <Card key={r.id}>
                <CardBody className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {s.firstName} {s.lastName}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {s.mobile} · {s.email} · {s.relation ?? "—"}
                        {s.age ? ` · age ${s.age}` : ""}
                      </p>
                      {s.address && <p className="text-sm text-neutral-500">{s.address}</p>}
                    </div>
                    <Badge tone={requestStatusTone(r.status)}>{r.status}</Badge>
                  </div>
                  {r.adminNote && <p className="text-sm text-amber-700">Note: {r.adminNote}</p>}

                  <div className="flex flex-wrap items-center gap-2 border-t border-black/5 pt-3 dark:border-white/5">
                    <form action={approveRequest}>
                      <input type="hidden" name="requestId" value={r.id} />
                      <SubmitButton size="sm" pendingText="Approving…">Approve</SubmitButton>
                    </form>
                    <form action={needsInfoRequest} className="flex items-center gap-2">
                      <input type="hidden" name="requestId" value={r.id} />
                      <Input name="note" placeholder="Ask for more info…" className="h-9 w-56" />
                      <SubmitButton size="sm" variant="secondary" pendingText="Sending…">Needs info</SubmitButton>
                    </form>
                    <form action={rejectRequest} className="flex items-center gap-2">
                      <input type="hidden" name="requestId" value={r.id} />
                      <Input name="note" placeholder="Reason (optional)" className="h-9 w-48" />
                      <SubmitButton size="sm" variant="danger" pendingText="Rejecting…">Reject</SubmitButton>
                    </form>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {closed.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-neutral-500">History</h2>
          <div className="space-y-2">
            {closed.map((r) => {
              const s = r.userSnapshot as Snapshot;
              return (
                <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-black/10 px-4 py-2.5 text-sm dark:border-white/10">
                  <span>
                    {s.firstName} {s.lastName}{" "}
                    <span className="text-neutral-400">· {formatDate(r.reviewedAt)}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge tone={requestStatusTone(r.status)}>{r.status}</Badge>
                    {isSuper && r.status === "rejected" && (
                      <form action={deleteRequest}>
                        <input type="hidden" name="requestId" value={r.id} />
                        <SubmitButton size="sm" variant="ghost" pendingText="Deleting…">Delete</SubmitButton>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
