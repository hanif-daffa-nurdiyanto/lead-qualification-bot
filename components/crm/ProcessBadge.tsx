import type { LeadProcess, LeadStatus } from "@/lib/generated/prisma-client/client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const processClassNames: Record<LeadProcess | LeadStatus, string> = {
  New: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300",
  Qualified:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  Negotiation:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  Won: "border-lime-200 bg-lime-50 text-lime-700 dark:border-lime-900 dark:bg-lime-950 dark:text-lime-300",
  Lost: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300",
  Hot:  "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300",
  Warm: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  Cold: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300",
}

export function ProcessBadge({
  process,
  className,
}: {
  process: LeadProcess | LeadStatus
  className?: string
}) {
  return (
    <Badge className={cn(processClassNames[process], className)}>
      {process}
    </Badge>
  )
}
