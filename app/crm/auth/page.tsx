import { Suspense } from "react"
import { redirect } from "next/navigation"

import { AuthForm } from "@/components/crm/AuthForm"
import { hasCrmSession } from "@/lib/crm-auth"

export default async function CrmAuthPage() {
  if (await hasCrmSession()) {
    redirect("/crm/dashboard")
  }

  const shouldPrefill = process.env.CRM_DEV_MODE === "true"

  return (
    <main className="flex flex-col justify-center min-h-svh place-items-center bg-muted/30 px-4 py-10">
      <div className="mb-6 text-center">
        <p className="font-heading text-4xl font-semibold">NEXORA CRM</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to manage qualified leads
        </p>
      </div>
      <Suspense>
        <AuthForm
          defaultUsername={shouldPrefill ? process.env.CRM_USERNAME || "" : ""}
          defaultPassword={shouldPrefill ? process.env.CRM_PASSWORD || "" : ""}
        />
      </Suspense>
    </main>
  )
}
