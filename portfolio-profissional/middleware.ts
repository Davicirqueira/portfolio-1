import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isPublicRoute = !nextUrl.pathname.startsWith("/admin")
  const isAuthPage = nextUrl.pathname.startsWith("/admin/login")

  // Allow API auth routes
  if (isApiAuthRoute) {
    return NextResponse.next()
  }

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Redirect to login if not authenticated and trying to access admin
  if (!isLoggedIn && !isAuthPage) {
    const callbackUrl = nextUrl.pathname + nextUrl.search
    const encodedCallbackUrl = encodeURIComponent(callbackUrl)
    return NextResponse.redirect(
      new URL(`/admin/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    )
  }

  // Redirect to dashboard if authenticated and on login page
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/admin/dashboard", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}