import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{ name: string; value: string; options?: any }>,
        ) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if user account is suspended/deactivated
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("account_status, suspension_reason")
      .eq("id", user.id)
      .single();

    if (profile?.account_status === "suspended" || profile?.account_status === "deactivated") {
      // Sign out the user
      await supabase.auth.signOut();
      
      // Redirect to login with error message
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("error", "account_suspended");
      redirectUrl.searchParams.set("reason", profile.suspension_reason || "Your account has been suspended");
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Protected routes
  if (request.nextUrl.pathname.startsWith("/dashboard") && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Admin/cPanel routes protection
  if (request.nextUrl.pathname.startsWith("/cpanel")) {
    // Allow access to cPanel login page
    if (request.nextUrl.pathname === "/cpanel") {
      return supabaseResponse;
    }

    if (!user) {
      return NextResponse.redirect(new URL("/cpanel", request.url));
    }

    // Check admin role for organization routes
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/register") &&
    user
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}
