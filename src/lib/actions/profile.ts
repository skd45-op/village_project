"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import type { ActionState } from "@/lib/actions/auth";

function str(form: FormData, key: string) {
  return (form.get(key) as string | null)?.trim() ?? "";
}

// Lets the logged-in user update their own profile (photo, contact details).
// They can re-upload a new photo as many times as they like.
export async function updateProfile(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "You must be signed in." };

  const mobile = str(form, "mobile");
  const address = str(form, "address");
  const ageRaw = str(form, "age");
  const photoUrl = str(form, "photoUrl");

  if (!mobile) return { error: "Mobile number is required." };

  const age = ageRaw ? Number(ageRaw) : null;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      mobile,
      address: address || null,
      age: age !== null && Number.isFinite(age) ? age : null,
      photoUrl: photoUrl || null,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/members");
  return { success: "Profile updated." };
}
