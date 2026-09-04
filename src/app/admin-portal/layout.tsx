import type { ReactNode } from "react";
import { OmMark } from "@/components/brand/om-mark";

export const dynamic = "force-dynamic";

export default function AdminPortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-brand-950 px-4 py-10">
      {/* Teal radial + rings, matching the member auth pages but darker/more restricted-feeling */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,#1a4739_0%,#0d2c24_50%,#050f0c_100%)]" />
      <div className="ring-field absolute inset-0" style={{ ["--rx" as string]: "50%", ["--ry" as string]: "10%" }} />
      <div className="orb orb-a right-[18%] top-[10%] h-56 w-56 bg-gold/20" />
      <div className="orb orb-b left-[12%] bottom-[16%] h-52 w-52 bg-terracotta/20" />

      <div className="relative mb-8 flex flex-col items-center text-center">
        <OmMark size="lg" className="mb-3 shadow-lg shadow-black/40" />
        <p className="eyebrow text-gold">Kundapur Admin</p>
      </div>

      <div className="relative w-full max-w-sm">{children}</div>

      <p className="relative mt-8 text-xs text-white/30">
        Restricted access — authorised personnel only.
      </p>
    </div>
  );
}
