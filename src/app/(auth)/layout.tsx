import Link from "next/link";
import type { ReactNode } from "react";
import { OmMark } from "@/components/brand/om-mark";

export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="paper flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-6 flex items-center gap-2.5">
        <OmMark />
        <span className="leading-tight">
          <span className="block font-semibold tracking-tight">Kundapur</span>
          <span className="block text-[0.62rem] font-medium uppercase tracking-[0.18em] text-muted">
            Village Connect
          </span>
        </span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
