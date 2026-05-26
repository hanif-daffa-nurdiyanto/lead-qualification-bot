import { NextRequest, NextResponse } from "next/server"

import {
  createCrmSessionToken,
  crmSessionCookie,
  validateCrmCredentials,
} from "@/lib/crm-auth"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export async function POST(request: NextRequest) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 }
    )
  }

  if (!isRecord(body)) {
    return NextResponse.json(
      { ok: false, error: "Invalid login payload." },
      { status: 400 }
    )
  }

  const username = typeof body.username === "string" ? body.username : ""
  const password = typeof body.password === "string" ? body.password : ""

  if (!validateCrmCredentials(username, password)) {
    return NextResponse.json(
      { ok: false, error: "Invalid username or password." },
      { status: 401 }
    )
  }

  const response = NextResponse.json({ ok: true })

  response.cookies.set(crmSessionCookie, createCrmSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  })

  return response
}
