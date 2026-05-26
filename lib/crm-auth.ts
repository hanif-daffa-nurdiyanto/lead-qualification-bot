import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

export const crmSessionCookie = "crm_session"

const sessionValue = "authenticated"

function getSecret() {
  const secret = process.env.CRM_SESSION_SECRET

  if (!secret) {
    throw new Error("Missing CRM_SESSION_SECRET.")
  }

  return secret
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex")
}

export function createCrmSessionToken() {
  const payload = `${sessionValue}.${Date.now()}`

  return `${payload}.${sign(payload)}`
}

export function verifyCrmSessionToken(token: string | undefined) {
  if (!process.env.CRM_SESSION_SECRET) {
    return false
  }

  if (!token) {
    return false
  }

  const parts = token.split(".")

  if (parts.length !== 3 || parts[0] !== sessionValue) {
    return false
  }

  const payload = `${parts[0]}.${parts[1]}`
  const expected = sign(payload)
  const received = parts[2]

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(received))
  } catch {
    return false
  }
}

export async function hasCrmSession() {
  const cookieStore = await cookies()

  return verifyCrmSessionToken(cookieStore.get(crmSessionCookie)?.value)
}

export function validateCrmCredentials(username: string, password: string) {
  return (
    username === process.env.CRM_USERNAME &&
    password === process.env.CRM_PASSWORD
  )
}
