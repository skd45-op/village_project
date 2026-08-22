"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionState } from "@/lib/actions/auth";

// One-time creation of the first Super Admin. Guarded by BOOTSTRAP_SECRET so it
// can't be triggered by the public. Uses the service-role client to create a
// confirmed auth user (no email round-trip needed).
export async function bootstrapSuperAdmin(_prev: ActionState, form: FormData): Promise<ActionState> {
  const secret = (form.get("secret") as string | null)?.trim() ?? "";
  const email = ((form.get("email") as string | null)?.trim() ?? "").toLowerCase();
  const password = (form.get("password") as string | null)?.trim() ?? "";
  const firstName = (form.get("firstName") as string | null)?.trim() ?? "";
  const lastName = (form.get("lastName") as string | null)?.trim() ?? "";

  if (!process.env.BOOTSTRAP_SECRET) {
    return { error: "BOOTSTRAP_SECRET is not set on the server." };
  }
  if (secret !== process.env.BOOTSTRAP_SECRET) {
    return { error: "Invalid bootstrap secret." };
  }
  if (!email || !password || !firstName || !lastName) {
    return { error: "Fill in name, email and password." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const existing = await prisma.user.count({ where: { role: "superadmin" } });
  if (existing > 0) {
    return { error: "A Super Admin already exists. Bootstrap is disabled." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) return { error: error.message };
  const authId = data.user?.id;
  if (!authId) return { error: "Could not create the auth user." };

  await prisma.user.create({
    data: {
      authId,
      email,
      firstName,
      lastName,
      role: "superadmin",
      status: "active",
    },
  });

  redirect("/login");
}
