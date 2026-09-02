import Link from "next/link";
import { Card, CardBody } from "@/components/ui/primitives";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <Card>
      <CardBody className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-neutral-500">Members and committee.</p>
        </div>
        <LoginForm next={next ?? "/dashboard"} />
        <p className="text-center text-sm text-neutral-500">
          New here?{" "}
          <Link href="/join" className="font-medium text-brand-600 hover:underline">
            Request membership
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
