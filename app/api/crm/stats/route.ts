import { NextResponse } from "next/server"

import { leadProcesses, toCrmLeadPayload } from "@/lib/crm"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const [total, byProcess, won, lost, aggregate, recentLeads] =
    await Promise.all([
      prisma.lead.count(),
      prisma.lead.groupBy({
        by: ["process"],
        _count: {
          _all: true,
        },
      }),
      prisma.lead.count({ where: { process: "Won" } }),
      prisma.lead.count({ where: { process: "Lost" } }),
      prisma.lead.aggregate({
        _avg: {
          score: true,
        },
      }),
      prisma.lead.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 6,
      }),
    ])

  const processCounts = Object.fromEntries(
    leadProcesses.map((process) => [process, 0])
  )

  for (const item of byProcess) {
    processCounts[item.process] = item._count._all
  }

  return NextResponse.json({
    ok: true,
    stats: {
      total,
      won,
      lost,
      averageScore: Math.round(aggregate._avg.score ?? 0),
      processCounts,
      recentLeads: recentLeads.map(toCrmLeadPayload),
    },
  })
}
