"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { notifyAllMembers } from "@/lib/notify";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    throw new Error("Only admins can manage announcements.");
  }
  return user;
}

const CATEGORIES = ["general", "meeting", "aarti", "bhajan", "event"];

export async function createAnnouncement(form: FormData) {
  const user = await requireAdmin();

  const title = (form.get("title") as string)?.trim();
  const body = (form.get("body") as string)?.trim();
  const categoryRaw = (form.get("category") as string)?.trim() || "general";
  const category = CATEGORIES.includes(categoryRaw) ? categoryRaw : "general";
  const happensAtRaw = (form.get("happensAt") as string)?.trim();
  const pinned = form.get("pinned") === "on";

  if (!title || !body) throw new Error("Title and details are required.");

  const happensAt = happensAtRaw ? new Date(happensAtRaw) : null;

  await prisma.announcement.create({
    data: {
      title,
      body,
      category,
      happensAt: happensAt && !isNaN(happensAt.getTime()) ? happensAt : null,
      pinned,
      createdById: user.id,
    },
  });

  await notifyAllMembers("announcement", `New announcement: ${title}`);

  revalidatePath("/updates");
  revalidatePath("/");
  redirect("/updates");
}

export async function deleteAnnouncement(form: FormData) {
  await requireAdmin();
  const id = form.get("id") as string;
  await prisma.announcement.delete({ where: { id } });
  revalidatePath("/updates");
  revalidatePath("/");
}
