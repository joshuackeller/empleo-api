/*
  Warnings:

  - A unique constraint covering the columns `[logo_id]` on the table `organization` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "logo_id" TEXT;

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Image_organization_id_idx" ON "Image"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "Image_organization_id_id_key" ON "Image"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_logo_id_key" ON "organization"("logo_id");

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_logo_id_fkey" FOREIGN KEY ("logo_id") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
