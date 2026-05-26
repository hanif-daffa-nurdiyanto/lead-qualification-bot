"use client"

import { IconEye, IconMail } from "@tabler/icons-react"

import { createContactHref } from "@/components/crm/lead-actions"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { CrmLead } from "@/lib/crm"

export function LeadActionButtons({
  lead,
  onView,
}: {
  lead: CrmLead
  onView: (lead: CrmLead) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            aria-label={`View ${lead.name}`}
            onClick={() => onView(lead)}
          >
            <IconEye />
          </Button>
        </TooltipTrigger>
        <TooltipContent>View detail</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            asChild
            variant="outline"
            size="icon-xs"
            aria-label={`Contact ${lead.name}`}
          >
            <a href={createContactHref(lead)}>
              <IconMail />
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Contact by email</TooltipContent>
      </Tooltip>
    </div>
  )
}
