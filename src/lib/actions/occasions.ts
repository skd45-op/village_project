"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canCreateInModule } from "@/lib/auth";
import { notifyAllMembers } from "@/lib/notify";
import type { Module, MediaType, SessionStatus } from "@/generated/prisma/enums";

async function requireModule(module: Module) {
  const user = await getCurrentUser();
  if (!canCreateInModule(user, module)) throw new Error(`Not authorized for the ${module} module.`);
  return user!;
}

export async function createOccasion(form: FormData) {
  await requireModule("occasions");
  const name = (form.get("name") as string)?.trim();
  const description = ((form.get("description") as string) ?? "").trim() || null;
  const iconUrl = ((form.get("iconUrl") as string) ?? "").trim() || null;
  if (!name) throw new Error("Occasion name is required.");

  const occasion = await prisma.occasion.create({ data: { name, description, iconUrl } });
  revalidatePath("/occasions");
  redirect(`/occasions/${occasion.id}/new`);
}

export async function createSession(form: FormData) {
  await requireModule("occasions");
  const occasionId = form.get("occasionId") as string;
  const title = (form.get("title") as string)?.trim();
  const year = Number(form.get("year"));
  const status = (form.get("status") as SessionStatus) || "upcoming";
  const startDate = (form.get("startDate") as string) || "";
  const endDate = (form.get("endDate") as string) || "";
  if (!title || !Number.isFinite(year)) throw new Error("Title and year are required.");

  const session = await prisma.session.create({
    data: {
      occasionId,
      title,
      year,
      status,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  await notifyAllMembers("new_session", `New session added: ${title}.`);
  revalidatePath("/occasions");
  redirect(`/occasions/${occasionId}/${session.id}`);
}

export async function addMedia(form: FormData) {
  const user = await requireModule("media");
  const sessionId = form.get("sessionId") as string;
  const type = form.get("type") as MediaType;
  const url = (form.get("url") as string)?.trim();
  if (!url) throw new Error("A URL is required.");

  await prisma.media.create({
    data: { sessionId, type, url, addedById: user.id },
  });

  if (type === "live") {
    await notifyAllMembers("live_started", "A live stream has started! 📺");
  }
  revalidatePath(`/occasions`);
  revalidatePath(`/occasions/${form.get("occasionId")}/${sessionId}`);
}

// Media-module admin flags a locked record for Super Admin to correct (doc §2.4A).
export async function flagMedia(form: FormData) {
  await requireModule("media");
  const id = form.get("mediaId") as string;
  const note = ((form.get("note") as string) ?? "").trim();
  await prisma.media.update({
    where: { id },
    data: { correctionFlag: "flagged", correctionNote: note || "Needs correction" },
  });
  revalidatePath("/occasions");
}

// Only Super Admin can delete (governance: Admins create only).
export async function deleteMedia(form: FormData) {
  const user = await getCurrentUser();
  if (user?.role !== "superadmin") throw new Error("Only Super Admin can delete media.");
  const id = form.get("mediaId") as string;
  await prisma.media.delete({ where: { id } });
  revalidatePath("/occasions");
}
