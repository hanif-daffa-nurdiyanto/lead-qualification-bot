"use client"

import { FormEvent, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { IconLock, IconLogin2 } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function AuthForm({
  defaultUsername,
  defaultPassword,
}: {
  defaultUsername: string
  defaultPassword: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState(defaultUsername)
  const [password, setPassword] = useState(defaultPassword)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/crm/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })
      const payload = (await response.json()) as
        | { ok: true }
        | { ok: false; error: string }

      if (!response.ok || !payload.ok) {
        throw new Error(payload.ok ? "Unable to login." : payload.error)
      }

      router.push(searchParams.get("next") || "/crm/dashboard")
      router.refresh()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Unable to login."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconLock className="size-4" />
            CRM Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Username
              </label>
              <Input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Password
              </label>
              <Input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
              <IconLogin2 data-icon="inline-end" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
