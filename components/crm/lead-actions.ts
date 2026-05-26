import type { CrmLead } from "@/lib/crm"

export function createContactHref(lead: CrmLead) {
  const subject = `Follow up project discussion - ${lead.company}`
  const body = [
    `Hi ${lead.name},`,
    "",
    "Thank you for sharing your project context with us.",
    "",
    `I reviewed your brief about: ${lead.painPoint}`,
    "",
    "Could we schedule a short call to discuss the next step?",
    "",
    "Best regards,",
  ].join("\n")

  return `mailto:${lead.email}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`
}
