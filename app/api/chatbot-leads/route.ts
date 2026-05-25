import { NextRequest, NextResponse } from "next/server"

type ChatMessage = {
  from: "bot" | "lead"
  text: string
}

type LeadDraft = {
  name: string
  email: string
  company: string
  industry: string
  painPoint: string
  budget: string
  timeline: string
}

type BotResponse = {
  reply: string
  lead: LeadDraft
  isComplete: boolean
  fieldProgress: Record<keyof LeadDraft, boolean>
  missingFields: Array<keyof LeadDraft>
}

const initialLead: LeadDraft = {
  name: "",
  email: "",
  company: "",
  industry: "",
  painPoint: "",
  budget: "",
  timeline: "",
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function cleanLead(value: unknown): LeadDraft {
  if (!isRecord(value)) {
    return initialLead
  }

  return {
    name: cleanString(value.name),
    email: cleanString(value.email),
    company: cleanString(value.company),
    industry: cleanString(value.industry),
    painPoint: cleanString(value.painPoint),
    budget: cleanString(value.budget),
    timeline: cleanString(value.timeline),
  }
}

function isCompleteLead(lead: LeadDraft) {
  return (
    Boolean(lead.name) &&
    emailPattern.test(lead.email) &&
    Boolean(lead.company) &&
    Boolean(lead.industry) &&
    Boolean(lead.painPoint) &&
    Boolean(lead.budget) &&
    Boolean(lead.timeline)
  )
}

function getFieldProgress(lead: LeadDraft) {
  return {
    name: Boolean(lead.name),
    email: emailPattern.test(lead.email),
    company: Boolean(lead.company),
    industry: Boolean(lead.industry),
    painPoint: Boolean(lead.painPoint),
    budget: Boolean(lead.budget),
    timeline: Boolean(lead.timeline),
  }
}

function getMissingFields(lead: LeadDraft) {
  const progress = getFieldProgress(lead)

  return (Object.keys(progress) as Array<keyof LeadDraft>).filter(
    (field) => !progress[field]
  )
}

function extractJsonObject(content: string) {
  const start = content.indexOf("{")
  const end = content.lastIndexOf("}")

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Groq did not return JSON.")
  }

  return JSON.parse(content.slice(start, end + 1)) as unknown
}

function fallbackReply(lead: LeadDraft): BotResponse {
  const missingQuestions: Array<[keyof LeadDraft, string]> = [
    [
      "painPoint",
      "Bisa ceritakan sedikit tujuan utama atau tantangan yang ingin diselesaikan dari project ini?",
    ],
    [
      "company",
      "Project ini untuk usaha atau perusahaan apa?",
    ],
    [
      "industry",
      "Bidang usahanya bergerak di area apa?",
    ],
    [
      "budget",
      "Untuk scope awalnya, kira-kira ada gambaran budget yang ingin disiapkan?",
    ],
    [
      "timeline",
      "Kapan Anda ingin mulai mengerjakan project ini?",
    ],
    [
      "name",
      "Tentu, kami bisa bantu arahkan. Agar tim kami bisa follow up dengan tepat, boleh tahu nama dan email Anda?",
    ],
    [
      "email",
      "Boleh kami tahu email yang bisa dihubungi untuk follow up?",
    ],
  ]

  const nextQuestion = missingQuestions.find(([field]) => !lead[field])?.[1]

  return {
    reply:
      nextQuestion ||
      "Terima kasih, konteksnya sudah cukup. Tim kami akan menindaklanjuti dari sini.",
    lead,
    isComplete: isCompleteLead(lead),
    fieldProgress: getFieldProgress(lead),
    missingFields: getMissingFields(lead),
  }
}

function normalizeBotResponse(value: unknown, fallbackLead: LeadDraft) {
  if (!isRecord(value)) {
    return fallbackReply(fallbackLead)
  }

  const lead = cleanLead(value.lead)
  const reply =
    cleanString(value.reply) ||
    fallbackReply(lead).reply ||
    "Thanks. What else should we know?"

  const isComplete = isCompleteLead(lead)

  return {
    reply,
    lead,
    isComplete,
    fieldProgress: getFieldProgress(lead),
    missingFields: getMissingFields(lead),
  }
}

export async function POST(request: NextRequest) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return jsonError("Invalid JSON body.")
  }

  if (!isRecord(body) || !Array.isArray(body.messages)) {
    return jsonError("Invalid chat payload.")
  }

  const messages = body.messages
    .filter((message): message is ChatMessage => {
      return (
        isRecord(message) &&
        (message.from === "bot" || message.from === "lead") &&
        typeof message.text === "string"
      )
    })
    .slice(-16)

  if (messages.length === 0) {
    return jsonError("No chat messages provided.")
  }

  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    return jsonError("Missing GROQ_API_KEY.", 500)
  }

  const currentLead = cleanLead(body.lead)
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile"

  try {
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
          temperature: 0.25,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: [
                "You are Nexa, Nexora Assistant, a natural lead-intake chat assistant for an IT consulting company.",
                "Match the user's language. If the user writes Indonesian, reply in Indonesian. If the user writes English, reply in English. If user use any other language, reply in that language.",
                "Do not sound like a form. Do not ask blunt questions like 'What is your name?' or 'What company are you from?' unless the conversation context makes it polite and natural.",
                "Your goal is to understand the project and quietly update these lead fields: name, email, company, industry, painPoint, budget, timeline.",
                "Analyze the latest user answer against the currently empty or weak fields. Fill fields when the answer implies them, even if the user does not use exact field names.",
                "If the user says they want a landing page, website, system, dashboard, app, automation, or audit, treat that as part of painPoint. If painPoint is too vague, ask a contextual follow-up about goals, audience, business problem, or expected outcome.",
                "If the user already mentions a company or business in the project description, fill company and do not ask again.",
                "If the user already mentions an industry or business type, fill industry and do not ask again.",
                "Normalize budget silently. Examples: '$3', '3 dollar', 'murah dulu', 'budget kecil' => Under $2k. 'sekitar 30 juta', '2k', '3k' => $2k - $5k. '10k', '100 juta' => $5k - $15k. 'enterprise', 'besar', 'lebih dari 15k' => $15k+. Do not criticize low budgets and do not ask the user to choose from internal budget labels.",
                "Normalize timeline silently. Examples: 'secepatnya', 'urgent', 'minggu ini' => Immediately. 'bulan ini' => This month. 'quarter ini', '3 bulan ke depan' => This quarter. If unclear => Not sure yet only when the user implies uncertainty.",
                "When contact details are the main missing fields, ask politely in a helpful way, for example: 'Of course, we can assist you. So our team can follow up with you, could you please provide your name and email address?'",
                "Do not say you recorded, saved, scored, qualified, or sent an email. Do not expose Airtable, JSON, internal fields, field completion, budget labels, timeline labels, or validation.",
                "Ask at most one natural follow-up question per reply. The follow-up must relate to the user's previous answer while also filling a useful missing field.",
                "When all fields are complete, reply naturally that the context is clear and the team can follow up. Keep the conversation open; do not mention score or status.",
                "Return only valid JSON with keys: reply, lead, isComplete.",
                "The lead object must contain exactly: name, email, company, industry, painPoint, budget, timeline.",
                "Use normalized values only inside lead.budget and lead.timeline, not in the visible reply.",
                "Set isComplete true only when all fields are present and email is valid.",
                "Place questions about names and contact information at the end or as a lower priority to make users feel secure, unless there is a specific context that justifies including them earlier.",
              ].join(" "),
            },
            {
              role: "user",
              content: JSON.stringify({
                task: [
                  "Given currentLead and conversation, update any fields that can be inferred.",
                  "Then write the next natural assistant reply.",
                  "Prefer contextual discovery over direct form questions.",
                  "If complete, produce a friendly non-final-sounding reply.",
                ],
                currentLead,
                conversation: messages,
              }),
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      throw new Error("Groq chat failed.")
    }

    const payload = (await response.json()) as unknown
    const choices = isRecord(payload) && Array.isArray(payload.choices)
      ? payload.choices
      : []
    const firstChoice = isRecord(choices[0]) ? choices[0] : null
    const message =
      firstChoice && isRecord(firstChoice.message)
        ? firstChoice.message
        : null
    const content = cleanString(message?.content)

    if (!content) {
      return NextResponse.json({ ok: true, ...fallbackReply(currentLead) })
    }

    const botResponse = normalizeBotResponse(
      extractJsonObject(content),
      currentLead
    )

    console.log("[chatbot-leads] Field progress", {
      fieldProgress: botResponse.fieldProgress,
      missingFields: botResponse.missingFields,
      isComplete: botResponse.isComplete,
    })

    return NextResponse.json({ ok: true, ...botResponse })
  } catch (error) {
    console.error("[chatbot-leads] Chat failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    })

    const fallback = fallbackReply(currentLead)

    console.log("[chatbot-leads] Fallback field progress", {
      fieldProgress: fallback.fieldProgress,
      missingFields: fallback.missingFields,
      isComplete: fallback.isComplete,
    })

    return NextResponse.json({ ok: true, ...fallback })
  }
}
