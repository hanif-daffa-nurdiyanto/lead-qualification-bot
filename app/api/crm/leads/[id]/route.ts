import { NextRequest, NextResponse } from "next/server"

import {
  deleteAirtableLead,
  normalizeLeadProcess,
  normalizeLeadStatus,
  updateAirtableLead,
} from "@/lib/airtable-leads"
import { toCrmLeadPayload } from "@/lib/crm"
import { prisma } from "@/lib/prisma"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function cleanScore(value: unknown) {
  const score =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : 0

  return Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 }
    )
  }

  if (!isRecord(body)) {
    return NextResponse.json(
      { ok: false, error: "Invalid lead payload." },
      { status: 400 }
    )
  }

  const data = {
    name: cleanString(body.name),
    email: cleanString(body.email),
    company: cleanString(body.company),
    industry: cleanString(body.industry),
    painPoint: cleanString(body.painPoint),
    budget: cleanString(body.budget),
    timeline: cleanString(body.timeline),
    score: cleanScore(body.score),
    status: normalizeLeadStatus(body.status),
    process: normalizeLeadProcess(body.process),
    source: cleanString(body.source) || "CRM",
  }

  const requiredFields = [
    "name",
    "email",
    "company",
    "industry",
    "painPoint",
    "budget",
    "timeline",
  ] as const

  for (const field of requiredFields) {
    if (!data[field]) {
      return NextResponse.json(
        { ok: false, error: `Missing required field: ${field}.` },
        { status: 400 }
      )
    }
  }

  const lead = await prisma.lead.update({
    where: { id },
    data,
  })

  try {
    await updateAirtableLead(lead)
  } catch (error) {
    console.error("[crm] Airtable lead update sync failed", {
      leadId: lead.id,
      airtableRecordId: lead.airtableRecordId,
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }

  return NextResponse.json({
    ok: true,
    lead: toCrmLeadPayload(lead),
  })
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const lead = await prisma.lead.delete({
    where: { id },
  })

  try {
    await deleteAirtableLead(lead.airtableRecordId)
  } catch (error) {
    console.error("[crm] Airtable lead delete sync failed", {
      leadId: lead.id,
      airtableRecordId: lead.airtableRecordId,
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }

  return NextResponse.json({
    ok: true,
    id,
  })
}
