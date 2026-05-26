import { defineConfig, env } from "prisma/config"
import { existsSync, readFileSync } from "node:fs"

if (!process.env.DATABASE_URI && existsSync(".env")) {
  const envFile = readFileSync(".env", "utf8")
  const match = envFile.match(/^DATABASE_URI=(.*)$/m)

  if (match?.[1]) {
    process.env.DATABASE_URI = match[1].replace(/^["']|["']$/g, "")
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URI"),
  },
})
