"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canCreateInModule } from "@/lib/auth";
import type { BudgetType, DonationMode } from "@/generated/prisma/enums";

export async function addBudgetEntry(form: FormData) {
  const user = await getCurrentUser();
  if (!canCreateInModule(user, "budget")) throw new Error("Not authorized for the budget module.");

  const sessionId = form.get("sessionId") as string;
  const type = form.get("type") as BudgetType;
  const category = (form.get("category") as string)?.trim();
  const amount = Math.round(Number(form.get("amount")));
  const description = ((form.get("description") as string) ?? "").trim() || null;
  const receiptUrl = ((form.get("receiptUrl") as string) ?? "").trim() || null;

  if (!sessionId || !category || !Number.isFinite(amount) || amount <= 0) {
    throw new Error("Session, category and a positive amount are required.");
  }

  await prisma.budgetEntry.create({
    data: { sessionId, type, category, amount, description, receiptUrl, addedById: user!.id },
  });
  revalidatePath("/budget");
}

// Immutable ledger: never edit/delete an entry. Super Admin adds a linked
// correction instead (doc §2.4B).
export async function addCorrection(form: FormData) {
  const user = await getCurrentUser();
  if (user?.role !== "superadmin") throw new Error("Only Super Admin can add corrections.");

  const originalEntryId = form.get("originalEntryId") as string;
  const amountDelta = Number(form.get("amountDelta"));
  const reason = (form.get("reason") as string)?.trim();
  if (!originalEntryId || !Number.isFinite(amountDelta) || amountDelta === 0) {
    throw new Error("A non-zero correction amount is required.");
  }
  if (!reason) throw new Error("A reason is required for corrections.");

  await prisma.budgetCorrection.create({
    data: { originalEntryId, amountDelta, reason, addedById: user.id },
  });
  revalidatePath("/budget");
  revalidatePath("/admin/corrections");
}

export async function addDonation(form: FormData) {
  const user = await getCurrentUser();
  if (!canCreateInModule(user, "budget")) throw new Error("Not authorized for the budget module.");

  const sessionId = form.get("sessionId") as string;
  const memberId = form.get("memberId") as string;
  const amount = Number(form.get("amount"));
  const mode = form.get("mode") as DonationMode;
  const dateRaw = (form.get("date") as string) || "";
  const receiptNo = ((form.get("receiptNo") as string) ?? "").trim() || null;

  if (!sessionId || !memberId || !Number.isFinite(amount) || amount <= 0) {
    throw new Error("Member, session and a positive amount are required.");
  }

  await prisma.donation.create({
    data: { sessionId, memberId, amount, mode, receiptNo, date: dateRaw ? new Date(dateRaw) : new Date() },
  });
  revalidatePath("/budget");
}
