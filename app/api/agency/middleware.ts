import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verify } from "jsonwebtoken";
import { redis } from "@/lib/redis";

export async function middleware(request: NextRequest) {
  // Skip middleware for login routes
  if (
    request.nextUrl.pathname === "/api/agency/auth/login" ||
    request.nextUrl.pathname === "/api/agency/auth/store-login"
  ) {
    return NextResponse.next();
  }

  const token = request.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    // Check Redis cache first for token validation
    const cacheKey = `token:${token}`;
    const cachedTokenData = await redis.get(cacheKey);

    let decoded;

    if (cachedTokenData) {
      // Use cached token data if available
      decoded = JSON.parse(cachedTokenData);
    } else {
      // Verify and cache the token if not in cache
      decoded = verify(token, process.env.JWT_SECRET || "your-secret-key");

      // Cache token data for 5 minutes (adjust TTL as needed)
      await redis.setex(
        cacheKey,
        300, // 5 minutes
        JSON.stringify(decoded)
      );
    }

    // Check if the token is for an agency or store
    if (decoded.type !== "agency" && decoded.type !== "store") {
      return NextResponse.json(
        { error: "Invalid token type" },
        { status: 403 }
      );
    }

    // Add rate limiting using Redis
    const rateLimitKey = `rate_limit:${decoded.type}:${decoded.id}`;
    const currentRequests = await redis.incr(rateLimitKey);

    // Set expiration if this is the first request in the window
    if (currentRequests === 1) {
      await redis.expire(rateLimitKey, 60); // 60-second window
    }

    // Check if rate limit exceeded (100 requests per minute)
    if (currentRequests > 100) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    // Add the decoded user info to the request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-type", decoded.type);

    if (decoded.type === "agency") {
      requestHeaders.set("x-agency-id", decoded.id);
      requestHeaders.set("x-agency-email", decoded.email);
      requestHeaders.set("x-agency-role", decoded.role || "");
    } else if (decoded.type === "store") {
      requestHeaders.set("x-store-id", decoded.id);
      requestHeaders.set("x-store-email", decoded.email);
      requestHeaders.set("x-agency-id", decoded.agencyId);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: "/api/agency/:path*",
};
