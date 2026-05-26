"use client"

import { motion } from "framer-motion"
import {
  IconChartBar,
  IconCircleCheck,
  IconCircleX,
  IconUsers,
} from "@tabler/icons-react"

import { Card, CardContent } from "@/components/ui/card"
import { ProcessBadge } from "@/components/crm/ProcessBadge"
import { formatDate, leadProcesses, type CrmLead } from "@/lib/crm"

type DashboardStatsProps = {
  stats: {
    total: number
    won: number
    lost: number
    averageScore: number
    processCounts: Record<string, number>
    recentLeads: CrmLead[]
  }
}

const metricCards = [
  {
    key: "total",
    label: "Total leads",
    icon: IconUsers,
  },
  {
    key: "averageScore",
    label: "Average score",
    icon: IconChartBar,
  },
  {
    key: "won",
    label: "Won",
    icon: IconCircleCheck,
  },
  {
    key: "lost",
    label: "Lost",
    icon: IconCircleX,
  },
] as const

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card, index) => {
          const Icon = card.icon

          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
            >
              <Card>
                <CardContent className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                      {card.label}
                    </p>
                    <p className="mt-3 font-heading text-4xl font-semibold">
                      {stats[card.key]}
                    </p>
                  </div>
                  <span className="flex size-11 items-center justify-center border bg-muted">
                    <Icon className="size-5" />
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardContent>
            <p className="text-sm font-semibold">Pipeline</p>
            <div className="mt-4 grid gap-3">
              {leadProcesses.map((process) => (
                <div
                  key={process}
                  className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
                >
                  <ProcessBadge process={process} />
                  <span className="font-heading text-2xl font-semibold">
                    {stats.processCounts[process] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className="text-sm font-semibold">Recent leads</p>
            <div className="mt-4 grid gap-3">
              {stats.recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="grid gap-3 border-b pb-3 last:border-b-0 last:pb-0 sm:grid-cols-[1fr_auto]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{lead.name}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {lead.company} - {lead.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:justify-end">
                    <ProcessBadge process={lead.process} />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(lead.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
              {stats.recentLeads.length === 0 && (
                <p className="text-sm text-muted-foreground">No leads yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
