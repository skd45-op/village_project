import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase session cookie on each request and performs a
// coarse redirect for unauthenticated users hitting protected routes.
// Fine-grained role/permission checks still happen server-side per action/page.
export async function updateSession(request: NextRequest) {
  // Never trust a client-supplied value for this header — it's the only
  // channel getCurrentUser() uses to skip its own auth.getUser() call, so a
  // forged one would let a request claim any identity.
  request.headers.delete("x-app-auth-id");

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

  // Thread the already-verified identity through to the RSC render so
  // getCurrentUser() doesn't have to make its own redundant auth.getUser()
  // network call — NextResponse.next() snapshots request.headers at
  // construction time, so we rebuild it here to actually carry the header,
  // copying forward any session-refresh cookies setAll already staged.
  if (user) request.headers.set("x-app-auth-id", user.id);
  const finalResponse = NextResponse.next({ request });
  response.cookies.getAll().forEach((c) => finalResponse.cookies.set(c));
  response = finalResponse;

  const path = request.nextUrl.pathname;

  // Super Admin login lives at /admin/login (public). Serve the dark portal page
  // there via a rewrite so it isn't caught by the /admin/* auth redirect below,
  // and canonicalize the old /admin-portal URL to /admin/login.
  if (path === "/admin/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin-portal";
    return NextResponse.rewrite(url);
  }
  if (path === "/admin-portal") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // Routes that require a logged-in account.
  // Note: "/admin" is matched exactly + sub-routes to avoid catching "/admin-portal".
  const protectedPrefixes = ["/dashboard", "/budget", "/polls", "/profile"];
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
