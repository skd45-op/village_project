import { redirect } from "next/navigation";
import { getCurrentUser, isMemberOrAbove, canCreateInModule } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { votePoll } from "@/lib/actions/polls";
import { PageHeader, Card, CardBody, Badge, EmptyState } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatDate } from "@/lib/utils";

export default async function PollsPage() {
  const user = await getCurrentUser();
  if (!isMemberOrAbove(user)) redirect("/dashboard");
  const canCreate = canCreateInModule(user, "polls");

  const polls = await prisma.poll.findMany({
    orderBy: { createdAt: "desc" },
    include: { votes: true },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Polls"
        subtitle="Members-only voting"
        action={canCreate ? <ButtonLink href="/polls/new" size="sm">New poll</ButtonLink> : undefined}
      />

      {polls.length === 0 ? (
        <EmptyState title="No polls yet" />
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => {
            const options = poll.options as string[];
            const total = poll.votes.length;
            const myVote = poll.votes.find((v) => v.userId === user!.id)?.option;
            const closed = !!poll.expiresAt && poll.expiresAt < new Date();
            const counts = options.map((o) => poll.votes.filter((v) => v.option === o).length);

            return (
              <Card key={poll.id}>
                <CardBody className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-semibold">{poll.title}</h2>
                    {closed ? <Badge tone="neutral">closed</Badge> : <Badge tone="green">open</Badge>}
                  </div>
                  {poll.expiresAt && (
                    <p className="text-xs text-neutral-500">
                      {closed ? "Closed" : "Closes"} {formatDate(poll.expiresAt)}
                    </p>
                  )}

                  <div className="space-y-2">
                    {options.map((o, i) => {
                      const pct = total ? Math.round((counts[i] / total) * 100) : 0;
                      const mine = myVote === o;
                      return (
                        <div key={o} className="flex items-center gap-3">
                          <div className="relative flex-1 overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
                            <div className="absolute inset-y-0 left-0 bg-brand-100 dark:bg-brand-950" style={{ width: `${pct}%` }} />
                            <div className="relative flex items-center justify-between px-3 py-1.5 text-sm">
                              <span className={mine ? "font-semibold" : ""}>{mine ? "✓ " : ""}{o}</span>
                              <span className="text-neutral-500">{pct}% · {counts[i]}</span>
                            </div>
                          </div>
                          {!closed && (
                            <form action={votePoll}>
                              <input type="hidden" name="pollId" value={poll.id} />
                              <input type="hidden" name="option" value={o} />
                              <SubmitButton size="sm" variant={mine ? "secondary" : "primary"} pendingText="…">
                                {mine ? "Voted" : "Vote"}
                              </SubmitButton>
                            </form>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-neutral-400">{total} vote{total === 1 ? "" : "s"}</p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
