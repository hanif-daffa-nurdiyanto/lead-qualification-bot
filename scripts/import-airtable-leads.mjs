import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../lib/generated/prisma-client/client.ts"
import {
  normalizeLeadProcess,
  normalizeLeadStatus,
} from "../lib/airtable-leads.ts"

const requiredEnv = [
  "DATABASE_URI",
  "AIRTABLE_API_KEY",
  "AIRTABLE_BASE_ID",
  "AIRTABLE_TABLE_NAME",
]

const missingEnv = requiredEnv.filter((key) => !process.env[key])

if (missingEnv.length > 0) {
  console.error(`Missing environment variables: ${missingEnv.join(", ")}`)
  process.exit(1)
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URI,
})
const prisma = new PrismaClient({ adapter })
const baseId = process.env.AIRTABLE_BASE_ID
const tableName = process.env.AIRTABLE_TABLE_NAME
const endpoint = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
  tableName
)}`

function field(record, name) {
  const value = record.fields?.[name]

  return typeof value === "string" ? value.trim() : ""
}

function numberField(record, name) {
  const value = record.fields?.[name]

  return typeof value === "number" && Number.isFinite(value)
    ? Math.round(value)
    : 0
}

async function listAirtableRecords() {
  const records = []
  let offset

  do {
    const url = new URL(endpoint)

    if (offset) {
      url.searchParams.set("offset", offset)
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
    })

    if (!response.ok) {
      const body = await response.text().catch(() => "")
      throw new Error(
        `Airtable fetch failed: ${response.status} ${response.statusText}\n${body}`
      )
    }

    const payload = await response.json()

    if (Array.isArray(payload.records)) {
      records.push(...payload.records)
    }

    offset = typeof payload.offset === "string" ? payload.offset : undefined
  } while (offset)

  return records
}

async function importRecords() {
  const records = await listAirtableRecords()
  let imported = 0
  let skipped = 0

  for (const record of records) {
    const email = field(record, "Email")

    if (!record.id || !email) {
      skipped += 1
      continue
    }

    const existingByAirtableId = await prisma.lead.findUnique({
      where: {
        airtableRecordId: record.id,
      },
    })
    const existingByEmail = existingByAirtableId
      ? null
      : await prisma.lead.findFirst({
          where: {
            email,
          },
        })

    const data = {
      airtableRecordId: record.id,
      name: field(record, "Name") || "Unknown",
      email,
      company: field(record, "Company") || "Unknown",
      industry: field(record, "Industry") || "Unknown",
      painPoint: field(record, "Pain Point") || "Imported from Airtable",
      budget: field(record, "Budget") || "Not sure yet",
      timeline: field(record, "Timeline") || "Not sure yet",
      score: numberField(record, "Score"),
      status: normalizeLeadStatus(field(record, "Status")),
      process: normalizeLeadProcess(field(record, "Process")),
      source: field(record, "Source") || "Airtable Import",
    }

    if (existingByAirtableId || existingByEmail) {
      await prisma.lead.update({
        where: {
          id: (existingByAirtableId || existingByEmail).id,
        },
        data,
      })
    } else {
      await prisma.lead.create({
        data,
      })
    }

    imported += 1
  }

  console.log(`Imported ${imported} Airtable leads. Skipped ${skipped}.`)
}

importRecords()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
