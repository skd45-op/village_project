"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { notifyMemberReviewers } from "@/lib/notify";

export type ActionState = { error?: string; success?: string };

function str(form: FormData, key: string) {
  return (form.get(key) as string | null)?.trim() ?? "";
}

export async function register(_prev: ActionState, form: FormData): Promise<ActionState> {
  const email = str(form, "email").toLowerCase();
  const password = str(form, "password");
  const firstName = str(form, "firstName");
  const lastName = str(form, "lastName");
  const mobile = str(form, "mobile");
  const address = str(form, "address");
  const relation = str(form, "relation");
  const ageRaw = str(form, "age");
  const photoUrl = str(form, "photoUrl");

  if (!email || !password || !firstName || !lastName || !mobile) {
    return { error: "Please fill in name, email, password and mobile number." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };
  const authId = data.user?.id;
  if (!authId) return { error: "Could not create account. Try again." };

  const age = ageRaw ? Number(ageRaw) : null;

  // Create the pending profile + a membership request the reviewers can act on.
  const user = await prisma.user.create({
    data: {
      authId,
      email,
      firstName,
      lastName,
      mobile,
      address: address || null,
      age: Number.isFinite(age) ? age : null,
      photoUrl: photoUrl || null,
      role: "member",
      status: "pending",
    },
  });

  await prisma.membershipRequest.create({
    data: {
      userId: user.id,
      status: "pending",
      userSnapshot: { firstName, lastName, email, mobile, address, relation, age, photoUrl },
    },
  });

  await notifyMemberReviewers(
    `New membership request from ${firstName} ${lastName}.`,
  );

  redirect("/dashboard");
}

export async function login(_prev: ActionState, form: FormData): Promise<ActionState> {
  const email = str(form, "email").toLowerCase();
  const password = str(form, "password");
  const next = str(form, "next") || "/dashboard";

  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect(next);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

// Separate login for Super Admin. Signs in via Supabase, then verifies the
// role in our DB. If the account isn't superadmin, signs out immediately.
export async function loginSuperAdmin(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const email = str(form, "email").toLowerCase();
  const password = str(form, "password");

  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  const authId = data.user?.id;
  const dbUser = authId
    ? await prisma.user.findUnique({ where: { authId }, select: { role: true } })
    : null;

  if (dbUser?.role !== "superadmin") {
    await supabase.auth.signOut();
    return { error: "Access denied. This portal is for Super Admin only." };
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function setPreviewMode(role: "guest" | "member") {
  const user = await getCurrentUser();
  if (user?.role !== "superadmin") return;
  const cookieStore = await cookies();
  cookieStore.set("vp_preview", role, { path: "/", httpOnly: true, sameSite: "lax" });
  revalidatePath("/", "layout");
}

export async function clearPreviewMode() {
  const cookieStore = await cookies();
  cookieStore.delete("vp_preview");
  revalidatePath("/", "layout");
}
