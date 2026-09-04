import { redirect } from "next/navigation";
import { getCurrentUser, canCreateInModule } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { approveRequest, rejectRequest, needsInfoRequest, deleteRequest } from "@/lib/actions/members";
import { PageHeader, Card, CardBody, Badge, EmptyState, Input } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/submit-button";
import { PhoneIcon, MailIcon } from "@/components/ui/icons";
import { HistoryRow } from "./history-row";
import { requestStatusTone } from "@/lib/display";

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
    include: { reviewedBy: { select: { firstName: true, lastName: true } } },
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
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 font-display text-base font-semibold text-brand-800 dark:bg-brand-950 dark:text-brand-200">
                        {(s.firstName?.[0] ?? "?").toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium">
                          {s.firstName} {s.lastName}
                          {s.relation && (
                            <span className="ml-2 text-xs font-normal text-neutral-400">{s.relation}</span>
                          )}
                          {s.age ? <span className="ml-2 text-xs font-normal text-neutral-400">Age {s.age}</span> : null}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500">
                          {s.mobile && (
                            <span className="inline-flex items-center gap-1.5">
                              <PhoneIcon className="h-3.5 w-3.5 shrink-0" />
                              {s.mobile}
                            </span>
                          )}
                          {s.email && (
                            <span className="inline-flex items-center gap-1.5 break-all">
                              <MailIcon className="h-3.5 w-3.5 shrink-0" />
                              {s.email}
                            </span>
                          )}
                        </div>
                        {s.address && <p className="mt-1 text-sm text-neutral-500">{s.address}</p>}
                      </div>
                    </div>
                    <Badge tone={requestStatusTone(r.status)}>{r.status}</Badge>
                  </div>
                  {r.adminNote && <p className="text-sm text-amber-700">Note: {r.adminNote}</p>}

                  <div className="space-y-3 border-t border-black/5 pt-3 dark:border-white/5">
                    <form action={approveRequest}>
                      <input type="hidden" name="requestId" value={r.id} />
                      <SubmitButton pendingText="Approving…" className="w-full sm:w-auto">Approve membership</SubmitButton>
                    </form>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <form action={needsInfoRequest} className="flex items-center gap-2 rounded-lg bg-black/[0.02] p-2 dark:bg-white/[0.03]">
                        <Input name="note" placeholder="Ask for more info…" className="h-9 flex-1 border-0 bg-white shadow-sm dark:bg-neutral-900" />
                        <input type="hidden" name="requestId" value={r.id} />
                        <SubmitButton size="sm" variant="secondary" pendingText="Sending…" className="shrink-0">Needs info</SubmitButton>
                      </form>
                      <form action={rejectRequest} className="flex items-center gap-2 rounded-lg bg-black/[0.02] p-2 dark:bg-white/[0.03]">
                        <Input name="note" placeholder="Reason (optional)" className="h-9 flex-1 border-0 bg-white shadow-sm dark:bg-neutral-900" />
                        <input type="hidden" name="requestId" value={r.id} />
                        <SubmitButton size="sm" variant="danger" pendingText="Rejecting…" className="shrink-0">Reject</SubmitButton>
                      </form>
                    </div>
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
              const reviewer = r.reviewedBy ? `${r.reviewedBy.firstName} ${r.reviewedBy.lastName}`.trim() : null;
              return (
                <HistoryRow
                  key={r.id}
                  name={`${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || "—"}
                  status={r.status}
                  tone={requestStatusTone(r.status)}
                  reviewedAt={r.reviewedAt}
                  reviewedByName={reviewer}
                  adminNote={r.adminNote}
                  mobile={s.mobile}
                  email={s.email}
                  address={s.address}
                  relation={s.relation}
                  age={s.age}
                >
                  {isSuper && r.status === "rejected" && (
                    <form action={deleteRequest} className="pt-1">
                      <input type="hidden" name="requestId" value={r.id} />
                      <SubmitButton size="sm" variant="ghost" pendingText="Deleting…">Delete request</SubmitButton>
                    </form>
                  )}
                </HistoryRow>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
