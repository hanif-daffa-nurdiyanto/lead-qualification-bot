import type {
  Lead,
  LeadProcess,
  LeadStatus,
} from "@/lib/generated/prisma-client/client"

export const leadProcesses = [
  "New",
  "Qualified",
  "Negotiation",
  "Won",
  "Lost",
] as const satisfies LeadProcess[]

export const leadStatuses = ["Cold", "Warm", "Hot"] as const satisfies LeadStatus[]

export type CrmLead = Omit<Lead, "createdAt" | "updatedAt"> & {
  createdAt: string
  updatedAt: string
}
export type CrmLeadProcess = (typeof leadProcesses)[number]

export function isLeadProcess(value: unknown): value is CrmLeadProcess {
  return typeof value === "string" && leadProcesses.includes(value as CrmLeadProcess)
}

export function processLabel(process: LeadProcess) {
  return process
}

export function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value))
}

export function toCrmLeadPayload(lead: Lead) {
  return {
    ...lead,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  }
}
