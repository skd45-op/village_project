import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminLoginForm } from "./admin-login-form";

export default async function AdminPortalPage() {
  const user = await getCurrentUser();
  if (user?.role === "superadmin") redirect("/admin");

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-white">Admin Portal</h1>
        <p className="mt-1 text-sm text-white/50">Super Admin access only.</p>
      </div>

      <AdminLoginForm />
    </div>
  );
}
