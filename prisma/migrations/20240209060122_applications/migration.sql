/*
  Warnings:

  - A unique constraint covering the columns `[organization_id,id]` on the table `listing` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'prefer_not_to_say', 'other');

-- CreateTable
CREATE TABLE "application" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT,
    "listing_id" TEXT,
    "user_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "gender" "Gender" NOT NULL DEFAULT 'prefer_not_to_say',
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "us_citizen" BOOLEAN NOT NULL DEFAULT false,
    "work_visa" BOOLEAN NOT NULL DEFAULT false,
    "work_visa_type" TEXT,
    "language" TEXT,
    "available_start_date" TIMESTAMP(3),
    "note" TEXT,
    "relocate" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "application_organization_id_listing_id_idx" ON "application"("organization_id", "listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "application_organization_id_listing_id_id_key" ON "application"("organization_id", "listing_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "application_organization_id_listing_id_user_id_key" ON "application"("organization_id", "listing_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "listing_organization_id_id_key" ON "listing"("organization_id", "id");

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_organization_id_listing_id_fkey" FOREIGN KEY ("organization_id", "listing_id") REFERENCES "listing"("organization_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
