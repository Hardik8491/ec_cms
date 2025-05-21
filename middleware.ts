import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequestWithAuth } from "next-auth/middleware";

// Define public routes that don't require authentication
const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/auth/error",
    "/auth/agency/register",
    "/auth/agency/login",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/agency/register",
    "/api/auth/check-role",
];

// Define admin-only routes
const adminRoutes = ["/dashboard/admin", "/dashboard/agencies", "/api/admin"];

// Define agency admin routes
const agencyAdminRoutes = [
    "/dashboard/agency",
    "/dashboard/agency/users",
    "/dashboard/agency/subscriptions",
    "/api/agency/users",
    "/api/agency/subscriptions",
];

export default async function middleware(request: NextRequestWithAuth) {
    const path = request.nextUrl.pathname;

    // Allow access to public routes
    if (publicRoutes.some((route) => path.startsWith(route))) {
        return NextResponse.next();
    }

    // Get the session token
    const token = await getToken({ req: request });

    // Redirect to login if no token is present
    if (!token) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Check role-based access
    if (adminRoutes.some((route) => path.startsWith(route))) {
        if (token.role !== "SUPER_ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    if (agencyAdminRoutes.some((route) => path.startsWith(route))) {
        if (token.role !== "AGENCY_ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    // Check store access for store users
    if (path.startsWith("/dashboard/store/")) {
        if (token.role === "AGENCY_USER") {
            const storeId = path.split("/")[3];
            if (storeId !== token.storeId) {
                return NextResponse.redirect(
                    new URL("/dashboard", request.url)
                );
            }
        }
    }

    return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!_next/static|_next/image|favicon.ico|public/).*)",
    ],
};
