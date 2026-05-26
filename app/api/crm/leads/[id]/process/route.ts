import { NextRequest, NextResponse } from "next/server"

import { isLeadProcess, toCrmLeadPayload } from "@/lib/crm"
import { updateAirtableLeadProcess } from "@/lib/airtable-leads"
import { prisma } from "@/lib/prisma"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 }
    )
  }

  if (!isRecord(body) || !isLeadProcess(body.process)) {
    return NextResponse.json(
      { ok: false, error: "Invalid process value." },
      { status: 400 }
    )
  }

  const lead = await prisma.lead.update({
    where: {
      id,
    },
    data: {
      process: body.process,
    },
  })

  try {
    await updateAirtableLeadProcess(lead.airtableRecordId, lead.process)
  } catch (error) {
    console.error("[crm] Airtable process sync failed", {
      leadId: lead.id,
      airtableRecordId: lead.airtableRecordId,
      process: lead.process,
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }

  return NextResponse.json({
    ok: true,
    lead: toCrmLeadPayload(lead),
  })
}
