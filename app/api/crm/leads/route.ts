import { NextResponse } from "next/server"

import { toCrmLeadPayload } from "@/lib/crm"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const leads = await prisma.lead.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })

  return NextResponse.json({
    ok: true,
    leads: leads.map(toCrmLeadPayload),
  })
}
