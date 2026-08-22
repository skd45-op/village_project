"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canCreateInModule } from "@/lib/auth";
import { notifyUsers } from "@/lib/notify";

async function requireReviewer() {
  const user = await getCurrentUser();
  if (!canCreateInModule(user, "members")) {
    throw new Error("Not authorized to review membership requests.");
  }
  return user!;
}

export async function approveRequest(form: FormData) {
  const reviewer = await requireReviewer();
  const requestId = form.get("requestId") as string;

  const req = await prisma.membershipRequest.findUnique({ where: { id: requestId } });
  if (!req) throw new Error("Request not found.");

  await prisma.$transaction([
    prisma.membershipRequest.update({
      where: { id: requestId },
      data: { status: "approved", reviewedById: reviewer.id, reviewedAt: new Date() },
    }),
    ...(req.userId
      ? [
          prisma.user.update({
            where: { id: req.userId },
            data: { status: "active", role: "member" },
          }),
        ]
      : []),
  ]);

  if (req.userId) {
    await notifyUsers([req.userId], "membership_approved", "Your membership has been approved. Welcome! 🎉");
  }
  revalidatePath("/admin/members");
}

export async function rejectRequest(form: FormData) {
  const reviewer = await requireReviewer();
  const requestId = form.get("requestId") as string;
  const note = ((form.get("note") as string | null) ?? "").trim() || null;

  const req = await prisma.membershipRequest.findUnique({ where: { id: requestId } });
  if (!req) throw new Error("Request not found.");

  await prisma.$transaction([
    prisma.membershipRequest.update({
      where: { id: requestId },
      data: { status: "rejected", adminNote: note, reviewedById: reviewer.id, reviewedAt: new Date() },
    }),
    ...(req.userId
      ? [prisma.user.update({ where: { id: req.userId }, data: { status: "rejected" } })]
      : []),
  ]);

  if (req.userId) {
    await notifyUsers(
      [req.userId],
      "membership_rejected",
      note ? `Your membership request was declined: ${note}` : "Your membership request was declined.",
    );
  }
  revalidatePath("/admin/members");
}

export async function needsInfoRequest(form: FormData) {
  const reviewer = await requireReviewer();
  const requestId = form.get("requestId") as string;
  const note = ((form.get("note") as string | null) ?? "").trim();
  if (!note) throw new Error("Please add a note explaining what's needed.");

  const req = await prisma.membershipRequest.update({
    where: { id: requestId },
    data: { status: "needs_info", adminNote: note, reviewedById: reviewer.id, reviewedAt: new Date() },
  });

  if (req.userId) {
    await notifyUsers([req.userId], "membership_needs_info", `More info needed: ${note}`);
  }
  revalidatePath("/admin/members");
}

// Super Admin manual delete of a rejected request (no auto-retention policy).
export async function deleteRequest(form: FormData) {
  const user = await getCurrentUser();
  if (user?.role !== "superadmin") throw new Error("Only Super Admin can delete requests.");
  const requestId = form.get("requestId") as string;
  await prisma.membershipRequest.delete({ where: { id: requestId } });
  revalidatePath("/admin/members");
}
