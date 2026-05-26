"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  IconDashboard,
  IconLogout,
  IconTable,
  IconTimeline,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  {
    href: "/crm/dashboard",
    label: "Dashboard",
    icon: IconDashboard,
  },
  {
    href: "/crm/table",
    label: "Table",
    icon: IconTable,
  },
  {
    href: "/crm/process",
    label: "Process",
    icon: IconTimeline,
  },
]

export function CrmShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const logout = async () => {
    await fetch("/api/crm/auth/logout", {
      method: "POST",
    })

    router.push("/crm/auth")
    router.refresh()
  }

  return (
    <main className="min-h-svh bg-muted/30 text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-background lg:block">
        <div className="border-b p-5">
          <p className="font-heading text-2xl font-semibold">NEXORA CRM</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Lead pipeline workspace
          </p>
        </div>
        <nav className="grid gap-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-10 items-center gap-3 border px-3 text-sm font-semibold transition",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-transparent hover:border-border hover:bg-muted"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <div>
              <p className="font-heading text-xl font-semibold lg:hidden">CRM</p>
              <p className="hidden text-sm text-muted-foreground lg:block">
                Nexora lead management
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex border lg:hidden">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-label={item.label}
                      className={cn(
                        "flex size-10 items-center justify-center border-r last:border-r-0",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-background text-muted-foreground"
                      )}
                    >
                      <Icon className="size-4" />
                    </Link>
                  )
                })}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={logout}
              >
                <IconLogout data-icon="inline-start" />
                Logout
              </Button>
            </div>
          </div>
        </header>
        <div className="px-4 py-6 sm:px-6 overflow-auto">{children}</div>
      </div>
    </main>
  )
}
