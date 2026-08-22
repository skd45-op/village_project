"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { notifyUsers } from "@/lib/notify";
import type { Module } from "@/generated/prisma/enums";

async function requireSuper() {
  const user = await getCurrentUser();
  if (user?.role !== "superadmin") throw new Error("Only Super Admin can manage permissions.");
  return user;
}

export async function promoteToAdmin(form: FormData) {
  await requireSuper();
  const userId = form.get("userId") as string;
  await prisma.user.update({ where: { id: userId }, data: { role: "admin" } });
  await notifyUsers([userId], "promoted", "You are now an Admin. Modules can be assigned to you.");
  revalidatePath("/admin/permissions");
}

export async function demoteToMember(form: FormData) {
  await requireSuper();
  const userId = form.get("userId") as string;
  await prisma.$transaction([
    prisma.adminPermission.deleteMany({ where: { userId } }),
    prisma.user.update({ where: { id: userId }, data: { role: "member" } }),
  ]);
  await notifyUsers([userId], "demoted", "Your admin access has been removed.");
  revalidatePath("/admin/permissions");
}

export async function toggleModule(form: FormData) {
  const grantedBy = await requireSuper();
  const userId = form.get("userId") as string;
  const mod = form.get("module") as Module;

  const existing = await prisma.adminPermission.findUnique({
    where: { userId_module: { userId, module: mod } },
  });

  if (existing) {
    await prisma.adminPermission.delete({ where: { id: existing.id } });
  } else {
    await prisma.adminPermission.create({
      data: { userId, module: mod, grantedById: grantedBy.id },
    });
  }
  revalidatePath("/admin/permissions");
}
