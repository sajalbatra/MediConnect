import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  // Skip middleware for auth routes, root, static files
  if (
    request.nextUrl.pathname.startsWith("/api/auth") ||
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/favicon")
  ) {
    return NextResponse.next()
  }

  // Apply token verification to API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const authHeader = request.headers.get("authorization")
    
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7).trim()

    if (!token) {
      return NextResponse.json({ error: "Invalid token format" }, { status: 401 })
    }

    try {
      const payload = verifyToken(token)
      
      // Check if payload is null, undefined, or doesn't have required properties
      if (!payload || typeof payload !== 'object') {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }

      // Ensure required properties exist
      if (!payload.userId || !payload.role || !payload.email) {
        return NextResponse.json({ error: "Invalid token payload" }, { status: 401 })
      }

      // Create new headers with user info
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set("x-user-id", String(payload.userId))
      requestHeaders.set("x-user-role", String(payload.role))
      requestHeaders.set("x-user-email", String(payload.email))

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error) {
      console.error("Token verification error:", error)
      return NextResponse.json({ error: "Token verification failed" }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/api/:path*",
    "/doctor/:path*",
    "/patient/:path*",
    "/profile/:path*",
    "/analytics/:path*",
  ],
};
