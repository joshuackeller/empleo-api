/*
  Warnings:

  - A unique constraint covering the columns `[dnsRecordId]` on the table `organization` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "organization" ALTER COLUMN "dnsRecordId" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "organization_dnsRecordId_key" ON "organization"("dnsRecordId");
