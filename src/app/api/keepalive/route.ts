import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Tiny DB touch to keep the Supabase project from auto-pausing on inactivity.
// Point a scheduled ping (Vercel Cron, GitHub Action, or cron-job.org) at
// /api/keepalive every day or two.
export async function GET() {
  try {
    await prisma.$queryRaw`select 1`;
    return NextResponse.json({ ok: true, at: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "db unreachable" },
      { status: 503 },
    );
  }
}
