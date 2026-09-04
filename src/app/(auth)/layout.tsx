import Link from "next/link";
import type { ReactNode } from "react";
import { OmMark } from "@/components/brand/om-mark";

export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* LEFT — teal radial design panel (hidden on mobile) */}
      <aside className="relative hidden overflow-hidden bg-brand-900 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_25%_15%,#1a4739_0%,#0d2c24_55%,#071c17_100%)]" />
        <div className="ring-field absolute inset-0" style={{ ["--rx" as string]: "72%", ["--ry" as string]: "30%" }} />
        <div className="orb orb-a right-[14%] top-[16%] h-64 w-64 bg-gold/25" />
        <div className="orb orb-b left-[6%] bottom-[14%] h-56 w-56 bg-brand-500/30" />
        <span aria-hidden className="pointer-events-none absolute -bottom-10 right-6 select-none font-display text-[18rem] leading-none text-white/[0.05]">
          ॐ
        </span>

        <Link href="/" className="relative flex items-center gap-2.5">
          <OmMark />
          <span className="font-semibold tracking-tight">Kundapur</span>
        </Link>

        <div className="relative">
          <p className="eyebrow mb-3 text-gold">Our place · Our people</p>
          <h2 className="font-display text-4xl font-semibold leading-tight">
            Welcome home to Kundapur.
          </h2>
          <p className="mt-3 max-w-sm text-white/70">
            Celebrations, photos, and the people behind them — kept in one shared place for our
            whole village.
          </p>
        </div>
      </aside>

      {/* RIGHT — form panel */}
      <main className="flex flex-col items-center justify-center bg-cream px-4 py-10">
        <Link href="/" className="mb-6 flex items-center gap-2.5 lg:hidden">
          <OmMark />
          <span className="font-semibold tracking-tight">Kundapur</span>
        </Link>
        {children}
      </main>
    </div>
  );
}
