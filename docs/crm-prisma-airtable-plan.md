# Implement CRM + Prisma + Airtable Sync

## Summary

Implement CRM using Bun, PostgreSQL via Prisma as the source of truth, and Airtable as a synced external mirror.

## Implementation Changes

- Add Prisma and `@prisma/client`.
- Add `Lead` model with lead intake fields, score/status, CRM process, Airtable record ID, source, and timestamps.
- Store new leads in PostgreSQL first, then create/update Airtable records.
- Add Airtable import script to bring existing Airtable rows into PostgreSQL.
- Add env-driven CRM auth with an HTTP-only signed cookie session.
- Add protected CRM dashboard, table, and process board routes.

## CRM Routes

- `/crm/auth`: login page with optional dev prefill from env.
- `/crm/dashboard`: lead statistics and recent leads.
- `/crm/table`: Airtable-style lead table with editable process field.
- `/crm/process`: drag-and-drop process board with `New`, `Qualified`, `Negotiation`, `Won`, and `Lost`.

## Test Plan

- Submit leads from the chatbot and start-project form.
- Import Airtable leads and confirm they appear in CRM.
- Verify CRM login/logout and protected route redirects.
- Update process from table and board, then confirm PostgreSQL and Airtable are synced.
- Run `bun run typecheck`, `bun run lint`, and `bun run build`.

## Assumptions

- `DATABASE_URI` points to a PostgreSQL database.
- Airtable has a `Process` field matching CRM process labels.
- Existing local changes are preserved except the temporary early `return` in start-project submission.
