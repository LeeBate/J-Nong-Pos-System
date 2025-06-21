import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./lib/auth"

// Define protected routes
const protectedRoutes = ["/dashboard", "/sales", "/products", "/customers", "/reports", "/charts", "/admin", "/admin/users", "/admin/logs"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const token = request.cookies.get("auth-token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

  if (isProtectedRoute && !token) {
    console.log("Middleware - Redirecting to login (no token)")
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  if (token && isProtectedRoute) {
    const decoded = verifyToken(token)
    console.log("Middleware - Token valid:", !!decoded)

    if (!decoded) {
      console.log("Middleware - Redirecting to login (invalid token)")
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("auth-token")
      return response
    }

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-user-id", decoded.userId)
    requestHeaders.set("x-user-role", decoded.role)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  if (pathname === "/login" && token) {
    const decoded = verifyToken(token)
    if (decoded) {
      console.log("Middleware - Redirecting to dashboard (already logged in)")
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}