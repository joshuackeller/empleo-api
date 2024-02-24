/*
  Warnings:

  - A unique constraint covering the columns `[organization_id,id]` on the table `application` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('new', 'in_review', 'interview', 'offer_pending', 'offer_accepted', 'offer_rejected', 'rejected');

-- CreateTable
CREATE TABLE "ApplicationNote" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApplicationNote_organizationId_applicationId_idx" ON "ApplicationNote"("organizationId", "applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationNote_organizationId_id_key" ON "ApplicationNote"("organizationId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationNote_organizationId_applicationId_id_key" ON "ApplicationNote"("organizationId", "applicationId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "application_organization_id_id_key" ON "application"("organization_id", "id");

-- AddForeignKey
ALTER TABLE "ApplicationNote" ADD CONSTRAINT "ApplicationNote_organizationId_applicationId_fkey" FOREIGN KEY ("organizationId", "applicationId") REFERENCES "application"("organization_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationNote" ADD CONSTRAINT "ApplicationNote_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
