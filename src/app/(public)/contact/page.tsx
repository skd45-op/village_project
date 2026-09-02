import { PageHeader, Card, CardBody } from "@/components/ui/primitives";
import { ContactForm } from "./contact-form";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <PageHeader title="Contact us" subtitle="Send a message to the committee" />
        <Card>
          <CardBody>
            <ContactForm />
          </CardBody>
        </Card>
      </div>

      <div>
        <PageHeader title="Who receives your message?" subtitle="Messages go directly to our admin team" />
        <Card>
          <CardBody className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👥</span>
              <div>
                <p className="font-semibold">Village Admin Team</p>
                <p className="text-sm text-neutral-500">
                  Our committee reviews all messages and responds within 1–2 days.
                </p>
              </div>
            </div>
            <p className="text-xs text-neutral-400">
              No personal phone numbers or emails are shared publicly.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
