import { NextRequest, NextResponse } from "next/server"

const crmSessionCookie = "crm_session"
const protectedPagePrefixes = ["/crm/dashboard", "/crm/table", "/crm/process"]
const protectedApiPrefixes = ["/api/crm"]
const publicApiPrefixes = ["/api/crm/auth"]

function isProtectedPath(pathname: string) {
  if (publicApiPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return false
  }

  return [...protectedPagePrefixes, ...protectedApiPrefixes].some((prefix) =>
    pathname.startsWith(prefix)
  )
}

async function verifySession(token: string | undefined) {
  const secret = process.env.CRM_SESSION_SECRET

  if (!secret || !token) {
    return false
  }

  const parts = token.split(".")

  if (parts.length !== 3 || parts[0] !== "authenticated") {
    return false
  }

  const payload = `${parts[0]}.${parts[1]}`
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload))
  const expected = Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")

  return expected === parts[2]
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!isProtectedPath(pathname)) {
    return NextResponse.next()
  }

  const isAuthed = await verifySession(
    request.cookies.get(crmSessionCookie)?.value
  )

  if (isAuthed) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 }
    )
  }

  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = "/crm/auth"
  loginUrl.searchParams.set("next", pathname)

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/crm/:path*", "/api/crm/:path*"],
}
