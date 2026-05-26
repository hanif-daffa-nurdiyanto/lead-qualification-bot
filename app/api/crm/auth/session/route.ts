import { NextResponse } from "next/server"

import { hasCrmSession } from "@/lib/crm-auth"

export async function GET() {
  return NextResponse.json({ ok: true, authenticated: await hasCrmSession() })
}
