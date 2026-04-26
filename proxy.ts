import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const protectedRoutes = ["/dashboard", "/onboarding"]
const publicRoutes = ["/", "/login"]

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r))
  const isPublic = publicRoutes.includes(pathname)

  if (isProtected && !req.auth) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  if (isPublic && req.auth && (pathname === "/login" || pathname === "/")) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
}
