import type {
  Lead,
  LeadProcess,
  LeadStatus,
} from "@/lib/generated/prisma-client/client"

type AirtableFields = Record<string, string | number | undefined>

type AirtableRecordResponse = {
  id?: string
  fields?: AirtableFields
}

const maxLogBodyLength = 2_000

function truncateForLog(value: string) {
  if (value.length <= maxLogBodyLength) {
    return value
  }

  return `${value.slice(0, maxLogBodyLength)}... [truncated]`
}

function getAirtableConfig() {
  const apiKey = process.env.AIRTABLE_API_KEY
  const baseId = process.env.AIRTABLE_BASE_ID
  const tableName = process.env.AIRTABLE_TABLE_NAME

  if (!apiKey || !baseId || !tableName) {
    throw new Error("Missing Airtable environment variables.")
  }

  return {
    apiKey,
    baseId,
    tableName,
    endpoint: `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
      tableName
    )}`,
  }
}

export function leadToAirtableFields(
  lead: Pick<
    Lead,
    | "name"
    | "email"
    | "company"
    | "industry"
    | "painPoint"
    | "budget"
    | "timeline"
    | "score"
    | "status"
    | "process"
    | "source"
    | "createdAt"
  >
): AirtableFields {
  return {
    Name: lead.name,
    Email: lead.email,
    Company: lead.company,
    Industry: lead.industry,
    "Pain Point": lead.painPoint,
    Budget: lead.budget,
    Timeline: lead.timeline,
    Score: lead.score,
    Status: lead.status,
    Process: lead.process,
    Source: lead.source,
    "Created At": lead.createdAt.toISOString().slice(0, 10),
  }
}

export async function createAirtableLead(
  lead: Pick<
    Lead,
    | "name"
    | "email"
    | "company"
    | "industry"
    | "painPoint"
    | "budget"
    | "timeline"
    | "score"
    | "status"
    | "process"
    | "source"
    | "createdAt"
  >
) {
  const config = getAirtableConfig()
  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: leadToAirtableFields(lead),
    }),
  })

  if (!response.ok) {
    const responseBody = await response.text().catch(() => "")

    console.error("[airtable] Lead insert failed", {
      status: response.status,
      statusText: response.statusText,
      baseId: config.baseId,
      tableName: config.tableName,
      email: lead.email,
      responseBody: truncateForLog(responseBody),
    })

    throw new Error("Airtable insert failed.")
  }

  const payload = (await response.json()) as AirtableRecordResponse

  if (!payload.id) {
    throw new Error("Airtable insert did not return a record ID.")
  }

  return payload.id
}

export async function updateAirtableLeadProcess(
  airtableRecordId: string | null,
  process: LeadProcess
) {
  if (!airtableRecordId) {
    return
  }

  const config = getAirtableConfig()
  const response = await fetch(`${config.endpoint}/${airtableRecordId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        Process: process,
      },
    }),
  })

  if (!response.ok) {
    const responseBody = await response.text().catch(() => "")

    console.error("[airtable] Process update failed", {
      status: response.status,
      statusText: response.statusText,
      airtableRecordId,
      process,
      responseBody: truncateForLog(responseBody),
    })

    throw new Error("Airtable process update failed.")
  }
}

export function normalizeLeadStatus(value: unknown): LeadStatus {
  return value === "Hot" || value === "Warm" || value === "Cold" ? value : "Cold"
}

export function normalizeLeadProcess(value: unknown): LeadProcess {
  if (
    value === "New" ||
    value === "Qualified" ||
    value === "Negotiation" ||
    value === "Won" ||
    value === "Lost"
  ) {
    return value
  }

  return "New"
}
