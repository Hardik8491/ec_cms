import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { validateApiKey } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for API key in API routes
  if (pathname.startsWith("/api/v1/")) {
    const apiKey = request.headers.get("x-api-key");
    console.log("API key:", apiKey);

    if (apiKey) {
      // Fix template literal and use full absolute URL for fetch
      const validationUrl = new URL("/api/validation-key", request.url);
      validationUrl.searchParams.set("key", apiKey);

      const response = await fetch(validationUrl.toString());

      if (response.ok) {
        const validApiKey = await response.json();

        // Add user and store info to request headers
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-user-id", validApiKey.userId)

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
      } else {
        return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
      }
    } else {
      return NextResponse.json({ error: "API key missing" }, { status: 400 });
    }
  }

  // Get the token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check if the user is authenticated
  const isAuthenticated = !!token;

  // Define protected routes based on user roles
  const adminRoutes = ["/admin"];
  const agencyRoutes = ["/agency"];
  const userRoutes = ["/dashboard", "/profile", "/stores"];
  const authRoutes = ["/auth/signin", "/auth/signup", "/auth/forgot-password"];

  // Redirect authenticated users away from auth pages
  if (
    isAuthenticated &&
    authRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Check if the route is protected
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isAgencyRoute = agencyRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isUserRoute = userRoutes.some((route) => pathname.startsWith(route));

  // If the route is protected and the user is not authenticated, redirect to login
  if ((isAdminRoute || isAgencyRoute || isUserRoute) && !isAuthenticated) {
    const redirectUrl = new URL("/auth/signin", request.url);
    redirectUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check role-based access
  if (isAuthenticated) {
    const userRole = token.role as string;

    // Admin routes are only accessible by admins
    if (isAdminRoute && userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Agency routes are only accessible by agencies
    if (isAgencyRoute && userRole !== "agency") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/agency/:path*",
    "/profile/:path*",
    "/stores/:path*",
    "/auth/:path*",
    "/api/v1/:path*",
  ],
};
