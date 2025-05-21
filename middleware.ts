import { type NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl
  const host = req.headers.get("host") || ""
  const subdomain = getSubdomain(host)

  // Public routes accessible without authentication
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname === "/"
  ) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Admin routes
  if (pathname.startsWith("/admin") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // Agency routes
  if (pathname.startsWith("/agency")) {
    if (token.role !== "agency" && token.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    // If agency user, check if they're accessing their own subdomain
    if (token.role === "agency" && subdomain && token.agencySubdomain !== subdomain) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  // User routes
  if (pathname.startsWith("/user") && token.role !== "user" && token.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // Add subdomain context to request
  if (subdomain) {
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-subdomain", subdomain)
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

// Helper function to extract subdomain from host
function getSubdomain(host: string): string | null {
  // Skip for localhost or direct domain access
  if (host.includes("localhost") || !host.includes(".")) return null

  const hostParts = host.split(".")
  if (hostParts.length > 2) {
    return hostParts[0]
  }
  return null
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
