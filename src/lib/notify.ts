import { prisma } from "@/lib/prisma";
import type { Module } from "@/generated/prisma/enums";

// In-app notifications. Email (Resend) is a later enhancement — the doc lists
// email + in-app; this covers the in-app half and is the single choke point
// to add email delivery to.

export async function notifyUsers(userIds: string[], type: string, message: string) {
  if (userIds.length === 0) return;
  await prisma.notification.createMany({
    data: userIds.map((userId) => ({ userId, type, message })),
  });
}

// Everyone who can act on a module: super admins + admins holding that module.
export async function reviewersForModule(module: Module): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: {
      status: "active",
      OR: [{ role: "superadmin" }, { role: "admin", permissions: { some: { module } } }],
    },
    select: { id: true },
  });
  return users.map((u) => u.id);
}

export async function notifyMemberReviewers(message: string) {
  const ids = await reviewersForModule("members");
  await notifyUsers(ids, "membership_request", message);
}

export async function notifySuperAdmins(type: string, message: string) {
  const supers = await prisma.user.findMany({
    where: { role: "superadmin", status: "active" },
    select: { id: true },
  });
  await notifyUsers(supers.map((u) => u.id), type, message);
}

// Broadcast to all active members+ (new poll, new session, live stream, etc.)
export async function notifyAllMembers(type: string, message: string) {
  const members = await prisma.user.findMany({
    where: { status: "active", role: { in: ["member", "admin", "superadmin"] } },
    select: { id: true },
  });
  await notifyUsers(members.map((u) => u.id), type, message);
}
