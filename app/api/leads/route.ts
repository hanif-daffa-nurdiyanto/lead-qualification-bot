import { NextRequest, NextResponse } from "next/server"

import { createAirtableLead } from "@/lib/airtable-leads"
import { prisma } from "@/lib/prisma"

type LeadStatus = "Cold" | "Warm" | "Hot"

type LeadPayload = {
  name: string
  email: string
  company: string
  industry: string
  painPoint: string
  budget: string
  timeline: string
  source: "Landing Page Chatbot" | "Start Project Page"
}

type Qualification = {
  score: number
  status: LeadStatus
  reason?: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const validStatuses = new Set<LeadStatus>(["Cold", "Warm", "Hot"])

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function validateLeadPayload(input: unknown): LeadPayload | string {
  if (!isRecord(input)) {
    return "Invalid request body."
  }

  const lead = {
    name: cleanString(input.name),
    email: cleanString(input.email),
    company: cleanString(input.company),
    industry: cleanString(input.industry),
    painPoint: cleanString(input.painPoint),
    budget: cleanString(input.budget),
    timeline: cleanString(input.timeline),
    source: cleanString(input.source) as LeadPayload["source"],
  }

  const requiredFields: Array<keyof Omit<LeadPayload, "source">> = [
    "name",
    "email",
    "company",
    "industry",
    "painPoint",
    "budget",
    "timeline",
  ]

  for (const field of requiredFields) {
    if (!lead[field]) {
      return `Missing required field: ${field}.`
    }
  }

  if (!emailPattern.test(lead.email)) {
    return "Invalid email address."
  }

  return lead
}

function statusFromScore(score: number): LeadStatus {
  if (score >= 75) {
    return "Hot"
  }

  if (score >= 45) {
    return "Warm"
  }

  return "Cold"
}

function clampScore(value: unknown) {
  const score = typeof value === "number" && Number.isFinite(value) ? value : 0
  return Math.max(0, Math.min(100, Math.round(score)))
}

function fallbackQualification(lead: LeadPayload): Qualification {
  let score = 0

  if (lead.painPoint.length >= 20) {
    score += 20
  } else if (lead.painPoint) {
    score += 10
  }

  if (lead.company) {
    score += 10
  }

  if (emailPattern.test(lead.email)) {
    score += 10
  }

  const timelineScores: Record<string, number> = {
    Immediately: 30,
    "This month": 25,
    "This quarter": 15,
    "Not sure yet": 5,
  }

  const budgetScores: Record<string, number> = {
    "Under $2k": 5,
    "$2k - $5k": 15,
    "$5k - $15k": 25,
    "$15k+": 35,
    "Not sure yet": 10,
  }

  score += timelineScores[lead.timeline] ?? 10
  score += budgetScores[lead.budget] ?? 10

  const normalizedScore = clampScore(score)

  return {
    score: normalizedScore,
    status: statusFromScore(normalizedScore),
    reason: "Fallback rule-based qualification was used.",
  }
}

function extractJsonObject(content: string) {
  const start = content.indexOf("{")
  const end = content.lastIndexOf("}")

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Groq did not return JSON.")
  }

  return JSON.parse(content.slice(start, end + 1)) as unknown
}

function normalizeQualification(value: unknown, lead: LeadPayload) {
  if (!isRecord(value)) {
    return fallbackQualification(lead)
  }

  const score = clampScore(value.score)
  const status = cleanString(value.status)

  return {
    score,
    status: validStatuses.has(status as LeadStatus)
      ? (status as LeadStatus)
      : statusFromScore(score),
    reason: cleanString(value.reason) || undefined,
  }
}

async function qualifyWithGroq(lead: LeadPayload): Promise<Qualification> {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY.")
  }

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile"

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              'You qualify leads for an IT consulting company. Return only valid JSON with keys "score", "status", and "reason". Status must be one of Cold, Warm, Hot.',
          },
          {
            role: "user",
            content: [
              "Evaluate this lead using a 0-100 score.",
              "Consider clarity of pain point, urgency, budget fit, company relevance, and completeness.",
              "Status mapping: 0-44 Cold, 45-74 Warm, 75-100 Hot.",
              "",
              `Name: ${lead.name}`,
              `Email: ${lead.email}`,
              `Company: ${lead.company}`,
              `Industry: ${lead.industry}`,
              `Pain Point: ${lead.painPoint}`,
              `Budget: ${lead.budget}`,
              `Timeline: ${lead.timeline}`,
            ].join("\n"),
          },
        ],
      }),
    }
  )

  if (!response.ok) {
    throw new Error("Groq qualification failed.")
  }

  const payload = (await response.json()) as unknown

  if (!isRecord(payload)) {
    return fallbackQualification(lead)
  }

  const choices = Array.isArray(payload.choices) ? payload.choices : []
  const firstChoice = isRecord(choices[0]) ? choices[0] : null
  const message =
    firstChoice && isRecord(firstChoice.message) ? firstChoice.message : null
  const content = cleanString(message?.content)

  if (!content) {
    return fallbackQualification(lead)
  }

  try {
    return normalizeQualification(extractJsonObject(content), lead)
  } catch {
    return fallbackQualification(lead)
  }
}

export async function POST(request: NextRequest) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return jsonError("Invalid JSON body.")
  }

  const validatedLead = validateLeadPayload(body)

  if (typeof validatedLead === "string") {
    return jsonError(validatedLead)
  }

  try {
    let qualification: Qualification

    try {
      qualification = await qualifyWithGroq(validatedLead)
    } catch (qualificationError) {
      qualification = fallbackQualification(validatedLead)

      console.warn("[leads] Qualification failed; using fallback", {
        message:
          qualificationError instanceof Error
            ? qualificationError.message
            : "Unknown qualification error",
        email: validatedLead.email,
        company: validatedLead.company,
        fallbackScore: qualification.score,
        fallbackStatus: qualification.status,
      })
    }

    const dbLead = await prisma.lead.create({
      data: {
        name: validatedLead.name,
        email: validatedLead.email,
        company: validatedLead.company,
        industry: validatedLead.industry,
        painPoint: validatedLead.painPoint,
        budget: validatedLead.budget,
        timeline: validatedLead.timeline,
        score: qualification.score,
        status: qualification.status,
        process: "New",
        source: validatedLead.source,
      },
    })

    try {
      const airtableRecordId = await createAirtableLead(dbLead)

      await prisma.lead.update({
        where: {
          id: dbLead.id,
        },
        data: {
          airtableRecordId,
        },
      })

      console.log("[leads] Lead saved to database and Airtable", {
        leadId: dbLead.id,
        airtableRecordId,
        email: dbLead.email,
        company: dbLead.company,
        score: dbLead.score,
        status: dbLead.status,
        process: dbLead.process,
      })
    } catch (airtableError) {
      console.error("[leads] Lead saved to database but Airtable sync failed", {
        leadId: dbLead.id,
        message:
          airtableError instanceof Error
            ? airtableError.message
            : "Unknown Airtable error",
      })
    }

    return NextResponse.json({
      ok: true,
      lead: {
        id: dbLead.id,
        score: qualification.score,
        status: qualification.status,
        process: dbLead.process,
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to submit lead."

    console.error("[leads] Lead submission failed", {
      message,
      lead: {
        email: validatedLead.email,
        company: validatedLead.company,
        industry: validatedLead.industry,
        budget: validatedLead.budget,
        timeline: validatedLead.timeline,
      },
    })

    return jsonError(message, 500)
  }
}
