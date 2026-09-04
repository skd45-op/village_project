import { cache } from "react";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { Module, Role } from "@/generated/prisma/enums";

// Resolve the logged-in Supabase auth user to our app User (with role/permissions).
// Wrapped in React `cache` so it runs once per request.
export const getCurrentUser = cache(async () => {
  // proxy.ts already called supabase.auth.getUser() for this request and
  // threads the verified id through this header — reuse it instead of
  // paying for a second Supabase Auth network round-trip. Falls back to a
  // direct check only for request paths the proxy matcher doesn't cover.
  let authId = (await headers()).get("x-app-auth-id");

  if (!authId) {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    authId = authUser?.id ?? null;
  }

  if (!authId) return null;

  const user = await prisma.user.findUnique({
    where: { authId },
    include: { permissions: true },
  });

  return user;
});

type AppUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export function isSuperAdmin(user: AppUser | null): boolean {
  return user?.role === "superadmin";
}

export function isMemberOrAbove(user: AppUser | null): boolean {
  return (
    user?.status === "active" &&
    (["member", "admin", "superadmin"] as Role[]).includes(user.role)
  );
}

// Governance: an action is allowed to CREATE in a module if the user is
// Super Admin, or an active Admin holding that specific module permission.
export function canCreateInModule(user: AppUser | null, module: Module): boolean {
  if (!user || user.status !== "active") return false;
  if (user.role === "superadmin") return true;
  if (user.role !== "admin") return false;
  return user.permissions.some((p) => p.module === module);
}
