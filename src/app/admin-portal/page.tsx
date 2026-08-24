import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminLoginForm } from "./admin-login-form";

export default async function AdminPortalPage() {
  const user = await getCurrentUser();
  if (user?.role === "superadmin") redirect("/admin");

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-black/50">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Admin Portal</h1>
        <p className="mt-1 text-sm text-slate-500">Super Admin access only.</p>
      </div>

      <AdminLoginForm />

      <p className="mt-6 text-center text-xs text-slate-700">
        Not an admin?{" "}
        <a href="/login" className="text-slate-500 hover:text-slate-400 transition">
          Member sign in →
        </a>
      </p>
    </div>
  );
}
