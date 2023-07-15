import { jwtVerify } from "jose"
import { NextResponse } from "next/server"

export async function middleware(request) {
  const base = new URL(request.url)
  if (request.method === "POST") {
    if (request.headers.get("sec-fetch-site") !== "same-origin") 
      return NextResponse.json({msg: "Forbiden"}, {status: 403})
    return NextResponse.next()
  }

  let status = "error"
  let verified = false
  const cookie = request.cookies.get("JWT-Token")
  try {
    const result = await jwtVerify(cookie.value, new TextEncoder().encode(process.env.ACCESS_TOKEN))
    status = "success"
    verified = result.payload.user.verified
  } catch {}

  if (status === "error") {
    if (["/auth/verify", "/post", "/settings"].includes(base.pathname)) 
      return NextResponse.redirect(`${base.origin}/auth/login`)
    return NextResponse.next()
  }

  if (!verified) {
    if (base.pathname !== "/auth/verify") return NextResponse.redirect(`${base.origin}/auth/verify`)
    return NextResponse.next()
  }

  if (["/auth/signup", "/auth/login", "/auth/verify", "/auth/forgot-password"].includes(base.pathname)) 
    return NextResponse.redirect(base.origin)
}

export const config = {
  matcher: [
    "/", 
    "/auth/:path*",
    "/post", 
    "/questions", 
    "/questions/:path*", 
    "/answers/:path*",
    "/tags",
    "/tags/:path*",
    "/users", 
    "/users/:path*",
    "/settings"
  ]
}