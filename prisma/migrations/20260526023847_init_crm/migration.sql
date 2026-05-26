-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('Cold', 'Warm', 'Hot');

-- CreateEnum
CREATE TYPE "LeadProcess" AS ENUM ('New', 'Qualified', 'Negotiation', 'Won', 'Lost');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "airtableRecordId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "painPoint" TEXT NOT NULL,
    "budget" TEXT NOT NULL,
    "timeline" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "status" "LeadStatus" NOT NULL,
    "process" "LeadProcess" NOT NULL DEFAULT 'New',
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_airtableRecordId_key" ON "Lead"("airtableRecordId");

-- CreateIndex
CREATE INDEX "Lead_email_idx" ON "Lead"("email");

-- CreateIndex
CREATE INDEX "Lead_process_idx" ON "Lead"("process");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");
