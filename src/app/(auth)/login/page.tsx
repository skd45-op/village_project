import Link from "next/link";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Sign in — members and committee.</p>
      </div>
      <LoginForm next={next ?? "/dashboard"} />
      <p className="text-center text-sm text-muted">
        New here?{" "}
        <Link href="/join" className="font-medium text-brand-600 hover:underline">
          Request membership
        </Link>
      </p>
    </div>
  );
}
