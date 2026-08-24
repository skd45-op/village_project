import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase session cookie on each request and performs a
// coarse redirect for unauthenticated users hitting protected routes.
// Fine-grained role/permission checks still happen server-side per action/page.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Routes that require a logged-in account.
  // Note: "/admin" is matched exactly + sub-routes to avoid catching "/admin-portal".
  const protectedPrefixes = ["/dashboard", "/budget", "/polls"];
  const isProtected =
    protectedPrefixes.some((p) => path.startsWith(p)) ||
    path === "/admin" ||
    path.startsWith("/admin/");

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return response;
}
