"use client"

import { DragEvent, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { LeadActionButtons } from "@/components/crm/LeadActionButtons"
import { LeadDetailDialog } from "@/components/crm/LeadDetailDialog"
import { ProcessBadge } from "@/components/crm/ProcessBadge"
import { TooltipProvider } from "@/components/ui/tooltip"
import { formatDate, leadProcesses, type CrmLead } from "@/lib/crm"
import { cn } from "@/lib/utils"
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react"

type ProcessBoardProps = {
  leads: CrmLead[]
}

export function ProcessBoard({ leads: initialLeads }: ProcessBoardProps) {
  const [leads, setLeads] = useState(initialLeads)
  const [draggingId, setDraggingId] = useState("")
  const [activeProcess, setActiveProcess] = useState("")
  const [openMobileProcesses, setOpenMobileProcesses] = useState<
    CrmLead["process"][]
  >(["New"])
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null)
  const [error, setError] = useState("")

  const groupedLeads = useMemo(() => {
    return Object.fromEntries(
      leadProcesses.map((process) => [
        process,
        leads.filter((lead) => lead.process === process),
      ])
    ) as Record<CrmLead["process"], CrmLead[]>
  }, [leads])

  const updateProcess = async (leadId: string, process: CrmLead["process"]) => {
    const previousLeads = leads
    setError("")
    setLeads((current) =>
      current.map((lead) => (lead.id === leadId ? { ...lead, process } : lead))
    )

    try {
      const response = await fetch(`/api/crm/leads/${leadId}/process`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ process }),
      })
      const payload = (await response.json()) as
        | { ok: true; lead: CrmLead }
        | { ok: false; error: string }

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.ok ? "Unable to update process." : payload.error
        )
      }

      setLeads((current) =>
        current.map((lead) => (lead.id === leadId ? payload.lead : lead))
      )
      setSelectedLead((current) =>
        current?.id === leadId ? payload.lead : current
      )
    } catch (caughtError) {
      setLeads(previousLeads)
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update process."
      )
    }
  }

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
    process: CrmLead["process"]
  ) => {
    event.preventDefault()
    const leadId = event.dataTransfer.getData("text/plain") || draggingId
    setDraggingId("")
    setActiveProcess("")

    if (!leadId) {
      return
    }

    void updateProcess(leadId, process)
  }

  const toggleMobileProcess = (process: CrmLead["process"]) => {
    setOpenMobileProcesses((current) =>
      current.includes(process)
        ? current.filter((currentProcess) => currentProcess !== process)
        : [...current, process]
    )
  }

  return (
    <TooltipProvider>
      <div className="grid min-w-0 gap-4">
        {error && (
          <div className="border bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="grid min-w-0 gap-4 xl:w-max xl:min-w-full xl:grid-cols-5 xl:[grid-template-columns:repeat(5,minmax(17rem,1fr))]">
          {leadProcesses.map((process) => {
            const isOpenOnMobile = openMobileProcesses.includes(process)

            return (
              <div
                key={process}
                onDragOver={(event) => {
                  event.preventDefault()
                  setActiveProcess(process)
                }}
                onDragLeave={() => setActiveProcess("")}
                onDrop={(event) => handleDrop(event, process)}
                className={cn(
                  "min-w-0 border bg-background p-3 transition xl:min-h-80",
                  isOpenOnMobile && "min-h-80",
                  activeProcess === process && "border-primary bg-primary/5"
                )}
              >
                <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
                  <ProcessBadge process={process} />
                  <button
                    type="button"
                    aria-expanded={isOpenOnMobile}
                    onClick={() => toggleMobileProcess(process)}
                    className="flex h-8 shrink-0 items-center gap-2 border px-2 text-sm font-semibold transition hover:bg-muted xl:pointer-events-none xl:border-0 xl:px-0 xl:hover:bg-transparent"
                  >
                    {groupedLeads[process].length}
                    <span className="xl:hidden">
                      {isOpenOnMobile ? (
                        <IconChevronUp className="size-5" />
                      ) : (
                        <IconChevronDown className="size-5" />
                      )}
                    </span>
                  </button>
                </div>

                <div
                  className={cn(
                    "min-w-0 gap-3",
                    isOpenOnMobile ? "grid" : "hidden",
                    "xl:grid"
                  )}
                >
                  <AnimatePresence initial={false}>
                    {groupedLeads[process].map((lead) => (
                      <motion.div
                        layout
                        key={lead.id}
                        draggable
                        onDragStart={(event) => {
                          const dragEvent =
                            event as unknown as DragEvent<HTMLDivElement>

                          setDraggingId(lead.id)
                          dragEvent.dataTransfer.setData("text/plain", lead.id)
                        }}
                        onDragEnd={() => {
                          setDraggingId("")
                          setActiveProcess("")
                        }}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                        className={cn(
                          "min-w-0 xl:max-w-52 cursor-grab overflow-hidden border bg-card p-3 shadow-sm active:cursor-grabbing",
                          draggingId === lead.id && "opacity-50"
                        )}
                      >
                        <div className="flex min-w-0 items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {lead.name}
                            </p>
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              {lead.company}
                            </p>
                          </div>
                          <LeadActionButtons
                            lead={lead}
                            onView={setSelectedLead}
                          />
                        </div>
                        <p className="mt-3 line-clamp-3 break-words text-xs leading-5 text-muted-foreground">
                          {lead.painPoint}
                        </p>
                        <div className="mt-3 flex min-w-0 items-center justify-between gap-3 border-t pt-3">
                          <span className="shrink-0 text-xs font-semibold">
                            Score {lead.score}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {formatDate(lead.createdAt)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )
          })}
        </div>

        <LeadDetailDialog
          lead={selectedLead}
          open={Boolean(selectedLead)}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedLead(null)
            }
          }}
        />
      </div>
    </TooltipProvider>
  )
}
