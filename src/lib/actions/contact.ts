"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { notifySuperAdmins } from "@/lib/notify";
import type { ContactTarget, ContactStatus } from "@/generated/prisma/enums";
import type { ActionState } from "@/lib/actions/auth";

export async function submitContact(_prev: ActionState, form: FormData): Promise<ActionState> {
  const name = ((form.get("name") as string) ?? "").trim();
  const email = ((form.get("email") as string) ?? "").trim() || null;
  const message = ((form.get("message") as string) ?? "").trim();
  const target = ((form.get("target") as ContactTarget) || "general") as ContactTarget;

  if (!name || !message) return { error: "Please add your name and a message." };

  await prisma.contactMessage.create({ data: { name, email, message, target } });
  await notifySuperAdmins("contact_message", `New contact message from ${name}.`);

  return { success: "Thanks! Your message has been sent to the committee." };
}

export async function setContactStatus(form: FormData) {
  const user = await getCurrentUser();
  if (user?.role !== "superadmin") throw new Error("Only Super Admin can manage messages.");
  const id = form.get("id") as string;
  const status = form.get("status") as ContactStatus;
  await prisma.contactMessage.update({ where: { id }, data: { status } });
  revalidatePath("/admin/contact");
}
