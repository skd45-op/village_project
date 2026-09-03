"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Prisma } from "@/generated/prisma/client";
import type { ActionState } from "@/lib/actions/auth";

async function requireSuperAdmin() {
  const user = await getCurrentUser();
  if (user?.role !== "superadmin") throw new Error("Only Super Admin can manage stock entries.");
  return user;
}

function parseFields(form: FormData) {
  const occasionId = form.get("occasionId") as string;
  const year = Number(form.get("year"));
  const amountDelta = Number(form.get("amountDelta"));
  const description = ((form.get("description") as string) ?? "").trim() || null;

  if (!occasionId || !Number.isFinite(year) || year < 1900 || year > 2100) {
    return { error: "A valid occasion and year are required." } as const;
  }
  if (!Number.isFinite(amountDelta) || amountDelta === 0) {
    return { error: "A non-zero amount is required." } as const;
  }
  return { occasionId, year, amountDelta, description };
}

// A P2002 unique-constraint violation on (occasionId, year) means a stock entry
// for that year already exists — surface a friendly inline message instead of a crash.
function isDuplicateYearError(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
}

export async function addStockEntry(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireSuperAdmin();
  const parsed = parseFields(form);
  if ("error" in parsed) return parsed;
  const { occasionId, year, amountDelta, description } = parsed;

  try {
    await prisma.stockEntry.create({
      data: { occasionId, year, amountDelta, description, addedById: user.id },
    });
  } catch (e) {
    if (isDuplicateYearError(e)) {
      return { error: `A stock entry for ${year} already exists for this occasion — edit that one instead.` };
    }
    throw e;
  }

  revalidatePath(`/budget/stock/${occasionId}`);
  revalidatePath("/budget");
  return { success: "Stock entry added." };
}

export async function updateStockEntry(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireSuperAdmin();
  const id = form.get("id") as string;
  const parsed = parseFields(form);
  if ("error" in parsed) return parsed;
  const { occasionId, year, amountDelta, description } = parsed;

  try {
    await prisma.stockEntry.update({
      where: { id },
      data: { year, amountDelta, description },
    });
  } catch (e) {
    if (isDuplicateYearError(e)) {
      return { error: `A stock entry for ${year} already exists for this occasion — edit that one instead.` };
    }
    throw e;
  }

  revalidatePath(`/budget/stock/${occasionId}`);
  revalidatePath("/budget");
  return { success: "Stock entry updated." };
}

export async function deleteStockEntry(form: FormData) {
  await requireSuperAdmin();
  const id = form.get("id") as string;
  const occasionId = form.get("occasionId") as string;

  await prisma.stockEntry.delete({ where: { id } });

  revalidatePath(`/budget/stock/${occasionId}`);
  revalidatePath("/budget");
}
