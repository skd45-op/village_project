"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canCreateInModule } from "@/lib/auth";
import { notifyUsers, reviewersForModule } from "@/lib/notify";
import type { ContactStatus } from "@/generated/prisma/enums";
import type { ActionState } from "@/lib/actions/auth";

export async function submitContact(_prev: ActionState, form: FormData): Promise<ActionState> {
  const name = ((form.get("name") as string) ?? "").trim();
  const email = ((form.get("email") as string) ?? "").trim() || null;
  const message = ((form.get("message") as string) ?? "").trim();

  if (!name || !message) return { error: "Please add your name and a message." };

  // Messages route to the committee: Super Admin + admins granted the Members module.
  await prisma.contactMessage.create({ data: { name, email, message, target: "general" } });
  const reviewers = await reviewersForModule("members");
  await notifyUsers(reviewers, "contact_message", `New contact message from ${name}.`);

  return { success: "Thanks! Your message has been sent to the committee." };
}

// Super Admin, or an admin holding the Members module, may triage messages.
async function requireContactAccess() {
  const user = await getCurrentUser();
  if (!user || !canCreateInModule(user, "members")) {
    throw new Error("You don't have access to contact messages.");
  }
  return user;
}

export async function setContactStatus(form: FormData) {
  await requireContactAccess();
  const id = form.get("id") as string;
  const status = form.get("status") as ContactStatus;
  await prisma.contactMessage.update({ where: { id }, data: { status } });
  revalidatePath("/admin/contact");
}
