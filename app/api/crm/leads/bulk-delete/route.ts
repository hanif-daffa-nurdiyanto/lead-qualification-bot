import { NextRequest, NextResponse } from "next/server"

import { deleteAirtableLead } from "@/lib/airtable-leads"
import { prisma } from "@/lib/prisma"

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

  if (
    !isRecord(body) ||
    !Array.isArray(body.ids) ||
    body.ids.some((id) => typeof id !== "string")
  ) {
    return NextResponse.json(
      { ok: false, error: "Invalid bulk delete payload." },
      { status: 400 }
    )
  }

  const ids = [...new Set(body.ids as string[])]

  if (ids.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No leads selected." },
      { status: 400 }
    )
  }

  const leads = await prisma.lead.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  })

  await prisma.lead.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  })

  await Promise.allSettled(
    leads.map((lead) => deleteAirtableLead(lead.airtableRecordId))
  )

  return NextResponse.json({
    ok: true,
    ids,
  })
}
