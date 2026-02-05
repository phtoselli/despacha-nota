import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const publicPaths = ["/login", "/register", "/verify-totp", "/api/auth/callback"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // Allow public paths
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    // If user is already logged in and verified, redirect to dashboard
    if (user && pathname === "/login") {
      const totpVerified = request.cookies.get("totp_verified")?.value === "true";
      if (totpVerified) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
    return supabaseResponse;
  }

  // Allow API routes that handle their own auth
  if (pathname.startsWith("/api/auth/")) {
    return supabaseResponse;
  }

  // Protect cron endpoint with secret
  if (pathname.startsWith("/api/cron/")) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== "Bearer " + process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return supabaseResponse;
  }

  // Require authentication for all other routes
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Require TOTP verification for dashboard routes
  if (!pathname.startsWith("/api/")) {
    const totpVerified = request.cookies.get("totp_verified")?.value === "true";
    if (!totpVerified && pathname !== "/verify-totp") {
      return NextResponse.redirect(new URL("/verify-totp", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
