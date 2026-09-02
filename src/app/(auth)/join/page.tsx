import Link from "next/link";
import { Card, CardBody } from "@/components/ui/primitives";
import { JoinForm } from "./join-form";

export default function JoinPage() {
  return (
    <Card>
      <CardBody className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold">Are you our village people?</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Fill this in to request membership. You&apos;ll get access once an admin approves.
          </p>
        </div>
        <JoinForm />
        <p className="text-center text-sm text-neutral-500">
          Already a member?{" "}
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
