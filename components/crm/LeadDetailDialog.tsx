"use client"

import { IconMail } from "@tabler/icons-react"

import { ProcessBadge } from "@/components/crm/ProcessBadge"
import { createContactHref } from "@/components/crm/lead-actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDate, type CrmLead } from "@/lib/crm"

export function LeadDetailDialog({
  lead,
  open,
  onOpenChange,
}: {
  lead: CrmLead | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!lead) {
    return null
  }

  const detailItems = [
    ["Name", lead.name],
    ["Email", lead.email],
    ["Company", lead.company],
    ["Industry", lead.industry],
    ["Budget", lead.budget],
    ["Timeline", lead.timeline],
    ["Score", String(lead.score)],
    ["Status", lead.status],
    ["Process", lead.process],
    ["Source", lead.source],
    ["Created", formatDate(lead.createdAt)],
    ["Updated", formatDate(lead.updatedAt)],
  ]

  const hiddenFields = [
    "Updated",
    "Name",
    "Email",
    "Company",
    "Status",
    "Process",
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{lead.name}</DialogTitle>
          <DialogDescription>
            {lead.company} - {lead.email}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 px-5 py-5">
          <div className="flex flex-wrap gap-2">
            <ProcessBadge process={lead.status} />
            <ProcessBadge process={lead.process} />
          </div>

          <div className="border p-4">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Pain point
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {lead.painPoint}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {detailItems
              .filter(([label]) => !hiddenFields.includes(label))
              .map(([label, value]) => (
                <div key={label} className="border p-3">
                  <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    {label}
                  </p>
                  <p className="mt-2 text-sm leading-6 wrap-break-word">
                    {value}
                  </p>
                </div>
              ))}
          </div>
        </div>

        <DialogFooter>
          <Button asChild>
            <a href={createContactHref(lead)}>
              <IconMail data-icon="inline-start" />
              Contact
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
