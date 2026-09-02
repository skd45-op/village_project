import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader, Card, CardBody } from "@/components/ui/primitives";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile");

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="My Profile"
        subtitle={`${user.firstName} ${user.lastName} · ${user.email}`}
      />
      <Card>
        <CardBody>
          <ProfileForm
            photoUrl={user.photoUrl}
            mobile={user.mobile ?? ""}
            address={user.address ?? ""}
            age={user.age}
          />
        </CardBody>
      </Card>
    </div>
  );
}
