"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canCreateInModule } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyAllMembers } from "@/lib/notify";
import { MEDIA_BUCKET } from "@/lib/constants";
import type { Module, MediaType, SessionStatus } from "@/generated/prisma/enums";

async function requireModule(module: Module) {
  const user = await getCurrentUser();
  if (!canCreateInModule(user, module)) throw new Error(`Not authorized for the ${module} module.`);
  return user!;
}

// Finds the year bucket (Session) for an occasion, creating it on first use.
// Users never interact with "sessions" directly — they're an internal year grouping.
async function getOrCreateSession(occasionId: string, year: number) {
  const nowYear = new Date().getFullYear();
  const status: SessionStatus = year > nowYear ? "upcoming" : year === nowYear ? "ongoing" : "completed";

  const existing = await prisma.session.findUnique({
    where: { occasionId_year: { occasionId, year } },
  });
  if (existing) return existing;

  return prisma.session.create({
    data: { occasionId, year, title: String(year), status },
  });
}

export async function createOccasion(form: FormData) {
  await requireModule("occasions");
  const name = (form.get("name") as string)?.trim();
  const description = ((form.get("description") as string) ?? "").trim() || null;
  const iconUrl = ((form.get("iconUrl") as string) ?? "").trim() || null;
  if (!name) throw new Error("Occasion name is required.");

  const occasion = await prisma.occasion.create({ data: { name, description, iconUrl } });
  revalidatePath("/occasions");
  redirect(`/occasions/${occasion.id}`);
}

// URL-based media (YouTube video / live stream). Photos use addPhotos instead.
export async function addMedia(form: FormData) {
  const user = await requireModule("media");
  const occasionId = form.get("occasionId") as string;
  const year = Number(form.get("year"));
  const type = form.get("type") as MediaType;
  const url = (form.get("url") as string)?.trim();
  if (!url) throw new Error("A URL is required.");
  if (!Number.isFinite(year) || year < 1900 || year > 2100) throw new Error("Invalid year.");

  const session = await getOrCreateSession(occasionId, year);

  await prisma.media.create({
    data: { sessionId: session.id, type, url, addedById: user.id },
  });

  if (type === "live") {
    await notifyAllMembers("live_started", "A live stream has started! 📺");
  }
  revalidatePath(`/occasions/${occasionId}`);
  redirect(`/occasions/${occasionId}?year=${year}`);
}

// Bulk-saves photos already uploaded to Supabase Storage (client sends the public URLs).
export async function addPhotos(occasionId: string, year: number, urls: string[]) {
  const user = await requireModule("media");
  if (!Number.isFinite(year) || year < 1900 || year > 2100) throw new Error("Invalid year.");
  const clean = (urls ?? []).map((u) => u?.trim()).filter(Boolean) as string[];
  if (clean.length === 0) throw new Error("No photos to save.");

  const session = await getOrCreateSession(occasionId, year);

  await prisma.media.createMany({
    data: clean.map((url) => ({
      sessionId: session.id,
      type: "photo" as MediaType,
      url,
      addedById: user.id,
    })),
  });

  revalidatePath(`/occasions/${occasionId}`);
  redirect(`/occasions/${occasionId}?year=${year}`);
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

  const media = await prisma.media.findUnique({ where: { id }, select: { url: true } });
  await prisma.media.delete({ where: { id } });

  // Remove the underlying file from Storage if it's one we uploaded (skip pasted/YouTube URLs).
  const path = media?.url ? storagePathFromPublicUrl(media.url) : null;
  if (path) {
    try {
      await createAdminClient().storage.from(MEDIA_BUCKET).remove([path]);
    } catch {
      // Best-effort cleanup — the DB row is already gone, don't fail the request.
    }
  }

  revalidatePath("/occasions");
}

// Extracts the object path from a Supabase public URL for our bucket, or null if
// the URL isn't a stored object (e.g. an old pasted image URL or a YouTube link).
function storagePathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  const path = url.slice(i + marker.length).split("?")[0];
  return path ? decodeURIComponent(path) : null;
}
