import { CrmShell } from "@/components/crm/CrmShell"
import { ProcessBoard } from "@/components/crm/ProcessBoard"
import { toCrmLeadPayload } from "@/lib/crm"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function CrmProcessPage() {
  const leads = await prisma.lead.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <CrmShell>
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">
          Process
        </p>
      </div>
      <ProcessBoard leads={leads.map(toCrmLeadPayload)} />
    </CrmShell>
  )
}
