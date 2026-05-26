import { CrmShell } from "@/components/crm/CrmShell"
import { LeadTable } from "@/components/crm/LeadTable"
import { toCrmLeadPayload } from "@/lib/crm"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function CrmTablePage() {
  const leads = await prisma.lead.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <CrmShell>
      <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-6">
        Lead Table
      </p>
      <LeadTable leads={leads.map(toCrmLeadPayload)} />
    </CrmShell>
  )
}
