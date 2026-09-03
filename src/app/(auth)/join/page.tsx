import Link from "next/link";
import { JoinForm } from "./join-form";

export default function JoinPage() {
  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Are you our village people?</h1>
        <p className="mt-1 text-sm text-muted">
          Request membership — you&apos;ll get access once an admin approves.
        </p>
      </div>
      <JoinForm />
      <p className="text-center text-sm text-muted">
        Already a member?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
