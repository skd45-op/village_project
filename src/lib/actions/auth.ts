"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { notifyMemberReviewers } from "@/lib/notify";

export type ActionState = { error?: string; success?: string };

function str(form: FormData, key: string) {
  return (form.get(key) as string | null)?.trim() ?? "";
}

export async function register(_prev: ActionState, form: FormData): Promise<ActionState> {
  const email = str(form, "email").toLowerCase();
  const password = str(form, "password");
  const name = str(form, "name");
  const mobile = str(form, "mobile");
  const photoUrl = str(form, "photoUrl");

  if (!name || !email || !password || !mobile) {
    return { error: "Please fill in name, email, password and mobile number." };
  }
  if (!/^[0-9]{10}$/.test(mobile)) {
    return { error: "Mobile number must be exactly 10 digits." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  // Split a single "Full name" into first/last for our schema.
  const parts = name.split(/\s+/);
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };
  const authId = data.user?.id;
  if (!authId) return { error: "Could not create account. Try again." };

  // Create the pending profile + a membership request the reviewers can act on.
  const user = await prisma.user.create({
    data: {
      authId,
      email,
      firstName,
      lastName,
      mobile,
      photoUrl: photoUrl || null,
      role: "member",
      status: "pending",
    },
  });

  await prisma.membershipRequest.create({
    data: {
      userId: user.id,
      status: "pending",
      userSnapshot: { firstName, lastName, email, mobile, photoUrl },
    },
  });

  await notifyMemberReviewers(`New membership request from ${name}.`);

  redirect("/dashboard");
}

export async function login(_prev: ActionState, form: FormData): Promise<ActionState> {
  const email = str(form, "email").toLowerCase();
  const password = str(form, "password");
  const next = str(form, "next") || "/dashboard";

  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: friendlyAuthError(error) };

  revalidatePath("/", "layout");
  redirect(next);
}

// Supabase's raw auth error messages are written for developers, not members
// (e.g. "Email not confirmed" for a pending membership request). Translate the
// ones members are likely to hit into plain, reassuring language.
function friendlyAuthError(error: { message: string }): string {
  if (/email not confirmed/i.test(error.message)) {
    return "Your email isn't confirmed yet — our admin team will review and approve your membership within 1-2 days. Please try signing in again after that.";
  }
  if (/invalid login credentials/i.test(error.message)) {
    return "Incorrect email or password.";
  }
  return error.message;
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
