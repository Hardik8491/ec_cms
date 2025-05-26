import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { validateApiKey } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow OPTIONS preflight for API routes without auth check (CORS)
  if (request.method === "OPTIONS" && pathname.startsWith("/api/v1/")) {
    return NextResponse.next();
  }

  // API key validation for /api/v1 routes
  if (
    pathname.startsWith("/api/v1/") ||
    pathname.startsWith("/api/v1/stores")
  ) {
    const apiKey = request.headers.get("x-api-key");
    console.log("API Key Middleware Triggered", apiKey);

    if (!apiKey) {
      return NextResponse.json({ error: "API key missing" }, { status: 400 });
    }

    // Validate API key via your validation endpoint
    const validationUrl = new URL("/api/validation-key", request.url);
    validationUrl.searchParams.set("key", apiKey);

    const response = await fetch(validationUrl.toString());

    if (!response.ok) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const validApiKey = await response.json();

    // Add user/store info & permissions headers for downstream usage
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", validApiKey.userId);

    if (validApiKey.storeId) {
      requestHeaders.set("x-store-id", validApiKey.storeId);
    }

    if (validApiKey.permissions) {
      requestHeaders.set(
        "x-permissions",
        JSON.stringify(validApiKey.permissions)
      );
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Get NextAuth token for normal authenticated routes
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const isAuthenticated = !!token;

  // Define route groups by role/access
  const adminRoutes = ["/admin"];
  const agencyRoutes = ["/agency"];
  const userRoutes = ["/dashboard", "/profile", "/stores"];
  const authRoutes = ["/auth/signin", "/auth/signup", "/auth/forgot-password"];

  // Redirect logged-in users away from auth pages
  if (
    isAuthenticated &&
    authRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect admin/agency/user routes: redirect unauthenticated to signin
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isAgencyRoute = agencyRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isUserRoute = userRoutes.some((route) => pathname.startsWith(route));

  if ((isAdminRoute || isAgencyRoute || isUserRoute) && !isAuthenticated) {
    const redirectUrl = new URL("/auth/signin", request.url);
    redirectUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Role-based access control for authenticated users
  if (isAuthenticated) {
    const userRole = token.role as string;

    if (isAdminRoute && userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (isAgencyRoute && userRole !== "agency") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Let everything else pass through
  return NextResponse.next();
}

// Paths this middleware should run on
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/agency/:path*",
    "/profile/:path*",
    "/stores/:path*",
    "/auth/:path*",
    "/api/v1",
    "/api/v1/:path*",
    "/api/validation-key",
    "/api/validation-key/:path*",
    "/api/v1/stores/:storeId/products/:productId",
    "/api/v1/stores/:storeId/products/:productId/related",
    "/api/v1/stores/:storeId/products/:productId/variants",
    "/api/v1/stores/:storeId/products/:productId/variants/:variantId",
    "/api/v1/stores/:storeId/products/:productId/variants/:variantId/related",

  ],
};
