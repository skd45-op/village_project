import { prisma } from "@/lib/prisma";
import { Card, CardBody, Alert } from "@/components/ui/primitives";
import { BootstrapForm } from "./bootstrap-form";

export default async function BootstrapPage() {
  const alreadyDone = (await prisma.user.count({ where: { role: "superadmin" } })) > 0;

  return (
    <Card>
      <CardBody className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold">Create the first Super Admin</h1>
          <p className="mt-1 text-sm text-neutral-500">
            One-time setup. Requires the server&apos;s bootstrap secret.
          </p>
        </div>
        {alreadyDone ? (
          <Alert tone="info">A Super Admin already exists — this page is disabled.</Alert>
        ) : (
          <BootstrapForm />
        )}
      </CardBody>
    </Card>
  );
}
