import { DashboardStats } from "@/components/crm/DashboardStats"
import { CrmShell } from "@/components/crm/CrmShell"
import { leadProcesses, toCrmLeadPayload } from "@/lib/crm"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function CrmDashboardPage() {
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

  return (
    <CrmShell>
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">
          Dashboard
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">
          Lead overview
        </h1>
      </div>
      <DashboardStats
        stats={{
          total,
          won,
          lost,
          averageScore: Math.round(aggregate._avg.score ?? 0),
          processCounts,
          recentLeads: recentLeads.map(toCrmLeadPayload),
        }}
      />
    </CrmShell>
  )
}
