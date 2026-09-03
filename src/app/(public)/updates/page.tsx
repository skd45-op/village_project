import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createAnnouncement } from "@/lib/actions/announcements";
import { Container, Card, CardBody, SectionHeading, Field, Input, Textarea, Select, ValidatedForm, EmptyState } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/submit-button";
import { UpdatesFeed, type Update } from "./updates-feed";

export const dynamic = "force-dynamic";

export default async function UpdatesPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  const announcements = await prisma.announcement.findMany({
    orderBy: [{ pinned: "desc" }, { happensAt: "desc" }, { createdAt: "desc" }],
    take: 50,
  });
  const updates: Update[] = announcements;

  return (
    <Container className="max-w-4xl">
      <div className="mb-8">
        <SectionHeading eyebrow="No one misses a thing" title="Village updates" />
        <p className="mt-3 max-w-xl text-muted">
          Meetings, aartis, bhajans, volunteer calls — the little updates that keep a village
          feeling like a village.
        </p>
      </div>

      {isAdmin && (
        <Card className="mb-8">
          <CardBody>
            <h2 className="mb-3 font-display text-lg font-semibold">Post an announcement</h2>
            <ValidatedForm action={createAnnouncement} className="space-y-3">
              <Field label="Title" name="title" required>
                <Input name="title" required placeholder="Community meeting this Sunday" />
              </Field>
              <Field label="Details" name="body" required>
                <Textarea name="body" required placeholder="Let's plan the 2026 Ganesh Puja together. Everyone is welcome." />
              </Field>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Category" name="category">
                  <Select name="category" defaultValue="general">
                    <option value="general">General update</option>
                    <option value="meeting">Meeting</option>
                    <option value="aarti">Aarti</option>
                    <option value="bhajan">Bhajan</option>
                    <option value="event">Event</option>
                  </Select>
                </Field>
                <Field label="Starts at" name="happensAt" optional>
                  <Input name="happensAt" type="datetime-local" />
                </Field>
                <Field label="Ends at" name="endsAt" optional hint="Hides it from the homepage banner once past">
                  <Input name="endsAt" type="datetime-local" />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" name="pinned" className="h-4 w-4 rounded border-black/20" />
                Pin to the homepage &ldquo;happening soon&rdquo; banner
              </label>
              <SubmitButton pendingText="Posting…">Post announcement</SubmitButton>
            </ValidatedForm>
          </CardBody>
        </Card>
      )}

      {announcements.length === 0 ? (
        <EmptyState title="No updates yet" hint="Announcements from the committee will appear here." />
      ) : (
        <UpdatesFeed updates={updates} isAdmin={isAdmin} />
      )}
    </Container>
  );
}
